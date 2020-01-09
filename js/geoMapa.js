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

/* -------------------------------------------------------------------------- */

/* --------------------------------- Main() --------------------------------- */

iniciarMapa();

document
    .querySelector('#basemaps')
    .addEventListener('change', function (e) {
        var basemap = e.target.value;
        setMapaBase(basemap);
    });

/* -------------------------------------------------------------------------- */

/* ------------------------------ Iniciar mapa ------------------------------ */

function iniciarMapa() {
    map = L.map('map', {
            fullscreenControl: true,
            fullscreenControlOptions: {
                title: 'Mostrar en pantalla completa',
                titleCancel: 'Salir de pantalla completa',
            },
            zoomControl: false,
            maxZoom: 15,
            minZoom: 3
        })
        .setView([40, -3], 7);

    // control zoom home
    var zoomHome = L.Control.zoomHome({
        position: 'topleft'
    });
    zoomHome.addTo(map);

    // Zoom ventana
    L.Control.boxzoom({
        position: 'topleft',
        enableShiftDrag: true,
        // iconClasses: '<i class="fas fa-search"></i>'
    }).addTo(map);

    // escala gráfica
    L.control.betterscale({
        position: 'bottomleft',
        metric: true,
        imperial: false
    }).addTo(map);

    // BaseMap
    setMapaBase('Imagery');

    // Panel de selección de capas
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
    var layer = L.canvasLayer.scalarField(s, {
        color: chroma.scale('BuPu').domain(s.range)
    });

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

/* ------------------------ Añade una capa shape zip ------------------------ */

function crearCapaSHP(url, nombre, grupo) {
    var shpfile = new L.Shapefile(url, {
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
    if (estilo = style_severidad_incendio_2019) {
        shpfile.setStyle(style_severidad_incendio_2019(shpfile.feature));
    }
    return shpfile;
}

/* -------------------------------------------------------------------------- */

/* ------------------- Añade las capas en grupos al panel ------------------- */

function iniciarPanel() {

    var incendioLayers = {};

    grupo_incendio.forEach(function (element, index) {
        incendioLayers[index] = {
            name: element.name,
//            icon: '<i class="fas fa-layer-group"></i>',
            layer: crearCapaSHP(element.url, element.name, null)
        }
    });

    var recuperacionLayers = {};

    // grupo_recuperacion.forEach(function (element, index) {
    //     recuperacionLayers[index] = {
    //         name: element.name,
    //         icon: '<i class="fas fa-layer-group"></i>',
    //         layer: crearCapaSHP(element.url, element.name, null)
    //     }
    // });

    recuperacionLayers[0] = {
        name: 'severidad_2019',
//        icon: '<i class="fas fa-layer-group"></i>',
        layer: crearCapaSHP("data/severidad_incendio_2019.zip", "severidad_2019", style_severidad_incendio_2019)
    }

    recuperacionLayers[1] = {
        name: 'combinacion_2019',
//        icon: '<i class="fas fa-layer-group"></i>',
        layer: crearCapaSHP("data/combinacion_2019.zip", "combinacion_2019", null)
    }


    var rasterLayers = {};
    var elementsProcessed = 0;

    rasterLayers[0] = {
        name: 'Ninguna',
//        icon: '<i class="fas fa-low-vision"></i>',
        exclusiveGroup: 'rasterData',
        layer: new L.geoJSON('', {})
    };

    grupo_raster.forEach(function (element, index) {
        fetch(element.url).then(res => res.arrayBuffer()).then(function (datos) {
            var layer = crearCapaTIF(datos, element.name, null);
            rasterLayers[index + 1] = {
                name: element.name,
//                icon: '<i class="fab fa-buffer"></i>',
                exclusiveGroup: 'rasterData',
                layer: layer
            }
            elementsProcessed++;
            if (elementsProcessed == grupo_raster.length) {
                var overLayers = [{
                        group: "Grupo incendio",
                        layers: incendioLayers
                    },
                    {
                        group: "Grupo recuperacion",
                        layers: recuperacionLayers
                    }, {
                        group: "Grupo raster",
                        layers: rasterLayers
                    }
                ];

                var panel = new L.control.panelLayers(null, overLayers);
                panel.addTo(map);
            }
        });
    });
}

/* -------------------------------------------------------------------------- */

/* ---------------------------- Estilos de capas ---------------------------- */

function style_severidad_incendio_2019(feature) {
    switch (String(feature.properties['GRIDCODE'])) {
        case '1':
            return {
                opacity: 1,
                    color: 'rgba(35,35,35,1.0)',
                    dashArray: '',
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    weight: 1.0,
                    fill: true,
                    fillOpacity: 1,
                    fillColor: 'rgba(32,235,39,1.0)',
            }
            break;
        case '2':
            return {
                opacity: 1,
                    color: 'rgba(35,35,35,1.0)',
                    dashArray: '',
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    weight: 1.0,
                    fill: true,
                    fillOpacity: 1,
                    fillColor: 'rgba(247,255,5,1.0)',
            }
            break;
        case '3':
            return {
                opacity: 1,
                    color: 'rgba(35,35,35,1.0)',
                    dashArray: '',
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    weight: 1.0,
                    fill: true,
                    fillOpacity: 1,
                    fillColor: 'rgba(240,157,13,1.0)',
            }
            break;
        case '4':
            return {
                pane: 'pane_severidad_incendio_2019',
                    opacity: 1,
                    color: 'rgba(35,35,35,1.0)',
                    dashArray: '',
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    weight: 1.0,
                    fill: true,
                    fillOpacity: 1,
                    fillColor: 'rgba(230,28,58,1.0)',
                    interactive: true,
            }
            break;
        case '5':
            return {
                pane: 'pane_severidad_incendio_2019',
                    opacity: 1,
                    color: 'rgba(35,35,35,1.0)',
                    dashArray: '',
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    weight: 1.0,
                    fill: true,
                    fillOpacity: 1,
                    fillColor: 'rgba(230,15,233,1.0)',
                    interactive: true,
            }
            break;
    }
}

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */