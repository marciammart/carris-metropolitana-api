const express = require('express')
const { getRoutes, getDirections, getDepartures } = require('./helpers.js')

const router = express.Router()

router.get('/routes', (req, res) => {
  const limit = req.query.limit
  const filter = {
    county: req.query.county
  }
  const routes = getRoutes(limit, filter)
  res.json(routes)
})

router.get('/directions', (req, res) => {
  const routeId = req.query.route_id
  const routes = getDirections(routeId)
  res.json(routes)
})

router.get('/departures', async (req, res) => {
  const directionId = req.query.direction_id
  const times = await getDepartures(directionId)
  res.json(times)
})

module.exports = router
