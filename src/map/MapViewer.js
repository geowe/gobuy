import basemap from './Basemap';
import icon from '../img/icon-location2.png';

const WKT_FORMAT = new ol.format.WKT();
const MAP_DEFAULT_PROJECTION = 'EPSG:3857';
const WGS84_PROJECTION = 'EPSG:4326';

class MapViewer {

    loadMap(establishment) {
        var mapModal = document.getElementById("mapModal");
        mapModal.style.display = "block";

        if (!this._map) {
            this._map = new ol.Map({
                target: 'map',
                layers: [basemap.geIGN()]
            });

            const popupElement = this.createPopup();
            this.initializeEstablishmentLayer(establishment);
            this.closeButtonMapModal(popupElement)
        } else {
            this.addEstablishment(establishment);
        }

        this.zoomToLayer();
    }

    toFeature(establishment) {
        const feature = WKT_FORMAT.readFeature(establishment.COORDENADAS, {
            dataProjection: WGS84_PROJECTION,
            featureProjection: MAP_DEFAULT_PROJECTION
        });

        feature.set("name", `<b>${establishment.NOMBRE}</b>`);
        feature.set("address", `<i class="fas fa-location-arrow"></i> ${establishment.DIRECCION}`);
        feature.set("phone", `<i class="fa fa-phone"></i> ${establishment.TELEFONO}`);
        feature.set("hours", `<i class="far fa-clock"></i> ${establishment.HORARIO}`);
        feature.set("contact", `<i class="far fa-user-circle"></i> ${establishment.CONTACTO===null?"":establishment.CONTACTO}`);
        feature.set("delivery", `<i class="fas fa-truck"></i> ${establishment.REPARTO ? 'Si' : 'No'}`);

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: icon
            })
        });

        feature.setStyle(iconStyle);
        return feature;
    }

    createPopup() {
        var popupElement = document.getElementById('popup');

        var popup = new ol.Overlay({
            element: popupElement,
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
                $(popupElement).popover({
                    placement: 'top',
                    html: true,
                    content: `${feature.get('name')}<br>${feature.get('address')}<br>${feature.get('phone')}<br>${feature.get('hours')}<br>${feature.get('contact')}<br>${feature.get('delivery')}`
                });
                $(popupElement).popover('show');
            } else {
                $(popupElement).popover('destroy');
            }
        });

        return popupElement
    }

    initializeEstablishmentLayer(establishment) {
        const vectorSource = new ol.source.Vector({
            features: [this.toFeature(establishment)]
        });

        const vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });

        this._map.addLayer(vectorLayer);
    }

    closeButtonMapModal(popupElement) {
        var closeButton = document.getElementsByClassName("close")[0];

        closeButton.onclick = () => {
            $(popupElement).popover('destroy');
            this.getVectorSource().clear();
            mapModal.style.display = "none";
        }
    }

    addEstablishment(establishment) {
        const feature = this.toFeature(establishment);
        this.getVectorSource().addFeature(feature);
    }

    getVectorSource() {
        return this._map.getLayers().item(1).getSource();
    }

    getLayerExtent() {
        const vectorSource = this.getVectorSource();
        return vectorSource.getExtent();
    }

    zoomToLayer() {
        setTimeout(() => {
            this._map.updateSize();
            this._map.getView().fit(this.getLayerExtent(), { size: this._map.getSize(), maxZoom: 19 });
        }, 500);
    }

    clearMap() {
        this._map = undefined;
    }
}

export default new MapViewer();