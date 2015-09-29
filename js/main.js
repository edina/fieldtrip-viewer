//// Contigency GeoJSON viewer -- work with PCAPI / WFS and anything else that can produce geojson ////
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
    
}

/** populate map with dictionary values.
 * Args:
 *      dict:  dictionary with all values
 *      geom_key: key in dict that has lat/long coordinates
 */
function map_add_dictionary(geojson){
    var markers = new L.MarkerClusterGroup({showCoverageOnHover: false});
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
            m.addTo(markers);
        }
    }
    if(num_markers > 0){
        map.addLayer(markers)
    }
    map.fitBounds(L.featureGroup([markers, features]).getBounds());    
    
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

    // Assume public survey unless otherwise specified in the index.html
    if (typeof PRIVATE_SURVEY == 'undefined') {
        PRIVATE_SURVEY = false;
    }
    
    sid = getParam("sid");
    endpoint = getEndpoint(sid);
    
    if(endpoint){
        $.getJSON(endpoint , function(geojson){
            map_add_dictionary(geojson)
        });
    }
    else{
        console.log("sid is not defined and not in testing mode. Aborting");
    }
});

