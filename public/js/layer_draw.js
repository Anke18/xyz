const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = function(layer, panel){
    
    //console.log(layer);

    let dom = {
        map: document.getElementById('Map')
    };

    let edits = utils._createElement({
        tag: "div",
        options: {
            classList: "section expandable"
        },
        appendTo: panel
    });

      // Edit control expander.
      utils._createElement({
        tag: 'div',
        options: {
            className: 'btn_text cursor noselect',
            textContent: 'Editing'
        },
        appendTo: edits,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                utils.toggleExpanderParent({
                    expandable: edits,
                    accordeon: true,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                })
            }
        }
    });

    // Begin make UI elements

    let block, draw, polyline_draw, polygon_draw;

    if(layer.format === 'geojson' && layer.editable === 'geometry'){
        
        block = utils._createElement({
            tag: 'div',
            options: {
                className: 'block'
            },
            appendTo: edits
        });
        
        // Begin Polyline
        polyline_draw = utils._createElement({
            tag: 'div',
            appendTo: block,
            eventListener: {
                event: "click",
                funct: e => {
                    e.stopPropagation();
                    
                    layer.edited = layer.edited ? false : true;
                    
                    if(layer.edited && !layer.display) {
                        layer.display = true;
                        layer.clear_icon.textContent = layer.display ? 'layers' : 'layers_clear';
                        global._xyz.pushHook('layers', layer.layer);
                        layer.getLayer();
                    }
                    
                    if(!layer.edited){            
                        utils.removeClass(e.target.parentNode, "activate");
                        utils.removeClass(layer.header, "edited");
                    } else {
                        let btn = e.target;
                        btn.parentNode.classList += " activate";
                        layer.header.classList += ' edited';

                        dom.map.style.cursor = 'crosshair';

                        let drawnItems = L.featureGroup().addTo(global._xyz.map);
                        let featureCollection = drawnItems.toGeoJSON();
                        let coords = [];
                        let trail = L.featureGroup().addTo(global._xyz.map);
                        let tmp_trail = L.featureGroup().addTo(global._xyz.map);

                        /*let multiPoly = {
                            "type": "Multipolygon",
                            "coordinates": coords,
                            "properties": {}
                        };*/

                        let start_pnt, prev_pnt, current_pnt;
                        global._xyz.map.on('click', e => {
                            

                            start_pnt = [global._xyz.map.mouseEventToLatLng(e.originalEvent).lat, global._xyz.map.mouseEventToLatLng(e.originalEvent).lng];
                            
                            drawnItems.addLayer(L.circleMarker(global._xyz.map.mouseEventToLatLng(e.originalEvent), {
                                pane: layer.pane[0],
                                stroke: true,
                                color: "crimson",
                                fillColor: "#EEE",
                                weight: 1,
                                radius: 4
                            }));

                            console.log(drawnItems.getLayers().length);

                            let len = drawnItems.getLayers().length, part = [];
                            

                            if(len > 1){
                                console.log('add line');

                                let pts = drawnItems.toGeoJSON();
                                part = [pts.features[len-2].geometry.coordinates.reverse(), pts.features[len-1].geometry.coordinates.reverse()];
                                console.log(part.toString());

                                coords.push(part); // this is geojson
                                
                                trail.addLayer(L.polyline([part], {
                                    pane: layer.pane[0],
                                    stroke: true,
                                    color: '#666',
                                    dashArray: "5 5",
                                    weight: 1
                                }));

                            }

                            global._xyz.map.on('mousemove', e => {
                                tmp_trail.clearLayers();
                                
                                tmp_trail.addLayer(L.polyline([start_pnt, [global._xyz.map.mouseEventToLatLng(e.originalEvent).lat, global._xyz.map.mouseEventToLatLng(e.originalEvent).lng]], {
                                    pane: layer.pane[0],
                                    stroke: true,
                                    color: '#666',
                                    dashArray: "5 5",
                                    weight: 1
                                }));
                            });

                            global._xyz.map.on('contextmenu', e => {

                                global._xyz.map.off('mousemove');

                                console.log('save multi linestring, send back and clear  feature groups');
                                
                                tmp_trail.clearLayers();
                                

                                global._xyz.map.off('contextmenu');

                                let multiLine = {
                                    "type": "MultiLineString",
                                    "coordinates": coords,
                                    "properties": {}
                                };

                                console.log(multiLine);
                                coords = [];
                                start_pnt = null;
                                part = [];
                            });
                        });  

                        //}
                            /*document.addEventListener('keyup', e => { // ESC support
                                e.stopPropagation();
                                if(e.keyCode === 27) {
                                    //layer.header.classList.remove('edited');
                                    utils.removeClass(layer.header, 'edited');
                                    //btn.parentNode.classList.remove('activate');
                                    utils.removeClass(btn.parentNode, 'activate');
                                    //global._xyz.map.off('click');
                                    dom.map.style.cursor = '';
                                    layer.edited = false;
                                    //return
                                }
                            });*/
                            //return false;
                      
                    }
                }
            }
        });
        
        utils._createElement({
            tag: 'i',
            options: {
                classList: 'material-icons cursor noselect left',
                textContent: "create",
                title: 'Polyline'
            },
            appendTo: polyline_draw
        });
        
        utils._createElement({
            tag: 'span',
            options: {
                classList: "title cursor noselect",
                textContent: 'Draw a polyline'
            },
            appendTo: polyline_draw
        });

        // ---- End Polyline

        // -- Begin Polygon

        polygon_draw = utils._createElement({
            tag: 'div',
            appendTo: block,
            eventListener: {
                event: "click",
                funct: e => {
                    e.stopPropagation();

                    layer.edited = layer.edited ? false : true;

                    if(layer.edited && !layer.display){
                        layer.display = true;
                        layer.clear_icon.textContent = layer.display ? 'layers' : 'layers_clear';
                        global._xyz.pushHook('layers', layer.layer);
                        layer.getLayer();
                    }

                    if(!layer.edited){
                        utils.removeClass(e.target.parentNode, "activate");
                        utils.removeClass(layer.header, "edited");
                    } else {
                        let btn = e.target;
                        btn.parentNode.classList += " activate";
                        layer.header.classList += ' edited';

                        dom.map.style.cursor = 'crosshair';

                        let drawnItems = L.featureGroup().addTo(global._xyz.map);
                        let coords = [];
                        let trail = L.featureGroup().addTo(global._xyz.map);
                        let tmp_trail = L.featureGroup().addTo(global._xyz.map);

                        let start_pnt, prev_pnt, current_pnt;
                        global._xyz.map.on('click', e => {
                            start_pnt = [global._xyz.map.mouseEventToLatLng(e.originalEvent).lat, global._xyz.map.mouseEventToLatLng(e.originalEvent).lng];
                            
                            drawnItems.addLayer(L.circleMarker(global._xyz.map.mouseEventToLatLng(e.originalEvent), {
                                pane: layer.pane[0],
                                stroke: true,
                                color: "darkgrey",
                                fillColor: "steelblue",
                                weight: 1,
                                radius: 5
                            }));

                            let len = drawnItems.getLayers().length, part = [];

                            console.log(len);

                            if(len === 2) {
                                console.log('draw line');
                                let pts = drawnItems.toGeoJSON();
                                part = [pts.features[len-2].geometry.coordinates.reverse(), pts.features[len-1].geometry.coordinates.reverse()];
                                //coords.push(part); // this is geojson

                                trail.addLayer(L.polyline([part], {
                                    pane: layer.pane[0],
                                    stroke: true,
                                    color: '#666',
                                    dashArray: "5 5",
                                    weight: 1
                                }));

                            }

                            if(len > 2){
                                trail.clearLayers();
                                coords = [];
                                part = [];
                                console.log('start polygon now');
                                let pts = drawnItems.toGeoJSON();
                                pts.features.map(item => {
                                    coords.push(item.geometry.coordinates);
                                    part.push(item.geometry.coordinates.reverse())
                                });

                                console.log(coords);

                                trail.addLayer(L.polygon(coords, {
                                    pane: layer.pane[0],
                                    stroke: true,
                                    color: '#666',
                                    dashArray: "5 5",
                                    fill: true,
                                    fillColor: "#cf9",
                                    weight: 1
                                }));

                                
                            }
                            
                            global._xyz.map.on('mousemove', e => {
                                tmp_trail.clearLayers();
                                
                                tmp_trail.addLayer(L.polyline([
                                    [drawnItems.getLayers()[0].getLatLng().lat, drawnItems.getLayers()[0].getLatLng().lng],
                                    [global._xyz.map.mouseEventToLatLng(e.originalEvent).lat, global._xyz.map.mouseEventToLatLng(e.originalEvent).lng], 
                                    [drawnItems.getLayers()[len-1].getLatLng().lat, drawnItems.getLayers()[len-1].getLatLng().lng]
                                ], {
                                    pane: layer.pane[0],
                                    stroke: true,
                                    color: '#666',
                                    dashArray: "5 5",
                                    weight: 1
                                }));
                            });

                            global._xyz.map.on('contextmenu', e => {
                                global._xyz.map.off('mousemove');
                                tmp_trail.clearLayers();
                                global._xyz.map.off('contextmenu');

                                //let shape = [];
                                coords = [];
                                drawnItems.eachLayer(layer => {
                                    //console.log(layer.getLatLng());
                                    //console.log([layer.getLatLng().lat, layer.getLatLng().lng]);
                                    coords.push([layer.getLatLng().lng, layer.getLatLng().lat]);
                                });

                                coords.push(coords[0]);

                                //console.log(coords);

                                //let geometry = coords.map(item => item.reverse());

                                //console.log(geometry);

                                let poly = {
                                    "type": "Polygon",
                                    "coordinates": coords,
                                    "properties": {}
                                };

                                console.log(poly);
                            });
                        });
                    }
                }
            }
        });

        utils._createElement({
            tag: 'i',
            options: {
                classList: 'material-icons cursor noselect left',
                textContent: 'signal_cellular_4_bar',
                title: "Polygon"
            },
            appendTo: polygon_draw
        });

        utils._createElement({
            tag: 'span',
            options: {
                classList: "title cursor noselect",
                textContent: "Draw a polygon"
            },
            appendTo: polygon_draw
        });

    }


    // Add cluster edit control
    if(layer.format === "cluster" && layer.editable === 'geometry'){
        
        block = utils._createElement({
            tag: 'div',
            options: {
                className: 'block'
            },
            appendTo: edits
        });
        
        draw = utils._createElement({
            tag: 'div',
            eventListener: {
                event: "click",
                funct: e => {
                    e.stopPropagation();
                    
                    if(!layer.display) {
                        layer.display = true;
                        layer.clear_icon.textContent = layer.display ? 'layers' : 'layers_clear';
                        global._xyz.pushHook('layers', layer.layer);
                        layer.getLayer();
                    }
                    
                    let btn = e.target;
                    //utils.toggleClass(btn, 'active');
                    utils.toggleClass(btn.parentNode, 'activate');
                    
                    layer.header.classList += ' edited';

                    //if (!utils.hasClass(btn, 'active')) {
                    if (!utils.hasClass(btn.parentNode, 'activate')) {
                        utils.removeClass(layer.header, 'edited');
                        global._xyz.map.off('click');
                        dom.map.style.cursor = '';
                        return
                    }
                    
                    btn.parentNode.style.textShadow = '2px 2px 2px #cf9;';
                    dom.map.style.cursor = 'crosshair';
                    
                    global._xyz.map.on('click', e => {
                        let marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];

                        utils.removeClass(btn.parentNode, 'activate');
                        global._xyz.map.off('click');
                        dom.map.style.cursor = '';
                        
                        // Make select tab active on mobile device.
                        if (global._xyz.activateLocationsTab) global._xyz.activateLocationsTab();
                        
                        let xhr = new XMLHttpRequest();
                        xhr.open('POST', global._xyz.host + '/api/location/new?token=' + global._xyz.token);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.onload = e => {
                            if (e.target.status === 401) {
                                document.getElementById('timeout_mask').style.display = 'block';
                                console.log(e.target.response);
                                return
                            }
                            
                            if (e.target.status === 200) {
                                layer.getLayer();
                                global._xyz.select.selectLayerFromEndpoint({
                                    layer: layer.layer,
                                    table: layer.table,
                                    id: e.target.response,
                                    marker: marker,
                                    editable: true
                                });
                            }
                        }
                        
                        xhr.send(JSON.stringify({
                            locale: _xyz.locale,
                            layer: layer.layer,
                            table: layer.table,
                            geometry: {
                                type: 'Point',
                                coordinates: marker
                            }
                        }));
                    });
                    
                    document.addEventListener('keyup', e => {
                        e.stopPropagation();
                        if(e.keyCode === 27) {
                            
                            utils.removeClass(layer.header, 'edited');
                            utils.removeClass(btn.parentNode, 'activate');
                            global._xyz.map.off('click');
                            dom.map.style.cursor = '';
                            return
                        } 
                    });
                }
            },
            appendTo: block
        });

        utils._createElement({
            tag: 'i',
            options: {
                textContent: 'add_location',
                classList: 'material-icons cursor noselect left'//,
                //title: 'Create new location'
            },
            appendTo: draw
        });

        utils._createElement({
            tag: 'span',
            options: {
                classList: "title cursor noselect",
                textContent: 'Create new location'
            },
            appendTo: draw
        });
    }
    // End make UI elements  
}