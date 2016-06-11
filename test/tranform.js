var test = require('tape');
var trumpet = require('trumpet');
var fs = require('fs');
var nsh = require('node-syntaxhighlighter');
var slurp = require('slurp-some').slurp;

var langMap = {
    'language-bash' : 'bash',
    'language-javascript' : 'js'
}

test('can read html', function(t) {

    console.log(nsh.getStyles());
    
    var tr = trumpet();

    tr.selectAll('pre > code', function(code) {
        var codeClass = code.getAttributes()['class'];
        var lang = nsh.getLanguage(langMap[codeClass]);
        var stream = code.createStream({outer:true});
        slurp(stream, 8096, function(err, content) {
            
            //console.log('code: ' + code + '\ncodeClass: ' + codeClass + '\nlang: ' + lang + '\ncontent: ' + content
            //    + '\nhighlighted:' + nsh.highlight(content, lang));
            
            stream.end(nsh.highlight(content, lang));
        })
        //code.createReadStream().pipe(process.stdout);
    })

    var html = fs.createReadStream('../articles/howto-install-docker-kubernets-local-registry/index.html');
    html.pipe(tr).pipe(process.stdout);

    t.end();
    
})










