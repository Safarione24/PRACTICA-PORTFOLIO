from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('projects/', views.ProjectListCreateView.as_view()),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view()),
    path('skills/', views.SkillListCreateView.as_view()),
    path('skills/<int:pk>/', views.SkillDetailView.as_view()),
    path('u/<str:username>/', views.PublicProfileView.as_view()),
    path('health/', views.HealthView.as_view()),
]