_xyz({
    host: document.head.dataset.dir,
    //hooks: true,
    callback: _xyz => {
    
      _xyz.mapview.create({
        target: document.getElementById('Map'),
        scrollWheelZoom: true,
        zoomControl: true,
        view: {
            lat: 52,
            lng: 0,
            z: 4

        },
        btn: {
          Locate: document.getElementById('btnLocate'),
        }
      });
    }
});