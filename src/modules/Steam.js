const config = require('../../config')
const fetch = require('node-fetch')
const API_KEY = config.steam.key
const OWNED_GAMES_BASE_URL = config.steam.ownedGamesBaseUrl

class Steam {
  getUserGames (steamId) {
    const url = `${OWNED_GAMES_BASE_URL}${API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`

    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.json())
        .then((json) => resolve(json.response))
        .catch((error) => reject(error))
    })
  }
}

module.exports = Steam
