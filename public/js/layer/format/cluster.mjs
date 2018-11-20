import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

import cluster_select from './cluster_select.mjs';

export default function(){

  const layer = this;
  layer.loaded = false;

  // Set locale to check whether locale is still current when data is returned from backend.
  const locale = _xyz.locale;

  if(!layer.table || !layer.display)  return _xyz.layers.check(layer);
  
  // Create XHR for fetching data from middleware.
  const xhr = new XMLHttpRequest();
    
  // Get bounds for request.
  const bounds = _xyz.map.getBounds();

  console.log(layer.filter.legend);
        
  // Build XHR request.
  xhr.open('GET', _xyz.host + '/api/layer/cluster?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    kmeans: layer.cluster_kmeans,// * window.devicePixelRatio,
    dbscan: layer.cluster_dbscan,// * window.devicePixelRatio,
    theme: layer.style.theme && layer.style.theme.type,
    cat: layer.style.theme && layer.style.theme.field,
    size: layer.style.theme && layer.style.theme.size,
    filter: JSON.stringify(layer.filter.current),
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  }));
    
  // Process XHR onload.
  xhr.onload = e => {
           
    // Data is returned and the layer is still current.
    if (e.target.status !== 200 || !layer.display || locale !== _xyz.locale) return _xyz.layers.check(layer);
    
    const cluster = JSON.parse(e.target.responseText);

    const param = {
      max_size: cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0)
    };

    // Remove existing layer.
    if (layer.L) _xyz.map.removeLayer(layer.L);

    // Create cat array for graduated theme.
    if (layer.style.theme) layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat);

    // Add cluster as point layer to Leaflet.
    layer.L = L.geoJson(cluster, {
      pointToLayer: (point, latlng) => {
        
        param.marker = layer.style.marker;

        // Set tooltip for desktop if corresponding layer has hover property.
        // let tooltip = (layer.style.theme && layer.style.theme.hover && _xyz.view.mode === 'desktop') || false;

        if(point.properties.size > 1) param.marker = layer.style.markerMulti;

        // Return marker if no theme is set.
        if (!layer.style.theme) return marker(latlng, layer, point, param);


        // Categorized theme
        if (layer.style.theme.type === 'categorized') {

          // Get cat style from theme if cat is defined.
          param.cat_style = layer.style.theme.cat[point.properties.cat] || {};

          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }

        // Graduated theme.
        if (layer.style.theme.type === 'graduated') {

          param.cat_style = {};
    
          // Iterate through cat array.
          for (let i = 0; i < layer.style.theme.cat_arr.length; i++) {
    
            // Break iteration is cat value is below current cat array value.
            if (point.properties.cat < parseFloat(layer.style.theme.cat_arr[i][0])) break;
    
            // Set cat_style to current cat style after value check.
            param.cat_style = layer.style.theme.cat_arr[i][1];
          }
  
          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }


        // Competition theme.
        if (layer.style.theme.type === 'competition') {

          // Set counter for point to 0.
          let c = 0;

          // Create a new cat_style with an empty layers object to store the competition layers.
          param.cat_style = {
            layers: {}
          };

          // Iterate through cats in competition theme.
          Object.keys(layer.style.theme.cat).forEach(comp => {

            // Check for the competition cat in point properties.
            if (point.properties.cat[comp]) {

              // Add the competition size to the counter.
              c += point.properties.cat[comp];

              // Add a cat layer to the marker obkject.
              // Calculate the size of the competition layer.
              // Competition layer added first must be largest, ie. (1 - counter divided by point size)
              param.cat_style.layers[1 - (c / point.properties.size)] = layer.style.theme.cat[comp].fillColor;

            }

          });

          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }
            
      }
    })
      .on('click', e => cluster_select(e, layer))
      .addTo(_xyz.map);

    function marker(latlng, layer, point, param){

      param.icon = _xyz.utils.svg_symbols(param.marker);

      // Define iconSize base on the point size in relation to the max_size.
      let iconSize = layer.cluster_logscale ?
        layer.style.markerMin + layer.style.markerMax / Math.log(param.max_size) * Math.log(point.properties.size) :
        point.properties.count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / param.max_size * point.properties.size;

      return L.marker(latlng, {
        pane: layer.key,
        // offset base on size draws bigger cluster first.
        zIndexOffset: parseInt(1000 - 1000 / param.max_size * point.properties.size),
        icon: L.icon({
          iconUrl: param.icon,
          iconSize: iconSize
        }),
        interactive: (layer.qID) ? true : false
      });

      // Bind tooltip to marker.
      /*if (tooltip) marker.bindTooltip(tooltip, {
        sticky: true,
        className: 'tooltip',
        direction: 'top',
        offset: [0, -10]
      }).openTooltip();*/

    }

    return _xyz.layers.check(layer);

  };
    
  xhr.send();

}