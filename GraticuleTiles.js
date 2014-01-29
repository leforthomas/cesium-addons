/**
 * Created by thomas on 27/01/14.
 */

/*global define*/
var GraticuleTiles = (function() {

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

    var decmins = [
        0.06, // 0.001 degrees
        0.12, // 0.002 degrees
        0.3, // 0.005 degrees
        0.6, // 0.01 degrees
        1.2, // 0.02 degrees
        3, // 0.05 degrees
        6, // 0.1 degrees
        12, // 0.2 degrees
        30, // 0.5
        60, // 1
        60 * 2,
        60 * 5,
        60 * 10,
        60 * 20,
        60 * 30
    ];

    var sexmins = [
        0.01, // minutes
        0.02,
        0.05,
        0.1,
        0.2,
        0.5,
        1.0,
        3, // 0.05 degrees
        6, // 0.1 degrees
        12, // 0.2 degrees
        30, // 0.5
        60, // 1
        60 * 2,
        60 * 5,
        60 * 10,
        60 * 20,
        60 * 30
    ];

    function loggingMessage(message) {
        var logging = document.getElementById('logging');
        logging.innerHTML += message;
    }

    function eqE(a, b, e) {
        if (!e) {
            e = Math.pow(10, -6);
        }
        if (Math.abs(a - b) < e) {
            return true;
        }
        return false;
    }

    function npx(n) {
        return n.toString() + 'px';
    }

    function getExtentView(){
        var c2 = new Cesium.Cartesian2(0,0);
        var leftTop = scene.getCamera().controller.pickEllipsoid(c2, ellipsoid);

        c2 = new Cesium.Cartesian2(scene.getCanvas().width, scene.getCanvas().height);
        var rightDown = scene.getCamera().controller.pickEllipsoid(c2, ellipsoid);

        if(leftTop != null && rightDown != null){
            leftTop = ellipsoid.cartesianToCartographic(leftTop);
            rightDown = ellipsoid.cartesianToCartographic(rightDown);
            return new Cesium.Extent(leftTop.longitude, rightDown.latitude, rightDown.longitude, leftTop.latitude);
        }else{//The sky is visible in 3D
            return null;
        }
    }

    return _;

})();

