var express = require("express");
const fs = require('fs');

const getConfig = (path) => {
  const config = fs.existsSync(path) 
    ? fs.readFileSync(path).toString()
    : '{}';
  return JSON.parse(config);
}

var router = express.Router();
router.post("/", function(req, res, next) {
  const { contract_addr, chain_id } = req.body;
  let config = getConfig('./config.json');
  config.contract_addr = contract_addr;
  config.chain_id = chain_id;
  fs.writeFileSync('./config.json', JSON.stringify(config));
  fs.writeFileSync('./../../lib/config.json', JSON.stringify(config)); // CHECK THIS IS THE CORRECT PATH
  console.log("complete");
  res.status(200)
});

module.exports = router;

/**
 * TODO
 *  - Save assets to cache before going to config page
 *    - saveCid => load cache, if exists ? update field : create new file and save with all options besides cid as empty
 *    - saveConfig => load cache, if exists ? update fields for each config : save config then throw error
 */