import create from './create.mjs';

import addTab from './addTab.mjs';

import removeTab from './removeTab.mjs';

import locationTable from './locationTable.mjs';

import orderedList from './orderedList.mjs';

import layerTable from './layerTable.mjs';

import resizeObserve from './resizeObserve.mjs';

export default _xyz => {

  return {

    tables: [],
    
    create: create(_xyz),

    addTab: addTab(_xyz),

    removeTab: removeTab(_xyz),

    locationTable: locationTable(_xyz),

    orderedList: orderedList(_xyz),

    layerTable: layerTable(_xyz),

    resizeObserve: resizeObserve(_xyz)

  };
    
};