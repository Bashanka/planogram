# Generated by Django 2.0.2 on 2018-03-04 19:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('planogram', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='product',
            options={'ordering': ['title'], 'verbose_name': 'Товар', 'verbose_name_plural': 'Товаров'},
        ),
    ]
