export function checkForNewSampleRoute(fnAddToMap) {
  if (localStorage.getItem("sampleRoutesLoaded")) {
    loadSampleRoutes(fnAddToMap);
  }
}

export function loadSampleRoutes(fnAddToMap) {
  setTimeout(() => {
    let loadOptions = localStorage.getItem("load_options");
    if (loadOptions == null) {
      localStorage.setItem("load_options", "all");
      loadOptions = "all";
    }

    let version = localStorage.getItem("tracks-version") || "0";

    let jsonUrl = "routes.json?v=" + version;

    if (loadOptions != "all") {
      jsonUrl = "routes_sample.json?v=" + version;
    }
    var centerMap = false;
    try {
      fetch(jsonUrl)
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          centerMap = true;
          result.forEach((route) => {
            console.log("add route to map" + route.Name);
            fnAddToMap(route, centerMap);
            centerMap = false;
          });
        });
    } catch (e) {
      console.log(e);
    }
  }, 0);
}
