class Basemap {

    getOSM() {
        return new ol.layer.Tile({
            source: new ol.source.OSM()
        });
    }

    geIGN() {
        var IGNLayer = new ol.layer.Tile({
            title: 'IGN',
            source: new ol.source.TileWMS({
                attributions: '© <a target="_blank" href="http://www.ign.es">Instituto Geográfico Nacional</a> ',
                url: 'https://www.ign.es/wms-inspire/ign-base',
                params: {
                    LAYERS: 'IGNBaseTodo',
                    SRS: 'EPSG:3857',
                    FORMAT: 'image/png'
                }
            })
        });

        return IGNLayer;
    }

    getPNOA() {
        return new ol.layer.Tile({
            title: 'PNOA',
            source: new ol.source.TileWMS({
                attributions: '© <a target="_blank" href="http://www.scne.es">Sistema Cartográfico Nacional</a> ',
                url: 'https://www.ign.es/wms-inspire/pnoa-ma',
                params: {
                    LAYERS: 'OI.OrthoimageCoverage',
                    SRS: 'EPSG:3857',
                    FORMAT: 'image/png'
                }
            })
        });
    }

    getCatastro() {
        return new ol.layer.Tile({
            title: 'Catastro',

            source: new ol.source.TileWMS({
                attributions: '© <a target="_blank" href="https://www.sedecatastro.gob.es/">DIRECCION GENERAL DEL CATASTRO</a>',
                url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
                params: {
                    LAYERS: 'catastro',
                    SRS: 'EPSG:3857',
                    FORMAT: 'image/png'
                }
            })
        });
    }
}

export default new Basemap();