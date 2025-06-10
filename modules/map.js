import { checkForSwissTopoInfo } from "./swissTopo.js";
import { calculateHikingTime } from "./hikingTimeCalculation.js";

var map = null;
export function initMap() {
  var L = window.L;

  map = L.map("map", {
    center: [37.9117680660216, -25.531951929442588],
    zoom: 10,
  });
  // map.on('moveend', function () {
  //   var zoom = map.getZoom();
  //   var center = map.getCenter();
  //   console.log(`Zoom: ${zoom}, Coordinates: ${center.lat}, ${center.lng}`);
  // });
  return map;
}

let defaultPolyLineOptions = {
  color: "red",
  opacity: 0.75,
  weight: 3,
  lineCap: "round",
};

let hoverPolyLineOptions = {
  color: "green",
  opacity: 1,
  weight: 6,
  lineCap: "round",
};

export function addToMap(route) {
  var localGpxFile = route.gpxFile.substring(route.gpxFile.lastIndexOf('/') + 1);
  new L.GPX("routes/" + localGpxFile, {
    async: true,
    marker_options: {
      startIconUrl: "images/pin-icon-start.png",
      endIconUrl: "images/pin-icon-end.png",
      shadowUrl: "images/pin-shadow.png",
      wptIconUrls: {
        "": null,
      },
    },
    polyline_options: defaultPolyLineOptions,
  })
    .on("loaded", function (e) {
      e.target.bindTooltip(getHtmlInfoElement(route, e.target._info));
    })
    .on("addline", function (l) {
      let totalHikingTime = calculateHikingTime(l.line.getLatLngs());
      var minutes = parseInt(
        (totalHikingTime - parseInt(totalHikingTime)) * 60
      );
      l.sourceTarget._info.estimatedHikingTimeInHours =
        parseInt(totalHikingTime) + "h " + minutes + "min";
    })
    .on("click", function (ev) {
      console.log("clicked", ev.layer);
      window.open(route.link, "_blank");
      if (lastHighlightedTrack == ev.layer) {
        lastHighlightedTrack = null;
        ev.layer.setStyle(defaultPolyLineOptions);
      } else if (ev.layer) {
        hideLastTrack();
        lastHighlightedTrack = ev.layer;
        ev.layer.setStyle(hoverPolyLineOptions);
        ev.layer.bringToFront();
      }
    })
    .on("mouseover", function (ev) {
      ev.layer.setStyle && ev.layer.setStyle(hoverPolyLineOptions);
      ev.layer.bringToFront && ev.layer.bringToFront();
    })
    .on("mouseout", function (ev) {
      if (ev.layer && ev.layer.setStyle && ev.layer != lastHighlightedTrack) {
        ev.layer.setStyle(defaultPolyLineOptions);
      }
    })
    .on("addpoint", enrichWithSwissTopoInfo)
    .on("skippoint", enrichWithSwissTopoInfo)
    .addTo(map);
}
let lastHighlightedTrack = null;
function hideLastTrack() {
  if (lastHighlightedTrack && lastHighlightedTrack.setStyle) {
    lastHighlightedTrack.setStyle(defaultPolyLineOptions);
  }
}

function enrichWithSwissTopoInfo(x) {
  var swissTopoInfo = checkForSwissTopoInfo(x);

  if (swissTopoInfo != null) {
    x.sourceTarget._info.swissTopoInfo = swissTopoInfo;
  }
}

function getHtmlInfoElement(route, tourInfo) {
  var template = `<div class="tourpopup">
    <h1>${route.title}</h1>
    <h2>Click to see trail details</h2>
    <div>Length: ${Math.round((tourInfo.swissTopoInfo?.length || tourInfo.length) / 10) / 100
    } km</div>
    <div>Estimate: ${tourInfo.swissTopoInfo?.estimatedHikingTimeInHours ||
    tourInfo.estimatedHikingTimeInHours
    }</div>

    </div>`;
  return template;
}
