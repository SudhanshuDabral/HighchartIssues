$(document).ready(function () {
    //#region GLOBAL HIGHCHARTS DECLARATION
    Highcharts.setOptions({
       // colors: ["#DDDF0D", "#7798BF", "#55BF3B", "#DF5353", "#AAEEEE", "#ff0066", "#EEAAEE", "#55BF3B", "#DF5353", "#7798BF", "#AAEEEE"],
        //chart: {
        //    backgroundColor:
        //        {
        //            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
        //            stops: [
        //               [0, 'rgb(255, 255, 255)'],
        //               [1, 'rgb(240, 240, 255)']
        //            ],
        //            style: {
        //                color: '#FF9999',
        //                fill: '#FF9999'
        //            }
        //        },
        //    style: {
        //        fontFamily: 'Verdana'
        //    },
        //    //height: 360,
        //    //borderWidth: 1,
        //    //borderColor: '#DDDDDD',
        //    //  plotBackgroundColor: 'rgba(255, 255, 255, .9)',
        //   // plotShadow: true,
        //    plotBorderWidth: 1
        //    // alignTicks: false
        //},
        //title: {
        //    //style: {
        //    //    color: '#000000',
        //    //    font: '16px bold Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
        //    //}
        //    text: ''
        //},
        //subtitle: {
        //    style: {
        //        color: '#666666',
        //        font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        //    }
        //},
        //xAxis: {
        //    gridLineWidth: 1,
        //    lineColor: '#000',
        //    tickColor: '#000',
        //    labels: {
        //        style: {
        //            fontFamily: 'Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif',
        //            color: '#000099',
        //            fontWeight: 'bold'
        //        }
        //    },
        //    title: {
        //        style: {
        //            color: '#101010',
        //            font: '12px bold Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'

        //        }
        //    }
        //},
        //yAxis: {
        //    startOnTick: false,
        //    endOnTick: false,
        //    minorTickInterval: 'auto',
        //    lineColor: '#000',
        //    lineWidth: 1,
        //    tickWidth: 1,
        //    tickColor: '#000',
        //    labels: {
        //        style: {
        //            fontFamily: 'Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif',
        //            color: '#6600CC',
        //            fontWeight: 'bold'
        //        }
        //    },
        //    title: {
        //        style: {
        //            color: '#333',
        //            fontWeight: 'bold',
        //            fontSize: '12px',
        //            fontFamily: 'Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
        //        }
        //    }
        //},
        //legend: {
        //    itemStyle: {
        //        fontFamily: 'Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif',
        //        color: 'black',
        //        fontWeight: 'normal'

        //    },
        //    itemHoverStyle: {
        //        color: '#039'
        //    },
        //    itemHiddenStyle: {
        //        color: 'gray'
        //    }
        //},
       
        //labels: {
        //    style: {
        //        color: '#99b'
        //    }
        //},
        //navigation: {
        //    //buttonOptions: {
        //    //    theme: {
        //    //       // stroke: '#CCCCCC'
        //    //    }
        //    //}
        //},
        //tooltip: {
        //    backgroundColor: {
        //        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //        stops: [
        //           [0, 'rgba(96, 96, 96, .8)'],
        //           [1, 'rgba(16, 16, 16, .8)']
        //        ]
        //    },
        //    borderWidth: 0,
        //    style: {
        //        color: '#FFF'
        //    }
        //},
        //plotOptions: {
        //    series: {
        //        //turboThreshold: 10000,
        //        //boostThreshold: 5,
        //        nullColor: '#444444',
        //        states: {
        //            hover: {
        //                enabled: true,
        //                lineWidth: 2
        //            }
        //        }
        //        //marker: {
        //        //    symbol: "circle"
        //        //}
        //    },
        //    line: {
        //        dataLabels: {
        //            color: '#b22222'
        //        },
        //        marker: {
        //            lineColor: '#333'
        //        }
        //    },
        //    spline: {
        //        marker: {
        //            lineColor: '#333'
        //        }
        //    },
        //    scatter: {
        //        marker: {
        //            lineColor: '#333'
        //        }
        //    },
        //    candlestick: {
        //        lineColor: 'white'
        //    }
        //},
        //toolbar: {
        //    itemStyle: {
        //        color: '#CCC'
        //    }
        //},
        //navigation: {
        //    buttonOptions: {
        //        symbolStroke: '#DDDDDD',
        //        //hoverSymbolStroke: '#FFFFFF',
        //        theme: {
        //            fill: {
        //                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //                stops: [
        //                   [0.4, 'white'],//0AA699
        //                   [0.6, 'white']
        //                ]
        //            },
        //            stroke: '#E1DCCE'
        //        }
        //    }
        //    //menuItemStyle: {
        //    //    fontWeight: 'normal',
        //    //    background: 'none'
        //    //},
        //    //menuItemHoverStyle: {
        //    //    fontWeight: 'bold',
        //    //    background: 'none',
        //    //    color: 'black'
        //    //}
        //},
        //// scroll charts
        //rangeSelector: {
        //    buttonTheme: {
        //        fill: {
        //            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //            stops: [
        //               [0.4, '#888'],
        //               [0.6, '#555']
        //            ]
        //        },
        //        stroke: '#000000',
        //        style: {
        //            color: '#CCC',
        //            fontWeight: 'bold'
        //        },
        //        states: {
        //            hover: {
        //                fill: {
        //                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //                    stops: [
        //                       [0.4, '#BBB'],
        //                       [0.6, '#888']
        //                    ]
        //                },
        //                stroke: '#000000',
        //                style: {
        //                    color: 'white'
        //                }
        //            },
        //            select: {
        //                fill: {
        //                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //                    stops: [
        //                       [0.1, '#000'],
        //                       [0.3, '#333']
        //                    ]
        //                },
        //                stroke: '#000000',
        //                style: {
        //                    color: 'yellow'
        //                }
        //            }
        //        }
        //    },
        //    inputStyle: {
        //        backgroundColor: '#333',
        //        color: 'silver'
        //    },
        //    labelStyle: {
        //        color: 'silver'
        //    }
        //},
        //navigator: {
        //    handles: {
        //        backgroundColor: '#666',
        //        borderColor: '#AAA'
        //    },
        //    outlineColor: '#CCC',
        //    maskFill: 'rgba(16, 16, 16, 0.5)',
        //    series: {
        //        color: '#7798BF',
        //        lineColor: '#A6C7ED'
            //    }
        //},
        //scrollbar: {
        //    barBackgroundColor: {
        //        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //        stops: [
        //           [0.4, '#888'],
        //           [0.6, '#555']
        //        ]
        //    },
        //    barBorderColor: '#CCC',
        //    buttonArrowColor: '#CCC',
        //    buttonBackgroundColor: {
        //        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //        stops: [
        //           [0.4, '#888'],
        //           [0.6, '#555']
        //        ]
        //    },
        //    buttonBorderColor: '#CCC',
        //    rifleColor: '#FFF',
        //    trackBackgroundColor: {
        //        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        //        stops: [
        //           [0, '#000'],
        //           [1, '#333']
        //        ]
        //    },
        //    trackBorderColor: '#666'
        //},
        //// special colors for some of the demo examples
        //legendBackgroundColor: 'rgba(48, 48, 48, 0.8)',
        //background2: 'rgb(70, 70, 70)',
        //dataLabelsColor: '#444',
        //textColor: '#E0E0E0',
        //maskColor: 'rgba(255,255,255,0.3)',
        //global: {
        //    VMLRadialGradientURL: 'http://code.highcharts.com/{version}/gfx/vml-radial-gradient.png',  // Path to the pattern image required by VML browsers in order to draw radial gradients.
        //    canvasToolsURL: 'http://code.highcharts.com/{version}/modules/canvas-tools.js',            // The URL to the additional file to lazy load for Android 2.x devices. These devices don't support SVG, so we download a helper file that contains canvg, its dependency rbcolor, and our own CanVG Renderer class.
        //    timezoneOffset: 0,  // The timezone offset in minutes
        //    useUTC: true        // Whether to use UTC time for axis scaling, tick mark placement and time display in Highcharts.dateFormat. 
            //},
        lang: {
            WellSelectionCustomizeChart: "Customize Chart",
            zoomInWellSelectionPlot: "Zoom In",
            zoomOutWellSelectionPlot: "Zoom Out",
            WellSelectionUnSelectAll: "UnSelect All",
            WellSelectionSelectAll: "Select All",
            WellSelectionManualDraw: "ManualDraw",
            WellSelectionDrawSlope: "Draw Slope",
            EnableWellSelectionSelectMode: "Enable Select Mode",
            WellSelectionManualSelect: "Manual Select",
            WellSelectionRefresh: "Reset",
            WellSelectionUndo: "Undo",

            divDynamicPlotMap: {},

            SpecialPlotCustomizeChart: "Customize Chart",
            SpecialPlotZoomIn: "Zoom In",
            SpecialPlotZoomOut: "Zoom Out",
            SpecialPlotUndo: "Undo",
            SpecialPlotSelectAll: "Select All",
            SpecialPlotUnSelectAll: "UnSelect All",
            SpecialPlotManualSelect: "Manual Select",
            SpecialPlotSelectMode: "Enable Select Mode",
            SpecialPlotDrawSlope: "Draw Slope",
            SpecialPlotManualDraw: "Manual Draw",
            SpecialPlotRefresh: "Reset",
            SpecialPlotRegression: "Calculate Slope",

            btnSelectionContextMenu: 'Change selection type',
            lassoSelection: 'Lasso selection',
            rectangleSelection: 'Rectangle selection',
            xRangeSelection: 'Y-Range selection',
            yRangeSelection: 'X-Range selection',


            RTACustomizeChart: "Customize Chart",
            RTAZoomIn: "Zoom In",
            RTAZoomOut: "Zoom Out",
            RTAUndo: "Undo",
            RTADiagnosticSelectAll: "Select All",
            RTASelectAll: "Select All",
            RTAUnSelectAll: "UnSelect All",
            RTAManualSelect: "Manual Select",
            RTASelectMode: "Enable Select Mode",
            RTADrawSlope: "Draw Slope",
            RTAManualDraw: "Manual Draw",
            RTARefresh: "Reset",
            btnAnnotationsContextMenu: 'Add annotation',
            Exclude: 'Delete Point',
            Region:'Region Settings',


            btnSelectionContextMenu: 'Change selection type',
            lassoSelection: 'Lasso selection',
            rectangleSelection: 'Rectangle selection',
            xRangeSelection: 'Y-Range selection',
            yRangeSelection: 'X-Range selection',
            contextButtonTitle: 'Export Options',  // Exporting module menu. The tool tip title for the context menu holding print and export menu items.
            decimalPoint: '.',                         // The default decimal point used in the Highcharts.numberFormat method unless otherwise specified in the function arguments.
            downloadJPEG: 'Download JPEG image',       // Exporting module only. The text for the JPEG download menu item.
            downloadPDF: 'Download PDF document',      // Exporting module only. The text for the PDF download menu item.
            downloadSVG: 'Download SVG vector image',  // Exporting module only. The text for the SVG download menu item.
            drillUpText: 'Back to {series.name}',      // The text for the button that appears when drilling down, linking back to the parent series.
            loading: 'Loading...',                     // The loading text that appears when the chart is set into the loading state following a call to chart.showLoading.
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],  // An array containing the months names. Corresponds to the %B format in Highcharts.dateFormat().
            noData: 'No data to display',                      // The text to display when the chart contains no data. Requires the no-data module, see noData.
            numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E'],    // Metric prefixes used to shorten high numbers in axis labels. Replacing any of the positions with null causes the full number to be written.
            printChart: 'Print chart',  // Exporting module only. The text for the menu item to print the chart.
            resetZoom: 'Reset zoom',    // The text for the label appearing when a chart is zoomed.
            resetZoomTitle: 'Reset zoom level 1:1',  // The tooltip title for the label appearing when a chart is zoomed.
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],  // An array containing the months names in abbreviated form. Corresponds to the %b format in Highcharts.dateFormat().
            thousandsSep: ',',  // The default thousands separator used in the Highcharts.numberFormat method unless otherwise specified in the function arguments.
            weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // An array containing the weekday names.
            numericSymbols: null, //otherwise by default ['k', 'M', 'G', 'T', 'P', 'E']
            annotationSlope: '<img style="padding: 5px" data-toggle="tooltip" title="line" src="../Images/line.png"/>',
            annotationRect: '<img style="padding: 5px" data-toggle="tooltip" title="Square" src="../Images/square.gif"/>',
            annotationText: '<img style="padding: 5px" data-toggle="tooltip" title="Text" src="../Images/Text.png"/>',
            annotationCircle: '<img style="padding: 5px" data-toggle="tooltip" title="Circle" src="../Images/Circle.png"/>'
        },
        credits: {
            enabled: false
        }
    });
    //#endregion GLOBAL HIGHCHARTS DECLARATION

    $('#divChartMaximize').on('shown.bs.modal', function () {
        $(document).off('focusin.modal');
    });

});

