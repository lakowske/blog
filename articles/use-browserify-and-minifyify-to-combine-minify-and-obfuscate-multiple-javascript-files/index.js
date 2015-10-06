var prism = require('prismjs-package');
var triangles = require('webgl-triangles');

var frag = require('./fragment.c');
var vert = require('./vertex.c');

prism.highlightAll();

var body     = document.getElementsByTagName('body')[0];
triangles(body, vert, frag);
