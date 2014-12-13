/*
 * (C) 2014 Seth Lakowske
 */

var express = require('express');

var app = express();

var path = __dirname + '/articles';

console.log(path);

app.use(express.static(__dirname + '/articles'))

app.listen(8000);

