
const cat1 = 'cat 1';
const cat2 = 'cat 2';
const cat3 = 'cat 3';

const categories = {
  "cat 1": {
    color: "blue",
    icon: new URL('../images/marker-blue@2x.png', import.meta.url)
  },
  "cat 2": {
    color: "azure",
    icon: new URL('../images/marker-azure@2x.png', import.meta.url)
  },
  "cat 3": {
    color: "green",
    icon: new URL('../images/marker-green@2x.png', import.meta.url)
  }
};

var google = null;
var idHoverGmap = false;

const mapStyle = {
  'light' : [{"elementType": "geometry","stylers": [{  "color": "#f5f5f5"}]},{"elementType": "labels.icon","stylers": [{  "visibility": "off"}]},{"elementType": "labels.text.fill","stylers": [{  "color": "#616161"}]},{"elementType": "labels.text.stroke","stylers": [{  "color": "#f5f5f5"}]},{"featureType": "administrative.land_parcel","elementType": "labels.text.fill","stylers": [{  "color": "#bdbdbd"}]},{"featureType": "poi","elementType": "geometry","stylers": [{  "color": "#eeeeee"}]},{"featureType": "poi","elementType": "labels.text.fill","stylers": [{  "color": "#757575"}]},{"featureType": "poi.park","elementType": "geometry","stylers": [{  "color": "#e5e5e5"}]},{"featureType": "poi.park","elementType": "labels.text.fill","stylers": [{  "color": "#9e9e9e"}]},{"featureType": "road","elementType": "geometry","stylers": [{  "color": "#ffffff"}]},{"featureType": "road.arterial","elementType": "labels.text.fill","stylers": [{  "color": "#757575"}]},{"featureType": "road.highway","elementType": "geometry","stylers": [{  "color": "#dadada"}]},{"featureType": "road.highway","elementType": "labels.text.fill","stylers": [{  "color": "#616161"}]},{"featureType": "road.local","elementType": "labels.text.fill","stylers": [{  "color": "#9e9e9e"}]},{"featureType": "transit.line","elementType": "geometry","stylers": [{  "color": "#e5e5e5"}]},{"featureType": "transit.station","elementType": "geometry","stylers": [{  "color": "#eeeeee"}]},{"featureType": "water","elementType": "geometry","stylers": [{"color": "#c9c9c9"}]},{"featureType": "water","elementType": "labels.text.fill","stylers": [{"color": "#9e9e9e"}]}]
}

const VMap = function(element) {

  google = window.google;
  
  this.element = element;
  this.map = new google.maps.Map(this.element, {
    zoom: 10,
    center: { lat: 45.54916, lng: 10.2217 },
    styles: mapStyle.light,
  });
  this.geocoder = new google.maps.Geocoder();
  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay = new google.maps.DirectionsRenderer({
    map: this.map,
    markerOptions: {
      visible: false,
    },
  });
  this.activeWindow = null;
  this.directionMarker = null;
  this.locations = [];
  this.markers = [];


  document.querySelector('#storelocator-map').addEventListener('mouseenter', function(){
    idHoverGmap = true;
  })

  document.querySelector('.storelocator-panel__search').addEventListener('mouseenter', function(){
    idHoverGmap = false;
  })
};

VMap.prototype.setImgPath = function(path) {
  this.imgPath = path;
};

VMap.prototype.setDirectionsPanel = function(element) {
  this.directionsDisplay.setPanel(element);
};

VMap.prototype.addItem = function(location) {
  var ref = this;
  this.locations.push(location);
  var infowindow = new google.maps.InfoWindow({
    content: this.getContent(location),
  });
  var marker = new google.maps.Marker({
    position: {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng),
    },
    icon: categories[location.cat]?.icon.href,
    map: this.map,
    title: location.post_title,
  });

  marker.itemID = location.ID;
  marker.addListener('click', function() {

    if (ref.activeWindow) ref.activeWindow.close();
    infowindow.open(ref.map, marker);
    ref.activeWindow = infowindow;

    if(document.querySelector(`.storelocator__card.active`)){
      document.querySelector(`.storelocator__card.active`).classList.remove('active');
    }
    document.querySelector(`.storelocator__card[data-id="${location.ID}"`)?.classList.add('active');
    ref.goToCard(location.ID);
  });
  this.markers.push(marker);
};

