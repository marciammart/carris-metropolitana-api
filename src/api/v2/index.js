const express = require("express");
const { getDirections, filterDirections, getDirection } = require("./helpers.js");

const router = express.Router();

router.get("/directions", (req, res) => {
  const { limit, previousRouteId, currentRouteId } = req.query;
  const filter = { previousRouteId, currentRouteId, limit };
  const routes = getDirections();
  const filteredRoutes = filterDirections(routes, filter);
  res.json(filteredRoutes);
});

router.get("/directions/:directionId", async (req, res) => {
  const { directionId } = req.params;
  const direction = await getDirection(directionId);
  res.json(direction);
});

module.exports = router;
