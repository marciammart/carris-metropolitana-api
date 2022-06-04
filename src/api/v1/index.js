const express = require("express");
const { getRoutes, getDirections, getDepartures, filterRoutes, getRoute } = require("./helpers.js");

const router = express.Router();

router.get("/routes", (req, res) => {
  const { limit, county, previousRoute, previousOperator } = req.query;
  const filter = { county, previousRoute, previousOperator };
  const routes = getRoutes();
  const filteredRoutes = filterRoutes(routes, filter, limit);
  res.json(filteredRoutes);
});

router.get("/routes/:routeId", (req, res) => {
  const { routeId } = req.params;
  const route = getRoute(routeId);
  res.json(route);
});

router.get("/routes/:routeId/directions", (req, res) => {
  const { routeId } = req.params;
  const directions = getDirections(routeId);
  res.json(directions);
});

router.get("/routes/:routeId/directions/:directionId", async (req, res) => {
  const { routeId, directionId } = req.params;
  const direction = getDirections(routeId).find(direction => direction.id === directionId);
  direction.departures = await getDepartures(directionId);
  res.json(direction);
});

module.exports = router;
