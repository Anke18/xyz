import tableCurrent from './tableCurrent.mjs';

import tableMin from './tableMin.mjs';

import tableMax from './tableMax.mjs';

import zoomToExtent from './zoomToExtent.mjs';

import show from './show.mjs';

import remove from './remove.mjs';

import hover from './hover.mjs';

import view from './view/_view.mjs';

import format from './format/_format.mjs';

export default _xyz => layer => {

  layer.tableCurrent = tableCurrent(_xyz);
    
  layer.tableMin = tableMin(_xyz);
  
  layer.tableMax = tableMax(_xyz);

  layer.zoomToExtent = zoomToExtent(_xyz);
  
  layer.show = show(_xyz);
  
  layer.remove = remove(_xyz);

  layer.view = view(_xyz);

  layer.get = format(_xyz, layer);

  layer.hover = hover(_xyz, layer);

  if (layer.style && layer.style.themes) layer.style.theme = layer.style.themes[Object.keys(layer.style.themes)[0]];

  return layer;

};