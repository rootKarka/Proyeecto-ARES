import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Crea un superusuario inicial si no existe"

    def handle(self, *args, **kwargs):

        username = os.getenv("ADMIN_USERNAME")
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    "⚠ Variables ADMIN_USERNAME o ADMIN_PASSWORD no configuradas."
                )
            )
            return

        # Si ya existe cualquier superusuario, no hacemos nada
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.SUCCESS(
                    "✔ Ya existe un superusuario. No se creó otro."
                )
            )
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"✔ Superusuario '{username}' creado correctamente."
            )
        )