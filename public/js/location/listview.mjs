import add from './add.mjs';

export default _xyz => {

  const listview = {

    node: document.getElementById('locations'),

    clear: document.getElementById('clear_locations'),

    getFreeRecord: getFreeRecord,

    add: add(_xyz),

    init: init,

    list: [
      {
        letter: 'A',
        color: '#9c27b0'
      },
      {
        letter: 'B',
        color: '#2196f3'
      },
      {
        letter: 'C',
        color: '#009688'
      },
      {
        letter: 'D',
        color: '#cddc39',
      },
      {
        letter: 'E',
        color: '#ff9800'
      },
      {
        letter: 'F',
        color: '#673ab7'
      },
      {
        letter: 'G',
        color: '#03a9f4'
      },
      {
        letter: 'H',
        color: '#4caf50'
      },
      {
        letter: 'I',
        color: '#ffeb3b'
      },
      {
        letter: 'J',
        color: '#ff5722'
      },
      {
        letter: 'K',
        color: '#0d47a1'
      },
      {
        letter: 'L',
        color: '#00bcd4'
      },
      {
        letter: 'M',
        color: '#8bc34a'
      },
      {
        letter: 'N',
        color: '#ffc107'
      },
      {
        letter: 'O',
        color: '#d32f2f'
      }]

  };


  // Overwrite locations select method.
  _xyz.locations.select = (location) => {

    const record = _xyz.locations.listview.getFreeRecord();
  
    if (!record) return;

    record.location = location;

    _xyz.locations.location.get(location, ()=>{

      // Set marker coordinates from point geometry.
      if (location.geometry.type === 'Point') location.marker = location.geometry.coordinates;
          
      location.style = {
        color: record.color,
        letter: record.letter,
        stroke: true,
        fill: true,
        fillOpacity: 0
      };
        
      // Draw the location to the map.
      _xyz.locations.draw(location);
      
      // Add record to listview;
      _xyz.locations.listview.add(record);

      // Push the hook for the location.
      _xyz.hooks.push(
        'select',
        `${record.location.layer}!${record.location.table}!${record.location.id}`
      );

    });

  };

  // Clear locations button to remove hooks and reset location listview.
  listview.clear.onclick = () => {
    _xyz.hooks.remove('select');
    _xyz.locations.listview.init();
  };


  return listview;


  function getFreeRecord() {

    // Find free records in locations array.
    const freeRecords = _xyz.locations.listview.list.filter(record => !record.location);

    // Return from selection if no free record is available.
    if (freeRecords.length === 0) return null;
  
    // Return the free record.
    return freeRecords[0];
  };


  // Init sequence to be called on locale init;
  function init() {
  
    // Hide the Locations Module.
    _xyz.locations.listview.node.parentElement.style.display = 'none';
  
    // Empty the locations list.
    _xyz.locations.listview.node.innerHTML = '';
    
    // Iterate through all locations in list.
    _xyz.locations.listview.list.forEach(record => {
  
      // Return if location doesn't exist. ie. on init.
      if (!record.location) return;

      // Remove all geometries associated to the location.
      record.location.geometries.forEach(geom => _xyz.map.removeLayer(geom));
      // And add additional geometries
      if(record.location.geometries.additional) record.location.geometries.additional.forEach(geom => _xyz.map.removeLayer(geom));
  
      // Delete the location.
      delete record.location;

    });
  
    // Make select tab active on mobile device.
    if (_xyz.mobile) _xyz.mobile.activateLayersTab();
      
    // Set the layer display from hooks if present; Overwrites the default setting.
    // layer!table!id
    if (_xyz.hooks.current.select) _xyz.hooks.current.select.split(',').forEach(hook => {

      let
        params = hook.split('!'),
        layer = _xyz.layers.list[decodeURIComponent(params[0])];

      _xyz.locations.select({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: params[1],
        id: params[2],
        edit: layer.edit
      });
      
    });
  
    _xyz.hooks.remove('select');
  
  };

};