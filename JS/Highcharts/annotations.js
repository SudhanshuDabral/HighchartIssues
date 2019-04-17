//var template = "<div id='divSlope' class='keep_only_btn_main_Annotation' ><div class='keep_only_btn_parent_DCA'><div class='col-md-3'><div class='col-md-1 radio radio-primary radio-inline'><input type='radio'  id='annotation1' name='slope' checked='checked' value='Custom'/>  <label for='annotation1'>Custom</label> </div><div class='clearfix'></div></div><div class='col-md-3'><div class='col-md-1 radio radio-primary radio-inline'><input type='radio' id='annotation2' name='slope' value='One'/> <label for='annotation2'>1.00</label></div> <div class='clearfix'></div></div><div class='col-md-3'><div class='col-md-1 radio radio-primary radio-inline'><input type='radio' id='annotation3'  name='slope' value='SemiSlope'/><label for='annotation3'>.50</label></div> <div class='clearfix'></div></div><div class='col-md-3'><div class='col-md-1 radio radio-primary radio-inline'><input type='radio' id='annotation4' name='slope' value='slope'/><label for='annotation4'>.25</label></div> <div class='clearfix'></div></div><div class='clearfix'></div></div></div>";
var template = "<div id='divSlope' class='keep_only_btn_main_Annotation' ><div class='keep_only_btn_parent_DCA'><div class='col-md-12'><span id='spnSlope'></span></div></div></div>";

var editBoxHTML = [
        '<div class="hc-editbox modal-content">',
            '<div class="hc-editbox-content">',
                '<div class="hc-editbox-item">',
                    '<select class="hc-fontsize form-control">',
                        '<option value="12">12px</option>',
                        '<option value="15">15px</option>',
                        '<option value="16">16px</option>',
                    '</select>',
                '</div>',
                '<div class="hc-editbox-item">',
                    '<button type="button" class="hc-bold btn btn-default">B</button>',
                '<div class="hc-editbox-item">',
                    '<button type="button" class="hc-italic btn btn-default">I</button>',
                '</div>',
                '<div class="hc-editbox-item">',
                    '<input type="text" class="hc-font-color color" value="#ffffff"/>',
                '</div>',
                '<div class="hc-editbox-item">',
                    '<button type="button" class="hc-accept btn btn-primary">Apply</button>',
                '</div>',
            '</div>',
        '</div>'
].join('');

var isSlopeActive = false;
var rotateCursor = "url(images/rotation_cursor.png), pointer";
var selectCursor = "url(images/selection_cursor.png), pointer";
var WellMBEPlotArray = [];

