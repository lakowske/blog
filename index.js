/*
 * (C) 2014 Seth Lakowske
 */

var http           = require('http');
var fs             = require('fs');
var WsStaticServer = require('websocket-express').WsStaticServer;
//the port we want to serve from
var appPort = 3333

//the path(s) we want to serve
var path = __dirname + '/articles';

//let the world know
console.log(path);

//Create a static server with websockets
var server = new WsStaticServer({
    path   : 'path',
    wsPath : '/webSocket'
})

server.listen(appPort);
