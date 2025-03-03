import create_block from './create_block.mjs';

export default (_xyz, layer, filter_entry) => {

  const block = create_block(_xyz, layer, filter_entry);

  filter_entry.filter.in.forEach(val => {

    _xyz.utils.createCheckbox({
      label: val,
      appendTo: block,
      onChange: e => {
                
        // Create filter.
        if (!layer.filter.current[filter_entry.field]) layer.filter.current[filter_entry.field] = { in: [] };
                
        if (e.target.checked) {

          // Add value to filter array.
          layer.filter.current[filter_entry.field].in.push(e.target.parentNode.innerText);
                
        } else {

          // Get index of value in filter array.
          let idx = layer.filter.current[filter_entry.field]['in'].indexOf(e.target.parentNode.innerText);

          // Splice filter array on idx.
          layer.filter.current[filter_entry.field].in.splice(idx, 1);

        }

        layer.filter.check_count();

        layer.show();

      }
    });

  });
  
};