# Generated by Django 2.0.2 on 2018-03-04 19:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('planogram', '0002_auto_20180304_2214'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='product',
            options={'ordering': ['title'], 'verbose_name': 'Товар', 'verbose_name_plural': 'Товары'},
        ),
    ]
