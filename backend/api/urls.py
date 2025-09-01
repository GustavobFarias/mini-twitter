from django.urls import path
from .views import PostDeleteView, PostDetailView, PostListView, UpdateProfileImageView, MeView, UpdateProfileView, UserListView, FollowToggleView

urlpatterns = [
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/<int:pk>/delete/', PostDeleteView.as_view(), name='post-delete'),
    path('user/update-profile-image/', UpdateProfileImageView.as_view(), name='update-profile-image'),
    path('user/me/', MeView.as_view(), name='user-me'),  # 👈 aqui cria o endpoint
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/follow/', FollowToggleView.as_view(), name='user-follow-toggle'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path("user/update-profile/", UpdateProfileView.as_view(), name="update-profile"),
]