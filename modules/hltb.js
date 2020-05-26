const hltb = require('howlongtobeat');

class HLTB {
  constructor() {
    this.service = new hltb.HowLongToBeatService();
  }

  async get(game) {
    return new Promise((resolve, reject) => {
      this.service
        .search(game)
        .then((result) => resolve(result))
        .catch((err) => reject(err));
    });
  }
}

module.exports = HLTB;
