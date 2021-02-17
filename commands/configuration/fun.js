    module.exports.run = async (client, message, args) => {
        message.reply(message.content)
    }

    module.exports.config = {
        command: 'levels',
        aliases: [`lvl`],
        cooldown: 10,
        category: 'Configuration'
    }