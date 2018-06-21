module.exports = SocketBase => class Socket extends SocketBase {

  wsOptions () {
    return { path: '/ws' }
  }

  websocket (wss) {
    wss.on('connection', (ws, req) => {
      const msg = JSON.stringify({ payload: { cmd: 'GAME_STATUS', value: 'yes' } });
      ws.send(msg);
    });
  }

}
