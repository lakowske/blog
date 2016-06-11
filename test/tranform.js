var test = require('tape');
var trumpet = require('trumpet');
var fs = require('fs');
var nsh = require('node-syntaxhighlighter');
var slurp = require('slurp-some').slurp;

var langMap = {
    'language-bash' : 'bash',
    'language-javascript' : 'js'
}

function append(selector, string) {
    var tr = trumpet();

    tr.selectAll(selector, function(code) {
        
        var stream = code.createStream();
        
        slurp(stream, 8096, function(err, content) {
            stream.end(content + string);
        })
        
    })
    
    return tr;
}

test('can read html', function(t) {


    
    var tr = trumpet();

    tr.selectAll('pre > code', function(code) {
        var codeClass = code.getAttributes()['class'];
        var lang = nsh.getLanguage(langMap[codeClass]);
        var stream = code.createStream({outer:true});
        slurp(stream, 8096, function(err, content) {
            
            stream.end(nsh.highlight(content, lang));
        })
        //code.createReadStream().pipe(process.stdout);
    })

    var html = fs.createReadStream('../articles/howto-install-docker-kubernets-local-registry/index.html');
    //html.pipe(tr).pipe(process.stdout);

    t.end();
    
})

test('can append to tag', function(t) {

    console.log(nsh.getStyles());
    var defaults = nsh.filter(style => style.name === 'default').map( style => style.sourcePath );
    console.log(defaults);
    var tr = append('head', '<link rel="stylesheet" type="text/css" href="/static/bundles/triangles/style.css">');
    var html = fs.createReadStream('../articles/howto-install-docker-kubernets-local-registry/index.html');
    html.pipe(tr).pipe(process.stdout);

    t.end();


})












