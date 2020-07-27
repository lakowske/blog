
import ecstatic       = require('ecstatic');
import trumpet        = require('trumpet');
import nsh            = require('node-syntaxhighlighter');
import slurpSome      = require('slurp-some');

import fs             = require('fs');
import fse            = require('fs-extra');
import articles       = require('blog-articles');
import path           = require('path');
import routes         = require('routes');
import http           = require('http');

var slurp = slurpSome.slurp;
var router = routes();

fromCmdLine()
.then(getCachedArticles)
.then(v => {console.log(v); return Promise.resolve(v);})
.then(writeIndex)
.then(routeArticles)
.then(serveArticles)
.catch(err => {
  console.log(err)
});



function fromCmdLine() {
  if (typeof process.argv[2] === 'undefined') {
    return Promise.reject("Please provide a command");
  }

  if (typeof process.argv[3] === 'undefined') {
    return Promise.reject("Please provide a path to public articles");
  }

  var cmd = process.argv[2];

  if (typeof process.argv[3] === 'undefined') {
    return Promise.reject("Please provide a path to public articles");
  }

  var contentPath = path.normalize(process.argv[3]);

  //the mount point (i.e. url prefix to static content)
  var staticContent         = '/'
  
  //the relative path to a directory containing articles
  var pub : String = contentPath;
  var articleDir = pub;

  var st     = ecstatic({
    root : contentPath
  })  

  return Promise.resolve({
    public: contentPath, 
    articleDir: articleDir, 
    port: 8080, 
    router: router, 
    st: st, 
    cmd: cmd})
} 

function serveArticles(env) {

  if (env.cmd == 'serve') {
    console.log('attempting to listen on ' + env.port);
    var server = http.createServer(function(req, res) {
        console.info(req.method + ' ' + req.url);
        var m = env.router.match(req.url);
        if (m) m.fn(req, res, m.params);
        else env.st(req, res);
    }).listen(env.port);
  }
  
  return Promise.resolve(env);
}

function upload(req, res, params) {
  console.log(params);
}

function routeArticles(env) {
  //Add upload function
  env.router.addRoute('/upload', upload);

  //Apply url generation step
  var urls = env.discovered.map(function(article) {
    var url = article.url

    //Route the root of the page to /about
    if (article.url === '/about/') {
        routeArticle('/', article, env)
    }

    routeArticle(url, article, env)
  });

  return Promise.resolve(env);
}

/*
 * Add article to router and decorate with the articleFn
 */
function routeArticle(url, article, env) {
  //Generated url to respond to (could be multiple urls if desired)
  var type = article.type
  console.log(url, type, article.root);
  
  //Lamda to apply on url request
  env.router.addRoute(url, articleFn(env.discovered, article));

  return env;
}

/*
    Read an article, add related articles, append some style to each article and pipe it to
    the response.
*/
function articleFn(discovered, article) {

  return function(req, res, params) {
      var articleStream = fs.createReadStream(article.path);
      var related = articles.related(discovered);
      var type = article.type
      
      //Compose the article and pipe to response
      var syntaxCss      = append('head', '<link rel="stylesheet" type="text/css" href="/static/style/syntax.css">');
      var mobileViewport = append('head', '<meta name="viewport" content="width=device-width, initial-scale=1.0">')
      var transform      = mobileViewport
      
      if (!type.hasOwnProperty('prism')) {
          console.log('not a prism article');
          articleStream.pipe(related).pipe(mobileViewport).pipe(highlighter()).pipe(syntaxCss).pipe(res);
      } else {
          articleStream.pipe(related).pipe(transform).pipe(res);
      }
  }
}

/** Code highlighter */
function highlighter() {
  var langMap = {
      'language-bash' : 'bash',
      'language-javascript' : 'js',
      'language-glsl' : 'c'
  }

  var tr = trumpet();

  tr.selectAll('pre > code', function(code) {
      var codeClass = code.getAttributes()['class'];
      var langDesc = langMap[codeClass];
      
      if (typeof langDesc === 'undefined') {
          langDesc = 'plain';
      }

      var lang = nsh.getLanguage(langDesc);
      
      var rStream = code.createReadStream();
      var wStream = code.createWriteStream({outer:true});        
      slurp(rStream, 8096, function(err, content) {
          
          wStream.end(nsh.highlight(content, lang, {gutter:false}));
      })
  })
  
  return tr;
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

function cacheArticles(env) {
  return new Promise((resolve, reject) => {
      articles.articles(env.articleDir, env.public, function(discovered) {
          env.discovered = discovered;
          resolve(env);
      })
  })
}

function writeIndex(env) {
  return fse.writeFile('index.json', JSON.stringify(env.discovered)).then( _ => env);
}

function getIndexOrElse(env, onNoIndex) {
  return fse.stat('index.json').then(s => {
    console.debug('Found index.json');
    console.log(s)
    return fse.readFile('index.json', 'utf-8').then(JSON.parse).then(discovered => {
      env.discovered = discovered;
      return env;
    })
  }).catch(onNoIndex);
}

function getCachedArticles(env) {
  if (env.cmd == 'index') {
    return cacheArticles(env);
  }

  return getIndexOrElse(env, err => {
    console.log("Error couldn't find index.json")
    return cacheArticles(env);
  })
  
}


