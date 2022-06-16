const express = require("express");
const { getRoutes, filterRoutes } = require("./helpers.js");

const router = express.Router();

router.get("/routes", (req, res) => {
  const { limit, previousRouteId, currentRouteId } = req.query;
  const filter = { previousRouteId, currentRouteId, limit };
  const routes = getRoutes();
  const filteredRoutes = filterRoutes(routes, filter);
  res.json(filteredRoutes);
});

module.exports = router;
