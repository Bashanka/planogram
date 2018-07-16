from django.db import models
import random, string
from django.urls import reverse


def default_vendor_code():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

def default_ref():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

# Create your models here.
class Category(models.Model):
    ref = models.CharField(max_length=200, verbose_name="Уникальный код", default=default_vendor_code)
    name = models.CharField(max_length=200, verbose_name="Категория")
    parent = models.ForeignKey('self', blank=True, null=True, verbose_name="Родительский каталог", related_name='child', on_delete=models.CASCADE)

    class Meta:
        ordering = ["name"]
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name


class Product(models.Model):
    ref = models.CharField(max_length=200, verbose_name="Уникальный код", default=default_vendor_code)
    title = models.CharField(max_length=200, verbose_name="Название товара")
    category = models.ForeignKey(Category, verbose_name="Категория", on_delete=models.CASCADE, null=True)
    vendor_code = models.CharField(max_length=200, verbose_name="Артикул", default=default_vendor_code)
    image = models.ImageField(upload_to="sourse/", verbose_name="Изображение", default="catalog/default.png")
    width = models.PositiveIntegerField(verbose_name="Ширина", help_text="Указывать в см", default=10)
    height = models.PositiveIntegerField(verbose_name="Высота", help_text="Указывать в см", default=10)
    length = models.PositiveIntegerField(verbose_name="Длина", help_text="Указывать в см", default=10)

    class Meta:
        ordering = ["title"]
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('product-detail', args=[str(self.id)])

class Planogram(models.Model):
    title = models.CharField(max_length=200, verbose_name="Имя планограммы", unique=True)
    file = models.TextField(verbose_name="Планограмма")

    class Meta:
        ordering = ["title"]
        verbose_name = "Планограмма"
        verbose_name_plural = "Планограммы"

    def __str__(self):
        return self.title