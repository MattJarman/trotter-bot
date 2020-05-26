const ytdl = require('ytdl-core');
const Timer = require('./timer');
const STOPPED_STATE = 'stopped';
const PLAYING_STATE = 'playing';
const PAUSED_STATE = 'paused';
const FADE_OUT_TIME = 5000;
const FADE_OUT_DECREMENT = 0.1;
const DISCONNECT_AFTER = 2000;

class MusicPlayer {
  constructor() {
    this.state = 'stopped';
  }

  async play(channel, connection, youtubeLink, length = false) {
    this.connection = connection;

    let videoInfo = await ytdl.getInfo(youtubeLink);
    let stream = ytdl(youtubeLink, { begin: '1:30' });
    this.dispatcher = this.connection.play(stream);

    if (length) {
      this.timer = new Timer(() => {
        this.fadeOut(channel);
      }, length);
    }

    this.dispatcher.on('start', () => {
      console.log(`Now playing '${videoInfo.title}.'`);
      this.state = PLAYING_STATE;
    });

    this.dispatcher.on('finish', () => {
      channel.leave();
      this.state = STOPPED_STATE;
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
    this.state = PLAYING_STATE;
  }

  pause() {
    if (!this.dispatcher) {
      return;
    }

    if (this.timer) {
      this.timer.pause();
    }

    this.dispatcher.pause();
    this.state = PAUSED_STATE;
  }

  stop() {
    if (!this.dispatcher || !this.connection) {
      return;
    }

    this.dispatcher.pause();
    this.connection.disconnect();
    this.state = STOPPED_STATE;
  }

  getState() {
    return this.state;
  }

  getCurrentlyPlaying() {
    return this.dispatcher;
  }

  fadeOut(channel) {
    // Calculate interval needed to reach fade out time
    let interval =
      FADE_OUT_TIME / (this.dispatcher.volume / FADE_OUT_DECREMENT);
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
          channel.leave();
          this.state = STOPPED_STATE;
        }, DISCONNECT_AFTER);

        return;
      }

      this.dispatcher.setVolume(volume - 0.1);
    }, interval);
  }
}

module.exports = MusicPlayer;
