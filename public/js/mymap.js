/*
- Claire EllulCEGE0043: Web and Mobile GIS - Apps and Programming (18/19)
- Leaflet Map: https://leafletjs.com
*/

// load the map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
// load the tiles
		
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',{
maxZoom: 18,
attribution:'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>contributors,' 
+ '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' + 
'Imagery © <a href="http://mapbox.com">Mapbox</a>',
id: 'mapbox.streets'
}).addTo(mymap);