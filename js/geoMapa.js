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
            zoomControl: true,
            maxZoom: 15,
            minZoom: 3
        })
        .setView([40, -3], 7);

    //L.control.scale().addTo(map);
    L.control.betterscale({
        position: 'bottomleft',
        metric: true,
        imperial: false
    }).addTo(map);

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
    var layer = L.canvasLayer.scalarField(s);

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

function crearCapaSHP(url, nombre, estilo) {
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
    var elementsProcessed = 0;

    rasterLayers[0] = {
        name: 'Ninguna',
        icon: '<i class="fas fa-low-vision"></i>',
        exclusiveGroup: 'rasterData',
        layer: new L.geoJSON('', {})
    };

    grupo_raster.forEach(function (element, index) {
        fetch(element.url).then(res => res.arrayBuffer()).then(function (datos) {
            var layer = crearCapaTIF(datos, element.name, null);
            rasterLayers[index + 1] = {
                name: element.name,
                icon: '<i class="fab fa-buffer"></i>',
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

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */