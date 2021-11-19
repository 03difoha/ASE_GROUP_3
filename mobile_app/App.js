import React, { useRef, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import MapView from "react-native-maps";
import * as Device from "expo-device";
import * as Network from "expo-network";

import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
} from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";

import { get_bounding_box } from "./utilities";

export default function App() {
  const [location, setLocation] = useState();
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [internetReachable, setInternetReachable] = useState(null);

  const hm_points = [
    { latitude: lat, longitude: long, weight: 1 },
    { latitude: lat + 0.0001, longitude: long + 0.0001, weight: 1 },
    { latitude: lat - 0.0001, longitude: long - 0.0001, weight: 1 },
    { latitude: lat - 0.0001, longitude: long + 0.0001, weight: 1 },
    { latitude: lat + 0.0001, longitude: long - 0.0001, weight: 1 },
    { latitude: lat, longitude: long + 0.00015, weight: 1 },
    { latitude: lat, longitude: long - 0.00015, weight: 1 },
  ];

  const hm_points2 = [
    { latitude: lat + 0.0001, longitude: long + 0.0001},
    { latitude: lat, longitude: long + 0.00015},
    { latitude: lat - 0.0001, longitude: long + 0.0001},
    { latitude: lat - 0.0001, longitude: long - 0.0001},
    { latitude: lat, longitude: long - 0.00015},
    { latitude: lat + 0.0001, longitude: long - 0.0001},
   
    
  ];

  let map_areas = require('./Map_Areas_smol.json');

  //console.log("hellohelolheol", map_areas['geometry']['coordinates'][0].length);
  //console.log("it'sthecords", map_areas['geometry']['coordinates'][0]);
  //console.log("hellohelolheol[111]", map_areas['geometry']['coordinates'][3].length);
  //console.log("it'sthecords[1111]", map_areas['geometry']['coordinates'][3]);

/*
  const polygon = map_areas['geometry']['coordinates'].map(coords_list => { 
    coords_list.map(xy => {

      let smol_coords = {    
        latitude: xy[1],
        longitude: xy[0],
      }
      
      return smol_coords;
    }

  )});
 */


   
 
    const polygon = map_areas['geometry']['coordinates'][0].map(coordsArr => { 
      let coords = {
          latitude: coordsArr[1],
          longitude: coordsArr[0],
        }
        return coords;
  }); 


  let map_areas_big2 = require('./Map_Areas.json');

  var polygon_list = [];
  const areas_length = map_areas_big2['features'].length;



  for (var i = 0; i < 6; i++) {

    const polygon_x =  map_areas_big2['features'][i]['geometry']['coordinates'][0].map(coordsArr => { 
      let coords = {
          latitude: coordsArr[1],
          longitude: coordsArr[0],
        }
        return coords;
      });

      polygon_list.push([polygon_x, i]);

      };

  

      


  //console.log("The feats", map_areas_big2['features'][2]['geometry']['coordinates'][0].length);
  //console.log("The feats", map_areas_big2['features'][2]['geometry']['coordinates'][0]);
    //console.log('My my!!!', polygon_list[0])
    console.log('#ofcounties', areas_length)


  /*
  // json_map_areas['geometry']['coordinates'][1] =  [[lat + 0.0001, long + 0.0001], [lat + 0.0001, long - 0.0001], [lat  0.0001, long + 0.0001]]
  const polygon_array = []
  
  for (var i = 0; i < map_areas['geometry']['coordinates'][1].length - 2; i++) {
    console.log("i", i);

  

  polygon_array.push(polygon_x)

  };
*/
  //console.log("coord", polygon);


  const ref = useRef(null);

  async function update() {
    let location = await Location.getCurrentPositionAsync({});
    setLat(location.coords.latitude);
    setLong(location.coords.longitude);
    setLocation(location);
    setMarkers(get_bounding_box(lat, long));

    // console.log(location);

    // fetch(
    //   "https://3tx3vlacv6.execute-api.us-east-1.amazonaws.com/dev/hello",
    //   {
    //     method: "POST", // or 'PUT'
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       phone_id: Device.deviceName + ": " + Device.osInternalBuildId,
    //       latitude: lat,
    //       longitude: long,
    //       timedate: Date().toLocaleString(),
    //     }),
    //   }
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Success:", data);
    //   })
    //   .catch((error) => {
    //     console.error("Error:", error);
    //   });
  }
  useEffect(() => {
    (async () => {
      const isInternetReachable = await Network.getNetworkStateAsync();
      if (!isInternetReachable) {
        setErrorMsg("Check internet connection and restart app");
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      update();
    })();

    // const interval = setInterval(() => update(), 10000);
    // return () => {
    //   clearInterval(interval);
    // };
    // update();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: lat,
          longitude: long,
          latitudeDelta: 0.04,
          longitudeDelta: 0.05,
        }}
      >
        <MapView.Heatmap
          points={hm_points}
          opacity={1}
          radius={20}
          maxIntensity={100}
          gradientSmoothing={10}
          heatmapMode={"POINTS_DENSITY"}
        />

        <MapView.Polygon
            coordinates={hm_points2}
            fillColor='rgba(200,20,20,0.5)'
            strokeWidth= {10} />
          
            
        {polygon_list.map((poly_pair) => (
          
          <MapView.Polygon 
            key = {poly_pair[1]}
            coordinates = {poly_pair[0]}
            fillColor = 'rgba(0,0,250,0.1)'
            strokeWidth = {1}
            />
        ))}                   

        <MapView.Marker
          coordinate={{
            latitude: lat,
            longitude: long,
          }}
          title={"Your Current Location"}
        />

        <MapView.Marker
          coordinate={
            polygon[0]
          }
          title={"Your Current Location"}
        />
        {markers.map((marker, index) => (
          <MapView.Marker key={index} coordinate={marker} />
        ))}
      </MapView>
      <Text style={styles.paragraph}>{errorMsg}</Text>
      <View style={styles.buttonView}>
        <Button
          name="updLoc"
          onPress={update}
          title="Update location"
          color="#841584"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  map: {
    width: 600,
    height: 500,
  },
  left: {
    alignSelf: "flex-start",
    display: "flex",
  },

  paragraph: {
    fontSize: 12,
    textAlign: "left",
    paddingBottom: 10,
  },

  buttonView: {
    paddingTop: 10,
    display: "flex",
  },
});
