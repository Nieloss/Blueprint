// Require the commands collection
const { client } = require("../../index.js");


const express = require('express');
const router = express.Router();


router.get('/', (req, res) => res.render(`index.pug`));
router.get('/commands', (req, res) => res.render(`commands.pug`, {
    subtitle: 'Commands',
    categories: [
        {name: 'Configuration', icon: 'fas fa-sliders-h'},
        {name: 'Levels', icon: 'fas fa-list-ol'}
    ],
    commands: Array.from(client.commands.values()),
    commandsString: JSON.stringify(Array.from(client.commands.values()))
}));


module.exports = router;