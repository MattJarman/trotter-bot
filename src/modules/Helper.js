const config = require('../../config')
const STEAM_BASE_LOGO_URL = config.steam.logoBaseUrl

const DEFAULT_TIMEOUT = config.timeout

class Helper {
  /**
   * Sorts an array of games by playtime, descending
   *
   * @param {Array} games
   */
  sortByPlaytime (games) {
    return games.sort((a, b) => {
      if (a.playtime_forever < b.playtime_forever) {
        return 1
      }

      if (a.playtime_forever > b.playtime_forever) {
        return -1
      }

      return 0
    })
  }

  /**
   * Organises games into a more usable format
   * @param {Array} games
   */
  formatGames (games) {
    const formattedGames = []
    games = this.sortByPlaytime(games)
    games.forEach((game) => {
      formattedGames.push({
        appid: game.appid,
        name: game.name,
        playtime_forever: Math.round(game.playtime_forever / 60) || 0,
        playtime_2weeks: Math.round(game.playtime_2weeks / 60) || 0,
        logo_url: this.buildLogoUrl(game.appid, game.img_logo_url)
      })
    })

    return formattedGames
  }

  /**
   * Builds an image URL from a steam game
   *
   * @param {Number} appid
   * @param {String} logoUrl
   *
   * @returns {String}
   */
  buildLogoUrl (appid, logoUrl) {
    return `${STEAM_BASE_LOGO_URL}${appid}/${logoUrl}.jpg`
  }

  /**
   * Calculates the Levenshtein Distance between a search term
   * and all games in a user's steam library and returns the
   * closest result
   *
   * @param {String} term
   * @param {Array} games
   *
   * @returns {Object} found
   */
  search (term, games) {
    let minDist = Number.MAX_SAFE_INTEGER
    let found = games[0]

    games.forEach((game) => {
      const dist = this.levenshteinDistance(
        term.toLowerCase(),
        game.name.toLowerCase()
      )

      if (dist < minDist) {
        minDist = dist
        found = game
      }
    })

    return found
  }

  /**
   * Finds the Levenshtein Distance between two strings
   *
   * @param {String} a
   * @param {String} b
   *
   * @returns {Number}
   */
  levenshteinDistance (a, b) {
    const matrix = this.emptyMatrix(a.length + 1, b.length + 1)

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i
    }

    for (let i = 0; i <= b.length; i++) {
      matrix[0][i] = i
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + indicator
        )
      }
    }

    return matrix[a.length][b.length]
  }

  /**
   * Creates an empty matrix
   *
   * @param {Number} width
   * @param {Number} height
   *
   * @returns {Array}
   */
  emptyMatrix (width, height) {
    return Array(width)
      .fill(null)
      .map(() => Array(height).fill(null))
  }

  /**
   * Capitalises the first letter of each word
   * in a string
   *
   * @param {String} string
   *
   * @returns {String}
   */
  capitalise (string) {
    return string
      .toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
  }

  /**
   * Returns the usage string for a specific command
   * @param {Object} commandConfig
   *
   * @returns {String}
   */
  getCommandUsageString (commandConfig) {
    const argsString = commandConfig.args
      .map((arg) => {
        const name = arg.required ? arg.name : `${arg.name}*`
        return name
      })
      .join(' ')

    return `!${commandConfig.name} ${argsString}`
  }

  isValidCommand (message, config, args) {
    const expectedArgs = config.args.filter((arg) => arg.required)

    if (config.channelOnly && message.channel.type === 'dm') {
      message.reply('You can\'t use that command in a DM.')
      return false
    }

    if ((config.isSingleArg && expectedArgs.length > args.length) || (!config.isSingleArg && expectedArgs.length !== args.length && config.args.length !== args.length)) {
      this.sendAndDelete(message.channel, `Invalid number of arguments. to use this command, type \`\`\`${this.getCommandUsageString(config)}\`\`\``)
      return false
    }

    return true
  }

  sendAndDelete (channel, reply, timeout = DEFAULT_TIMEOUT) {
    channel.send(reply).then(message => {
      message.delete({
        timeout: timeout
      })
    })
  }
}

module.exports = Helper
