

function addFloodData(markers,fitMarkers){
	
	$.getJSON("/floodingAnon/observations", function(json){
		
		var ext='.geojson';
		var cnt=0;
		for (var idx in json.metadata){
		
			var file=json.metadata[idx];
			if(file.lastIndexOf(ext) == file.length-ext.length){
				cnt=cnt+1;
			}
		}
		

		var cur=0;
		for (var idx in json.metadata){

			var file=json.metadata[idx];
			
			if(file.lastIndexOf(ext) == file.length-ext.length){
				cur=cur+1;
				addClicker(cur,cnt,file,markers,fitMarkers);
			}
		}
		

		
		
		
	});
}

function addClicker(cur,cnt,file,markers,fitMarkers){
	
	$.getJSON("/floodingAnon"+file , function(geojson){
					
					
		try{
			var acc={val:0};
			for (var gidx in geojson.features){
				feature = geojson.features[gidx];
				
				
				if ( feature.geometry["type"].toLowerCase() == "point" ){
					
					featurePopup(feature,markers,acc);
					/*m.on('click',function (){
						alert(file);
					});*/
				}
			}
			if(acc.val!=-1){
				
				featureGrpPopup(geojson.features[0],markers,geojson.properties);
				
			}
		}catch(err) {
			console.log(err.message);
		}
		if(cur==cnt){

		}
		
	});
	
}



    function featurePopup(feature, markers,acc,grpProp) {
        var geom = feature.geometry.coordinates;
	var popupstr = "<img width=150px src=logo5.png><br>";
	var cnt=0;
	$.each(feature.properties, function (k,v) {
		
		if(k=="File Name"){
			popupstr+="<b>Observation</b><br>";
			popupstr+="<center><img width=300px src=/floodingAnon/observations/"+v+"><br></center>";
			//console.log("/floodingAnon/observations/"+v+">");
		}else if(k=="Marker"){
			
			popupstr += "<b>Marker Values</b>: " + feature.properties[k]["X Value"]+", "+feature.properties[k]["Y Value"] + "<br>";
		}else if(k=="Compass"){
			popupstr += "<b>Compass Values</b>: " + feature.properties[k]["Azimuth"]+", "+feature.properties[k]["Pitch"]+", "+feature.properties[k]["Roll"] + "<br>";
		}else if(k!="Record ID"&&k!="View Angle"&&k!="Polyline"){
			popupstr += "<b>" + k + "</b>: " + v + "<br>";
		}
		cnt=cnt+1;
	});
        
	if(cnt>1&&feature.properties["Accuracy"]!=-1){
		
		var iconOb = L.icon({
    			iconUrl: 'floodob.png'
		});
		var marker = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],{icon: iconOb} );
		marker.addTo(markers);
       		marker.bindPopup(popupstr);
	}else if(feature.properties["Accuracy"]==-1){
		acc.val=-1;
		console.log("acc -1");
	}
	/*else if(feature.properties["Accuracy"]!=-1){

		var marker = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] );
		marker.addTo(markers);
		marker.bindPopup(popupstr);

		/*
		$.each(grpProp, function (k,v) {
			popupstr += "<b>" + k + "</b>: " + v + "<br>";
		});
		

	
				
		var marker = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] );
		marker.addTo(markers);
		marker.bindPopup(popupstr);*/
		

	//}
    }

function featureGrpPopup(feature, markers,grpProp) {
        var geom = feature.geometry.coordinates;
	var popupstr = "<img width=150px src=logo5.png><br>";
	
	$.each(feature.properties, function (k,v) {
		
		popupstr += "<b>" + k + "</b>: " + v + "<br>";
		
	});

			var iconOb = L.icon({
    			iconUrl: 'floodob.png'
		});
        
	
		$.each(grpProp, function (k,v) {
			if(k=="Decision"){
				popupstr+="<b>"+k+"</b>: "+v[0]+", "+v[1]+"<br>";
			}
			else if(v!=-1&&v!="")
				popupstr += "<b>" + k + "</b>: " + v + "<br>";
		});
		
		var marker = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {icon: iconOb} );
		marker.addTo(markers);

       		marker.bindPopup(popupstr);
	
	/*else if(feature.properties["Accuracy"]!=-1){

		var marker = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] );
		marker.addTo(markers);
		marker.bindPopup(popupstr);

		/*
		$.each(grpProp, function (k,v) {
			popupstr += "<b>" + k + "</b>: " + v + "<br>";
		});
		

	
				
		var marker = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] );
		marker.addTo(markers);
		marker.bindPopup(popupstr);*/
		

	//}
    }
