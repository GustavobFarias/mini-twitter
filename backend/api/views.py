# views.py
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Post, Follow

from .serializers import (
    PostSerializer,
    UserRegisterSerializer,
    MeSerializer,
    UserPublicSerializer,
)
from .models import Post
from rest_framework import serializers

User = get_user_model()

# ---------- POSTS ----------
class PostListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()  # não passar author aqui
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDeleteView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Post.objects.filter(author=user)

# ---------- REGISTRO ----------
class RegisterView(APIView):
    permission_classes = []  # sem autenticação para registro

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user_id": user.id,
                "username": user.username,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------- PERFIL ----------
class UpdateProfileImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        user = request.user
        if "avatar" in request.data:
            user.avatar = request.data["avatar"]
            user.save()
        serializer = MeSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)



class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        avatar_url = (
            request.build_absolute_uri(user.avatar.url) if user.avatar else None
        )
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "avatar": avatar_url,
            "followers": user.followers_count() if hasattr(user, 'followers_count') else 0,
            "following": user.following_count() if hasattr(user, 'following_count') else 0,
        })

# ---------- USUÁRIOS ----------
class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    

    def get(self, request):
        users = User.objects.exclude(id=request.user.id)
        serializer = UserPublicSerializer(users, many=True, context={'request': request})
        data = []
        for u in users:
            data.append({
                "id": u.id,
                "username": u.username,
                "name": u.name,
                "avatar": u.avatar.url if u.avatar else None,
                "is_following": Follow.objects.filter(follower=request.user, following=u).exists()
            })
        return Response(serializer.data)

# ---------- SEGUIR / DEIXAR DE SEGUIR ----------
class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            user_to_follow = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado"}, status=404)

        request.user.following.add(user_to_follow)
        return Response({"detail": "Seguindo usuário"}, status=201)

    def delete(self, request, pk):
        try:
            user_to_unfollow = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado"}, status=404)

        request.user.following.remove(user_to_unfollow)
        return Response({"detail": "Deixou de seguir usuário"}, status=204)


class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Seguir um usuário"""
        target = get_object_or_404(User, pk=pk)
        if target == request.user:
            return Response({"error": "Você não pode seguir a si mesmo."}, status=400)
        
        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=target
        )
        if created:
            return Response({"status": "seguindo"}, status=201)
        return Response({"status": "já está seguindo"}, status=200)

    def delete(self, request, pk):
        """Deixar de seguir um usuário"""
        target = get_object_or_404(User, pk=pk)
        Follow.objects.filter(follower=request.user, following=target).delete()
        return Response({"status": "unfollowed"}, status=204)
    
class PostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"error": "Post não encontrado"}, status=404)
        serializer = PostSerializer(post)
        return Response(serializer.data)
    
class UserPublicSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'avatar', 'is_following']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, "user"):
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        data = request.data

        # Atualiza os campos
        if "name" in data:
            user.name = data["name"]
        if "username" in data:
            user.username = data["username"]
        if "password" in data and data["password"]:
            user.set_password(data["password"])

        user.save()

        # Retorna os dados atualizados
        avatar_url = request.build_absolute_uri(user.avatar.url) if user.avatar else None
        return Response({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "avatar": avatar_url,
            "followers": user.followers_count() if hasattr(user, 'followers_count') else 0,
            "following": user.following_count() if hasattr(user, 'following_count') else 0,
        }, status=status.HTTP_200_OK)