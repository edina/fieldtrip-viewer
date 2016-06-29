function addTwitterGeoJSONData(markers,fitMarkers){

	var iconOb = L.icon({
    		iconUrl: '/dataviewer/icon_twitter2.png'
	});

	$.getJSON("/dataviewer/getMonthData.php" , function(geojson){
            	
		for (var idx in geojson.features){
			feature = geojson.features[idx];
			
			// geojson standard is in lon/lat but marker is lat/lon
			var m = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],{icon: iconOb} );
			var location = feature.properties.location;
			var time = feature.properties.timestamp;
			var text = feature.properties.text;
			var media = feature.properties.image;
			//if(text != "null"){
			var n = media.length;
			if(n <= 5){
				m.bindPopup("<b>"+ text + "</b><br>" + location + "<br>" + time);
			}else{
				m.bindPopup("<img src="+ media +"><br>"	+"<b>"+ text + "</b><br>" + location + "<br>" + time);
			}
				m.on('click',function (){
					m.openPopup();
				});			
			m.addTo(markers);
		}

	});
} 