/**
* Selection marker options:
**/
(function (H) {
	H.wrap(H.Pointer.prototype, 'drag', function (proceed) {
		var method;
	//	if (this.chart.selectionType != undefined) {
		    switch (selectionType || 'rectangle') {
		        case 'rectangle':
		            this.zoomVert = this.zoomHor = true;
		            method = proceed;
		            break;
		        case 'xRange':
		            this.zoomVert = true;
		            this.zoomHor = false;
		            method = proceed;
		            break;
		        case 'yRange':
		            this.zoomVert = false;
		            this.zoomHor = true;
		            method = proceed;
		            break;
		        case 'lasso':
		            this.zoomVert = this.zoomHor = false;
		            method = lassoDrag;
		            break;
		    }

		    method.apply(this, Array.prototype.slice.call(arguments, 1));
		//}
	});

	H.wrap(H.Pointer.prototype, 'drop', function (proceed) {
		var method;

		switch (selectionType || 'rectangle') {
			case 'rectangle':
				method = proceed;
				break;
			case 'xRange':
				method = proceed;
				break;;
			case 'yRange':
				method = proceed;
				break;
			case 'lasso':
				method = lassoDrop;
				break;
		}

		method.apply(this, Array.prototype.slice.call(arguments, 1));
	});

	function lassoDrag(e) {
		var chart = this.chart,
			chartOptions = chart.options.chart,
			chartX = e.chartX,
			chartY = e.chartY,
			plotLeft = chart.plotLeft,
			plotTop = chart.plotTop,
			plotWidth = chart.plotWidth,
			plotHeight = chart.plotHeight,
			clickedInside,
			selectionMarker = this.selectionMarker,
			mouseDownX = this.mouseDownX,
			mouseDownY = this.mouseDownY;

		// If the device supports both touch and mouse (like IE11), and we are touch-dragging
		// inside the plot area, don't handle the mouse event. #4339.
		if (selectionMarker && selectionMarker.touch) {
			return;
		}

		// If the mouse is outside the plot area, adjust to cooordinates
		// inside to prevent the selection marker from going outside
		if (chartX < plotLeft) {
			chartX = plotLeft;
		} else if (chartX > plotLeft + plotWidth) {
			chartX = plotLeft + plotWidth;
		}

		if (chartY < plotTop) {
			chartY = plotTop;
		} else if (chartY > plotTop + plotHeight) {
			chartY = plotTop + plotHeight;
		}

		// determine if the mouse has moved more than 10px
		this.hasDragged = Math.sqrt(
			Math.pow(mouseDownX - chartX, 2) +
			Math.pow(mouseDownY - chartY, 2)
		);

		if (this.hasDragged > 10) {
			clickedInside = chart.isInsidePlot(mouseDownX - plotLeft, mouseDownY - plotTop);

			// make a selection
			if (chart.hasCartesianSeries && clickedInside) {
				if (!selectionMarker) {
					this.selectionMarkerPath = ['M', chartX, chartY];
					this.selectionCoordinates = [];
					this.selectionMarker = selectionMarker = chart.renderer.path(this.selectionMarkerPath)
						.attr({
							fill: chartOptions.selectionMarkerFill || H.color('#335cad').setOpacity(0.25).get(),
							'class': 'highcharts-selection-marker',
							'zIndex': 7,
							'fill-rule': 'evenodd'
						})
						.add();
				}
			}

			if (selectionMarker) {
				this.selectionMarkerPath = this.selectionMarkerPath.concat('L', chartX, chartY);
				this.selectionCoordinates.push([chartX, chartY]);
				selectionMarker.attr({
					d: this.selectionMarkerPath.concat(['Z'])
				});
			}
		}
	};

	function lassoDrop(e) {
		var chart = this.chart,
			selectionData;

		if (this.selectionMarker) {
			selectionData = {
				originalEvent: e,
				xAxis: chart.xAxis.map(function (ax) { return { axis: ax }; }),
				yAxis: chart.yAxis.map(function (ax) { return { axis: ax }; }),
				points: []
			};

			for (var k = 0; k < chart.yAxis.length; k++) {
				var axis = chart.yAxis[k];
				selectionData.points[k] = [];
				for (var i = 0; i < axis.series.length; i++) {
					var series = axis.series[i];
					if (!series.options.id || !series.options.id.match('selection-series')) {
					    if (series.points != undefined && series.visible == true) {
					    for (var j = 0; j < series.points.length; j++) {
					       
					            var point = series.points[j];

					            if (pointInPolygon(point, this.selectionCoordinates, chart.plotLeft, chart.plotTop)) {
					                selectionData.points[k].push(series.options.data[point.i != undefined ? point.i : point.index]);
					            }
					        }
						}
					}
				}
			}


			this.selectionMarker = this.selectionMarker.destroy();

			H.fireEvent(chart, 'selection', selectionData);
		}

		chart.mouseIsDown = this.hasDragged = this.hasPinched = false;
	}

	var pointInPolygon = function(point, vs, left, top) {
		// ray-casting algorithm based on
		// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

		var x = point.plotX + left,
			y = point.plotY + top,
			inside = false,
			intersect;

		for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			var xi = vs[i][0],
				yi = vs[i][1],
				xj = vs[j][0],
				yj = vs[j][1];

			intersect = ((yi > y) != (yj > y)) &&
				(x < (xj - xi) * (y - yi) / (yj - yi) + xi);

			if (intersect) {
				inside = !inside;
			}
		}

		return inside;
	};
})(Highcharts);