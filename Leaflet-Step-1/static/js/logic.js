// function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 3;
}

// // function to return the color based on depth
// function markerColor(depth) {
//     if (depth > 90) {
//         return 'red'
//     } else if (depth > 50) {
//         return 'orange'
//     } else if (depth > 10) {
//         return 'yellow'
//     } else {
//         return 'green'
//     }
// }

function getColor(d) {
    return d > 90 ? '#f03b20' :
            d > 70  ? '#fd8d3c' :
            d > 50  ? '#feb24c' :
            d > 30  ? '#e6e600' :
            d > 10   ? '#ccff33' :
                        '#78c679';
}

function createMap(earthquakeLocation) {

    // Create the tile layer that will be the background of our map
    var lightmap =   L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    //   id: "outdoors-v11",
    // Create a baseMaps object to hold the outdoor map layer
    var baseMaps = {
        "Outdoor Map": lightmap
    };
  
    // Create an overlayMaps object to hold the earthquakeLocation layer
    var overlayMaps = {
        "Earthquakes": earthquakeLocation
    };

    // Create the map object with options
    var myMap = L.map("map", {
        center: [38, -110],
        zoom: 4,
        layers: [lightmap, earthquakeLocation]
    });

    var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (myMap) {
    
        var div = L.DomUtil.create('div', 'info legend'),
        depth = ["-10 to 10", "10-10", "30-50", "50-70", "70-90", "90+"]
        color = ['#78c679','#ccff33','#e6e600','#feb24c','#fd8d3c','#f03b20'];
    
        labels = [];
        for ( var i=0; i < depth.length; i++) {
            labels.push( 
                '<i class="square" style="background:' + color[i] + '"></i>'+ depth[i] + '')
        }
        div.innerHTML = '<h3>Earthquake Depth</h3>' + labels.join('<br>');
            return div;
            };  
        

    // Adding legend to the map
    legend.addTo(myMap);

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

function createMarkers(response) {

    // Pull the "stations" property off of response.data
    var features = response.features;
    console.log(features)

    // Initialize an array to hold bike markers
    var quakeMarkers = [];
    

    // Loop through the stations array
    for (var index = 0; index < features.length; index++) {
        var feature = features[index];

        var options = {
            stroke: true,
            fillOpacity: .99,
            color: '#000000',
            weight: 0.5,
            fillColor: getColor(feature.geometry.coordinates[2]),
            radius: markerSize(feature.properties.mag)
        }

        // For each station, create a marker and bind a popup with the station's name
        var quakeMarker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], options)
            .bindPopup(`<h3> ${feature.properties.place} </h3> 
                <hr> <h4>Magnitude: ${feature.properties.mag} </h3> 
                <h4>Depth: ${feature.geometry.coordinates[2]} </h4> 
                <hr><p> ${Date(feature.properties.time)} </p>`)    
        // .bindPopup("<h3>" + feature.properties.place + "<h3><h3>magnitiude: " + feature.properties.mag + "</h3>");

        // Add the marker to the bikeMarkers array
        quakeMarkers.push(quakeMarker);
    }

    // Create a layer group made from the array, pass it into the createMap function
    createMap(L.layerGroup(quakeMarkers));

}

  // Perform an API call to the USGS Earthquake API to get information. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", createMarkers);
