const config = require('../config');
const Discord = require('discord.js');
const Steam = require('./steam');
const Helper = require('./helper');
const MusicPlayer = require('./musicPlayer');
const User = require('../modules/user');
const ytdl = require('ytdl-core');

const PREFIX = config.prefix;
const GROOVY_PREFIX = config.groovyPrefix;
const DEFAULT_TIMEOUT = config.timeout;
const INSULTS = config.insults;
const BULK_DELETE_MAX = config.bulkDelete.max;
const BULK_DELETE_MIN = config.bulkDelete.min;

class Bot {
    constructor(token) {
        this.client = new Discord.Client();
        this.client.login(token);
        this.steam = new Steam();
        this.helper = new Helper();
        this.musicPlayer = new MusicPlayer();
        this.user = new User();
    }

    /**
     * Bot event listeners
     */
    listen() {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
        });

        this.client.on('message', message => {
            if (message.author.bot) {
                return;
            }

            this.handleModeration(message);
            this.handleMessage(message);
        });

        this.client.on('voiceStateUpdate', async(oldMember, currentMember) => {
            // let currentChannel = currentMember.voiceChannel;
            // let oldChannel = oldMember.voiceChannel;

            // if (currentChannel === undefned) {
            //     // User didn't join a voice channel
            //     return;
            // }

            // let connection = await currentMember.voiceChannel.join();
            // this.musicPlayer.setConnection(connection);
        });

        // TODO: Add log level into config
        // this.client.on('debug', msg => {
        //     if (msg.includes('VOICE')) console.log(msg);
        // });
    }

    /**
     * Bot moderation
     * 
     * @param {Object} message 
     */
    handleModeration(message) {
        let content = message.content;
        let channel = message.channel;

        if (!content.startsWith(GROOVY_PREFIX) &&
            !content.startsWith(PREFIX) &&
            channel.name === 'music'
        ) {
            // Get a random insult
            let insult = INSULTS[Math.floor(Math.random() * INSULTS.length)];
            this.removeAndRespond(
                message,
                `Hey <@${message.member.user.id}>, you shouldn't be talking in this channel, you absolute ${insult}.`
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

        switch (command) {
            case 'purge':
                this.purge(message, args);
                break;
            case 'steamid':
                this.updateSteamId(message, args);
                break;
            case 'playtime':
                this.playtime(message, args);
                break;
            case 'vietnam':
                this.fortunateSon(message);
                break;
            case 'resume':
                this.musicPlayer.resume();
                break;
            case 'pause':
                this.musicPlayer.pause();
                break;
            case 'stop':
                this.musicPlayer.stop();
                break;
        }
    }

    /**
     * Bulk deletes message from the current channel
     * 
     * @param {Object} message 
     * @param {Array} args 
     */
    purge(message, args) {
        let roles = message.member.roles.cache;

        if (!roles.some(role => role.name === 'Admin')) {
            return this.sendAndDelete(
                message.channel,
                'Sorry, but you don\'t have permission to do that.'
            );
        }

        if (args.length !== 1) {
            return this.sendAndDelete(
                message.channel,
                'Invalid number of arguments. To use this command, type:\n ```!purge <amount_to_delete>```'
            );
        }

        let amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return this.sendAndDelete(
                message.channel,
                `'${args[0]}' isn't a valid number.`
            );
        }

        if (amount <= BULK_DELETE_MIN || amount > BULK_DELETE_MAX) {
            return this.sendAndDelete(
                message.channel,
                'You need to enter a number between 1 and 99.'
            );
        }

        message.channel.bulkDelete(amount, true);
    }

    /**
     * Updates a user's Steam ID
     * 
     * @param {Object} message 
     * @param {Array} args 
     */
    async updateSteamId(message, args) {
        if (args.length !== 1) {
            return this.sendAndDelete(
                message.channel,
                'Invalid number of arguments. To use this command, type:\n ```!steamid <your_steam_id>```'
            );
        }

        let userId = message.member.user.id;
        let user = await this.user
            .update({ _id: userId }, { steamid: args[0] })
            .catch(err => {
                // TODO: Respond with error
            });
    }

    /**
     * Gets the user's playtime for a game
     * 
     * @param {Object} message 
     * @param {Array} args 
     */
    async playtime(message, args) {
        let userId = message.member.user.id;
        let user = await this.user
            .get(userId)
            .catch(err => {
                // TODO: Respond with error
            });

        if (user === null) {
            return message.channel.send(`Hey <@${userId}>, you haven't told me your Steam ID. Use the following command to set it up:\n \`\`\`!steamid <your_steam_id>\`\`\``);
        }

        let steamId = user.steamid;

        let response = await this.steam
            .getUserGames(steamId)
            .catch(err => {
                return this.sendAndDelete(
                    message.channel,
                    `There was a problem retrieving your games. Please ensure that:\n\n\t 1. Your Steam ID \`${steamId}\` is correct\n\t 2. Your Steam profile is public`
                );
            });

        if (response === 'undefined') {
            return this.sendAndDelete(
                message.channel,
                `There was a problem retrieving your games. Please ensure that:\n\n\t 1. Your Steam ID \`${steamId}\` is correct\n\t 2. Your Steam profile is public`
            );
        }

        if (!response.games) {
            return this.sendAndDelete(
                message.channel,
                `Slow down there buackaroo, that's way too many requests. Have some patience, and wait a little while before making another.`
            );
        }

        if (response.games.length === 0) {
            return message.channel.send('Hmmm, looks like you don\'t own any games. Are you sure your steam ID is correct?');
        }

        let games = this.helper.formatGames(response.games);

        let game = games[0];

        if (args.length >= 1) {
            let searchTerm = args.join(' ');
            game = this.helper.search(searchTerm, games);
        }

        if (game === undefined) {
            return message.channel.send(`We couldn't find a game called ${selected} in your library.`);
        }

        let reply = {
            embed: {
                title: game.name,
                image: {
                    url: game.logo_url
                },
                fields: [{
                        name: 'Total',
                        value: `${game.playtime_forever} hrs played`
                    },
                    {
                        name: 'Last 2 Weeks',
                        value: `${game.playtime_2weeks} hrs played`
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: this.client.user.avatarUrl,
                    text: 'Stats provided by Steam'
                }
            }
        };

        message.channel.send(reply);
    }

    async fortunateSon(message) {
        const connection = await this.connectToVoiceChannel(message);
        let fortunateSon = config.music.fortunateSon;

        // let player = new MusicPlayer(connection);
        this.musicPlayer.setConnection(connection);
        this.musicPlayer.play(message, fortunateSon.link, fortunateSon.length);
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
        this.sendAndDelete(message.channel, reply);
    }

    /**
     * Sends a message and then deletes it after
     * a specified amount of time
     * 
     * @param {Object} message 
     * @param {String} reply 
     * @param {Number} timeout 
     */
    sendAndDelete(channel, reply, timeout = DEFAULT_TIMEOUT) {
        channel
            .send(reply)
            .then(message => {
                message.delete({
                    timeout: timeout
                });
            });
    }

    async connectToVoiceChannel(message) {
        if (!message.guild) {
            return;
        }

        if (!message.member.voice.channel) {
            message.reply(`Hey <@${message.member.user.id}>, you need to join a voice channel first!`);
            return;
        }

        return message.member.voice.channel.join();
    }


    getChannel(name) {
        return this.client.channels.cache.find(channel => channel.name === name);
    }
}

module.exports = Bot;