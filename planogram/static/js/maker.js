let scale = 1;
let defScale = 1;
let rack_color = 0;
let rack_height = 0;
let rack_width = 0;
let rack_deep = 0;
let shelf_thickness = 5;
let canvas = $('#cnv');
let xTranslate = 0;
let yTranslate = 0;
let selectedObject;
let shelfs = {length: 0};
let hook = [];
let products = [];
window.page = 1;
let address = "http://5.23.49.20:8080/"; // 5.23.49.20:8080 / 127.0.0.1:8000
let canvas_width = 1200;
let canvas_height = 900;
let flag = "category";
let adhesion = false; // флаг прилипания к полке
let pixelNav = false; // флаг перемещения продукта стрелками
let selectedLayer = {};
let lastSelectedLayer = {};

$(document).ready(function () {
    /**
    * Добавления полей для ввода высот полок
    **/
    $('#addShelf').click(function () {
        $('#rack_shelfs').append('<span><input id="shelf" type="number"><a href="javascript:void(0);" onclick="deleteShelf(this)"><img src="/static/admin/img/icon-deletelink.svg" alt="Удалить"></a></span>');
    });
    // Построение стелажа
    $('#rackButton').click(function () {
        // сохранение отрисованных слоев продуктов и крючков
        productsLayers = canvas.getLayerGroup('products');
        hookLayers = canvas.getLayerGroup('hook');
        hook = [];
        products = [];
        if (hookLayers !== undefined) {
            for (let i = 0; i < hookLayers.length; i++) {
                hook[i] = {
                    x: hookLayers[i].x,
                    y: hookLayers[i].y
                };
            }
        }
        if (productsLayers !== undefined) {
            for (let i = 0; i < productsLayers.length; i++) {
                products[i] = {
                    source: productsLayers[i].source,
                    x: productsLayers[i].x, y: productsLayers[i].y,
                    width: productsLayers[i].width, height: productsLayers[i].height,
                    data: productsLayers[i].data
                };
            }
        }

        // Считывание параметров стелажа
        rack_color = $('#rack_color').val();
        rack_height = parseInt($('#rack_height').val());
        rack_width = parseInt($('#rack_width').val());
        rack_deep = parseInt($('#rack_deep').val());
        if ($('#shelf_thickness').val() != '') {
            shelf_thickness = parseInt($('#shelf_thickness').val());
        }

        // задаем начальный масштаб, чтобы стелаж был размером с рабочую область
        scale = Math.min(canvas_width / (140 + rack_deep * 2 + rack_width), canvas_height / rack_height);

        // получения данных о высотах полок
        shelfs = $("#rack_shelfs input").map(function () {
            return $(this).val();
        });
        // перевод в координаты канваса
        for (let i = 0; i < shelfs.length; i++) {
            shelfs[i] = rack_height - parseInt(shelfs[i]) + 20;
        }
        // сортируем высоты
        shelfs.sort(function (a, b) {
            return a - b;
        });

        // рисуем/перерисовываем стелаж
        canvas.removeLayerGroup('rack');
        canvas.clearCanvas();
        // перемещаем и масштабируем стелаж
        canvas.scaleCanvas({scale: scale / defScale});
        canvas.translateCanvas({translateX: -xTranslate, translateY: -yTranslate});

        defScale = scale;

        xTranslate = 0;
        yTranslate = 0;

        // Рисуем стелаж
        canvas.drawRect({
            layer: true,
            groups: ['rack'],
            name: 'leftSide',
            fillStyle: rack_color,
            x: 20, y: 20,
            width: rack_deep, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            name: 'frontSide',
            fillStyle: rack_color,
            x: 70 + rack_deep, y: 20,
            width: rack_width, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            name: 'rightSide',
            fillStyle: rack_color,
            x: 120 + rack_deep + rack_width, y: 20,
            width: rack_deep, height: rack_height,
            fromCenter: false,
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 20, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 18 + rack_deep, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 70 + rack_deep, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 68 + rack_deep + rack_width, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 120 + rack_deep + rack_width, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 118 + 2 * rack_deep + rack_width, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 20, y: rack_height + 18,
            width: rack_deep, height: 2,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 70 + rack_deep, y: rack_height + 18,
            width: rack_width, height: 2,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 120 + rack_deep + rack_width, y: rack_height + 18,
            width: rack_deep, height: 2,
            fromCenter: false
        });

        // удаляем полки если есть и рисуем новые
        canvas.removeLayerGroup('shelf');
        for (let i = 0; i < shelfs.length; i++) {
            canvas.drawRect({
                layer: true,
                groups: ['shelf'],
                fillStyle: '#666666',
                x: 70 + rack_deep, y: shelfs[i] - shelf_thickness,
                width: rack_width, height: shelf_thickness,
                fromCenter: false
            });
        }

        // удаляем слои продуктов и крючков
        canvas.removeLayerGroup('hook');
        canvas.removeLayerGroup('products');
        canvas.restoreCanvas();

        // заново рисуем крючки и продукты
        canvas.drawLayers();
        for (let i = 0; i < hook.length; i++) {
            canvas.drawImage({
                draggable: true,
                layer: true,
                groups: ['hook'],
                source: '/media/home/hook.png',
                x: hook[i].x, y: hook[i].y,
                width: 5, height: 5,
                fromCenter: false,
                cursors: {
                    mouseover: 'pointer',
                    mousedown: 'move',
                    mouseup: 'pointer'
                },
                mousedown: function (layer) {
                    if (selectedLayer === {}) {
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                    } else if (layer === selectedLayer) {
                        $(this).setLayer(layer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        selectedLayer = {};
                    } else {
                        $(this).setLayer(selectedLayer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                    }
                },
                dblclick: function (layer) {
                },
                updateDragX: function (layer, x) {
                    let xPos = event.clientX - canvas.offset().left + $(window).scrollLeft();
                    x = parseInt((xPos - xTranslate) / defScale - layer.width / 2);
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return x;
                },
                updateDragY: function (layer, y) {
                    let yPos = event.clientY - canvas.offset().top + $(window).scrollTop();
                    y = parseInt((yPos - yTranslate) / defScale - layer.height / 2);
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return y;
                }
            });
        }
        for (let i = 0; i < products.length; i++) {
            canvas.drawImage({
                draggable: true,
                layer: true,
                groups: ['products'],
                source: products[i].source,
                x: products[i].x, y: products[i].y,
                width: products[i].width, height: products[i].height,
                fromCenter: false,
                data: products[i].data,
                cursors: {
                    mouseover: 'pointer',
                    mousedown: 'move',
                    mouseup: 'pointer'
                },
                mousedown: function (layer) {
                    if (selectedLayer === {}) {
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                        lastSelectedLayer = layer;

                    } else if (layer === selectedLayer) {
                        $(this).setLayer(layer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        selectedLayer = {};
                    } else {
                        $(this).setLayer(selectedLayer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                        lastSelectedLayer = layer;
                    }
                },
                dblclick: function (layer) {
                    $('body').append("<div id='overlay'></div>");
                    $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
                    $('#getProductInfo').append('<form><label for="refreshCount">Количество: </label><input type="text" id="refreshCount" placeholder="' + lastSelectedLayer.data['count'] + '">');
                    $('#getProductInfo').append('</form>');
                    $('#changeProductInfo').fadeIn(500);
                    console.log(lastSelectedLayer);
                },
                mouseover: function (layer) {
                    $('#productInfo').append('<p>Наименование: ' + layer.data['title'] + '</p>');
                    $('#productInfo').append('<p>Артикул:' + layer.data['vendor_code'] + '</p>');
                    $('#productInfo').append('<p>Категория:' + layer.data['category'] + '</p>');
                    $('#productInfo').append('<p>Размеры:' + layer.data['width'] + '*' + layer.data['height'] + '*' + layer.data['depth'] + '</p>');
                    $('#productInfo').append('<p>Количество:' + layer.data['count'] + '</p>');
                },
                mouseout: function (layer) {
                    $('#productInfo').empty();
                },
                updateDragX: function (layer, x) {
                    let xPos = event.clientX - canvas.offset().left + $(window).scrollLeft();
                    x = parseInt((xPos - xTranslate) / defScale - layer.width / 2);
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return x;
                },
                updateDragY: function (layer, y) {
                    let yPos = event.clientY - canvas.offset().top + $(window).scrollTop();
                    y = parseInt((yPos - yTranslate) / defScale - layer.height / 2);
                    if (adhesion) {
                        if ((layer.x >= 70 + rack_deep) && (layer.x <= 70 + rack_deep + rack_width - layer.width) && shelfs.length) {
                            $(this).setLayer(layer, {
                                shadowColor: "#f00",
                                shadowX: "1",
                                shadowY: "-1"
                            });
                            selectedLayer = layer;
                            return productYPosition(layer.x, y, layer.height, shelfs);
                        }
                    }
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return y;
                }
            });
        }
        canvas.restoreCanvas();
    });

    // Зум для всех браузеров кроме Opera & FF
    canvas.bind('mousewheel', function (e) {
        // задание ограничения по перещению, чтобы макет не выходил за пределы
        let minTx = canvas_width / defScale - (140 + rack_width + 2 * rack_deep);
        let minTy = canvas_height / defScale - (40 + rack_height);
        let maxTx = 0;
        let maxTy = 0;
        if (e.originalEvent.wheelDelta / 120 > 0) {
            scale = 1.1;
            defScale *= 1.1;
            xTranslate = -xTranslate;
            yTranslate = -yTranslate;
            // смещение в изначальное состояние
            canvas.translateCanvas({translateX: xTranslate, translateY: yTranslate});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
            canvas.scaleCanvas({scale: scale});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();

            if (xTranslate < minTx) {
                xTranslate = minTx;
            }
            if (xTranslate > maxTx) {
                xTranslate = maxTx;
            }
            if (yTranslate < minTy) {
                yTranslate = minTy;
            }
            if (yTranslate > maxTy) {
                yTranslate = maxTy;
            }
            // смещение в новое состояние, чтобы макет не пропал из зоны видимости
            canvas.translateCanvas({translateX: xTranslate, translateY: yTranslate});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
        } else {
            scale = 0.9;
            defScale *= 0.9;
            canvas.translateCanvas({translateX: -xTranslate, translateY: -yTranslate});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
            canvas.scaleCanvas({scale: scale});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
            if (xTranslate < minTx) {
                xTranslate = minTx;
            }
            if (xTranslate > maxTx) {
                xTranslate = maxTx;
            }
            if (yTranslate < minTy) {
                yTranslate = minTy;
            }
            if (yTranslate > maxTy) {
                yTranslate = maxTy;
            }

            canvas.translateCanvas({translateX: xTranslate, translateY: yTranslate});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
        }
        // Запрещаем обработку события браузером по умолчанию
        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
    });
    // Зум для  браузеров Opera & FF
    canvas.bind('DOMMouseScroll', function (e) {
        if (e.originalEvent.detail > 0) {
            scale = 1.1;
            defScale *= 1.1;
            canvas.scaleCanvas({scale: scale});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();

        } else {
            scale = 0.9;
            defScale *= 0.9;
            canvas.scaleCanvas({scale: scale});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
        }
        // Запрещаем обработку события браузером по умолчанию
        if (e.preventDefault()) e.preventDefault();
        e.returnValue = false;

    });

    // перемещение макета, продуктов по макету и удаление продуктов
    $(document).keydown(function (e) {
        // задание ограничения по перещению, чтобы макет не выходил за пределы
        let minTx = canvas_width / defScale - (140 + rack_width + 2 * rack_deep);
        let minTy = canvas_height / defScale - (40 + rack_height);
        let maxTx = 0;
        let maxTy = 0;
        // перемещение макета
        if (e.keyCode == '37' && !pixelNav) {
            if (xTranslate > minTx) {
                xTranslate -= 10;
                canvas.translateCanvas({translateX: -10, translateY: 0});
                canvas.clearCanvas();
                canvas.drawLayers();
                canvas.restoreCanvas();
                if (e.preventDefault()) e.preventDefault();
                e.returnValue = false;
            }
            // Запрещаем обработку события браузером по умолчанию
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if (e.keyCode == '38' && !pixelNav) {
            if (yTranslate > minTy) {
                yTranslate -= 10;
                canvas.translateCanvas({translateX: 0, translateY: -10});
                canvas.clearCanvas();
                canvas.drawLayers();
                canvas.restoreCanvas();
                if (e.preventDefault()) e.preventDefault();
                e.returnValue = false;
            }
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if (e.keyCode == '39' && !pixelNav) {
            if (xTranslate < maxTx) {
                xTranslate += 10;
                canvas.translateCanvas({translateX: 10, translateY: 0});
                canvas.clearCanvas();
                canvas.drawLayers();
                canvas.restoreCanvas();
                if (e.preventDefault()) e.preventDefault();
                e.returnValue = false;
            }
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if (e.keyCode == '40' && !pixelNav) {
            if (yTranslate < maxTy) {
                yTranslate += 10;
                canvas.translateCanvas({translateX: 0, translateY: 10});
                canvas.clearCanvas();
                canvas.drawLayers();
                canvas.restoreCanvas();
                if (e.preventDefault()) e.preventDefault();
                e.returnValue = false;
            }
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if (e.keyCode == '37' && pixelNav && selectedLayer != {}) {
            // перемещение продукта по макету
            canvas.setLayer(selectedLayer, {x: "-=1"});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if (e.keyCode == '38' && pixelNav && selectedLayer != {}) {
            canvas.setLayer(selectedLayer, {y: "-=1"});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if (e.keyCode == '39' && pixelNav && selectedLayer != {}) {
            canvas.setLayer(selectedLayer, {x: "+=1"});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if (e.keyCode == '40' && pixelNav && selectedLayer != {}) {
            canvas.setLayer(selectedLayer, {y: "+=1"});
            canvas.clearCanvas();
            canvas.drawLayers();
            canvas.restoreCanvas();
            if (event.preventDefault) event.preventDefault();
            event.returnValue = false;
        } else if ((e.keyCode == '8') && (selectedLayer != {})) {
            // удаление выделенного товара
            canvas.removeLayer(selectedLayer);
            selectedLayer = {};
            $('#productInfo').empty();
        }
    });

    // Добавить товар (переход  каталог)
    $('a#addProduct').click(function () {
        $('body').append("<div id='overlay'></div>");
        $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
        $('div.popup').fadeIn(500);
        return false;
    });
    // Закрыть каталог
    $('a.close').click(function () {
        $(this).parent().fadeOut(100);
        $('#overlay').remove('#overlay');
        $('#getProductInfo').empty();
        return false;
    });

    // обновление каталога продуктов
    $('#refresh').click(function () {
        // обновляем список категорий
        $.ajax({
            type: "post",
            url: address + "planogram/maker/categories/",
            data: {
                'csrfmiddlewaretoken': window.CSRF_TOKEN
            },
            success: function (data) {
                $('#categorySelect').empty().append(data.categories_html);
            },
            error: function (xhr, status, error) {
                alert(error)
            }
        });
        // обновляем список продуктов
        window.page = 1;
        $.ajax({
            type: "post",
            url: address + "planogram/maker/filter/",
            data: {
                'category_id': 'all',
                'page': window.page,
                'type_function': 'category',
                'csrfmiddlewaretoken': window.CSRF_TOKEN
            },
            success: function (data) {
                $('#page_content').empty().append(data.products_html);
                window.page++;
            },
            error: function (xhr, status, error) {
                alert(error)
            }
        });
    });
    // Фильтрация по категории
    $('#categorySelect').change(function () {
        flag = 'category';
        window.page = 1;
        $.ajax({
            type: "post",
            url: address + "planogram/maker/filter/",
            data: {
                'category_id': $(this).val(),
                'page': window.page,
                'type_function': 'category',
                'csrfmiddlewaretoken': window.CSRF_TOKEN
            },
            success: function (data) {
                $('#page_content').empty().append(data.products_html);
                window.page++;
            },
            error: function (xhr, status, error) {
                alert(error)
            }
        });
    });

    // Поиск при вводе в поле поиска
    $('#productSearch').keyup(function () {
        flag = 'search';
        let mask = $(this).val();
        window.page = 1;
        console.log(mask);
        $.ajax({
            type: "post",
            url: address + "planogram/maker/search/",
            data: {
                'mask': mask,
                'page': window.page,
                'csrfmiddlewaretoken': window.CSRF_TOKEN
            },
            success: function (data) {
                $('#page_content').empty().append(data.products_html);
                window.page++;
            },
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    });

    // догрузка
    $('#loadButton').click(function () {
        // догрузка из категории
        if (flag === 'category') {
            let cat = $('#categorySelect').val();
            $.ajax({
                type: "post",
                url: address + "planogram/maker/filter/",
                data: {
                    'category_id': cat,
                    'page': window.page,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#page_content').append(data.products_html);
                    window.page++;
                },
                error: function (xhr, status, error) {
                    alert(error);
                }
            });
        } else {
            // догрузка по поиску
            let mask = $("#productSearch").val();
            $.ajax({
                type: "post",
                url: address + "planogram/maker/search/",
                data: {
                    'mask': mask,
                    'page': window.page,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    $('#page_content').empty().append(data.products_html);
                    window.page++;
                },
                error: function (xhr, status, error) {
                    alert(error);
                }
            });
        }
    });

    // добавить крючок
    $('a#addHook').click(function () {
        canvas.drawImage({
            draggable: true,
            layer: true,
            groups: ['hook'],
            source: '/media/home/hook.png',
            x: 50 - xTranslate, y: 50 - yTranslate,
            width: 5, height: 5,
            fromCenter: false,
            cursors: {
                mouseover: 'pointer',
                mousedown: 'move',
                mouseup: 'pointer'
            },
            mousedown: function (layer) {
                if (selectedLayer === {}) {
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                } else if (layer === selectedLayer) {
                    $(this).setLayer(layer, {
                        shadowColor: "#fff",
                        shadowX: "0",
                        shadowY: "0"
                    });
                    selectedLayer = {};
                } else {
                    $(this).setLayer(selectedLayer, {
                        shadowColor: "#fff",
                        shadowX: "0",
                        shadowY: "0"
                    });
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                }
            },
            updateDragX: function (layer, x) {
                let xPos = event.clientX - canvas.offset().left + $(window).scrollLeft();
                x = parseInt((xPos - xTranslate) / defScale - layer.width / 2);
                $(this).setLayer(layer, {
                    shadowColor: "#f00",
                    shadowX: "1",
                    shadowY: "-1"
                });
                selectedLayer = layer;
                return x;
            },
            updateDragY: function (layer, y) {
                let yPos = event.clientY - canvas.offset().top + $(window).scrollTop();
                y = parseInt((yPos - yTranslate) / defScale - layer.height / 2);
                $(this).setLayer(layer, {
                    shadowColor: "#f00",
                    shadowX: "1",
                    shadowY: "-1"
                });
                selectedLayer = layer;
                return y;
            }
        });
        canvas.clearCanvas().drawLayers();
    });

    // прилипание
    /**
    * Если выбираем прилипание, то отменяем перемещение товаров с помощью стрелочек
    **/
    $('#adhesion2').click(function () {
        if (adhesion) {
            $(this).css("color", "grey");
            adhesion = false;
        } else {
            $(this).css("color", "blue");
            adhesion = true;
            $('#pixelNav').css("color", "grey");
            pixelNav = false;
        }
    });
    // навигация стрелками
    /**
    * Если выбираем перемещение товаров с помощью стрелочек, то отменяем прилипание
    **/
    $('#pixelNav').click(function () {
        if (pixelNav) {
            $(this).css("color", "grey");
            pixelNav = false;
        } else {
            $(this).css("color", "blue");
            pixelNav = true;
            $('#adhesion2').css("color", "grey");
            adhesion = false;
        }
    });

    //стартовый масштаб
    $('#startScale').click(function () {
        let minTx = canvas_width / defScale - (140 + rack_width + 2 * rack_deep);
        let minTy = canvas_height / defScale - (40 + rack_height);
        let maxTx = 0;
        let maxTy = 0;

        scale = Math.min(canvas_width / (140 + rack_deep * 2 + rack_width), canvas_height / rack_height);
        xTranslate = -xTranslate;
        yTranslate = -yTranslate;
        canvas.translateCanvas({translateX: xTranslate, translateY: yTranslate});
        canvas.clearCanvas();
        canvas.drawLayers();
        canvas.restoreCanvas();
        canvas.scaleCanvas({scale: scale / defScale});
        defScale = scale;
        canvas.clearCanvas();
        canvas.drawLayers();
        canvas.restoreCanvas();

        if (xTranslate < minTx) {
            xTranslate = minTx;
        }
        if (xTranslate > maxTx) {
            xTranslate = maxTx;
        }
        if (yTranslate < minTy) {
            yTranslate = minTy;
        }
        if (yTranslate > maxTy) {
            yTranslate = maxTy;
        }

        canvas.translateCanvas({translateX: xTranslate, translateY: yTranslate});
        canvas.clearCanvas();
        canvas.drawLayers();
        canvas.restoreCanvas();
    });

    // выбрать сохраненную планограмму вызов попапа
    $('#savedPlanograms').click(function () {
        $('body').append("<div id='overlay'></div>");
        $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
        $('div#savedPlanogramsPopup').fadeIn(500);
        return false;
    });
    // Удаление сохранненой планограммы
    $('#delete_planogram').click(function () {
        let planogram_id = $('#selectPlanogam').val();
        if (planogram_id !== '') {
            $.ajax({
                type: 'post',
                url: address + 'planogram/planogram_delete/',
                data: {
                    'planogram_id': planogram_id,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                     $('#selectPlanogam option[value="' + planogram_id + '"]').remove();
                },
                error: function (xhr, status, error) {
                    alert(error);
                }
            });
        } else {
            alert("Планограмма не выбрана");
        }
    });
    // открыть сохраненную планограмму
    $('#openPlanogram').click(function () {
        let file = $('#selectPlanogam').val();
        if (file !== '') {

            $.ajax({
                type: "get",
                url: address + "planogram/planogram_select/",
                data: {
                    "planogram_id": file,
                    'csrfmiddlewaretoken': window.CSRF_TOKEN
                },
                success: function (data) {
                    pln = data['planogram'];
                    draw_pln(JSON.parse(pln));
                },
                error: function (xhr, status, error) {
                    alert(error);
                }
            });

            $(this).parent().parent().fadeOut(100);
            $('#overlay').remove('#overlay');
            $('#getProductInfo').empty();
        } else {
            console.log('no');
            alert("Планограмма не выбрана");
        }
    });

    // сохранить планограмму попап
    $('#savePlanogram').click(function () {
        $('body').append("<div id='overlay'></div>");
        $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
        $('div#savePlanogramPopup').fadeIn(500);
        return false;
    });
    // сохранить планограмму
    $('#savePlanogramAs').click(function () {
        let name = $('#savePlanogramPopup input').val();
        if (name === '') {
            name = "new";
        }
        console.log(name);

        let info = {
            rack: {
                fillStyle: rack_color,
                height: rack_height,
                width: rack_width,
                depth: rack_deep
            },
            shelf: {
                thickness: shelf_thickness,
                height: shelfs
            }
        };

        let hookLayer = canvas.getLayerGroup('hook');
        if (hookLayer !== undefined) {
            let hook = [];
            for (let i = 0; i < hookLayer.length; i++) {
                hook.push({
                    x: hookLayer[i].x, y: hookLayer[i].y,
                });
            }
            info.hook = hook;
        }

        let productLayer = canvas.getLayerGroup('products');
        if (productLayer !== undefined) {
            let product = [];
            for (let i = 0; i < productLayer.length; i++) {
                product.push({
                    source: productLayer[i].source,
                    x: productLayer[i].x, y: productLayer[i].y,
                    width: productLayer[i].width, height: productLayer[i].height,
                    data: productLayer[i].data
                });
            }
            info.product = product;
        }
        // отправляем данные о сохраняемой планограмме на сервер
        $.ajax({
            type: "post",
            url: address + "planogram/add_planogram/",
            data: {
                'title': name,
                'info': String(JSON.stringify(info)),
                'csrfmiddlewaretoken': window.CSRF_TOKEN
            },
            success: function () {
            },
            error: function (xhr, status, error) {
                alert('Такое имя планограммы уже есть');
            }
        });

        $(this).parent().fadeOut(100);
        $('#overlay').remove('#overlay');
        $('#getProductInfo').empty();
        // обновляем список сохраненных планограмм
        $.ajax({
            type: "get",
            url: address + "planogram/saved_planogram",
            data: {
                'csrfmiddlewaretoken': window.CSRF_TOKEN
            },
            success: function (data) {
                $('#planograms').empty().append(data.planograms_html);
            },
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    });

    // вызов попапа выгрузки планограммы
    $('#imageOutput').click(function () {
        $('body').append("<div id='overlay'></div>");
        $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
        $('div#imageOutputPopup').fadeIn(500);
        return false;
    });
    // сохранение макета
    $('#imageOutputBtn').click(function () {

        //возвращаю стартовый масштаб стелажа
        let startScale = Math.min(canvas_width / (140 + rack_deep * 2 + rack_width), canvas_height / (rack_height + 40));

        let rackH = rack_height + 40;
        let rackW = 140 + rack_deep * 2 + rack_width;

        let localScale = startScale / defScale;
        canvas.scaleCanvas({scale: localScale});
        canvas.clearCanvas();
        canvas.drawLayers();
        canvas.restoreCanvas();

        //создаю канвас, изображение с которого будет выгружаться
        let printCanvas = $(document.createElement('canvas')); //canvas.clone(false);

        //установка пропорций
        let pictureScale = 3; //увеличение картинки и сходного канваса
        let addWidth = rackW * 0.3;
        let addHeight = rackH * 0.3;
        let offsetForRight = rackW * 0.2;//сдвиг для правого стелажа
        printCanvas.attr("width", (rackW * 2 + offsetForRight + addWidth + 200) * pictureScale * startScale);
        printCanvas.attr("height", (rackH + addHeight) * startScale * pictureScale);
        let canvasWidth = rackW + offsetForRight;

        //копирование слоя стелажа
        let rackLayer = canvas.getLayerGroup('rack');
        if (rackLayer !== undefined) {
            for (let i = 0; i < rackLayer.length; i++) {
                // левый стелаж
                printCanvas.drawRect({
                    layer: true,
                    group: ['rack1'],
                    fillStyle: rackLayer[i].fillStyle,
                    strokeStyle: rackLayer[i].strokeStyle,
                    x: rackLayer[i].x, y: rackLayer[i].y,
                    width: rackLayer[i].width,
                    height: rackLayer[i].height,
                    fromCenter: false
                });
                // правый стелаж
                printCanvas.drawRect({
                    layer: true,
                    group: ['rack2'],
                    fillStyle: rackLayer[i].fillStyle,
                    strokeStyle: rackLayer[i].strokeStyle,
                    x: rackLayer[i].x + canvasWidth, y: rackLayer[i].y,
                    width: rackLayer[i].width,
                    height: rackLayer[i].height,
                    fromCenter: false
                });
            }
        }

        //копирование слоя полок
        let shelfLayer = canvas.getLayerGroup('shelf');
        if (shelfLayer !== undefined) {
            for (let i = 0; i < shelfLayer.length; i++) {
                // полки левого стелажа
                printCanvas.drawRect({
                    layer: true,
                    group: ['shelf1'],
                    fillStyle: shelfLayer[i].fillStyle,
                    strokeStyle: shelfLayer[i].strokeStyle,
                    x: shelfLayer[i].x, y: shelfLayer[i].y,
                    width: shelfLayer[i].width,
                    height: shelfLayer[i].height,
                    fromCenter: false
                });
                // полки правого стелажа
                printCanvas.drawRect({
                    layer: true,
                    group: ['shelf2'],
                    fillStyle: shelfLayer[i].fillStyle,
                    strokeStyle: shelfLayer[i].strokeStyle,
                    x: shelfLayer[i].x + canvasWidth, y: shelfLayer[i].y,
                    width: shelfLayer[i].width,
                    height: shelfLayer[i].height,
                    fromCenter: false
                });
            }
        }

        // шкала высоты полок
        if (shelfLayer !== undefined) {
            if (shelfLayer.length > 1) {
                // вертикальная черта для схемы (разметка)
                printCanvas.drawLine({
                    layer: true,
                    group: ['shelfHeight'],
                    strokeStyle: '#000',
                    strokeWidth: 1,
                    x1: shelfLayer[0].x + canvasWidth - 8,
                    y1: shelfLayer[0].y,
                    x2: shelfLayer[0].x + canvasWidth - 8,
                    y2: shelfLayer[shelfLayer.length - 1].y + shelf_thickness
                });
                // горизонтальные черточки
                for (let i = 0; i < shelfLayer.length; i++) {
                    printCanvas.drawLine({
                        layer: true,
                        group: ['shelfHeight'],
                        strokeStyle: '#000',
                        strokeWidth: 1,
                        x1: shelfLayer[0].x + canvasWidth - 10,
                        y1: shelfLayer[i].y + 0.5,
                        x2: shelfLayer[0].x + canvasWidth - 6,
                        y2: shelfLayer[i].y + 0.5
                    });
                    printCanvas.drawLine({
                        layer: true,
                        group: ['shelfHeight'],
                        strokeStyle: '#000',
                        strokeWidth: 1,
                        x1: shelfLayer[0].x + canvasWidth - 10,
                        y1: shelfLayer[i].y + shelf_thickness - 1 + 0.5,
                        x2: shelfLayer[0].x + canvasWidth - 6,
                        y2: shelfLayer[i].y + shelf_thickness - 1 + 0.5
                    });
                }

            }
        }

        //вывод картинки продукта
        let products = canvas.getLayerGroup('products');
        if (products !== undefined) {
            for (let i = 0; i < products.length; i++) {
                printCanvas.drawImage({
                    layer: true,
                    groups: ['products2'],
                    source: products[i].data['image'],
                    x: products[i].x, y: products[i].y,
                    width: products[i].data['width'], height: products[i].data['height'],
                    fromCenter: false
                });
                // на схеме
                printCanvas.drawRect({
                    layer: true,
                    groups: ['textrect'],
                    strokeStyle: '#444',
                    fillStyle: '#ddd',
                    strokeWidth: products[i].width / 90,
                    x: products[i].x + canvasWidth, y: products[i].y,
                    width: products[i].width,
                    height: products[i].height,
                    fromCenter: false
                });
            }
        }

        //крючки
        let hooksLayerLeft = canvas.getLayerGroup('hook');
        if (hooksLayerLeft !== undefined) {
            for (let i = 0; i < hooksLayerLeft.length; i++) {
                printCanvas.drawImage({
                    layer: true,
                    groups: ['hook1'],
                    source: '/media/home/hook.png',
                    x: hooksLayerLeft[i].x, y: hooksLayerLeft[i].y,
                    width: hooksLayerLeft[i].width, height: hooksLayerLeft[i].height,
                    fromCenter: false
                });
            }
        }

        // смещение стелажа
        printCanvas.setLayers({
            translateX: addWidth / 2,
            translateY: addHeight / 2
        });

        //рисую фон
        let linear = $('canvas').createGradient({
            x1: 0, y1: rackH + addHeight / 2 - rackH / 10 - 20,
            x2: 0, y2: rackH + addHeight,
            c1: '#555',
            c2: '#fff',

        });

        printCanvas.drawRect({
            layer: true,
            groups: ['bg'],
            fillStyle: linear,
            x: 0, y: rackH + addHeight / 2 - rackH / 10 - 20,
            width: printCanvas.attr('width') / startScale,
            height: printCanvas.attr('height') / startScale,
            index: 0,
            fromCenter: false
        });

        printCanvas.drawRect({
            layer: true,
            groups: ['bg'],
            fillStyle: '#fff',
            x: 0, y: 0,
            width: printCanvas.attr('width') / startScale,
            height: rackH + addHeight / 2 - rackH / 20,
            index: 0,
            fromCenter: false
        });

        //увеличиваю изображение канваса
        printCanvas.scaleCanvas({scale: startScale * pictureScale}); //image_scale*3
        printCanvas.clearCanvas();
        printCanvas.drawLayers();
        printCanvas.restoreCanvas();

        //получение картинки с канваса
        $('#img').append(printCanvas);
        printCanvas.attr('id', 'printcanvas');
        let cnv = document.getElementById('printcanvas');
        //прячу второй канвас
        cnv.style.display = "none";

        //вывод текст
        context = cnv.getContext("2d");
        context.textBaseline = "top";
        context.fillStyle = "#444";
        context.textAlign = "center";
        let font = "Arial";
        let legendCount = 0;
        let legentMarginLeft = canvasWidth * 2 + addWidth / 2 - offsetForRight;
        let legentMarginTop = 10;
        if (products !== undefined) {
            for (let i = 0; i < products.length; i++) {

                let width = products[i].width;
                let height = products[i].height;
                let x = products[i].x;
                let y = products[i].y;

                let title = products[i].data['title'];
                let vendor_code = products[i].data['vendor_code'];
                let count = "ПО " + products[i].data['count'] + " ШТ.";

                context.textBaseline = "top";

                //размеры шрифтов
                let vendorFontSize = 3;
                let countFontSize = 2;
                let titleFontSize = 2;

                let maxWidth = width - 1;

                let marginLeft = x + canvasWidth + addWidth / 2 + width / 2 + 1 / 2;
                let marginTop = y + addHeight / 2 + 1 / 2;

                while (context.measureText(vendor_code).width > width && vendorFontSize !== 2) {
                    vendorFontSize -= 1;
                }

                let words = title.split(" ");
                let countWords = words.length;
                let line = "";
                let titleText = [];
                for (let n = 0; n < countWords; n++) {
                    let testLine = line + words[n] + " ";
                    let testWidth = context.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                        titleText.push(line);
                        line = words[n] + " ";
                    }
                    else {
                        line = testLine;
                    }
                }
                titleText.push(line);
                if ((vendorFontSize + titleFontSize * titleText.length + countFontSize) * 1.2 + 2 <= height) {
                    context.textAlign = "center";
                    // пишем артикул
                    context.font = vendorFontSize + "px " + font;
                    context.fillText(vendor_code, marginLeft, marginTop, maxWidth);
                    marginTop += vendorFontSize * 1.2;
                    // пишем наименование
                    context.font = titleFontSize + "px " + font;
                    for (let n = 0; n < titleText.length; n++) {
                        context.fillText(titleText[n], marginLeft, marginTop, maxWidth);
                        marginTop += 2 * 1.2;
                    }
                    // пишем количество
                    context.font = countFontSize + "px " + font;
                    context.fillText(count, marginLeft, marginTop, maxWidth);
                } else {
                    legendCount++;
                    // пишем номер ссылки на легенду
                    context.textAlign = "center";
                    context.font = "5px " + font;
                    context.fillText(legendCount.toString(), marginLeft, marginTop, maxWidth);
                    marginTop += 5;
                    context.font = "2px " + font;
                    context.fillText(count, marginLeft, marginTop, maxWidth);
                    // пишем в легенду
                    context.textAlign = "left";
                    context.font = "3px " + font;
                    context.fillText(legendCount.toString(), legentMarginLeft, legentMarginTop, 20);
                    context.fillText(vendor_code, legentMarginLeft + 10, legentMarginTop, 190);
                    legentMarginTop += 3 * 1.2;
                    line = "";
                    titleText = [];
                    for (let n = 0; n < countWords; n++) {
                        let testLine = line + words[n] + " ";
                        let testWidth = context.measureText(testLine).width;
                        if (testWidth > 190) {
                            titleText.push(line);
                            line = words[n] + " ";
                        }
                        else {
                            line = testLine;
                        }
                    }
                    titleText.push(line);
                    for (let n = 0; n < titleText.length; n++) {
                        context.fillText(titleText[n], legentMarginLeft + 10, legentMarginTop, 190);
                        legentMarginTop += 3 * 1.2;
                    }
                }
            }
        } else {
            console.log("Oblom");
        }

        // пишется высота
        context.textBaseline = "top";
        context.fillStyle = "#000";
        context.textAlign = "left";
        context.font = '5px ' + font;
        if (shelfLayer !== undefined) {
            if (shelfLayer.length > 1) {
                // циферки
                for (let i = 0; i < shelfLayer.length - 1; i++) {
                    let heightY = shelfLayer[i + 1].y - shelfLayer[i].y - shelf_thickness;

                    let heightYText = heightY.toString() + ' см';
                    console.log(heightYText + ' высота полки');
                    context.fillText(heightYText,
                        shelfLayer[0].x + canvasWidth - 25 + addWidth / 2,
                        heightY / 2 + shelfLayer[i].y + addHeight / 2,
                        30);
                }
            }
        }
        let imgName = $('#imageOutputPopup input').val();
        context.font = '10px ' + font;
        context.fillText(imgName, 20, 10, legentMarginLeft - 40);


        //выгрузка изображения
        cnv.toBlob(function (blob) {
            var newImg = document.createElement('img'),
                url = URL.createObjectURL(blob);

            newImg.onload = function () {
                // no longer need to read the blob so it's revoked
                URL.revokeObjectURL(url);
            };
            save(url);
        });
        printCanvas.removeLayers();
        printCanvas.clearCanvas();
        $('#img').empty();

        $(this).parent().fadeOut(100);
        $('#overlay').remove('#overlay');
        return 0;
    });

    // изменение количества товара
    $('button#setProductInfo').click(function () {
        let newCount = $('#refreshCount').val();
        canvas.setLayer(lastSelectedLayer, {
            data: {
                image: lastSelectedLayer.data['image'],
                title: lastSelectedLayer.data['title'],
                vendor_code: lastSelectedLayer.data['vendor_code'],
                category: lastSelectedLayer.data['category'],
                width: lastSelectedLayer.data['width'],
                height: lastSelectedLayer.data['height'],
                depth: lastSelectedLayer.data['depth'],
                count: newCount
            }
        });

        $(this).parent().fadeOut(100);
        $('#overlay').remove('#overlay');
        $('#getProductInfo').empty();
    });
});

// сохранение изображения
function save(url) {
    // если имя не задано, задается стандартное
    let imgName = $('#imageOutputPopup input').val();
    $('#imageOutputPopup input').val('');
    if (!imgName) {
        imgName = 'image.png';
    } else {
        imgName = imgName.replace(' ', '_') + '.png';
    }
    var a = document.createElement('a');
    a.href = url;
    a.download = imgName;
    a.click();
}

// поиск ближайшей полки для прилипания
function productYPosition(x, y, h, shelfs) {
    return shelfs[indexOfNearestShelf(distanses(y, shelfs))] - h - shelf_thickness;
}

// поиск индекса ближайшей полки для прилипания
function indexOfNearestShelf(arr) {
    let min = arr[0];
    let minIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }
    return minIndex;
}

// поиск расстояния от координаты до полки
function distanses(y, shelfs) {
    let dist = [];
    for (let i = 0; i < shelfs.length; i++) {
        dist[i] = Math.abs(y - shelfs[i]);
    }
    return dist;
}


// добавление продукта на макет
function addProduct(prd) {
    var prd = $(prd);
    var category = prd.children('.category');
    var size = prd.children('.size');
    selectedObject = {
        image: prd.children('img').attr('src'),
        title: prd.children('.title').html(),
        vendor_code: prd.children('.vendor_code').html(),
        category: prd.children('.category').html(),
        width: prd.children('.size').html().split('x')[0],
        height: prd.children('.size').html().split('x')[1],
        depth: prd.children('.size').html().split('x')[2]
    };
    $('div.popup').fadeOut(100);
    $('#overlay').remove('#overlay');
    canvas.drawImage({
        draggable: true,
        layer: true,
        groups: ['products'],
        source: selectedObject.image,
        x: 50 - xTranslate, y: 50 - yTranslate,
        width: selectedObject.width, height: selectedObject.height,
        fromCenter: false,
        data: {
            image: selectedObject.image,
            title: selectedObject.title,
            vendor_code: selectedObject.vendor_code,
            category: selectedObject.category,
            width: selectedObject.width,
            height: selectedObject.height,
            depth: selectedObject.depth,
            count: parseInt(rack_deep / selectedObject.depth)
        },
        cursors: {
            mouseover: 'pointer',
            mousedown: 'move',
            mouseup: 'pointer'
        },
        mousedown: function (layer) {
            if (selectedLayer === {}) {
                $(this).setLayer(layer, {
                    shadowColor: "#f00",
                    shadowX: "1",
                    shadowY: "-1"
                });
                selectedLayer = layer;
                lastSelectedLayer = layer;

            } else if (layer === selectedLayer) {
                $(this).setLayer(layer, {
                    shadowColor: "#fff",
                    shadowX: "0",
                    shadowY: "0"
                });
                selectedLayer = {};
            } else {
                $(this).setLayer(selectedLayer, {
                    shadowColor: "#fff",
                    shadowX: "0",
                    shadowY: "0"
                });
                $(this).setLayer(layer, {
                    shadowColor: "#f00",
                    shadowX: "1",
                    shadowY: "-1"
                });
                selectedLayer = layer;
                lastSelectedLayer = layer;
            }
        },
        dblclick: function (layer) {
            $('body').append("<div id='overlay'></div>");
            $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
            $('#getProductInfo').append('<form><label for="refreshCount">Количество: </label><input type="text" id="refreshCount" placeholder="' + lastSelectedLayer.data['count'] + '">');
            $('#getProductInfo').append('</form>');
            $('#changeProductInfo').fadeIn(500);
            console.log(lastSelectedLayer);
        },
        mouseover: function (layer) {
            $('#productInfo').append('<p>Наименование: ' + layer.data['title'] + '</p>');
            $('#productInfo').append('<p>Артикул:' + layer.data['vendor_code'] + '</p>');
            $('#productInfo').append('<p>Категория:' + layer.data['category'] + '</p>');
            $('#productInfo').append('<p>Размеры:' + layer.data['width'] + '*' + layer.data['height'] + '*' + layer.data['depth'] + '</p>');
            $('#productInfo').append('<p>Количество:' + layer.data['count'] + '</p>');
        },
        mouseout: function (layer) {
            $('#productInfo').empty();
        },
        updateDragX: function (layer, x) {
            let xPos = event.clientX - canvas.offset().left + $(window).scrollLeft();
            x = parseInt((xPos - xTranslate) / defScale - layer.width / 2);
            $(this).setLayer(layer, {
                shadowColor: "#f00",
                shadowX: "1",
                shadowY: "-1"
            });
            selectedLayer = layer;
            return x;
        },
        updateDragY: function (layer, y) {
            let yPos = event.clientY - canvas.offset().top + $(window).scrollTop();
            y = parseInt((yPos - yTranslate) / defScale - layer.height / 2);
            if (adhesion) {
                if ((layer.x >= 70 + rack_deep) && (layer.x <= 70 + rack_deep + rack_width - layer.width) && shelfs.length) {
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return productYPosition(layer.x, y, layer.height, shelfs);
                }
            }
            $(this).setLayer(layer, {
                shadowColor: "#f00",
                shadowX: "1",
                shadowY: "-1"
            });
            selectedLayer = layer;
            return y;
        }
    });
    canvas.clearCanvas().drawLayers();
}


// удаление поля для ввода высоты полки
function deleteShelf(shlf) {
    $(shlf).parent().remove();
}

// функция рисования сохранненого планограмма
function draw_pln(pln) {
    if (pln['rack'] !== undefined) {

        // рисуем стелаж
        rack_color = pln['rack'].fillStyle;
        $('#rack_color').val(rack_color);
        rack_height = pln['rack'].height;
        $('#rack_height').val(rack_height);
        rack_width = pln['rack'].width;
        $('#rack_width').val(rack_width);
        rack_deep = pln['rack'].depth;
        $('#rack_deep').val(rack_deep);


        canvas.removeLayers();
        canvas.clearCanvas();

        scale = Math.min(canvas_width / (140 + rack_deep * 2 + rack_width), canvas_height / rack_height);
        canvas.scaleCanvas({scale: scale / defScale});
        canvas.translateCanvas({translateX: -xTranslate, translateY: -yTranslate});
        defScale = scale;
        xTranslate = 0;
        yTranslate = 0;

        // рисуем стелаж
        canvas.drawRect({
            layer: true,
            groups: ['rack'],
            name: 'leftSide',
            fillStyle: rack_color,
            x: 20, y: 20,
            width: rack_deep, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            name: 'frontSide',
            fillStyle: rack_color,
            x: 70 + rack_deep, y: 20,
            width: rack_width, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            name: 'rightSide',
            fillStyle: rack_color,
            x: 120 + rack_deep + rack_width, y: 20,
            width: rack_deep, height: rack_height,
            fromCenter: false,
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 20, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 18 + rack_deep, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 70 + rack_deep, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 68 + rack_deep + rack_width, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 120 + rack_deep + rack_width, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 118 + 2 * rack_deep + rack_width, y: 20,
            width: 2, height: rack_height,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 20, y: rack_height + 18,
            width: rack_deep, height: 2,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 70 + rack_deep, y: rack_height + 18,
            width: rack_width, height: 2,
            fromCenter: false
        }).drawRect({
            layer: true,
            groups: ['rack'],
            fillStyle: '#666666',
            x: 120 + rack_deep + rack_width, y: rack_height + 18,
            width: rack_deep, height: 2,
            fromCenter: false
        });
    }
    $('#rack_shelfs').empty();
    if (pln['shelf'] !== undefined) {
        // рисуем полки
        shelf_thickness = pln['shelf'].thickness;
        $('#shelf_thickness').val(shelf_thickness);
        shelfs = pln['shelf'].height;
        for (let i = 0; i < shelfs.length; i++) {
            let shelf_height = 20 + rack_height - shelfs[i];
            $('#rack_shelfs').append('<span><input id="shelf" type="number" value="' + shelf_height + '"><a href="javascript:void(0);" onclick="deleteShelf(this)"><img src="/static/admin/img/icon-deletelink.svg" alt="Удалить"></a></span>');
            canvas.drawRect({
                layer: true,
                groups: ['shelf'],
                fillStyle: '#666666',
                x: 70 + rack_deep, y: shelfs[i] - shelf_thickness,
                width: rack_width, height: shelf_thickness,
                fromCenter: false
            });
        }
    }

    if (pln['hook'] !== undefined) {
        for (let i = 0; i < pln['hook'].length; i++) {
            canvas.drawImage({
                draggable: true,
                layer: true,
                groups: ['hook'],
                source: '/media/home/hook.png',
                x: pln['hook'][i].x, y: pln['hook'][i].y,
                width: 5, height: 5,
                fromCenter: false,
                cursors: {
                    mouseover: 'pointer',
                    mousedown: 'move',
                    mouseup: 'pointer'
                },
                mousedown: function (layer) {
                    if (selectedLayer === {}) {
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                    } else if (layer === selectedLayer) {
                        $(this).setLayer(layer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        selectedLayer = {};
                    } else {
                        $(this).setLayer(selectedLayer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                    }
                },
                updateDragX: function (layer, x) {
                    let xPos = event.clientX - canvas.offset().left + $(window).scrollLeft();
                    x = parseInt((xPos - xTranslate) / defScale - layer.width / 2);
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return x;
                },
                updateDragY: function (layer, y) {
                    let yPos = event.clientY - canvas.offset().top + $(window).scrollTop();
                    y = parseInt((yPos - yTranslate) / defScale - layer.height / 2);
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return y;
                }
            });
        }
    }

    if (pln['product'] !== undefined) {
        for (let i = 0; i < pln['product'].length; i++) {
            selectedObject = pln['product'][i].data;
            canvas.drawImage({
                draggable: true,
                layer: true,
                groups: ['products'],
                source: selectedObject.image,
                x: pln['product'][i].x, y: pln['product'][i].y,
                width: selectedObject.width, height: selectedObject.height,
                fromCenter: false,
                data: {
                    image: selectedObject.image,
                    title: selectedObject.title,
                    vendor_code: selectedObject.vendor_code,
                    category: selectedObject.category,
                    width: selectedObject.width,
                    height: selectedObject.height,
                    depth: selectedObject.depth,
                    count: selectedObject.count
                },
                cursors: {
                    mouseover: 'pointer',
                    mousedown: 'move',
                    mouseup: 'pointer'
                },
                mousedown: function (layer) {
                    if (selectedLayer === {}) {
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                        lastSelectedLayer = layer;

                    } else if (layer === selectedLayer) {
                        $(this).setLayer(layer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        selectedLayer = {};
                    } else {
                        $(this).setLayer(selectedLayer, {
                            shadowColor: "#fff",
                            shadowX: "0",
                            shadowY: "0"
                        });
                        $(this).setLayer(layer, {
                            shadowColor: "#f00",
                            shadowX: "1",
                            shadowY: "-1"
                        });
                        selectedLayer = layer;
                        lastSelectedLayer = layer;
                    }
                },
                dblclick: function (layer) {
                    $('body').append("<div id='overlay'></div>");
                    $('#overlay').show().css({'filter': 'alpha(opacity=80)'});
                    $('#getProductInfo').append('<form><label for="refreshCount">Количество: </label><input type="text" id="refreshCount" placeholder="' + lastSelectedLayer.data['count'] + '">');
                    $('#getProductInfo').append('</form>');
                    $('#changeProductInfo').fadeIn(500);
                    console.log(lastSelectedLayer);
                },
                mouseover: function (layer) {
                    $('#productInfo').append('<p>Наименование: ' + layer.data['title'] + '</p>');
                    $('#productInfo').append('<p>Артикул:' + layer.data['vendor_code'] + '</p>');
                    $('#productInfo').append('<p>Категория:' + layer.data['category'] + '</p>');
                    $('#productInfo').append('<p>Размеры:' + layer.data['width'] + '*' + layer.data['height'] + '*' + layer.data['depth'] + '</p>');
                    $('#productInfo').append('<p>Количество:' + layer.data['count'] + '</p>');
                },
                mouseout: function (layer) {
                    $('#productInfo').empty();
                },
                updateDragX: function (layer, x) {
                    let xPos = event.clientX - canvas.offset().left + $(window).scrollLeft();
                    x = parseInt((xPos - xTranslate) / defScale - layer.width / 2);
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return x;
                },
                updateDragY: function (layer, y) {
                    let yPos = event.clientY - canvas.offset().top + $(window).scrollTop();
                    y = parseInt((yPos - yTranslate) / defScale - layer.height / 2);
                    if (adhesion) {
                        if ((layer.x >= 70 + rack_deep) && (layer.x <= 70 + rack_deep + rack_width - layer.width) && shelfs.length) {
                            $(this).setLayer(layer, {
                                shadowColor: "#f00",
                                shadowX: "1",
                                shadowY: "-1"
                            });
                            selectedLayer = layer;
                            return productYPosition(layer.x, y, layer.height, shelfs);
                        }
                    }
                    $(this).setLayer(layer, {
                        shadowColor: "#f00",
                        shadowX: "1",
                        shadowY: "-1"
                    });
                    selectedLayer = layer;
                    return y;
                }
            });
        }
    }

    console.log(pln);
    canvas.clearCanvas();
    canvas.drawLayers();
    canvas.restoreCanvas();
}


$(document).keypress(function(e) {
    if(e.which == 13) {
        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
        alert('ok');
    }
});
