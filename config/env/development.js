const {
  TOKEN,
  STEAM_API_KEY,
  ISTHEREANYDEAL_API_KEY,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env

module.exports = {
  token: TOKEN,
  mongodb: {
    uri: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`,
    options: {
      useNewUrlParser: true,
      connectTimeoutMS: 10000,
      useUnifiedTopology: true
    }
  },
  steam: {
    key: STEAM_API_KEY,
    baseURL: 'https://api.steampowered.com/',
    routes: {
      ownedGames: 'IPlayerService/GetOwnedGames/v1/'
    },
    logoBaseUrl:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/',
    steamIdFinderUrl: 'https://steamidfinder.com/'
  },
  isthereanydeal: {
    key: ISTHEREANYDEAL_API_KEY,
    icon: 'public/img/itad.jpg',
    url: 'https://isthereanydeal.com/',
    searchUrl: 'https://api.isthereanydeal.com/v01/search/search/?key=',
    gameOverviewUrl: 'https://api.isthereanydeal.com/v01/game/overview/?key='
  }
}
