import React, { useRef, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import MapView from "react-native-maps";
import * as Device from "expo-device";
import * as Network from "expo-network";
import Geocoder from 'react-native-geocoder';
import Geocode from "react-geocode";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
  TextInput,
  Keyboard,
  Pressable
} from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { get_bounding_box } from "./utilities";

export default function App() {
  const [location, setLocation] = useState();
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [hm_points, setHM_Points] = useState([{ latitude: lat, longitude: long, weight: 1 }]);
  const [location_flag, setLocation_Flag] = useState(true);
  const [postcode_flag, setPostCode_Flag] = useState(false);
  const [click_flag, setClick_Flag] = useState(false);
  const [postcode_keyboardfocus_flag, setPostCode_KeyboardFocus_Flag] = useState(false);
  const [latlongclick, setLatLongClick] = useState({ latitude: lat, longitude: long});
  const [errorMsg, setErrorMsg] = useState("");
  const [internetReachable, setInternetReachable] = useState(null);
  const [isAppTime, setAppTime] = useState(false);
  const [postCodeMode, setPostCodeMode] = useState(false);
  var [postCodeInput, setPostCodeInput] = useState("");
  var tempInput = ''
  const ref = useRef(null);

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
    })();
  }, []);  


  function neaten_the_data_to_the_format_specified(dirty_hm_points) {
      if (dirty_hm_points['message'] != "Internal Server Error") {
      let clean_hm_points = Object.values(dirty_hm_points).map((i) => ({'latitude' : Object.values(i)[0], 'longitude' : Object.values(i)[1], 'weight' : Object.values(i)[2]}));
      setHM_Points(clean_hm_points);
      console.log('sending lat long ##################### Succesffuly sent : ', lat, long)
      }
    }
    
    async function send_location(lat, long) {
      console.log('sending lat long ##################### does send even run? : ', lat, long)
      fetch("https://b274zqubga.execute-api.us-east-1.amazonaws.com/dev/", {   
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat: lat, long: long }),
      })
        .then((response) => response.json())
        .then((data) => {
          //console.log("Success:", data)
          console.log('sending lat long ##################### just about 2 send : ', lat, long)
          neaten_the_data_to_the_format_specified(data)
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

  async function update_latlong_loc() {
    update_hm_points()
    console.log('curr lat long (from Location): ', location)
    }
 
  async function update_latlong_post() {
    update_hm_points_post()
    console.log('curr lat long (from postcode): ', lat, long)
    }

  async function update_latlong_click(e) {
    console.log('heyehgeyhyey', '', e.nativeEvent.coordinate["latitude"])
    setLat(e.nativeEvent.coordinate["latitude"]);
    setLong(e.nativeEvent.coordinate["longitude"]);
    console.log('curr lat long (from click): ', lat, long)
    }

async function update_hm_points() {
    console.log('sending lat long ##################### pre-sending : ', lat, long)
    let location = await Location.getCurrentPositionAsync({});
    setLat(location.coords.latitude);
    setLong(location.coords.longitude);
    setLocation(location);
    let lat_loc = location.coords.latitude
    let long_loc = location.coords.longitude
    send_location(lat_loc, long_loc);
  }

  async function update_hm_points_click(e) {
    let lat_click = e.nativeEvent.coordinate["latitude"];
    let long_click = e.nativeEvent.coordinate["longitude"];
    console.log('sending lat long ##################### pre-sending : ', lat, long)
    send_location(lat_click, long_click);
  }

  async function update_hm_points_post() {
    let postcode_location = await Location.geocodeAsync(postCodeInput);
    setLat(postcode_location[0]['latitude']);
    setLong(postcode_location[0]['longitude']);
    let lat_post = postcode_location[0]['latitude']
    let long_post = postcode_location[0]['longitude']
    send_location(lat_post, long_post);
  }

  function clickToMove(e) {console.log('click', latlongclick)
                          console.log(e.nativeEvent.coordinate["latitude"])
                          console.log(e.nativeEvent.coordinate["longitude"])
                           update_latlong_click(e)
                           update_hm_points_click(e)
                           console.log('click', lat, long)};

  function MainApp() {
    return <View style={styles.container}>
    <MapView
        style={styles.map}
        region={{
          latitude: lat,
          longitude: long,
          latitudeDelta: 0.04,
          longitudeDelta: 0.05,
        }}
        onPress={(e) =>  {clickToMove(e)}}>
        <MapView.Heatmap
          points={hm_points}
          opacity={0.6}
          radius={50}
          maxIntensity={100}
          gradientSmoothing={10}
          heatmapMode={"POINTS_DENSITY"}
        />
  
        <MapView.Marker
          coordinate={{
            latitude: lat,
            longitude: long,
          }}
          title={"Average price in this area is £" + hm_points[0].weight}
          //title={JSON.stringify(hm_points)}
        />
        {markers.map((marker, index) => (
          <MapView.Marker key={index} coordinate={marker} />
        ))}  
      </MapView>
      <Text style={styles.paragraph}>{errorMsg}</Text>
      <View flex = {0}
        flexDirection = 'row'
        paddingBottom = {15}>
      </View>
      <BackButton />
    </View>
  }

  function enter() {setAppTime(true), console.log('hello>?'), update_latlong_loc()}
  function EnterButton(props) {
    return (
    <Button 
      title = 'Use my location'
      onPress =  {() => enter()} >
    </Button>
    );
  }

  function BackButton(props) {
    return (
    <Button 
      title = 'Back Now'
      onPress =  {() => setAppTime(false)} >
    </Button>
    );
  }
  function PostClickcheck(text) {
    setPostCodeInput(text)
    postCodeInput = text
    Keyboard.dismiss()
    setAppTime(true)
    update_latlong_post()
  }

  function PostCodeButton(props) {
    return (
    <Button 
      title = 'Enter A Postode'
      onPress =  {() => PostClickcheck(tempInput)} >
    </Button>   
    );
  }

  function setTempin(text) {
    tempInput = text
  }

  function IntroPage() {
    return <View style={[styles.text_stuff, styles.container]}>
      <Text style={[styles.text_stuff]}>
        "Hey there, Would you like to use your phone's current location or enter a postcode?"
        </Text> 
        <Text> 
        </ Text>
        <EnterButton />
        <Text> 
        </ Text>
        <PostCodeButton />
        <Text> 
        </ Text>
        <TextInput  style={styles.text_input} 
                    onChangeText = {(text) => setTempin(text)} 
                    onSubmitEditing = {() => PostClickcheck(tempInput)}  >
       </TextInput>
       </View>
  }
  
  function Greeting(props) {
    const isAppTime = props.isAppTime;
    //console.log('is it apptime? ', isAppTime)
    if (isAppTime) {
      return <MainApp />;
    }
    return <IntroPage />;
  }
  return (    
    <Greeting isAppTime = {isAppTime} />
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

  round_buttonView: {
    paddingTop: 10,
    display: "flex",
    borderRadius:50,
    backgroundColor:'#fff'
  },

  text_stuff: {
    textAlign: 'center', 
    fontWeight: 'bold',
    fontSize: 20,
    backgroundColor: 'orange',
    padding: 5
  },

  text_input: {
    width: 200, 
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    padding: 5
  }
});
