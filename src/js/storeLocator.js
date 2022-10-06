
import {VMap} from "./vmap";

const loadLocator = () => {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GMAPS_API_KEY}&callback=initLocator&libraries=geometry`;
  document.body.appendChild(script);
}

loadLocator();


export default initLocator = function(){

    const items = window.stores;

    const searchAddress = '';
    const imgPath = 'images';

    const legend = document.querySelector('.storelocator-panel__legend');
    let legend_items = '';
    let categories = [];

    const map = new VMap(document.getElementById('storelocator-map'));

    map.setImgPath(imgPath);
    map.setDirectionsPanel(document.getElementById('directions'));

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        map.addItem(item);

        if(categories.indexOf(item.cat) === -1){
            legend_items += `<div class="legend-item legend-item--${item.cat}"><span class="ball" style="background-color: ${item.color}"></span><span class="label">${item.cat}</span></div>`;
            categories.push(item.cat);
        } 
    }

    legend.innerHTML = legend_items;


    map.centerOnMarkers();

    map.showResults(items);

    const searchLocation = () => {
        var address = document.getElementById('find-closest-value').value;
        map.showDirections(address);
    };

    document.querySelector("#storelocator-searchform").addEventListener("submit", searchLocation);

    if (searchAddress && searchAddress !== '') {
        map.showDirections(searchAddress);
    }
    
    if(document.querySelector("#storelocator-searchform-checkpoint")){

        let container = document.querySelector(".storelocator-panel");

        let handler = function(entries) {

            if (entries[0].isIntersecting) {
                container.classList.remove('fixNav');
            } else {
                container.classList.add('fixNav');
            }
        };

        let observer = new IntersectionObserver(handler);
        observer.observe(document.querySelector("#storelocator-searchform-checkpoint"));
    }

};