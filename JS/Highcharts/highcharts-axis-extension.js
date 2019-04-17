(function (H) {
	// Add new option: "crossValue"
	H.wrap(H.Axis.prototype, 'render', function (p) {
		var axis = this,
			options = axis.options,
			crossVal,
			horizOrVertAxis = axis.isXAxis ? axis.chart.yAxis[0] : axis.chart.xAxis[0],
			attrs,
			endColor,
			startColor,
			gradient = axis.isXAxis ? [0, 0, 0, axis.height] : [0, 0, axis.width, 0],
			bright = 0.4;

		// Add gridline gradient support:
		if (options.gridLineStyle === "Gradient") {
			endColor = H.Color(options.gridLineColor).brighten(-bright).get();
			startColor = H.Color(options.gridLineColor).get();

			if (startColor === endColor) {
				endColor = H.Color(options.gridLineColor).brighten(bright).get();
			}

			options.gridLineColor = {
				linearGradient: gradient,
				stops: [
					[0, startColor],
					[1, endColor]
				]
			};
		}
		// Add minor-gridline gradient support:
		if (options.minorGridLineStyle === "Gradient") {
			endColor = H.Color(options.minorGridLineColor).brighten(-bright).get();
			startColor = H.Color(options.minorGridLineColor).get();

			if (startColor === endColor) {
				endColor = H.Color(options.minorGridLineColor).brighten(bright).get();
			}

			options.minorGridLineColor = {
				linearGradient: gradient,
				stops: [
					[0, startColor],
					[1, endColor]
				]
			};
		}

		p.apply(this, [].slice.call(arguments, 1));

		if (axis.options.crossValue) {
			crossVal = horizOrVertAxis.toPixels(axis.options.crossValue, true);

			if (axis.isXAxis) {
				attrs = { 
					translateY: crossVal - axis.height 
				};
			} else if (axis.opposite) {
				attrs = { 
					translateX: crossVal - axis.width
				};
			} else {
				attrs = { 
					translateX: crossVal
				};
			}

			axis.axisGroup.attr(attrs);
			axis.labelGroup.attr(attrs);
		}
	});

	H.wrap(H.Axis.prototype, 'log2lin', function (p, num) {
		var ret;
		if (this instanceof H.Axis && this.options.logBase) {
			ret = Math.log(num) / Math.log(this.options.logBase);
		} else {
			ret = p.apply(this, [].slice.call(arguments, 1));
		}

		return ret;
	});

	H.wrap(H.Axis.prototype, 'lin2log', function (p, num) {
		var ret;
		if (this instanceof H.Axis && this.options.logBase) {
			ret =  Math.pow(this.options.logBase, num);
		} else {
			ret = p.apply(this, [].slice.call(arguments, 1));
		}

		return ret;
	});

	H.wrap(H.Legend.prototype, 'render', function (p) {
		p.apply(this, Array.prototype.slice.call(arguments, 1));

		if (this.group) {
			this.group.attr({
				zIndex: 10
			});
		}
	});

})(Highcharts)