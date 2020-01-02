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
        var url_to_geotiff_file = "https://joafusda.upv.edu.es/data/antes_B8A.tif";

        fetch(url_to_geotiff_file).then(r => r.arrayBuffer()).then(function (buffer) {
            var s = L.ScalarField.fromGeoTIFF(buffer);
            let layer = L.canvasLayer.scalarField(s).addTo(map);
            
            layer.on("click", function (e) {
                if (e.value !== null) {
                    let popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`${e.value}`)
                        .openOn(map);
                }
            });

            map.fitBounds(layer.getBounds());
        });


        // fetch(url_to_geotiff_file)
        //     .then(response => response.arrayBuffer())
        //     .then(arrayBuffer => {
        //         parseGeoraster(arrayBuffer).then(georaster => {
        //             var layer = L.leafletGeotiff(
        //                 url = url_to_geotiff_file,
        //                 options = {
        //                     displayMin: 0,
        //                     displayMax: 30,
        //                     name: 'capa1',
        //                     colorScale: 'rainbow',
        //                     clampLow: false,
        //                     clampHigh: true
        //                 });
        //             layer.addTo(map);

        //             layer.on('click', function (e) {
        //                 if (e !== null) {
        //                     let v = georaster.getValueAtLatLng(e.latlng.lat, e.latlng.lng);;
        //                     let html = (`<span class="popupText">Valor ${v} m</span>`);
        //                     let popup = L.popup()
        //                         .setLatLng(e.latlng)
        //                         .setContent(html)
        //                         .openOn(map);
        //                 }
        //             });

        //             map.fitBounds(layer.getBounds());
        //         });
        //     });

    } else {
        alert('not checked');
    }
});