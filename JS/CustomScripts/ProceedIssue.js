$(function () {
    var RTAChartobj = {
        chart: getChartObj({ 'selectionCallBack': chartPointsSelection }),
        title: getTitleObj(),
        xAxis: getAxis({
            type: 'logarithmic', numberFormat: 'normal', decimalPlaces: 0, labelsformatter: false, minorTickInterval: 0.1, gridLineColor: '#e6e6e6',
            gridLineDashStyle: 'solid'
        }),

        yAxis: [getAxis({
            type: 'logarithmic', numberFormat: 'normal', decimalPlaces: 0, labelsformatter: false, minorTickInterval: 0.1, gridLineColor: '#e6e6e6',
            gridLineDashStyle: 'solid'
        })],

        annotationsOptions: {
            enabledButtons: true
        },
        annotations: [],
        global: {
            useUTC: false
        },
        tooltip: {
            snap: 0
        },
        exporting: {

        },
        plotOptions: {

        },
        legend: legendObj,
        scrollbar: {
            liveRedraw: true
        },
        series: []

    }
    var result = "ExportedFile";
    var RTAexportingbtn = {
        filename: result + '_RTA',
        sourceWidth: 1000,
        sourceHeight: 500,
        scale: 1,
        chartOptions: {
            title: {
                widthAdjust: -90,
                style: getTitleObj({ fontWeight: 'normal', fontSize: '10px' })
            },
            xAxis: {

                labels: {
                    rotation: 0,
                    style: getTitleObj({ fontWeight: 'normal', fontSize: '10px' })
                },

                title: getTitleObj({ fontWeight: 'bold', fontSize: '10px' })
            },
            yAxis:
                {

                    labels: {
                        rotation: 0,
                        style: {
                            color: '#000000',
                            fontVariant: '',
                            letterSpacing: 1,
                            fontWeight: 'normal',
                            textDecoration: '   ',
                            fontSize: '10px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    },

                    title: getTitleObj()
                },
            legend: {
                floating: false,
                draggable: false,
                verticalAlign: 'bottom',
                layout: 'horizontal',
                width: 200,
                align: 'left',
                x: 0,
                y: 0,
                labelFormat: '<span style="color:{color}">{name}</span>'
            }
        }
    }
    dataArray = [];
    for (var i = 0; i < 100; i++) {
        dataArray.push(
            {
                x: Math.random(),
                y: Math.random(),
                marker: {
                    fillColor: undefined,
                    states: {
                        hover: {
                            fillColor: undefined
                        }
                    }
                }
            });
    }

    var seriesData = [getSeries({ name: 'Derivatives', data: dataArray, color: '#7cb5ec', symbol: 'circle', dashStyle: 'solid', zoneAxis: 'x' }),
    // For each yAxis we need to create a separate selection-series,
    // Where we will store seleted points:
    getSeries({ id: 'selection-series-0', includeInCSVExport: false, showInLegend: false, type: 'scatter', zIndex: 100, data: [], color: 'rgba(200, 200, 200, 0.9)', symbol: 'circle', radius: 5, dashStyle: 'solid', zoneAxis: 'x', yAxis: 0 })]

    var RTAplotopt = {
        series: {
            turboThreshold: 10000000,
            boostThreshold: 1,
            cursor: 'pointer',
            events: {
                legendItemClick: function () {

                    
                }
            },

        }
    }

    RTAChartobj.legend.labelFormat = '<span style="color:{color}">{name}</span>:<b>{point.x:.2f} : {point.y:.2f}</b><br/>';
    RTAChartobj.series = seriesData;
    RTAChartobj.title.text = "";
    RTAChartobj.chart.renderTo = 'container';
    RTAChartobj.plotOptions = RTAplotopt;
    RTAChartobj.exporting = RTAexportingbtn;
    RTAChartobj.yAxis[0].title.text = "yAxis";
    RTAChartobj.xAxis.title.text = 'xAxis';
    var rtaxmin = Math.min.apply(Math, dataArray.map(function (i) {
        return i[0];
    })) > 0 ? Math.min.apply(Math, dataArray.map(function (i) {
        return i[0];
    })) : undefined;
    var rtaymin = Math.min.apply(Math, dataArray.map(function (i) {
        return i[1];
    })) > 0 ? Math.min.apply(Math, dataArray.map(function (i) {
        return i[1];
    })) : undefined;
    RTAChartobj.xAxis.min = RTAChartobj.xAxis.type == "logarithmic" ? rtaxmin : 0;
    RTAChartobj.yAxis[0].min = RTAChartobj.yAxis[0].type == "logarithmic" ? rtaymin : 0;

     RTAChartobj.annotations = [
        {
            anchorX: "left",
            anchorY: "top",
            allowDragY: true,
            allowDragX: true,
            xValue: .01,
            yValue: .02,
            xValueEnd: .4,
            yValueEnd: .4,
            plotType: '',
            shape: {
                type: 'path',
                params: {
                    cursor: "url(../Images/selection_cursor.png), pointer",
                    //d: ["M", 0, 0, 'L', dataArray[10].x, -10],
                    d: ["M", 0, 0, 'L', 0, 0],
                    // d: ["M", 0, 0, 'L', 200, chart.series[0].dataMin],
                    //   d: ["M", 0, 0, 'L', 200, -200],
                    stroke: 'Black',
                    'stroke-width': 4,
                    strokeWidth: 10
                }
            },
            events: {
                dblclick: function (e) {
                    this.destroy(); //destroy annotation
                }
            }
        }
    ];

    $('#container').highcharts(RTAChartobj);
    GlobalchartObj = RTAChartobj;

});
selectionType = '', GlobalchartObj = {};
var legendObj = {
    layout: 'horizontal',
    width: 200,
    backgroundColor: '#ffffff',
    align: 'left',
    verticalAlign: 'top',
    y: 60,
    x: 750,
    borderWidth: 1,
    borderRadius: 0,
    borderColor: '#CCCCCC',
    floating: true,
    draggable: true,
    resizable: true,
    zIndex: 20,
    labelFormat: '<span style="color:{color}">{name}</span>:<b>{point.x:.2f} : {point.y:.2f}</b><br/>',
    showvalue: true
}

var getChartObj = function (options) {
    return {
        zoomType: 'xy',
        renderTo: '',
        type: 'scatter',
        alignTicks: false,
        symbolX: 20,
        symbolY: 19,
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 1,
        marginTop: 50,
        events: {
            selection: options.selectionCallBack//chartPointsSelection
        },
        resetZoomButton: {
            theme: {
            }
        }
    }
};

var getTitleObj = function (options) {
    options = options ? options : {};
    return {
        text: '',
        style: {
            color: '#000000',
            fontVariant: '',
            letterSpacing: 1,
            fontWeight: options.fontWeight ? options.fontWeight : 'bold',
            textDecoration: '   ',
            fontSize: options.fontSize ? options.fontSize : '18px',
            fontFamily: 'Verdana, sans-serif'
        }
    }
};

var getAxis = function (options) {
    var tempObj = {
        type: options.type,//'double',
        minPadding: 0,
        maxPadding: 0,
        tickInterval: undefined,
        crossType: 'auto',
        crossValue: 0,
        numberFormat: options.numberFormat,//'normal',
        decimalPlaces: options.decimalPlaces,//0,
        axisUnit: 1,
        tickWidth: 0,
        startOnTick: true,
        endOnTick: true,
        allowDecimals: true,
        gridLineWidth: 1,
        minorGridLineWidth: 0,
        showLastLabel: true,
        tickPositioner: function () {
            var ticks;
            if (this.isLog) {
                ticks = this.getLogTickPositions(
                    1,
                    Math.min(this.min, 1),
                    this.max
                );
            } else {
                ticks = this.tickPositions;
            }

            return ticks;
        },
        labels: {
            rotation: 0,
            // useHTML: true,
            style: {
                color: '#000000',
                fontFamily: options.fontFamily ? options.fontFamily : 'arial',
                fontVariant: '',
                letterSpacing: 1,
                fontSize: '11px',
                fontWeight: 'normal',
                textDecoration: ''
            }
        },
        title: {
            text: '',//'(MD-TVD)',
            useHTML: true,
            style: {
                color: '#000000',
                fontVariant: '',
                letterSpacing: 1,
                fontWeight: 'bold',
                textDecoration: '   ',
                fontSize: '12px',
                fontFamily: 'Verdana, sans-serif'
            }
        }
    }
    if (options.labelsformatter) {
        tempObj.labels.formatter = function () {
            return this.value.toExponential(2);
        }
    }
    if (options.opposite) {
        tempObj.labels.opposite = options.opposite;
    }
    if (options.labelsY) {
        tempObj.labels.y = options.labelsY;
    }
    if (options.type === 'logarithmic') {
        tempObj.minorTickInterval = 0.1;
        tempObj.gridLineColor = '#e6e6e6';
        tempObj.gridLineDashStyle = 'Solid';
    }
    else if (options.type === 'double') {
        tempObj.tickAmount = 6;
    }
    return tempObj;
};

var getSeries = function (options) {
    var tempObj = {};
    if (options.id != undefined)
        tempObj.id = options.id;
    if (options.name != undefined)
        tempObj.name = options.name;

    tempObj.lineWidth = 0;
    tempObj.marker = {
        enabled: true,
        symbol: options.symbol,//'circle',
        radius: options.radius ? options.radius : 2 // this should be higher than default value from other series
    };
    tempObj.color = options.color;//zoneColor, // color of the selected points
    tempObj.data = options.data;//derivativeArray
    if (options.showInLegend != undefined) {
        tempObj.includeInCSVExport = false;
        tempObj.showInLegend = options.showInLegend;
        tempObj.zIndex = options.zIndex;//100,
    }
    if (options.yAxis != undefined)
        tempObj.yAxis = options.yAxis;
    if (options.dashStyle != undefined)
        tempObj.dashStyle = options.dashStyle;
    if (options.zoneAxis != undefined)
        tempObj.zoneAxis = options.zoneAxis;
    if (options.type != undefined)
        tempObj.type = options.type;
    if (options.regression != undefined) {
        tempObj.regression = false;
        tempObj.regressionSettings = {
            type: 'linear',
            color: '#000000'
        }
    }
    return tempObj;
}

function chartPointsSelection(event) {
    try {
        var chart = this,
            left = chart.plotLeft,
            top = chart.plotTop,
            minX, maxX,
            minY, maxY,
            selectionSeries;
        SelectedPointForUnduDelete = [];
        // Lasso (custom) selection provides already selected points,
        // But for other types, we need to find them:
        if (!event.points && event.xAxis) {
            event.points = [];

            $.each(chart.yAxis, function (k, axis) {
                event.points.push([]);
                minX = event.xAxis[0].axis.toPixels(event.xAxis[0].min) - left;
                maxX = event.xAxis[0].axis.toPixels(event.xAxis[0].max) - left;
                minY = axis.toPixels(event.yAxis[0].max) - top; // y-axis in browser is reversed
                maxY = axis.toPixels(event.yAxis[0].min) - top; // y-axis in browser is reversed

                $.each(axis.series, function (i, serie) {
                    if (!serie.options.id || !serie.options.id.match('selection-series')) {
                        if (serie.points != undefined && serie.visible == true) {
                            $.each(serie.points, function (j, point) {
                                if (point.plotY >= minY && point.plotY <= maxY && point.plotX >= minX && point.plotX <= maxX) {
                                    event.points[k].push(serie.options.data[point.i != undefined ? point.i : point.index]);
                                }
                            });
                        }
                    }
                });
            });

            event.preventDefault();
        }

        // If we have some selected points, for boost,
        // we need to add a separate series type with these points:
        Highcharts.each(chart.yAxis, function (axis, i) {
            selectionSeries = chart.get('selection-series-' + i);
            if (selectionSeries) {
                if (event.points) {
                    selectionSeries.setData(event.points[i], false);
                } else {
                    // Clear series if no points were selected:
                    selectionSeries.setData([], false);
                }
            }
        });
        chart.redraw();

       
    } catch (e) {
        HandleException(e);

    }
}
