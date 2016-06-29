<?php

$con=mysqli_connect("localhost","root","cobweb2015","cobweb");
// Check connection
if (mysqli_connect_errno())
{
  	printf( "Failed to connect to MySQL: " . mysqli_connect_error());
}

// Check connection
#$query = mysqli_query($con, "SELECT t.location, t.id, t.text as tweet, t.image_url, t.lon, t.lat, t.time_stamp as time, l.time_stamp from tweets t INNER JOIN locations l ON t.id = l.id where l.time_stamp >= (NOW() - INTERVAL 1 MONTH)");
$query = mysqli_query($con, "SELECT t.location, t.id, t.text as tweet, t.image_url, t.lon, t.lat, t.time_stamp as time, 
l.time_stamp from tweets t INNER JOIN locations l ON t.id = l.id where l.time_stamp >= (NOW() - INTERVAL 1 MONTH)");
if (false === $query ) {
        printf("MYSQL ERROR");
   }


$rows = array();

while($r = mysqli_fetch_assoc($query)) {
	if(strcmp($r['tweet'], 'null') !== 0){
	$text = $r['tweet'];
	#$loc = $r['location'];
	#$time = $r['time'];
	#$image = $r['image_url'];
	#$lon = floatval($r['lon']);
	#$lat = floatval($r['lat']);
    $rows[] = array(
	"type" => "Feature",
	"geometry" => array(
		"type" => "Point",
		"coordinates" => array(floatval($r['lon']), floatval($r['lat']))),
	"properties" => array(
			"location" => $r['location'],
			"timestamp" => $r['time'],
			"text" => $text,
			"image" => $r['image_url'])
			);
	}
}
$table = array("type" => "FeatureCollection", "features" => $rows);
#$table['features'] = $rows;
$jsonTable = json_encode($table,  JSON_UNESCAPED_UNICODE);

// return the JSON data
echo $jsonTable;

?>