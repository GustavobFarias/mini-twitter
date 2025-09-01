from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Post

User = get_user_model()

# Serializers de usuário
class UserPublicSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'name', 'avatar', 'is_following', 'followers_count', 'following_count')

    def get_is_following(self, obj):
        user = self.context.get('request').user
        from .models import Follow
        return Follow.objects.filter(follower=user, following=obj).exists()

    def get_followers_count(self, obj):
        return obj.followers_count()

    def get_following_count(self, obj):
        return obj.following_count()

class MeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'avatar', 'password']

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            avatar=validated_data.get('avatar', None)
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# Serializers de Post
class PostSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'text', 'image', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user  # pega o usuário logado
        return Post.objects.create(author=user, **validated_data)

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            name=validated_data.get('name', '')
        )
        return user
    
class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "followers_count", "following_count"]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()
