const { Node } = require('@twlv/core');
const { MemoryFinder } = require('@twlv/core/finders/memory');
const { SockJsDialer, SockJsReceiver } = require('..');
const assert = require('assert');

describe('SockJs Transport', () => {
  before(() => process.on('unhandledRejection', err => console.error('Unhandled', err)));
  after(() => process.removeAllListeners('unhandledRejection'));

  it('send to other peer', async () => {
    let node1 = new Node();
    let node2 = new Node();

    node1.addDialer(new SockJsDialer());
    node2.addReceiver(new SockJsReceiver());
    node1.addFinder(new MemoryFinder());
    node2.addFinder(new MemoryFinder());

    try {
      await node1.start();
      await node2.start();

      // await new Promise(resolve => setTimeout(resolve, 1000));

      await node1.connect(node2.advertisement.urls[0]);

      await new Promise(async (resolve, reject) => {
        try {
          node2.on('message', message => {
            try {
              assert.strictEqual(message.command, 'foo');
              assert.strictEqual(message.payload.toString(), 'bar');
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
      try { await node1.stop(); } catch (err) { /* noop */ }
      try { await node2.stop(); } catch (err) { /* noop */ }
    }
  });

  it('reconnecting', async () => {
    let node1 = new Node();
    let node2 = new Node();

    node1.addDialer(new SockJsDialer());
    node2.addReceiver(new SockJsReceiver());
    node1.addFinder(new MemoryFinder());
    node2.addFinder(new MemoryFinder());

    try {
      await node1.start();
      await node2.start();
      await node1.stop();
      await node1.start();

      // await node1.connect(node2.advertisement.urls[0]);

      await new Promise(async (resolve, reject) => {
        try {
          node2.on('message', message => {
            try {
              assert.strictEqual(message.command, 'foo');
              assert.strictEqual(message.payload.toString(), 'bar');
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
