import { parse } from 'https://cdn.jsdelivr.net/npm/csv-parse@5/dist/esm/sync.js';

function normalizeToRedScale(value) {
    return (value - 1) / (10 - 1); // returns 0 for 1, 1 for 10
}

function getRedColor(value) {
    let t = normalizeToRedScale(value); // 0 → 1
    // lightness decreases as value increases (closer to 10 → darker red)
    let lightness = 80 - t * 60; // 80% → 20%
    return `hsl(0, 100%, ${lightness}%)`;
}

function updateMapDate() {
    // uses the values in the forms to update the data shown on the map
}

function readableDate(epochMilliseconds) {
    const date = new Date(epochMilliseconds)
    const readableDateString = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    return readableDateString
}

var map = L.map('map', {
    maxBounds: [[-90, -210], [90, 210]],
    maxBoundsViscosity: 1.0,
    minZoom: 2,
    maxZoom: 18,
    zoomControl: false
}).setView([2.207, 9.4403], 2.5); // close to libreville, which I think is pretty centred globally

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

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      delimiter: '|'
    });

    records.forEach(row => {
    //   console.log(row);
    //   console.log(row.magnitude)
    //   var circle = L.circle([51.508, -0.11], {
      let magnitude_value = parseFloat(row.magnitude)
      L.circle([parseFloat(row.lattitude), parseFloat(row.longitude)], {
          color: 'red',
          fillColor: getRedColor(magnitude_value),
          fillOpacity: 1,
          radius: 8 ** parseFloat(magnitude_value)
      }).bindPopup(`magnitude: ${row.magnitude}<br>
                    date: ${readableDate(parseInt(row.time))}<br>
                    place: ${row.place}`)
      .addTo(map);
    });
});

// adding markers
// var circle = L.circle([51.508, -0.11], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500
// }).addTo(map);