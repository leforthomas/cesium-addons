/**
 * Created by thomas on 30/01/14.
 */

    // alternative using a canvas
    // issues are rendering along the poles as well as tile refresh not working on the edges

var GraticuleTilesImages = (function() {

    function defaultValue(options, defaultOptions) {
        var newOptions = {}, option;
        for(option in options) {
            newOptions[option] = options[option];
        }
        for(option in defaultOptions) {
            if(newOptions[option] === undefined) {
                newOptions[option] = defaultOptions[option];
            }
        }
        return newOptions;
    }

    function _(description) {

        description = description || {};

        this._tilingScheme = description.tilingScheme || new Cesium.GeographicTilingScheme();

        this._cells = description.cells || 8;
        this._color = description.color || new Cesium.Color(1.0, 1.0, 1.0, 0.4);
        this._glowWidth = description.glowWidth || 6;
        this._backgroundColor = description.backgroundColor || new Cesium.Color(0.0, 0.5, 0.0, 0.2);

        this._tileWidth = description.tileWidth || 256;
        this._tileHeight = description.tileHeight || 256;

        // A little larger than tile size so lines are sharper
        // Note: can't be too much difference otherwise texture blowout
        this._canvasSize = description.canvasSize || 256;

        // default to decimal intervals
        this._sexagesimal = description.sexagesimal || false;
        this._numLines = description.numLines || 50;

    };

    _.prototype.getProxy = function() {
        return undefined;
    };

    _.prototype.getTileWidth = function() {
        return this._tileWidth;
    };

    _.prototype.getTileHeight = function() {
        return this._tileHeight;
    };

    _.prototype.getMaximumLevel = function() {
        return undefined;
    };

    _.prototype.getMinimumLevel = function() {
        return undefined;
    };

    _.prototype.getTilingScheme = function() {
        return this._tilingScheme;
    };

    _.prototype.getExtent = function() {
        return this._tilingScheme.getExtent();
    };

    _.prototype.getTileDiscardPolicy = function() {
        return undefined;
    };

    _.prototype.getErrorEvent = function() {
        return this._errorEvent;
    };

    _.prototype.isReady = function() {
        return true;
    };

    _.prototype._drawGrid = function(context, x, y, level) {

        var minPixel = 0;
        var maxPixel = this._canvasSize;
        var extent = this._tilingScheme.tileXYToNativeExtent(x, y, level);
        var l = extent.west,
            b = extent.south,
            r = extent.east,
            t = extent.north;

        var yRatio = maxPixel / (t - b);
        var xRatio = maxPixel / (r - l);

        var dLat = 0, dLng = 0, index;
        // get the nearest to the calculated value
        for(index = 0; index < mins.length && dLat < ((t - b) / 10); index++) {
            dLat = mins[index];
        }
        for(index = 0; index < mins.length && dLng < ((r - l) / 10); index++) {
            dLng = mins[index];
        }

        // round iteration limits to the computed grid interval
        l = (l < 0 ? Math.ceil(l / dLng) : Math.floor(l / dLng)) * dLng;
        b = (b < 0 ? Math.ceil(b / dLat) : Math.floor(b / dLat)) * dLat;
        t = (t < 0 ? Math.ceil(t / dLat) : Math.floor(t / dLat)) * dLat;
        r = (r < 0 ? Math.ceil(r / dLng) : Math.floor(r / dLng)) * dLng;
        if (r == l) l += dLng;

        // labels on second column to avoid peripheral controls
        var y = maxPixel - (b + 2 * dLat - extent.south) * yRatio;
        for (var lo = l; lo < r; lo += dLng) {
            // draw meridian
            var px = (lo - extent.west) * xRatio;
            context.moveTo(px, minPixel);
            context.lineTo(px, maxPixel);
            context.fillText(this._sexagesimal ? this.decToSex(lo) : lo.toFixed(gridPrecision(dLng)), px + 17, y - 3);
        }

        // lats
        var x = (l + 2 * dLng - extent.west) + xRatio;
        for (; b <= t; b += dLat) {
            var py = maxPixel - (b - extent.south) * yRatio;
            // draw parallels
            context.moveTo(minPixel, py);
            context.lineTo(maxPixel, py);
            context.fillText(this._sexagesimal ? this.decToSex(b) : b.toFixed(gridPrecision(dLng)), x, py);
        }
        context.stroke();
    };

    _.prototype._createGridCanvas = function(x, y, level) {
        var canvas = document.createElement('canvas');
        canvas.width = this._canvasSize;
        canvas.height = this._canvasSize;
        var minPixel = 0;
        var maxPixel = this._canvasSize;

        var context = canvas.getContext('2d');

        // Glow for grid lines
        var cssColor = this._color.toCssColorString();
        context.strokeStyle = cssColor;
        context.lineWidth = 1;
        context.fillStyle = "white";
        context.font = "10px Arial";

        this._drawGrid(context, x, y, level);

        return canvas;
    };

    _.prototype.requestImage = function(x, y, level) {

        loggingMessage("Request image " + x + ", " + y + ", " + level);

        return this._createGridCanvas(x, y, level);
    };

    _.prototype.getCredit = function() {
        return undefined;
    };

    _.prototype.latLngToPixel = function(lat, lng, extent, width, height) {
        return ;
    }

    _.prototype.decToSex = function(d) {
        var degs = Math.floor(d);
        var mins = ((Math.abs(d) - degs) * 60.0).toFixed(2);
        if (mins == "60.00") { degs += 1.0; mins = "0.00"; }
        return [degs, ":", mins].join('');
    };

    function gridPrecision(dDeg) {
        if (dDeg < 0.01) return 3;
        if (dDeg < 0.1) return 2;
        if (dDeg < 1) return 1;
        return 0;
    }

    var mins = [
        0.05,
        0.1,
        0.2,
        0.5,
        1.0,
        2.0,
        5.0,
        10.0
    ];

    function loggingMessage(message) {
        var logging = document.getElementById('logging');
        logging.innerHTML += message;
    }

    _.prototype.getExtentView = function(){
        var controller = this._scene.getCamera().controller;
        var canvas = this._scene.getCanvas();
        var corners = [
            controller.pickEllipsoid(new Cesium.Cartesian2(0, 0), this._ellipsoid),
            controller.pickEllipsoid(new Cesium.Cartesian2(canvas.width, 0), this._ellipsoid),
            controller.pickEllipsoid(new Cesium.Cartesian2(0, canvas.height), this._ellipsoid),
            controller.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height), this._ellipsoid)
        ];
        for(var index = 0; index < 4; index++) {
            if(corners[index] === undefined) {
                return Cesium.Extent.MAX_VALUE;
            }
        }
        return Cesium.Extent.fromCartographicArray(this._ellipsoid.cartesianArrayToCartographicArray(corners));
    }

    return _;

})();
