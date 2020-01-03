/* -------------------------------------------------------------------------- */
/*                  Visor de datos cartográficos con LeafLet                  */
/*                                                                            */
/*                       Autor: Joan Lluís Fuster Daviu                       */
/* -------------------------------------------------------------------------- */

/* --------------------------- Variables globales --------------------------- */
var map;
var layerBaseMap;
var layerBaseLabels;

var grupo_incendio = [];
grupo_incendio.push({
    name: "zona_incendio",
    url: "data/Incendio.zip"
}, {
    name: "severidad",
    url: "data/severidad.zip"
}, {
    name: "severidad_incendio",
    url: "data/severidad_incendio.zip"
}, {
    name: "corine_incendio",
    url: "data/Corine_incendio.zip"
}, {
    name: "combinacion",
    url: "data/combinacion.zip"
});

var grupo_recuperacion = [];
grupo_recuperacion.push({
    name: "severidad_2019",
    url: "data/severidad_2019.zip"
}, {
    name: "severidad_incendio_2019",
    url: "data/severidad_incendio_2019.zip"
}, {
    name: "combinacion_2019",
    url: "data/combinacion_2019.zip"
});

var grupo_raster = [];
grupo_raster.push({
    name: "nbr_antes",
    url: "data/NBR_antes.tif"
}, {
    name: "nbr_despues",
    url: "data/NBR_despues.tif"
}, {
    name: "dnbr",
    url: "data/dNBR.tif"
}, {
    name: "dnbr_2019",
    url: "data/dNBR_2019.tif"
});

var grupo_prueba = [];
grupo_prueba.push({
    name: "uno",
    url: "data/20180804_B8A_20m.tif"
}, {
    name: "dos",
    url: "data/antes_B8A.tif"
}, {
    name: "tres",
    url: "data/antes_B12.tif"
}, {
    name: "cuatro",
    url: "data/prueba.tif"
});

//var panel = new L.control.panelLayers(null, overLayers);

/* -------------------------------------------------------------------------- */

/* --------------------------------- Main() --------------------------------- */
iniciarMapa();

document
    .querySelector('#basemaps')
    .addEventListener('change', function (e) {
        var basemap = e.target.value;
        setMapaBase(basemap);
    });

// /* GeoTIFF */
// var url = "data/antes_B12.tif";

// fetch(url).then(res => res.arrayBuffer()).then(function (datos) {
//     crearCapaTIF(datos, "capa2", null);
// });

// var checkbox = document.getElementById('layer1');

// checkbox.addEventListener('change', (event) => {
//     if (event.target.checked) {

//         /* GeoTIFF */
//         var url_to_geotiff_file = "data/antes_B8A.tif";

//         fetch(url_to_geotiff_file).then(r => r.arrayBuffer()).then(function (buffer) {
//             var s = L.ScalarField.fromGeoTIFF(buffer);
//             let layer = L.canvasLayer.scalarField(s).addTo(map);

//             layer.on("click", function (e) {
//                 if (e.value !== null) {
//                     let popup = L.popup()
//                         .setLatLng(e.latlng)
//                         .setContent(`${e.value}`)
//                         .openOn(map);
//                 }
//             });

//             map.fitBounds(layer.getBounds());
//         });

//     } else {
//         alert('not checked');
//     }
// });

// var checkbox3 = document.getElementById('layer3');

// checkbox3.addEventListener('change', (event) => {
//     if (event.target.checked) {

//         /* shapefile */
//         var shpfile = new L.Shapefile('data/Corine_incendio.zip', {
//             onEachFeature: function (feature, layer) {
//                 if (feature.properties) {
//                     layer.bindPopup(Object.keys(feature.properties).map(function (k) {
//                         return k + ": " + feature.properties[k];
//                     }).join("<br />"), {
//                         maxHeight: 200
//                     });
//                 }
//             }
//         });
//         shpfile.addTo(map);
//         shpfile.once("data:loaded", function () {
//             console.log("finished loaded shapefile");
//         });

//     } else {
//         alert('not checked');
//     }
// });

/* -------------------------------------------------------------------------- */

/* ------------------------------ Iniciar mapa ------------------------------ */
function iniciarMapa() {
    map = L.map('map', {
            fullscreenControl: true,
            zoomControl: true,
            maxZoom: 15,
            minZoom: 3
        })
        .setView([40, -3], 7);

    L.control.scale().addTo(map);

    setMapaBase('Imagery');

    iniciarPanel();
}
/* -------------------------------------------------------------------------- */

