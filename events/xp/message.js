// Packages
const Discord = require('discord.js');
const sqlite3 = require("sqlite3").verbose();


// Database
const db = new sqlite3.Database('blueprint.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) console.error(err);
});


// Generate a random number between min and max
function randomXp() {
  const min = 15;
  const max = 25;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Define the default prefix
const defaultPrefix = process.env.TOKEN;

module.exports = async (client, message) => {
  // Return if the channel is not a text channel
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
    if (message.content.startsWith(prefix) || message.author.bot) return;


    // Retrieve the user from the related guild
    db.get(`SELECT * FROM xp WHERE guild_id = ? AND user_id = ?`, [message.guild.id, message.author.id], (err, user) => {
      // If the row not exist, create one and add the values to the user
      if (!user) {
        // Define the query to create a new row and add the values to the user
        const createUserQuery = `
                       INSERT INTO xp(guild_id, user_id, timestamp_xp, current_xp, required_xp, current_level) 
                       VALUES(?, ?, ?, ?, ?, ?)`;


        // Insert the query into the database
        const createUser = db.prepare(createUserQuery);
        createUser.run(message.guild.id, message.author.id, Date.now(), randomXp(), 100, 0);
        createUser.finalize();
      }

      // Add new values to the user if they exist in the database
      else {
        // Define the timestamp when the user received their XP most recently
        const timestampXp = user.timestamp_xp;


        // If the timestamp is less than the current epoch timestamp, add the user's new values
        if (timestampXp <= Date.now()) {
          // Define the user's new XP value
          const newCurrentXp = user.current_xp += randomXp();


          // If the user's new XP value is higher than their required XP, level them up
          if (newCurrentXp >= user.required_xp) {
            // Define the user's new level and required XP
            const newLevel = user.current_level + 1;
            const newRequiredXp = newLevel * 300;


            // Define the query to update the user in the database
            const updateUserXpQuery = `
                                UPDATE xp
                                SET timestamp_xp = ?,
                                    current_xp = ?,
                                    required_xp = ?,
                                    current_level = ?
                                WHERE guild_id = ? AND user_id = ?`;


            // Insert the query into the database
            const updateUserXp = db.prepare(updateUserXpQuery);
            updateUserXp.run(Date.now(), user.required_xp, newRequiredXp, newLevel, message.guild.id, message.author.id);
            updateUserXp.finalize();


            // Return if the level-up channel is not assigned
            if (!guild.level_up_channel) return;


            // Send a level-up message in the same channel as where the message was sent
            if (guild.level_up_channel === `SAME CHANNEL`) {
              db.get(`SELECT * FROM skins WHERE name = ?`, guild.skin, (err, skin) => {
                // Log the error if it occurs
                if (err) console.error(err);


                // Define the level-up message
                let levelUpEmbed = ``;

                if (skin.level_up_message_image) {
                  levelUpEmbed = new Discord.MessageEmbed()
                    .setColor(skin.hex_color)
                    .setTitle(skin.level_up_message_title)
                    .setDescription(skin.level_up_message_description)
                    .setImage(skin.level_up_message_image)
                    .setFooter(skin.level_up_message_footer);
                } else {
                  levelUpEmbed = new Discord.MessageEmbed()
                    .setColor(skin.hex_color)
                    .setTitle(skin.level_up_message_title)
                    .setDescription(skin.level_up_message_description)
                    .setImage(skin.level_up_message_image)
                    .setFooter(skin.level_up_message_footer);
                }


                // Send a level-up message in the same channel as where the message was sent
                message.channel.send(levelUpEmbed);
              });
            }

            // Send a level-up message in the assigned channel
            else {
              // Retrieve the guild's skin
              db.get(`SELECT * FROM skins WHERE name = ?`, guild.skin, (err, skin) => {
                // Log the error if it occurs
                if (err) console.error(err);


                // Define the level-up message
                let levelUpEmbed = ``;

                if (skin.level_up_message_image) {
                  levelUpEmbed = new Discord.MessageEmbed()
                    .setColor(skin.hex_color)
                    .setTitle(skin.level_up_message_title)
                    .setDescription(skin.level_up_message_description)
                    .setImage(skin.level_up_message_image)
                    .setFooter(skin.level_up_message_footer);
                } else {
                  levelUpEmbed = new Discord.MessageEmbed()
                    .setColor(skin.hex_color)
                    .setTitle(skin.level_up_message_title)
                    .setDescription(skin.level_up_message_description)
                    .setImage(skin.level_up_message_image)
                    .setFooter(skin.level_up_message_footer);
                }


                // Define the level-up channel
                const levelUpChannel = message.guild.channels.cache.find(c => c.id === `${guild.level_up_channel}`);


                // Define the query to update the user in the database
                const updateLevelUpChannelQuery = `
                                        UPDATE guilds
                                        SET level_up_channel = ?,
                                        WHERE guild_id = ?`;


                // Define the function to update the level-up channel for the guild
                function updateLevelUpChannel() {
                  const updateLevelUpChannel = db.prepare(updateLevelUpChannelQuery);
                  updateLevelUpChannel.run(null, message.guild.id);
                  updateLevelUpChannel.finalize();
                }


                // If the channel doesn't exist anymore, return and reset the guild's level-up channel
                if (guild.level_up_channel) return updateLevelUpChannel();


                // Send a level-up message in the assigned channel
                levelUpChannel.send(levelUpEmbed);
              });
            }
          }
        }

        // Add new xp and timestamp values to the user in the database
        else {
          // Define the query to add the new values to the user in the database
          const updateUserXpQuery = `
                            UPDATE xp
                            SET timestamp_xp = ?,
                                current_xp = ?
                            WHERE guild_id = ? AND user_id = ?`;

          const updateUserXp = db.prepare(updateUserXpQuery);
          updateUserXp.run(Date.now(), newCurrentXp, message.guild.id, message.author.id);
          updateUserXp.finalize()
        }
      }
    });
  });
}
