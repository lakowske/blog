/*
 * (C) 2015 Seth Lakowske
 */

var path      = require('path');
var find      = require('findit')
var hyperspace = require('hyperspace');


function articles(onFile, onEnd) {
   var finder = find('./articles');


    finder.on('directory', function (dir, stat, stop) {
        var base = path.basename(dir);
    });

    finder.on('file', function (file, stat) {
        onFile(file, stat);
    });

    finder.on('link', function (link, stat) {
        //console.log(link);
    });

    finder.on('end', onEnd);
}

var html = '<tr><td><a class="name"></a></td></tr>';

function asTable() {
    return hyperspace(html, function(doc) {
        return {
            'a.name' : {
                name : doc.name,
                href : doc.url,
                _text : doc.name
            }
        }
    });
}

function toHTML(pipe) {
    var linkStand = asTable();
    linkStand.pipe(pipe);
    var timeout = setTimeout(function() {
        pipe.end();
    }, 150);

    articles(function(file, stat) {
        var match = /html/.test(file)
        if (match) {
            file = path.dirname(file);
            file = path.basename(file);
            linkStand.write({name:file, url:'/related/' + file})
        }
        }, function() {
            //pipe.end();
        });
}

module.exports.articles = articles;
module.exports.toHTML   = toHTML;
module.exports.asTable  = asTable;
