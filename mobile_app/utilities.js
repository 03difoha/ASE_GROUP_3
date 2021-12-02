//import setHM_Points from "./App.js";
//import setHM_Points from Appa

// 10001.965729km = 90 degrees
// 1km = 90/10001.965729 degrees = 0.0089982311916 degrees
// 5km = 0.04499115596 degrees, -> approx 0.045 degrees
// 0.045 / 2 = 0.0225 -> half the width of our box either side of our marker

const unit = 0.0225;

function get_bounding_box(lat, long) {
  //   console.log(lat - unit);
  var tl = {
    latitude: lat + unit,
    longitude: long - unit,
  };
  var tr = {
    latitude: lat + unit,
    longitude: long + unit,
  };

  var bl = {
    latitude: lat - unit,
    longitude: long - unit,
  };

  var br = {
    latitude: lat - unit,
    longitude: long + unit,
  };

  return [tl, tr, bl, br];
}

// "https://b274zqubga.execute-api.us-east-1.amazonaws.com/dev/"

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
      setHM_Points(data)
      //App.setHM_Points(data); 

      var dataa = data

      //console.log('DATAA: ', dataa);

      return dataa

      
    })
    .catch((error) => {
      console.error("Error:", error);
      return null
    });
}

export { get_bounding_box }; //, send_location };
