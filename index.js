/*
 * (C) 2014 Seth Lakowske
 */

var fs             = require('fs');
var path           = require('path');
var http           = require('http');
var alloc          = require('tcp-bind');
var router         = require('routes')();
var ecstatic       = require('ecstatic');
var cookie         = require('cookie');
var minimist       = require('minimist');
var trumpet        = require('trumpet');
var deployer       = require('github-webhook-deployer');
var articles       = require('blog-articles');

//parse the cli arguments
var port   = parseInt(process.argv[2], 10);

//the mount point (i.e. url prefix to static content)
var mount          = '/static'

var st     = ecstatic({
    root : __dirname + '/static',
    baseDir : mount,
})

var server = http.createServer(function(req, res) {

    var m = router.match(req.url);
    if (m) m.fn(req, res, m.params);
    else st(req, res);

}).listen(port);

var articleDir = 'articles';
var mount      = '/articles';

//Get a set of discovered articles
articles.articles(articleDir, function(discovered) {

    //Apply url generation step
    var urls = discovered.map(function(article) {

        //Generated url to respond to (could be multiple urls if desired)
        var url = '/' + article.root;

        //Lamda to apply on url request
        router.addRoute(url, function(req, res, params) {
            var articleStream = fs.createReadStream(article.path);


            var related = articles.related(discovered);

            //Compose the article and pipe to response
            //articleStream.pipe(related).pipe(reqstats).pipe(res);
            articleStream.pipe(related).pipe(res);
        })

        return url;
    })

    server.listen(port, function () {
        console.log('listening on :' + server.address().port);
    });

})

//deployment port listening for github push events
var deployerPort   = port + 1;

//Create a github webhook deployer

console.log('deployer listening on port ' + deployerPort);

var depServer = http.createServer(deployer({
    path:'/webhook',
    secret : 'testSecret'
})).listen(deployerPort);
