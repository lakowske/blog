/*
 * (C) 2014 Seth Lakowske
 */

var gitPull        = require('git-pull');
var git            = require('git-rev')
var createHandler  = require('github-webhook-handler');
var handler        = createHandler({ path: '/webhook', secret: 'myhashsecret' })
var WsStaticServer = require('websocket-express').WsStaticServer;
var bodyParser     = require('body-parser');
var fs             = require('fs');

//the path(s) we want to serve
var path = __dirname + '/articles';

console.log(path);

var server = new WsStaticServer({
    path   : 'path',
    wsPath : '/webSocket'
})

var app = server.app;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var bodyFile = fs.createWriteStream('pushEvent.txt');

app.post('/pushreq', function(req,res) {
    console.log(req.headers);
    req.pipe(bodyFile);
    //console.log(req.body);
    res.send('ok');

})

server.listen(3333);
