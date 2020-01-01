var map = L.map('map', {
    fullscreenControl: true,
    zoomControl: true,
    maxZoom: 15,
    minZoom: 3
}).setView([40, -3], 7);

var layer = L.esri.basemapLayer('Imagery').addTo(map);
var layerLabels = L.esri.basemapLayer('ImageryLabels').addTo(map);

L.control.scale().addTo(map);

function setBasemap(basemap) {
    if (layer) {
        map.removeLayer(layer);
    }

    layer = L.esri.basemapLayer(basemap);

    map.addLayer(layer);

    if (layerLabels) {
        map.removeLayer(layerLabels);
    }

    if (
        basemap === 'ShadedRelief' ||
        basemap === 'Oceans' ||
        basemap === 'Gray' ||
        basemap === 'DarkGray' ||
        basemap === 'Terrain'
    ) {
        layerLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(layerLabels);
    } else if (basemap.includes('Imagery')) {
        layerLabels = L.esri.basemapLayer('ImageryLabels');
        map.addLayer(layerLabels);
    }
}

document
    .querySelector('#basemaps')
    .addEventListener('change', function (e) {
        var basemap = e.target.value;
        setBasemap(basemap);
    });

var checkbox = document.getElementById('layer1');

checkbox.addEventListener('change', (event) => {
    if (event.target.checked) {

        /* GeoTIFF */
        var url_to_geotiff_file = "antes_B8A.tif";

        fetch(url_to_geotiff_file)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                parseGeoraster(arrayBuffer).then(georaster => {
                    var layer = new GeoRasterLayer({
                        georaster: georaster,
                        opacity: 1,
                        //pixelValuesToColorFn: values => values[0] === 42 ? '#ffffff' : '#000000',
                        resolution: 128 // optional parameter for adjusting display resolution
                    });
                    layer.addTo(map);

                    layer.on('click', function (e) {
                        if (e.georaster !== null) {
                            let v = e.georaster.toFixed(0);
                            let html = (`<span class="popupText">Valor ${v} m</span>`);
                            let popup = L.popup()
                                .setLatLng(e.latlng)
                                .setContent(html)
                                .openOn(map);
                        }
                    });

                    map.fitBounds(layer.getBounds());
                });
            });

    } else {
        alert('not checked');
    }
});