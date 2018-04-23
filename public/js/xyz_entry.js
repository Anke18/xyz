// The svg_symbols module is required in order to build svg symbols when they are evaluated in _xyz application settings.
const svg_symbols = require('./svg_symbols');

// Evaluates _xyz application settings.
(function objectEval(_xyz) {
    Object.keys(_xyz).map(function (key) {
        if (typeof _xyz[key] === 'string') {
            try {
                let tmp = eval(_xyz[key]);
                _xyz[key] = typeof tmp != 'undefined'? tmp: _xyz[key];
            }
            catch(me){
                //console.log(me);
            }
        }
        if (_xyz[key] && typeof _xyz[key] === 'object') objectEval(_xyz[key]);
    })
})(_xyz)

// All mobile interface quirks are loaded here.
if (view_mode === 'mobile') require('./mobile_interface')();

// Initialise utils.
const utils = require('./utils');

// All mobile interface quirks are loaded here.
if (node_env === 'development') {
    let dev_elements = document.querySelectorAll('.dev');
    utils.removeClass(dev_elements,'dev_display');
};

// Initiate leaflet and hooks.
const L = require('leaflet');
require('./hooks')();

// Initiate dom object.
let dom = {
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut')
};

// Set locale default.
_xyz.locale = _xyz.locale || Object.keys(_xyz.locales)[0];

// Set locale to hook, or set hook for locale.
if (_xyz.hooks.locale) {
    _xyz.locale = _xyz.hooks.locale;
} else {
    _xyz.setHook('locale', _xyz.locale);
}

// Set min/max zoom defaults.
_xyz.locales[_xyz.locale].minZoom = _xyz.locales[_xyz.locale].minZoom || 0;
_xyz.locales[_xyz.locale].maxZoom = _xyz.locales[_xyz.locale].maxZoom || 20;

// Initiate map object.
_xyz.map = L
    .map('map', {
        renderer: L.svg(),
        scrollWheelZoom: true,
        zoomControl: false,
        attributionControl: false,
        minZoom: _xyz.locales[_xyz.locale].minZoom,
        maxZoom: _xyz.locales[_xyz.locale].maxZoom
    })
    .setView([parseFloat(_xyz.hooks.lat || 0), parseFloat(_xyz.hooks.lng || 0)], parseInt(_xyz.hooks.z || 15));

// Set view and bounds; Zoom to extent of bounds if no hooks.z is present.
_xyz.setView = function(fit) {
    //if (_xyz.locales[_xyz.locale].bounds) _xyz.map.setMaxBounds(_xyz.locales[_xyz.locale].bounds);
    _xyz.map.setMaxBounds(_xyz.locales[_xyz.locale].bounds || [[-90,-180],[90,180]]);
    _xyz.map.setMinZoom(_xyz.locales[_xyz.locale].minZoom);
    _xyz.map.setMaxZoom(_xyz.locales[_xyz.locale].maxZoom);
    if (fit) _xyz.map.fitBounds(_xyz.locales[_xyz.locale].bounds || [[-90,-180],[90,180]]);
}
_xyz.setView(!_xyz.hooks.z);

// Zoom functions
chkZoomBtn(_xyz.map.getZoom());
function chkZoomBtn(z){
    dom.btnZoomIn.disabled = z < _xyz.locales[_xyz.locale].maxZoom ?  false : true;
    dom.btnZoomOut.disabled = z > _xyz.locales[_xyz.locale].minZoom ? false : true;
}

dom.btnZoomIn.addEventListener('click', function () {
    let z = _xyz.map.getZoom() + 1;
    _xyz.map.setZoom(z);
    chkZoomBtn(z);
});

dom.btnZoomOut.addEventListener('click', function(){
    let z = _xyz.map.getZoom() - 1;
    _xyz.map.setZoom(z);
    chkZoomBtn(z);
});

// Map state functions
_xyz.map.on('movestart', function () {
    viewChangeStart();
});

_xyz.map.on('resize', function(){
    utils.debounce(viewChangeStart, 100);
});

function viewChangeStart() {
    let layers = _xyz.locales[_xyz.locale].layers
    Object.keys(layers).map(function (layer) {
        if(layers[layer].xhr) layers[layer].xhr.abort();
        if(layers[layer].L) _xyz.map.removeLayer(layers[layer].L);
    });
}

_xyz.map.on('moveend', function () {
    viewChangeEnd();
});

_xyz.map.on('zoomend', function() {
    viewChangeEnd();
});

let timer;
function viewChangeEnd() {
    clearTimeout(timer);
    timer = setTimeout(function () {
        let z = _xyz.map.getZoom();
        chkZoomBtn(z);

        //Set the view hook.
        _xyz.setViewHook(_xyz.map.getCenter());

        let layers = _xyz.locales[_xyz.locale].layers
        Object.keys(layers).map(function (layer) {
            if (layers[layer].loader) layers[layer].loader.style.display = 'none';
            layers[layer].getLayer();
        });
    }, 100);
}

// Function to check whether all display layers are drawn.
_xyz.layersCheck = layersCheck;
function layersCheck() {
    if (typeof report !== 'undefined') {
        let layers = _xyz.locales[_xyz.locale].layers,
            layersArray = [],
            chkScore = 0;

        Object.keys(layers).map(function (layer) {
            chkScore = layers[layer].display ? chkScore++ : chkScore;
            chkScore = layers[layer].display && layers[layer].loaded ? chkScore-- : chkScore;
            layersArray.push([layers[layer].name, layers[layer].display, layers[layer].loaded]);
        });

        // Logs when all layers are ready. 
        if (chkScore === 0) console.log(layersArray);
    }
}

// Inititialise modules.
if (_xyz.gazetteer) require('./gazetteer')(_xyz);
require('./layers')(_xyz);
if (_xyz.select) require('./select')(_xyz);
if (_xyz.catchments) require('./catchments')(_xyz);
if (_xyz.report) require('./report')(_xyz);

// Make blocks visible and set scrollbar left for desktop view.
if (view_mode === 'desktop') require('./lscrolly')(document.querySelector('.module_container'));