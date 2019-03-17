var net = require('net');

var BRIDGE_PORT = process.env.BRIDGE_PORT;
var BRIDGE_ADDR = process.env.BRIDGE_ADDR;
var GRAPHITE_ENABLE = process.env.GRAPHITE_ENABLE == "true";
var GRAPHITE_URL = process.env.GRAPHITE_URL;

const convert = (from, to) => str => Buffer.from(str, from).toString(to)
const utf8ToHex = convert('utf8', 'hex')
const hexToUtf8 = convert('hex', 'utf8')

var lastData = {};
var serviceSocket = new net.Socket();

function connect(){
  serviceSocket.connect(parseInt(BRIDGE_PORT), BRIDGE_ADDR, function () {
    console.log("Connected to RS485 Bridge.");
    sendDetailsReq();
  });
}

serviceSocket.on('close', function(e) {
  serviceSocket.setTimeout(10000, function() {
      connect();
  })
});

connect();

serviceSocket.on("data", function (msg) {
  console.log('>> From inverter: '+ utf8ToHex(msg));

  if (msg.length>0x1f){
    lastData['fv.gridVoltage'] = msg.readInt16BE(0x29);
    lastData['fv.outputPower'] = msg.readInt16BE(35);
    lastData['fv.gridCurrent'] = msg.readInt16BE(33)/100;
    lastData['fv.busVoltage'] = msg.readInt16BE(31);
    lastData['fv.photovoltaicModuleCurrent'] = msg.readInt16BE(29)/100;
    lastData['fv.photovoltaicModuleVoltage'] = msg.readInt16BE(27);
    lastData['fv.efficiency'] =
    lastData['fv.outputPower'] > 0 ?
      Math.round(
        ((100*lastData['fv.photovoltaicModuleCurrent']*
        lastData['fv.photovoltaicModuleVoltage'])/
        lastData['fv.outputPower']))/100
      : 0 ;
    lastData['fv.time'] = parseInt(Date.now()/1000);

    if (GRAPHITE_ENABLE){
      sendToGraphite();
    }
  }
});

function sendDetailsReq() {
  //get serial data etc: 0111c02c
  serviceSocket.write(Buffer.from("01040000001bb001", 'hex'));
}
setInterval(sendDetailsReq, 10000);//Poll inverter for new data every 10s.


var graphite = require('graphite');
var client;

function sendToGraphite(){
  if (typeof client === 'undefined'){
    client = graphite.createClient('plaintext://'+GRAPHITE_URL);
  }
  client.write(lastData, function(err) {
    if (err!=null) console.log(err);
  });
}

//WebServer
const http = require('http')

const requestHandler = (request, response) => {
  response.end(JSON.stringify(lastData));
}
const server = http.createServer(requestHandler)

server.listen(3000, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
})

console.log("RS485 Bridge is at "+BRIDGE_ADDR+":"+BRIDGE_PORT);
console.log("Graphite report is: " + (GRAPHITE_ENABLE ? "enabled" : "disabled") + " on URL: "+GRAPHITE_URL);
