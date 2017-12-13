'use babel'

import AtomSocket from 'atom-socket'
import {EventEmitter} from 'events'

export default class Terminal {
  constructor(args={}) {
    this.emitter = new EventEmitter();

    this.host = args.host;
    this.port = args.port;
    this.path = args.path;
    // this.token = args.token;

    this.hasFailed = false;

    this.connect();
  }

  connect() {
    this.socket = new AtomSocket('environment' + Date.now(), this.url());

    this.waitForSocket = new Promise(((resolve, reject) => {
      this.socket.on('open', e => {
        this.emit('open', e)
        resolve()
      })

      this.socket.on('open:cached', e => {
        this.emit('open', e)
        resolve()
      })

      this.socket.on('message', (msg) => {
        // if (msg.slice(2,10) !== 'terminal') { return }

        // try {
        //   var {terminal} = JSON.parse(msg)
        // } catch ({message}) {
        //   console.error(`terminal parse error: ${message}`)
        //   return
        // }

        // var decoded = new Buffer(terminal, 'base64').toString()
        this.emit('message', msg)
      })

      this.socket.on('close', e => this.emit('close', e))

      this.socket.on('error', e => {
        console.log('error', e); // eslint-disable-line
        this.emit('error', e)
      })
    }));

    return this.waitForSocket
  }

  emit() {
    return this.emitter.emit.apply(this.emitter, arguments);
  }

  on() {
    return this.emitter.on.apply(this.emitter, arguments);
  }

  url() {
    var protocol = (this.port === 443) ? 'wss' : 'ws';
    return `${protocol}://${this.host}:${this.port}/${this.path}`;
  }

  reset() {
    return this.socket.reset();
  }

  send(msg) {
    // var encoded = new Buffer(msg).toString('base64')
    // var preparedMessage = JSON.stringify({terminal: encoded})
    if (this.waitForSocket != null ) {
      this.socket.send(msg)
      return
    }

    this.waitForSocket.then(() => {
      this.waitForSocket = null;
      this.socket.send(preparedMessage);
    });
  }

  toggleDebugger() {
    this.socket.toggleDebugger();
  }

  debugInfo() {
    return {
      host: this.host,
      port: this.port,
      path: this.path,
      // token: this.token,
      socket: this.socket
    };
  }
}
