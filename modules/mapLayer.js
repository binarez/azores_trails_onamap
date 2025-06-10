let _map = null;
let currentMapTileLayer = null;

function addLayer(layer, layerName) {
  localStorage.setItem("mapLayer", layerName);
  _map.eachLayer((x) => {
    if (x._leaflet_id == currentMapTileLayer) {
      _map.removeLayer(x);
    }
  });
  _map.addLayer(layer);
  currentMapTileLayer = layer._leaflet_id;
}

export function initMapLayer(map) {
  _map = map;
  let osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data &copy; 2022 OpenStreetMap contributors",
  });
  addLayer(osm, "openstreetmap");
}
