    // Packages
    const express = require('express');
    const dotenv = require('dotenv');
    const cookies = require('cookies');


    // Require the commands collection
    const { client } = require("../index.js");


    // Require middleware
    const middleware = require('./middleware');


    // Require routes
    const authRoutes = require('../dashboard/routes/auth-routes');
    const rootRoutes = require('../dashboard/routes/root-routes');
    const dashboardRoutes = require('../dashboard/routes/dashboard-routes');


    // env
    const env = dotenv.config()
    if (env.error) console.error(env.error);


    // Define the date object
    const date = new Date();
    const hhmmss = date.toLocaleTimeString();


    // Define the app
    const app = express();


    // Set the views directory
    app.set('views', `${__dirname}/views`);


    // Set the view engine
    app.set('view engine', 'pug');


    // Cookies
    app.use(cookies.express('a', 'b', 'c'));


    app.use(express.static(`${__dirname}/assets`));
    app.locals.basedir = `${__dirname}/assets`;


    app.use('/',
        middleware.updateUser, rootRoutes,
        authRoutes,
        middleware.validateUser, middleware.updateGuilds, dashboardRoutes
        );    


    app.get('*', (req, res) => res.render('errors/404.pug', {
        subtitle: "404"
    }));


    // Define the port
    const port = process.env.PORT;


    app.listen(port, () => console.info(`[${hhmmss} | SERVER] - Server is live on port ${port}`));