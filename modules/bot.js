const config = require('../config');
const Discord = require('discord.js');
const Steam = require('./steam');
const Helper = require('./helper');
const MusicPlayer = require('./musicPlayer');
const User = require('../modules/user');
const HLTB = require('../modules/hltb');

const PREFIX = config.prefix;
const GROOVY_PREFIX = config.groovyPrefix;
const DEFAULT_TIMEOUT = config.timeout;
const INSULTS = config.insults;

class Bot {
    constructor(token) {
        this.client = new Discord.Client();
        this.client.login(token);
        this.steam = new Steam();
        this.helper = new Helper();
        this.musicPlayer = new MusicPlayer();
        this.user = new User();
        this.HLTB = new HLTB();
    }

    /**
     * Bot event listeners
     */
    listen() {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            this.updatePresence({
                activity: { name: 'Unturned' },
                status: 'online'
            });
        });

        this.client.on('message', message => {
            if (message.author.bot) {
                return;
            }

            this.handleModeration(message);
            this.handleMessage(message);
        });

        this.client.on('voiceStateUpdate', async(oldState, newState) => {
            if (newState.member.user.bot) {
                return;
            }
            this.handleVoiceStateUpdate(oldState, newState);
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
            case 'help':
                this.help(message, args);
                break;
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
            case 'hltb':
                this.hltb(message, args);
                break;
            case 'resume':
                this.handleMediaControls(message, command);
                break;
            case 'pause':
                this.handleMediaControls(message, command);
                break;
            case 'stop':
                this.handleMediaControls(message, command);
                break;
            default:
                message.reply('sorry, but that\'s an invalid command. Use `!help` for a list of valid commands.');
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
     * Lists all commands along with their usage. If an argument 
     * is specified, then information about that command will
     * be returned instead
     * 
     * @param {Object} message 
     * @param {Array} args 
     */
    help(message, args) {
        let commandConfig = config.commands.help;
        let commands = config.commands;

        if (!this.isValidCommand(message, commandConfig, args)) {
            return;
        }

        if (args.length > 0) {
            let command = Object.values(commands).find(command => command.name === args[0]);

            if (command === undefined) {
                return message.channel.send(`Sorry, but the command \`${args[0]}\` doesn't exist. Use \`!${commandConfig.name}\` for a list of valid commands.`);
            }

            let response = new Discord.MessageEmbed()
                .setColor(config.colour)
                .setTitle(this.helper.capitalise(command.name))
                .setDescription(command.description)
                .addField('Usage', `**${this.helper.getCommandUsageString(command)}**`);

            command.args.forEach(arg => {
                let name = arg.required ? arg.name : `${arg.name} *(Optional)*`
                response.addField(name, arg.description, true);
            });

            return message.channel.send(response);
        }

        let response = new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle('Trotter')
            .setDescription('Arguments with asterisks mean they\'re optional.');

        Object.values(commands).forEach(command => {
            let description = command.description + `\n** ${this.helper.getCommandUsageString(command)} **`;
            response.addField(this.helper.capitalise(command.name), description);
        });

        return message.channel.send(response);
    }

    /**
     * Bulk deletes message from the current channel
     * 
     * @param {Object} message 
     * @param {Array} args 
     */
    purge(message, args) {
        let commandConfig = config.commands.purge;

        if (!this.isValidCommand(message, commandConfig, args)) {
            return;
        }

        let roles = message.member.roles.cache;

        if (!roles.some(role => role.name === 'Admin')) {
            return this.sendAndDelete(
                message.channel,
                'Sorry, but you don\'t have permission to do that.'
            );
        }

        let amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return this.sendAndDelete(
                message.channel,
                `'${args[0]}' isn't a valid number.`
            );
        }

        if (amount <= commandConfig.config.min || amount > commandConfig.config.max) {
            return this.sendAndDelete(
                message.channel,
                `You need to enter a number between ${commandConfig.config.min} and ${commandConfig.config.max - 1}.`
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
        let commandConfig = config.commands.steamid;

        if (!this.isValidCommand(message, commandConfig, args)) {
            return;
        }

        let userId = message.author.id;
        let user = await this.user
            .update({ _id: userId }, { steamid: args[0] })
            .catch(err => {
                // TODO: Respond with error
            })
            .then(() => {
                message.reply('your Steam ID has been updated!');
            });
    }

    /**
     * Gets the user's playtime for a game
     * 
     * @param {Object} message 
     * @param {Array} args 
     */
    async playtime(message, args) {
        let userId = message.author.id;
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
            return message.channel.send('Hmmm, looks like you don\'t own any games. Are you sure your Steam ID is correct?');
        }

        let games = this.helper.formatGames(response.games);

        let game = games[0];

        if (args.length >= 1) {
            let searchTerm = args.join(' ');
            game = this.helper.search(searchTerm, games);
        }

        if (game === undefined) {
            return message.channel.send(`I couldn't find a game called ${selected} in your library.`);
        }

        let reply = new Discord.MessageEmbed()
            .setTitle(game.name)
            .setImage(game.logo_url)
            .setColor(config.colour)
            .addFields({ name: 'Forever', value: `${game.playtime_forever} hrs played` }, { name: 'Last 2 Weeks', value: `${game.playtime_2weeks} hrs played` })
            .setTimestamp()
            .setFooter('Stats provided by Steam', this.client.user.avatarUrl);

        return message.channel.send(reply);
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

        this.musicPlayer.play(channel, connection, commandConfig.link, commandConfig.length);
    }

    /**
     * Returns How Long To Beat data about a 
     * specified game
     * 
     * @param {Object} message 
     * @param {Array} args 
     */
    async hltb(message, args) {
        let commandConfig = config.commands.hltb;

        if (!this.isValidCommand(message, commandConfig, args)) {
            return;
        }

        let gameName = args.join(' ');
        let games = await this.HLTB.get(gameName);
        let game = this.helper.search(gameName, games);

        if (game === undefined) {
            return message.channel.send(`Sorry, but I couldn't find a game called '\`${gameName}\`'.`);
        }

        let response = new Discord.MessageEmbed()
            .setTitle(game.name)
            .setImage(game.imageUrl)
            .setColor(config.colour)
            .addFields({ name: 'Main Story', value: `${game.gameplayMain} Hours`, inline: true }, { name: 'Main + Extras', value: `${game.gameplayMainExtra} Hours`, inline: true }, { name: 'Completionist', value: `${game.gameplayCompletionist} Hours`, inline: true })
            .setTimestamp()
            .setFooter(`Stats provided by How Long To Beat`, this.client.user.avatarUrl);

        return message.channel.send(response);
    }

    /**
     * Command validation
     * 
     * @param {Object} message 
     * @param {Object} command 
     * @param {Array} args 
     */
    isValidCommand(message, command, args) {
        let expectedArgs = command.args.filter(arg => arg.required);

        if (command.channelOnly && message.channel.type === 'dm') {
            message.reply(`You can't use that command in a DM.`);
            return false;
        }

        if (command.isSingleArg && expectedArgs.length > args.length) {
            this.sendAndDelete(
                message.channel,
                `Invalid number of arguments. To use this command, type: \`\`\`${this.helper.getCommandUsageString(command)}\`\`\``
            );

            return false;
        }

        if (!command.isSingleArg && expectedArgs.length !== args.length && command.args.length !== args.length) {
            this.sendAndDelete(
                message.channel,
                `Invalid number of arguments. To use this command, type: \`\`\`${this.helper.getCommandUsageString(command)}\`\`\``
            );

            return false;
        }

        return true;
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
        return this.client.channels.cache.find(channel => channel.name === name);
    }

    /**
     * Returns channel object with specified id
     * 
     * @param {String} id 
     */
    getChannelById(id) {
        return this.client.channels.cache.find(channel => channel.id === id);
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