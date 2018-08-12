const SockJS = require('sockjs-client');
const url = require('url');
const { ClientSocket } = require('./socket');

class SockJsDialer {
  constructor () {
    this.proto = 'sockjs';
  }

  async dial (urlString) {
    let urlO = url.parse(urlString);

    let socket;
    try {
      socket = await this._tryCreateSocket(`https://${urlO.host}${urlO.pathname}`);
    } catch (err) {
      try {
        socket = await this._tryCreateSocket(`http://${urlO.host}${urlO.pathname}`);
      } catch (err) {
        throw new Error(`Failed connect to url ${urlString}`);
      }
    }
    return socket;
  }

  _tryCreateSocket (url) {
    return new Promise((resolve, reject) => {
      let sock = new SockJS(url);
      sock.onopen = () => {
        sock.onclose = undefined;
        let socket = new ClientSocket(sock);
        resolve(socket);
      };

      sock.onclose = evt => {
        if (evt.code) {
          let err = new Error(evt.reason);
          err.code = evt.code;
          return reject(err);
        }
      };
    });
  }
}

module.exports = { SockJsDialer };
