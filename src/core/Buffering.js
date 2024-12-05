'use strict';

class Buffering {
  constructor({ processMessage }) {
    this.processMessage = processMessage;
    this.buffer = [];
    this.enabled = false;

    this.begin = this.begin.bind(this);
    this.commit = this.commit.bind(this);
    this.reject = this.reject.bind(this);
  }

  addMessage(message) {
    this.buffer.push(message);
  }

  begin() {
    this.enabled = [];
  }

  commit() {
    this.enabled = false;
    this.buffer.forEach((item) => this.processMessage(item));
    this.buffer = [];
  }

  reject() {
    this.enabled = false;
    this.buffer = [];
  }
}

module.exports = Buffering;
