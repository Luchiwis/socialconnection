from django.contrib import admin
from .models import Persona, Conexion

# Register your models here.

class PersonaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'edad', 'telefono', 'email', 'domicilio', 'fecha_nacimiento')
    search_fields = ('nombre', 'apellido', 'edad', 'telefono', 'email', 'domicilio', 'fecha_nacimiento')

admin.site.register(Persona)
admin.site.register(Conexion)
