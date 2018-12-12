import _xyz from '../_xyz.mjs';

import select from './select.mjs';
_xyz.locations.select = select;

import draw from './draw.mjs';
_xyz.locations.draw = draw;

import add from './add.mjs';
_xyz.locations.add = add;

_xyz.locations.dom = document.getElementById('locations');

_xyz.locations.getFreeRecord = () => {

  // Find free records in locations array.
  const freeRecords = _xyz.locations.list.filter(record => record.location.geometries.length === 0);

  // Return from selection if no free record is available.
  if (freeRecords.length === 0) return null;
  
  // Return the free record.
  return freeRecords[0];
};

_xyz.locations.init = () => {

  // // Make select tab active on mobile device.
  // if (_xyz.view.mobile) _xyz.view.mobile.activateLayersTab();
  
  document.getElementById('clear_locations').addEventListener('click', () => {
    _xyz.hooks.remove('select');
    _xyz.locations.init();
  });
  
  // Hide the Locations Module.
  _xyz.locations.dom.parentElement.style.display = 'none';
  
  // Empty the locations list.
  _xyz.locations.dom.innerHTML = '';
    
  _xyz.locations.list.forEach(record => {
  
    // Return if location doesn't exist. ie. on init.
    //if (!record.location) return;
  
    if (record.location) {
      record.location.geometries.forEach(geom => _xyz.map.removeLayer(geom));
    }
  
    //record.location.geometries.forEach(geom => _xyz.map.removeLayer(geom));
  
    record.location = {
      geometries: []
    };
  
  });
  
  // Make select tab active on mobile device.
  if (_xyz.view.mobile) _xyz.view.mobile.activateLayersTab();
      
  // Set the layer display from hooks if present; Overwrites the default setting.
  // layer!table!id!lng!lat
  if (_xyz.hooks.current.select) _xyz.hooks.current.select.split(',').forEach(hook => {
    let params = hook.split('!');
    _xyz.locations.select({
      layer: params[0],
      table: params[1],
      id: params[2],
      marker: [params[3].split(';')[0], params[3].split(';')[1]]
    });
  });
  
  _xyz.hooks.remove('select');
  
};