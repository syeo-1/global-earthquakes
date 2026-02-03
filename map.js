var map = L.map('map').setView([2.207, 9.4403], 2.5); // close to libreville, which I think is pretty centred globally

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);