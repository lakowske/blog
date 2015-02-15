/*
 * (C) 2014 Seth Lakowske
 */

var fs             = require('fs');
var path           = require('path');
var http           = require('http');
var alloc          = require('tcp-bind');
var router         = require('routes')();
var ecstatic       = require('ecstatic');
var cookie         = require('cookie');
var minimist       = require('minimist');
var trumpet        = require('trumpet');
var level          = require('level');
var deployer       = require('github-webhook-deployer');
var articles       = require('blog-articles');
var logger         = require('http-request-logger');


//parse the cli arguments
var argv           = minimist(process.argv.slice(2), {
    alias: { p: 'port', u: 'uid', g: 'gid' },
    defaults: { port: (require('is-root')() ? 80 : 8000) }
})

if (argv.gid) process.setgid(argv.gid);
if (argv.uid) process.setuid(argv.uid);

//open the request db
var db = level('./request.db');
requestLogger = logger(db);
request       = requestLogger.request();

//the mount point (i.e. url prefix to static content)
var mount          = '/static'

var st     = ecstatic({
    root : __dirname + '/static',
    baseDir : mount,
})

var server = http.createServer(function(req, res) {
    //log the request
    request(req, res);

    var m = router.match(req.url);
    if (m) m.fn(req, res, m.params);
    else st(req, res);

}).listen(argv.port);

console.log(__dirname + '/articles');

articles('/articles', __dirname + '/articles', router, function() {
    server.listen(argv.port, function () {
        console.log('listening on :' + server.address().port);
    });
});

router.addRoute('/requests', requestLogger.requests());


//deployment port listening for github push events
var deployerPort   = argv.port + 1;

//Create a github webhook deployer

console.log('deployer listening on port ' + deployerPort);

var depServer = http.createServer(deployer({
    path:'/webhook',
    secret : 'testSecret'
})).listen(deployerPort);
