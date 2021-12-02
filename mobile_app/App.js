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
  Keyboard
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


  console.log(hm_points)
  const [errorMsg, setErrorMsg] = useState("");
  const [internetReachable, setInternetReachable] = useState(null);
  const [isAppTime, setAppTime] = useState(false);
  const [postCodeMode, setPostCodeMode] = useState(false);
  
  
  var [postCodeInput, setPostCodeInput] = useState("");
  var tempInput = ''

  //export { setHM_Points };

  /*
  const hm_points = [
    { latitude: lat, longitude: long, weight: 1 },
    { latitude: lat + 0.0001, longitude: long + 0.0001, weight: 1 },
    { latitude: lat - 0.0001, longitude: long - 0.0001, weight: 1 },
    { latitude: lat - 0.0001, longitude: long + 0.0001, weight: 1 },
    { latitude: lat + 0.0001, longitude: long - 0.0001, weight: 1 },
    { latitude: lat, longitude: long + 0.00015, weight: 1 },
    { latitude: lat, longitude: long - 0.00015, weight: 1 },
  ]; */

  const ref = useRef(null);

  async function update() {
    let location = await Location.getCurrentPositionAsync({});
    setLat(location.coords.latitude);
    setLong(location.coords.longitude);
    setLocation(location);
    setMarkers(get_bounding_box(lat, long));

    // Yes I am aware that send location was neatly off in utilities, Hook calls were messing up trying to get betwen the files so I've just moved it here to minimise faff.
    
    
    function neaten_the_data_to_the_format_specified(hm_points) {
      
      //console.log(Object.entries(hm_points)[1][1]['avg_price'])

      //console.log(Object.values(hm_points))

      let hm_points_curr = Object.values(hm_points).map((i) => ({'latitude' : Object.values(i)[0], 'longitude' : Object.values(i)[1], 'weight' : Object.values(i)[2]}));   //([key, value]) => {lat : {value.lat} long : {value.long} weight : {value.avg_price}})

      //console.log('currr: ', hm_points_curr);
      
      setHM_Points(hm_points_curr);
    }
    
    async function send_location(lat, long) {
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
          
          neaten_the_data_to_the_format_specified(data)
          
          //var dataa = data
    
          //return dataa
    
          
        })
        .catch((error) => {
          console.error("Error:", error);
          //return null
        });
    }

    send_location(lat, long);
    //console.log('hm_points_DAta: ', data);

    //console.log('hm_points_Set: ', hm_points);
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
      >

        {console.log('currr: ', )}
        <MapView.Heatmap
          points={hm_points}
          opacity={0.6}
          radius={150}
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

        <Text>

          </Text>

        <BackButton />
        

      </View>
    </View>
  }

  function Clickcheck() {
    console.log('clicked and this is prev app time: ', isAppTime)
    setAppTime(true)
    console.log('And this is new app time: ', isAppTime)
  }
  
  function EnterButton(props) {
    return (
  
  
      <Button 
      title = 'Use my location'
      onPress =  {() => Clickcheck()} >
       
    </Button>
         
    );
  }

  function BackClickcheck() {
    console.log('clicked and this is prev app time: ', isAppTime)
    setAppTime(false)
    console.log('And this is new app time: ', isAppTime)
  }
  
  function BackButton(props) {
    return (
  
  
      <Button 
      title = 'Back Now'
      onPress =  {() => BackClickcheck()} >
       
    </Button>
         
    );
  }

  function PostClickcheck(text) {
    console.log('The post code1: ', postCodeInput, 'and the temp: ', text, ' ', tempInput)
    
    setPostCodeInput(text)

    postCodeInput = text
    
    setPostCodeMode(true)

    
    console.log('The post code2: ', postCodeInput, 'and the temp: ', text, ' ', tempInput)

    Keyboard.dismiss()

    //Geocoder.geocodeAddress('New York').then(res => {})
      // res is an Array of geocoding object (see below)
  
  console.log(Location.geocodeAsync('BN2 3QA'))


  Geocode.fromAddress("Eiffel Tower").then(
    (response) => {
      const { lat, lng } = response.results[0].geometry.location;
      console.log(lat, lng);
    },
    (error) => {
      console.error(error);
    }
  );

  

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
        
        Hey there, 

          Would you like to use your phone's current location or enter a postcode??
          
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
    console.log('is it apptime? ', isAppTime)
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
