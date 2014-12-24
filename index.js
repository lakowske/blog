/*
 * (C) 2014 Seth Lakowske
 */

var express = require('express');

var app = express();

var path = __dirname + '/articles';

console.log(path);

app.use(express.static(__dirname + '/articles'))

app.post('/pushreq', function(req,res) {
    console.log(req.body);
    res.send('ok');
})

app.listen(3333);

