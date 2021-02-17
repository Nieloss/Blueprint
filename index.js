    // Packages
    const Discord = require('discord.js');
    const fs = require('fs');
    const dotenv = require('dotenv');


    // Define the client
    const client = new Discord.Client();


    // env
    const env = dotenv.config()
    if (env.error) console.error(env.error);


    // Define the Command and Alias collections
    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();


    // Define the date object
    const date = new Date();
    const hhmmss = date.toLocaleTimeString();


    // Command handler
    fs.readdirSync('./commands/').forEach(dir => {
        // Go through all folders/modules
        fs.readdir(`./commands/${dir}`, (err, files) => {
            // Log the error if it occurs
            if (err) console.error(err);


            // Filter only JavaScript files
            const jsFiles = files.filter(f => f.split(".").pop() === "js");


            // Loop through all JavaScript files
            jsFiles.forEach(file => {
                // Define the command
                const command = require(`./commands/${dir}/${file}`);


                // Try executing the command file
                try {
                    client.commands.set(command.config.command, command);

                    command.config.aliases.forEach(alias => {
                        client.aliases.set(alias, command.config.command)
                    });
                }

                // Catch the error if the try doesn't succeed
                catch (err) {
                    // Log the error if it occurs
                    return console.error(err);
                }
            });
        });
    });


    // Event handler
    fs.readdirSync('./events/').forEach(dir => {
        // Go through all folders/modules
        fs.readdir(`./events/${dir}`, (err, files) => {
            // Log the error if it occurs
            if (err) console.error(err);


            // Filter only JavaScript files
            const jsFiles = files.filter(f => f.split(".").pop() === "js");


            // Loop through all JavaScript files
            jsFiles.forEach(file => {
                // Define the event file
                const event = require(`./events/${dir}/${file}`);

                try {
                    let eventName = file.split('.')[0];
                    client.on(eventName, event.bind(null, client));
                }

                // Catch the error if the try doesn't succeed
                catch (err) {
                    // Log the error if it occurs
                    return console.error(err);
                }
            });
        });
    });


    // Login and go online
    client.login(process.env.TOKEN).then(c => {
        // Send a message in the console when the client is logged in
        console.info(`[${hhmmss} | LOGIN] - ${client.user.username} has logged in.`);
    })

    // Catch the error if the client wasn't able to login, and log the error
    .catch ((err) => {
        // Send a message in the console
        console.info(`[${hhmmss} | ERROR] - ${client.user.username} was not able to login. Find out why:`)


        // Log the error if it occurs
        console.error(err);
    });


    // Export the client
    module.exports.client = client;


    // Require the express server
    require('./dashboard/server.js');