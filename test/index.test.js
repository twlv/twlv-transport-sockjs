const { Node } = require('@twlv/core');
const { SockJsDialer, SockJsListener } = require('..');
const assert = require('assert');

describe('SockJs Transport', () => {
  before(() => process.on('unhandledRejection', err => console.error('Unhandled', err)));
  after(() => process.removeAllListeners('unhandledRejection'));

  it('send to other peer', async () => {
    let node1 = new Node();
    let node2 = new Node();

    node1.addDialer(new SockJsDialer());
    node2.addListener(new SockJsListener());

    try {
      await node1.start();
      await node2.start();

      await node1.connect(node2.advertisement.urls[0]);

      await new Promise(async (resolve, reject) => {
        try {
          node2.on('message', message => {
            try {
              assert.equal(message.command, 'foo');
              assert.equal(message.payload.toString(), 'bar');
              resolve();
            } catch (err) {
              reject(err);
            }
          });

          await node1.send({
            to: node2.identity.address,
            command: 'foo',
            payload: 'bar',
          });
        } catch (err) {
          reject(err);
        }
      });
    } finally {
      await node1.stop();
      await node2.stop();
    }
  });
});
