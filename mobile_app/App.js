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
        

      
      <MapView.Heatmap points={hm_points}
                              opacity={1}
                              radius={20}
                              maxIntensity={100}
                              gradientSmoothing={10}
                              heatmapMode={"POINTS_DENSITY"}
        />
      

        <MapView.Marker
          coordinate={{
            latitude: lat,
            longitude: long,
          }}
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
