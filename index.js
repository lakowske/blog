/*
 * (C) 2014 Seth Lakowske
 */

var WsStaticServer = require('websocket-express').WsStaticServer;
var Deployer       = require('github-webhook-deployer');

//the port we want to serve from
var appPort        = 3333

//the path(s) we want to serve
var path           = __dirname + '/articles';

//let the world know
console.log(path);

//Create a github deployer
var deployer = new Deployer({path:'/webhook', secret : 'testSecret'});
deployer.listen(appPort+1);

//Create a static server with websockets
var server = new WsStaticServer({
    path   : path,
    wsPath : '/webSocket'
})
server.listen(appPort);
