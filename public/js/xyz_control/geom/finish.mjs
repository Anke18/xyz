export default _xyz => layer => {

  layer.view.header.classList.remove('edited');

  _xyz.mapview.node.style.cursor = '';
  _xyz.map.off('mousemove');
  _xyz.map.off('click');
  _xyz.map.off('contextmenu');
  
  if(layer.edit.vertices) layer.edit.vertices.clearLayers();

  if(layer.edit.trail) layer.edit.trail.clearLayers();

  if(layer.edit.path) layer.edit.path.clearLayers();
  
  if(layer.edit.stage) {
    layer.edit.stage.clearLayers();
    layer.edit.stage.unbindTooltip();
  }

};