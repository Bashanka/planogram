var page = 1;
let address = "http://127.0.0.1:8000/"; // 5.23.49.20:8080 127.0.0.1:8000
var flag = 'all'; // 'all', 'category', 'search'
var category = 'all';
var mask = '';

$(document).ready(function () {
    // фильтрация по категориям
    $('#product_category').change(function () {
        category = $(this).val();
        if (category == 'all') {
            flag = 'all';
        } else {
            flag = 'category';
        }
        page = 1;
        loadPage();
    });
    // поиск продуктов
    $('#product_search').keyup(function () {
        mask = $(this).val();
        if (mask == '') {
            flag = 'all';
        } else {
            flag = 'search';
        }
        page = 1;
        loadPage();
    });
});

// страница назад
function btn_prev() {
    page--;
    // делаем видимой кнопку вперед
    $('#pr_l_btn_next').css('visibility', 'visible');
    $('#cur_page').text(parseInt($('#cur_page').text()) - 1);
    // прячем кнопку назад, если это первая страница
    if ($('#cur_page').text() == '1') $('#pr_l_btn_prev').css('visibility', 'hidden');
    // подгружаем данные
    loadPage();
    console.log(page);
}

// страница вперед
function btn_next() {
    page++;
    // делаем видимой кнопку назад
    $('#pr_l_btn_prev').css('visibility', 'visible');
    $('#cur_page').text(parseInt($('#cur_page').text()) + 1);
    // прячем кнопку вперед, если это последняя страница
    if ($('#cur_page').text() == $('#page_count').text()) $('#pr_l_btn_next').css('visibility', 'hidden');
    loadPage();
    console.log(page);
}

// загрузка новой страницы
function loadPage() {
    switch (flag) {
        case "category":
            $.ajax({
                type: "post",
                url: address + "planogram/products/page/",
                data: {
                    'page': page,
                    'flag': flag,
                    'category_id': category,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#page_content').empty().append(data.products_html);
                },
                error: function (xhr, status, error) {
                    alert(error)
                }
            });
            break;
        case "search":
            $.ajax({
                type: "post",
                url: address + "planogram/products/page/",
                data: {
                    'page': page,
                    'flag': flag,
                    'mask': mask,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#page_content').empty().append(data.products_html);
                },
                error: function (xhr, status, error) {
                    alert(error)
                }
            });
            break;
        default:
            $.ajax({
                type: "post",
                url: address + "planogram/products/page/",
                data: {
                    'page': page,
                    'flag': flag,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#page_content').empty().append(data.products_html);
                },
                error: function (xhr, status, error) {
                    alert(error)
                }
            });
    }
}

