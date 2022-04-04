const { resolveSoa } = require('dns')
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
  const { cid, assets } = req.body

  let cache = getCache('./cache.json')
  cache.cid = cid
  cache.assets = assets

  // Save config for use by the /save endpoint
  fs.writeFileSync('./cache.json', JSON.stringify(cache))

  console.log("CID & Assets saved")
  res.sendStatus(200)
})

module.exports = router
