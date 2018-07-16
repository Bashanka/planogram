from django.shortcuts import render
from .models import Category, Product, Planogram
from django.views import generic
from django.template import loader
from django.http import JsonResponse
from django.db.models import Q
import math

result_per_page = 20


# Create your views here.
'''
представление для домашней страницы
'''
def index(request):
    return render(request, 'index.html')

'''
представление для страницы по созданию планограмм
'''
def maker(request, template='planogram/maker.html', page_template='planogram/maker_page.html', category_template='planogram/maker_category.html'):
    category_list = Category.objects.all()
    product_list = Product.objects.all()[:result_per_page]
    planogram_list = Planogram.objects.all()
    context = {
        'product_list': product_list,
        'category_list': category_list,
        'planogram_list': planogram_list,
        'category_template': category_template,
        'page_template': page_template,
        'maker_check': True
    }
    return render(request, template, context)

'''
представление для фильтрации товаров
'''
def maker_filter(request, template='planogram/maker_page.html'):

    page = int(request.POST.get('page'))
    category_id = request.POST.get('category_id')
    first = result_per_page * (page - 1)
    last = result_per_page * page
    product_list = Product.objects.all()[first:last]

    if category_id != "all":
        all_cat = [int(category_id)]
        cur_cat = [int(category_id)]
        while len(cur_cat) > 0:
            pId = cur_cat.pop()
            c = Category.objects.filter(parent=pId)
            for i in c:
                cur_cat.append(i.id)
                all_cat.append(i.id)
        cats = Category.objects.filter(id__in=all_cat)
        product_list = Product.objects.filter(category__in=cats)[first:last]

    context = {'product_list': product_list}

    products_html = loader.render_to_string(template, context)

    output_data = {
        'products_html': products_html,
    }
    return JsonResponse(output_data)

'''
представление для загрузки категорий
'''
def maker_category(request, template='planogram/maker_category.html'):
    category_list = Category.objects.all()
    context = {'category_list': category_list}

    categories_html = loader.render_to_string(template, context)

    output_data = {
        'categories_html': categories_html,
    }
    return JsonResponse(output_data)

'''
представление для поиска товаров
'''
def maker_search(request, template='planogram/maker_page.html'):
    mask = request.POST.get('mask')
    page = int(request.POST.get('page'))
    first = result_per_page * (page - 1)
    last = result_per_page * page

    product_list = Product.objects.filter(Q(title__contains=mask)|Q(vendor_code__contains=mask))[first:last]
    context = {'product_list': product_list}

    products_html = loader.render_to_string(template, context)

    output_data = {
        'products_html': products_html,
    }

    return JsonResponse(output_data)

def add_planogram(request):
    title = request.POST.get('title')
    info = request.POST.get('info')
    p = Planogram(title=title, file=info)
    p.save()
    return JsonResponse({"message": "ok"}, safe=False)

'''
представление для отображения сохранненых планограмм
'''
def saved_planogram(request, template='planogram/saved_planogram.html'):
    planogram_list = Planogram.objects.all()
    context = {'planogram_list': planogram_list}
    planograms_html = loader.render_to_string(template, context)
    output_data = {
        'planograms_html': planograms_html,
    }
    return JsonResponse(output_data)

'''
представление для выбора планограммы
'''
def planogram_select(request, template='planogram/saved_planogram.html'):
    planogram_id = request.GET.get('planogram_id')
    planogram = Planogram.objects.get(id=planogram_id)
    output_data = {
        'planogram': planogram.file,
    }
    return JsonResponse(output_data)

'''
представление для удаления планограммы
'''
def planogram_delete(request):
    planogram_id = request.POST.get('planogram_id')
    planogram = Planogram.objects.get(id=planogram_id)
    print(planogram)
    planogram.delete()
    return JsonResponse({"message": "ok"})

def success(request):
    return render(request, 'success.html')


from django.http import HttpResponseRedirect
from .forms import ProductImportForm
from .functions import importFunction


