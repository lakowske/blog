/*
 * (C) 2014 Seth Lakowske
 */

var http           = require('http');
var express        = require('express');
var Deployer       = require('github-webhook-deployer');

//the port we want to serve from is passed to us on the command line
var appPort        = parseInt(process.argv[2], 10);

//the mount point (i.e. url prefix to static content)
var mount          = '/articles'
//the path we want to serve
var path           = __dirname + mount;

//Create the blog server
var app = express();
app.use(mount, express.static(path));
var server = http.createServer(app);
console.log('web server listening on port ' + appPort);
server.listen(appPort);


//deployment port listening for github push events
var deployerPort   = appPort+1;

//Create a github webhook deployer
var deployer = new Deployer({path:'/webhook', secret : 'testSecret'});
console.log('deployer listening on port ' + deployerPort);
deployer.listen(deployerPort);
