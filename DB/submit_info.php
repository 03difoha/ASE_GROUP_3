<?php

include 'DBConfig.php';

$con = mysqli_connect($HostName,$HostUser,$HostPass,$DatabaseName);
$json = file_get_contents('php://input');
$obj = json_decode($json,true);
$id = $obj['phone_id'];
$lat = $obj['latitude'];
$lon = $obj['longitude'];
$timedate = $obj['timedate'];

$Sql_Query = "INSERT INTO GPSDATA (phone_id,latitude,longitude,timedate) VALUES('$id','$lat','$lon','$timedate')";

if(mysqli_query($con,$Sql_Query)){
  $MSG = "Data Inserted Successfully";
  $json = json_encode($MSG);
  echo $json;
}
else{
  echo 'Try Again';
}
mysqli_close($con);

?>