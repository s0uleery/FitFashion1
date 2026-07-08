from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return super().create_superuser(username, email, password, **extra_fields)

class CustomUser(AbstractUser):
    ROLES = (
        ('ADMIN', 'Administrador'),
        ('GESTOR', 'Controla tienda'),
        ('CLIENTE', 'Usuario'),
    )
    
    email = models.EmailField(unique=True) 
    role = models.CharField(max_length=15, choices=ROLES, default='CLIENTE')
    addresses = models.JSONField(default=list, blank=True)
    objects = CustomUserManager()

    USERNAME_FIELD = 'username' 
    REQUIRED_FIELDS = ['email', 'first_name'] 
    
    def __str__(self):
        return self.email