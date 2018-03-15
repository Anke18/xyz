const utils = require('./utils');

function getLayer() {
    let layer = this;
    if (layer.display && !layer.base) {
        layer.loader.style.display = 'block';
        layer.base = L.tileLayer('proxy_request?uri=' + layer.URI
        + '&provider=' + layer.provider, {
            pane: layer.pane[0]
        })
            .addTo(_xyz.map)
            .on('loading', function () {
                layer.loader.style.display = 'block';
            })
            .on('load', function () {
                layer.loader.style.display = 'none';
                //layersCheck();
            });
    }
}

module.exports = {
    getLayer: getLayer
}