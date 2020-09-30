const config = require('../config');
const Helper = require('../modules/helper');

module.exports = {
  name: 'purge',
  description: 'Deletes a specified number of messages (between 1 and 99) from the current channel.',
  execute(message, args, client) {
    const commandConfig = config.commands.purge;
    const helper = new Helper();

    if (!helper.isValidCommand(message, commandConfig, args)) {
      return;
    }

    const roles = message.member.roles.cache;

    if (!roles.some(role => role.name === 'Admin')) {
      return helper.sendAndDelete(message.channel, `Sorry, but you don't have permission to do that`);
    }

    const amount = parseInt(args[0]) + 1;

    if (isNaN(amount)) {
      return helper.sendAndDelete(message.channel, `'${args[0]}' isn't a valid number.`);
    }

    if (amount <= commandConfig.config.min || amount > commandConfig.config.max) {
      return helper.sendAndDelete(message.channel, `You need to enter a number between ${commandConfig.config.min} and ${
        commandConfig.config.max - 1
      }.`);
    }

    message.channel.bulkDelete(amount, true);
  }
}
