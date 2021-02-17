    // Packages
    const Discord = require('discord.js');
    const sqlite3 = require("sqlite3").verbose();


    // Database
    const db = new sqlite3.Database('blueprint.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) console.error(err);
    });


    // Define the default prefix
    const defaultPrefix = process.env.PREFIX;


    module.exports = async (client, message) => {
        // Return if the message was not sent in a text channel
        if (message.channel.type !== 'text') return;


        // Retrieve the database row related to the guild
        db.get(`SELECT * FROM guilds WHERE guild_id = ?`, message.guild.id, (err, guild) => {
            // If an error occurs, log the error in the console
            if (err) console.error(err);


            // Define the prefix
            let guildPrefix = '';
            if (guild !== undefined) {
                guildPrefix = guild.prefix;
            }
            const prefix = guildPrefix ? guildPrefix : defaultPrefix;


            // Return if the message was a command or the author was a bot
            if (!message.content.startsWith(prefix) || message.author.bot) return;


            // Define the arguments in the message
            const args = message.content.slice(prefix.length).split(/ +/);


            // Define the used command name
            const commandName = args.shift().toLowerCase();


            // Define the used command / alias
            const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));


            // Return if the command does not exist or cannot be found.
            if (!command) return;


            // Retrieve the cooldown data related to the used command by the user
            db.get(`SELECT * FROM cooldowns WHERE user_id = ? AND command = ?`, [message.author.id, command], (err, cooldown) => {
                // If an error occurs, log the error in the console
                if (err) console.error(err);


                // If there is no cooldown for the command, add a new cooldown for the command and run the command
                if (!cooldown) {
                    // Define the query to add the command to the cooldowns database, linked to the user id
                    const insertCooldownQuery = `
                        INSERT INTO cooldowns(user_id, command, last_used_timestamp)
                        VALUES(?, ?, ?)`;


                    // Define the cooldown time
                    let cooldownTime = command.config.cooldown * 1000;
                    cooldownTime += Date.now()


                    // Add a new cooldown for the used command to the database
                    const insertCooldown = db.prepare(insertCooldownQuery);
                    insertCooldown.run(message.author.id, commandName, cooldownTime);
                    insertCooldown.finalize();


                    // Run the command
                    try {
                        command.run(client, message, args);
                    } catch (err) {
                        // If an error occurs, log the error in the console
                        if (err) console.error(err);
                    }
                }

                // Compare the cooldown timestamp to the current epoch timestamp
                else {
                    // Execute the command and remove the cooldown if the cooldown timestamp is less or equal to the current epoch timestamp
                    if (cooldown.last_used_timestamp <= Date.now()) {
                        // Define the query to add the command to the cooldowns database, linked to the user id
                        const deleteCooldownQuery = `
                            DELETE FROM cooldowns
                            WHERE id = ?`;


                        // Delete the cooldown from the database
                        const deleteCooldown = db.prepare(deleteCooldownQuery);
                        deleteCooldown.run(cooldown.id);
                        deleteCooldown.finalize();


                        // Run the command
                        try {
                            command.run(client, message, args);
                        } catch (err) {
                            // If an error occurs, log the error in the console
                            if (err) console.error(err);
                        }
                    }

                    // Return if the cooldown timestamp is higher than the current epoch timestamp
                    else {
                        // Retrieve the guild's skin
                        db.get(`SELECT * FROM skins WHERE name = ?`, guild.skin, (err, skin) => {
                            // Log the error if it occurs
                            if (err) console.error(err);


                            // Define the on-cooldown message
                            let onCooldownEmbed = ``;

                            if (skin.cooldown_message_image) {
                                onCooldownEmbed = new Discord.MessageEmbed()
                                    .setColor(skin.hex_color)
                                    .setTitle(skin.cooldown_message_title)
                                    .setDescription(skin.cooldown_message_description)
                                    .setImage(skin.cooldowncooldown_message_image)
                                    .setFooter(skin.cooldown_message_footer);
                            } else {
                                onCooldownEmbed = new Discord.MessageEmbed()
                                    .setColor(skin.hex_color)
                                    .setTitle(skin.cooldown_message_title)
                                    .setDescription(skin.cooldown_message_description)
                                    .setImage(skin.cooldown_message_image)
                                    .setFooter(skin.cooldown_message_footer);
                            }

                            message.channel.send(onCooldownEmbed).then(m => {
                                m.delete( {timeout: 10000} );
                                message.delete( {timeout: 10000} );
                            });
                        });
                    }
                }
            });
        });
    }