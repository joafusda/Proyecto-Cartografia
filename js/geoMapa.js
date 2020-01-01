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

        d3.request(url_to_geotiff_file).responseType('arraybuffer').get(
            function (error, tiffData) {
                
                let geo = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 0);

                let layerGeo = L.canvasLayer.scalarField(geo, {
                    color: chroma.scale('RdPu').domain(geo.range),
                    opacity: 0.65
                }).addTo(map);

                layerGeo.on('click', function (e) {
                    if (e.value !== null) {
                        let v = e.value.toFixed(0);
                        let html = (`<span class="popupText">Valor ${v} m</span>`);
                        let popup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent(html)
                            .openOn(map);
                    }
                });

                map.fitBounds(layerGeo.getBounds());

            });

        // fetch(url_to_geotiff_file)
        //     .then(response => response.arrayBuffer())
        //     .then(arrayBuffer => {

        //             let layerGeo = L.leafletGeotiff(arrayBuffer).addTo(map);

        //             layerGeo.on('click', function (e) {
        //                 if (e.value !== null) {
        //                     let v = e.value.toFixed(0);
        //                     let html = (`<span class="popupText">valor ${v} m</span>`);
        //                     let popup = L.popup()
        //                         .setLatLng(e.latlng)
        //                         .setContent(html)
        //                         .openOn(map);
        //                 }
        //             });

        //     });

    } else {
        alert('not checked');
    }
});