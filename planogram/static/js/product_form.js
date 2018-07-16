var flag = 'add'; // 'add', 'update', 'delete'
var category_id = '';
var category_name = '';
let address = "http://127.0.0.1:8000/"; // 5.23.49.20:8080 127.0.0.1:8000

$(document).ready(function () {
    $("#update_category").css("display", "none");
    $("#delete_category").css("display", "none");
    $('select').change(function () {
        if ($(this).val() == 'all') {
            $("#update_category").css("display", "none");
            $("#delete_category").css("display", "none");
        } else {
            $("#update_category").css("display", "inline");
            $("#delete_category").css("display", "inline");
        }
    });

    // Добавление категории
    $('#add_category').click(function () {
        flag = 'add';
        $('body').append("<div id='overlay'></div>");
        $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
        $('div.popup').fadeIn(500);
        $('div.popup').append('<h1>Добавьте новую категорию</h1><input type="text"><br><br><a href="javascript:void(0);" class="btn btn-primary" onclick="add_category()">Добавить</a><a href="javascript:void(0);" class="btn btn-primary"  onclick="cancel()">Отмена</a>');
        return false;
    });

    // Изменение категории
    $('#update_category').click(function () {
        flag = 'update';
        $('body').append("<div id='overlay'></div>");
        $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
        $('div.popup').fadeIn(500);
        $('div.popup').append('<h1>Измените имя категории</h1><input type="text" value="' + $('select option:selected').text() + '"><br><br><a href="javascript:void(0);" class="btn btn-primary" onclick="change_category()">Изменить</a><a href="javascript:void(0);" class="btn btn-primary"  onclick="cancel()">Отмена</a>');
        return false;
    });

    // Удаление категории
    $('#delete_category').click(function () {
        flag = 'delete';
        $('body').append("<div id='overlay'></div>");
        $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
        $('div.popup').fadeIn(500);
        $('div.popup').append('<h1>Удаление товара</h1><p>Вы уверены, что хотите удалить категорию ' + $('select option:selected').text() + ' ?</p><a href="javascript:void(0);" class="btn btn-primary" onclick="delete_category()">Да</a><a href="javascript:void(0);" class="btn btn-primary"  onclick="cancel()">Отмена</a>');
        return false;
    });
});

// Закрыть каталог
$('a.close').click(function () {
    $(this).parent().fadeOut(100);
    $('#overlay').remove('#overlay');
    return false;
});

// добавление категории
function add_category() {
    flag = 'add';
    category_id = $('select').val();
    category_name = $('div.popup input').val();
    categoryChange();
    $('div.popup').fadeOut(100);
    $('#overlay').remove('#overlay');
    $('div.popup').empty();
    $("#update_category").css("display", "none");
    $("#delete_category").css("display", "none");
    return false;
}

// переименование категории
function change_category() {
    flag = 'update';
    category_id = $('select').val();
    category_name = $('div.popup input').val();
    categoryChange();
    $('div.popup').fadeOut(100);
    $('#overlay').remove('#overlay');
    $('div.popup').empty();
    $("#update_category").css("display", "none");
    $("#delete_category").css("display", "none");
    return false;
}

// удаление категории
function delete_category() {
    flag = 'delete';
    category_id = $('select').val();
    categoryChange();
    $('div.popup').fadeOut(100);
    $('#overlay').remove('#overlay');
    $('div.popup').empty();
    $("#update_category").css("display", "none");
    $("#delete_category").css("display", "none");
    return false;
}

// закрытие попапа
function cancel() {
    $('div.popup').fadeOut(100);
    $('#overlay').remove('#overlay');
    $('div.popup').empty();
    return false;
}

// изменения в категориях (добавление, изменение и удаление)
function categoryChange() {
    switch (flag) {
        case 'update':
            $.ajax({
                type: "post",
                url: address + "planogram/product/category_change/",
                data: {
                    'flag': flag,
                    'category_id': category_id,
                    'category_name': category_name,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#categorySelect').empty().append(data.categories_html);
                    console.log('changed');
                },
                error: function (xhr, status, error) {
            alert(error)
                }
            });
            break;
        case 'delete':
            $.ajax({
                type: "post",
                url: address + "planogram/product/category_change/",
                data: {
                    'flag': flag,
                    'category_id': category_id,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#categorySelect').empty().append(data.categories_html);
                    console.log('deleted');
                },
                error: function (xhr, status, error) {
            alert(error)
                }
            });
            break;
        default:
            $.ajax({
                type: "post",
                url: address + "planogram/product/category_change/",
                data: {
                    'flag': flag,
                    'category_id': category_id,
                    'category_name': category_name,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#categorySelect').empty().append(data.categories_html);
                    console.log('added');
                },
                error: function (xhr, status, error) {
            alert(error)
                }
            });
            break;
    }
}

// показывать ли удаление и обновление категории, если категория не выбрана, то не показывать
function selectChange(slct) {
    if ($(slct).val() == '') {
        $("#update_category").css("display", "none");
        $("#delete_category").css("display", "none");
    } else {
        $("#update_category").css("display", "inline");
        $("#delete_category").css("display", "inline");
    }
}

$(function () {
    $.ajax({
        type: "post",
        url: address + "planogram/maker/categories/",
        data: {
            'csrfmiddlewaretoken': window.CSRF_TOKEN
        },
        success: function (data) {
            $('select').append(data.categories_html);
            let id = $('#categoryId').text();
            console.log(id);
            if (id !== '') {
                console.log('ok');
                $('select option[value=' + id + ']').attr('selected','selected');
            }
        },
        error: function (xhr, status, error) {
            alert(error)
        }
    });
});
