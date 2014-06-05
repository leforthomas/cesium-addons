/**
 * Created by thomas on 27/01/14.
 */

var InfoWindow = (function() {

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

    function _(description, cesiumWidget) {

        description = description || {};

        this._scene = cesiumWidget.scene;

        var div = document.createElement('div');
        div.className = 'infoWindow';
        this._div = div;
        var frame = document.createElement('div');
        frame.className = 'frame';
        this._div.appendChild(frame)
        var close = document.createElement('span');
        close.innerHTML = 'x';
        close.className = 'close';
        frame.appendChild(close);
        var content = document.createElement('div');
        content.className = 'content';
        frame.appendChild(content)
        var arrow = document.createElement('span');
        arrow.className = 'arrow';
        div.appendChild(arrow);
        cesiumWidget.container.appendChild(div);
        this._content = content;
        this._close = close;
        var _self = this;
        this._close.onclick = function() {
            _self.setVisible(false);
        }

        this.setVisible(true);

    };

    _.prototype.setVisible = function(visible) {
        this._visible = visible;
        this._div.style.display = visible ? 'block' : 'none';
    }

    _.prototype.setContent = function(content) {
        if(typeof content == 'string') {
            this._content.innerHTML = content;
        } else {
            while(this._content.firstChild) {
                this._content.removeChild(this._content.firstChild);
            }
            this._content.appendChild(content);
        }
    }

    _.prototype.setPosition = function(lat, lng) {
        this._position = this._scene.globe.ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(lat, lng, 0));
    }

    _.prototype.showAt = function(lat, lng, content) {
        this.setPosition(lat, lng);
        this.setContent(content);
        this.setVisible(true);
    }

    _.prototype.hide = function() {
        this.setVisible(false);
    }

/*
    var viewProjection, viewPosition, coordinates;
    var viewport = new Cesium.BoundingRectangle();
    var viewportTransform = new Cesium.Matrix4();

    _.prototype.update = function(context, frameState, commandList) {
        if(!this._visible || !this._position) {
            return;
        }
        // get the position on the globe as screen coordinates
        viewProjection = this._scene.context.getUniformState().getViewProjection();
        viewPosition = Cesium.Matrix4.multiplyByVector(viewProjection, Cesium.Cartesian4.fromElements(this._position.x, this._position.y, this._position.z, 1));
        // Perspective divide to transform from clip coordinates to normalized device coordinates
        Cesium.Cartesian3.divideByScalar(viewPosition, viewPosition.w, viewPosition);
        // Assuming viewport takes up the entire canvas...
        viewport.width = context.getDrawingBufferWidth();
        viewport.height = context.getDrawingBufferHeight();
        Cesium.Matrix4.computeViewportTransformation(viewport, 0.0, 1.0, viewportTransform);
        // Viewport transform to transform from clip coordinates to drawing buffer coordinates
        coordinates = Cesium.Matrix4.multiplyByPoint(viewportTransform, viewPosition);
        if(coordinates) {
            this._div.style.left = (Math.floor(coordinates.x) - this._div.clientWidth / 2) + "px";
            this._div.style.bottom = (Math.floor(coordinates.y) + 8) + "px";
        } else {
            this._div.style.left = '-1000px';
        }
    }

*/

    _.prototype.update = function(context, frameState, commandList) {
        if(!this._visible || !this._position) {
            return;
        }
        // get the position on the globe as screen coordinates
        var coordinates = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this._scene, this._position);
        if(coordinates) {
            this._div.style.left = (Math.floor(coordinates.x) - this._div.clientWidth / 2) + "px";
            this._div.style.bottom = (Math.floor(coordinates.y) + 8) + "px";
        }
    }

    _.prototype.destroy = function() {
        this._div.parentNode.removeChild(this._div);
    }

    function loggingMessage(message) {
        var logging = document.getElementById('logging');
        logging.innerHTML = message;
    }

    return _;

})();
