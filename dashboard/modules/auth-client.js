const dotenv = require('dotenv');

// env
const env = dotenv.config()
if (env.error) console.error(env.error);


const OAuthClient = require('disco-oauth');
const authClient = new OAuthClient(process.env.ID, process.env.SECRET);

authClient.setRedirect(`${process.env.DASHBOARDURL}/auth`);
authClient.setScopes('identify', 'guilds')

module.exports = authClient;