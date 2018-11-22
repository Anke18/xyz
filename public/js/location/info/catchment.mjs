import _xyz from '../../_xyz.mjs';

export default (record, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: record.table });

  let td = _xyz.utils.createElement({
    tag: 'td',
    appendTo: tr,
    options: {
      colSpan: '2'
    }
  });

  record.catchment = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_wide cursor noselect',
      textContent: entry.value ? 'Delete' : 'Create'
    },
    appendTo: td,
    eventListener: {
      event: 'click',
      funct: e => {
        entry.value ? deleteCatchment(e, record, entry) : createCatchment(e, record, entry);
      }
    }
  });
};

function createCatchment(ev, record, entry){
    
  entry.edit.catchment.coordinates = record.location.geometry.coordinates.join(',');

  var xhr = new XMLHttpRequest();
    
  xhr.open('POST', _xyz.host + '/api/location/catchment/create?token=' + _xyz.token); // request from third party API
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {
    if (e.target.status === 401) {
      document.getElementById('timeout_mask').style.display = 'block';
      _xyz.dom.map.style.cursor = '';
      //console.log(e.target.response);
      return;
    }
  
    if(e.target.status == 406){
      return alert(e.target.responseText);
    }
  
    if (e.target.status === 200) {

      ev.target.classList.remove('disabled');
      ev.target.textContent = 'Delete';

      // Reload layer.
      _xyz.layers.list[record.location.layer].get();

      // Reset location infoj with response.
      record.location.infoj = JSON.parse(e.target.response);

      // Update the record.
      record.update();    
        
    } else { return alert('No route found. Try a longer travel time.'); }
  };

  // get catchment contour
  xhr.send(JSON.stringify({
    locale: _xyz.locale,
    layer: record.location.layer,
    table: record.location.table,
    field: entry.field,
    id: record.location.id,
    params: entry.edit.catchment
  }));
    
  _xyz.dom.map.style.cursor = 'busy';
  record.catchment.classList.add('disabled');
}
  

function deleteCatchment(ev, record, entry){
  ev.target.textContent = 'Create';

  var xhr = new XMLHttpRequest();

  xhr.open('POST', _xyz.host + '/api/location/catchment/delete?token=' + _xyz.token); // request from third party API
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {

    if (e.target.status === 401) {
      document.getElementById('timeout_mask').style.display = 'block';
      _xyz.dom.map.style.cursor = '';
      //console.log(e.target.response);
      return;
    }

    if (e.target.status === 200) {

      ev.target.classList.remove('disabled');
      ev.target.textContent = 'Create';

      // remove deleted catchment from map
      let i = record.location.geometries.indexOf(entry.edit.catchment.geometry);
      if(i > -1) record.location.geometries.splice(i, 1);
      _xyz.map.removeLayer(entry.edit.catchment.geometry);
      
      // Reset location infoj with response.
      record.location.infoj = JSON.parse(e.target.response);

      // Update the record.
      record.update();   

      // Reload layer.
      _xyz.layers.list[record.location.layer].get();
         
    }
  };

  xhr.send(JSON.stringify({
    locale: _xyz.locale,
    layer: record.location.layer,
    table: record.location.table,
    field: entry.field,
    id: record.location.id
  }));

  _xyz.dom.map.style.cursor = 'busy';
  record.catchment.classList.add('disabled');

}