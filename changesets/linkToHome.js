/*
 * (C) 2015 Seth Lakowske
 */

var articles = require('blog-articles');
var trumpet  = require('trumpet');
var fs       = require('fs')
var walk     = require('walk');
var through  = require('through');

function inject() {
    var articleDir = '../articles';
    var walker     = walk.walk(articleDir);


    walker.on('file', function(root, stat, next) {

        var match = /index\.html/.test(stat.name);
        if (match) {
            var articlePath = root + '/' + stat.name;
            console.log(articlePath);

            transformFile(articlePath, updateLink());
        }

        next();
    })
}

function updateLink() {
    var tr = trumpet();
    var ws = tr.select('body > h3').createWriteStream();
    ws.end('Posted by: <a href="http://sethlakowske.com">Seth Lakowske</a>');

    return tr;
}

function transformFile(file, transform) {
    var rs = fs.createReadStream(file);
    var rand = Math.random() * 1E8;
    var tmpFile = Math.round(rand).toString();
    var ws = fs.createWriteStream(tmpFile);
    rs.pipe(transform).pipe(ws);

    ws.on('finish', function() {
        console.log('all done');
        fs.unlinkSync(file);
        fs.renameSync(tmpFile, file);
    })
}

inject();
