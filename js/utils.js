/** Using a self-executed function for namespace protection for all utility functions 
as we are still defining requirements and it is too early to use requirejs  */

( function (window) {
    
    /* local (not exported) configuration options */
    /******************/
    image_base = PRIVATE_SURVEY? ENDPOINTS[ENDPOINT_TYPE]["private_image_base"] :  ENDPOINTS[ENDPOINT_TYPE]["public_image_base"];

    /*** Popup Styles per feature ***/
    
    /**
     *  PCAPI has all the features as triplets with id (datatype) - label - value and we can display everything we want like multi-images
     * 
     * Function prototype follows "onEachFeature"(feature, layer) as described in the Leaflet GeoJSON example
     */
    function onEachFeature_pcapi(feature, layer) {
        var geom = feature.geometry.coordinates;
        var popupstr = "<b>Name:</b>: " + feature.name + "<br>";
        
        if (feature.properties){
            feature.properties.fields.map( function (props) {
                for ( var prop in props ){
                    if (  ( prop=="val") && (prop.label != "") ) {
                        //if IMAGE then it is either multiimage, single image or null
                        if ( props.type=="image"){ 
			    if (props.val instanceof Array){ //MULTIIMAGE
				v="<br/>";
				images = props.val;
				for( var idx in images){
                                    im = images[idx];
                                    im=im.replace(".jpg","_thumb.jpg");
                                    imgurl = image_base + feature.name + "/"  + im;
                                    v += "<img src='" + imgurl  + "'>"
				};
				props.val = v;
			    }
			    else if(props.val === null){ // empty image
				props.val = "<i>blank</i>"
			    }
			    else{ //single image filename
				imgurl = image_base + feature.name + "/"  + props.val;
				props.val = "<img src='" + imgurl  + "'>"
                            }
			}
                        popupstr += "<b>" + props.label + "</b>: " + props.val + "<br>";
                    }

                }
            });
        }
        layer.bindPopup(popupstr);
    }

    /**
     *  WFS has only label, value pair (escaped) and we have to use heuristics to guess data type of e.g. multi-images
     *
     * Function prototype follows "onEachFeature"(feature, layer) as described in the Leaflet GeoJSON example
     */
    function onEachFeature_wfs(feature, layer) {
        var popupstr = "";
        if (feature.properties){
                $.each(feature.properties, function (k,v) {
                    /** Probe single images */
                    if( (typeof v == "string") && v.match(/\/records\/.*\.jpg/) != null ){
                        if (PRIVATE_SURVEY){
                            imgurl = "https://dyfi.cobwebproject.eu/resources/" + sid + "/" + v.replace(/\/records\//, "/");
                        }
                        else{
                            imgurl = "https://dyfi.cobwebproject.eu/1.3/pcapi/fs/local/" + v;
                        }
                        v = "<img src='" + imgurl  + "'>"
                    }
                    /** Probe multiple images */
                    if( (typeof v == "string") && v.match(/{(.*\.jpg.*)}/) != null ){
                        re_group = v.match(/{(.*\.jpg.*)}/)[1];
                        images = re_group.split(',');
                        v="<br/>";
                        images.forEach( function(im){
                            im=im.replace(".jpg","_thumb.jpg");
                            if (PRIVATE_SURVEY){
                                imgurl = "https://dyfi.cobwebproject.eu/resources/" + sid + "/" + im;
                            }
                            else{
                                imgurl = "https://dyfi.cobwebproject.eu/1.3/pcapi/fs/local/" + PUBLIC_UUID + "/records/" + feature.properties["qa_name"] + "/" + im;
                            }
                            v+= '<img src="' + imgurl + '">'
                        });
                    }
                    ////  Post-process QA escaping madness 
                    if (k === "qa_name"){
                        k = "Name";
                    }
                    if (k === "pos_acc"){
                        k = "GPS Accuracy";
                    }
                    //// Skip values like uuid
                    if ((k != "bbox") && (k != "userid") && (k != "record_id") ){
                        /* everything else */
                        k = k.replace(/_/g,' ');
                        popupstr += "<b>" + k + "</b>: " + v + "<br>";
                    }
            });
            layer.bindPopup(popupstr);
        }
    };

    /*************************/
    /* Normalizes a geojson to a flat geojson by finding a common denominator (superschema) and using null values for non-common attributes.
     * This is necessary for allowing simpler tools (CSV, QA import) to work with the flexibility of PCAPI's geojson
     * 
     * @param geojson a featurecollection which may have different schema per feature(!)
     * @returns a flat arrray of "normalized" objects with same number of keys to encompass all features using nulls when appropriate
     */
    function make_flat_superschema (geojson){
        var all_headers = {}; // used for finding the superset of all headers for different schema
        for (var idx in geojson.features){
            //mandatory fields (always exist)
            feature = geojson.features[idx];
            all_headers["Name"] = 1; //poor man's implementation of a Set()
            feature.properties["Name"] = feature["name"];
            //optional fields
            if (feature.properties.fields){
                feature.properties.fields.map( function (props) {
                    //skip buggy FTOpen values like  {"id" : "fieldcontain-dtree","val" : null}
                    if ( props.val == null )
                    {
                        return; //meaning: continue
                    } 
                    //skip -*image-
                    //if ( props.id.indexOf("image-") != 0){
                    //console.log("processing ",props.label, " from ", feature.properties.Name);
                    feature.properties[props.label] = props.val;
                    all_headers[props.label] = 1;
                });
            }
            delete feature.properties.fields
            
            // QA madness requires ad-hoc monkey patching:
//             ["title", "footestfoo", "timestamp", "Make and Model", "comp_bar", "OS Version", "Azimuth", "Pitch", "Roll"].map( function(k){
//                 if ( typeof(feature.properties[k]) != "undefined"){
//                     console.log("adding :", feature.properties[k]);
//                     all_headers[k] = 1;
//                     value[k] = feature.properties[k]; //could be a number
//                 }
//                 else{ console.log("feature ",k, "for ", feature.properties[k], " does not exist");}
//             });
//             values.push(value);
        }
        /* add null values for non-existent values */
        
        geojson.features.map( function (f) {            
            for (var key in all_headers){
                if ( !(key in f.properties) ){
                    console.log( "added key " , key, " to " , f.properties.Name );
                    f.properties[key] = null;
                }
            }
        });
        console.log("all_headers: ", all_headers);
        return geojson;
    }
    
    function exportAsCSV( geojson ){
        var csv = "";
        var feature = null;
        var headers = [];
        
        csvquote = function(str){
            if( str == null){
                return "";
            }
            str = '"' + String(str).replace ('"', '\"') + '"';
            return str;
        }
        
        geojson_flat = make_flat_superschema(geojson);
        for (var idx in geojson_flat.features){
            feature = geojson_flat.features[idx];
            value = [];
            if (idx == 0){ // first line is header. just use first object
                for (key in feature.properties){
                    headers.push(key);
                }
                // Add headers + geometry column
                csv+=  (headers.map(function(x){return csvquote(x);})).join(',') + ',"geom"'+ "\n";
                console.log(csv);
            }
            // Add all flat properties of a feature
            headers.map(function (h){
                value.push(csvquote( feature.properties[h] ) );
                //console.log(feature.properties.Name, " ", h, " is ", csvquote(feature.properties[h]));
            });
            // Append geom column at the end (can be variable)
            value.push(csvquote(feature.geometry.coordinates))

            csv+= value.join(',') + "\n";
        }
        var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
        saveAs(blob, "data.csv");
    }
    
    function exportAsGeoJSON(geojson){
        objects = make_flat_superschema(geojson);
        out = JSON.stringify(objects);
        var blob = new Blob([out], {type: "application/vnd.geo+json"});
        saveAs(blob, "data.geojson");
    }

    
    /** Toolbar */
    /***********/
    
    /* Call this to add a toolbar with KML,CSV export actions for PCAPI 
     * @args map the leaflet map object
     * @args features featureGroup to export
     */
    function addToolbar(map, features){
        var ExportCSVAction = L.ToolbarAction.extend({
                options: {
                    toolbarIcon: {
                        html: 'CSV',
                        tooltip: 'Export as CSV' //todo use bootstrap's spinning buttons
                    }
                },
                addHooks: function () {
                    exportAsCSV(features);
                }
            });
        var ExportGeoJSONAction = L.ToolbarAction.extend({
                options: {
                    toolbarIcon: {
                        html: 'JS',
                        tooltip: 'Export as GeoJSON'
                    }
                },
                addHooks: function () {
                    exportAsGeoJSON(features);
                }
            });
        new L.Toolbar.Control({
            actions: [ExportCSVAction, ExportGeoJSONAction]
        }).addTo(map);
    } 
     /************/

     
    function addDyfiOverlay(map){
            L.tileLayer('tiles/dyfi/{z}/{x}/{y}.png',{
                minZoom: 10,
                maxZoom: 13,
                continuousWorld: true,
                attribution: '&copy; Countryside Council for Wales. All rights reserved.Contains Ordnance Survey Data. Ordnance Survey Licence number 100019741.  &copy; Crown Copyright and Database Right (2011)'
            }).addTo(map);

            /* Add legend */            
            var legend = L.control({position: 'bottomright'});
            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                div.innerHTML += '<i style="background:#EF321F"></i> Core Areas<br>';
                div.innerHTML += '<i style="background:#F99D22"></i> Buffer Areas';
                return div;
            };
            /* skip it as it distract people from dyfi woodlands */
            //legend.addTo(map);
    }

    /** Will return the right endpoint depednign on type (eg. WFS), test or privacy settings from config.js 
     * @return the right endpoint or null if both `sid' and `TEST' are false/null
     */
    function getEndpoint(sid) {
            var json_url = null;
            if (TEST){
                return ENDPOINTS[ENDPOINT_TYPE]["test_url"];
            }
            else if (sid == null ){
                return null
            }
            else if( ENDPOINT_TYPE == "WFS" ){
                if( PRIVATE_SURVEY ){
                    json_url = ENDPOINTS[ENDPOINT_TYPE]["private_base_url"];
                }
                else{
                    json_url = ENDPOINTS[ENDPOINT_TYPE]["public_base_url"];
                }
                json_url+= 'version=1.0.0&service=WFS&request=GetFeature&outputFormat=json&typename=cobweb:sid-' + sid;
            }
            else if( ENDPOINT_TYPE == "PCAPI" ){
                if( PRIVATE_SURVEY ){
                    json_url = ENDPOINTS[ENDPOINT_TYPE]["private_base_url"];
                }
                else{
                    json_url = ENDPOINTS[ENDPOINT_TYPE]["public_base_url"];
                }
                json_url+= 'filter=format,editor&frmt=geojson&id=' + sid + '.json';
            }
            return json_url;
    }

    //export
    window.addToolbar = addToolbar;
    window.addDyfiOverlay = addDyfiOverlay;
    window.onEachFeature_pcapi = onEachFeature_pcapi;
    window.onEachFeature_wfs = onEachFeature_wfs;
    window.getEndpoint = getEndpoint;
})(window);
