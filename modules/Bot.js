const fs = require('fs');
const config = require('../config');
const Discord = require('discord.js');
const Helper = require('./Helper')

const PREFIX = config.prefix;
const GROOVY_PREFIX = config.groovyPrefix;

class Bot {
  constructor(token) {
    this.client = new Discord.Client();
    this.client.login(token);
    this.helper = new Helper();

    this.client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);

      this.client.commands.set(command.name, command);
    }
  }

  listen() {
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
      this.updatePresence({
        activity: { name: 'Unturned' },
        status: 'online',
      });
    });

    this.client.on('message', (message) => {
      if (message.author.bot) {
        return;
      }

      this.handleModeration(message);
      this.handleMessage(message);
    });
  }

  handleModeration(message) {
    let content = message.content;
    let channel = message.channel;

    if (
      !content.startsWith(GROOVY_PREFIX) &&
      !content.startsWith(PREFIX) &&
      channel.name === 'music'
    ) {
      this.removeAndRespond(
        message,
        `Hey <@${message.member.user.id}>, you shouldn't be talking in this channel.`
      );
    }
  }

  handleMessage(message) {
    let content = message.content;

    if (!content.startsWith(PREFIX) || message.author.bot) {
      return;
    }

    let args = content.slice(PREFIX.length).split(' ');
    let command = args.shift().toLowerCase();

    if (!this.client.commands.has(command)) return;

    try {
      this.client.commands.get(command).execute(message, args, this.client.user);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  }

  removeAndRespond(message, reply) {
    message.delete();
    this.helper.sendAndDelete(message.channel, reply);
  }

  updatePresence(data) {
    this.client.user.setPresence(data);
  }
}

module.exports = Bot;
