const config = require('../../config')
const HttpClient = require('./HttpClient')

class ITADClient extends HttpClient {
  constructor () {
    super(config.itad.api.baseURL)
  }

  async search (game) {
    const route = config.itad.api.routes.search
    const params = {
      key: config.itad.api.key,
      q: game
    }

    return this.instance.get(route, { params: params })
  }

  async overview (plain, region = 'uk', country = 'UK') {
    const route = config.itad.api.routes.overview
    const params = {
      key: config.itad.api.key,
      region: region,
      countr: country,
      plains: plain
    }

    return this.instance.get(route, { params: params })
  }
}

module.exports = ITADClient
