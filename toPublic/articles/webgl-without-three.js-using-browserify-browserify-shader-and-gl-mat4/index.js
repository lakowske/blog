/*
 * (C) 2015 Seth Lakowske
 */

var prism = require('prismjs-package');
var html = require('./3dify/3dify.html');

prism.highlightAll();
var code = document.getElementById('sample');
var page = prism.highlight(html, prism.languages.markup);
code.innerHTML = page;










