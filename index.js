/*
 * (C) 2014 Seth Lakowske
 */

var WsStaticServer = require('websocket-express').WsStaticServer;
var Deployer       = require('github-webhook-deployer');

//the port we want to serve from
var appPort        = parseInt(process.argv[2], 10);

//deployment port listening for github push events
var deployerPort   = appPort+1;

//the path(s) we want to serve
var path           = __dirname + '/articles';

//Create a github deployer
var deployer = new Deployer({path:'/webhook', secret : 'testSecret'});

console.log('listening on port ' + deployerPort);

deployer.listen(appPort+1);

//Create a static server with websockets
var server = new WsStaticServer({
    path   : path,
    wsPath : '/webSocket'
})

server.server.on('request', function(req, res) {

    if (req.url === '/related_articles') {
        res.send(JSON.stringify({'blah':'jah'}));
    }

})

console.log('listening on port ' + appPort);

server.listen(appPort);
