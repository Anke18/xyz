import create_block from './create_block.mjs';

export default (_xyz, layer, filter_entry) => {

  const xhr = new XMLHttpRequest();

  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/location/field/range?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    field: filter_entry.field,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));

  xhr.onload = e => {

    const field_range = JSON.parse(e.target.response);

    const block = create_block(_xyz, layer, filter_entry);
  
    // Label for min / greater then control.
    _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'range-label',
        textContent: 'Greater or equal',
      },
      appendTo: block
    });

    const step = setStep(filter_entry);
  
    const input_min = _xyz.utils.createElement({
      tag: 'input',
      options: {
        classList: 'range-input',
        type: 'number',
        min: field_range.min,
        max: field_range.max,
        value: field_range.min,
        step: step
      },
      appendTo: block,
      eventListener: {
        event: 'keyup',
        funct: e => {
    
          // Set slider value and apply filter.
          slider_min.value = e.target.value;
          applyFilter();
        }
      }
    });
  
    const slider_min = _xyz.utils.slider({
      min: field_range.min,
      max: field_range.max,
      value: field_range.min,
      step: step,
      appendTo: block,
      oninput: e => {
  
        // Set input value and apply filter.
        input_min.value = e.target.value;
        applyFilter();
      }
    });
  
    // Label for max / smaller then control.
    _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'range-label',
        textContent: 'Smaller or equal'
      },
      appendTo: block
    });
  
    const input_max = _xyz.utils.createElement({
      tag: 'input',
      options: {
        classList: 'range-input',
        type: 'number',
        min: field_range.min,
        max: field_range.max,
        value: field_range.max,
        step: step
      },
      appendTo: block,
      eventListener: {
        event: 'keyup',
        funct: e => {

          // Set slider value and apply filter.
          slider_max.value = e.target.value;
          applyFilter();
        }
      }
    });
  
    const slider_max = _xyz.utils.slider({
      min: field_range.min,
      max: field_range.max,
      value: field_range.max,
      appendTo: block,
      step: step,
      oninput: e => {
  
        // Set input value and apply filter.
        input_max.value = e.target.value;
        applyFilter();
      }
    });

    // Apply max value after the slider has been created.
    slider_max.value = field_range.max;


    // Use timeout to debounce applyFilter from multiple and slider inputs.
    let timeout;

    function applyFilter(){

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;

        // Create filter.
        layer.filter.current[filter_entry.field] = {};
        layer.filter.current[filter_entry.field].gte = parseFloat(input_min.value);
        layer.filter.current[filter_entry.field].lte = parseFloat(input_max.value);

        layer.filter.check_count();

        layer.show();

      }, 500);
    }

    function setStep(entry){
      let step;
      switch(entry.type){
      case 'integer': step = 1; break;
      case 'numeric': step = 0.01 ; break;
      }
      return step;
    }

  };

  xhr.send(); 
};