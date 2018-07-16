from django import forms

class ProductImportForm(forms.Form):
    dataFile = forms.FileField(label="Файл с данными")

