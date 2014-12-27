/*
 * (C) 2014 Seth Lakowske
 */

var gitPull        = require('git-pull');
var git            = require('git-rev')
var createHandler  = require('github-webhook-handler');
var handler        = createHandler({ path: '/webhook', secret: 'myhashsecret' })
var WsStaticServer = require('websocket-express').WsStaticServer;
var bodyParser     = require('body-parser');

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

app.post('/pushreq', function(req,res) {
    console.log(req.headers);
    console.log(req.body);
/*
    //get our current branch
    git.branch(function (str) {
        console.log('branch', str)

        //pull the latest changes
        gitPull('./', function (err, consoleOutput) {
            if (err) {
                console.error("Error!", err, consoleOutput);
            } else {
                console.log("Success!", consoleOutput);
                process.exit(0);
            }
        });

    })

*/
    res.send('ok');

})

server.listen(3333);
