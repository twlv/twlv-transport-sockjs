const SockJS = require('sockjs-client');
const url = require('url');
const { ClientSocket } = require('./socket');
const debug = require('debug')('twlv:transport-sockjs:dialer');

class SockJsDialer {
  constructor ({ secure = 'auto' } = {}) {
    this.proto = 'sockjs';
    this.secure = secure;
  }

  up () {
    // noop
  }

  down () {
    // noop
  }

  async dial (urlString) {
    let { host, pathname } = url.parse(urlString);

    if (this.secure === 'auto' || this.secure === true) {
      try {
        let socket = await this._tryCreateSocket(`https://${host}${pathname}`);
        return socket;
      } catch (err) {
        if (this.secure === true) {
          throw new Error(`Failed connect to url ${urlString}`);
        }
      }
    }

    if (this.secure === 'auto' || this.secure === false) {
      try {
        let socket = await this._tryCreateSocket(`http://${host}${pathname}`);
        return socket;
      } catch (err) {
        throw new Error(`Failed connect to url ${urlString}`);
      }
    }
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

      sock.onerror = err => {
        debug('SockJsDialer socket caught err: %s', err.stack);
      };
    });
  }
}

module.exports = { SockJsDialer };
