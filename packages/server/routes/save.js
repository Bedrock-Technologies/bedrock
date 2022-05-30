var express = require('express')
const fs = require('fs')

const getCache = (path) => {
  return JSON.parse(
    fs.existsSync(path) ? fs.readFileSync(path).toString() : '{}'
  )
}

var router = express.Router()
router.post('/', function (req, res, next) {
  const { contract_addr, chain_id, config } = req.body

  let cache = getCache('./cache.json')
  cache.contract_addr = contract_addr
  cache.chain_id = chain_id
  cache.config = config
  cache.image_cache = true // TODO: allow for images cache to be set through the query params

  // Write config to two paths
  fs.writeFileSync('./cache.json', JSON.stringify(cache)) // used by setup when someone wants to update their config
  fs.writeFileSync('./../../lib/cache.json', JSON.stringify(cache)) // "live" config that is used by the Storefront

  res.status(200)
})

module.exports = router
