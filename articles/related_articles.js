var http = require('http');


function loadArticles() {
    http.get({path : '/related_articles'}, function(res) {

        var div = document.getElementById('related_articles');
        div.innerHTML += 'GET /related_articles<br>';

        res.on('data', function(buf) {
            div.innerHTML += buf;
        });

        res.on('end', function() {
            div.innerHTML += '<br>__END__';
        })
    })

}
