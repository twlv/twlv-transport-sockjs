const SockJS = require('sockjs-client');
const { URL } = require('url');
const { ClientSocket } = require('./socket');

class SockJsDialer {
  constructor () {
    this.proto = 'sockjs';
  }

  async dial (url) {
    let urlO = new URL(url);

    let socket = await new Promise((resolve, reject) => {
      let url = `http://${urlO.host}${urlO.pathname}`;

      let sock = new SockJS(url);
      sock.onopen = () => {
        let socket = new ClientSocket(sock);
        resolve(socket);
      };
    });

    return socket;
  }
}

module.exports = { SockJsDialer };
