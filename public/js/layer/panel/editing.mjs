import _xyz from '../../_xyz.mjs';
import { polygon } from './draw/_draw.mjs';
import { rect } from './draw/_draw.mjs';
import { circle } from './draw/_draw.mjs';
import { line } from './draw/_draw.mjs';
import { point } from './draw/_draw.mjs';

export default layer => {

  // Create cluster panel and add to layer dashboard.
  layer.edit.panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.dashboard
  });

  // Panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Editing'
    },
    appendTo: layer.edit.panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: layer.edit.panel,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  function someFunction(word){
    console.log(word);
  }

  if(layer.edit && layer.edit.point){
    _xyz.utils.createStateButton({
      text: 'Point',
      appendTo: layer.edit.panel,
      layer: layer,
      fx: point
    });
  }
  
  if(layer.edit && layer.edit.polygon){
    _xyz.utils.createStateButton({
      text: 'Polygon',
      appendTo: layer.edit.panel,
      layer: layer,
      fx: polygon
    });
  }
  
  if(layer.edit && layer.edit.rectangle){
    _xyz.utils.createStateButton({
      text: 'Rectangle',
      appendTo: layer.edit.panel,
      layer: layer,
      fx: rect
    });
  }
  
  if(layer.edit && layer.edit.circle){
    _xyz.utils.createStateButton({
      text: 'Circle',
      appendTo: layer.edit.panel,
      layer: layer,
      fx: circle
    });
  }

  if(layer.edit && layer.edit.line){
    _xyz.utils.createStateButton({
      text: 'Line',
      appendTo: layer.edit.panel,
      layer: layer,
      fx: line
    });
  }
  
  if(layer.edit && layer.edit.catchment){
    _xyz.utils.createStateButton({
      text: 'Catchment',
      appendTo: layer.edit.panel,
      fx: someFunction
    });
  }

};