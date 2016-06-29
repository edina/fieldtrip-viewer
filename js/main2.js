
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Endpoint Configuration:
// NOTE: When this is under HTTPS then ALL layer myst ALSO be HTTPS (otherwise the browser refuses ajax calls) //////
/////////////////////////////////////////////////////

/** globals       */
/******************/
/* map object */
map = null;

/* SID is empty (all surveys) by default */
sid = null;
clouds = null;
precipitation = null;
tweets = null;
wind = null;
pressure = null;
temperature = null;
snow = null;
pressure_cntr = null;
tempL = null;
rain = null;
var earthquake = new L.MarkerClusterGroup({showCoverageOnHover: false});
var salt = new L.MarkerClusterGroup({showCoverageOnHover: false});
var wug = new L.MarkerClusterGroup({showCoverageOnHover: false});
var peat = new L.MarkerClusterGroup({showCoverageOnHover: false});
var shoot = new L.MarkerClusterGroup({showCoverageOnHover: false});
var markers2 = new L.MarkerClusterGroup({showCoverageOnHover: false});
var markers3 = new L.MarkerClusterGroup({showCoverageOnHover: false});
var markers4 = new L.MarkerClusterGroup({showCoverageOnHover: false});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function init_map() {
    // create a map in the "map" div, set the view to a given place and zoom
    map = new L.map('map',{
            minZoom: 3,
            maxZoom: 18,
            center: new L.LatLng(52.40,-4.09),
            zoom: 8
        });
     map.attributionControl.setPrefix("");
     
    // add an OpenStreetMap tile layer
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
     }).addTo(map);

    /* Dyfi woodlands specific, kept for backwards compatibility */
    //addDyfiOverlay(map);
    
    /* Add scale bar */
    L.control.scale({position: 'topright'}).addTo(map);
	L.control.mousePosition().addTo(map);
    
}

/** populate map with dictionary values.
 * Args:
 *      dict:  dictionary with all values
 *      geom_key: key in dict that has lat/long coordinates
 */
function map_add_dictionary(geojson){
    var num_markers = 0;

    // one-line abstract factory -- uses a different onEachFeature function depending on the type of endpoint
    onEachFeature =  (ENDPOINT_TYPE == "PCAPI") ? onEachFeature_pcapi : onEachFeature_wfs;

    // Add all geometry types as one big GeoJSON FeatureCollection that filters/excludes points
    features = L.geoJson( geojson ,{ 
            onEachFeature: onEachFeature,
            filter: function(feature, layer) {
                    /* display only non-point types */
                    return (feature.geometry["type"].toLowerCase() != "point")
                } }).addTo(map);

    /* Add all point (again) but this time as a MarkerClusterGroup which is visible */
    for (var idx in geojson.features){
        feature = geojson.features[idx];
        /* point data */
        if ( feature.geometry["type"].toLowerCase() == "point" ){
            num_markers++;
            // geojson standard is in lon/lat but marker is lat/lon
           var m = L.marker( [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] );
            onEachFeature( feature,  m )
            m.addTo(markers4);
        }
    }    
    
    /* adds custom toolbar on map */
    if(ENDPOINT_TYPE == "PCAPI"){
        addToolbar(map, geojson);
    }
}

/** Parse the URL for parametres e.g. getUrlParameter('param1') -> value  */
function getParam( key )
{
    var queryparams = window.location.search.substring(1);
    var params = queryparams.split('&');
    for ( var i=0 ; i< params.length ; i++ )
    {
        var pair = params[i].split('=');
        if (pair[0] == key) 
        {
            return pair[1]
        }
    }
    return null;
}   



