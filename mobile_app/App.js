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
  const [latlongclick, setLatLongClick] = useState({ latitude: lat, longitude: long});

  //console.log(hm_points)
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

    console.log()
    console.log('Flags: ')
    console.log()
    console.log('Location: ', location_flag)
    console.log('postcode: ', postcode_flag)
    console.log('Click: ', click_flag)

    if (location_flag == true) {

    let location = await Location.getCurrentPositionAsync({});
    setLat(location.coords.latitude);
    setLong(location.coords.longitude);

    console.log('location example: ', location)
    setLocation(location);
    }

    if (postcode_flag == true) {

      let postcode_location = await Location.geocodeAsync(postCodeInput);
      console.log('postcodeinput', postCodeInput)
      console.log('man_loc', postcode_location)

      console.log('man_lat: ', postcode_location[0]['latitude'])

      setLat(postcode_location[0]['latitude']);
      setLong(postcode_location[0]['longitude']);

      console.log(lat, long)
    }

    if (click_flag == true) {

      setLat(latlongclick.latitude);
      setLong(latlongclick.longitude);

      console.log('curr lat long (from click): ', lat, long)

      //setLocation(location);
      }
    
   
    // setMarkers(get_bounding_box(lat, long));
    

    // Yeah soz, I am aware that send location was neatly off in utilities, Hook calls were messing up trying to get betwen the files so I've just moved it here to minimise addtional faff.
    
    
    function neaten_the_data_to_the_format_specified(dirty_hm_points) {
      
      //console.log(Object.entries(hm_points)[1][1]['avg_price'])

      console.log('Before Mapping: ', Object.values(dirty_hm_points))

      console.log('Before Mapping: ', dirty_hm_points['message'] == "Internal Server Error")

      if (dirty_hm_points['message'] != "Internal Server Error") {

      let hm_points_curr = Object.values(dirty_hm_points).map((i) => ({'latitude' : Object.values(i)[0], 'longitude' : Object.values(i)[1], 'weight' : Object.values(i)[2]}));   //([key, value]) => {lat : {value.lat} long : {value.long} weight : {value.avg_price}})

      console.log('After Mapping: ', hm_points_curr);
      
      setHM_Points(hm_points_curr);
      }
      //console.log('After Setting: ', hm_points);

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


    console.log('sending lat long ##################### : ', lat, long)

    
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

        onPress={(e) =>  {setLatLongClick([e.nativeEvent.coordinate]), 
                         console.log('click', latlongclick)}} // latitude: lat, longitude: long})}

      >

        {console.log('hm points: ', hm_points)}
        {console.log('colicicicikckcick', latlongclick)}
        {console.log('curr lat long: ', lat, long)}
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
          title={"Your Current Location"}
        />
        {markers.map((marker, index) => (
          <MapView.Marker key={index} coordinate={marker} />
        ))}  
      </MapView>
      <Text style={styles.paragraph}>{errorMsg}</Text>
          

      <View flex = {0}
      flexDirection = 'row'
      paddingBottom = {15}
      //width = {200}
      >
      <ClickModeButton />

      <PostCodeButton_InMain />
      
      </View>

      <View style={styles.buttonView}>

      
      <LocationModeButton />
        

        <Text>

          </Text>

        <BackButton />
        

      </View>
      
    </View>
  }

  function Clickcheck() {
    //console.log('clicked and this is prev app time: ', isAppTime)
    setAppTime(true)
    SetFlagsOnClick(3)
    //console.log('And this is new app time: ', isAppTime)
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
    //console.log('clicked and this is prev app time: ', isAppTime)
    setAppTime(false)
    //console.log('And this is new app time: ', isAppTime)
  }
  
  function BackButton(props) {
    return (
  
  
      <Button 
      title = 'Back Now'
      onPress =  {() => BackClickcheck()} >
       
    </Button>
         
    );
  }
  /*
  function post2lat(text) {
    //let local = await Location.geocodeAsync(text)

    let location = await Location.geocodeAsync('baker street london');
    local.then( result => {

      console.log('hello hello post code time:', result)
      this.setState({name: result});
     }, function(error) {
      this.setState({name: error});
     });

     console.log('hello hello post code time:', result)

  } */

  function PostClickcheck(text) {
    
    // console.log('The post code1: ', postCodeInput, 'and the temp: ', text, ' ', tempInput)
    
    setPostCodeInput(text)

    postCodeInput = text
    
    setPostCodeMode(true)

    console.log('in clickcheck - poscodemode?: ', postCodeMode)

    console.log('and the input:   ', postCodeInput)

    
    //post2lat(postCodeInput)
    
    // console.log('The post code2: ', postCodeInput, 'and the temp: ', text, ' ', tempInput)

    Keyboard.dismiss()

    setAppTime(true)

    SetFlagsOnClick(2)
    update()
    update()

    //Geocoder.geocodepostcode('New York').then(res => {})
      // res is an Array of geocoding object (see below)
  /*
  console.log(Location.geocodeAsync('BN2 3QA'))


  Geocode.frompostcode("Eiffel Tower").then(
    (response) => {
      const { lat, lng } = response.results[0].geometry.location;
      console.log(lat, lng);
    },
    (error) => {
      console.error(error);
    }
  );  */

  

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


  function SetFlagsOnClick(n) {

    if (n == 1) {
        setLocation_Flag(false)
        setPostCode_Flag(false)
        setClick_Flag(true)
        update()
      }
      else if (n == 2) {
        setLocation_Flag(false)
        setPostCode_Flag(true)
        setClick_Flag(false)
        update()
      }
      else if (n == 3) {
        setLocation_Flag(true)
        setPostCode_Flag(false)
        setClick_Flag(false)
        update()
      }
    }

  

  function ClickModeButton(props) {
    return (

      <View flex = {1}
      
      alignItems = 'flex-start'
      justifyContent= 'center'
      width = {50}>



      {click_flag ? (

        <Button 
            
        color = "green"
        width = {50}
        height = {50}
        title = 'Click View Mode'

        onPress = {() => {update(), console.log('we clicked')}}

        />

      ) : (

        <Button
    
        color = "red"
        width = {50}
        height = {50}
        title = 'Click View Mode'

        onPress = {() => {SetFlagsOnClick(1)}}
 
        />
      )}

      </ View>

    );
  }

  function PostCodeButton_InMain(props) {
    return (

      
      <View 
      
      flex = {1}
      
      alignItems = 'flex-end'
      justifyContent= 'center'
      width = {55} >



      {postcode_flag ? (

        <Button 
            
        color = "green"
        width = {50}
        height = {50}
        title = 'Post Code Mode'

        onPress = {() => {update(), console.log('we clicked')}}

        />

      ) : (

        <Button 
    
        color = "red"
        width = {50}
        height = {50}
        title = 'Post Code Mode'

        onPress = {() => {SetFlagsOnClick(2)}}

        //onClick = {() => setPostCode_Flag(true)}

        //onClick = 
        />
      )}

      </ View>
    

    );
  }


  function LocationModeButton(props) {
    return (  

      
      location_flag ? (

        <Button 
            
        color = "green"
        width = {50}
        height = {50}
        title = 'Current Location'

        onPress = {() => {update(), console.log('we clicked')}}
        

        />

        

      ) : (

        <Button 
    
        color = "red"
        width = {50}
        height = {50}
        title = 'Current Location'

        onPress = {() => {SetFlagsOnClick(3)}}
        />
      )
      
      ); 
  
  }
  
  function IntroPage() {
  
    return <View style={[styles.text_stuff, styles.container]}>
  
      <Text style={[styles.text_stuff]}>
        
        Hey there, 

          Would you like to use your phone's current location or enter a postcode?
          
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
