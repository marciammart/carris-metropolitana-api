const originalData = require('../../data/original_data')
const axios = require('axios')

const BASE_URL = 'https://www.carrismetropolitana.pt/images/horarios/'

exports.getRoutes = (limit, filter) => {
  let routes = []
  const { routesConversion } = originalData
  const counties = Object.keys(routesConversion)

  for (const county of counties) {
    const countyRoutes = routesConversion[county]
    const oldRoutes = Object.keys(countyRoutes)

    for (const oldRoute of oldRoutes) {
      const newRoutes = countyRoutes[oldRoute]
      routes = routes.concat(newRoutes.map(route => ({
        id: route[0],
        name: route[1],
        old_route: oldRoute,
        county
        // TODO: add old_operator
      })))
    }
  }

  // TODO: add filter function
  routes = filter.county ? routes.filter(r => r.county === filter.county) : routes
  routes = limit ? routes.slice(0, limit) : routes
  return routes
}

exports.getDepartures = async (directionId) => {
  const response = await axios.get(`${BASE_URL}/${directionId}.json`, {
    credentials: 'omit',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0',
      Accept: '*/*',
      'Accept-Language': 'pt-PT,pt;q=0.8,en;q=0.5,en-US;q=0.3',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    },
    referrer: 'https://www.carrismetropolitana.pt/',
    method: 'GET',
    mode: 'cors'
  }) // TODO: extract request
  const { data } = await response
  const times = data.map(([stop, times]) => ({
    stop,
    timetable: times.map(([time, id]) => ({
      time,
      condition: {
        id,
        description: originalData.scheduleTypes[id]
      }
    }))
  }))
  return times
}

exports.getDirections = (routeId) => {
  const directions = originalData.routeSchedules[routeId]
  const names = originalData.routeNames[routeId]

  if (!directions) return []

  return Object.entries(directions)
    .filter(direction => (direction[1].length > 0))
    .flatMap((direction) => direction[1].map((d, idx) =>
      ({
        id: d.replace('.json', ''),
        direction: direction[0],
        description: `${names[direction[0]].replace(/<[^>]+>/g, '').split('🠖').map(s => s.trim()).join(' - ')} ${direction[1].length > 1 ? `(${idx + 1})` : ''}`.trim()
      })
    ))
}
