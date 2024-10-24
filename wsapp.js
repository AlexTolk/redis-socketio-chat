var WebSocketServer = require('websocket').server;

module.exports = function (httpServer) {
  const wsServer = new WebSocketServer({
    httpServer,
    autoAcceptConnections: false,
  });
  let connections = [];
  let actions = {};
  let messages = [];

  function send(connection, type, payload) {
    connection.sendUTF(JSON.stringify({ type, payload }));
  }
  function sendAll(type, payload){
    for(let connection of connections){
        connection.sendUTF(JSON.stringify({ type, payload} ));
        // connection.sendUTF("message")
    }
  }

  
  actions['SEND_MESSAGE'] = (connection, payload) => {
    messages.push(payload);
    send(connection, 'OK', true);
  };

  actions['GET_MESSAGES'] = (connection) => {
    send(connection, 'REC_MESSAGES', messages);
  };

  actions['BROADCAST'] = (connection, payload) => {
    sendAll('BROADCAST', payload);
  };
  
  function originIsAllowed(origin) {
    return true;
  }

  wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log(new Date() + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection;
    if (request.requestedProtocols.length > 0) {
      connection = request.accept(request.requestedProtocols[0], request.origin);
    } else {
      connection = request.accept(null, request.origin);
    }
    console.log(new Date() + ' Connection accepted.');
    connections.push(connection);

    connection.on('message', function(message) {
      if (message.type !== 'utf8') return;
      try {
        let data = JSON.parse(message.utf8Data);
        console.log('Received Message: ' + message.utf8Data);
        const func = actions[data.type];
        if (func) func(connection, data.payload);
      } catch (error) {
        console.error('Error:', error);
      }
    });

    connection.on('close', function(reasonCode, description) {
        connections = connections.filter(conn => conn !== connection);
        console.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });
};
