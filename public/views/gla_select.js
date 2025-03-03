const records = [
    {
      color: '#00AEEF',
      colorDark: '#007BBC',
      stamp: parseInt(Date.now()),
    },
    {
      color: '#008D48',
      colorDark: '#005A15',
      stamp: parseInt(Date.now()),
    },
    {
      color: '#E85713',
      colorDark: '#CF3E00',
      stamp: parseInt(Date.now()),
    }
  ];
  
  
  let record = records[0];
  
  function gla_select(_xyz, location) {
  
   
    // Find the oldest (first) entry and remove exsiting location;
    if (records.some(rec => {
  
      if (rec.stamp <= record.stamp) record = rec;
  
      if (rec.location && rec.location.id === location.id) {
        rec.location.remove();
        rec.location = null;
        rec.view.remove();
        rec.stamp = 0;
        return true;
      };
  
    })) return;
  
    // Remove existing location.
    if (record.location) {
      record.location.remove();
      record.view.remove();
    }
  
    // Hide location details in all records.
    records.forEach(rec => {
  
      if (!rec.view) return;
  
      const grids = rec.view.querySelectorAll('.grid');   
  
      grids.forEach(grid => {
  
        grid.style.display = 'none';
  
      });
  
      const expander = rec.view.querySelectorAll('.expander');   
  
      expander.forEach(expander => {
    
        expander.textContent = 'expand_more';
    
      });
  
    });
  
    // Assign location to current record.
    record.location = location;
  
    record.stamp = parseInt(Date.now());
  
    const xhr = new XMLHttpRequest();
  
    xhr.open('GET',
      _xyz.host + '/api/location/select/id?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: location.layer,
        table: location.table,
        id: location.id,
        token: _xyz.token
      }));
  
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
  
    xhr.onload = e => {
  
      if (e.target.status !== 200) return;
  
      location.infoj = e.target.response.infoj;
  
      location.geometry = e.target.response.geomj;
  
      location = _xyz.locations.location(location);
  
      _xyz.locations.current = location;
  
  
  
      record.view = gla_locationView(_xyz, record);
  
  
  
      document.getElementById('locationView').appendChild(record.view);
  
  
      
      location.Marker = _xyz.geom.geoJSON({
        json: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: location.marker || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
          }
        },
        pane: 'select_marker',
        style: {
          icon: {
            url: _xyz.utils.svg_symbols({
              type: 'markerColor',
              style: {
                colorMarker: record.color,
                colorDot: record.colorDark,
              }
            }),
            size: 40,
            anchor: [20, 40]
          }
        }
      });
  
      if(location._flyTo) location.flyTo();
     
    };
  
    xhr.send();
  
  };
  
  
  function gla_locationView(_xyz, record) {
  
    const fields = {};
  
    record.location.infoj.forEach(el => {
  
      if (el.value) fields[el.field] = el.value;
  
    });
  
    const view = _xyz.utils.wire()`<div class="location" style="${'margin-top: 10px; border: 3px solid ' + record.color}">`;
  
  
    const header = _xyz.utils.wire()`<div style="display: grid; grid-gap: 5px; grid-template-columns: 30px auto 30px;">`;
  
    view.appendChild(header);
  
    const title_expand = _xyz.utils.wire()`<i style="grid-column: 1;" class="material-icons title-btn expander">expand_less</i>`;
  
    header.appendChild(title_expand);
  
    header.appendChild(_xyz.utils.wire()`<div style="grid-column: 2" class="title">${fields.organisation_short}`);
  
    const title_close = _xyz.utils.wire()`<i style="grid-column: 3;" class="material-icons title-btn">close</i>`;
  
    header.appendChild(title_close);
  
  
    title_expand.onclick = function() {
  
      title_expand.textContent = title_expand.textContent === 'expand_less' ? 'expand_more' : 'expand_less';
  
      const grids = view.querySelectorAll('.grid');   
  
      grids.forEach(grid => {
    
        grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
    
      });
  
    };
  
    title_close.onclick = function() {
      record.location.remove();
      record.location = null;
      record.view.remove();
      record.stamp = 0;
    };
  
  
  
    var viewGrid = _xyz.utils.wire()`<div class="grid" style="grid-template-columns: 30px;">`;
  
    viewGrid.appendChild(
      _xyz.utils.wire()`<div style="grid-column: 1; grid-row: 1;"><i class="material-icons">room`);
  
    var viewAddress = _xyz.utils.wire()`<div style="grid-column: 2; grid-row: 1;">`;
  
    if (fields.address1) viewAddress.appendChild(
      _xyz.utils.wire()`<div>${fields.address1}`
    );
  
    if (fields.address2) viewAddress.appendChild(
      _xyz.utils.wire()`<div>${fields.address2}`
    );
  
    if (fields.address3) viewAddress.appendChild(
      _xyz.utils.wire()`<div>${fields.address3}`
    );
  
    if (fields.address4) viewAddress.appendChild(
      _xyz.utils.wire()`<div>${fields.address4}`
    );
  
    if (fields.postcode) viewAddress.appendChild(
      _xyz.utils.wire()`<div>${fields.postcode}`
    );
  
    viewGrid.appendChild(viewAddress);
  
    if (fields.website) {
      viewGrid.appendChild(
        _xyz.utils.wire()`
          <i style="grid-column: 1; grid-row: 2;" class="material-icons">launch</i>`);
      viewGrid.appendChild(
        _xyz.utils.wire()`
          <a style="grid-column: 2; grid-row: 2; line-height: 1.5;" href="${fields.website}">Website</a>`);
    }
  
    if (fields.phone) {
      viewGrid.appendChild(
        _xyz.utils.wire()`
          <i style="grid-column: 1; grid-row: 3;" class="material-icons">call</i>`);
      viewGrid.appendChild(
        _xyz.utils.wire()`
          <div style="grid-column: 2; grid-row: 3; line-height: 1.5;">${fields.phone}`);
    }    
  
    if (fields.email) {
      viewGrid.appendChild(
        _xyz.utils.wire()`
          <i style="grid-column: 1; grid-row: 4;" class="material-icons">email</i>`);
      viewGrid.appendChild(
        _xyz.utils.wire()`
          <a style="grid-column: 2; grid-row: 4; line-height: 1.5;" href="${'mailto:' + fields.email}">Email</a>`);    
    }
  
    view.appendChild(viewGrid);
  
    var viewGrid = _xyz.utils.wire()`<div class="grid">`;
  
    var gridRow = 1;
  
    var el = _xyz.utils.wire()`
        <div style="grid-column: 1/4; font-weight: bold; line-height: 2; font-size: 16px;">Opening Hours:`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);
  
    gridRow++;
  
    if (
      fields.phone_sunday ||
          fields.phone_monday ||
          fields.phone_tuesday ||
          fields.phone_wednesday ||
          fields.phone_thursday ||
          fields.phone_friday ||
          fields.phone_saturday) {
  
      var el = _xyz.utils.wire()`
        <div style="grid-column: 2; text-align: center; font-weight: bold;">Telephone`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
  
    }
  
    if (
      fields.hours_sunday ||
          fields.hours_monday ||
          fields.hours_tuesday ||
          fields.hours_wednesday ||
          fields.hours_thursday ||
          fields.hours_friday ||
          fields.hours_saturday) {
  
      var el = _xyz.utils.wire()`
        <div style="grid-column: 3; text-align: center; font-weight: bold;">Face-to-face`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
  
    }
  
    gridRow++;
  
    gridRow = hours(gridRow, 'Sunday', fields.hours_sunday, fields.phone_sunday);
  
    gridRow = hours(gridRow, 'Monday', fields.hours_monday, fields.phone_monday);
  
    gridRow = hours(gridRow, 'Tuesday', fields.hours_tuesday, fields.phone_tuesday);
  
    gridRow = hours(gridRow, 'Wednesday', fields.hours_wednesday, fields.phone_wednesday);
  
    gridRow = hours(gridRow, 'Thursday', fields.hours_thursday, fields.phone_thursday);
  
    gridRow = hours(gridRow, 'Friday', fields.hours_friday, fields.phone_friday);
  
    gridRow = hours(gridRow, 'Saturday', fields.hours_saturday, fields.phone_saturday);
  
    function hours(gridRow, day, hours, phone) {
      if (hours || phone) {
        var el = _xyz.utils.wire()`
            <div style="grid-column: 1; font-weight: bold;">${day}`;
        el.style.gridRow = gridRow;
        viewGrid.appendChild(el);
  
        if (hours) {
          var el = _xyz.utils.wire()`
              <div style="grid-column: 3; text-align: center;">${hours}`;
          el.style.gridRow = gridRow;
          viewGrid.appendChild(el);
        }
  
        if (phone) {
          var el = _xyz.utils.wire()`
              <div style="grid-column: 2; text-align: center;">${phone}`;
          el.style.gridRow = gridRow;
          viewGrid.appendChild(el);
        }
  
        gridRow++;
  
        return gridRow;
      }
  
      return gridRow;
    }
  
  
    if (fields.phone_notes) {
      var el = _xyz.utils.wire()`
          <div style="grid-column: 1/4; white-space: pre-wrap;">${fields.phone_notes}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
      gridRow++;
    }
  
    if (fields.hours_notes) {
      var el = _xyz.utils.wire()`
          <div style="grid-column: 1/4; white-space: pre-wrap;">${fields.hours_notes}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
      gridRow++;
    }
  
    view.appendChild(viewGrid);
  
  
  
    var viewGrid = _xyz.utils.wire()`<div class="grid">`;
  
    var servicesGrid = _xyz.utils.wire()`<div style="grid-column: 1;">`;
  
    servicesGrid.appendChild(_xyz.utils.wire()`
        <div class="align-flex">
        <i class="material-icons">${fields.service_initial_advice ? 'check_box' : 'check_box_outline_blank'}</i>
        Initial Advice`);
  
    servicesGrid.appendChild(_xyz.utils.wire()`
        <div class="align-flex">
        <i class="material-icons">${fields.service_written_advice ? 'check_box' : 'check_box_outline_blank'}</i>
        Written Advice`);
  
    servicesGrid.appendChild(_xyz.utils.wire()`
        <div class="align-flex">
        <i class="material-icons">${fields.service_form_filling ? 'check_box' : 'check_box_outline_blank'}</i>
        Form Filling`);
  
    servicesGrid.appendChild(_xyz.utils.wire()`
        <div class="align-flex">
        <i class="material-icons">${fields.service_case_work ? 'check_box' : 'check_box_outline_blank'}</i>
        Casework`);
  
    servicesGrid.appendChild(_xyz.utils.wire()`
        <div class="align-flex">
        <i class="material-icons">${fields.service_representation ? 'check_box' : 'check_box_outline_blank'}</i>
        Representation`);
  
    viewGrid.appendChild(servicesGrid);
  
    if (fields.coverage) {
  
      viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 2; text-align: center;">
            <div><i style="font-size: 50px;" class="material-icons">person_pin</i></div>
            <div style="font-weight: bold;">Areas served</div>
            <div style="white-space: pre-wrap;">${fields.coverage}</div>
          </div>`);
    }
  
    view.appendChild(viewGrid);
  
  
    var viewGrid = _xyz.utils.wire()`<div class="grid">`;
  
    if (fields.cost) viewGrid.appendChild(_xyz.utils.wire()`
        <div style="grid-column: 1; grid-row: 1; text-align: center;">
          <div style="font-size: 30px;">£</div>
          <div style="font-weight: bold">Cost</div>
          <div style="white-space: pre-wrap;">${fields.cost}</div>
        </div>`);
  
    if (fields.translation_notes) viewGrid.appendChild(_xyz.utils.wire()`
        <div style="grid-column: 2; grid-row: 1; text-align: center;">
          <div><i style="font-size: 30px;" class="material-icons">translate</i></div>
          <div style="font-weight: bold">Translation</div>
          <div style="white-space: pre-wrap;">${fields.translation_notes}</div>
        </div>`);
  
    if (fields.access) viewGrid.appendChild(_xyz.utils.wire()`
        <div style="grid-column: 3; grid-row: 1; text-align: center;">
          <div><i style="font-size: 30px;" class="material-icons">accessible_forward</i></div>
          <div style="font-weight: bold">Access</div>
          <div style="white-space: pre-wrap;">${fields.access}</div>
        </div>`);
  
    view.appendChild(viewGrid);
  
    return view;
  
  };