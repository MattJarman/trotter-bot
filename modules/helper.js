const config = require('../config');
const STEAM_BASE_LOGO_URL = config.steam.logoBaseUrl;

class Helper {
    sortByPlaytime(games) {
        return games.sort((a, b) => {
            if (a.playtime_forever < b.playtime_forever) {
                return 1;
            }

            if (a.playtime_forever > b.playtime_forever) {
                return -1;
            }

            return 0;
        });
    }

    formatGames(games) {
        let formattedGames = [];
        games = this.sortByPlaytime(games);
        games.forEach(game => {
            formattedGames.push({
                appid: game.appid,
                name: game.name,
                playtime_forever: Math.round(game.playtime_forever / 60) || 0,
                playtime_2weeks: Math.round(game.playtime_2weeks / 60) || 0,
                logo_url: this.buildLogoUrl(game.appid, game.img_logo_url)
            });
        });

        return formattedGames;
    }

    buildLogoUrl(appid, logoUrl) {
        return `${STEAM_BASE_LOGO_URL}${appid}/${logoUrl}.jpg`;
    }
}

module.exports = Helper;