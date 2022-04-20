const { resolveSoa } = require('dns')
const cliCache = require('../../cli/testnet-cache.json')
var express = require('express')
const fs = require('fs')

const getCache = (path) => {
  return JSON.parse(
    fs.existsSync(path) ? fs.readFileSync(path).toString() : '{}'
  )
}

var router = express.Router()
router.post('/', function (req, res, next) {
  console.log("Saving CID")

  let cache = getCache('./cache.json')
  cache.assets = cliCache.items

  // Save config for use by the /save endpoint
  fs.writeFileSync('./cache.json', JSON.stringify(cache))

  console.log("CID & Assets saved")
  res.sendStatus(200)
})

module.exports = router
