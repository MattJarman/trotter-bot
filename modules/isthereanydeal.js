const config = require('../config');
const fetch = require('node-fetch');
const Helper = require('./helper');
const API_KEY = config.isthereanydeal.key;
const SEARCH_URL = config.isthereanydeal.searchUrl;
const OVERVIEW_URL = config.isthereanydeal.gameOverviewUrl;

class IsThereAnyDeal {
  constructor() {
    this.helper = new Helper();
  }

  async search(gameName) {
    const url = `${SEARCH_URL}${API_KEY}&q=${gameName}`;

    // TODO: Add caching, using the input name as the key
    let response = await fetch(url);
    let json = await response.json();

    if (json === undefined) {
      return false;
    }

    let games = json.data.list;

    // Rename 'title' to 'name'
    games.forEach((game) => {
      Object.defineProperty(
        game,
        'name',
        Object.getOwnPropertyDescriptor(game, 'title')
      );
      delete game['title'];
    });

    return this.helper.search(gameName, games);
  }

  async getDeal(gameName, region = 'uk', country = 'UK') {
    let game = await this.search(gameName);

    if (game === undefined) {
      return false;
    }

    const url = `${OVERVIEW_URL}${API_KEY}&region=${region}&country=${country}&plains=${game.plain}`;

    let response = await fetch(url);
    let json = await response.json();

    if (json === undefined) {
      return false;
    }

    return { ...game, ...json.data[game.plain] };
  }
}

module.exports = IsThereAnyDeal;
