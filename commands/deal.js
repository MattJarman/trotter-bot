const Discord = require('discord.js')
const config = require('../config')
const Helper = require('../modules/Helper')
const IsThereAnyDeal = require('../modules/IsThereAnyDeal')

module.exports = {
  name: 'deal',
  description: 'Returns best deal for a specified game, along with it\'s historical low.',
  async execute (message, args, client) {
    const commandConfig = config.commands.deal
    const helper = new Helper()
    const deal = new IsThereAnyDeal()

    if (!helper.isValidCommand(message, commandConfig, args)) {
      return
    }

    const gameName = args.join(' ')
    const game = await deal.getDeal(gameName)

    if (!game) {
      return message.channel.send(`Sorry, but I couldn't find a deal for '\`${gameName}\`'.`)
    }

    await message.channel.send(formatMessage(message, game, client.avatarUrl))
  }
}

function formatMessage (message, game, avatar) {
  return new Discord.MessageEmbed()
    .setTitle(game.name)
    .setDescription(`[Link](${game.urls.info})`)
    .setColor(config.colour)
    .addFields(
      {
        name: 'Current Best',
        value: `[${game.price.store}](${game.price.url})`,
        inline: true
      },
      {
        name: '\u200B',
        value: `**£${game.price.price}**`,
        inline: true
      },
      {
        name: '\u200B',
        value: '\u200B'
      },
      {
        name: 'Historical Low',
        value: `[${game.lowest.store}](${game.lowest.url}) `,
        inline: true
      },
      {
        name: '\u200B',
        value: `**£${game.lowest.price}**`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter('Info provided by IsThereAnyDeal', avatar)
}
