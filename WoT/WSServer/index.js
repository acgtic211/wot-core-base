/*var WebSocketServer = require('websocket').server;
var http = require('http');

let clients = []; //Aqui hay que meter la gente que se conecta

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted. Device %s connected', connection.remoteAddress);
    console.log(request.resource);
    
    //Se guarda el remoteAddress de la conexion como key y la conexion en si como value. Cuando se reciba un mensaje la idea es que se mande de la forma
    //idRemota#mensaje siendo la idRemota la id de la conexión de la thing a la que queremos mandar el mensaje seguido del mensaje y separados ambos por un #

    if(!clients.find(e => e.key === connection.remoteAddress)){
        clients.push({'key': request.resource, 'value': connection});
        //clients.keys( e => console.log('key', e));
        clients.entries(e => console.log(e))
    }

    //console.log('clients', clients);

    connection.on('message', function(message) {
        console.log('Message', message.utf8Data);
        if (message.type === 'utf8') {
            let msgData = message.utf8Data.split("#");
            console.log(msgData);
            if(msgData[0] !== null && msgData[0] !== undefined) {
                let con = clients.find(e => e.key === msgData[0]);

                //console.log('con', con);
                
                if(con !== null && con !== undefined) {
                    console.log('data', msgData[1]);
                    con.value.sendUTF(msgData[1]);
                }
            }
            
        }
        else if (message.type === 'binary') {
            //NO IMPLEMENTADO
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        
        let index = clients.indexOf({'key': connection.remoteAddress, 'value': connection});

        clients.splice(index, 1);

        //console.log('Actual clients', clients);

    });
});
*/

var mqtt = require('mqtt');

let options = {
    protocolId: 'MQTT',
    protocolVersion: 5,
    connectTimeout: 5000,
    reconnectPeriod: 10000,
    keepalive: 5,
    resubscribe: false,
    rejectUnauthorized: false
};
var client = mqtt.connect('wss://acgsaas.ual.es:443/ws', options)

var i = 1;
client.on('connect', () => {
    console.log("connected " + i);
    i++;
})