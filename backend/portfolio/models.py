from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200, blank=True)
    bio = models.TextField(max_length=1000, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    views = models.IntegerField(default=0) # Счетчик просмотров

class Skill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=120)
    link = models.URLField()
    description = models.TextField(max_length=2000, blank=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)