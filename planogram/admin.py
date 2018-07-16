from django.contrib import admin
from .models import Category, Product, Planogram

# Register your models here.


# отображение планограмм в административной панели
admin.site.register(Planogram)

# отображение категорий в административной панели
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display=('name', 'ref', 'parent')
    list_filter = ('parent', 'name')

# отображение продуктов в административной панели
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'vendor_code', 'image', 'width', 'height', 'length')
    fieldsets = (
        (None, {
            'fields': ('title', 'category', 'vendor_code', 'image')
        }),
        ('Габариты', {
            'fields': ('width', 'height', 'length')
        }),
    )
    list_filter = ('category', 'title')
