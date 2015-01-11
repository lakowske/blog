/*
 * (C) 2014 Seth Lakowske
 */

var WsStaticServer = require('websocket-express').WsStaticServer;
var Deployer       = require('github-webhook-deployer');

//the port we want to serve from
var appPort        = parseInt(process.argv[2], 10);

//the path(s) we want to serve
var path           = __dirname + '/articles';

//Create a github deployer
var deployer = new Deployer({path:'/webhook', secret : 'testSecret'});
deployer.listen(appPort+1);

//Create a static server with websockets
var server = new WsStaticServer({
    path   : path,
    wsPath : '/webSocket'
})

console.log('listening on port ' + appPort);

server.listen(appPort);
