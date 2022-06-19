const originalData = require("../../../data/original_data");
const { requestTimetable } = require("../v1/helpers");

exports.filterDirections = (directions, filter) => {
  let filteredDirections = directions;
  const validRouteFilters = ["previousRouteId", "currentRouteId"];
  for (const validFilter of validRouteFilters) {
    filteredDirections = filter[validFilter]
      ? filteredDirections.filter(r => r[validFilter]?.includes(filter[validFilter]))
      : filteredDirections;
  }

  filteredDirections = filter.limit ? filteredDirections.slice(0, filter.limit) : filteredDirections;
  return filteredDirections;
};

exports.getPreviousRoute = (currentRoute) => {
  const previousRoutes = Object.assign({}, ...Object.entries(originalData.routesConversion)
    .flatMap(([_, routes]) => routes));
  const previousRoute = Object.entries(previousRoutes).find(([previousRoute, newRoutes]) => newRoutes.map(route => route[0]).includes(currentRoute));
  return previousRoute ? previousRoute[0] : undefined;
};

exports.getRouteDirections = (id) => {
  const currentRouteId = id.includes("_") ? id.substring(0, 4) : id;
  const directions = originalData.routeSchedules[currentRouteId];
  const names = originalData.routeNames[currentRouteId];

  if (!directions) return [];

  return Object.entries(directions)
    .filter(direction => (direction[1].length > 0))
    .flatMap((direction) => direction[1].map((name, idx) => {
      const [start, end] = names[direction[0]].replace(/<[^>]+>/g, "").split("🠖").map(s => s.trim());
      return {
        id: name.replace(".json", ""),
        direction: direction[0],
        start,
        end
      };
    }
    ));
};

exports.getDirections = () => {
  let routesDirections = [];
  const currentRouteIds = Object.keys(originalData.routeSchedules);
  for (const currentRouteId of currentRouteIds) {
    const directions = this.getRouteDirections(currentRouteId);
    routesDirections = routesDirections.concat(directions.map(direction => ({
      directionId: direction.id,
      direction: direction.direction,
      currentRouteId,
      previousRouteId: this.getPreviousRoute(currentRouteId),
      start: direction.start.replace(" | Circular", ""),
      end: direction.end
    })));
  }

  return routesDirections;
};

const getDirectionStops = async (directionId) => {
  let stops = [];
  const timetable = await requestTimetable(directionId);
  for (const [stopName, times] of timetable) {
    const today = new Date().toLocaleDateString("sv").replaceAll("-", "");
    const departures = times.map(([time, availabilityId]) => ({
      time,
      availabilityId,
      availability: originalData.scheduleTypes[availabilityId],
      isAvailableToday: originalData.servicesByDate[today].includes(availabilityId.toString())
    })).filter(time => time.time.match(/([0-9]{2}):([0-9]{2})/));
    stops = stops.concat({
      name: stopName,
      departures
    });
  }
  return stops;
};

const getDirectionDurationInMinutes = (stops) => {
  const today = new Date().toLocaleDateString("sv");
  const firstTime = stops[0].departures
    .filter(departure => departure.isAvailableToday)
    .flatMap(departure => departure.times)
    .map(time => new Date(`${today} ${time}:00`))
    .find(time => time > new Date());
  const lastTime = stops[stops.length - 1].departures
    .filter(departure => departure.isAvailableToday)
    .flatMap(departure => departure.times)
    .map(time => new Date(`${today} ${time}:00`))
    .find(time => time > firstTime);
  return ((lastTime - firstTime) / 1000) / 60;
};

exports.getDirection = async (directionId) => {
  const directions = this.getRouteDirections(directionId);
  const currentRouteId = directionId.substring(0, 4);
  const direction = directions.find(direction => direction.id === directionId);
  const stops = await getDirectionStops(direction.id);
  const durationInMinutes = getDirectionDurationInMinutes(stops);
  return {
    directionId: direction.id,
    direction: direction.direction,
    currentRouteId,
    previousRouteId: this.getPreviousRoute(currentRouteId),
    start: direction.start.replace(" | Circular", ""),
    end: direction.end,
    durationInMinutes,
    stops
  };
};
