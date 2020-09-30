const config = require('../config');
const Helper = require('../modules/helper');
const User = require('../modules/user');

module.exports = {
  name: 'steamid',
  description: 'Sets a user\'s Steam ID.',
  async execute(message, args, client) {
    const commandConfig = config.commands.steamid;
    const helper = new Helper();
    const user = new User();

    if (!helper.isValidCommand(message, commandConfig, args)) {
      return;
    }

    const userId = message.author.id;
    await user.update({ _id: userId }, { steamid: args[0] })
      .catch(err => {
        console.error(err);
      })
      .then(() => {
        message.reply('your Steam ID has been updated!');
      })
  }
}
