const express = require('express');
const router = express.Router();

const { client } = require("../../index.js");


router.get('/dashboard', (req, res) => res.render(`dashboard/index.pug`, {
  subtitle: 'Dashboard'
}));

router.get('/servers/:id', (req, res) => res.render('dashboard/show', {
  guild: client.guilds.cache.get(req.params.id)
}));



module.exports = router;