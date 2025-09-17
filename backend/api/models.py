from django.db import models

class Client(models.Model):
    STATUS_ATIVO = 'ATIVO'
    STATUS_INATIVO = 'INATIVO'
    STATUS_CHOICES = [
        (STATUS_ATIVO, 'Ativo'),
        (STATUS_INATIVO, 'Inativo'),
    ]

    nome = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, blank=True, null=True)
    telefone = models.CharField(max_length=50, blank=True, null=True)
    empresa = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=7, choices=STATUS_CHOICES, default=STATUS_ATIVO)
    ultimo_contato = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self) -> str:
        if self.empresa:
            return f"{self.nome} ({self.empresa})"
        return self.nome
