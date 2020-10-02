class Timer {
  constructor(callback, delay) {
    this.callback = callback;
    this.remaining = delay;
    this.resume();
  }

  pause() {
    clearTimeout(this.timer);
    this.remaining -= Date.now() - this.start;
  }

  resume() {
    this.start = Date.now();
    clearTimeout(this.timer);
    this.timer = setTimeout(this.callback, this.remaining);
  }
}

module.exports = Timer;
