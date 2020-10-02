const Discord = require('discord.js')
const config = require('../../config')
const Helper = require('../modules/Helper')

module.exports = {
  name: 'help',
  description: 'Lists all commands, and displays usage for a command if one is specified.',
  async execute (message, args, client) {
    const commands = config.commands
    const commandConfig = commands.help
    const helper = new Helper()

    if (!helper.isValidCommand(message, commandConfig, args)) {
      return
    }

    if (args.length > 0) {
      const commandName = args[0]
      const command = Object.values(commands).find(command => command.name === commandName)

      if (!command) {
        return message.channel.send(`Sorry, but the command \`${commandName}\` doesn't exist. Use \`!${commandConfig.name}\` for a list of valid commands.`)
      }

      const response = new Discord.MessageEmbed()
        .setColor(config.colour)
        .setTitle(helper.capitalise(command.name))
        .setDescription(command.description)
        .addField('Usage', `\`${helper.getCommandUsageString(command)}\``)

      for (const arg of Object.values(command.args)) {
        const name = arg.required ? arg.name : `${arg.name} *(Optional)*`
        response.addField(name, arg.description, true)
      }

      return message.channel.send(response)
    }

    const response = new Discord.MessageEmbed()
      .setColor(config.colour)
      .setTitle('Commands')
      .setDescription('*Arguments with asterisks mean they\'re optional.*')

    for (const command of Object.values(commands)) {
      const description = `*${command.description}*` + `\n \`${helper.getCommandUsageString(command)}\``
      response.addField(helper.capitalise(command.name), description)
    }

    return message.channel.send(response)
  }
}
