# payroll/views.py
import logging
from calendar import monthrange
from datetime import datetime
from decimal import Decimal

from django.db import transaction, IntegrityError
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Payroll, AnnualBonus
from .serializers import PayrollSerializer
from production.models import CompletedTask
from authentication.models import Artist
from .permissions import IsManagerOrProprietor

logger = logging.getLogger(__name__)

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['generate_monthly_payroll', 'monthly_completion_stats', 'annual_artist_stats', 'pay_bonuses']:
            return [IsAuthenticated(), IsManagerOrProprietor()]
        return super().get_permissions()

    # @action(detail=False, methods=['post'])
    # def generate_monthly_payroll(self, request):
    #     current_date = timezone.now().date()
    #     current_month_start = current_date.replace(day=1)

    #     # Check the latest payroll record
    #     latest_payroll = Payroll.objects.filter(date_created__gte=current_month_start).order_by('-date_created').first()
    #     print(latest_payroll)
    #     day = 14
    #     # day = current_date.day

    #     if latest_payroll:
    #         # If there's a payroll record this month
    #         days_since_last_payroll = (current_date - latest_payroll.date_created.date()).days
    #         if days_since_last_payroll < 10:
    #             return Response({'error': 'Cannot generate payroll within 10 days of the last payroll.'}, status=status.HTTP_400_BAD_REQUEST)
    #         if day < 24:
    #             return Response({'error': 'Cannot generate second payroll of the month before the 24th.'}, status=status.HTTP_400_BAD_REQUEST)
            
    #         x = min(max(latest_payroll.date_created.day + 10, 15), 28)  # Ensure x is between 16 and 28
    #         y = min(x + 10, day)
    #     else:
    #         # If no payroll this month
    #         if day < 10 or day > 18:
    #             return Response({'error': 'Can only generate first payroll of the month between the 10th and 18th.'}, status=status.HTTP_400_BAD_REQUEST)
            
    #         x = day
    #         y = min(x + 10, day)

    #     # Generate the payrolls
    #     payroll_data = []
    #     payroll_data.extend(self._generate_payroll(current_month_start, 1, x - 1))
    #     if y > x:
    #         payroll_data.extend(self._generate_payroll(current_month_start, x, y))

    #     return Response(payroll_data, status=status.HTTP_201_CREATED)

    # def _generate_payroll(self, payroll_date, start_day, end_day):
    #     start_date = payroll_date.replace(day=start_day)
    #     end_date = payroll_date.replace(day=end_day)

    #     # Check if payroll has already been generated for this month
    #     if Payroll.objects.filter(month=payroll_date).exists():
    #         logger.info(f'Payroll already exists for {payroll_date.strftime("%B %Y")}')
    #         return []

    #     # Get all artists who worked on tasks in this period
    #     artists = Artist.objects.filter(
    #         completed_tasks__date__range=[start_date, end_date]
    #     ).distinct()

    #     payroll_data = []

    #     for artist in artists:
    #         completed_tasks = CompletedTask.objects.filter(
    #             artist=artist,
    #             date__range=[start_date, end_date]
    #         )
            
    #         total_earnings = Decimal('0.00')
    #         total_items = 0

    #         for task in completed_tasks:
    #             stage_cost_map = {
    #                 '1': 'splitting_drawing_cost',
    #                 '2': 'carving_cutting_cost',
    #                 '3': 'sanding_cost',
    #                 '4': 'painting_cost',
    #                 '5': 'finishing_cost',
    #                 '6': 'packaging_cost',
    #             }

    #             stage_cost_field = stage_cost_map.get(task.current_stage, 'splitting_drawing_cost')
    #             stage_cost = getattr(task.item, stage_cost_field, Decimal('0.00'))

    #             task_earnings = stage_cost * task.accepted
    #             total_earnings += task_earnings
    #             total_items += task.accepted

    #         try:
    #             payroll = Payroll.objects.create(
    #                 artist=artist,
    #                 item_qty=total_items,
    #                 total_earnings=total_earnings,
    #                 month=payroll_date
    #             )
    #             payroll_data.append(PayrollSerializer(payroll).data)
    #         except IntegrityError:
    #             logger.error(f'Payroll entry already exists for {artist.name} in {payroll_date.strftime("%B %Y")}')

    #     return payroll_data

    @action(detail=False, methods=['post'])
    def generate_monthly_payroll(self, request):
        # Get the month from request parameters, default to current month if not provided
        month_param = request.data.get('month')
        if month_param:
            try:
                payroll_date = datetime.strptime(month_param, '%Y-%m').date()
            except ValueError:
                return Response({'error': 'Invalid month format. Use YYYY-MM.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            payroll_date = timezone.now().date().replace(day=1)
        
        # Check if payroll has already been generated for this month
        if Payroll.objects.filter(month=payroll_date).exists():
            return Response({'error': f'Payroll already generated for {payroll_date.strftime("%B %Y")}'}, status=status.HTTP_400_BAD_REQUEST)

        # Get all artists who worked on tasks this month
        artists = Artist.objects.filter(completed_tasks__date__year=payroll_date.year,
                                        completed_tasks__date__month=payroll_date.month).distinct()

        payroll_data = []

        for artist in artists:
            completed_tasks = CompletedTask.objects.filter(artist=artist,
                                                           date__year=payroll_date.year,
                                                           date__month=payroll_date.month)
            
            total_earnings = Decimal('0.00')
            total_items = 0

            for task in completed_tasks:
                stage_cost_map = {
                    '1': 'splitting_drawing_cost',
                    '2': 'carving_cutting_cost',
                    '3': 'sanding_cost',
                    '4': 'painting_cost',
                    '5': 'finishing_cost',
                    '6': 'packaging_cost',
                }
                
                stage_cost_field = stage_cost_map.get(task.current_stage, 'splitting_drawing_cost')
                stage_cost = getattr(task.item, stage_cost_field, Decimal('0.00'))
                
                task_earnings = stage_cost * task.accepted
                total_earnings += task_earnings
                total_items += task.accepted

            try:
                payroll = Payroll.objects.create(
                    artist=artist,
                    item_qty=total_items,
                    total_earnings=total_earnings,
                    month=payroll_date
                )
                payroll_data.append(PayrollSerializer(payroll).data)
            except IntegrityError:
                # This should not happen due to our earlier check, but just in case
                return Response({'error': f'Payroll entry already exists for {artist.name} in {payroll_date.strftime("%B %Y")}'}, 
                                status=status.HTTP_400_BAD_REQUEST)

        return Response(payroll_data, status=status.HTTP_201_CREATED)

    
    @action(detail=False, methods=['get'])
    def monthly_completion_stats(self, request):
        # Get the monthly stats
        monthly_stats = CompletedTask.objects.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total_completed=Sum('accepted'),
            total_tasks=Count('id')
        ).order_by('month')

        # Calculate earnings
        for stat in monthly_stats:
            payrolls = Payroll.objects.filter(
                month__month=stat['month'].month,
                month__year=stat['month'].year
            )
            total_earnings = payrolls.aggregate(Sum('total_earnings'))['total_earnings__sum'] or Decimal('0.00')
            stat['total_earnings'] = total_earnings

        return Response(monthly_stats)
    
    @action(detail=False, methods=['get'])
    def current_month_payroll(self, request):
        current_date = timezone.now().date()
        current_month = datetime(current_date.year, current_date.month, 1).date()
        
        payrolls = Payroll.objects.filter(
            month=current_month
        ).filter(
            Q(item_qty__gt=0) | Q(total_earnings__gt=0)
        )
        
        serializer = self.get_serializer(payrolls, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['get'])
    def annual_artist_stats(self, request):
        try:
            current_year = timezone.now().year
            year = int(request.query_params.get('year', current_year))
            bonus_percentage = Decimal(request.query_params.get('bonus_percentage', '5'))

            if bonus_percentage < 0 or bonus_percentage > 100:
                return Response({'error': 'Bonus percentage must be between 0 and 100'}, status=status.HTTP_400_BAD_REQUEST)

            start_date = datetime(year, 1, 1).date()
            end_date = datetime(year, 12, 31).date()
            
            annual_stats = Payroll.objects.filter(
                month__range=[start_date, end_date]
            ).values('artist', 'artist__name').annotate(
                total_earnings=Sum('total_earnings'),
                total_items=Sum('item_qty')
            ).order_by('-total_earnings')

            result = []

            with transaction.atomic():
                for stat in annual_stats:
                    artist = Artist.objects.get(id=stat['artist'])
                    bonus_amount = (stat['total_earnings'] * bonus_percentage) / Decimal('100')

                    annual_bonus, created = AnnualBonus.objects.update_or_create(
                        artist=artist,
                        year=year,
                        defaults={
                            'annual_earnings': stat['total_earnings'],
                            'bonus_percentage': bonus_percentage,
                            'bonus_amount': bonus_amount,
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
        except Exception as e:
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    @action(detail=False, methods=['post'])
    def pay_bonuses(self, request):
        try:
            year = int(request.data.get('year'))
            artist_ids = request.data.get('artist_ids', [])  # Optional: List of artist IDs to pay bonuses for

            with transaction.atomic():
                bonuses_query = AnnualBonus.objects.filter(year=year, status='PENDING')
                
                if artist_ids:
                    bonuses_query = bonuses_query.filter(artist_id__in=artist_ids)
                
                updated_count = bonuses_query.update(status='PAID')

                if updated_count == 0:
                    return Response({
                        'message': 'No pending bonuses found for the specified year and artists.',
                        'updated_count': 0
                    }, status=status.HTTP_200_OK)

                return Response({
                    'message': f'Successfully paid {updated_count} bonuses for year {year}.',
                    'updated_count': updated_count
                }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({'error': 'Invalid year format.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)