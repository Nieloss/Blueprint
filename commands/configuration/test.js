        module.exports.run = async (client, message, args) => {
            message.reply(message.content)
        }

        module.exports.config = {
            command: 'test',
            aliases: [`ts`],
            cooldown: 10,
            category: 'Configuration'
        }