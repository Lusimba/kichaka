from calendar import monthrange
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction, IntegrityError
from django.db.models import Sum, Count, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payroll, AnnualBonus
from .serializers import PayrollSerializer
from production.models import CompletedTask
from authentication.models import Artist
from .permissions import IsManagerOrProprietor

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated, IsManagerOrProprietor]

    @action(detail=False, methods=['post'])
    def generate_monthly_payroll(self, request):
        try:
            month_param = request.data.get('month')
            payroll_date = timezone.datetime.strptime(month_param, '%Y-%m').date() if month_param else timezone.now().date().replace(day=1)
            
            days_in_month = monthrange(payroll_date.year, payroll_date.month)[1]
            x = max(1, min(int(request.data.get('x', 15)), days_in_month - 10))
            y = min(max(x + 10, int(request.data.get('y', days_in_month))), days_in_month)

            with transaction.atomic():
                payroll_data = []
                for start_day, end_day in [(1, x - 1), (x, y - 1)]:
                    payroll_data.extend(self._generate_payroll(payroll_date, start_day, end_day))

            return Response(payroll_data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def _generate_payroll(self, payroll_date, start_day, end_day):
        start_date = payroll_date.replace(day=start_day)
        end_date = payroll_date.replace(day=end_day)

        payroll_data = []
        artists = Artist.objects.filter(completed_tasks__date__range=[start_date, end_date]).distinct()

        for artist in artists:
            completed_tasks = CompletedTask.objects.filter(
                artist=artist,
                date__range=[start_date, end_date]
            ).annotate(
                stage_cost=Case(
                    When(current_stage='1', then=F('item__splitting_drawing_cost')),
                    When(current_stage='2', then=F('item__carving_cutting_cost')),
                    When(current_stage='3', then=F('item__sanding_cost')),
                    When(current_stage='4', then=F('item__painting_cost')),
                    When(current_stage='5', then=F('item__finishing_cost')),
                    When(current_stage='6', then=F('item__packaging_cost')),
                    default=F('item__splitting_drawing_cost'),
                    output_field=models.DecimalField(max_digits=10, decimal_places=2)
                )
            ).aggregate(
                total_earnings=Sum(F('stage_cost') * F('accepted'), output_field=models.DecimalField(max_digits=10, decimal_places=2)),
                total_items=Sum('accepted')
            )

            total_earnings = Decimal(completed_tasks['total_earnings'] or 0).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
            total_items = completed_tasks['total_items'] or 0

            payroll, created = Payroll.objects.get_or_create(
                artist=artist,
                month=start_date,
                end_date=end_date,
                defaults={
                    'item_qty': total_items,
                    'total_earnings': total_earnings
                }
            )

            if not created:
                payroll.item_qty = total_items
                payroll.total_earnings = total_earnings
                payroll.save()

            payroll_data.append(PayrollSerializer(payroll).data)

        return payroll_data

    @action(detail=False, methods=['get'])
    def monthly_completion_stats(self, request):
        monthly_stats = CompletedTask.objects.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total_completed=Sum('accepted'),
            total_tasks=Count('id'),
            total_earnings=Sum(F('payroll__total_earnings'))
        ).order_by('month')

        return Response(monthly_stats)

    @action(detail=False, methods=['get'])
    def current_month_payroll(self, request):
        current_month = timezone.now().date().replace(day=1)
        payrolls = Payroll.objects.filter(month=current_month).filter(Q(item_qty__gt=0) | Q(total_earnings__gt=0))
        serializer = self.get_serializer(payrolls, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def annual_artist_stats(self, request):
        try:
            year = int(request.query_params.get('year', timezone.now().year))
            bonus_percentage = Decimal(request.query_params.get('bonus_percentage', settings.DEFAULT_BONUS_PERCENTAGE))

            if not 0 <= bonus_percentage <= 100:
                return Response({'error': 'Bonus percentage must be between 0 and 100'}, status=status.HTTP_400_BAD_REQUEST)

            start_date = datetime(year, 1, 1).date()
            end_date = datetime(year, 12, 31).date()
            
            annual_stats = Payroll.objects.filter(month__range=[start_date, end_date]).values(
                'artist', 'artist__name'
            ).annotate(
                total_earnings=Sum('total_earnings'),
                total_items=Sum('item_qty')
            ).order_by('-total_earnings')

            result = []
            with transaction.atomic():
                for stat in annual_stats:
                    artist = Artist.objects.get(id=stat['artist'])
                    bonus_amount = (stat['total_earnings'] * bonus_percentage / 100).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
                    
                    annual_bonus, _ = AnnualBonus.objects.update_or_create(
                        artist=artist,
                        year=year,
                        defaults={
                            'annual_earnings': stat['total_earnings'],
                            'bonus_percentage': bonus_percentage,
                            'bonus_amount': max(bonus_amount, 0),
                        }
                    )

                    result.append({
                        'artist_id': stat['artist'],
                        'artist_name': stat['artist__name'],
                        'total_earnings': float(stat['total_earnings']),
                        'total_items': stat['total_items'],
                        'bonus_amount': float(bonus_amount),
                        'bonus_status': annual_bonus.status
                    })

            return Response(result)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def pay_bonuses(self, request):
        try:
            year = int(request.data.get('year'))
            artist_ids = request.data.get('artist_ids', [])

            with transaction.atomic():
                bonuses_query = AnnualBonus.objects.filter(year=year, status='PENDING')
                if artist_ids:
                    bonuses_query = bonuses_query.filter(artist_id__in=artist_ids)
                
                updated_count = bonuses_query.update(status='PAID')

            message = 'No pending bonuses found.' if updated_count == 0 else f'Successfully paid {updated_count} bonuses.'
            return Response({'message': message, 'updated_count': updated_count}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({'error': 'Invalid year format.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)