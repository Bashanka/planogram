from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^success/$', views.success, name='success'),
    url(r'^maker/$', views.maker, name='maker'),
    url(r'^maker/categories/$', views.maker_category, name='maker_category'),
    url(r'^maker/filter/$', views.maker_filter, name='maker_filter'),
    url(r'^maker/search/$', views.maker_search, name='maker_search'),
    url(r'^add_planogram/$', views.add_planogram, name='add_planogram'),
    url(r'^planogram_select/$', views.planogram_select, name='planogram_select'),
    url(r'^planogram_delete/$', views.planogram_delete, name='planogram_delete'),
    url(r'^saved_planogram/$', views.saved_planogram, name='saved_planogram'),
    url(r'^products/$', views.productListView, name='products'),
    url(r'^products/page/$', views.productListViewPerPage, name='products_page'),
    url(r'^product/(?P<pk>\d+)$', views.ProductDetailView.as_view(), name='product-detail'),
]

urlpatterns += [
    url(r'^product/import/$', views.ProductImport, name='product_import'),
    url(r'^product/create/$', views.ProductCreate.as_view(), name='product_create'),
    url(r'^product/(?P<pk>\d+)/update/$', views.ProductUpdate.as_view(), name='product_update'),
    url(r'^product/(?P<pk>\d+)/delete/$', views.ProductDelete.as_view(), name='product_delete'),
    url(r'^product/category_change/$', views.categoryChange),
]