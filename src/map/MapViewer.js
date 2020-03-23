import basemap from './Basemap';
import icon from '../img/icon-location2.png';

class MapViewer {
    constructor() {

    }

    loadMap(establishment) {
        var mapModal = document.getElementById("mapModal");
        mapModal.style.display = "block";

        var format = new ol.format.WKT();
        let wktPoint = establishment.COORDENADAS;

        var feature = format.readFeature(wktPoint, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });

        feature.set("name", `<b>Nombre:</b> ${establishment.NOMBRE}`);
        feature.set("address", `<b>Direc.:</b> ${establishment.DIRECCION}`);
        feature.set("phone", `<b>Tfn.:</b> ${establishment.TELEFONO}`);
        feature.set("hours", `<b>Horario:</b> ${establishment.HORARIO}`);
        feature.set("contact", `<b>Contacto:</b> ${establishment.CONTACTO===null?"":establishment.CONTACTO}`);
        feature.set("delivery", `<b>Reparto:</b> ${establishment.REPARTO ? 'Si' : 'No'}`);

        if (!this._map) {

            this._map = new ol.Map({
                target: 'map',
                layers: [basemap.geIGN()]
            });
        }

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: icon
            })
        });

        feature.setStyle(iconStyle);

        var vectorSource = new ol.source.Vector({
            features: [feature]
        });

        var vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });

        var element = document.getElementById('popup');

        var popup = new ol.Overlay({
            element: element,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -50]
        });
        this._map.addOverlay(popup);

        this._map.on('click', (evt) => {
            var feature = this._map.forEachFeatureAtPixel(evt.pixel,
                function(feature) {
                    return feature;
                });
            if (feature) {
                var coordinates = feature.getGeometry().getCoordinates();
                popup.setPosition(coordinates);
                $(element).popover({
                    placement: 'top',
                    html: true,
                    content: `${feature.get('name')}<br>${feature.get('address')}<br>${feature.get('phone')}<br>${feature.get('hours')}<br>${feature.get('contact')}<br>${feature.get('delivery')}`
                });
                $(element).popover('show');
            } else {
                $(element).popover('destroy');
            }
        });


        this._map.addLayer(vectorLayer);
        var layerExtent = vectorSource.getExtent();
        this._map.getView().fit(layerExtent, { size: this._map.getSize(), maxZoom: 19 });

        var closeButton = document.getElementsByClassName("close")[0];

        closeButton.onclick = () => {
            $(element).popover('destroy');
            this._map.removeLayer(vectorLayer);
            mapModal.style.display = "none";
        }
    }
}

export default new MapViewer();