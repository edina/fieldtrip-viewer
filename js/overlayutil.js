function addEQJSONData(marker, fitMarkers){

	var iconOb = L.icon({
    		iconUrl: '/quake2.png'
	});


	$.getJSON("http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&NOW - 30 days&present time&minmagnitude=3.5" , function(geojson){
            		
		for (var idx in geojson.features){
			feature = geojson.features[idx];
			
			// geojson standard is in lon/lat but marker is lat/lon
			var mag = feature.properties.mag;
			var time = feature.properties.time;
			var text = feature.properties.type;
			var place = feature.properties.place;
			var m = L.circleMarker(new L.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]),{ color: 'red', opacity: 1, fillOpacity: 0.3, weight: 1, clickable: true });
			m.setRadius(mag * 2.3);
			var date = new Date(time);
		//	var m = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],{icon: iconOb} );
			m.bindPopup("<br>Magnitude "+ mag  + "<br>Location: " + place + "<br>Time: " + date.toString() + "<br><a href='" + feature.properties.url + "'>More info</a>");
			//m.on('click',function (){
				//m.openPopup();
			//});	
			m.addTo(earthquake);
		}
	});

}

