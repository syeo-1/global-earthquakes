import { parse } from 'https://cdn.jsdelivr.net/npm/csv-parse@5/dist/esm/sync.js';
// import * as L from 'leaflet';
// import 'leaflet.markercluster';

let records;
let markers = []

function normalizeToRedScale(value) {
    return (value - 1) / (10 - 1); // returns 0 for 1, 1 for 10
}

function getRedColor(value) {
    let t = normalizeToRedScale(value); // 0 → 1
    // lightness decreases as value increases (closer to 10 → darker red)
    let lightness = 80 - t * 60; // 80% → 20%
    return `hsl(0, 100%, ${lightness}%)`;
}

function getFormValues() {
  const dateStartValue = document.getElementById("date-start").value;
  const dateEndValue = document.getElementById("date-end").value;
  const minMagValue = document.getElementById("min-mag").value;
  const maxMagValue = document.getElementById("max-mag").value;

  return {
    "dateStart": dateStartValue,
    "dateEnd": dateEndValue,
    "minMag": minMagValue,
    "maxMag": maxMagValue
  }
}

function convertYYYYMMDDToEpochMilliseconds(dateString) {
  const [year, month, day] = dateString.split("-").map(Number)
  const epochMillisecondsDate = Date.UTC(year, month-1, day)

  return epochMillisecondsDate
}

function updateMapDate() {
    // uses the values in the forms to update the data shown on the map
}


function resetToDefault() {
    // reset the map data to the default setting of showing all data
    // across all magnitudes and times of the last 30 days
}

function withinConstraints(formValues, marker, startEpochMilliseconds, endEpochMilliseconds) {
    return parseFloat(formValues.minMag) <= parseFloat(marker.options.magnitude) &&
        parseFloat(formValues.maxMag) >= parseFloat(marker.options.magnitude) &&
        startEpochMilliseconds <= parseInt(marker.options.time) &&
        endEpochMilliseconds >= parseInt(marker.options.time);
}

function filterMapData() {
    // filters the map data based on input forms
    // uses dates and the magnitude values

    const formValues = getFormValues()
    const startEpochMilliseconds = convertYYYYMMDDToEpochMilliseconds(formValues.dateStart)
    const endEpochMilliseconds = convertYYYYMMDDToEpochMilliseconds(formValues.dateEnd)

    // const filteredData = records.filter((data) => {
    //     return withinConstraints(formValues, data, startEpochMilliseconds, endEpochMilliseconds)
    // })

    // console.log(filteredData)

    // clear the map
    markerLayer.clearLayers()

    markers.forEach(marker => {
        if (withinConstraints(formValues, marker, startEpochMilliseconds, endEpochMilliseconds)) {
            markerLayer.addLayer(marker)
        }
        console.log(marker.options.magnitude)
        console.log(marker.options.time)
    })



    // repopulate the map with the filteredData

}

function resetMapData() {
    markerLayer.clearLayers()
    markers.forEach(marker => {
        markerLayer.addLayer(marker)
    })
}

function readableDate(epochMilliseconds) {
    const date = new Date(epochMilliseconds)
    const readableDateString = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
    })
    return readableDateString
}

var map = L.map('map', {
    maxBounds: [[-90, -210], [90, 210]],
    maxBoundsViscosity: 1.0,
    minZoom: 2,
    maxZoom: 18,
    // zoomControl: false
}).setView([2.207, 9.4403], 2.5); // close to libreville, which I think is pretty centred globally

let markerLayer = L.layerGroup().addTo(map)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// fetch('data.csv')
fetch('leaflet_data.txt')
  .then(res => res.arrayBuffer())
  .then(buffer => {
    const decoder = new TextDecoder('utf-16le');
    const text = decoder.decode(buffer);

    // console.log(text);

    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      delimiter: '|'
    });

    records.forEach(row => {
    //   console.log(row);
    //   console.log(row.magnitude)
    //   var circle = L.circle([51.508, -0.11], {
      let magnitude_value = parseFloat(row.magnitude)

      let newCircleMarker = L.circle([parseFloat(row.lattitude), parseFloat(row.longitude)], {
          color: 'red',
          fillColor: getRedColor(magnitude_value),
          fillOpacity: 1,
          radius: 8 ** parseFloat(magnitude_value),
          magnitude: magnitude_value,
          time: row.time,
      })
      
      newCircleMarker.bindPopup(`magnitude: ${row.magnitude}<br>
                    time: ${readableDate(parseInt(row.time))}<br>
                    place: ${row.place}`)
      markers.push(newCircleMarker)
      markerLayer.addLayer(newCircleMarker)

    //   markers.addLayer(marker)
    //   newCirclemarker.addTo(map)
    //   .addTo(map);
    });
});

// adding markers
// var circle = L.circle([51.508, -0.11], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500
// }).addTo(map);
// window.addEventListener("load", filterMapData);
// map.addLayer(markers)
document.getElementById("update-map").onclick = filterMapData
document.getElementById("reset-map").onclick = resetMapData