'''
представление для импорта товаров
'''
def ProductImport(request):
    if request.method == 'POST':
        form = ProductImportForm(request.POST, request.FILES)

        if form.is_valid():
            importFunction(request.FILES['dataFile'])
            return HttpResponseRedirect('/planogram/success/')
    else:
        form = ProductImportForm()
    return render(request, 'planogram/import.html', {'form': form})


'''class ProductListView(generic.ListView):
    model = Product
    paginate_by = result_per_page

    def get_context_data(self, **kwargs):
        context = super(ProductListView, self).get_context_data(**kwargs)
        return context'''

'''
представление для отображения каталога
'''
def productListView(request, template='planogram/product_list.html', page_template='planogram/product_list_content.html'):
    product_list = Product.objects.all()[:result_per_page]
    category_list = Category.objects.all()
    product_count = math.ceil(Product.objects.all().count() / result_per_page)
    context = {
        'product_list': product_list,
        'product_count': product_count,
        'category_list': category_list,
        'page': 1,
        'page_template': page_template
    }
    return render(request, template, context)

'''
представление для отображения каталога по страницам
'''
def productListViewPerPage(request, template='planogram/product_list_content.html'):
    page = int(request.POST.get('page'))
    flag = request.POST.get('flag')
    first = result_per_page * (page - 1)
    last = result_per_page * page
    product_list = Product.objects.all()[first:last]
    product_count = math.ceil(Product.objects.all().count() / result_per_page)
    if flag == 'category':
        category_id = int(request.POST.get('category_id'))
        if category_id != "all":
            all_cat = [category_id]
            cur_cat = [category_id]
            while len(cur_cat) > 0:
                pId = cur_cat.pop()
                c = Category.objects.filter(parent=pId)
                for i in c:
                    cur_cat.append(i.id)
                    all_cat.append(i.id)
            cats = Category.objects.filter(id__in=all_cat)
            product_list = Product.objects.filter(category__in=cats)
            product_count = math.ceil(product_list.count() / result_per_page)
            product_list = product_list[first:last]
    elif flag == 'search':
        mask = request.POST.get('mask')
        product_list = Product.objects.filter(Q(title__contains=mask) | Q(vendor_code__contains=mask))
        product_count = math.ceil(product_list.count() / result_per_page)
        product_list = product_list[first:last]

    context = {
        'product_list': product_list,
        'page': page,
        'product_count': product_count,
    }

    products_html = loader.render_to_string(template, context)

    output_data = {
        'products_html': products_html,
    }
    return JsonResponse(output_data)


'''
представление для детального отображения товара
'''
class ProductDetailView(generic.DetailView):
    model = Product

    def get_context_data(self, **kwargs):
        context = super(ProductDetailView, self).get_context_data(**kwargs)
        return context


from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy


'''
представление для создания продукта
'''
class ProductCreate(CreateView):
    model = Product
    fields = '__all__'


'''
представление для обновления продукта
'''
class ProductUpdate(UpdateView):
    model = Product
    fields = '__all__'


'''
представление для удаления продукта
'''
class ProductDelete(DeleteView):
    model = Product
    fields = '__all__'
    success_url = reverse_lazy('products')


'''
представление для добавления, обновлениия и удаления продукта
'''
def categoryChange(request, template='planogram/maker_category.html'):
    flag = request.POST.get('flag')
    c = request.POST.get('category_id')
    category_id = int(c) if c != 'all' else 'all'
    if flag == 'add':
        category_name = request.POST.get('category_name')
        parent = None
        if (category_id != 'all'):
            parent = Category.objects.get(id=category_id)
        category = Category(name=category_name, parent=parent)
        category.save()
    elif flag == 'update':
        category_name = request.POST.get('category_name')
        category = Category.objects.get(id=category_id)
        if category_name != '':
            category.name = category_name
            category.save()
    elif flag == 'delete':
        try:
            category = Category.objects.get(id=category_id)
            category.delete()
        except:
            pass

    category_list = Category.objects.all()
    context = {'category_list': category_list}

    categories_html = loader.render_to_string(template, context)

    output_data = {
        'categories_html': categories_html,
    }
    return JsonResponse(output_data)
