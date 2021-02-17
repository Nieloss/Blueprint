const dotenv = require('dotenv');

// env
const env = dotenv.config()
if (env.error) console.error(env.error);

const authClient = require('../auth-client');


const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${process.env.ID}&redirect_uri=${process.env.DASHBOARDURL}/auth&response_type=code&scope=identify%20guilds&prompt=none`));

router.get('/auth', async (req, res) => {
    try {
        const code = req.query.code;
        const key = await authClient.getAccess(code);

        res.cookies.set('key', key)
        res.redirect('/dashboard');
    } catch {
        res.redirect('/');
    }
});

module.exports = router;