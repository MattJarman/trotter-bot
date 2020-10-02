const fs = require('fs');
const config = require('../config');
const Discord = require('discord.js');
const Helper = require('./Helper')
const MusicPlayer = require('./MusicPlayer');
const User = require('./User');

const PREFIX = config.prefix;
const GROOVY_PREFIX = config.groovyPrefix;

class Bot {
  constructor(token) {
    this.client = new Discord.Client();
    this.client.login(token);
    this.helper = new Helper();
    this.musicPlayer = new MusicPlayer();
    this.user = new User();

    this.client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);

      this.client.commands.set(command.name, command);
    }
  }

  /**
   * Bot event listeners
   */
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

    this.client.on('voiceStateUpdate', async (oldState, newState) => {
      if (newState.member.user.bot) {
        return;
      }
      this.handleVoiceStateUpdate(oldState, newState);
    });
  }

  /**
   * Bot moderation
   *
   * @param {Object} message
   */
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

    if (content.startsWith(GROOVY_PREFIX) && channel.name !== 'music') {
      let musicChannelId = this.getChannelByName('music').id;
      this.removeAndRespond(
        message,
        `Hey <@${message.member.user.id}>, please use the <#${musicChannelId}> channel for music commands.`
      );
    }
  }

  /**
   * Bot commands and message replies
   *
   * @param {Object} message
   */
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

  /**
   * Disconnects the bot from the channel if everybody leaves
   *
   * @param {Object} oldState
   * @param {Object} newState
   */
  async handleVoiceStateUpdate(oldState, newState) {
    let currentChannel = newState.channel;
    let oldChannel = oldState.channel;

    // User didn't join a voice channel
    if (currentChannel === null) {
      let channel = this.getChannelById(oldChannel.id);

      // If the bot is the only one in the voice channel, then disconnect it
      if (channel !== undefined) {
        if (channel.members.size !== 1) {
          return;
        }

        let member = channel.members.first();

        if (member.user === this.client.user) {
          member.voice.channel.leave();
        }
      }
    }
  }

  /**
   * Media controls for playing music
   *
   * @param {Object} message
   * @param {String} control
   */
  handleMediaControls(message, control) {
    if (message.channel.type === 'dm') {
      return message.reply(`You can't use that command in a DM.`);
    }

    switch (control) {
      case 'resume':
        this.musicPlayer.resume();
        break;
      case 'pause':
        this.musicPlayer.pause();
        break;
      case 'stop':
        this.musicPlayer.stop();
    }
  }

  /**
   * Plays Fortnate Son
   *
   * @param {Object} message
   */
  async fortunateSon(message) {
    if (message.channel.type === 'dm') {
      return message.reply(`You can't use that command in a DM.`);
    }

    let connection = await this.connectToVoiceChannel(message);

    if (!connection) {
      return;
    }

    let channel = message.member.voice.channel;
    let commandConfig = config.commands.vietnam.config;

    this.musicPlayer.play(
      channel,
      connection,
      commandConfig.link,
      commandConfig.length
    );
  }

  /**
   * Removes a message and then responds
   * to it
   *
   * @param {Object} message
   * @param {String} reply
   */
  removeAndRespond(message, reply) {
    message.delete();
    this.helper.sendAndDelete(message.channel, reply);
  }

  /**
   * Connects bot to user's voice channel
   *
   * @param {Object} message
   */
  async connectToVoiceChannel(message) {
    if (!message.guild) {
      return false;
    }

    if (!message.member.voice.channel) {
      message.reply(`you need to join a voice channel first!`);
      return false;
    }

    return message.member.voice.channel.join();
  }

  /**
   * Returns channel object with specified name
   *
   * @param {String} name
   *
   * @returns
   */
  getChannelByName(name) {
    return this.client.channels.cache.find((channel) => channel.name === name);
  }

  /**
   * Returns channel object with specified id
   *
   * @param {String} id
   */
  getChannelById(id) {
    return this.client.channels.cache.find((channel) => channel.id === id);
  }

  /**
   * Updates bot presence
   *
   *
   * @param {Object} data
   */
  updatePresence(data) {
    this.client.user.setPresence(data);
  }
}

module.exports = Bot;
