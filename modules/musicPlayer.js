const ytdl = require('ytdl-core');
const Timer = require('./timer');
const FADE_OUT_TIME = 5000;
const FADE_OUT_DECREMENT = .1;
const DISCONNECT_AFTER = 2000;

class MusicPlayer {
    async play(message, youtubeLink, length = false) {
        if (!this.connection) {
            return;
        }

        let videoInfo = await ytdl.getInfo(youtubeLink);
        let stream = ytdl(youtubeLink);
        this.dispatcher = this.connection.play(stream);

        if (length) {
            this.timer = new Timer(() => {
                this.fadeOut(message);
            }, length);
        }

        this.dispatcher.on('start', () => {
            console.log(`Now playing '${videoInfo.title}.'`);
        });

        this.dispatcher.on('finish', () => {
            message.member.voice.channel.leave();
            console.log(`Finishing playing the song.`);
        });
    }

    resume() {
        if (!this.dispatcher) {
            return;
        }

        if (this.timer) {
            this.timer.resume();
        }

        this.dispatcher.resume();
    }

    pause() {
        if (!this.dispatcher) {
            return;
        }

        if (this.timer) {
            this.timer.pause();
        }

        this.dispatcher.pause();
    }

    stop() {
        if (!this.dispatcher || !this.connection) {
            return;
        }

        this.dispatcher.pause();
        this.connection.disconnect();
    }

    setConnection(connection) {
        this.connection = connection;
    }

    fadeOut(message) {
        // Calculate interval needed to reach fade out time
        let interval = FADE_OUT_TIME / (this.dispatcher.volume / FADE_OUT_DECREMENT);
        let fadeInterval = setInterval(() => {
            let volume = Number(Math.round(`${this.dispatcher.volume}e2`) + 'e-2');

            // If we're not connected to the channel, don't bother doing anything else
            if (!this.connection) {
                clearInterval(fadeInterval);
                return;
            }

            // Once we've got no volume, then we can disconnect
            if (volume <= 0) {
                clearInterval(fadeInterval);
                setTimeout(() => {
                    message.member.voice.channel.leave();
                }, DISCONNECT_AFTER);

                return;
            }

            this.dispatcher.setVolume(volume - .1);
        }, interval);
    }
}

module.exports = MusicPlayer;