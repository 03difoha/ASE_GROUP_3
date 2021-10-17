# Code Along - Week 1

Description: Produce an Android or iPhone or cross-platform app that displays the phone's current GPS position on the phone. 

We are going to use the following tools to build our app

- Framework: [Expo](<https://expo.dev/>) / React Native 
- Language: Javascript
- modules: [mapView](<https://docs.expo.dev/versions/latest/sdk/map-view/>
), [Location](<https://docs.expo.dev/versions/latest/sdk/location/#locationgetcurrentpositionasyncoptions>
)
- IDE: [Snack](<https://snack.expo.dev/>)
---------
## Getting started

Expo is a framework that bundles our react native application into formats which can be used for web, and native apps. It has good documentation and provides a great hot releoad feature so we can see changes to our code immediatley reflected on our device using the [Expo Go](<https://expo.dev/client>)

- Download [Expo Go](<https://expo.dev/client>) on our mobile device

-  Create an account at <https://expo.dev/>

- Click `create a New Snack`

What you see here is the basic react native app skeleton. 

`App.js` is the heart of our application. We import modules we want to use here and `export` the main view of our application in form similar to `HTML`

`node_modules` contains many node.js modules which our app needs to function. newly installed modules live here. We don't touch anything inside this folder.

`package.json` describes our application and tells our computer what to install and how to run the app.

`components` will contain out react native components i.e menu, map, header, footer etc.

`assets` is simply somewhere to put any images, videos or other media that our app uses.

`README.md` is a human readable file written in markdown for developers to see learn what the app does and how to run it. You are reading a .md file right now too!

----------------------------------------------------------------


### Getting device location

Expo's documentation outlines how to get a device's location [here](<https://docs.expo.dev/versions/latest/sdk/location/#locationgetcurrentpositionasyncoptions>)

The code snippet on the link above shows a simple implementation of the `Location` module.

delete everything in your default `app.js` above:
```
const styles = StyleSheet.create({...
```
(we want to keep our style object for later)


Copy the snippet from the `Location` expo documentation and paste it above your style object

lastly, add `import Constants from 'expo-constants';` to the other imports at the top. We do this because our style object requires it and we pasted over it with the new code. Replacing this will prevent us getting an error when we run the app.

- (Note: When importing modules in snack we will see a red error at the bottom of the page suggeesting we install the corresponding dependency. Make sure you do this.)
- (Also Note, when developing an expo app or any node.js app on the IDE on your machine we would need to install the dependencies ourselves using the command line


We should now be able to scan the QR code provided by snack using Expo Go and see our location as a JSON object on screen!

![](<https://media.discordapp.net/attachments/897034672461189176/899336338933952552/Screenshot_20211017_174052_host.exp.exponent.jpg?width=477&height=1034>)

Going by the assignment, strictly speaking we could stop here as we have satisfied the  specification. However, since we can guess there will probably be a map component needed further down the line, and for the sake of us learning together lets implement an actual map using our data. 

- Go to the [mapView](<https://docs.expo.dev/versions/latest/sdk/map-view/>) component documentation

We can see again expo provides us with some useful snippet that we can integrate with our existing code.

The snippet simply imports a map component and places inside our app. Lets do that:


- add `import MapView from 'react-native-maps';` at the top of our file.

- paste `<MapView style={styles.map}/>` inside `<view>` above the `<text>` component

- add the following to our `styles` object. (This will make our map as wide and tall as our device screen, no matter the size)
```
map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
},
```

- add `Dimensions` to the import statement `from 'react-native'` (As you may have guessed by now the react native module contains many components which we can import individually to save loading time)


Lets now look at our device to see what we have. It should look like this:

![](<https://media.discordapp.net/attachments/897034672461189176/899343743537262632/Screenshot_20211017_181044_host.exp.exponent.jpg?width=477&height=1034>
)

We have our coordinates, we have our map, but they are not speaking right now. Lets help them do that.

referring back to our location code:

- `getCurrentPositionAsync` is called and the result assigned to the variable `location`

- logging the `location` variable shows:

```
Object {
  "coords": Object {
    "accuracy": 77.5999984741211,
    "altitude": 54.08745749304167,
    "altitudeAccuracy": 3,
    "heading": 0,
    "latitude": 50.8106511,
    "longitude": -0.4292937,
    "speed": 0,
  },
  "mocked": false,
  "timestamp": 1634230381064,
}
```

so after successfully getting the `location` lets assign two variables `lat` and `long`. ( In JS nested values inside objects can be accessed using a full stop like so:  `parent.child`

```
let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);

    lat = location.coords.latitude;
    long = location.coords.longitude;
  
  }
```

Since Expo is essentially building on top of React Native components, the expo docs show us where the [map component lives within the React Native project.
](https://github.com/react-native-maps/react-native-maps)
 

 We can see on the page above that our map component takes a `prop` called `region` like so:

```
region={{
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
}}
```

You can think of props as parameters for a component; they define the components behavior. The great thing about react is that if a prop updates then the component automatically updates too, i.e our map should move if the data we passed as a prop changes too.

Once you have added the `region` prop above you should see the map change to a location in San francisco. We have directly told the map where to load. Now all we need to do is give it *our* location information.

change your region prop so it includes the `lat` and `long` variables we defined earlier:

```
region={{
    latitude: lat,
    longitude: long,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
}}
```
Now you should be able to see your location on the map!



