#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BackWeb.settings')
django.setup()

from mi_app.models import Usuario

def reset_user_password():
    try:
        # Buscar o usuário existente
        user = Usuario.objects.get(email='nobre@nobre.com')
        
        # Redefinir senha para 'admin123'
        user.set_password('admin123')
        user.save()
        
        print(f"[OK] Senha do usuario {user.email} redefinida para: admin123")
        print(f"   Username: {user.username}")
        print(f"   Role: {user.rol}")
        
    except Usuario.DoesNotExist:
        print("[ERRO] Usuario nao encontrado")
        
        # Criar um novo usuário admin
        user = Usuario.objects.create_user(
            email='admin@admin.com',
            username='admin',
            password='admin123',
            nome='Administrador',
            rol='admin',
            zona_acesso='geral'
        )
        print(f"[OK] Novo usuario criado:")
        print(f"   Email: {user.email}")
        print(f"   Username: {user.username}")
        print(f"   Senha: admin123")
        print(f"   Role: {user.rol}")

if __name__ == '__main__':
    reset_user_password()