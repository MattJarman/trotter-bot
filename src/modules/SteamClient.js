const config = require('../../config')
const HttpClient = require('./HttpClient')

class SteamClient extends HttpClient {
  constructor () {
    super(config.steam.baseURL)
  }

  async getOwnedGames (steamId) {
    const route = config.steam.routes.ownedGames
    const params = {
      key: config.steam.key,
      steamid: steamId,
      include_appinfo: 1,
      include_played_free_games: 1
    }
    return this.instance.get(route, { params: params })
  }
}

module.exports = SteamClient
