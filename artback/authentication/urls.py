from django.urls import path
from .views import (
    RegisterView, ArtistCreateView, SpecializationCreateView, 
    ArtistListView, SpecializationListView, ArtistUpdateView,
    LogoutView, PasswordResetRequestView, PasswordResetConfirmView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('password_reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password_reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('artists/', ArtistCreateView.as_view(), name='artist_create'),
    path('artists/list/', ArtistListView.as_view(), name='artist_list'),
    path('artists/<int:pk>/', ArtistUpdateView.as_view(), name='artist_update'),
    path('specializations/', SpecializationCreateView.as_view(), name='specialization_create'),
    path('specializations/list/', SpecializationListView.as_view(), name='specialization_list'),
]