$(document).ready(function(){

    init_map(); //backdrop
	
	
	addGeoJSONData("/wug",wug,1,"Weather Underground");
	map.addLayer(wug);
	/*addGeoJSONData("/saltmarsh",salt,"Salt Marsh");
	addGeoJSONData("/peatbog",peat,"Peat Bog");
	addGeoJSONData("/shoothill",shoot,0,"Shoothill");
	
	addFloodData(markers2,1);

	
	addTwitterGeoJSONData(markers3,1);
	
	
	addEQJSONData(earthquake, 1);	

	clouds = L.OWM.clouds({showLegend: false, opacity: 0.5});
	//loadClouds();
	//clouds.setOpacity(0);
	precipitation = L.OWM.precipitation({showLegend: true, opacity: 0.5});
	//loadPrecipitation();
	//precipitation.setOpacity(0);
	rain = L.OWM.rainClassic({showLegend: true, opacity: 0.5});
	wind = L.OWM.wind({showLegend: true, opacity: 0.5});
	//loadWind();
	//wind.setOpacity(0);
	pressure = L.OWM.pressure({showLegend: true, opacity: 0.5});
	//loadPressure();
	//pressure.setOpacity(0);
	temperature = L.OWM.temperature({showLegend: true, opacity: 0.5});
	//loadTemperature();
	//temperature.setOpacity(0);
	snow = L.OWM.snow({showLegend: true, opacity: 0.5});
	//loadSnow();
	//snow.setOpacity(0);
	pressure_cntr = L.OWM.pressureContour({showLegend: false, opacity: 0.5});
	//loadPressureCntr();
	//pressure_cntr.setOpacity(0);
	

	
	var markers = new L.MarkerClusterGroup({showCoverageOnHover: false});
	
	// Assume public survey unless otherwise specified in the index.html
    
	if (typeof PRIVATE_SURVEY == 'undefined') {
       PRIVATE_SURVEY = false;
   }
    
    //sid = getParam("sid");

   // if(sid==null){
	sid=JK_SURVEY_ID;
  // }
    console.log(sid);
    endpoint = getEndpoint(sid);
    console.log(endpoint);

   if(endpoint){
       $.getJSON(endpoint , function(geojson){
           map_add_dictionary(geojson,markers)
        });
   }
    else{
        console.log("sid is not defined and not in testing mode. Aborting");
    }*/

});

function loadClouds(){
 clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?id=524901&APPID=1b7efacb6260bc91a23e7c743bfb4c8c', {
    attribution: 'Map data © OpenWeatherMap',
	transparent: true,
    layers: 16,
    maxZoom: 18
});
}

function loadPrecipitation(){
precipitation = L.tileLayer('http://{s}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?id=524901&APPID=1b7efacb6260bc91a23e7c743bfb4c8c', {
    attribution: 'Map data © OpenWeatherMap',
	transparent: true,
    layers: 17,
    maxZoom: 18
});
}

function loadWind(){
wind = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?id=524901&APPID=1b7efacb6260bc91a23e7c743bfb4c8c', {
    attribution: 'Map data © OpenWeatherMap',
	transparent: true,
    layers: 17,
    maxZoom: 18
});
}


function loadPressure(){
pressure = L.tileLayer('http://{s}.tile.openweathermap.org/map/pressure/{z}/{x}/{y}.png?id=524901&APPID=1b7efacb6260bc91a23e7c743bfb4c8c', {
    attribution: 'Map data © OpenWeatherMap',
	transparent: true,
    layers: 18,
    maxZoom: 18
});
}

function loadTemperature(){
temperature = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?id=524901&APPID=1b7efacb6260bc91a23e7c743bfb4c8c', {
    attribution: 'Map data © OpenWeatherMap',
	transparent: true,
    layers: 19,
    maxZoom: 18
});
}

function loadSnow(){
snow = L.tileLayer('http://{s}.tile.openweathermap.org/map/snow/{z}/{x}/{y}.png?id=524901&APPID=1b7efacb6260bc91a23e7c743bfb4c8c', {
    attribution: 'Map data © OpenWeatherMap',
	transparent: true,
    layers: 20,
    maxZoom: 18
});
}

function loadPressureCntr(){
pressure_cntr = L.tileLayer('http://{s}.tile.openweathermap.org/map/	pressure_cntr/{z}/{x}/{y}.png?id=524901&APPID=1b7efacb6260bc91a23e7c743bfb4c8c', {
    attribution: 'Map data © OpenWeatherMap',
	transparent: true,
    layers: 18,
    maxZoom: 18
});
}

