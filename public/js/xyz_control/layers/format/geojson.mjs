export default _xyz => layer => () => {

  // Return if layer should not be displayed.
  if (!layer.display) return ;//layer.remove();

  if (layer.loaded) return;

  layer.xhr = new XMLHttpRequest();   
  
  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);
      
  layer.xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    cat: layer.style.theme && layer.style.theme.field,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));
  
  layer.xhr.setRequestHeader('Content-Type', 'application/json');
  layer.xhr.responseType = 'json';
  
  // Draw layer on load event.
  layer.xhr.onload = e => {

    if (layer.view.loader) layer.view.loader.style.display = 'none';

    // Remove layer from map if currently drawn.
    if (layer.L) _xyz.map.removeLayer(layer.L);
  
    if (e.target.status !== 200 || !layer.display) return;
        
    // Create feature collection for vector features.
    const features = e.target.response;

    layer.loaded = true;

    // Create cat array for graduated theme.
    if (layer.style.theme) layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat);
  
    // Add geoJSON feature collection to the map.
    layer.L = _xyz.L.geoJSON(features, {
      style: applyLayerStyle,
      pane: layer.key,
      interactive: layer.infoj? true: false,
      pointToLayer: (point, latlng) => {
          
        let style = applyLayerStyle(point);
          
        return _xyz.L.marker(latlng, {
          pane: layer.key,
          icon: _xyz.L.icon({
            iconUrl: _xyz.utils.svg_symbols(style.marker),
            iconSize: style.marker.iconSize || 40,
            iconAnchor: style.marker.iconAnchor || [20,20]
          }),
          interactive: (layer.qID) ? true : false
        });
          
      }
    })
      .on('click', e => {

        _xyz.locations.select({
          layer: layer.key,
          table: layer.table,
          id: e.layer.feature.properties.id,
          marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)],
          edit: layer.edit
        });
          
      })
      .on('mouseover', e => {

        e.layer.setStyle && e.layer.setStyle(layer.style.highlight);

        if (layer.hover.field) layer.hover.add({
          id: e.layer.feature.properties.id,
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
        });

      })
      .on('mouseout', e => {
        e.layer.setStyle && e.layer.setStyle(applyLayerStyle(e.layer.feature));

        if (layer.hover.field) layer.hover.remove();

      })
      .addTo(_xyz.map);
         
    // Check whether layer.display has been set to false during the drawing process and remove layer from map if necessary.
    if (!layer.display) _xyz.map.removeLayer(layer.L);
    
  };
      
  layer.xhr.send();

  
  function applyLayerStyle(feature){

    let style = Object.assign({}, layer.style.default);

    // Return default style if no theme is set on layer.
    if (!layer.style.theme) return style;

    const theme = layer.style.theme;

    // Categorized theme.
    if (theme.type === 'categorized') {

      return Object.assign({}, style, theme.cat[feature.properties.cat] || {});
    
    }

    // Graduated theme.
    if (theme.type === 'graduated') {

      theme.cat_style = {};
    
      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {
    
        // Break iteration is cat value is below current cat array value.
        if (parseFloat(feature.properties.cat) < parseFloat(theme.cat_arr[i][0])) break;
    
        // Set cat_style to current cat style after value check.
        theme.cat_style = theme.cat_arr[i][1];
    
      }
    
      // Assign style from base & cat_style.
      return Object.assign({}, style, theme.cat_style);
    
    }
    
  }

};