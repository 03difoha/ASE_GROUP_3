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

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const ref = useRef(null);

  async function update() {
    let connState = await Network.getNetworkStateAsync();
    if (connState.isInternetReachable == true) {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log(location);
      alert("Data sent to server!");
    } else {
      alert("Check internet connection!");
    }
  }

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android" && !Constants.isDevice) {
        setErrorMsg(
          "Oops, this will not work on Snack in an Android emulator. Try it on your device!"
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      //Location.watchPositionAsync({}, update);
      update();
    })();

    const interval = setInterval(() => update(), 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  function format_location_text(location) {
    for (const [key, value] of Object.entries(location)) {
      if (typeof value === "object") {
        format_location_text(value);
      } else {
        text = text.concat(`${key}: ${value}\n`);
      }
    }
  }

  let lat = 0;
  let long = 0;
  let hm_points = [{latitude: lat, longitude: long, weight: 1}]

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = "";
    format_location_text(location);
    lat = location.coords.latitude;
    long = location.coords.longitude;
    hm_points = [{latitude: lat, longitude: long, weight: 1},
      {latitude: lat + 0.0001, longitude: long + 0.0001, weight: 1},
      {latitude: lat - 0.0001, longitude: long - 0.0001, weight: 1},
      {latitude: lat - 0.0001, longitude: long + 0.0001, weight: 1},
      {latitude: lat + 0.0001, longitude: long - 0.0001, weight: 1},
      {latitude: lat, longitude: long + 0.00015, weight: 1},
      {latitude: lat, longitude: long - 0.00015, weight: 1}]; 

    fetch("https://3tx3vlacv6.execute-api.us-east-1.amazonaws.com/dev/hello", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_id: Device.deviceName + ": " + Device.osInternalBuildId,
        latitude: lat,
        longitude: long,
        timedate: Date().toLocaleString(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    //alert('Location sent to server!');
  }

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
          coordinate={{ latitude: lat, longitude: long }}
          title={"Your Current Location"}
        />
      </MapView>
      <Text style={styles.paragraph}>{text}</Text>
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
