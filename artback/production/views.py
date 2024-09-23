# production/views.py
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ProductionTask, QualityCheck, RejectionHistory, CompletedTask
from .serializers import ProductionTaskSerializer, QualityCheckSerializer, RejectionHistorySerializer, CompletedTaskSerializer

logger = logging.getLogger(__name__)

class ProductionTaskViewSet(viewsets.ModelViewSet):
    queryset = ProductionTask.objects.all()
    serializer_class = ProductionTaskSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if increment_rejection flag is set
        if request.data.get('increment_rejection'):
            instance.rejection_count += 1
            instance.save()
        
        # Check if decrement_rejection flag is set
        if request.data.get('decrement_rejection'):
            if instance.rejection_count > 0:
                instance.rejection_count -= 1
                instance.save()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Check if the stage is being updated
        new_stage = request.data.get('current_stage')
        if new_stage and new_stage != instance.current_stage:
            # Create a CompletedTask record for the previous stage
            CompletedTask.objects.create(
                item=instance.item,
                artist=instance.artist,
                accepted=instance.accepted,
                current_stage=instance.current_stage
            )

        self.perform_update(serializer)

        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reassign_artist(self, request, pk=None):
        task = self.get_object()
        serializer = self.get_serializer(task, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['post'])
    def complete_task(self, request, pk=None):
        task = self.get_object()
        if task.status != 'I':  # Assuming 'I' is for 'In Progress'
            return Response({'error': 'Only in-progress tasks can be completed.'}, status=status.HTTP_400_BAD_REQUEST)

        task.status = 'C'  # Assuming 'C' is for 'Completed'
        task.save()

        # Update inventory
        task.item.stock += task.quantity
        task.item.save()

        return Response({'message': 'Production task completed successfully.'})
    
    @action(detail=True, methods=['post'])
    def accept_task(self, request, pk=None):
        task = self.get_object()
        accepted = request.data.get('accepted', 0)
        
        # Create a CompletedTask
        CompletedTask.objects.create(
            item=task.item,
            artist=task.artist,
            accepted=accepted,
            current_stage=task.current_stage
        )
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class RejectionHistoryViewSet(viewsets.ModelViewSet):
    queryset = RejectionHistory.objects.all()
    serializer_class = RejectionHistorySerializer

    def get_queryset(self):
        # By default, only return pending (not fixed) rejection histories
        return RejectionHistory.objects.filter(status='P')

    def create(self, request, *args, **kwargs):
        # Log the received data
        logger.info(f"Received data for RejectionHistory creation: {request.data}")
        print(f"Received data for RejectionHistory creation: {request.data}")

        # Extract the production_task ID from the request data
        production_task_id = request.data.get('task_id')

        if production_task_id:
            try:
                # Fetch the ProductionTask instance
                production_task = production_task_id
                
                # Create a mutable copy of the request data
                mutable_data = request.data.copy()
                
                # Replace the production_task ID with the actual instance
                mutable_data['production_task'] = production_task
                
                # Create the serializer with the modified data
                serializer = self.get_serializer(data=mutable_data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
            except ProductionTask.DoesNotExist:
                return Response({"error": f"ProductionTask with id {production_task_id} does not exist."},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "production_task is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'])
    def mark_defect_fixed(self, request, pk=None):
        logger.info(f"Received data for marking defect as fixed: {request.data}")
        print(f"Received data for marking defect as fixed: {request.data}")

        rejection_history = self.get_object()
        
        if rejection_history.status == 'F':
            return Response({'error': 'This defect has already been fixed.'}, status=status.HTTP_400_BAD_REQUEST)

        rejection_history.status = 'F'  # Set status to 'Fixed'
        rejection_history.save()

        # Update the associated ProductionTask
        production_task = rejection_history.production_task
        if production_task:
            production_task_serializer = ProductionTaskSerializer(production_task, data={
                'decrement_rejection': True,
                'status': 'I'  # Set status back to 'In Progress'
            }, partial=True)
            if production_task_serializer.is_valid():
                production_task_serializer.save()
            else:
                logger.error(f"Error updating ProductionTask: {production_task_serializer.errors}")
                return Response(production_task_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(rejection_history)
        return Response(serializer.data)


class CompletedTaskViewSet(viewsets.ModelViewSet):
    queryset = CompletedTask.objects.all()
    serializer_class = CompletedTaskSerializer

    def create(self, request, *args, **kwargs):
        # You might want to add some validation here
        return super().create(request, *args, **kwargs)


class QualityCheckViewSet(viewsets.ModelViewSet):
    queryset = QualityCheck.objects.all()
    serializer_class = QualityCheckSerializer