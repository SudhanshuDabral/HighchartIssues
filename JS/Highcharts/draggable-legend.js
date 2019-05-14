/**
 * Highcharts plugin for dragging a legend by its title
 *
 * Author: Torstein Hønsi
 * License: MIT License
 * Version: 1.3.5
 * Requires: Highcharts 3.0+
 *
 * Usage: Set draggable:true and floating:true in the legend options. The legend
 * preserves is alignment after dragging. For example if it is aligned to the right,
 * if will keep the same distance to the right edge even after chart resize or
 * when exporting to a different size.
 */
(function (H) {
    var addEvent = H.addEvent,
        defined = H.defined,
        each = H.each,
        wrap = H.wrap;

    wrap(H.Legend.prototype, 'render', function (proceed) {

        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        var legend = this,
            options = legend.options,
            padding = options.padding || 5,
            contentBox = legend.contentGroup.getBBox(true);
            
            legend.box.isNew = true; // this code resolved <Draggable Legend Issue>
        
        // Resize legend when value-in-legend plugin changes value:
        if (contentBox.width + 2 * padding > legend.options.width) {
            legend.options.width = Math.ceil(contentBox.width) + 2 * padding;
            proceed.apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (!legend.resizer && options.resizable) {
            legend.addResizer();
            legend.bindResizerEvents();
        }

        if (legend.resizer) {
            legend.alignResizer();
            legend.contentGroup.attr({
                translateY: parseFloat(legend.itemStyle.fontSize) + 4
            });
        }

        legend.alignContentGroup(contentBox, padding);
    });

    H.Legend.prototype.addResizer = function () {
        this.resizer = this.chart.renderer.path([
            'M', 0, 10,
            'L', 10, 10,
            'L', 10, 0,
            'L', 11, 0,
            'L', 11, 11,
            'L', 0, 11,
            'Z'
        ]).attr({
            'stroke-width': 10,
            stroke: 'transparent',
            fill: 'black'
        }).css({
            cursor: 'se-resize',
            'pointer-events': 'stroke'
        }).add(this.group);
    };

    H.Legend.prototype.bindResizerEvents = function () {
        var legend = this,
            options = legend.options,
            chart = legend.chart,
            defaultHeight,
            defaultWidth,
            downX,
            downY;

        chart.isResizingLegend = false;

        if (chart.removeResizableEvents) {
            H.each(chart.removeResizableEvents, function (unbind) {
                unbind();
            });
        }

        function resizeStart(e) {
            var bbox = legend.group.getBBox(true);
            e = chart.pointer.normalize(e);
            downY = e.chartY;
            downX = e.chartX;
            defaultWidth = legend.options.width || bbox.width;
            defaultHeight = legend.options.height || bbox.height;
            chart.isResizingLegend = true;
        }

        function resizeStep(e) {
            if (chart.isResizingLegend) {
                e = chart.pointer.normalize(e);

                var draggedY = e.chartY - downY,
                    draggedX = e.chartX - downX,
                    options = legend.options,
                    padding = options.padding || 5, // default padding is not optionable, inline set in core to 5
                    contentBox = legend.contentGroup.getBBox(true);

                // Stop touch-panning the page
                e.preventDefault();

                options.width = Math.min(
                    Math.max(contentBox.width + padding, defaultWidth + draggedX),
                    chart.containerWidth - 20 - (options.floating ? options.x : 5) // 5px - paddings, 20px resizer size
                );

                options.height = options.maxHeight = Math.min(
                    Math.max(60, defaultHeight + draggedY), // min height for legend to display at least one item is 50px
                    chart.containerHeight - 20 - (options.floating ? options.y : 5) // 5px - paddings, 20px resizer size
                );
                legend.group.placed = false; // prevent animation

                if (defined(legend.currentPage)) {
                    // Reset pagination on resize, because number of pages can change
                    // And we can not show 7/3 page in nav.
                    legend.currentPage = 1;
                    legend.scroll(-legend.currentPage + 1, false);
                }
                legend.render();
                legend.alignContentGroup(contentBox, padding);

                if (chart.pointer.selectionMarker) {
                    chart.pointer.selectionMarker = chart.pointer.selectionMarker.destroy();
                }

            }
        }

        function resizeStop() {
            if (chart.isResizingLegend) {
                legend.update();
            }
            chart.isResizingLegend = false;
        }

        // Mouse events
        chart.removeResizableEvents = [
            addEvent(legend.resizer.element, 'mousedown', resizeStart),
            addEvent(chart.container, 'mousemove', resizeStep),
            addEvent(document, 'mouseup', resizeStop),

            // Touch events
            addEvent(legend.resizer.element, 'touchstart', resizeStart),
            addEvent(chart.container, 'touchmove', resizeStep),
            addEvent(document, 'touchend', resizeStop)
        ];
    };

    H.Legend.prototype.alignContentGroup = function (contentBox, padding) {
        var titleHeight = this.title ? this.title.getBBox(true).height : 0,
            yOffset = this.nav ? this.clipHeight + padding :
                contentBox.height - titleHeight;

        this.contentGroup.placed = false; // prevent animation
        this.contentGroup.align({
            align: 'center',
            verticalAlign: this.nav ? 'top' : 'middle',
            x: -Math.round(contentBox.width / 2) - 2 * padding,
            y: this.nav ? titleHeight : -Math.round(yOffset / 2) - (this.title ? 0 : padding)
        }, true, this.box.getBBox(true));
    }

    H.wrap(H.Legend.prototype, 'scroll', function (proceed, scrollBy, animation) {
        if (this.chart.afterLegendUpdate && scrollBy === 0) {
            return proceed.apply(this, [scrollBy, false]);
        } else {
            return proceed.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    });
    H.wrap(H.Legend.prototype, 'handleOverflow', function (proceed) {

        var ret = proceed.apply(this, Array.prototype.slice.call(arguments, 1));


        return defined(this.options.height) ? this.options.height : ret;
    });

    H.Legend.prototype.alignResizer = function () {
        var legend = this,
            resizerBBox = legend.resizer.getBBox(),
            resizerPadding = 5;

        if (legend.options.floating) {
            legend.resizer.show();
            legend.resizer.placed = false; // prevent animation
            legend.resizer.align({
                align: 'right',
                verticalAlign: 'bottom'
            }, true, {
                width: legend.legendWidth - resizerBBox.width - resizerPadding,
                height: legend.legendHeight - resizerBBox.height - resizerPadding,
                x: 0,
                y: 0
            });
        } else {
            legend.resizer.hide();
        }
    };

    wrap(H.Legend.prototype, 'destroy', function (proceed) {
        if (this.resizer) {
            this.chart.legend.options.x
            this.resizer = this.resizer.destroy();

            if (GlobalchartObj.legend != undefined) {
                if (this.chart.legend.options.x == 0 && this.chart.legend.options.y == 0) {
                    GlobalchartObj.legend.x = 0;
                    GlobalchartObj.legend.y = 0;
                    GlobalchartObj.legend.width = undefined;
                    GlobalchartObj.legend.verticalAlign = 'bottom';
                    GlobalchartObj.legend.floating = false;
                }
                else {
                    GlobalchartObj.legend.x = this.chart.legend.options.x;
                    GlobalchartObj.legend.y = this.chart.legend.options.y;
                    GlobalchartObj.legend.verticalAlign = 'top';
                    GlobalchartObj.legend.floating = true;
                    GlobalchartObj.legend.width = this.chart.legend.options.width;
                }
            }
        }
        return proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    });

    wrap(H.Legend.prototype, 'render', function (proceed) {
        var addEvents = !this.group;

        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        var legend = this,
            chart = legend.chart,
            options = legend.options,
            isDragging,
            downX,
            downY,
            optionsX,
            optionsY,
            currentX,
            currentY,
            changedDiff;

        function pointerDown(e) {
            changedDiff = 0;
            e = chart.pointer.normalize(e);
            downX = e.chartX;
            downY = e.chartY;
            optionsX = options.x;
            optionsY = options.y;
            currentX = legend.group.attr('translateX');
            currentY = legend.group.attr('translateY');
            isDragging = true;

            if (!legend.options.floating) {
                // Update parts
                optionsX = currentX = legend.group.attr('translateX');
                optionsY = currentY = legend.group.attr('translateY');
            }
        }

        function pointerMove(e) {
            if (isDragging && !chart.isResizingLegend) {
                e = chart.pointer.normalize(e);
                var draggedX = e.chartX - downX,
                    draggedY = e.chartY - downY;

                // Stop touch-panning the page
                e.preventDefault();

                // Do the move is we're inside the chart
                if (currentX + draggedX > 0 &&
                    currentX + draggedX + legend.legendWidth < chart.chartWidth &&
                    currentY + draggedY > 0 &&
                    currentY + draggedY + legend.legendHeight < chart.chartHeight) {

                    changedDiff = Math.max(
                        Math.abs(draggedX),
                        Math.abs(draggedY)
                    );

                    // Move mouse by at least 2px means user wants to drag&drop legend
                    // otherwise treat this as click event for hidin series
                    if (changedDiff > 2) {
                        options.x = optionsX + draggedX;
                        options.y = optionsY + draggedY;
                        options.floating = true;
                        options.verticalAlign = 'top';
                        legend.group.placed = false; // prevent animation
                        legend.group.align(H.extend({
                            width: legend.legendWidth,
                            height: legend.legendHeight
                        }, options), true, 'spacingBox');
                        legend.positionCheckboxes();
                    }

                }
                if (chart.pointer.selectionMarker) {
                    chart.pointer.selectionMarker = chart.pointer.selectionMarker.destroy();
                }

            }
        }

        function pointerUp() {
            if (isDragging && changedDiff && !chart.isResizingLegend) {
                chart.afterLegendUpdate = true;
                // Update legend, if necessary:
                if (options.y + legend.legendHeight > chart.chartHeight * 0.9) {
                    chart.update({
                        legend: {
                            x: 0,
                            y: 0,
                            floating: false,
                            verticalAlign: 'bottom',
                            layout: 'horizontal',
                            width: 0, // auto calculate
                            height: null
                        }
                    });
                } else {
                    chart.update({
                        legend: {
                            floating: true
                        }
                    });
                }
            }
            isDragging = false;
        }

        function alignToLeft() {
            if (options.x + legend.legendWidth > chart.containerWidth) {
                options.x = chart.containerWidth - legend.legendWidth - 10;

                legend.group.placed = false; // prevent animation
                legend.group.align(H.extend({
                    width: legend.legendWidth,
                    height: legend.legendHeight
                }, options), true, 'spacingBox');
                legend.positionCheckboxes();
            }
        }

        if (options.draggable && legend.group && addEvents) {
            if (chart.removeDraggableEvents) {
                H.each(chart.removeDraggableEvents, function (unbind) {
                    unbind();
                });
            }

            legend.group.css({ cursor: 'move' });

            // Mouse events
            chart.removeDraggableEvents = [
                addEvent(legend.group.element, 'mousedown', pointerDown),
                addEvent(chart.container, 'mousemove', pointerMove),
                addEvent(document, 'mouseup', pointerUp),

                // Touch events
                addEvent(legend.group.element, 'touchstart', pointerDown),
                addEvent(chart.container, 'touchmove', pointerMove),
                addEvent(document, 'touchend', pointerUp),

                // Redraw event
                addEvent(chart, 'redraw', alignToLeft)
            ];
        }
    });
}(Highcharts));
