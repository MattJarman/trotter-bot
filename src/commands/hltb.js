const Discord = require('discord.js')
const config = require('../../config')
const Helper = require('../modules/Helper')
const HLTB = require('../modules/HLTB')

module.exports = {
  name: 'hltb',
  description: 'Returns How Long To Beat data for a specified game.',
  async execute (message, args, client) {
    const commandConfig = config.commands.hltb
    const helper = new Helper()
    const hltb = new HLTB()

    if (!helper.isValidCommand(message, commandConfig, args)) {
      return
    }

    const gameName = args.join(' ')
    const games = await hltb.get(gameName)
    const game = helper.search(gameName, games)

    if (game === undefined) {
      return message.channel.send(`Sorry, but I couldn't find a game called '\`${gameName}\`'.`)
    }

    await message.channel.send(formatMessage(message, game, client.avatarURL()))
  }
}

function formatMessage (message, game, avatar) {
  return new Discord.MessageEmbed()
    .setTitle(game.name)
    .setImage(game.imageUrl)
    .setColor(config.colour)
    .addFields(
      {
        name: 'Main Story',
        value: `${game.gameplayMain} Hours`,
        inline: true
      },
      {
        name: 'Main + Extras',
        value: `${game.gameplayMainExtra} Hours`,
        inline: true
      },
      {
        name: 'Completionist',
        value: `${game.gameplayCompletionist} Hours`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter(
      'Stats provided by How Long To Beat',
      avatar
    )
}
