/*
 * (C) 2014 Seth Lakowske
 */

var express    = require('express');
var bodyParser = require('body-parser');
var gitPull    = require('git-pull');

var app = express();

//we want to parse incoming POST json data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//the path(s) we want to serve
var path = __dirname + '/articles';

console.log(path);

app.use(express.static(__dirname + '/articles'))

app.post('/pushreq', function(req,res) {

    console.log(req.body);

    //pull the latest changes
    gitPull('./', function (err, consoleOutput) {
        if (err) {
            console.error("Error!", err, consoleOutput);
        } else {
            console.log("Success!", consoleOutput);
        }
    });

    res.send('ok');

    process.exit(0);
})

app.listen(3333);

