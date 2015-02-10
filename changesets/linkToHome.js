/*
 * (C) 2015 Seth Lakowske
 */

var articles = require('blog-articles');
var trumpet  = require('trumpet');
var fs = require('fs')

var tr = trumpet();
tr.pipe(process.stdout);

var ws = tr.select('body > h3').createWriteStream();
ws.end('Posted by: <a href="sethlakowske.com">Seth Lakowske</a>');

fs.createReadStream('../articles/github-push-event-deployment/index.html').pipe(tr);
