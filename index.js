/*
 * (C) 2014 Seth Lakowske
 */

var gitPull        = require('git-pull');
var git            = require('git-rev')
var createHandler  = require('github-webhook-handler');
var http           = require('http');
var fs             = require('fs');

//the path(s) we want to serve
var path = __dirname + '/articles';

console.log(path);

var bodyFile = fs.createWriteStream('pushEvent.txt');

var server   = http.createServer(function(req, res) {
    req.pipe(bodyFile);
    req.on('end', function() {
      res.writeHead(200, {'content-type': 'text/plain'})
      res.write('got push event\n');
      res.end();
    });
})

server.listen(3333);
