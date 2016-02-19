function groupPhotos(photos, size) {
  var newArray = [];
  for (var i=0; i<photos.length; i+=size) {
    newArray.push(photos.slice(i, i+size));
  }
  return newArray;
}

function getTracks(fileSystem, appDirectory, language, tipo, audioguide) {
  var tracks = [];
  if(audioguide.length>0) {
    audioguide = fileSystem + appDirectory + language + "/" + tipo + "/" + audioguide;
    tracks.push({"url": audioguide});
  }
  return tracks;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km

  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function sortByDistance(a,b){
  var c = a.distance;
  var d = b.distance;
  return c-d;
}

function sortByPrice(a,b){
  var c = a.cost;
  var d = b.cost;
  return c-d;
}

function sortByRating(a,b){
  //var c = a.avgRating;
  //var d = b.avgRating;

  var c = a.relevance;
  var d = b.relevance;

  return d-c;
}

function loadJS(src, callback) {
  var s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onreadystatechange = s.onload = function() {
      var state = s.readyState;
      if (!callback.done && (!state || /loaded|complete/.test(state))) {
          callback.done = true;
          callback();
      }
  };
  document.getElementsByTagName('head')[0].appendChild(s);
}