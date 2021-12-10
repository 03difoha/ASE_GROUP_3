import React, { useState, useEffect } from "react";
import MapView from "react-native-maps";
import * as Network from "expo-network";

import Slider from '@react-native-community/slider'

import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Keyboard,
} from "react-native";




import * as Location from "expo-location";
// import { get_price_data } from "./utilities";

export default function App() {
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  const [hm_points, setHM_Points] = useState([
    { latitude: lat, longitude: long, weight: 1 },
  ]);

  const [errorMsg, setErrorMsg] = useState("");
  const [isAppTime, setAppTime] = useState(false);
  const [isaddressflag, setAddressFlag] = useState(false);
  const [isyear, setYear] = useState(2000);
  const [filterbyyear, setFilterByYear] = useState(false)
  var [postCodeInput, setPostCodeInput] = useState("");
  var tempInput = "";

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

  
  
  async function get_price_data(lat, long) {
    fetch("https://b274zqubga.execute-api.us-east-1.amazonaws.com/dev/", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lat: lat, long: long }),
    })
      .then((response) => response.json())
      .then((data) => {
        neaten_the_data_to_the_format_specified(data);
       
      })
      .catch((error) => {
        console.error("Error:", error);
        return null;
      });
  }

  function neaten_the_data_to_the_format_specified(dirty_hm_points) {
  
    if (dirty_hm_points["message"] != "Internal Server Error") {
      let clean_hm_points = Object.values(dirty_hm_points).map((i) => ({
        latitude: Object.values(i)[0],
        longitude: Object.values(i)[1],
        weight: Object.values(i)[2],
      }));
     
      setHM_Points(clean_hm_points);
    }
  }
  

  async function get_price_data_years(lat, long) {
    fetch("https://b274zqubga.execute-api.us-east-1.amazonaws.com/dev/pricesByYear", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lat: lat, long: long }),
    })
      .then((response) => response.json())
      .then((data) => {
        neaten_the_data_to_the_format_specified_years(data);
     
      })
      .catch((error) => {
        console.error("Error:", error);
        return null;
      });
  }



  

  function filter(e) {


    if (e['years'][isyear]) {e['weight'] = e['years'][isyear]['avg']}
     else {e['weight'] = 0}

    delete e['years'];


    let new_e = {latitude : Object.values(e)[0],
                 longitude : Object.values(e)[1],
                 weight : Object.values(e)[2]}


    return new_e

  }

  function neaten_the_data_to_the_format_specified_years(dirty_hm_points) {
   
    if (dirty_hm_points["message"] != "Internal Server Error") {
      let clean_hm_points = Object.values(dirty_hm_points).map((i) => (filter(i)));

      setHM_Points(clean_hm_points);
    }
  }

  async function update_latlong_loc() {
    update_hm_points();
  }

  async function update_latlong_post() {
    update_hm_points_post();
  }

  async function update_latlong_click(e) {
    setLat(e.nativeEvent.coordinate["latitude"]);
    setLong(e.nativeEvent.coordinate["longitude"]);
  }

  async function update_hm_points() {
    let location = await Location.getCurrentPositionAsync({});
    setLat(location.coords.latitude);
    setLong(location.coords.longitude);
    let lat_loc = location.coords.latitude;
    let long_loc = location.coords.longitude;

    console.log('filtertime', filterbyyear)
    

    if (!filterbyyear) {

    get_price_data(lat_loc, long_loc); } else {
    get_price_data_years(lat_loc, long_loc); }
  }

  async function update_hm_points_filter() {

    console.log('filtertime', filterbyyear)

    if (filterbyyear) {

    get_price_data(lat, long); } else {
    get_price_data_years(lat, long); }
  }

  async function update_hm_points_click(e) {
    let lat_click = e.nativeEvent.coordinate["latitude"];
    let long_click = e.nativeEvent.coordinate["longitude"];

    if (filterbyyear) {

      get_price_data(lat_click, long_click); } else {
      get_price_data_years(lat_click, long_click); }
  }

  async function update_hm_points_post() {
    let postcode_location = await Location.geocodeAsync(postCodeInput);
    setLat(postcode_location[0]["latitude"]);
    setLong(postcode_location[0]["longitude"]);
    let lat_post = postcode_location[0]["latitude"];
    let long_post = postcode_location[0]["longitude"];

    if (!filterbyyear) {

      get_price_data(lat_post, long_post); } else {
      get_price_data_years(lat_post, long_post); }

  }

  function slideMove(e) {
   
    let new_e = e + 1995; 
   
    setYear(new_e);
    update_hm_points_filter();

  }

  async function hookcheck() {

    let filterbyyear = setFilterByYear(prevCheck => !prevCheck); 
    return filterbyyear}


  function slideaway() {let filterbyyear = hookcheck();  
                        update_hm_points_filter(filterbyyear);}

  function Slide() {
  
  return (
    

    [<Button

    title = 'Data over all time'
    onPress = {() => slideaway(0)} 
    >
                
    </Button>,

        <Slider
        style={{width: 200, height: 40}}
        maximumValue={25}
        minimumValue={0}
        minimumTrackTintColor="#307ecc"
        maximumTrackTintColor="#000000"
        step={1}
        value={isyear - 1995}
        onSlidingComplete = {(e) => slideMove
          (e)}
        on
      /> ] 
      
  )

}

  function clickToMove(e) {
    update_latlong_click(e);
    update_hm_points_click(e);
  }

  function MainApp() {
    return (
      <View style={styles.container}>
        
        

        {filterbyyear?

        <MapView
          style={styles.map}
          region={{
            latitude: lat,
            longitude: long,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
          }}
          onPress={(e) => {
            clickToMove(e);
          }}
        >


          
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

          </MapView>
        
        : 

        <MapView
          style={styles.map}
          region={{
            latitude: lat,
            longitude: long,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
          }}
          onPress={(e) => {
            clickToMove(e);
          }}
        >
        
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

          </MapView>
         }
         

        {filterbyyear ?      

        Slide() 

         : <Button

        title = 'Filter By Year'
        onPress = {() => slideaway(1)}> 
                      
        </Button> }


        <Text> Year </Text>

        

        {filterbyyear? <Text> {isyear} </Text> :   <Text> 1996 - 2020 </Text>}
       
        
        
        
       
        <View flex={0} flexDirection="row" paddingBottom={15}></View>
        <BackButton />

        
      </View>
    );
  }

  function enter() {
    setAppTime(true), update_latlong_loc();
  }
  function EnterButton(props) {
    return <Button title="Use my location" onPress={() => enter()}></Button>;
  }

  function BackButton(props) {
    return <Button title="Back Now" onPress={() => [setAppTime(false), setFilterByYear(false)]}></Button>;
  }
  function PostClickcheck(text) {

    if (text == '') {setAddressFlag(true)}

  else {  
    setAddressFlag(false);
    setPostCodeInput(text);
    postCodeInput = text;
    Keyboard.dismiss();
    setAppTime(true);
    update_latlong_post();
    
  }

  }

  function PostCodeButton(props) {
    return (
      <Button
        title="Enter A Postode"
        onPress={() => PostClickcheck(tempInput)}
      ></Button>
    );
  }

  function setTempin(text) {
    tempInput = text;
  }

  function IntroPage() {
    return (
      <View style={[styles.text_stuff, styles.container]}>
        <Text style={[styles.text_stuff]}>
         Find the average house price for all the postcodes in a 2km radius around either your phone's current location or
          any address in the UK.
          </Text>
          <Text>
         

          Click around the map to discover new locations.
         
        </Text>
        <Text></Text>
        <EnterButton />
        <Text></Text>
        <PostCodeButton />
        <Text></Text>

        
        
        {isaddressflag
          ? <TextInput
          style={styles.text_input}
          onChangeText={(text) => setTempin(text)}
          onSubmitEditing={() => PostClickcheck(tempInput)}
          autoFocus
        ></TextInput>
          : <TextInput
          style={styles.text_input}
          onChangeText={(text) => setTempin(text)}
          onSubmitEditing={() => PostClickcheck(tempInput)}
        ></TextInput>
        }  
        
      </View>
    );
  }

  function Greeting(props) {
    const isAppTime = props.isAppTime;
    if (isAppTime) {
      return <MainApp />;
    }
    return <IntroPage />;
  }
  return <Greeting isAppTime={isAppTime} />;
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
    borderRadius: 50,
    backgroundColor: "#fff",
  },

  text_stuff: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    backgroundColor: "orange",
    padding: 5,
  },

  text_input: {
    width: 200,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    padding: 5,
  },
});
