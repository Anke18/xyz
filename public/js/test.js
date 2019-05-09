_xyz({
  host: document.head.dataset.dir || new String(''),
  hooks: true,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      view: {
        lat: 51.52,
        lng: 0.24,
        z: 6,
      }
    });

    //_xyz.layers.list['Advice Center'].show();
    //console.log(_xyz.layers.list['Advice Center']);

    /*document.querySelector('#location .btn-location-back').addEventListener('click', e => {
      e.stopPropagation();
      document.querySelector('#location').style.left = '-100%';
    });*/

    _xyz.tableview.layerTable({
      layer: _xyz.layers.list['Advice Center'],
      target: document.getElementById('listviews'),
      key: 'gla',
      visible: ['organisation'],
      groupBy: 'borough',
      initialSort: [
          {
            column: 'organisation', dir: 'asc'
          },
          {
            column: 'borough', dir: 'asc'
          }
      ],
      groupStartOpen: false,
      rowClick: (e, row) => {
        const rowData = row.getData();

        if (!rowData.qid) return;

        _xyz.locations.select({
          locale: _xyz.workspace.locale.key,
          layer: _xyz.layers.list['Advice Center'].key,
          table: _xyz.layers.list['Advice Center'].table,
          id: rowData.qid,
        });

        document.querySelector('#location').style.left = 0;
        //document.querySelector('#location').classList.add('reveal');

      },
      groupClick: (e, group) => {
        console.log('this is a click');
        //group.
        console.log(group);
      }
    });

  }
});


