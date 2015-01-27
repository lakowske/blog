/*
 * (C) 2014 Seth Lakowske
 */

var http           = require('http');
var alloc          = require('tcp-bind');
var router         = require('routes')();
var ecstatic       = require('ecstatic');
var minimist       = require('minimist');
var trumpet        = require('trumpet');
var fs             = require('fs');
var path           = require('path');
var articles       = require('./articles');

var argv           = minimist(process.argv.slice(2), {
    alias: { p: 'port', u: 'uid', g: 'gid' },
    defaults: { port: (require('is-root')() ? 80 : 8000) }
})

var fd = alloc(argv.port);
if (argv.gid) process.setgid(argv.gid);
if (argv.uid) process.setuid(argv.uid);

var Deployer       = require('github-webhook-deployer');

//the port we want to serve from is passed to us on the command line
var appPort        = parseInt(process.argv[2], 10);

//the mount point (i.e. url prefix to static content)
var mount          = '/static'

function read (file) {
    return fs.createReadStream(path.join(__dirname, 'articles', file));
}

function layout(res, params) {
    res.setHeader('content-type', 'text/html');
    var tr = trumpet();
    read('/' + params.article + '/index.html').pipe(tr).pipe(res);
    return tr.createWriteStream('#related');
}

router.addRoute('/articles/:article', function (req, res, params) {
    var pipe = layout(res, params);
    //pipe.end('hi');

    articles.toHTML(pipe);
});

var st     = ecstatic({
    root : __dirname + '/static',
    baseDir : mount,
})

var server = http.createServer(function(req, res) {

    var m = router.match(req.url);
    if (m) m.fn(req, res, m.params);
    else st(req, res);

});

server.listen({ fd: fd }, function () {
    console.log('listening on :' + server.address().port);
});

//deployment port listening for github push events
var deployerPort   = argv.port + 1;

//Create a github webhook deployer
var deployer = new Deployer({path:'/webhook', secret : 'testSecret'});
console.log('deployer listening on port ' + deployerPort);
deployer.listen(deployerPort);
