# Generated by Django 4.2.1 on 2023-10-03 19:26

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("mainapp", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="persona",
            name="apellido",
        ),
        migrations.RemoveField(
            model_name="persona",
            name="domicilio",
        ),
        migrations.RemoveField(
            model_name="persona",
            name="edad",
        ),
        migrations.RemoveField(
            model_name="persona",
            name="email",
        ),
        migrations.RemoveField(
            model_name="persona",
            name="fecha_nacimiento",
        ),
        migrations.RemoveField(
            model_name="persona",
            name="telefono",
        ),
        migrations.AddField(
            model_name="persona",
            name="color",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="persona",
            name="size",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="persona",
            name="x",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="persona",
            name="y",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]