/*global define*/
var GraticuleTilesLines = (function() {

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

    function _(description, scene) {

        description = description || {};

        this._tilingScheme = description.tilingScheme || new Cesium.GeographicTilingScheme();

        this._color = description.color || new Cesium.Color(1.0, 1.0, 1.0, 0.4);

        this._tileWidth = description.tileWidth || 256;
        this._tileHeight = description.tileHeight || 256;

        // default to decimal intervals
        this._sexagesimal = description.sexagesimal || false;
        this._numLines = description.numLines || 50;

        this._scene = scene;
        this._labels = new Cesium.LabelCollection();
        scene.getPrimitives().add(this._labels);
        this._polylines = new Cesium.PolylineCollection();
        scene.getPrimitives().add(this._polylines);
        this._ellipsoid = scene.getPrimitives().getCentralBody().getEllipsoid();

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
        return 18;
    };

    _.prototype.getMinimumLevel = function() {
        return 0;
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

    _.prototype.makeLabel = function(lng, lat, text, top, color) {
        this._labels.add({
            position : this._ellipsoid.cartographicToCartesian(new Cesium.Cartographic(lng, lat, 10.0)),
            text : text,
            font : 'normal',
            fillColor : 'white',
            outlineColor : 'white',
            style : Cesium.LabelStyle.FILL,
            pixelOffset : new Cesium.Cartesian2(5, top ? 5 : -5),
            eyeOffset : Cesium.Cartesian3.ZERO,
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : top ? Cesium.VerticalOrigin.BOTTOM : Cesium.VerticalOrigin.TOP,
            scale : 1.0
        });
    };

    _.prototype._drawGrid = function(extent) {

        if(this._currentExtent && this._currentExtent.equals(extent)) {
            return;
        }
        this._currentExtent = extent;

        this._polylines.removeAll();
        this._labels.removeAll();

        var minPixel = 0;
        var maxPixel = this._canvasSize;

        var dLat = 0, dLng = 0, index;
        // get the nearest to the calculated value
        for(index = 0; index < mins.length && dLat < ((extent.north - extent.south) / 10); index++) {
            dLat = mins[index];
        }
        for(index = 0; index < mins.length && dLng < ((extent.east - extent.west) / 10); index++) {
            dLng = mins[index];
        }

        // round iteration limits to the computed grid interval
        var minLng = (extent.west < 0 ? Math.ceil(extent.west / dLng) : Math.floor(extent.west / dLng)) * dLng;
        var minLat = (extent.south < 0 ? Math.ceil(extent.south / dLat) : Math.floor(extent.south / dLat)) * dLat;
        var maxLng = (extent.east < 0 ? Math.ceil(extent.east / dLat) : Math.floor(extent.east / dLat)) * dLat;
        var maxLat = (extent.north < 0 ? Math.ceil(extent.north / dLng) : Math.floor(extent.north / dLng)) * dLng;

        // extend to make sure we cover for non refresh of tiles
        minLng = Math.max(minLng - 2 * dLng, -Math.PI);
        maxLng = Math.min(maxLng + 2 * dLng, Math.PI);
        minLat = Math.max(minLat - 2 * dLat, -Math.PI / 2);
        maxLat = Math.min(maxLat + 2 * dLng, Math.PI / 2);

        var ellipsoid = this._ellipsoid;
        var lat, lng, granularity = Cesium.Math.toRadians(1);

        // labels positions
        var latitudeText = minLat + 4 * dLat;
        for(lng = minLng; lng < maxLng; lng += dLng) {
            // draw meridian
            var path = [];
            for(lat = minLat; lat < maxLat; lat += granularity) {
                path.push(new Cesium.Cartographic(lng, lat))
            }
            path.push(new Cesium.Cartographic(lng, maxLat));
            this._polylines.add({
                        positions : ellipsoid.cartographicArrayToCartesianArray(path),
                        width: 1
            });
            var degLng = Cesium.Math.toDegrees(lng);
            this.makeLabel(lng, latitudeText, this._sexagesimal ? this.decToSex(degLng) : degLng.toFixed(gridPrecision(degLng)), false);
        }

        // lats
        var longitudeText = minLng + 4 * dLng;
        for(lat = minLat; lat < maxLat; lat += dLat) {
            // draw parallels
            var path = [];
            for(lng = minLng; lng < maxLng; lng += granularity) {
                path.push(new Cesium.Cartographic(lng, lat))
            }
            path.push(new Cesium.Cartographic(maxLng, lat));
            this._polylines.add({
                positions : ellipsoid.cartographicArrayToCartesianArray(path),
                width: 1
            });
            var degLat = Cesium.Math.toDegrees(lat);
            this.makeLabel(longitudeText, lat, this._sexagesimal ? this.decToSex(degLat) : degLat.toFixed(gridPrecision(degLat)), true);
        }
    };

    _.prototype.requestImage = function(x, y, level) {

/*
        loggingMessage("Request image " + x + ", " + y + ", " + level);
*/

        this._drawGrid(this.getExtentView());

        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        return canvas;
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

    function gridPrecision(dDeg) {
        if (dDeg < 0.01) return 3;
        if (dDeg < 0.1) return 2;
        if (dDeg < 1) return 1;
        return 0;
    }

    var mins = [
        Cesium.Math.toRadians(0.05),
        Cesium.Math.toRadians(0.1),
        Cesium.Math.toRadians(0.2),
        Cesium.Math.toRadians(0.5),
        Cesium.Math.toRadians(1.0),
        Cesium.Math.toRadians(2.0),
        Cesium.Math.toRadians(5.0),
        Cesium.Math.toRadians(10.0)
    ];

    var decmins = [
        0.06, // 0.001 degrees
        0.12, // 0.002 degrees
        0.3, // 0.005 degrees
        0.6, // 0.01 degrees
        1.2, // 0.02 degrees
        3, // 0.05 degrees
        6, // 0.1 degrees
        12, // 0.2 degrees
        30, // 0.5
        60, // 1
        60 * 2,
        60 * 5,
        60 * 10,
        60 * 20,
        60 * 30
    ];

    var sexmins = [
        0.01, // minutes
        0.02,
        0.05,
        0.1,
        0.2,
        0.5,
        1.0,
        3, // 0.05 degrees
        6, // 0.1 degrees
        12, // 0.2 degrees
        30, // 0.5
        60, // 1
        60 * 2,
        60 * 5,
        60 * 10,
        60 * 20,
        60 * 30
    ];

    function loggingMessage(message) {
        var logging = document.getElementById('logging');
        logging.innerHTML += message;
    }

    function eqE(a, b, e) {
        if (!e) {
            e = Math.pow(10, -6);
        }
        if (Math.abs(a - b) < e) {
            return true;
        }
        return false;
    }

    function npx(n) {
        return n.toString() + 'px';
    }

    return _;

})();