/* -------------------------- Establecer mapa base -------------------------- */
function setMapaBase(basemap) {
    if (layerBaseMap) {
        map.removeLayer(layerBaseMap);
    }

    layerBaseMap = L.esri.basemapLayer(basemap);
    map.addLayer(layerBaseMap);

    if (layerBaseLabels) {
        map.removeLayer(layerBaseLabels);
    }

    if (basemap === 'ShadedRelief' ||
        basemap === 'Oceans' ||
        basemap === 'Gray' ||
        basemap === 'DarkGray' ||
        basemap === 'Terrain') {
        layerBaseLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(layerBaseLabels);
    } else if (basemap.includes('Imagery')) {
        layerBaseLabels = L.esri.basemapLayer('ImageryLabels');
        map.addLayer(layerBaseLabels);
    }
}
/* -------------------------------------------------------------------------- */

/* ------------------------ Crea una capa raster tif ------------------------ */
function crearCapaTIF(datos, nombre, estilo) {
    var s = L.ScalarField.fromGeoTIFF(datos);
    let layer = L.canvasLayer.scalarField(s);

    layer.on("click", function (e) {
        if (e.value !== null) {
            let popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`${e.value}`)
                .openOn(map);
        }
    });
    return layer;
}
/* -------------------------------------------------------------------------- */

/* ------------------------- Crea una capa shape zip ------------------------ */
function crearCapaSHP(datos, nombre, estilo) {
    var shpfile = new L.Shapefile('data/Corine_incendio.zip', {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                    return k + ": " + feature.properties[k];
                }).join("<br />"), {
                    maxHeight: 200
                });
            }
        }
    });
    return shpfile;
}
/* -------------------------------------------------------------------------- */

/* ------------------- Añade las capas en grupos al panel ------------------- */
function iniciarPanel() {

    var incendioLayers = {};

    grupo_incendio.forEach(function (element, index) {
        incendioLayers[index] = {
            name: element.name,
            icon: '<i class="fas fa-layer-group"></i>',
            layer: crearCapaSHP(element.url, element.name, null)
        }
    });

    var recuperacionLayers = {};

    grupo_recuperacion.forEach(function (element, index) {
        recuperacionLayers[index] = {
            name: element.name,
            icon: '<i class="fas fa-layer-group"></i>',
            layer: crearCapaSHP(element.url, element.name, null)
        }
    });

    var rasterLayers = {};

    rasterLayers[0] = {
        name: 'Ninguna',
        icon: '<i class="fas fa-low-vision"></i>',
        exclusiveGroup: 'rasterData',
        layer: new L.geoJSON('', {})
    };

    grupo_prueba.forEach(function (element, index) {
        fetch(element.url).then(res => res.arrayBuffer()).then(function (datos) {
            rasterLayers[index + 1] = {
                name: element.name,
                icon: '<i class="fab fa-buffer"></i>',
                exclusiveGroup: 'rasterData',
                layer: crearCapaTIF(datos, element.name, null)
            }
        });
    });

    var overLayers = [{
            group: "Grupo uno",
            layers: incendioLayers
        },
        {
            group: "Grupo dos",
            layers: recuperacionLayers
        }, {
            group: "Grupo tres",
            layers: rasterLayers
        }
    ];

    var panel = new L.control.panelLayers(null, overLayers);
    panel.addTo(map);
}
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* --------------------------- EJEMPLOS DE CÓDIGO --------------------------- */

/* EJEMPLO CALLBACK
function getOverlays(callback){
    var url = 'myServerUrl';
    overlays = [];

    $.ajax({
        url: url,
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: function(response) {
            overlays.push({
                name: "Something",
                layer: L.Proj.geoJson(response, {
                ...
                }
            });
            callback(overlays)
        }
    });
    return overlays;
}

var map = L.map('map', {
    layers: layers[0].layer
});
var layers = getBaseLayers();
getOverlays(function(overlays){
    var panelLayers = new L.Control.PanelLayers(layers,overlays);
    map.addControl(panelLayers);
});
*/


/*
var myLayerGroup = L.layerGroup(), // do not add to map initially.
    overlays = {
        "Merged GeoJSON collections": myLayerGroup
    };

L.control.layers(null, overlays).addTo(map);

function x(source, map) {
    // Merge the GeoJSON layer into the Layer Group.
    myLayerGroup.addLayer(L.geoJson({}, {
        style: function (feature) {  …  },
        onEachFeature: function (feature, layer) {  …  }
    }));
}

$.getJSON("data/Knox.geojson", function(source){
    x(source, map);
});
*/


/*
var layers = {};

L.geoJson(source, {

    style: function (feature) {  …  },

    onEachFeature: function(feature, layer){
        var popupText = "<h1 class='makebold'>Border: </h1>" +
                feature.properties.name + "<br/>" +
                "<h1 class='makebold'>Which Side?: </h1>" +
                feature.properties.side;

        layer.bindPopup(popupText);

        // Populate `layers` with each layer built from a GeoJSON feature.
        layers[feature.properties.name] = layer;
    }

});

var myLayersControl = L.control.layers(null, layers).addTo(map);
*/

// https://stackoverflow.com/questions/33772326/toggle-layers-on-and-off-in-leaflet-more-complex-scenario

/* -------------------------------------------------------------------------- */