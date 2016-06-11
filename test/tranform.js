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

    var tr = trumpet();

    tr.selectAll('code', function(code) {
        var codeClass = code.getAttributes()['class'];
        var lang = nsh.getLanguage(langMap[codeClass]);
        slurp(code.createReadStream(), 8096, function(err, content) {
            
            console.log('codeClass: ' + codeClass + '\nlang: ' + lang + '\ncontent: ' + content
                       + '\nhighlighted:' + nsh.highlight(content, lang));
            
        })
        //code.createReadStream().pipe(process.stdout);
    })

    var html = fs.createReadStream('../articles/howto-install-docker-kubernets-local-registry/index.html');
    html.pipe(tr);

    t.end();
    
})