VMap.prototype.centerOnMarkers = function() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < this.markers.length; i++) {
    bounds.extend(this.markers[i].getPosition());
  }
  this.map.fitBounds(bounds);
};

VMap.prototype.centerOn = function(location) {
  this.map.setCenter({
    lat: parseFloat(location.lat),
    lng: parseFloat(location.lng),
  });
};

VMap.prototype.goToCard = function(ID) {

  if(idHoverGmap === true){

    let yOffset = -100; 
    let element = document.querySelector(`.storelocator__card[data-id="${ID}"`).offsetTop;
    let y = element + yOffset;

    document.querySelector(".storelocator-panel__search").scrollTo({top: y, behavior: 'smooth'});
  }
};

VMap.prototype.getContent = function(location) {
  return `<strong>${location.title}</strong>
    <div>${location.content}</div>`;
};

VMap.prototype.showDirections = function(address) {

  var ref = this;
  this.geocoder.geocode({ 'address': address }, function(results, status) {

    if (status === 'OK') {
      var origin = results[0].geometry.location;
      /*
      if (ref.directionMarker) ref.directionMarker.setMap(null);
      ref.directionMarker = new google.maps.Marker({
        map: ref.map,
        position: origin,
;
      */
      //var destination = ref.getClosestLocations(origin);
      //if (destination) ref.displayDirections(origin, destination);
      var items = ref.getClosestLocations(origin);

      if (items) ref.showResults(items);
      ref.map.setCenter(origin);
      ref.map.setZoom(12);
    }
  });
};

VMap.prototype.showResults = function(items){

  var ref = this;

  const resultscontainer = document.getElementById('storelocator-results');

  resultscontainer.innerHTML = "";
  resultscontainer.scrollTop = 0;

  items.forEach(item => {

    let categorySlug = item.cat.replace(" ", "-").toLowerCase();

    let card = document.createElement("div");
    card.className = 'storelocator__card card-id--'+item.ID;
    card.dataset.id = item.ID;

    card.innerHTML = `<div class="card-section">
                      <h5 class="h6 card__title"><div class="legend-item legend-item--${categorySlug}"></div> ${item.title}</h5>
                      <p>${item.content}</p>
                      <p>
                        <a href="https://www.google.com/maps/dir/${item.lat},${item.lng}/" target="_blank">Get directions</a> 
                      </p>
                    </div>`;

    resultscontainer.appendChild(card);

    card.addEventListener('mouseover', function(){

      var location = new google.maps.LatLng(item.lat, item.lng);

      let relMarker = ref.markers.find((marker) => marker.itemID === item.ID );

      google.maps.event.trigger(relMarker, 'click');

      ref.markers.map((marker) => marker.setZIndex(10) );
      relMarker.setZIndex(20);

      ref.map.panTo(location);
    });

    card.addEventListener('click', function(){
      ref.map.setZoom(12);
    });
  });

};

VMap.prototype.getClosestLocation = function(position) {

  var list = [];
  for (var i = 0; i < this.locations.length; i++) {
    var location = this.locations[i];
    var locLatLng = new google.maps.LatLng({ lat: parseFloat(location.lat), lng: parseFloat(location.lng) });
    var d = google.maps.geometry.spherical.computeDistanceBetween(locLatLng, position);
    list.push({
      d: d,
      locLatLng: locLatLng,
      location: location,
    });
  }
  list.sort(function(a, b) { return a.d - b.d; });
  if (list.length) return list[0].locLatLng;
  return null;
};

VMap.prototype.getClosestLocations = function(position) {

  var items = [];
  for (var i = 0; i < this.locations.length; i++) {
    var location = this.locations[i];
    var locLatLng = new google.maps.LatLng({ lat: parseFloat(location.lat), lng: parseFloat(location.lng) });
    var d = google.maps.geometry.spherical.computeDistanceBetween(locLatLng, position);
    items.push({
      d: d,
      locLatLng: locLatLng,
      location: location,
    });
  }
  items = items.sort(function(a, b) { return a.d - b.d; }).map((i) => i.location);

  console.log(items);

  if (items.length) return items;
  return null;
};

VMap.prototype.displayDirections = function(origin, destination) {
  var request = {
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING',
  };
  var ref = this;
  this.directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      ref.directionsDisplay.setDirections(result);
    }
  });
};

export {VMap};
