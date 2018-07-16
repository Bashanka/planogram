from .models import Product, Category
import xml.etree.ElementTree as ET
import base64
import random
import string
import math


def default_vendor_code():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))


def importFunction(f):
    # получениеданных из файла
    root = ET.parse(f).getroot()
    catalog = root.find('shop').find('Главный')  # получаем каталог
    # для каждого элемента каталога
    for c in catalog:
        if c.find('IsFolder').text == 'true':  # если категория
            # собираем данные о категории
            new_category = {}
            try:
                new_category['ref'] = c.find('Ref').text
            except:
                new_category['ref'] = default_vendor_code()
            try:
                new_category['name'] = c.find('Description').text
            except:
                new_category['name'] = default_vendor_code()
            try:
                new_category['parent'] = c.find('Parent').text
            except:
                new_category['parent'] = None

            # если это не корневая категория, то ищем ее родителя в бд или создаем родителя
            if new_category['parent'] != None:
                try:
                    new_category['parent'] = Category.objects.get(ref=new_category['parent'])
                except:
                    parent = Category(name=new_category['name'], ref=new_category['parent'], parent=None)
                    parent.save()
                    new_category['parent'] = parent

            # если такая категория существует, то ее обновляем, если отличается, иначе создаем данную категорию
            try:
                cat = Category.objects.get(ref=new_category['ref'])
                if (cat.name != new_category['name']) | (cat.parent != new_category['parent']):
                    cat.name = new_category['name']
                    cat.parent = new_category['parent']
                    cat.save()
            except:
                cat = Category(name=new_category['name'], parent=new_category['parent'], ref=new_category['ref'])
                cat.save()

        else:  # если товар
            # собираем данные о товаре
            new_product = {}
            try:
                new_product['ref'] = c.find('Ref').text
            except:
                new_product['ref'] = default_vendor_code()
            try:
                new_product['title'] = c.find('Description').text
            except:
                new_product['title'] = default_vendor_code()
            try:
                new_product['category'] = c.find('Parent').text
                try:
                    new_product['category'] = Category.objects.get(ref=new_product['category'])
                except:
                    category = Category(ref=new_product['category'], name=default_vendor_code())
                    category.save()
                    new_product['category'] = category
            except:
                try:
                    c = Category.objects.get(name='Без категории')
                    new_product['category'] = c
                except:
                    c = Category(name='Без категории', ref=default_vendor_code())
                    c.save()
                    new_product['category'] = c
            try:
                new_product['vendor_code'] = c.find('Артикул').text
            except:
                new_product['vendor_code'] = default_vendor_code()
            try:
                if c.find('Изображение').find('base64Binary').text != None:
                    new_product['image'] = c.find('Изображение').find('base64Binary').text
                    imageData = base64.b64decode(new_product['image'])
                    filename = 'media/source/' + new_product['vendor_code'] + '.png'
                    filename2 = 'source/' + new_product['vendor_code'] + '.png'
                    with open(filename, 'wb') as file:
                        file.write(imageData)
                        new_product['image'] = filename2
                else:
                    new_product['image'] = 'source/default.png'
            except:
                new_product['image'] = 'source/default.png'
            try:
                if (c.find('Ширина').text == None) | (c.find('Ширина').text == '0'):
                    new_product['width'] = 10
                else:
                    new_product['width'] = math.ceil(float(c.find('Ширина').text))
            except:
                new_product['width'] = 10
            try:
                if (c.find('Высота').text == None) | (c.find('Высота').text == '0'):
                    new_product['height'] = 10
                else:
                    new_product['height'] = math.ceil(float(c.find('Высота').text))
            except:
                new_product['width'] = 10
            try:
                if (c.find('Длина').text == None) | (c.find('Длина').text == '0'):
                    new_product['length'] = 10
                else:
                    new_product['length'] = math.ceil(float(c.find('Длина').text))
            except:
                new_product['length'] = 10
            # создание товара, если такого нет, иначе обновляется
            try:
                p = Product.objects.get(vendor_code=new_product['vendor_code'])
                if (p.title != new_product['title']) | (p.category != new_product['category']) | (p.image != new_product['image']) | (p.width != new_product['width']) | (p.height != new_product['height']) | (p.length != new_product['length']):
                    p.title = new_product['title']
                    p.category = new_product['category']
                    p.image = new_product['image']
                    p.width = new_product['width']
                    p.height = new_product['height']
                    p.length = new_product['length']
                    p.save()
            except:
                p = Product(title=new_product['title'], category=new_product['category'],
                              vendor_code=new_product['vendor_code'], image=new_product['image'],
                              width=new_product['width'], height=new_product['height'], length=new_product['length'])
                p.save()


'''
старый импорт из xlsx
'''

# def importFunc(f):
#     df = pd.read_excel(f, header=None, skiprows=2, index_col=None, skip_footer=0,
#                        parse_cols='A:H', na_values='')
#     df = df.fillna('0')
#     c = ''
#     try:
#         c = Category.objects.get(name='Без категории')
#     except:
#         c = Category(name='Без категории')
#         c.save()
#     for i in range(len(df[0])):
#     # for i in range(40):
#         if df[0][i] != '0':
#             title = df[1][i]
#             vendor_code = df[2][i]
#             image = ''
#             try:
#                 image = getImage(df[3][i], df[2][i])
#             except:
#                 image = 'source/default.png'
#             width = 10
#             if df[5][i] != '0':
#                 width = df[5][i]
#             height = 10
#             if df[5][i] != '0':
#                 height = max(int(df[6][i]), int(df[7][i]))
#             length = 10
#             if df[6][i] != '0':
#                 length = min(int(df[6][i]), int(df[7][i]))
#             try:
#                 p = Product.objects.get(vendor_code=vendor_code)
#                 p.delete()
#             except:
#                 pass
#             c.product_set.create(title=title, vendor_code=vendor_code, image=image,
#                                  width=width, height=height, length=length)
#
#         else:
#             if df[0][i+1] != '0':
#                 try:
#                     c = Category.objects.get(name=df[1][i])
#                 except:
#                     c = Category(name=df[1][i])
#                     c.save()
