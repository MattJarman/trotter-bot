module.exports = {
    commands: {
        help: {
            name: 'help',
            description: 'Lists all commands, and displays usage for a command if one is specified.',
            channelOnly: false,
            args: [{
                name: 'command_name',
                description: 'Name of command you need help with.',
                required: false
            }],
            config: {}
        },
        purge: {
            name: 'purge',
            description: 'Deletes a specified number of messages (between 1 and 99) from the current channel.',
            channelOnly: true,
            args: [{
                name: 'amount',
                description: 'Number of messages to be deleted.',
                required: true,
            }],
            config: {
                max: 100,
                min: 1
            }
        },
        steamid: {
            name: 'steamid',
            description: 'Sets a user\'s Steam ID.',
            channelOnly: false,
            args: [{
                name: 'steam_id',
                description: 'Steam ID of user.',
                required: true,
            }],
            config: {}
        },
        playtime: {
            name: 'playtime',
            description: 'Displays a user\'s playtime for a specified game in their Steam library. Will return most played game in the user\'s Steam library if no game is specified.',
            channelOnly: false,
            args: [{
                name: `game_name`,
                description: `Name of game to be returned.`,
                required: false,
            }],
            config: {}
        },
        vietnam: {
            name: 'vietnam',
            description: 'Plays Fortunate Son by Creedence Clearwater Revival for exactly 76 seconds.\n*Note: You must be in a voice channel to use this command.*',
            channelOnly: true,
            args: [],
            config: {
                link: 'https://www.youtube.com/watch?v=ZWijx_AgPiA',
                length: 76000
            }
        }
    }
}