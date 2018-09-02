const { EventEmitter } = require('events');
const { ServerSocket } = require('./socket');
const http = require('http');
const sockjs = require('sockjs');
const os = require('os');

class SockJsReceiver extends EventEmitter {
  constructor ({ server, prefix = '/_twlv' } = {}) {
    super();

    this.proto = 'sockjs';
    this.prefix = prefix;
    this.specifiedServer = server;
  }

  get urls () {
    let result = [];
    Object.values(os.networkInterfaces()).forEach(ifaces => {
      ifaces.forEach(iface => {
        if (iface.family === 'IPv6') return;
        if (iface.address.startsWith('127.')) return;
        result.push(`sockjs://${iface.address}:${this.port}${this.prefix}`);
      });
    });
    return result;
  }

  get port () {
    return this.server.address().port;
  }

  async up () {
    await new Promise((resolve, reject) => {
      if (this.specifiedServer) {
        this.server = this.specifiedServer;
        resolve();
      } else {
        this.server = http.createServer();
        this.server.listen(resolve);
      }
    });

    this._sockServer = sockjs.createServer();

    this._requestListeners = this.server.listeners('request');
    this._upgradeListeners = this.server.listeners('upgrade');

    this._sockServer.installHandlers(this.server, { prefix: this.prefix });
    this._sockServer.on('connection', conn => {
      let socket = new ServerSocket(conn);
      this.emit('socket', socket);
    });
  }

  down () {
    this.server.removeAllListeners('request');
    this.server.removeAllListeners('upgrade');
    this._requestListeners.forEach(listener => this.server.addListener(listener));
    this._upgradeListeners.forEach(listener => this.server.addListener(listener));

    if (!this.specifiedServer) {
      this.server.close();
    }
    this.server = undefined;
  }
}

module.exports = { SockJsReceiver };
