const Discord = require('discord.js')
const config = require('../../config')
const Helper = require('../modules/Helper')
const ITADClient = require('../modules/ITADClient')

module.exports = {
  name: 'deal',
  description: 'Returns best deal for a specified game, along with it\'s historical low.',
  async execute (message, args, client) {
    const commandConfig = config.commands.deal
    const helper = new Helper()
    const itad = new ITADClient()

    if (!helper.isValidCommand(message, commandConfig, args)) {
      return
    }

    const gameName = args.join(' ')
    const { data } = await itad.search(gameName)
    const games = mapResults(data.list)
    const found = helper.search(gameName, games)
    const plain = found.plain
    const response = await itad.overview(plain)
    const overview = response.data[plain]

    if (!overview) {
      return message.channel.send(`Sorry, but I couldn't find a deal for '\`${gameName}\`'.`)
    }

    const game = { ...found, ...overview }

    await message.channel.send(formatMessage(message, game))
  }
}

function mapResults (results) {
  for (const result of results) {
    Object.defineProperty(result, 'name', Object.getOwnPropertyDescriptor(result, 'title'))
    delete result.title
  }

  return results
}

function formatMessage (message, game) {
  const attachment = new Discord.MessageAttachment(config.itad.icon, 'itad.jpg')
  return new Discord.MessageEmbed()
    .setAuthor('IsThereAnyDeal', 'attachment://itad.jpg', config.itad.url)
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
    .setFooter('Info provided by IsThereAnyDeal')
}
