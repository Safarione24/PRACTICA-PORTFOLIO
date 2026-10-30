from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Project, Skill

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Пароли не совпадают'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')

class ProjectSerializer(serializers.ModelSerializer):
    # При чтении показываем полную инфу о навыках
    skills = SkillSerializer(many=True, read_only=True)
    # При записи принимаем только ID навыков
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Skill.objects.all(), required=False, source='skills'
    )

    class Meta:
        model = Project
        fields = ('id', 'title', 'link', 'description', 'skills', 'skill_ids', 'created_at')

    def update(self, instance, validated_data):
        # Извлекаем навыки, если они есть
        skills_data = validated_data.pop('skills', None)
        
        # Обновляем текстовые поля (title, link, description)
        instance = super().update(instance, validated_data)
        
        # Если передали навыки, привязываем их к проекту
        if skills_data is not None:
            instance.skills.set(skills_data)
            
        return instance

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    projects = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('user', 'full_name', 'bio', 'avatar', 'resume', 'projects', 'skills')

    def get_projects(self, obj):
        return ProjectSerializer(obj.user.projects.all(), many=True).data

    def get_skills(self, obj):
        return SkillSerializer(obj.user.skills.all(), many=True).data