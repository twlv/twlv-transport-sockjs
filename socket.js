const { Duplex } = require('stream');

class ClientSocket extends Duplex {
  constructor (sock) {
    super();

    this.sock = sock;
    this.sock.onmessage = evt => {
      this.push(Buffer.from(evt.data, 'base64'));
    };

    this.sock.onclose = () => {
      this.emit('end');
    };
  }

  _write (data, encoding, cb) {
    this.sock.send(data.toString('base64'));
    cb();
  }

  _read () {
    // do nothing
  }

  _destroy () {
    this.sock.close();
  }
}

class ServerSocket extends Duplex {
  constructor (sock) {
    super();

    this.sock = sock;
    this.sock.on('data', message => {
      this.push(Buffer.from(message, 'base64'));
    });

    this.sock.on('close', () => {
      this.sock.removeAllListeners();
      this.emit('end');
    });
  }

  _write (data, encoding, cb) {
    this.sock.write(data.toString('base64'));
    cb();
  }

  _read () {
    // do nothing
  }

  _destroy () {
    this.sock.close();
  }
}

module.exports = { ClientSocket, ServerSocket };
