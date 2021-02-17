    // Packages
    const sqlite3 = require("sqlite3").verbose();


    // Database
    const db = new sqlite3.Database('blueprint.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) console.error(err);
    });


    // Define the date object
    const date = new Date();
    const hhmmss = date.toLocaleTimeString();

    module.exports = async client => {
        // Set presence
        let members = null;

        client.guilds.cache.forEach(guild => {
            members += guild.members.cache.size;
        });

        await client.user.setActivity({type: `WATCHING`, name: `over ${members} members`});
        // --- Set presence

        // Create DB tables if they don't exist yet
        const guilds = `
            CREATE TABLE IF NOT EXISTS guilds(
            "id" INTEGER NOT NULL,
            "guild_id" TEXT NOT NULL UNIQUE,
            "prefix" TEXT,
            "skin" TEXT,
            "welcome_channel" TEXT,
            "level_up_channel" TEXT,
            "log_channel" TEXT,
            PRIMARY KEY ("id" AUTOINCREMENT)
            )`;

        db.run(guilds);


        const xp = `
            CREATE TABLE IF NOT EXISTS "xp" (
            "id" INTEGER NOT NULL,
            "guild_id" TEXT NOT NULL,
            "user_id" TEXT NOT NULL,
            "timestamp_xp" INTEGER NOT NULL,
            "current_xp" INTEGER NOT NULL,
            "required_xp" INTEGER NOT NULL,
            "current_level" INTEGER NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT)
            )`;

        db.run(xp);


        const skins = `
            CREATE TABLE IF NOT EXISTS "skins" (
            "id" INTEGER NOT NULL,
            "name" TEXT NOT NULL,
            "hex_color" TEXT NOT NULL,

            "cooldown_message_title" TEXT NOT NULL,
            "cooldown_message_description" TEXT NOT NULL,
            "cooldown_message_image" TEXT NOT NULL,
            "cooldown_message_footer" TEXT NOT NULL, 
              
            "join_message_title" TEXT NOT NULL,
            "join_message_description" TEXT NOT NULL,
            "join_message_image" TEXT NOT NULL,
            "join_message_footer" TEXT NOT NULL,

            "leave_message_title" TEXT NOT NULL,
            "leave_message_description" TEXT NOT NULL,
            "leave_message_image" TEXT NOT NULL,
            "leave_message_footer" TEXT NOT NULL,

            "level_up_message_title" TEXT NOT NULL,
            "level_up_message_description" TEXT NOT NULL,
            "level_up_message_image" TEXT NOT NULL,
            "level_up_message_footer" TEXT NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT)
            )`;

        db.run(skins);


        const cooldowns = `
            CREATE TABLE IF NOT EXISTS "cooldowns" (
            "id" INTEGER NOT NULL,
            "user_id" TEXT NOT NULL,
            "command" TEXT NOT NULL,
            "last_used_timestamp" INTEGER NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT)    
            )`;

        db.run(cooldowns)
        // --- Create DB tables if they don't exist yet

        // Send a message in the console when the client is ready
        console.info(`[${hhmmss} | READY] - ${client.user.tag} is ready.`);
    }