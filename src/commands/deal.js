const Discord = require('discord.js')
const config = require('../../config')
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

    await message.channel.send(formatMessage(message, game, client.avatarURL()))
  }
}

function formatMessage (message, game, avatar) {
  const attachment = new Discord.MessageAttachment(config.isthereanydeal.icon, 'itad.jpg')
  return new Discord.MessageEmbed()
    .setAuthor('IsThereAnyDeal', 'attachment://itad.jpg', config.isthereanydeal.url)
    .setURL(game.urls.info)
    .attachFiles(attachment)
    .setTitle(game.name)
    .setColor(config.colour)
    .addFields(
      {
        name: 'Current Best',
        value: `[${game.price.store}](${game.price.url}) - **£${game.price.price}**`
      },
      {
        name: 'Historical Low',
        value: `[${game.lowest.store}](${game.lowest.url}) - **£${game.lowest.price}**`
      }
    )
    .setTimestamp()
    .setFooter('Info provided by IsThereAnyDeal', avatar)
}
