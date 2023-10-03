from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class Persona(models.Model):
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50, null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    telefono = models.CharField(max_length=50, null=True, blank=True)
    email = models.CharField(max_length=50, null=True, blank=True)
    domicilio = models.CharField(max_length=50, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    def __str__(self):
        return self.nombre

class Conexion(models.Model):
    persona1 = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='persona1')
    persona2 = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='persona2')
    peso = models.IntegerField(null=True, blank=True)
    def __str__(self):
        return self.persona1.nombre + " - " + self.persona2.nombre
    
    def save(self, *args, **kwargs):
        # Check if a connection between the same persons already exists
        if self.persona1 == self.persona2:
            raise ValidationError("You cannot create a connection between the same person.")
        
        # Check if a connection with the same persons already exists (bidirectional check)
        if Conexion.objects.filter(persona1=self.persona2, persona2=self.persona1).exists():
            raise ValidationError("A connection between these persons already exists.")

        super().save(*args, **kwargs)