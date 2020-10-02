const Discord = require('discord.js')
const config = require('../../config')
const Helper = require('../modules/Helper')
const Steam = require('../modules/Steam')
const User = require('../sources/User')

module.exports = {
  name: 'playtime',
  description: 'Displays a user\'s playtime for a specified game in their Steam library. Will return most played game in the user\'s Steam library if no game is specified.',
  async execute (message, args, client) {
    const commandConfig = config.commands.playtime
    const helper = new Helper()
    const steam = new Steam()
    const userModel = new User()

    if (!helper.isValidCommand(message, commandConfig, args)) {
      return
    }

    const userId = message.author.id
    const user = await userModel.get(userId)

    if (!user) {
      return message.reply('you haven\'t told me your Steam ID. Use the following command to set it up:\n ```!steamid <your_steam_id>```')
    }

    const steamId = user.steamid
    const response = await steam.getUserGames(steamId).catch(err => console.error(err))

    if (!response) {
      return message.reply(`There was a problem retrieving your games. Please ensure that:\\n\\n\\t 1. Your Steam ID \`${steamId}
    \` is correct.\n\t 2. Your Steam profile is public.`)
    }

    try {
      const games = helper.formatGames(response.games)
      let game = games[0]
      if (args.length > 0) {
        const search = args.join(' ')
        game = helper.search(search, games)
      }

      await message.channel.send(formatMessage(message, game))
    } catch (err) {
      console.error(err)
      message.reply('sorry, I had a problem completing that request.')
    }
  }
}

function formatMessage (message, game) {
  return new Discord.MessageEmbed()
    .setTitle(game.name)
    .setImage(game.logo_url)
    .setColor(config.colour)
    .addFields(
      {
        name: 'Forever',
        value: `${game.playtime_forever} hrs played`,
        inline: true
      },
      {
        name: 'Last 2 Weeks',
        value: `${game.playtime_2weeks} hrs played`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter('Stats provided by Steam')
}
