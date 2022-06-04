const originalData = require("../../data/original_data");
const axios = require("axios");

exports.CARRIS_BASE_URL = "https://www.carrismetropolitana.pt/images/horarios";

exports.getPreviousOperator = (previousRoute) => {
  const name = Object.entries(originalData.operators).map(([name, routes]) => ({
    name,
    routes: Object.keys(routes)
  })).find(operator => operator.routes.includes(previousRoute)).name;
  return name;
};

exports.filterRoutes = (routes, filter, limit = undefined) => {
  let filteredRoutes = routes;
  const validRouteFilters = ["county", "previousRoute", "previousOperator"];
  for (const validFilter of validRouteFilters) {
    filteredRoutes = filter[validFilter] ? filteredRoutes.filter(r => r[validFilter] === filter[validFilter]) : filteredRoutes;
  }

  filteredRoutes = limit ? filteredRoutes.slice(0, limit) : filteredRoutes;
  return filteredRoutes;
};

exports.getRoutes = () => {
  let routes = [];
  const { routesConversion } = originalData;
  const counties = Object.keys(routesConversion);

  for (const county of counties) {
    const countyRoutes = routesConversion[county];
    const previousRoutes = Object.keys(countyRoutes);

    for (const previousRoute of previousRoutes) {
      const newRoutes = countyRoutes[previousRoute];
      routes = routes.concat(newRoutes.map(route => ({
        id: route[0],
        name: route[1],
        previousRoute,
        previousOperator: this.getPreviousOperator(previousRoute),
        county
      })));
    }
  }

  return routes;
};

exports.getRoute = (routeId) => {
  const route = this.getRoutes().find(route => route.id === routeId);
  route.directions = this.getDirections(routeId);
  return route;
};

const requestTimetable = async (directionId) => {
  const response = await axios.get(`${this.CARRIS_BASE_URL}/${directionId}.json`, {
    credentials: "omit",
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0",
      Accept: "*/*",
      "Accept-Language": "pt-PT,pt;q=0.8,en;q=0.5,en-US;q=0.3",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin"
    },
    referrer: "https://www.carrismetropolitana.pt/",
    method: "GET",
    mode: "cors"
  });
  const { data } = await response;
  return data;
};

exports.getDepartures = async (directionId) => {
  const timetable = await requestTimetable(directionId);
  const departures = timetable.map(([stop, times]) => ({
    stop,
    timetable: times.map(([time, id]) => ({
      time,
      condition: {
        id,
        description: originalData.scheduleTypes[id]
      }
    }))
  }));
  return departures;
};

exports.getDirections = (routeId) => {
  const directions = originalData.routeSchedules[routeId];
  const names = originalData.routeNames[routeId];

  if (!directions) return [];

  return Object.entries(directions)
    .filter(direction => (direction[1].length > 0))
    .flatMap((direction) => direction[1].map((name, idx) =>
      ({
        id: name.replace(".json", ""),
        direction: direction[0],
        description: `${names[direction[0]].replace(/<[^>]+>/g, "").split("🠖").map(s => s.trim()).join(" - ")} ${direction[1].length > 1 ? `(${idx + 1})` : ""}`.trim()
      })
    ));
};