(function (Highcharts) {

    var UNDEFINED,
			ALIGN_FACTOR,
			H = Highcharts,
			Chart = H.Chart,
			extend = H.extend,
			merge = H.merge,
			each = H.each,
            pick = H.pick;

    H.ALLOWED_SHAPES = ["path", "rect", "circle"];


    ALIGN_FACTOR = {
        top: 0,
        left: 0,
        center: 0.5,
        middle: 0.5,
        bottom: 1,
        right: 1
    };


    H.SVGRenderer.prototype.symbols.line = function (x, y, w, h) {
        var p = 2;
        return [
			'M', x + p, y + p, 'L', x + w - p, y + h - p
        ];
    };
    // VML fallback
    if (H.VMLRenderer) {
        H.VMLRenderer.prototype.symbols.line = H.SVGRenderer.prototype.symbols.line;
    }

    H.SVGRenderer.prototype.symbols.text = function (x, y, w, h) {
        var p = 1;
        return [
		  //'M', 0, 0, 'L', 10, 0, 'M', 5, 0, 'L', 5, 5
			'M', x, y + p, 'L', x + w, y + p,
			'M', x + w / 2, y + p, 'L', x + w / 2, y + p + h
        ];
    };
    // VML fallback
    if (H.VMLRenderer) {
        H.VMLRenderer.prototype.symbols.text = H.SVGRenderer.prototype.symbols.text;
    }


    // when drawing annotation, don't zoom/select place
    H.wrap(H.Pointer.prototype, 'drag', function (c, e) {
        if (!this.chart.annotations || this.chart.annotations.allowZoom) {
            c.call(this, e);
        }
    });

    // deselect active annotation
    H.wrap(H.Pointer.prototype, 'onContainerMouseDown', function (c, e) {
        var $target = $(e.target);
        c.call(this, e);

        if (this.chart.selectedAnnotation && !$target.hasClass('hc-editbox') && !$target.parents('.hc-editbox').length) {
            this.chart.selectedAnnotation.events.deselect.call(this.chart.selectedAnnotation, e);
        }
    });



    // Highcharts helper methods
    var inArray = Highcharts.inArray,
			addEvent = H.addEvent,
			isOldIE = H.VMLRenderer ? true : false;

    // utils for buttons   
    var utils = {
        getRadius: function (e) {
            var ann = this,
				chart = ann.chart,
				bbox = chart.container.getBoundingClientRect(),
				x = e.clientX - bbox.left,
				y = e.clientY - bbox.top,
				xAxis = chart.xAxis[ann.options.xAxis],
				yAxis = chart.yAxis[ann.options.yAxis],
				dx = Math.abs(x - xAxis.toPixels(ann.options.xValue)),
				dy = Math.abs(y - yAxis.toPixels(ann.options.yValue));
            radius = parseInt(Math.sqrt(dx * dx + dy * dy), 10);
            ann.shape.attr({
                r: radius
            });
            return radius;
        },
        getRadiusAndUpdate: function (e) {
            var r = utils.getRadius.call(this, e);
            this.update({
                shape: {
                    params: {
                        r: r,
                        x: -r,
                        y: -r
                    }
                }
            });
        },
        getPath: function (e) {
            // self.setState(2);
            //   var isSlope = $('input[name=slope]:checked').val();
            var path = [];
            //  if (isSlope == "Custom") {
            var ann = this,
                chart = ann.chart,
                bbox = chart.container.getBoundingClientRect(),
                x = e.clientX - bbox.left,
                y = e.clientY - bbox.top,
                plotType = ann.chart.options.chart.plotType,
                xAxis = chart.xAxis[ann.options.xAxis],
                yAxis = chart.yAxis[ann.options.yAxis],
                dx = x - xAxis.toPixels(ann.options.xValue),
                dy = y - yAxis.toPixels(ann.options.yValue);

            // if (chart.options.annotations.length == 0) {
            path = ["M", 0, 0, 'L', parseInt(dx, 10), parseInt(dy, 10)];
            ann.shape.attr({
                d: path
            });
            ann.options.shape.params.d = path;
            ann.renderRotateAndTranslatePoints();
            //   }
            //} else {

            //    switch (isSlope) {
            //        case "One":
            //            path = ["M", 0, 100, 'L', 100, 0];

            //            break;
            //        case "SemiSlope":
            //            path = ["M", 0, 100, 'L', 50, 0];

            //            break;
            //        case "slope":
            //            path = ["M", 0, 100, 'L', 25, 0];

            //            break;
            //    }

            //}

            return path;
        },
        getPathAndUpdate: function (e) {
            var ann = this,
				chart = ann.chart,
				path = utils.getPath.call(ann, e),
				xAxis = chart.xAxis[ann.options.xAxis],
				yAxis = chart.yAxis[ann.options.yAxis],
                plotType = ann.chart.options.chart.plotType,
				x = xAxis.toValue(path[4] + xAxis.toPixels(ann.options.xValue)),
				y = yAxis.toValue(path[5] + yAxis.toPixels(ann.options.yValue));

            this.update({
                xValueEnd: x,
                yValueEnd: y,
                shape: {
                    params: {
                        d: path
                    }
                }
            });
        },
        getRect: function (e) {
            var ann = this,
				chart = ann.chart,
				bbox = chart.container.getBoundingClientRect(),
				x = e.clientX - bbox.left,
				y = e.clientY - bbox.top,
				xAxis = chart.xAxis[ann.options.xAxis],
				yAxis = chart.yAxis[ann.options.yAxis],
				sx = xAxis.toPixels(ann.options.xValue),
				sy = yAxis.toPixels(ann.options.yValue),
				dx = x - sx,
				dy = y - sy,
				w = Math.round(dx) + 1,
				h = Math.round(dy) + 1,
				ret = {};

            ret.x = w < 0 ? w : 0;
            ret.width = Math.abs(w);
            ret.y = h < 0 ? h : 0;
            ret.height = Math.abs(h);

            ann.shape.attr({
                x: ret.x,
                y: ret.y,
                width: ret.width,
                height: ret.height
            });
            return ret;
        },
        getRectAndUpdate: function (e) {
            var rect = utils.getRect.call(this, e);
            this.update({
                shape: {
                    params: rect
                }
            });
        },
        getText: function (e) {
            // do nothing
        },
        showInput: function (e) {
            var ann = this,
                    chart = ann.chart,
                    index = chart.annotationInputIndex = chart.annotationInputIndex ? chart.annotationInputIndex : 1,
                    input = document.createElement('span'),
                    button;

            if (chart.mouseDownY > 70) {
                input.innerHTML = '<input type="text" style="z-index: 999999" class="annotation-' + index + '" placeholder="Add text"><button class=""> Done </button>';
                input.style.position = 'absolute';
                input.style.left = e.pageX + 'px';
                input.style.top = e.pageY + 'px';
                input.style.zIndex = '1050';

                document.body.appendChild(input);
                input.querySelectorAll("input")[0].focus();
                button = input.querySelectorAll("button")[0];
                button.onclick = function () {
                    var parent = this.parentNode;

                    ann.update({
                        title: {
                            style: {
                                'font-weight': 'normal',
                                'font-style': 'normal',
                                'font-size': '12px',
                                'color': '#000000'
                            },
                            'y': 12,
                            text: parent.querySelectorAll('input')[0].value
                        }
                    });
                    parent.parentNode.removeChild(parent);
                };
                chart.annotationInputIndex++;
            }
        }
    }

    function defaultOptions(shapeType) {
        var shapeOptions,
			options;

        options = {
            xAxis: 0,
            yAxis: 0,
            shape: {
                params: {
                    stroke: "#000000",
                    fill: "rgba(0,0,0,0)",
                    'stroke-width': 4
                }
            }
        };

        shapeOptions = {
            circle: {
                params: {
                    x: 0,
                    y: 0
                }
            }
        };

        if (shapeOptions[shapeType]) {
            options.shape = merge(options.shape, shapeOptions[shapeType]);
        }

        return options;
    }


    function defatultMainOptions() {
        var buttons = [],
			shapes = ['circle', 'line', 'square', 'text'],
			types = ['circle', 'path', 'rect', null],
			params = [{
			    r: 0,
			    fill: 'rgba(255,0,0,0.4)',
			    stroke: 'black'
			}, {
			    d: ['M', 0, 0, 'L', 10, 10],
			    fill: 'rgba(255,0,0,0.4)',
			    stroke: 'black',
			    cursor: selectCursor
			}, {
			    width: 10,
			    height: 10,
			    fill: 'rgba(255,0,0,0.4)',
			    stroke: 'black'
			}],
			steps = [utils.getRadius, utils.getPath, utils.getRect, utils.getText],
			stops = [utils.getRadiusAndUpdate, utils.getPathAndUpdate, utils.getRectAndUpdate, utils.showInput];

        each(shapes, function (s, i) {
            buttons.push({
                annotationEvents: {
                    step: steps[i],
                    stop: stops[i]
                },
                annotation: {
                    anchorX: 'left',
                    anchorY: 'top',
                    xAxis: 0,
                    yAxis: 0,
                    shape: {
                        type: types[i],
                        params: params[i]
                    }
                },
                symbol: {
                    shape: s,
                    size: 12,
                    style: {
                        'stroke-width': 2,
                        'stroke': 'black',
                        fill: 'red',
                        zIndex: 121
                    }
                },
                style: {
                    fill: 'black',
                    stroke: 'blue',
                    strokeWidth: 2
                },
                size: 12,
                states: {
                    selected: {
                        fill: '#9BD'
                    },
                    hover: {
                        fill: '#9BD'
                    }
                }
            });
        });

        return {
            enabledButtons: true,
            buttons: buttons,
            buttonsOffsets: [0, 0]
        };
    }

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function isNumber(n) {
        return typeof n === 'number';
    }

    function defined(obj) {
        return obj !== UNDEFINED && obj !== null;
    }

    function translatePath(d, xAxis, yAxis, xOffset, yOffset) {
        var len = d.length,
				i = 0,
				path = [];

        while (i < len) {
            if (typeof d[i] === 'number' && typeof d[i + 1] === 'number') {
                path[i] = xAxis.toPixels(d[i]) - xOffset;
                path[i + 1] = yAxis.toPixels(d[i + 1]) - yOffset;
                i += 2;
            } else {
                path[i] = d[i];
                i += 1;
            }
        }

        return path;
    }

    function createGroup(chart, i, clipPath) {
        var group = chart.renderer.g("annotations-group-" + i);
        group.attr({
            zIndex: 7
        });
        group.add();
        group.clip(clipPath);
        return group;
    }

    function createClipPath(chart, y) {
        var clipBox = {
            x: y.left,
            y: y.top,
            width: y.width,
            height: y.height
        };

        return chart.renderer.clipRect(clipBox);
    }

    function attachEvents(chart) {
        function drag(e) {
            var bbox = chart.container.getBoundingClientRect(),
					clickX = e.clientX - bbox.left,
					clickY = e.clientY - bbox.top;

            if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop) || chart.annotations.allowZoom) {
                return;
            }

            var xAxis = chart.xAxis[0],
				yAxis = chart.yAxis[0],
				selected = chart.annotations.selected;

            var options = merge(chart.annotations.options.buttons[selected].annotation, {
                xValue: xAxis.toValue(clickX),
                yValue: yAxis.toValue(clickY),
                allowDragX: true,
                allowDragY: true,
                events: {
                    dblclick: function (e) {
                        this.destroy(); //destroy annotation
                        // alert("Its xValue " + xAxis.toValue(clickX) + " and Yvalue " + yAxis.toValue(clickY));
                    },
                    mousedown: function (e) {
                        this.renderRotateAndTranslatePoints();
                    }
                }
            });

            chart.addAnnotation(options);

            chart.drawAnnotation = chart.annotations.allItems[chart.annotations.allItems.length - 1];
            Highcharts.addEvent(document, 'mousemove', step);
        }

        function step(e) {
            var selected = chart.annotations.selected;
            chart.annotations.options.buttons[selected].annotationEvents.step.call(chart.drawAnnotation, e);
        }

        function drop(e) {
            Highcharts.removeEvent(document, 'mousemove', step);

            // store annotation details
            if (chart.drawAnnotation) {
                var selected = chart.annotations.selected,
                    buttons = chart.exportSVGElements,
                    btnLen = buttons.length,
                    button = buttons[btnLen - 2],
                    otherButton = buttons[btnLen - 4];

                chart.annotations.options.buttons[selected].annotationEvents.stop.call(chart.drawAnnotation, e);
                chart.annotations.buttons[selected][0].setState(0);
                if (chart['cache-annotations-menu']) {
                    chart.setStateCB.call(button, 0);
                }
                chart.annotations.allowZoom = true;
                $($('#' + chart.renderTo.id)[0].parentNode).find('#divSlope').remove();
            }
            chart.drawAnnotation = null;
        }
        Highcharts.addEvent(chart.container, 'mousedown', drag);
        Highcharts.addEvent(document, 'mouseup', drop);
    }

    function renderButtons(chart) {
        var buttons = chart.annotations.options.buttons;

        chart.annotations.buttons = chart.annotations.buttons || [];
        each(buttons, function (button, i) {
            chart.annotations.buttons.push(renderButton(chart, button, i));
        });
    }

    function renderButton(chart, button, i) {
        var userOffset = chart.annotations.options.buttonsOffsets,
			xOffset = chart.rangeSelector ? chart.rangeSelector.inputGroup.offset : 0,
			renderer = chart.renderer,
			symbol = button.symbol,
			offset = 30,
			symbolSize = symbol.size,
			buttonSize = button.size,
			x = chart.plotWidth + chart.plotLeft - ((i + 1) * offset) - xOffset - userOffset[0],
			y = chart.plotTop - (chart.rangeSelector ? 23 + buttonSize : 0) + userOffset[1],
			callback = button.events && button.events.click ? button.events.click : getButtonCallback(i, chart),
			selected = button.states.selected,
			hovered = button.states.hover;

        var button = renderer.button('', x, y, callback, {}, hovered, selected).attr({ width: buttonSize, height: buttonSize, zIndex: 10, visibility: 'hidden' });

        var s = renderer.symbol(
			symbol.shape,
			buttonSize - symbolSize / 2,
			buttonSize - symbolSize / 2,
			symbolSize,
			symbolSize
		).attr(symbol.style).add(button);

        button.attr(button.style).add();

        return [button, s];
    }

    function getButtonCallback(index, chart) {

        return function () {
            //$($('#' + chart.renderTo.id)[0].parentNode).find('#divSlope').remove();
            //isSlopeActive = false;
            self = chart.annotations.buttons[index][0];
            if (self.state == 2) {
                chart.annotations.selected = -1;
                chart.annotations.allowZoom = true;
                self.setState(0);
            } else {
                if (chart.annotations.selected >= 0) {
                    chart.annotations.buttons[chart.annotations.selected][0].setState(0);
                }
                chart.annotations.allowZoom = false;
                chart.annotations.selected = index;
                //if (index == 1) {                   
                //    $('#' + chart.renderTo.id).before(template);
                //    isSlopeActive = true;

                //}               
                self.setState(2);

            }
        };
    }

    // Get approximation function between two points, returns A and B for a line: Ax + B = y;
    function getSlopeAndTranslate(leftX, leftY, rightX, rightY) {
        var a = (leftY - rightY) / (leftX - rightX);

        if (leftX !== rightX) {
            // different points
            return {
                a: a,
                b: rightY - a * rightX
            };
        } else {
            // two the same points
            return {
                a: 0,
                b: 0
            };
        }
    }

    function getXYExtremes(ann) {
        var chart = ann.chart,
            yAxis = chart.yAxis[0],
            xAxis = chart.xAxis[0],
            options = ann.options,
            path = options.shape.params.d,
            ap = getSlopeAndTranslate(options.xValue, options.yValue, options.xValueEnd, options.yValueEnd), //returns { a: value, b: value } for 'y = ax + b' pattern
            X, Y,
            extremes = [
                [options.xValue, options.yValue],
                [options.xValueEnd, options.yValueEnd]
            ],
            xAxisEx = [xAxis.min, xAxis.max],
            yAxisEx = [yAxis.min, yAxis.max];

        // Highcharts returns pre-calcualted extremes (aka logarithmics),
        // calcualte them on your own:
        if (xAxis.isLog) {
            xAxisEx = xAxisEx.map(function (el) {
                return xAxis.lin2val(el);
            });
        }
        if (yAxis.isLog) {
            yAxisEx = yAxisEx.map(function (el) {
                return yAxis.lin2val(el);
            });
        }

        // Limit extremes on the annotation:
        // We need to do it step-by-step
        // To make sure evey case is covered in a proper order

        // left side A point:
        if (extremes[0][0] < xAxisEx[0]) {
            extremes[0][0] = xAxisEx[0];
            extremes[0][1] = ap.a * extremes[0][0] + ap.b;
            // right side A point:
        } else if (extremes[0][0] > xAxisEx[1]) {
            extremes[0][0] = xAxisEx[1];
            extremes[0][1] = ap.a * extremes[0][0] + ap.b;
        }

        // left side B point:
        if (extremes[1][0] < xAxisEx[0]) {
            extremes[1][0] = xAxisEx[0];
            extremes[1][1] = ap.a * extremes[1][0] + ap.b;
            // right side B point:
        } else if (extremes[1][0] > xAxisEx[1]) {
            extremes[1][0] = xAxisEx[1];
            extremes[1][1] = ap.a * extremes[1][0] + ap.b;
        }

        // top side A point:
        if (extremes[0][1] < yAxisEx[0]) {
            extremes[0][1] = yAxisEx[0];
            extremes[0][0] = (extremes[0][1] - ap.b) / ap.a;
            // bottom side A point:
        } else if (extremes[0][1] > yAxisEx[1]) {
            extremes[0][1] = yAxisEx[1];
            extremes[0][0] = (extremes[0][1] - ap.b) / ap.a;
        }

        // top side B point:
        if (extremes[1][1] < yAxisEx[0]) {
            extremes[1][1] = yAxisEx[0];
            extremes[1][0] = (extremes[1][1] - ap.b) / ap.a;
            // bottom side B point:
        } else if (extremes[1][1] > yAxisEx[1]) {
            extremes[1][1] = yAxisEx[1];
            extremes[1][0] = (extremes[1][1] - ap.b) / ap.a;
        }

        return extremes;
    }


    // Define annotation prototype
    var Annotation = function () {
        this.init.apply(this, arguments);
    };
    Annotation.prototype = {
        /* 
		 * Initialize the annotation
		 */
        init: function (chart, options) {
            var shapeType = options.shape && options.shape.type;

            this.chart = chart;
            this.options = merge({}, defaultOptions(shapeType), options);
        },

        /*
		 * Render the annotation
		 */
        render: function (redraw) {
            var annotation = this,
				chart = this.chart,
				renderer = annotation.chart.renderer,
				group = annotation.group,
				title = annotation.title,
				shape = annotation.shape,
				options = annotation.options,
				titleOptions = options.title,
				shapeOptions = options.shape,
				allowDragX = options.allowDragX,
				allowDragY = options.allowDragY,
				xAxis = chart.xAxis[options.xAxis],
				yAxis = chart.yAxis[options.yAxis],
				hasEvents = annotation.hasEvents;

            if (!group) {
                group = annotation.group = renderer.g();
                group.attr({ 'class': "highcharts-annotation" });
            }

            if (!shape && shapeOptions && inArray(shapeOptions.type, Highcharts.ALLOWED_SHAPES) !== -1) {
                delete shapeOptions.params.cursor;
                shape = annotation.shape = renderer[options.shape.type](shapeOptions.params);
                shape.add(group);
            }

            if (!title && titleOptions) {
                title = annotation.title = renderer.text(titleOptions);
                title.add(group);
            }
            if ((allowDragX || allowDragY) && !hasEvents) {
                $(group.element).on('mousedown', function (e) {
                    annotation.events.storeAnnotation(e, annotation, chart);
                    annotation.events.select(e, annotation);
                });
                addEvent(document, 'mouseup', function (e) {
                    annotation.events.releaseAnnotation(e, chart);
                });

                attachCustomEvents(group, options.events);
            } else if (!hasEvents) {
                $(group.element).on('mousedown', function (e) {
                    annotation.events.select(e, annotation);
                });
                attachCustomEvents(group, options.events);
            }

            this.hasEvents = true;

            group.add(chart.annotations.groups[options.yAxis]);

            // link annotations to point or series
            annotation.linkObjects();

            annotation.renderRotateAndTranslatePoints();

            if (redraw !== false) {
                annotation.redraw();
            }

            function attachCustomEvents(element, events) {
                if (defined(events)) {
                    for (var name in events) {
                        (function (name) {
                            Highcharts.addEvent(element.element, name, function (e) {
                                events[name].call(annotation, e);
                            });
                        })(name);
                    }
                }
            }
        },

        /*
		 * Redraw the annotation title or shape after options update
		 */
        redraw: function (redraw) {
            var options = this.options,
					chart = this.chart,
					group = this.group,
					title = this.title,
					shape = this.shape,
					linkedTo = this.linkedObject,
					xAxis = chart.xAxis[options.xAxis],
					yAxis = chart.yAxis[options.yAxis],
					width = options.width,
					height = options.height,
					anchorY = ALIGN_FACTOR[options.anchorY],
					anchorX = ALIGN_FACTOR[options.anchorX],
					resetBBox = false,
					shapeParams,
					linkType,
					series,
					param,
					bbox,
					x,
					y,
					slope,
					intercept,
                    plotType = chart.options.chart.plotType
,
                    xyExtremes,
					X1,
                    X2,
					Y1,
                    Y2;

            if (linkedTo) {
                linkType = (linkedTo instanceof Highcharts.Point) ? 'point' :
										(linkedTo instanceof Highcharts.Series) ? 'series' : null;

                if (linkType === 'point') {
                    options.xValue = linkedTo.x;
                    options.yValue = linkedTo.y;
                    series = linkedTo.series;
                } else if (linkType === 'series') {
                    series = linkedTo;
                }

                if (group.visibility !== series.group.visibility) {
                    group.attr({
                        visibility: series.group.visibility
                    });
                }
            }


            // Based on given options find annotation pixel position
            // what is minPointOffset? Doesn't work in 4.0+
            x = (defined(options.xValue) ? xAxis.toPixels(options.xValue /* + xAxis.minPointOffset */) : options.x);
            y = defined(options.yValue) ? yAxis.toPixels(options.yValue) : options.y;

            if (isNaN(x) || isNaN(y) || !isNumber(x) || !isNumber(y)) {
                return;
            }


            if (title) {
                var attrs = options.title,
                    styles = attrs.style;

                delete attrs.style;

                if (isOldIE) {
                    title.attr({
                        text: attrs.text
                    });
                } else {
                    title.attr(attrs);
                }
                options.title.style = styles;
                title.css(styles);

                resetBBox = true;
            }

            if (shape) {
                shapeParams = extend({}, options.shape.params);
                if (options.shape.units === 'values') {
                    // For ordinal axis, required are x&Y values - #22
                    if (defined(shapeParams.x) && shapeParams.width) {
                        shapeParams.width = xAxis.toPixels(shapeParams.width + shapeParams.x) - xAxis.toPixels(shapeParams.x);
                        shapeParams.x = xAxis.toPixels(shapeParams.x);
                    } else if (shapeParams.width) {
                        shapeParams.width = xAxis.toPixels(shapeParams.width) - xAxis.toPixels(0);
                    } else if (defined(shapeParams.x)) {
                        shapeParams.x = xAxis.toPixels(shapeParams.x);
                    }

                    if (defined(shapeParams.y) && shapeParams.height) {
                        shapeParams.height = -yAxis.toPixels(shapeParams.height + shapeParams.y) + yAxis.toPixels(shapeParams.y);
                        shapeParams.y = yAxis.toPixels(shapeParams.y);
                    } else if (shapeParams.height) {
                        shapeParams.height = -yAxis.toPixels(shapeParams.height) + yAxis.toPixels(0);
                    } else if (defined(shapeParams.y)) {
                        shapeParams.y = yAxis.toPixels(shapeParams.y);
                    }

                    if (options.shape.type === 'path') {
                        shapeParams.d = translatePath(shapeParams.d, xAxis, yAxis, x, y);
                    }
                }
                if (defined(options.yValueEnd) && defined(options.xValueEnd)) {
                    shapeParams.d = shapeParams.d || options.shape.d || ['M', 0, 0, 'L', 0, 0];

                    xyExtremes = getXYExtremes(this);

                    x = xAxis.toPixels(xyExtremes[0][0]);
                    y = yAxis.toPixels(xyExtremes[0][1]);

                    shapeParams.d[4] = xAxis.toPixels(xyExtremes[1][0]) - x;
                    shapeParams.d[5] = yAxis.toPixels(xyExtremes[1][1]) - y;

                    options.xValue = xyExtremes[0][0];
                    options.yValue = xyExtremes[0][1];
                    options.xValueEnd = xyExtremes[1][0];
                    options.yValueEnd = xyExtremes[1][1];
                    // options.plotType = chart.options.chart.plotType;
                }

                // move the center of the circle to shape x/y
                if (options.shape.type === 'circle') {
                    shapeParams.x += shapeParams.r;
                    shapeParams.y += shapeParams.r;
                }

                resetBBox = true;
                shape.attr(shapeParams);
            }

            group.bBox = null;

            // If annotation width or height is not defined in options use bounding box size
            if (!isNumber(width)) {
                bbox = group.getBBox();
                width = bbox.width;
            }

            if (!isNumber(height)) {
                // get bbox only if it wasn't set before
                if (!bbox) {
                    bbox = group.getBBox();
                }

                height = bbox.height;
            }
            // Calculate anchor point
            if (!isNumber(anchorX)) {
                anchorX = ALIGN_FACTOR.center;
            }

            if (!isNumber(anchorY)) {
                anchorY = ALIGN_FACTOR.center;
            }

            // Translate group according to its dimension and anchor point
            //console.log(width+'/'+height);
            x = x - width * anchorX;
            y = y - height * anchorY;

            if (this.selectionMarker) {
                this.events.select({}, this);
            }

            this.renderRotateAndTranslatePoints();

            if (redraw && chart.animation && defined(group.translateX) && defined(group.translateY)) {
                group.animate({
                    translateX: x,
                    translateY: y
                });
            } else {
                group.translate(x, y);
            }
        },

        /*
		 * Destroy the annotation
		 */
        destroy: function () {
            var annotation = this,
					chart = this.chart,
					allItems = chart.annotations.allItems,
					index = allItems.indexOf(annotation);

            annotation.hideEditBox();

            chart.activeAnnotation = null;

            if (index > -1) {
                allItems.splice(index, 1);
                chart.options.annotations.splice(index, 1); // #33
            }

            each(['title', 'shape', 'group'], function (element) {
                if (annotation[element] && annotation[element].destroy) {
                    annotation[element].destroy();
                    annotation[element] = null;
                } else if (annotation[element]) {
                    annotation[element].remove();
                    annotation[element] = null;
                }
            });

            if (annotation.rotatePoints) {
                each(annotation.rotatePoints, function (p) {
                    p.destroy();
                });
            }

            annotation.group = annotation.title = annotation.shape = annotation.chart = annotation.options = annotation.hasEvents = null;
        },

        /*
		 * Update the annotation with a given options
		 */
        update: function (options, redraw) {
            var annotation = this,
				chart = this.chart,
				allItems = chart.annotations.allItems,
				index = allItems.indexOf(annotation),
				o = merge(this.options, options);

            if (index >= 0) {
                chart.options.annotations[index] = o; // #33
            }

            this.options = o;

            // update link to point or series
            this.linkObjects();

            this.render(redraw);
        },
        linkObjects: function () {
            var annotation = this,
					chart = annotation.chart,
					linkedTo = annotation.linkedObject,
					linkedId = linkedTo && (linkedTo.id || linkedTo.options.id),
					options = annotation.options,
					id = options.linkedTo;

            if (!defined(id)) {
                annotation.linkedObject = null;
            } else if (!defined(linkedTo) || id !== linkedId) {
                annotation.linkedObject = chart.get(id);
            }
        },
        renderRotateAndTranslatePoints: function () {
            var ann = this,
                chart = ann.chart,
                options = ann.options,
                forExport = chart.options.chart.forExport,
                size = 6,
                cursorStyles = !forExport ? {
                    cursor: rotateCursor
                } : {},
                styles = {
                    fill: "yellow",
                    stroke: "black",
                    "stroke-width": "1px"
                };
            //  || !defined(options.xValueEnd) || !defined(options.yValueEnd)
            if (options.shape.type !== "path") {
                return;
            }

            if (ann.rotatePoints) {
                each(ann.rotatePoints, function (p) {
                    p.destroy();
                });
            } else {
                ann.rotatePoints = [];
            }


            // Left handler
            ann.rotatePoints[0] = chart.renderer.rect(
                -size / 2 + 1, // border +/- 1
                -size / 2 - 1, // border +/- 1
                size,
                size,
                0,
                1
            ).attr(styles).css(cursorStyles).add(ann.group);

            // Right handler
            ann.rotatePoints[1] = chart.renderer.rect(
                Math.round(options.shape.params.d[4] - size / 2) - 4,
                Math.round(options.shape.params.d[5] - size / 2) - 1,
                size,
                size,
                0,
                1
            ).attr(styles).css(cursorStyles).add(ann.group);

            // Just use one container.
            // Middle point:
            ann.rotatePoints[2] = chart.renderer.rect(
                Math.round((options.shape.params.d[4] - size) / 2),
                Math.round((options.shape.params.d[5] - size) / 2),
                size,
                size,
                0,
                1
            ).attr(styles).css(cursorStyles).add(ann.group);

            ann.rotatePoints[0].on('mousedown', function (e) {
                ann.rotate = true;
                ann.rotateEnd = false;
                $('body').css({
                    cursor: rotateCursor
                });
            });
            ann.rotatePoints[1].on('mousedown', function (e) {
                ann.rotate = true;
                ann.rotateEnd = true;
                $('body').css({
                    cursor: rotateCursor
                });
            });
            ann.rotatePoints[2].on('mousedown', function (e) {
                $('body').css({
                    cursor: selectCursor
                });
            });
        },
        events: {
            select: function (e, ann, isClick, force) {
                var chart = ann.chart,
						prevAnn = chart.selectedAnnotation,
						box,
						padding = 10;


                if ((prevAnn && prevAnn.selectionMarker && prevAnn !== ann) || force) {
                    prevAnn.hideEditBox();
                    prevAnn.selectionMarker.destroy();
                    prevAnn.selectionMarker = false;
                }

                if (ann.selectionMarker) {
                    //ann.selectionMarker.destroy(); <-- if we destroy marker, then event won't be propagated
                    //ann.group.bBox = null;
                } else {
                    box = ann.group.getBBox();

                    ann.selectionMarker = chart.renderer.rect(box.x - padding / 2, box.y - padding / 2, box.width + padding, box.height + padding).attr({
                        'stroke-width': 4,
                        stroke: 'transparent',
                        fill: 'transparent',
                        dashstyle: 'ShortDash',
                        'shape-rendering': 'crispEdges'
                    });
                    ann.selectionMarker.add(ann.group);

                }
                chart.selectedAnnotation = ann;
            },
            deselect: function (e) {
                if (this.selectionMarker && this.group) {
                    this.selectionMarker.destroy();
                    this.selectionMarker = false;
                    this.group.bBox = null;
                }
                this.hideEditBox();
            },
            destroyAnnotation: function (event, annotation) {
                annotation.destroy();
            },
            translateAnnotation: function (event, chart) {
                event.stopPropagation();
                event.preventDefault();

                if (!chart.activeAnnotation) {
                    return;
                }

                var container = chart.container,
                    note = chart.activeAnnotation,
                    bbox = chart.container.getBoundingClientRect(),
					clickX = event.clientX - bbox.left,
					clickY = event.clientY - bbox.top,
                    x, y,
                    endX, endY;

                if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop)) {
                    return;
                }

                if (!chart.annotations.allowZoom) {
                    x = note.options.allowDragX ? event.clientX - note.startX + note.group.translateX : note.group.translateX,
					y = note.options.allowDragY ? event.clientY - note.startY + note.group.translateY : note.group.translateY;

                    note.transX = x;
                    note.transY = y;
                    note.group.attr({
                        transform: 'translate(' + x + ',' + y + ')'
                    });
                    note.hadMove = true;
                    note.reflowEditBox(event);
                } else
                    if (note.rotate) {
                        x = note.chart.xAxis[0].toValue(clickX);
                        y = note.chart.yAxis[0].toValue(clickY);

                        var isUpdatedAnnotation = true;
                        if (note.rotateEnd) {
                            endX = note.options.xValue;
                            endY = note.options.yValue;
                            note.update({
                                xValueEnd: x,
                                yValueEnd: y
                            });
                        } else {
                            endX = note.options.xValueEnd;
                            endY = note.options.yValueEnd;
                            if (note.options.isFixedAnnotation == undefined || !note.options.isFixedAnnotation) {
                                note.update({
                                    xValue: x,
                                    yValue: y
                                });
                            }
                            else {
                                isUpdatedAnnotation = false;
                            }
                        }
                        note.events.select(event, note, false, true);
                        // Report slope:
                        note.options.slope = (y - endY) / (x - endX);
                        note.options.intercept = y - ((y - endY) / (x - endX)) * x;
                        note.options.X1 = endX;
                        note.options.X2 = x;
                        note.options.Y1 = endY;
                        note.options.Y2 = y;

                        if (note.options.plotType == 'WellMBE' && isUpdatedAnnotation) {
                            var OGIP = x;
                            if ((endY.toFixed(0) <= chart.yAxis[0].min && x.toFixed(0) <= chart.xAxis[0].min) || (y.toFixed(0) <= chart.yAxis[0].min && endX.toFixed(0) <= chart.xAxis[0].min)) {

                                $('#txtSlope').val(((y - endY) / (x - endX)).toExponential(4));
                                $('#txtIntercept').val((y - ((y - endY) / (x - endX)) * x).toExponential(4));

                            }
                            else {
                                $('#txtSlope').val(((y - endY) / (x - endX)).toExponential(4));
                                $('#txtIntercept').val((y - ((y - endY) / (x - endX)) * x).toExponential(4));

                            }
                            CalculateOGIPAndEUR(note.options.intercept, note.options.slope);
                        }
                        else if (note.options.plotType == 'WellMBEGasPSS') {
                            $('#txtGasPssSlope').val(((y - endY) / (x - endX)).toExponential(4));
                            $('#txtGasPssIntercept').val((y - ((y - endY) / (x - endX)) * x).toExponential(4));
                            var ga = -((y - ((y - endY) / (x - endX)) * x).toExponential(4)) / (((y - endY) / (x - endX)).toExponential(4))  //double Gn = -Intercept / Slope;
                            $('#txtGasPssCalculatedOGIP').val(ga);
                            $('#txtGasPssEUR').val($('#txtGasPssRf').val() * $('#txtGasPssCalculatedOGIP').val() / 100);
                            // $('#btnCalculateMBE').trigger('click');
                        }
                        else if (note.options.plotType == 'WellMBE-Oil') {

                            $('#txtOilPssN').val(Math.abs(-((y - ((y - endY) / (x - endX)) * x) / ((y - endY) / (x - endX)))));
                            $('#txtOilPssEUR').val($('#txtOilPssN').val() * $('#txtOilPssRf').val() / 100);
                            //  $('#btnCalculateMBE').trigger('click');
                        }
                        else if (note.options.plotType == 'Palacio and Blasimgame - Gas') {
                            $('#txtGasPandBSlope').val(((y - endY) / (x - endX)).toExponential(4));
                            $('#txtGasPandBIntercept').val((y - ((y - endY) / (x - endX)) * x).toExponential(4));
                            var ga = CalculateGaForAnnotation(((y - ((y - endY) / (x - endX)) * x).toExponential(4)), (((y - endY) / (x - endX))).toExponential(4));  //double Gn=1/(Bgi*mugi*cgi*Slope);
                            $('#txtGasPandBCalculatedOGIP').val(ga);
                            $('#txtGasPandBEUR').val($('#txtGasPandBRf').val() * $('#txtGasPandBCalculatedOGIP').val() / 100);
                            // $('#btnCalculateMBE').trigger('click');
                        }
                        else if (note.options.plotType == 'Palacio and Blasimgame - Oil') {
                            var slopex = Math.abs(((y - endY) / (x - endX)));
                            CalculateOGIPAndEUR_PandB(0, slopex);
                            //$('#txtOilPandBN').val(1 / (slopex * GlobalCt * 1000000));
                            //$('#txtOilPandBEUR').val($('#txtOilPandBN').val() * $('#txtOilPandBRf').val() / 100);
                            //  $('#btnCalculateMBE').trigger('click');
                        }
                        else if (note.options.plotType == 'Condensate Palacio and Blasimgame - Gas') {
                            $('#txtGasPandBSlope').val(((y - endY) / (x - endX)).toExponential(4));
                            $('#txtGasPandBIntercept').val((y - ((y - endY) / (x - endX)) * x).toExponential(4));
                            var ga = CalculateGaForAnnotation(((y - ((y - endY) / (x - endX)) * x).toExponential(4)), (((y - endY) / (x - endX))).toExponential(4));  //double Gn=1/(Bgi*mugi*cgi*Slope);
                            $('#txtGasPandBCalculatedOGIP').val(ga);
                            $('#txtGasPandBEUR').val($('#txtGasPandBRf').val() * $('#txtGasPandBCalculatedOGIP').val() / 100);
                            // $('#btnCalculateMBE').trigger('click');
                        }
                        else if (note.options.plotType == 'IsCondensate') {
                            var slope = parseFloat((y - endY) / (x - endX));
                            var intercept = parseFloat(y - ((y - endY) / (x - endX)) * x);
                            CalculateGforCondensate(slope, intercept);
                        }
                        else if (note.options.plotType == 'PsuedoTime') {
                            var slope = parseFloat((y - endY) / (x - endX));
                            var intercept = parseFloat(y - ((y - endY) / (x - endX)) * x);
                            CalculateGforPsuedoTime(slope, intercept);
                        }
                        else if (note.options.plotType == 'RESMBE') {
                            var slope = parseFloat((y - endY) / (x - endX));
                            var intercept = parseFloat(y - ((y - endY) / (x - endX)) * x);
                            //  CalculateGforPsuedoTime(slope, intercept);
                        }
                        else {
                            //chart.options.annotations[0].plotType
                            if (chart.options.chart.plotType != undefined)
                                $('#' + chart.options.chart.plotType + '_Slope').val(((y - endY) / (x - endX)).toExponential(2));
                            else
                                $('#' + chart.options.annotations[0].plotType + '_Slope').val(((y - endY) / (x - endX)).toExponential(2));
                            //y = mx + b
                            if (chart.options.chart.plotType != undefined)
                                $('#' + chart.options.chart.plotType + '_Intercept').val((y - ((y - endY) / (x - endX)) * x).toExponential(2));
                            else
                                $('#' + chart.options.annotations[0].plotType + '_Intercept').val((y - ((y - endY) / (x - endX)) * x).toExponential(2));

                            if (chart.options.chart.plotType != undefined) {
                                //if (chart.options.annotations[0].plotType.split('-').indexOf("WellMBE") > -1 && chart.options.annotations[0].plotType.split('-')[0] == 'WellMBE') {
                                //    if (chart.options.annotations[0].plotType.split('-')[1] == 'Oil')
                                //        $('#txtOilPssN').val(Math.abs(-((y - ((y - endY) / (x - endX)) * x) / ((y - endY) / (x - endX)))));
                                //    else {
                                //        $('#txtGasPssCalculatedOGIP').val(-((y - ((y - endY) / (x - endX)) * x) / ((y - endY) / (x - endX))));
                                //        $('#txtGasPssEUR').val($('#txtGasPssRf').val() * $('#txtGasPssCalculatedOGIP').val() / 100);
                                //    }
                                //}
                                $("#" + chart.options.chart.plotType + " " + "div.resultData .margin_top5").each(function (key, value) {

                                    var labletext = $(value)[0].childNodes['0'].innerHTML;

                                    if (labletext == "Slope") {
                                        $(value)[0].childNodes['1'].childNodes['0'].style.borderColor = 'RED';
                                        $(value)[0].childNodes['1'].childNodes['0'].style.borderWidth = '1px';
                                    } else if (labletext == "Intercept") {
                                        $(value)[0].childNodes['1'].childNodes['0'].style.borderColor = 'RED';
                                        $(value)[0].childNodes['1'].childNodes['0'].style.borderWidth = '1px';
                                    }
                                    else
                                        $(value)[0].childNodes['1'].childNodes['0'].value = '';
                                });
                            }
                            //$('#btn_' + note.options.plotType + '_Calculate').attr('disabled', 'disabled');                         
                        }

                        //console.log("Slope: ", (y - endY) / (x - endX));
                        //$($('#' + chart.renderTo.id)[0].parentNode).find('#divSlope').remove();
                        //$('#' + chart.renderTo.id).before(template);
                        //   $('#spnSlope')[0].innerHTML = (Math.pow((y / endY),1/(x - endX)));
                        //isSlopeActive = true;
                    }
            },
            storeAnnotation: function (event, annotation, chart) {
                if (!chart.annotationDraging) {
                    event.stopPropagation();
                    event.preventDefault();
                }
                if ((!isOldIE && event.button === 0) || (isOldIE && event.button === 1)) {
                    var posX = event.clientX,
							posY = event.clientY;
                    chart.activeAnnotation = annotation;
                    chart.activeAnnotation.startX = posX;
                    chart.activeAnnotation.startY = posY;
                    chart.activeAnnotation.transX = 0;
                    chart.activeAnnotation.transY = 0;

                    chart.annotations.allowZoom = pick(annotation.rotate, false);

                    //translateAnnotation(event);
                    if (!chart.annotations.eventsReady) {
                        addEvent(document, 'mousemove', function (e) {
                            annotation.events.translateAnnotation(e, chart);
                        });

                        //addEvent(chart.container, 'mouseleave', releaseAnnotation); TO BE OR NOT TO BE?
                        chart.annotations.eventsReady = true;
                    }

                    if (annotation.options.title && defined(annotation.options.title.text)) {
                        annotation.showEditBox(event);
                    }
                }
            },
            releaseAnnotation: function (event, chart) {
                event.stopPropagation();
                event.preventDefault();
                if (chart.activeAnnotation && (chart.activeAnnotation.transX !== 0 || chart.activeAnnotation.transY !== 0)) {
                    var note = chart.activeAnnotation,
						x = note.transX,
						y = note.transY,
						options = note.options,
						xVal = options.xValue,
						yVal = options.yValue,
						xValEnd = options.xValueEnd,
						yValEnd = options.yValueEnd,
						allowDragX = options.allowDragX,
						allowDragY = options.allowDragY,
						xAxis = note.chart.xAxis[note.options.xAxis],
						yAxis = note.chart.yAxis[note.options.yAxis],
						newX = xAxis.toValue(x),
						newY = yAxis.toValue(y),
                        newXValueEnd = xAxis.toValue(xAxis.toPixels(xValEnd) - xAxis.toPixels(xVal) + x),
                        newYValueEnd = yAxis.toValue(yAxis.toPixels(yValEnd) - yAxis.toPixels(yVal) + y);

                    if (x !== 0 || y !== 0) {
                        if (allowDragX && allowDragY) {
                            note.update({
                                xValue: defined(xVal) ? newX : null,
                                yValue: defined(yVal) ? newY : null,
                                xValueEnd: defined(xValEnd) ? newXValueEnd : null,
                                yValueEnd: defined(yValEnd) ? newYValueEnd : null,
                                x: defined(xVal) ? null : x,
                                y: defined(yVal) ? null : y,
                                title: options.title
                            }, false);
                        } else if (allowDragX) {
                            note.update({
                                xValue: defined(xVal) ? newX : null,
                                yValue: defined(yVal) ? yVal : null,
                                xValueEnd: defined(xValEnd) ? newXValueEnd : null,
                                yValueEnd: defined(yValEnd) ? yValEnd : null,
                                x: defined(xVal) ? null : x,
                                y: defined(yVal) ? null : note.options.y,
                                title: options.title
                            }, false);
                        } else if (allowDragY) {
                            note.update({
                                xValue: defined(xVal) ? xVal : null,
                                yValue: defined(yVal) ? newY : null,
                                xValueEnd: defined(xValEnd) ? xValEnd : null,
                                yValueEnd: defined(yValEnd) ? newYValueEnd : null,
                                x: defined(xVal) ? null : note.options.x,
                                y: defined(yVal) ? null : y,
                                title: options.title
                            }, false);
                        }
                    }

                    note.options.slope = (newY - newYValueEnd) / (newX - newXValueEnd);
                    note.options.intercept = newY - ((newY - newYValueEnd) / (newX - newXValueEnd)) * newX;

                    $('#' + note.options.plotType + '_Slope').val((note.options.slope).toExponential(2));
                    //y = mx + b

                    $('#' + note.options.plotType + '_Intercept').val((note.options.intercept).toExponential(2));

                    //$('#btn_' + note.options.plotType + '_Calculate').attr('disabled', 'disabled');

                    $("#" + note.options.plotType + " " + "div.resultData .margin_top5").each(function (key, value) {

                        var labletext = $(value)[0].childNodes['0'].innerHTML;

                        if (labletext == "m") {
                            $(value)[0].childNodes['1'].childNodes['0'].style.borderColor = 'RED';
                            $(value)[0].childNodes['1'].childNodes['0'].style.borderWidth = '1px';
                        } else if (labletext == "c") {
                            $(value)[0].childNodes['1'].childNodes['0'].style.borderColor = 'RED';
                            $(value)[0].childNodes['1'].childNodes['0'].style.borderWidth = '1px';
                        }
                        else
                            $(value)[0].childNodes['1'].childNodes['0'].value = '';
                    });

                    chart.activeAnnotation.redraw();

                    chart.activeAnnotation.rotate = false;
                    chart.activeAnnotation = null;
                    chart.redraw(false);
                }

                if (chart.options!=undefined && WellMBEPlotArray.length > 0) {
                                       
                    $.each(WellMBEPlotArray, function (i, value) {
                        if (chart.renderTo.id == value.div && value.plotobj != undefined) {
                            value.plotobj.annotations[0].xValue = chart.options.annotations[0].xValue;
                            value.plotobj.annotations[0].xValueEnd = chart.options.annotations[0].xValueEnd;
                            value.plotobj.annotations[0].yValue = chart.options.annotations[0].yValue;
                            value.plotobj.annotations[0].yValueEnd = chart.options.annotations[0].yValueEnd;
                        }
                    });
                }

                if (chart.activeAnnotation && (chart.activeAnnotation.transX == 0 || chart.activeAnnotation.transY == 0) && chart.options.annotations != undefined && (chart.options.annotations[0].plotType == 'WellMBEGasPSS' || chart.options.annotations[0].plotType == 'WellMBE-Oil' || chart.options.annotations[0].plotType == 'Palacio and Blasimgame - Oil' || chart.options.annotations[0].plotType == 'Palacio and Blasimgame - Gas' || chart.options.annotations[0].plotType == 'PsuedoTime')) {

                    if (chart.options.annotations[0].plotType == 'WellMBEGasPSS' || chart.options.annotations[0].plotType == 'WellMBE-Oil') {
                        GetCalculatedDataForFlowingPSS();
                    }
                    else if (chart.options.annotations[0].plotType == 'Palacio and Blasimgame - Oil' || chart.options.annotations[0].plotType == 'Palacio and Blasimgame - Gas') {
                        GetDataForPalacioAndBlasingame();
                    }
                    else if (chart.options.annotations[0].plotType == 'PsuedoTime') {
                        GetDataForPalacioAndBlasingame();
                    }
                }
                else {
                    if (chart.activeAnnotation) {
                        chart.activeAnnotation.rotate = false;
                    }
                    chart.activeAnnotation = null;
                }
                $('body').css({
                    cursor: 'auto'
                });
                if (chart.annotations) {
                    chart.annotations.allowZoom = true;

                }

                

            }
        },
        showEditBox: function (e) {
            if (!this || !this.chart) {
                return;
            }
            var ann = this,
                chart = ann.chart,
                $container = $(chart.container).parent();

            chart.textEditAnnotation = ann;

            if (!chart.editBox) {
                $container.append($(editBoxHTML));

                chart.editBox = $container.find('.hc-editbox');

                chart.editBox.find(".hc-accept").click(function (e) {
                    chart.textEditAnnotation.applyEditBox();
                });

                chart.editBox.find(".hc-bold").click(function () {
                    $(this).toggleClass("active");
                });

                chart.editBox.find(".hc-italic").click(function () {
                    $(this).toggleClass("active");
                });

                // Reload picker:
                MC.ColorPicker.reload();
            }
            ann.fillEditBox();
            ann.reflowEditBox(e);

            chart.editBox.show();
        },
        reflowEditBox: function (e) {
            var ann = this,
                chart,
                editBoxWidth,
                $container,
                offset,
                box,
                bbox,
                x,
                y;

            if (ann) {
                chart = ann.chart;
                if (chart && chart.editBox) {
                    $container = $(chart.container);
                    offset = $container.offset();
                    box = ann.group.attr("transform").replace("translate(", "").split(",");

                    if (box && ann.title) {
                        bbox = ann.title.getBBox(true),
                        x = parseFloat(box[0]) - offset.left - 4,
                        y = parseFloat(box[1]) + offset.top - bbox.height - 45,
                        editBoxWidth = chart.editBox.width();
                        chart.editBox.css({
                            left: x + editBoxWidth + 15 > window.innerWidth ? window.innerWidth - editBoxWidth - 15 : x,
                            top: y
                        });
                    }
                }
            }
        },
        hideEditBox: function (e) {
            var ann = this,
                chart;

            if (ann) {
                chart = ann.chart;
                if (chart && chart.editBox) {
                    chart.editBox.hide();
                }
            }
        },
        fillEditBox: function () {
            if (!this || !this.chart) {
                return;
            }
            var ann = this,
                options = ann.options,
                title = ann.title,
                chart = ann.chart,
                editBox = chart.editBox,
                $bold = editBox.find(".hc-bold"),
                $italic = editBox.find(".hc-italic"),
                $title = $(title.element),
                bold = $title.css('font-weight'),
                italic = $title.css('font-style') === 'italic';

            bold = bold === 'bold' || bold === '700'; // webkit vs gecko
            chart.editBox.find(".hc-fontsize").val(parseFloat(options.title.style['font-size']));
            chart.editBox.find(".hc-font-color").val(options.title.style.color);

            if (bold && !$bold.hasClass("active")) {
                $bold.addClass("active");
            } else if (!bold) {
                $bold.removeClass("active");
            }

            if (italic && !$italic.hasClass("active")) {
                $italic.addClass("active");
            } else if (!italic) {
                $italic.removeClass("active");
            }

            // Reload picker:
            chart.editBox.find('.colorChooser').css('background-color', options.title.style.color);
        },
        applyEditBox: function () {
            if (!this || !this.chart) {
                return;
            }
            var editBox = this.chart.editBox,
                bold = editBox.find(".hc-bold").hasClass('active'),
                italic = editBox.find(".hc-italic").hasClass('active'),
                fontSize = editBox.find(".hc-fontsize").val();

            this.update({
                title: {
                    style: {
                        'font-weight': bold ? 'bold' : 'normal',
                        'font-style': italic ? 'italic' : 'normal',
                        'font-size': fontSize + 'px',
                        'color': editBox.find(".hc-font-color").val()
                    },
                    'y': fontSize
                }
            });
            this.events.select(null, this, false, true);
            this.reflowEditBox();
        }
    };


    // Add annotations methods to chart prototype
    extend(Chart.prototype, {
        /*
		 * Unified method for adding annotations to the chart
		 */
        addAnnotation: function (options, redraw) {
            var chart = this,
				annotations = chart.annotations.allItems,
				item,
				i,
				iter,
				len;

            if (!isArray(options)) {
                options = [options];
            }

            len = options.length;

            for (iter = 0; iter < len; iter++) {
                item = new Annotation(chart, options[iter]);
                i = annotations.push(item);


                //TODO
                if (i > chart.options.annotations.length) {
                    chart.options.annotations.push(options[iter]); // #33
                }
                item.render(redraw);
            }
        },

        /**
		 * Redraw all annotations, method used in chart events
		 */
        redrawAnnotations: function () {
            var chart = this,
				yAxes = chart.yAxis,
				yLen = yAxes.length,
				ann = chart.annotations,
				userOffset = ann.options.buttonsOffsets,
				i = 0;


            for (; i < yLen; i++) {
                var y = yAxes[i],
					clip = ann.clipPaths[i];

                if (clip) {
                    clip.attr({
                        x: y.left,
                        y: y.top,
                        width: y.width,
                        height: y.height
                    });
                } else {
                    var clipPath = createClipPath(chart, y);
                    ann.clipPaths.push(clipPath);
                    ann.groups.push(createGroup(chart, i, clipPath));
                }

            }

            each(chart.annotations.allItems, function (annotation) {
                annotation.redraw();
            });
            each(chart.annotations.buttons, function (button, i) {
                var xOffset = chart.rangeSelector ? chart.rangeSelector.inputGroup.offset : 0,
						x = chart.plotWidth + chart.plotLeft - ((i + 1) * 30) - xOffset - userOffset[0];
                button[0].attr({
                    x: x
                });
            });
        }
    });


    // Initialize on chart load
    Chart.prototype.callbacks.push(function (chart) {
        var options = chart.options.annotations,
			yAxes = chart.yAxis,
			yLen = yAxes.length,
			clipPaths = [],
			clipPath,
			groups = [],
			group,
			i = 0,
			clipBox;

        for (; i < yLen; i++) {
            var y = yAxes[i];
            var c = createClipPath(chart, y);
            clipPaths.push(c);
            groups.push(createGroup(chart, i, c));
        }


        if (!chart.annotations) chart.annotations = {};

        // initialize empty array for annotations
        if (!chart.annotations.allItems) chart.annotations.allItems = [];

        // allow zoom or draw annotation
        chart.annotations.allowZoom = true;

        // link chart object to annotations
        chart.annotations.chart = chart;

        // link annotations group element to the chart
        chart.annotations.groups = groups;

        // add clip path to annotations
        chart.annotations.clipPaths = clipPaths;

        if (isArray(options) && options.length > 0) {
            chart.addAnnotation(chart.options.annotations);
        }
        chart.annotations.options = merge(defatultMainOptions(), chart.options.annotationsOptions ? chart.options.annotationsOptions : {});

        if (chart.annotations.options.enabledButtons) {
            renderButtons(chart);
            attachEvents(chart);
        } else {
            chart.annotations.buttons = [];
        }

        // update annotations after chart redraw
        Highcharts.addEvent(chart, 'redraw', function () {
            chart.redrawAnnotations();
            if (chart.editBox && chart.textEditAnnotation) {
                chart.textEditAnnotation.reflowEditBox();
            }
        });

    });

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
            "use strict";
            if (this == null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n != 0 && n != Infinity && n != -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }

}(Highcharts));
