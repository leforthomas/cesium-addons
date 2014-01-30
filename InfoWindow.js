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
        div.innerHTML = "<div id='frame'>" +
            "<span id='close'>x</span>" +
            "<div id='content'></div>" +
            "</div>" +
            "<span id='arrow'></span>";
        cesiumWidget.container.appendChild(div);
        this._content = document.getElementById('content');
        this._close = document.getElementById('close');
        var _self = this;
        this._close.onclick = function() {
            _self.setVisible(false);
        }

        this.setVisible(true);

    };

    _.prototype.setVisible = function(visible) {
        this._visible = visible;
        this._div.style.display = visible ? 'relative' : 'none';
    }

    _.prototype.setContent = function(content) {
        if(typeof content == 'String') {
            this._content.innerHTML = content;
        } else {
            this._content.appendChild(content);
        }
    }

    _.prototype.setPosition = function(lat, lng) {
        this._position = this._scene.getPrimitives().getCentralBody().getEllipsoid().cartographicToCartesian(Cesium.Cartographic.fromDegrees(lat, lng, 0));
    }

    _.prototype.showAt = function(lat, lng, content) {
        this.setPosition(lat, lng);
        this.setContent(content);
        this.setVisible(true);
    }

    _.prototype.hide = function() {
        this.setVisible(false);
    }

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

    return _;

})();
