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

    search(term, games) {
        let minDist = Number.MAX_SAFE_INTEGER;
        let found = games[0];

        games.forEach(game => {
            let dist = this.levenshteinDistance(term.toLowerCase(), game.name.toLowerCase());

            if (dist < minDist) {
                minDist = dist;
                found = game;
            }
        });

        return found;
    }

    levenshteinDistance(a, b) {
        const matrix = this.emptyMatrix(a.length + 1, b.length + 1);

        for (let i = 0; i <= a.length; i++) {
            matrix[i][0] = i;
        }

        for (let i = 0; i <= b.length; i++) {
            matrix[0][i] = i;
        }

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + indicator
                );
            }
        }

        return matrix[a.length][b.length];
    }

    emptyMatrix(width, height) {
        return Array(width)
            .fill(null)
            .map(() => Array(height).fill(null));
    }
}

module.exports = Helper;