// 10001.965729km = 90 degrees
// 1km = 90/10001.965729 degrees = 0.0089982311916 degrees
// 5km = 0.04499115596 degrees, -> approx 0.045 degrees
// 0.045 / 2 = 0.0225 -> half the width of our box either side of our marker

const unit = 0.0225;

function get_bounding_box(lat, long) {
  //   console.log(lat - unit);
  var tl = {
    latitude: lat - unit,
    longitude: long + unit,
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
    latitude: lat + unit,
    longitude: long - unit,
  };

  return [tl, tr, bl, br];
}

export { get_bounding_box };
