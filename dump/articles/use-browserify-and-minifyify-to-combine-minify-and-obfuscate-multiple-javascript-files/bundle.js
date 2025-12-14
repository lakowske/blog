(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/fragment.c":[function(require,module,exports){
module.exports = function parse(params){
      var template = "precision mediump float; \n" +
" \n" +
"uniform vec4 u_color; \n" +
" \n" +
"void main() { \n" +
" \n" +
"  // convert the rectangle from pixels to 0.0 to 1.0 \n" +
"  gl_FragColor = u_color; \n" +
" \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],"/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/index.js":[function(require,module,exports){
var prism = require('prismjs-package');
var triangles = require('webgl-triangles');

var frag = require('./fragment.c');
var vert = require('./vertex.c');

prism.highlightAll();

var body     = document.getElementsByTagName('body')[0];
triangles(body, vert, frag);

},{"./fragment.c":"/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/fragment.c","./vertex.c":"/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/vertex.c","prismjs-package":"/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/node_modules/prismjs-package/prism.js","webgl-triangles":"/Users/home/javascript/webgl-triangles/index.js"}],"/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/node_modules/prismjs-package/prism.js":[function(require,module,exports){
(function (global){
var prism = function (self, window) {

/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

var _ = _self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					// Check for existence for IE8
					return o.map && o.map(function(v) { return _.util.clone(v); });
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];
			
			if (arguments.length == 2) {
				insert = arguments[1];
				
				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}
				
				return grammar;
			}
			
			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}
			
			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === root[inside] && key != inside) {
					this[key] = ret;
				}
			});

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type) {
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object') {
						_.languages.DFS(o[i], callback);
					}
					else if (_.util.type(o[i]) === 'Array') {
						_.languages.DFS(o[i], callback, i);
					}
				}
			}
		}
	},
	plugins: {},
	
	highlightAll: function(async, callback) {
		var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1];
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		if (!code || !grammar) {
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = Token.stringify(JSON.parse(evt.data), language);

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					lookbehindLength = 0,
					alias = pattern.alias;

				pattern = pattern.pattern || pattern;

				for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str);

					if (match) {
						if(lookbehind) {
							lookbehindLength = match[1].length;
						}

						var from = match.index - 1 + lookbehindLength,
							match = match[0].slice(lookbehindLength),
							len = match.length,
							to = from + len,
							before = str.slice(0, from + 1),
							after = str.slice(to + 1);

						var args = [i, 1];

						if (before) {
							args.push(before);
						}

						var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias);

						args.push(wrapped);

						if (after) {
							args.push(after);
						}

						Array.prototype.splice.apply(strarr, args);
					}
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias) {
	this.type = type;
	this.content = content;
	this.alias = alias;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = '';

	for (var name in env.attributes) {
		attributes += (attributes ? ' ' : '') + name + '="' + (env.attributes[name] || '') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}
 	// In worker
	_self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code,
			immediateClose = message.immediateClose;

		_self.postMessage(JSON.stringify(_.util.encode(_.tokenize(code, _.languages[lang]))));
		if (immediateClose) {
			_self.close();
		}
	}, false);

	return _self.Prism;
}

// Get current script and highlight
var script = document.getElementsByTagName('script');

script = script[script.length - 1];

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		document.addEventListener('DOMContentLoaded', _.highlightAll);
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-yaml.js
********************************************** */

Prism.languages.yaml = {
	'scalar': {
		pattern: /([\-:]\s*(![^\s]+)?[ \t]*[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)[^\r\n]+(?:\3[^\r\n]+)*)/,
		lookbehind: true,
		alias: 'string'
	},
	'comment': /#.*/,
	'key': {
		pattern: /(\s*[:\-,[{\r\n?][ \t]*(![^\s]+)?[ \t]*)[^\r\n{[\]},#]+?(?=\s*:\s)/,
		lookbehind: true,
		alias: 'atrule'
	},
	'directive': {
		pattern: /(^[ \t]*)%.+/m,
		lookbehind: true,
		alias: 'important'
	},
	'datetime': {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)(\d{4}-\d\d?-\d\d?([tT]|[ \t]+)\d\d?:\d{2}:\d{2}(\.\d*)?[ \t]*(Z|[-+]\d\d?(:\d{2})?)?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(:\d{2}(\.\d*)?)?)(?=[ \t]*($|,|]|}))/m,
		lookbehind: true,
		alias: 'number'
	},
	'boolean': {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)(true|false)[ \t]*(?=$|,|]|})/im,
		lookbehind: true,
		alias: 'important'
	},
	'null': {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)(null|~)[ \t]*(?=$|,|]|})/im,
		lookbehind: true,
		alias: 'important'
	},
	'string': {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(?=[ \t]*($|,|]|}))/m,
		lookbehind: true
	},
	'number': {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)[+\-]?(0x[\da-f]+|0o[0-7]+|(\d+\.?\d*|\.?\d+)(e[\+\-]?\d+)?|\.inf|\.nan)[ \t]*(?=$|,|]|})/im,
		lookbehind: true
	},
	'tag': /![^\s]+/,
	'important': /[&*][\w]+/,
	'punctuation': /---|[:[\]{}\-,|>?]|\.\.\./
};


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/,
	'prolog': /<\?[\w\W]+?\?>/,
	'doctype': /<!DOCTYPE[\w\W]+?>/,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?[^\s>\/=.]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
				inside: {
					'punctuation': /[=>"']/
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-wiki.js
********************************************** */

Prism.languages.wiki = Prism.languages.extend('markup', {
	'block-comment': {
		pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
		lookbehind: true,
		alias: 'comment'
	},
	'heading': {
		pattern: /^(=+).+?\1/m,
		inside: {
			'punctuation': /^=+|=+$/,
			'important': /.+/
		}
	},
	'emphasis': {
		// TODO Multi-line
		pattern: /('{2,5}).+?\1/,
		inside: {
			'bold italic': {
				pattern: /(''''').+?(?=\1)/,
				lookbehind: true
			},
			'bold': {
				pattern: /(''')[^'](?:.*?[^'])?(?=\1)/,
				lookbehind: true
			},
			'italic': {
				pattern: /('')[^'](?:.*?[^'])?(?=\1)/,
				lookbehind: true
			},
			'punctuation': /^''+|''+$/
		}
	},
	'hr': {
		pattern: /^-{4,}/m,
		alias: 'punctuation'
	},
	'url': [
		/ISBN +(?:97[89][ -]?)?(?:\d[ -]?){9}[\dx]\b|(?:RFC|PMID) +\d+/i,
		/\[\[.+?\]\]|\[.+?\]/
	],
	'variable': [
		/__[A-Z]+__/,
		// FIXME Nested structures should be handled
		// {{formatnum:{{#expr:{{{3}}}}}}}
		/\{{3}.+?\}{3}/,
		/\{\{.+?}}/
	],
	'symbol': [
		/^#redirect/im,
		/~{3,5}/
	],
	// Handle table attrs:
	// {|
	// ! style="text-align:left;"| Item
	// |}
	'table-tag': {
		pattern: /((?:^|[|!])[|!])[^|\r\n]+\|(?!\|)/m,
		lookbehind: true,
		inside: {
			'table-bar': {
				pattern: /\|$/,
				alias: 'punctuation'
			},
			rest: Prism.languages.markup['tag'].inside
		}
	},
	'punctuation': /^(?:\{\||\|\}|\|-|[*#:;!|])|\|\||!!/m
});

Prism.languages.insertBefore('wiki', 'tag', {
	// Prevent highlighting inside <nowiki>, <source> and <pre> tags
	'nowiki': {
		pattern: /<(nowiki|pre|source)\b[\w\W]*?>[\w\W]*?<\/\1>/i,
		inside: {
			'tag': {
				pattern: /<(?:nowiki|pre|source)\b[\w\W]*?>|<\/(?:nowiki|pre|source)>/i,
				inside: Prism.languages.markup['tag'].inside
			}
		}
	}
});


/* **********************************************
     Begin prism-vhdl.js
********************************************** */

Prism.languages.vhdl = {
	'comment': /--.+/,
	// support for all logic vectors
	'vhdl-vectors': {
		'pattern': /\b[oxb]"[\da-f_]+"|"[01uxzwlh-]+"/i,
		'alias': 'number'
	},
	// support for operator overloading included
	'quoted-function': {
		pattern: /"\S+?"(?=\()/,
		alias: 'function'
	},
	'string': /"(?:[^\\\r\n]|\\?(?:\r\n|[\s\S]))*?"/,
	'constant': /\b(?:use|library)\b/i,
	// support for predefined attributes included
	'keyword': /\b(?:'active|'ascending|'base|'delayed|'driving|'driving_value|'event|'high|'image|'instance_name|'last_active|'last_event|'last_value|'left|'leftof|'length|'low|'path_name|'pos|'pred|'quiet|'range|'reverse_range|'right|'rightof|'simple_name|'stable|'succ|'transaction|'val|'value|access|after|alias|all|architecture|array|assert|attribute|begin|block|body|buffer|bus|case|component|configuration|constant|disconnect|downto|else|elsif|end|entity|exit|file|for|function|generate|generic|group|guarded|if|impure|in|inertial|inout|is|label|library|linkage|literal|loop|map|new|next|null|of|on|open|others|out|package|port|postponed|procedure|process|pure|range|record|register|reject|report|return|select|severity|shared|signal|subtype|then|to|transport|type|unaffected|units|until|use|variable|wait|when|while|with)\b/i,
	'boolean': /\b(?:true|false)\b/i,
	'function': /[a-z0-9_]+(?=\()/i,
	// decimal, based, physical, and exponential numbers supported
	'number': /'[01uxzwlh-]'|\b(?:\d+#[\da-f_.]+#|\d[\d_.]*)(?:e[-+]?\d+)?/i,
	'operator': /[<>]=?|:=|[-+*/&=]|\b(?:abs|not|mod|rem|sll|srl|sla|sra|rol|ror|and|or|nand|xnor|xor|nor)\b/i,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-verilog.js
********************************************** */

Prism.languages.verilog = {
  'comment': /\/\/.*|\/\*[\w\W]*?\*\//,
  'string': /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
  // support for any kernel function (ex: $display())
  'property': /\B\$\w+\b/,
  // support for user defined constants (ex: `define)
  'constant': /\B`\w+\b/,
  'function': /[a-z\d_]+(?=\()/i,
  // support for verilog and system verilog keywords
  'keyword': /\b(?:alias|and|assert|assign|assume|automatic|before|begin|bind|bins|binsof|bit|break|buf|bufif0|bufif1|byte|class|case|casex|casez|cell|chandle|clocking|cmos|config|const|constraint|context|continue|cover|covergroup|coverpoint|cross|deassign|default|defparam|design|disable|dist|do|edge|else|end|endcase|endclass|endclocking|endconfig|endfunction|endgenerate|endgroup|endinterface|endmodule|endpackage|endprimitive|endprogram|endproperty|endspecify|endsequence|endtable|endtask|enum|event|expect|export|extends|extern|final|first_match|for|force|foreach|forever|fork|forkjoin|function|generate|genvar|highz0|highz1|if|iff|ifnone|ignore_bins|illegal_bins|import|incdir|include|initial|inout|input|inside|instance|int|integer|interface|intersect|join|join_any|join_none|large|liblist|library|local|localparam|logic|longint|macromodule|matches|medium|modport|module|nand|negedge|new|nmos|nor|noshowcancelled|not|notif0|notif1|null|or|output|package|packed|parameter|pmos|posedge|primitive|priority|program|property|protected|pull0|pull1|pulldown|pullup|pulsestyle_onevent|pulsestyle_ondetect|pure|rand|randc|randcase|randsequence|rcmos|real|realtime|ref|reg|release|repeat|return|rnmos|rpmos|rtran|rtranif0|rtranif1|scalared|sequence|shortint|shortreal|showcancelled|signed|small|solve|specify|specparam|static|string|strong0|strong1|struct|super|supply0|supply1|table|tagged|task|this|throughout|time|timeprecision|timeunit|tran|tranif0|tranif1|tri|tri0|tri1|triand|trior|trireg|type|typedef|union|unique|unsigned|use|uwire|var|vectored|virtual|void|wait|wait_order|wand|weak0|weak1|while|wildcard|wire|with|within|wor|xnor|xor)\b/,
  // bold highlighting for all verilog and system verilog logic blocks
  'important': /\b(?:always_latch|always_comb|always_ff|always)\b ?@?/,
  // support for time ticks, vectors, and real numbers
  'number': /\B##?\d+|(?:\b\d+)?'[odbh] ?[\da-fzx_?]+|\b\d*[._]?\d+(?:e[-+]?\d+)?/i,
  'operator': /[-+{}^~%*\/?=!<>&|]+/,
  'punctuation': /[[\];(),.:]/
};

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'string': /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true
	}
});

Prism.languages.insertBefore('javascript', 'class-name', {
	'template-string': {
		pattern: /`(?:\\`|\\?[^`])*`/,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /<script[\w\W]*?>[\w\W]*?<\/script>/i,
			inside: {
				'tag': {
					pattern: /<script[\w\W]*?>|<\/script>/i,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.javascript
			},
			alias: 'language-javascript'
		}
	});
}

Prism.languages.js = Prism.languages.javascript;

/* **********************************************
     Begin prism-typescript.js
********************************************** */

Prism.languages.typescript = Prism.languages.extend('javascript', {
	'keyword': /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield|module|declare|constructor|string|Function|any|number|boolean|Array|enum)\b/
});


/* **********************************************
     Begin prism-twig.js
********************************************** */

Prism.languages.twig = {
	'comment': /\{#[\s\S]*?#\}/,
	'tag': {
		pattern: /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/,
		inside: {
			'ld': {
				pattern: /^(?:\{\{\-?|\{%\-?\s*\w+)/,
				inside: {
					'punctuation': /^(?:\{\{|\{%)\-?/,
					'keyword': /\w+/
				}
			},
			'rd': {
				pattern: /\-?(?:%\}|\}\})$/,
				inside: {
					'punctuation': /.*/
				}
			},
			'string': {
				pattern: /("|')(?:\\?.)*?\1/,
				inside: {
					'punctuation': /^['"]|['"]$/
				}
			},
			'keyword': /\b(?:even|if|odd)\b/,
			'boolean': /\b(?:true|false|null)\b/,
			'number': /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+([Ee][-+]?\d+)?)\b/,
			'operator': [
				{
					pattern: /(\s)(?:and|b\-and|b\-xor|b\-or|ends with|in|is|matches|not|or|same as|starts with)(?=\s)/,
					lookbehind: true
				},
				/[=<>]=?|!=|\*\*?|\/\/?|\?:?|[-+~%|]/
			],
			'property': /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
			'punctuation': /[()\[\]{}:.,]/
		}
	},

	// The rest can be parsed as HTML
	'other': {
		// We want non-blank matches
		pattern: /\S(?:[\s\S]*\S)?/,
		inside: Prism.languages.markup
	}
};


/* **********************************************
     Begin prism-textile.js
********************************************** */

(function(Prism) {
	// We don't allow for pipes inside parentheses
	// to not break table pattern |(. foo |). bar |
	var modifierRegex = '(?:\\([^|)]+\\)|\\[[^\\]]+\\]|\\{[^}]+\\})+';
	var modifierTokens = {
		'css': {
			pattern: /\{[^}]+\}/,
			inside: {
				rest: Prism.languages.css
			}
		},
		'class-id': {
			pattern: /(\()[^)]+(?=\))/,
			lookbehind: true,
			alias: 'attr-value'
		},
		'lang': {
			pattern: /(\[)[^\]]+(?=\])/,
			lookbehind: true,
			alias: 'attr-value'
		},
		// Anything else is punctuation (the first pattern is for row/col spans inside tables)
		'punctuation': /[\\\/]\d+|\S/
	};


	Prism.languages.textile = Prism.languages.extend('markup', {
		'phrase': {
			pattern: /(^|\r|\n)\S[\s\S]*?(?=$|\r?\n\r?\n|\r\r)/,
			lookbehind: true,
			inside: {

				// h1. Header 1
				'block-tag': {
					pattern: RegExp('^[a-z]\\w*(?:' + modifierRegex + '|[<>=()])*\\.'),
					inside: {
						'modifier': {
							pattern: RegExp('(^[a-z]\\w*)(?:' + modifierRegex + '|[<>=()])+(?=\\.)'),
							lookbehind: true,
							inside: Prism.util.clone(modifierTokens)
						},
						'tag': /^[a-z]\w*/,
						'punctuation': /\.$/
					}
				},

				// # List item
				// * List item
				'list': {
					pattern: RegExp('^[*#]+(?:' + modifierRegex + ')?\\s+.+', 'm'),
					inside: {
						'modifier': {
							pattern: RegExp('(^[*#]+)' + modifierRegex),
							lookbehind: true,
							inside: Prism.util.clone(modifierTokens)
						},
						'punctuation': /^[*#]+/
					}
				},

				// | cell | cell | cell |
				'table': {
					// Modifiers can be applied to the row: {color:red}.|1|2|3|
					// or the cell: |{color:red}.1|2|3|
					pattern: RegExp('^(?:(?:' + modifierRegex + '|[<>=()^~])+\\.\\s*)?(?:\\|(?:(?:' + modifierRegex + '|[<>=()^~_]|[\\\\/]\\d+)+\\.)?[^|]*)+\\|', 'm'),
					inside: {
						'modifier': {
							// Modifiers for rows after the first one are
							// preceded by a pipe and a line feed
							pattern: RegExp('(^|\\|(?:\\r?\\n|\\r)?)(?:' + modifierRegex + '|[<>=()^~_]|[\\\\/]\\d+)+(?=\\.)'),
							lookbehind: true,
							inside: Prism.util.clone(modifierTokens)
						},
						'punctuation': /\||^\./
					}
				},

				'inline': {
					pattern: RegExp('(\\*\\*|__|\\?\\?|[*_%@+\\-^~])(?:' + modifierRegex + ')?.+?\\1'),
					inside: {
						// Note: superscripts and subscripts are not handled specifically

						// *bold*, **bold**
						'bold': {
							pattern: RegExp('((^\\*\\*?)(?:' + modifierRegex + ')?).+?(?=\\2)'),
							lookbehind: true
						},

						// _italic_, __italic__
						'italic': {
							pattern: RegExp('((^__?)(?:' + modifierRegex + ')?).+?(?=\\2)'),
							lookbehind: true
						},

						// ??cite??
						'cite': {
							pattern: RegExp('(^\\?\\?(?:' + modifierRegex + ')?).+?(?=\\?\\?)'),
							lookbehind: true,
							alias: 'string'
						},

						// @code@
						'code': {
							pattern: RegExp('(^@(?:' + modifierRegex + ')?).+?(?=@)'),
							lookbehind: true,
							alias: 'keyword'
						},

						// +inserted+
						'inserted': {
							pattern: RegExp('(^\\+(?:' + modifierRegex + ')?).+?(?=\\+)'),
							lookbehind: true
						},

						// -deleted-
						'deleted': {
							pattern: RegExp('(^-(?:' + modifierRegex + ')?).+?(?=-)'),
							lookbehind: true
						},

						// %span%
						'span': {
							pattern: RegExp('(^%(?:' + modifierRegex + ')?).+?(?=%)'),
							lookbehind: true
						},

						'modifier': {
							pattern: RegExp('(^\\*\\*|__|\\?\\?|[*_%@+\\-^~])' + modifierRegex),
							lookbehind: true,
							inside: Prism.util.clone(modifierTokens)
						},
						'punctuation': /[*_%?@+\-^~]+/
					}
				},

				// [alias]http://example.com
				'link-ref': {
					pattern: /^\[[^\]]+\]\S+$/m,
					inside: {
						'string': {
							pattern: /(\[)[^\]]+(?=\])/,
							lookbehind: true
						},
						'url': {
							pattern: /(\])\S+$/,
							lookbehind: true
						},
						'punctuation': /[\[\]]/
					}
				},

				// "text":http://example.com
				// "text":link-ref
				'link': {
					pattern: RegExp('"(?:' + modifierRegex + ')?[^"]+":.+?(?=[^\\w/]?(?:\\s|$))'),
					inside: {
						'text': {
							pattern: RegExp('(^"(?:' + modifierRegex + ')?)[^"]+(?=")'),
							lookbehind: true
						},
						'modifier': {
							pattern: RegExp('(^")' + modifierRegex),
							lookbehind: true,
							inside: Prism.util.clone(modifierTokens)
						},
						'url': {
							pattern: /(:).+/,
							lookbehind: true
						},
						'punctuation': /[":]/
					}
				},

				// !image.jpg!
				// !image.jpg(Title)!:http://example.com
				'image': {
					pattern: RegExp('!(?:' + modifierRegex + '|[<>=()])*[^!\\s()]+(?:\\([^)]+\\))?!(?::.+?(?=[^\\w/]?(?:\\s|$)))?'),
					inside: {
						'source': {
							pattern: RegExp('(^!(?:' + modifierRegex + '|[<>=()])*)[^!\\s()]+(?:\\([^)]+\\))?(?=!)'),
							lookbehind: true,
							alias: 'url'
						},
						'modifier': {
							pattern: RegExp('(^!)(?:' + modifierRegex + '|[<>=()])+'),
							lookbehind: true,
							inside: Prism.util.clone(modifierTokens)
						},
						'url': {
							pattern: /(:).+/,
							lookbehind: true
						},
						'punctuation': /[!:]/
					}
				},

				// Footnote[1]
				'footnote': {
					pattern: /\b\[\d+\]/,
					alias: 'comment',
					inside: {
						'punctuation': /\[|\]/
					}
				},

				// CSS(Cascading Style Sheet)
				'acronym': {
					pattern: /\b[A-Z\d]+\([^)]+\)/,
					inside: {
						'comment': {
							pattern: /(\()[^)]+(?=\))/,
							lookbehind: true
						},
						'punctuation': /[()]/
					}
				},

				// Prism(C)
				'mark': {
					pattern: /\b\((TM|R|C)\)/,
					alias: 'comment',
					inside: {
						'punctuation':/[()]/
					}
				}
			}
		}
	});

	var nestedPatterns = {
		'inline': Prism.util.clone(Prism.languages.textile['phrase'].inside['inline']),
		'link': Prism.util.clone(Prism.languages.textile['phrase'].inside['link']),
		'image': Prism.util.clone(Prism.languages.textile['phrase'].inside['image']),
		'footnote': Prism.util.clone(Prism.languages.textile['phrase'].inside['footnote']),
		'acronym': Prism.util.clone(Prism.languages.textile['phrase'].inside['acronym']),
		'mark': Prism.util.clone(Prism.languages.textile['phrase'].inside['mark'])
	};

	// Allow some nesting
	Prism.languages.textile['phrase'].inside['inline'].inside['bold'].inside = nestedPatterns;
	Prism.languages.textile['phrase'].inside['inline'].inside['italic'].inside = nestedPatterns;
	Prism.languages.textile['phrase'].inside['inline'].inside['inserted'].inside = nestedPatterns;
	Prism.languages.textile['phrase'].inside['inline'].inside['deleted'].inside = nestedPatterns;
	Prism.languages.textile['phrase'].inside['inline'].inside['span'].inside = nestedPatterns;

	// Allow some styles inside table cells
	Prism.languages.textile['phrase'].inside['table'].inside['inline'] = nestedPatterns['inline'];
	Prism.languages.textile['phrase'].inside['table'].inside['link'] = nestedPatterns['link'];
	Prism.languages.textile['phrase'].inside['table'].inside['image'] = nestedPatterns['image'];
	Prism.languages.textile['phrase'].inside['table'].inside['footnote'] = nestedPatterns['footnote'];
	Prism.languages.textile['phrase'].inside['table'].inside['acronym'] = nestedPatterns['acronym'];
	Prism.languages.textile['phrase'].inside['table'].inside['mark'] = nestedPatterns['mark'];

}(Prism));

/* **********************************************
     Begin prism-tcl.js
********************************************** */

Prism.languages.tcl = {
	'comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true
	},
	'string': /"(?:[^"\\\r\n]|\\(?:\r\n|[\s\S]))*"/,
	'variable': [
		{
			pattern: /(\$)(?:::)?(?:[a-zA-Z0-9]+::)*[a-zA-Z0-9_]+/,
			lookbehind: true
		},
		{
			pattern: /(\$){[^}]+}/,
			lookbehind: true
		},
		{
			pattern: /(^\s*set[ \t]+)(?:::)?(?:[a-zA-Z0-9]+::)*[a-zA-Z0-9_]+/m,
			lookbehind: true
		}
	],
	'function': {
		pattern: /(^\s*proc[ \t]+)[^\s]+/m,
		lookbehind: true
	},
	'builtin': [
		{
			pattern: /(^\s*)(?:proc|return|class|error|eval|exit|for|foreach|if|switch|while|break|continue)\b/m,
			lookbehind: true
		},
		/\b(elseif|else)\b/
	],
	'scope': {
		pattern: /(^\s*)(global|upvar|variable)\b/m,
		lookbehind: true,
		alias: 'constant'
	},
	'keyword': {
		pattern: /(^\s*|\[)(after|append|apply|array|auto_(?:execok|import|load|mkindex|qualify|reset)|automkindex_old|bgerror|binary|catch|cd|chan|clock|close|concat|dde|dict|encoding|eof|exec|expr|fblocked|fconfigure|fcopy|file(?:event|name)?|flush|gets|glob|history|http|incr|info|interp|join|lappend|lassign|lindex|linsert|list|llength|load|lrange|lrepeat|lreplace|lreverse|lsearch|lset|lsort|math(?:func|op)|memory|msgcat|namespace|open|package|parray|pid|pkg_mkIndex|platform|puts|pwd|re_syntax|read|refchan|regexp|registry|regsub|rename|Safe_Base|scan|seek|set|socket|source|split|string|subst|Tcl|tcl(?:_endOfWord|_findLibrary|startOf(?:Next|Previous)Word|wordBreak(?:After|Before)|test|vars)|tell|time|tm|trace|unknown|unload|unset|update|uplevel|vwait)\b/m,
		lookbehind: true
	},
	'operator': /!=?|\*\*?|==|&&?|\|\|?|<[=<]?|>[=>]?|[-+~\/%?^]|\b(?:eq|ne|in|ni)\b/,
	'punctuation': /[{}()\[\]]/
};


/* **********************************************
     Begin prism-swift.js
********************************************** */

// issues: nested multiline comments
Prism.languages.swift = Prism.languages.extend('clike', {
	'string': {
		pattern: /("|')(\\(?:\((?:[^()]|\([^)]+\))+\)|\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		inside: {
			'interpolation': {
				pattern: /\\\((?:[^()]|\([^)]+\))+\)/,
				inside: {
					delimiter: {
						pattern: /^\\\(|\)$/,
						alias: 'variable'
					}
					// See rest below
				}
			}
		}
	},
	'keyword': /\b(as|associativity|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic(?:Type)?|else|enum|extension|fallthrough|final|for|func|get|guard|if|import|in|infix|init|inout|internal|is|lazy|left|let|mutating|new|none|nonmutating|operator|optional|override|postfix|precedence|prefix|private|Protocol|public|repeat|required|rethrows|return|right|safe|self|Self|set|static|struct|subscript|super|switch|throws?|try|Type|typealias|unowned|unsafe|var|weak|where|while|willSet|__(?:COLUMN__|FILE__|FUNCTION__|LINE__))\b/,
	'number': /\b([\d_]+(\.[\de_]+)?|0x[a-f0-9_]+(\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,
	'constant': /\b(nil|[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,
	'atrule': /@\b(IB(?:Outlet|Designable|Action|Inspectable)|class_protocol|exported|noreturn|NS(?:Copying|Managed)|objc|UIApplicationMain|auto_closure)\b/,
	'builtin': /\b([A-Z]\S+|abs|advance|alignof(?:Value)?|assert|contains|count(?:Elements)?|debugPrint(?:ln)?|distance|drop(?:First|Last)|dump|enumerate|equal|filter|find|first|getVaList|indices|isEmpty|join|last|lexicographicalCompare|map|max(?:Element)?|min(?:Element)?|numericCast|overlaps|partition|print(?:ln)?|reduce|reflect|reverse|sizeof(?:Value)?|sort(?:ed)?|split|startsWith|stride(?:of(?:Value)?)?|suffix|swap|toDebugString|toString|transcode|underestimateCount|unsafeBitCast|with(?:ExtendedLifetime|Unsafe(?:MutablePointers?|Pointers?)|VaList))\b/
});
Prism.languages.swift['string'].inside['interpolation'].inside.rest = Prism.util.clone(Prism.languages.swift);

/* **********************************************
     Begin prism-stylus.js
********************************************** */

(function (Prism) {
	var inside = {
		'url': /url\((["']?).*?\1\)/i,
		'string': /("|')(?:[^\\\r\n]|\\(?:\r\n|[\s\S]))*?\1/,
		'interpolation': null, // See below
		'func': null, // See below
		'important': /\B!(?:important|optional)\b/i,
		'keyword': {
			pattern: /(^|\s+)(?:(?:if|else|for|return|unless)(?=\s+|$)|@[\w-]+)/,
			lookbehind: true
		},
		'hexcode': /#[\da-f]{3,6}/i,
		'number': /\b\d+(?:\.\d+)?%?/,
		'boolean': /\b(?:true|false)\b/,
		'operator': [
			// We want non-word chars around "-" because it is
			// accepted in property names.
			/~|[+!\/%<>?=]=?|[-:]=|\*[*=]?|\.+|&&|\|\||\B-\B|\b(?:and|in|is(?: a| defined| not|nt)?|not|or)\b/
		],
		'punctuation': /[{}()\[\];:,]/
	};

	inside['interpolation'] = {
		pattern: /\{[^\r\n}:]+\}/,
		alias: 'variable',
		inside: Prism.util.clone(inside)
	};
	inside['func'] = {
		pattern: /[\w-]+\([^)]*\).*/,
		inside: {
			'function': /^[^(]+/,
			rest: Prism.util.clone(inside)
		}
	};

	Prism.languages.stylus = {
		'comment': {
			pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*)/,
			lookbehind: true
		},
		'atrule-declaration': {
			pattern: /(^\s*)@.+/m,
			lookbehind: true,
			inside: {
				'atrule': /^@[\w-]+/,
				rest: inside
			}
		},
		'variable-declaration': {
			pattern: /(^[ \t]*)[\w$-]+\s*.?=[ \t]*(?:(?:\{[^}]*\}|.+)|$)/m,
			lookbehind: true,
			inside: {
				'variable': /^\S+/,
				rest: inside
			}
		},

		'statement': {
			pattern: /(^[ \t]*)(?:if|else|for|return|unless)[ \t]+.+/m,
			lookbehind: true,
			inside: {
				keyword: /^\S+/,
				rest: inside
			}
		},

		// A property/value pair cannot end with a comma or a brace
		// It cannot have indented content unless it ended with a semicolon
		'property-declaration': {
			pattern: /((?:^|\{)([ \t]*))(?:[\w-]|\{[^}\r\n]+\})+(?:\s*:\s*|[ \t]+)[^{\r\n]*(?:;|[^{\r\n,](?=$)(?!(\r?\n|\r)(?:\{|\2[ \t]+)))/m,
			lookbehind: true,
			inside: {
				'property': {
					pattern: /^[^\s:]+/,
					inside: {
						'interpolation': inside.interpolation
					}
				},
				rest: inside
			}
		},



		// A selector can contain parentheses only as part of a pseudo-element
		// It can span multiple lines.
		// It must end with a comma or an accolade or have indented content.
		'selector': {
			pattern: /(^[ \t]*)(?:(?=\S)(?:[^{}\r\n:()]|::?[\w-]+(?:\([^)\r\n]*\))?|\{[^}\r\n]+\})+)(?:(?:\r?\n|\r)(?:\1(?:(?=\S)(?:[^{}\r\n:()]|::?[\w-]+(?:\([^)\r\n]*\))?|\{[^}\r\n]+\})+)))*(?:,$|\{|(?=(?:\r?\n|\r)(?:\{|\1[ \t]+)))/m,
			lookbehind: true,
			inside: {
				'interpolation': inside.interpolation,
				'punctuation': /[{},]/
			}
		},

		'func': inside.func,
		'string': inside.string,
		'interpolation': inside.interpolation,
		'punctuation': /[{}()\[\];:.]/
	};
}(Prism));

/* **********************************************
     Begin prism-sql.js
********************************************** */

Prism.languages.sql= { 
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|(?:--|\/\/|#).*)/,
		lookbehind: true
	},
	'string' : {
		pattern: /(^|[^@\\])("|')(?:\\?[\s\S])*?\2/,
		lookbehind: true
	},
	'variable': /@[\w.$]+|@("|'|`)(?:\\?[\s\S])+?\1/,
	'function': /\b(?:COUNT|SUM|AVG|MIN|MAX|FIRST|LAST|UCASE|LCASE|MID|LEN|ROUND|NOW|FORMAT)(?=\s*\()/i, // Should we highlight user defined functions too?
	'keyword': /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR VARYING|CHARACTER (?:SET|VARYING)|CHARSET|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|DATA(?:BASES?)?|DATETIME|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE(?: PRECISION)?|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE(?:D BY)?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY(?:_INSERT|COL)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEYS?|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL(?: CHAR VARYING| CHARACTER(?: VARYING)?| VARCHAR)?|NATURAL|NCHAR(?: VARCHAR)?|NEXT|NO(?: SQL|CHECK|CYCLE)?|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READ(?:S SQL DATA|TEXT)?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURNS?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START(?:ING BY)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED BY|TEXT(?:SIZE)?|THEN|TIMESTAMP|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNPIVOT|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?)\b/i,
	'boolean': /\b(?:TRUE|FALSE|NULL)\b/i,
	'number': /\b-?(?:0x)?\d*\.?[\da-f]+\b/,
	'operator': /[-+*\/=%^~]|&&?|\|?\||!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|IN|LIKE|NOT|OR|IS|DIV|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
	'punctuation': /[;[\]()`,.]/
};

/* **********************************************
     Begin prism-smarty.js
********************************************** */

/* TODO
	Add support for variables inside double quoted strings
	Add support for {php}
*/

(function(Prism) {

	var smarty_pattern = /\{\*[\w\W]+?\*\}|\{[\w\W]+?\}/g;
	var smarty_litteral_start = '{literal}';
	var smarty_litteral_end = '{/literal}';
	var smarty_litteral_mode = false;
	
	Prism.languages.smarty = Prism.languages.extend('markup', {
		'smarty': {
			pattern: smarty_pattern,
			inside: {
				'delimiter': {
					pattern: /^\{|\}$/i,
					alias: 'punctuation'
				},
				'string': /(["'])(?:\\?.)*?\1/,
				'number': /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee][-+]?\d+)?)\b/,
				'variable': [
					/\$(?!\d)\w+/,
					/#(?!\d)\w+#/,
					{
						pattern: /(\.|->)(?!\d)\w+/,
						lookbehind: true
					},
					{
						pattern: /(\[)(?!\d)\w+(?=\])/,
						lookbehind: true
					}
				],
				'function': [
					{
						pattern: /(\|\s*)@?(?!\d)\w+/,
						lookbehind: true
					},
					/^\/?(?!\d)\w+/,
					/(?!\d)\w+(?=\()/
				],
				'attr-name': {
					// Value is made optional because it may have already been tokenized
					pattern: /\w+\s*=\s*(?:(?!\d)\w+)?/,
					inside: {
						"variable": {
							pattern: /(=\s*)(?!\d)\w+/,
							lookbehind: true
						},
						"operator": /=/
					}
				},
				'punctuation': [
					/[\[\]().,:`]|\->/
				],
				'operator': [
					/[+\-*\/%]|==?=?|[!<>]=?|&&|\|\|?/,
					/\bis\s+(?:not\s+)?(?:div|even|odd)(?:\s+by)?\b/,
					/\b(?:eq|neq?|gt|lt|gt?e|lt?e|not|mod|or|and)\b/
				],
				'keyword': /\b(?:false|off|on|no|true|yes)\b/
			}
		}
	});

	// Comments are inserted at top so that they can
	// surround markup
	Prism.languages.insertBefore('smarty', 'tag', {
		'smarty-comment': {
			pattern: /\{\*[\w\W]*?\*\}/,
			alias: ['smarty','comment']
		}
	});

	// Tokenize all inline Smarty expressions
	Prism.hooks.add('before-highlight', function(env) {
		if (env.language !== 'smarty') {
			return;
		}

		env.tokenStack = [];

		env.backupCode = env.code;
		env.code = env.code.replace(smarty_pattern, function(match) {

			// Smarty tags inside {literal} block are ignored
			if(match === smarty_litteral_end) {
				smarty_litteral_mode = false;
			}

			if(!smarty_litteral_mode) {
				if(match === smarty_litteral_start) {
					smarty_litteral_mode = true;
				}
				env.tokenStack.push(match);

				return '___SMARTY' + env.tokenStack.length + '___';
			}
			return match;
		});
	});

	// Restore env.code for other plugins (e.g. line-numbers)
	Prism.hooks.add('before-insert', function(env) {
		if (env.language === 'smarty') {
			env.code = env.backupCode;
			delete env.backupCode;
		}
	});

	// Re-insert the tokens after highlighting
	// and highlight them with defined grammar
	Prism.hooks.add('after-highlight', function(env) {
		if (env.language !== 'smarty') {
			return;
		}

		for (var i = 0, t; t = env.tokenStack[i]; i++) {
			// The replace prevents $$, $&, $`, $', $n, $nn from being interpreted as special patterns
			env.highlightedCode = env.highlightedCode.replace('___SMARTY' + (i + 1) + '___', Prism.highlight(t, env.grammar, 'smarty').replace(/\$/g, '$$$$'));
		}

		env.element.innerHTML = env.highlightedCode;
	});

}(Prism));

/* **********************************************
     Begin prism-smalltalk.js
********************************************** */

Prism.languages.smalltalk = {
	'comment': /"(?:""|[^"])+"/,
	'string': /'(?:''|[^'])+'/,
	'symbol': /#[\da-z]+|#(?:-|([+\/\\*~<>=@%|&?!])\1?)|#(?=\()/i,
	'block-arguments': {
		pattern: /(\[\s*):[^\[|]*?\|/,
		lookbehind: true,
		inside: {
			'variable': /:[\da-z]+/i,
			'punctuation': /\|/
		}
	},
	'temporary-variables': {
		pattern: /\|[^|]+\|/,
		inside: {
			'variable': /[\da-z]+/i,
			'punctuation': /\|/
		}
	},
	'keyword': /\b(?:nil|true|false|self|super|new)\b/,
	'character': {
		pattern: /\$./,
		alias: 'string'
	},
	'number': [
		/\d+r-?[\dA-Z]+(?:\.[\dA-Z]+)?(?:e-?\d+)?/,
		/(?:\B-|\b)\d+(?:\.\d+)?(?:e-?\d+)?/
	],
	'operator': /[<=]=?|:=|~[~=]|\/\/?|\\\\|>[>=]?|[!^+\-*&|,@]/,
	'punctuation': /[.;:?\[\](){}]/
};

/* **********************************************
     Begin prism-scheme.js
********************************************** */

Prism.languages.scheme = {
	'comment' : /;.*/,
	'string' :  /"(?:[^"\\\r\n]|\\.)*?"|'[^('\s]*/,
	'keyword' : {
		pattern : /(\()(?:define(?:-syntax|-library|-values)?|(?:case-)?lambda|let(?:\*|rec)?(?:-values)?|else|if|cond|begin|delay(?:-force)?|parameterize|guard|set!|(?:quasi-)?quote|syntax-rules)/,
		lookbehind : true
	},
	'builtin' : {
		pattern :  /(\()(?:(?:cons|car|cdr|list|call-with-current-continuation|call\/cc|append|abs|apply|eval)\b|null\?|pair\?|boolean\?|eof-object\?|char\?|procedure\?|number\?|port\?|string\?|vector\?|symbol\?|bytevector\?)/,
		lookbehind : true
	},
	'number' : {
		pattern: /(\s|\))[-+]?[0-9]*\.?[0-9]+(?:\s*[-+]\s*[0-9]*\.?[0-9]+i)?\b/,
		lookbehind: true
	},
	'boolean' : /#[tf]/,
	'operator': {
		pattern: /(\()(?:[-+*%\/]|[<>]=?|=>?)/,
		lookbehind: true
	},
	'function' : {
		pattern : /(\()[^\s()]*(?=\s)/,
		lookbehind : true
	},
	'punctuation' : /[()]/
};

/* **********************************************
     Begin prism-java.js
********************************************** */

Prism.languages.java = Prism.languages.extend('clike', {
	'keyword': /\b(abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/,
	'number': /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+(?:e[+-]?\d+)?[df]?\b/i,
	'operator': {
		pattern: /(^|[^.])(?:\+[+=]?|-[-=]?|!=?|<<?=?|>>?>?=?|==?|&[&=]?|\|[|=]?|\*=?|\/=?|%=?|\^=?|[?:~])/m,
		lookbehind: true
	}
});

/* **********************************************
     Begin prism-scala.js
********************************************** */

Prism.languages.scala = Prism.languages.extend('java', {
	'keyword': /<-|=>|\b(?:abstract|case|catch|class|def|do|else|extends|final|finally|for|forSome|if|implicit|import|lazy|match|new|null|object|override|package|private|protected|return|sealed|self|super|this|throw|trait|try|type|val|var|while|with|yield)\b/,
	'string': /"""[\W\w]*?"""|"(?:[^"\\\r\n]|\\.)*"|'(?:[^\\\r\n']|\\.[^\\']*)'/,
	'builtin': /\b(?:String|Int|Long|Short|Byte|Boolean|Double|Float|Char|Any|AnyRef|AnyVal|Unit|Nothing)\b/,
	'number': /\b(?:0x[\da-f]*\.?[\da-f]+|\d*\.?\d+e?\d*[dfl]?)\b/i,
	'symbol': /'[^\d\s\\]\w*/
});
delete Prism.languages.scala['class-name'];
delete Prism.languages.scala['function'];


/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	'string': /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
	'property': /(\b|\B)[\w-]+(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /<style[\w\W]*?>[\w\W]*?<\/style>/i,
			inside: {
				'tag': {
					pattern: /<style[\w\W]*?>|<\/style>/i,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.css
			},
			alias: 'language-css'
		}
	});
	
	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|').*?\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-scss.js
********************************************** */

Prism.languages.scss = Prism.languages.extend('css', {
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|\/\/.*)/,
		lookbehind: true
	},
	'atrule': {
		pattern: /@[\w-]+(?:\([^()]+\)|[^(])*?(?=\s+[{;])/,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	// url, compassified
	'url': /(?:[-a-z]+-)*url(?=\()/i,
	// CSS selector regex is not appropriate for Sass
	// since there can be lot more things (var, @ directive, nesting..)
	// a selector must start at the end of a property or after a brace (end of other rules or nesting)
	// it can contain some characters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
	// the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
	// can "pass" as a selector- e.g: proper#{$erty})
	// this one was hard to do, so please be careful if you edit this one :)
	'selector': {
		// Initial look-ahead is used to prevent matching of blank selectors
		pattern: /(?=\S)[^@;\{\}\(\)]?([^@;\{\}\(\)]|&|#\{\$[-_\w]+\})+(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/m,
		inside: {
			'placeholder': /%[-_\w]+/
		}
	}
});

Prism.languages.insertBefore('scss', 'atrule', {
	'keyword': [
		/@(?:if|else(?: if)?|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)/i,
		{
			pattern: /( +)(?:from|through)(?= )/,
			lookbehind: true
		}
	]
});

Prism.languages.insertBefore('scss', 'property', {
	// var and interpolated vars
	'variable': /\$[-_\w]+|#\{\$[-_\w]+\}/
});

Prism.languages.insertBefore('scss', 'function', {
	'placeholder': {
		pattern: /%[-_\w]+/,
		alias: 'selector'
	},
	'statement': /\B!(?:default|optional)\b/i,
	'boolean': /\b(?:true|false)\b/,
	'null': /\bnull\b/,
	'operator': {
		pattern: /(\s)(?:[-+*\/%]|[=!]=|<=?|>=?|and|or|not)(?=\s)/,
		lookbehind: true
	}
});

Prism.languages.scss['atrule'].inside.rest = Prism.util.clone(Prism.languages.scss);

/* **********************************************
     Begin prism-sass.js
********************************************** */

(function(Prism) {
	Prism.languages.sass = Prism.languages.extend('css', {
		// Sass comments don't need to be closed, only indented
		'comment': {
			pattern: /^([ \t]*)\/[\/*].*(?:(?:\r?\n|\r)\1[ \t]+.+)*/m,
			lookbehind: true
		}
	});

	Prism.languages.insertBefore('sass', 'atrule', {
		// We want to consume the whole line
		'atrule-line': {
			// Includes support for = and + shortcuts
			pattern: /^(?:[ \t]*)[@+=].+/m,
			inside: {
				'atrule': /(?:@[\w-]+|[+=])/m
			}
		}
	});
	delete Prism.languages.sass.atrule;


	var variable = /((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i;
	var operator = [
		/[+*\/%]|[=!]=|<=?|>=?|\b(?:and|or|not)\b/,
		{
			pattern: /(\s+)-(?=\s)/,
			lookbehind: true
		}
	];

	Prism.languages.insertBefore('sass', 'property', {
		// We want to consume the whole line
		'variable-line': {
			pattern: /^[ \t]*\$.+/m,
			inside: {
				'punctuation': /:/,
				'variable': variable,
				'operator': operator
			}
		},
		// We want to consume the whole line
		'property-line': {
			pattern: /^[ \t]*(?:[^:\s]+ *:.*|:[^:\s]+.*)/m,
			inside: {
				'property': [
					/[^:\s]+(?=\s*:)/,
					{
						pattern: /(:)[^:\s]+/,
						lookbehind: true
					}
				],
				'punctuation': /:/,
				'variable': variable,
				'operator': operator,
				'important': Prism.languages.sass.important
			}
		}
	});
	delete Prism.languages.sass.property;
	delete Prism.languages.sass.important;

	// Now that whole lines for other patterns are consumed,
	// what's left should be selectors
	delete Prism.languages.sass.selector;
	Prism.languages.insertBefore('sass', 'punctuation', {
		'selector': {
			pattern: /([ \t]*)\S(?:,?[^,\r\n]+)*(?:,(?:\r?\n|\r)\1[ \t]+\S(?:,?[^,\r\n]+)*)*/,
			lookbehind: true
		}
	});

}(Prism));

/* **********************************************
     Begin prism-sas.js
********************************************** */

Prism.languages.sas = {
	'datalines': {
		pattern: /^\s*(?:(?:data)?lines|cards);[\s\S]+?(?:\r?\n|\r);/im,
		alias: 'string',
		inside: {
			'keyword': {
				pattern: /^(\s*)(?:(?:data)?lines|cards)/i,
				lookbehind: true
			},
			'punctuation': /;/
		}
	},
	'comment': [
		{
			pattern: /(^\s*|;\s*)\*.*;/m,
			lookbehind: true
		},
		/\/\*[\s\S]+?\*\//
	],
	'datetime': {
		// '1jan2013'd, '9:25:19pm't, '18jan2003:9:27:05am'dt
		pattern: /'[^']+'(?:dt?|t)\b/i,
		alias: 'number'
	},
	'string': /(["'])(?:\1\1|(?!\1)[\s\S])*\1/,
	'keyword': /\b(?:data|else|format|if|input|proc|run|then)\b/i,
	// Decimal (1.2e23), hexadecimal (0c1x)
	'number': /(?:\B-|\b)(?:[\da-f]+x|\d+(?:\.\d+)?(?:e[+-]?\d+)?)/i,
	'operator': /\*\*?|\|\|?|!!?|¦¦?|<[>=]?|>[<=]?|[-+\/=&]|[~¬^]=?|\b(?:eq|ne|gt|lt|ge|le|in|not)\b/i,
	'punctuation': /[$%@.(){}\[\];,\\]/
};

/* **********************************************
     Begin prism-rust.js
********************************************** */

/* TODO
	Add support for Markdown notation inside doc comments
	Add support for nested block comments...
	Match closure params even when not followed by dash or brace
	Add better support for macro definition
*/

Prism.languages.rust = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'string': [
		/b?r(#*)"(?:\\?.)*?"\1/,
		/b?("|')(?:\\?.)*?\1/
	],
	'keyword': /\b(?:abstract|alignof|as|be|box|break|const|continue|crate|do|else|enum|extern|false|final|fn|for|if|impl|in|let|loop|match|mod|move|mut|offsetof|once|override|priv|pub|pure|ref|return|sizeof|static|self|struct|super|true|trait|type|typeof|unsafe|unsized|use|virtual|where|while|yield)\b/,

	'attribute': {
		pattern: /#!?\[.+?\]/,
		alias: 'attr-name'
	},

	'function': [
		/[a-z0-9_]+(?=\s*\()/i,
		// Macros can use parens or brackets
		/[a-z0-9_]+!(?=\s*\(|\[)/i
	],
	'macro-rules': {
		pattern: /[a-z0-9_]+!/i,
		alias: 'function'
	},

	// Hex, oct, bin, dec numbers with visual separators and type suffix
	'number': /\b-?(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(\d(_?\d)*)?\.?\d(_?\d)*([Ee][+-]?\d+)?)(?:_?(?:[iu](?:8|16|32|64)?|f32|f64))?\b/,

	// Closure params should not be confused with bitwise OR |
	'closure-params': {
		pattern: /\|[^|]*\|(?=\s*[{-])/,
		inside: {
			'punctuation': /[\|:,]/,
			'operator': /[&*]/
		}
	},
	'punctuation': /[{}[\];(),:]|\.+|->/,
	'operator': /[-+*\/%!^=]=?|@|&[&=]?|\|[|=]?|<<?=?|>>?=?/
};

/* **********************************************
     Begin prism-ruby.js
********************************************** */

/**
 * Original by Samuel Flores
 *
 * Adds the following new token classes:
 * 		constant, builtin, variable, symbol, regex
 */
(function(Prism) {
	Prism.languages.ruby = Prism.languages.extend('clike', {
		'comment': /#(?!\{[^\r\n]*?\}).*/,
		'keyword': /\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/
	});

	var interpolation = {
		pattern: /#\{[^}]+\}/,
		inside: {
			'delimiter': {
				pattern: /^#\{|\}$/,
				alias: 'tag'
			},
			rest: Prism.util.clone(Prism.languages.ruby)
		}
	};

	Prism.languages.insertBefore('ruby', 'keyword', {
		'regex': [
			{
				pattern: /%r([^a-zA-Z0-9\s\{\(\[<])(?:[^\\]|\\[\s\S])*?\1[gim]{0,3}/,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /%r\((?:[^()\\]|\\[\s\S])*\)[gim]{0,3}/,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				// Here we need to specifically allow interpolation
				pattern: /%r\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}[gim]{0,3}/,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /%r\[(?:[^\[\]\\]|\\[\s\S])*\][gim]{0,3}/,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /%r<(?:[^<>\\]|\\[\s\S])*>[gim]{0,3}/,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/,
				lookbehind: true
			}
		],
		'variable': /[@$]+[a-zA-Z_][a-zA-Z_0-9]*(?:[?!]|\b)/,
		'symbol': /:[a-zA-Z_][a-zA-Z_0-9]*(?:[?!]|\b)/
	});

	Prism.languages.insertBefore('ruby', 'number', {
		'builtin': /\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,
		'constant': /\b[A-Z][a-zA-Z_0-9]*(?:[?!]|\b)/
	});

	Prism.languages.ruby.string = [
		{
			pattern: /%[qQiIwWxs]?([^a-zA-Z0-9\s\{\(\[<])(?:[^\\]|\\[\s\S])*?\1/,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /%[qQiIwWxs]?\((?:[^()\\]|\\[\s\S])*\)/,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			// Here we need to specifically allow interpolation
			pattern: /%[qQiIwWxs]?\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}/,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /%[qQiIwWxs]?\[(?:[^\[\]\\]|\\[\s\S])*\]/,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /%[qQiIwWxs]?<(?:[^<>\\]|\\[\s\S])*>/,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /("|')(#\{[^}]+\}|\\(?:\r?\n|\r)|\\?.)*?\1/,
			inside: {
				'interpolation': interpolation
			}
		}
	];
}(Prism));

/* **********************************************
     Begin prism-rip.js
********************************************** */

Prism.languages.rip = {
	'comment': /#.*/,

	'keyword': /(?:=>|->)|\b(?:class|if|else|switch|case|return|exit|try|catch|finally|raise)\b/,

	'builtin': /@|\bSystem\b/,

	'boolean': /\b(?:true|false)\b/,

	'date': /\b\d{4}-\d{2}-\d{2}\b/,
	'time': /\b\d{2}:\d{2}:\d{2}\b/,
	'datetime': /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\b/,

	'character': /\B`[^\s`'",.:;#\/\\()<>\[\]{}]\b/,

	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true
	},

	'symbol': /:[^\d\s`'",.:;#\/\\()<>\[\]{}][^\s`'",.:;#\/\\()<>\[\]{}]*/,
	'string': /("|')(\\?.)*?\1/,
	'number': /[+-]?(?:(?:\d+\.\d+)|(?:\d+))/,

	'punctuation': /(?:\.{2,3})|[`,.:;=\/\\()<>\[\]{}]/,

	'reference': /[^\d\s`'",.:;#\/\\()<>\[\]{}][^\s`'",.:;#\/\\()<>\[\]{}]*/
};


/* **********************************************
     Begin prism-rest.js
********************************************** */

Prism.languages.rest = {
	'table': [
		{
			pattern: /(\s*)(?:\+[=-]+)+\+(?:\r?\n|\r)(?:\1(?:[+|].+)+[+|](?:\r?\n|\r))+\1(?:\+[=-]+)+\+/,
			lookbehind: true,
			inside: {
				'punctuation': /\||(?:\+[=-]+)+\+/
			}
		},
		{
			pattern: /(\s*)(?:=+ +)+=+((?:\r?\n|\r)\1.+)+(?:\r?\n|\r)\1(?:=+ +)+=+(?=(?:\r?\n|\r){2}|\s*$)/,
			lookbehind: true,
			inside: {
				'punctuation': /[=-]+/
			}
		}
	],

	// Directive-like patterns

	'substitution-def': {
		pattern: /(^\s*\.\. )\|(?:[^|\s](?:[^|]*[^|\s])?)\| [^:]+::/m,
		lookbehind: true,
		inside: {
			'substitution': {
				pattern: /^\|(?:[^|\s]|[^|\s][^|]*[^|\s])\|/,
				alias: 'attr-value',
				inside: {
					'punctuation': /^\||\|$/
				}
			},
			'directive': {
				pattern: /( +)[^:]+::/,
				lookbehind: true,
				alias: 'function',
				inside: {
					'punctuation': /::$/
				}
			}
		}
	},
	'link-target': [
		{
			pattern: /(^\s*\.\. )\[[^\]]+\]/m,
			lookbehind: true,
			alias: 'string',
			inside: {
				'punctuation': /^\[|\]$/
			}
		},
		{
			pattern: /(^\s*\.\. )_(?:`[^`]+`|(?:[^:\\]|\\.)+):/m,
			lookbehind: true,
			alias: 'string',
			inside: {
				'punctuation': /^_|:$/
			}
		}
	],
	'directive': {
		pattern: /(^\s*\.\. )[^:]+::/m,
		lookbehind: true,
		alias: 'function',
		inside: {
			'punctuation': /::$/
		}
	},
	'comment': {
		// The two alternatives try to prevent highlighting of blank comments
		pattern: /(^\s*\.\.)(?:(?: .+)?(?:(?:\r?\n|\r).+)+| .+)(?=(?:\r?\n|\r){2}|$)/m,
		lookbehind: true
	},

	'title': [
		// Overlined and underlined
		{
			pattern: /^(([!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])\2+)(?:\r?\n|\r).+(?:\r?\n|\r)\1$/m,
			inside: {
				'punctuation': /^[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]+|[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]+$/,
				'important': /.+/
			}
		},

		// Underlined only
		{
			pattern: /(^|(?:\r?\n|\r){2}).+(?:\r?\n|\r)([!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])\2+(?=\r?\n|\r|$)/,
			lookbehind: true,
			inside: {
				'punctuation': /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]+$/,
				'important': /.+/
			}
		}
	],
	'hr': {
		pattern: /((?:\r?\n|\r){2})([!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])\2{3,}(?=(?:\r?\n|\r){2})/,
		lookbehind: true,
		alias: 'punctuation'
	},
	'field': {
		pattern: /(^\s*):[^:\r\n]+:(?= )/m,
		lookbehind: true,
		alias: 'attr-name'
	},
	'command-line-option': {
		pattern: /(^\s*)(?:[+-][a-z\d]|(?:\-\-|\/)[a-z\d-]+)(?:[ =](?:[a-z][a-z\d_-]*|<[^<>]+>))?(?:, (?:[+-][a-z\d]|(?:\-\-|\/)[a-z\d-]+)(?:[ =](?:[a-z][a-z\d_-]*|<[^<>]+>))?)*(?=(?:\r?\n|\r)? {2,}\S)/im,
		lookbehind: true,
		alias: 'symbol'
	},
	'literal-block': {
		pattern: /::(?:\r?\n|\r){2}([ \t]+).+(?:(?:\r?\n|\r)\1.+)*/,
		inside: {
			'literal-block-punctuation': {
				pattern: /^::/,
				alias: 'punctuation'
			}
		}
	},
	'quoted-literal-block': {
		pattern: /::(?:\r?\n|\r){2}([!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]).*(?:(?:\r?\n|\r)\1.*)*/,
		inside: {
			'literal-block-punctuation': {
				pattern: /^(?:::|([!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])\1*)/m,
				alias: 'punctuation'
			}
		}
	},
	'list-bullet': {
		pattern: /(^\s*)(?:[*+\-•‣⁃]|\(?(?:\d+|[a-z]|[ivxdclm]+)\)|(?:\d+|[a-z]|[ivxdclm]+)\.)(?= )/im,
		lookbehind: true,
		alias: 'punctuation'
	},
	'doctest-block': {
		pattern: /(^\s*)>>> .+(?:(?:\r?\n|\r).+)*/m,
		lookbehind: true,
		inside: {
			'punctuation': /^>>>/
		}
	},

	'inline': [
		{
			pattern: /(^|[\s\-:\/'"<(\[{])(?::[^:]+:`.*?`|`.*?`:[^:]+:|(\*\*?|``?|\|)(?!\s).*?[^\s]\2(?=[\s\-.,:;!?\\\/'")\]}]|$))/m,
			lookbehind: true,
			inside: {
				'bold': {
					pattern: /(^\*\*).+(?=\*\*$)/,
					lookbehind: true
				},
				'italic': {
					pattern: /(^\*).+(?=\*$)/,
					lookbehind: true
				},
				'inline-literal': {
					pattern: /(^``).+(?=``$)/,
					lookbehind: true,
					alias: 'symbol'
				},
				'role': {
					pattern: /^:[^:]+:|:[^:]+:$/,
					alias: 'function',
					inside: {
						'punctuation': /^:|:$/
					}
				},
				'interpreted-text': {
					pattern: /(^`).+(?=`$)/,
					lookbehind: true,
					alias: 'attr-value'
				},
				'substitution': {
					pattern: /(^\|).+(?=\|$)/,
					lookbehind: true,
					alias: 'attr-value'
				},
				'punctuation': /\*\*?|``?|\|/
			}
		}
	],

	'link': [
		{
			pattern: /\[[^\]]+\]_(?=[\s\-.,:;!?\\\/'")\]}]|$)/,
			alias: 'string',
			inside: {
				'punctuation': /^\[|\]_$/
			}
		},
		{
			pattern: /(?:\b[a-z\d](?:[_.:+]?[a-z\d]+)*_?_|`[^`]+`_?_|_`[^`]+`)(?=[\s\-.,:;!?\\\/'")\]}]|$)/i,
			alias: 'string',
			inside: {
				'punctuation': /^_?`|`$|`?_?_$/
			}
		}
	],

	// Line block start,
	// quote attribution,
	// explicit markup start,
	// and anonymous hyperlink target shortcut (__)
	'punctuation': {
		pattern: /(^\s*)(?:\|(?= |$)|(?:---?|—|\.\.|__)(?= )|\.\.$)/m,
		lookbehind: true
	}
};

/* **********************************************
     Begin prism-jsx.js
********************************************** */

(function(Prism) {

var javascript = Prism.util.clone(Prism.languages.javascript);

Prism.languages.jsx = Prism.languages.extend('markup', javascript);
Prism.languages.jsx.tag.pattern= /<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+|(\{[\w\W]*?\})))?\s*)*\/?>/i;

Prism.languages.jsx.tag.inside['attr-value'].pattern = /=[^\{](?:('|")[\w\W]*?(\1)|[^\s>]+)/i;

Prism.languages.insertBefore('inside', 'attr-value',{
	'script': {
		// Allow for one level of nesting
		pattern: /=(\{(?:\{[^}]*\}|[^}])+\})/i,
		inside: {
			'function' : Prism.languages.javascript.function,
			'punctuation': /[={}[\];(),.:]/,
			'keyword':  Prism.languages.javascript.keyword
		},
		'alias': 'language-javascript'
	}
}, Prism.languages.jsx.tag);

}(Prism));


/* **********************************************
     Begin prism-r.js
********************************************** */

Prism.languages.r = {
	'comment': /#.*/,
	'string': /(['"])(?:\\?.)*?\1/,
	'percent-operator': {
		// Includes user-defined operators
		// and %%, %*%, %/%, %in%, %o%, %x%
		pattern: /%[^%\s]*%/,
		alias: 'operator'
	},
	'boolean': /\b(?:TRUE|FALSE)\b/,
	'ellipsis': /\.\.(?:\.|\d+)/,
	'number': [
		/\b(?:NaN|Inf)\b/,
		/\b(?:0x[\dA-Fa-f]+(?:\.\d*)?|\d*\.?\d+)(?:[EePp][+-]?\d+)?[iL]?\b/
	],
	'keyword': /\b(?:if|else|repeat|while|function|for|in|next|break|NULL|NA|NA_integer_|NA_real_|NA_complex_|NA_character_)\b/,
	'operator': /->?>?|<(?:=|<?-)?|[>=!]=?|::?|&&?|\|\|?|[+*\/^$@~]/,
	'punctuation': /[(){}\[\],;]/
};

/* **********************************************
     Begin prism-qore.js
********************************************** */

Prism.languages.qore = Prism.languages.extend('clike', {
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|(?:\/\/|#).*)/,
		lookbehind: true
	},
	// Overridden to allow unescaped multi-line strings
	'string': /("|')(\\(?:\r\n|[\s\S])|(?!\1)[^\\])*\1/,
	'variable': /\$(?!\d)\w+\b/,
	'keyword': /\b(?:abstract|any|assert|binary|bool|boolean|break|byte|case|catch|char|class|code|const|continue|data|default|do|double|else|enum|extends|final|finally|float|for|goto|hash|if|implements|import|inherits|instanceof|int|interface|long|my|native|new|nothing|null|object|our|own|private|reference|rethrow|return|short|soft(?:int|float|number|bool|string|date|list)|static|strictfp|string|sub|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/,
	'number': /\b(?:0b[01]+|0x[\da-f]*\.?[\da-fp\-]+|\d*\.?\d+e?\d*[df]|\d*\.?\d+)\b/i,
	'boolean': /\b(?:true|false)\b/i,
	'operator': {
		pattern: /(^|[^\.])(?:\+[+=]?|-[-=]?|[!=](?:==?|~)?|>>?=?|<(?:=>?|<=?)?|&[&=]?|\|[|=]?|[*\/%^]=?|[~?])/,
		lookbehind: true
	},
	'function': /\$?\b(?!\d)\w+(?=\()/
});

/* **********************************************
     Begin prism-q.js
********************************************** */

Prism.languages.q = {
	'string': /"(?:\\.|[^"\\\r\n])*"/,
	'comment': [
		// From http://code.kx.com/wiki/Reference/Slash:
		// When / is following a space (or a right parenthesis, bracket, or brace), it is ignored with the rest of the line.
		{

			pattern: /([\t )\]}])\/.*/,
			lookbehind: true
		},
		// From http://code.kx.com/wiki/Reference/Slash:
		// A line which has / as its first character and contains at least one other non-whitespace character is a whole-line comment and is ignored entirely.
		// A / on a line by itself begins a multiline comment which is terminated by the next \ on a line by itself.
		// If a / is not matched by a \, the multiline comment is unterminated and continues to end of file.
		// The / and \ must be the first char on the line, but may be followed by any amount of whitespace.
		{
			pattern: /(^|\r?\n|\r)\/[\t ]*(?:(?:\r?\n|\r)(?:.*(?:\r?\n|\r))*?(?:\\(?=[\t ]*(?:\r?\n|\r))|$)|\S.*)/,
			lookbehind: true
		},
		// From http://code.kx.com/wiki/Reference/Slash:
		// A \ on a line by itself with no preceding matching / will comment to end of file.
		/^\\[\t ]*(?:\r?\n|\r)[\s\S]+/m,

		/^#!.+/m
	],
	'symbol': /`(?::\S+|[\w.]*)/,
	'datetime': {
		pattern: /0N[mdzuvt]|0W[dtz]|\d{4}\.\d\d(?:m|\.\d\d(?:T(?:\d\d(?::\d\d(?::\d\d(?:[.:]\d\d\d)?)?)?)?)?[dz]?)|\d\d:\d\d(?::\d\d(?:[.:]\d\d\d)?)?[uvt]?/,
		alias: 'number'
	},
	// The negative look-ahead prevents bad highlighting
	// of verbs 0: and 1:
	'number': /\b-?(?![01]:)(?:0[wn]|0W[hj]?|0N[hje]?|0x[\da-fA-F]+|\d+\.?\d*(?:e[+-]?\d+)?[hjfeb]?)/,
	'keyword': /\\\w+\b|\b(?:abs|acos|aj0?|all|and|any|asc|asin|asof|atan|attr|avgs?|binr?|by|ceiling|cols|cor|cos|count|cov|cross|csv|cut|delete|deltas|desc|dev|differ|distinct|div|do|dsave|ej|enlist|eval|except|exec|exit|exp|fby|fills|first|fkeys|flip|floor|from|get|getenv|group|gtime|hclose|hcount|hdel|hopen|hsym|iasc|identity|idesc|if|ij|in|insert|inter|inv|keys?|last|like|list|ljf?|load|log|lower|lsq|ltime|ltrim|mavg|maxs?|mcount|md5|mdev|med|meta|mins?|mmax|mmin|mmu|mod|msum|neg|next|not|null|or|over|parse|peach|pj|plist|prds?|prev|prior|rand|rank|ratios|raze|read0|read1|reciprocal|reval|reverse|rload|rotate|rsave|rtrim|save|scan|scov|sdev|select|set|setenv|show|signum|sin|sqrt|ssr?|string|sublist|sums?|sv|svar|system|tables|tan|til|trim|txf|type|uj|ungroup|union|update|upper|upsert|value|var|views?|vs|wavg|where|while|within|wj1?|wsum|ww|xasc|xbar|xcols?|xdesc|xexp|xgroup|xkey|xlog|xprev|xrank)\b/,
	'adverb': {
		pattern: /['\/\\]:?|\beach\b/,
		alias: 'function'
	},
	'verb': {
		pattern: /(?:\B\.\B|\b[01]:|<[=>]?|>=?|[:+\-*%,!?_~=|$&#@^]):?/,
		alias: 'operator'
	},
	'punctuation': /[(){}\[\];.]/
};

/* **********************************************
     Begin prism-python.js
********************************************** */

Prism.languages.python= {
	'comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true
	},
	'string': /"""[\s\S]+?"""|'''[\s\S]+?'''|("|')(?:\\?.)*?\1/,
	'function' : {
		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_][a-zA-Z0-9_]*(?=\()/g,
		lookbehind: true
	},
	'class-name': {
		pattern: /(\bclass\s+)[a-z0-9_]+/i,
		lookbehind: true
	},
	'keyword' : /\b(?:as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/,
	'boolean' : /\b(?:True|False)\b/,
	'number' : /\b-?(?:0[bo])?(?:(?:\d|0x[\da-f])[\da-f]*\.?\d*|\.\d+)(?:e[+-]?\d+)?j?\b/i,
	'operator' : /[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]|\b(?:or|and|not)\b/,
	'punctuation' : /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-pure.js
********************************************** */

(function (Prism) {
	Prism.languages.pure = {
		'inline-lang': {
			pattern: /%<[\s\S]+?%>/,
			inside: {
				'lang': {
					pattern: /(^%< *)-\*-.+?-\*-/,
					lookbehind: true,
					alias: 'comment'
				},
				'delimiter': {
					pattern: /^%<.*|%>$/,
					alias: 'punctuation'
				}
			}
		},
		'comment': [
			{
				pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
				lookbehind: true
			},
			{
				pattern: /(^|[^\\:])\/\/.*/,
				lookbehind: true
			},
			/#!.+/
		],
		'string': /"(?:\\.|[^"\\\r\n])*"/,
		'number': {
			// The look-behind prevents wrong highlighting of the .. operator
			pattern: /((?:\.\.)?)(?:\b(?:inf|nan)\b|\b0x[\da-f]+|(?:\b(?:0b)?\d+(?:\.\d)?|\B\.\d)\d*(?:e[+-]?\d+)?L?)/i,
			lookbehind: true
		},
		'keyword': /\b(?:ans|break|bt|case|catch|cd|clear|const|def|del|dump|else|end|exit|extern|false|force|help|if|infix[lr]?|interface|let|ls|mem|namespace|nonfix|NULL|of|otherwise|outfix|override|postfix|prefix|private|public|pwd|quit|run|save|show|stats|then|throw|trace|true|type|underride|using|when|with)\b/,
		'function': /\b(?:abs|add_(?:(?:fundef|interface|macdef|typedef)(?:_at)?|addr|constdef|vardef)|all|any|applp?|arity|bigintp?|blob(?:_crc|_size|p)?|boolp?|byte_(?:matrix|pointer)|byte_c?string(?:_pointer)?|calloc|cat|catmap|ceil|char[ps]?|check_ptrtag|chr|clear_sentry|clearsym|closurep?|cmatrixp?|cols?|colcat(?:map)?|colmap|colrev|colvector(?:p|seq)?|complex(?:_float_(?:matrix|pointer)|_matrix(?:_view)?|_pointer|p)?|conj|cookedp?|cst|cstring(?:_(?:dup|list|vector))?|curry3?|cyclen?|del_(?:constdef|fundef|interface|macdef|typedef|vardef)|delete|diag(?:mat)?|dim|dmatrixp?|do|double(?:_matrix(?:_view)?|_pointer|p)?|dowith3?|drop|dropwhile|eval(?:cmd)?|exactp|filter|fix|fixity|flip|float(?:_matrix|_pointer)|floor|fold[lr]1?|frac|free|funp?|functionp?|gcd|get(?:_(?:byte|constdef|double|float|fundef|int(?:64)?|interface(?:_typedef)?|long|macdef|pointer|ptrtag|short|sentry|string|typedef|vardef))?|globsym|hash|head|id|im|imatrixp?|index|inexactp|infp|init|insert|int(?:_matrix(?:_view)?|_pointer|p)?|int64_(?:matrix|pointer)|integerp?|iteraten?|iterwhile|join|keys?|lambdap?|last(?:err(?:pos)?)?|lcd|list[2p]?|listmap|make_ptrtag|malloc|map|matcat|matrixp?|max|member|min|nanp|nargs|nmatrixp?|null|numberp?|ord|pack(?:ed)?|pointer(?:_cast|_tag|_type|p)?|pow|pred|ptrtag|put(?:_(?:byte|double|float|int(?:64)?|long|pointer|short|string))?|rationalp?|re|realp?|realloc|recordp?|redim|reduce(?:_with)?|refp?|repeatn?|reverse|rlistp?|round|rows?|rowcat(?:map)?|rowmap|rowrev|rowvector(?:p|seq)?|same|scan[lr]1?|sentry|sgn|short_(?:matrix|pointer)|slice|smatrixp?|sort|split|str|strcat|stream|stride|string(?:_(?:dup|list|vector)|p)?|subdiag(?:mat)?|submat|subseq2?|substr|succ|supdiag(?:mat)?|symbolp?|tail|take|takewhile|thunkp?|transpose|trunc|tuplep?|typep|ubyte|uint(?:64)?|ulong|uncurry3?|unref|unzip3?|update|ushort|vals?|varp?|vector(?:p|seq)?|void|zip3?|zipwith3?)\b/,
		'special': {
			pattern: /\b__[a-z]+__\b/i,
			alias: 'builtin'
		},
		// Any combination of operator chars can be an operator
		'operator': /(?=\b_|[^_])[!"#$%&'*+,\-.\/:<=>?@\\^_`|~\u00a1-\u00bf\u00d7-\u00f7\u20d0-\u2bff]+|\b(?:and|div|mod|not|or)\b/,
		// FIXME: How can we prevent | and , to be highlighted as operator when they are used alone?
		'punctuation': /[(){}\[\];,|]/
	};

	var inlineLanguages = [
		'c',
		{ lang: 'c++', alias: 'cpp' },
		'fortran',
		'ats',
		'dsp'
	];
	var inlineLanguageRe = '%< *-\\*- *{lang}\\d* *-\\*-[\\s\\S]+?%>';

	inlineLanguages.forEach(function (lang) {
		var alias = lang;
		if (typeof lang !== 'string') {
			alias = lang.alias;
			lang = lang.lang;
		}
		if (Prism.languages[alias]) {
			var o = {};
			o['inline-lang-' + alias] = {
				pattern: RegExp(inlineLanguageRe.replace('{lang}', lang.replace(/([.+*?\/\\(){}\[\]])/g,'\\$1')), 'i'),
				inside: Prism.util.clone(Prism.languages.pure['inline-lang'].inside)
			};
			o['inline-lang-' + alias].inside.rest = Prism.util.clone(Prism.languages[alias]);
			Prism.languages.insertBefore('pure', 'inline-lang', o);
		}
	});

	// C is the default inline language
	if (Prism.languages.c) {
		Prism.languages.pure['inline-lang'].inside.rest = Prism.util.clone(Prism.languages.c);
	}

}(Prism));

/* **********************************************
     Begin prism-prolog.js
********************************************** */

Prism.languages.prolog = {
	// Syntax depends on the implementation
	'comment': [
		/%.+/,
		/\/\*[\s\S]*?\*\//
	],
	// Depending on the implementation, strings may allow escaped newlines and quote-escape
	'string': /(["'])(?:\1\1|\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	'builtin': /\b(?:fx|fy|xf[xy]?|yfx?)\b/,
	'variable': /\b[A-Z_]\w*/,
	// FIXME: Should we list all null-ary predicates (not followed by a parenthesis) like halt, trace, etc.?
	'function': /\b[a-z]\w*(?:(?=\()|\/\d+)/,
	'number': /\b\d+\.?\d*/,
	// Custom operators are allowed
	'operator': /[:\\=><\-?*@\/;+^|!$.]+|\b(?:is|mod|not|xor)\b/,
	'punctuation': /[(){}\[\],]/
};

/* **********************************************
     Begin prism-processing.js
********************************************** */

Prism.languages.processing = Prism.languages.extend('clike', {
	'keyword': /\b(?:break|catch|case|class|continue|default|else|extends|final|for|if|implements|import|new|null|private|public|return|static|super|switch|this|try|void|while)\b/,
	'operator': /<[<=]?|>[>=]?|&&?|\|\|?|[%?]|[!=+\-*\/]=?/
});
Prism.languages.insertBefore('processing', 'number', {
	// Special case: XML is a type
	'constant': /\b(?!XML\b)[A-Z][A-Z\d_]+\b/,
	'type': {
		pattern: /\b(?:boolean|byte|char|color|double|float|int|XML|[A-Z][A-Za-z\d_]*)\b/,
		alias: 'variable'
	}
});

// Spaces are allowed between function name and parenthesis
Prism.languages.processing['function'].pattern = /[a-z0-9_]+(?=\s*\()/i;

// Class-names is not styled by default
Prism.languages.processing['class-name'].alias = 'variable';

/* **********************************************
     Begin prism-powershell.js
********************************************** */

Prism.languages.powershell = {
	'comment': [
		{
			pattern: /(^|[^`])<#[\w\W]*?#>/,
			lookbehind: true
		},
		{
			pattern: /(^|[^`])#.+/,
			lookbehind: true
		}
	],
	'string': [
		{
			pattern: /"(`?[\w\W])*?"/,
			inside: {
				'function': {
					pattern: /[^`]\$\(.*?\)/,
					// Populated at end of file
					inside: {}
				}
			}
		},
		/'([^']|'')*'/
	],
	// Matches name spaces as well as casts, attribute decorators. Force starting with letter to avoid matching array indices
	'namespace': /\[[a-z][\w\W]*?\]/i,
	'boolean': /\$(true|false)\b/i,
	'variable': /\$\w+\b/i,
	// Cmdlets and aliases. Aliases should come last, otherwise "write" gets preferred over "write-host" for example
	// Get-Command | ?{ $_.ModuleName -match "Microsoft.PowerShell.(Util|Core|Management)" }
	// Get-Alias | ?{ $_.ReferencedCommand.Module.Name -match "Microsoft.PowerShell.(Util|Core|Management)" }
	'function': [
		/\b(Add-(Computer|Content|History|Member|PSSnapin|Type)|Checkpoint-Computer|Clear-(Content|EventLog|History|Item|ItemProperty|Variable)|Compare-Object|Complete-Transaction|Connect-PSSession|ConvertFrom-(Csv|Json|StringData)|Convert-Path|ConvertTo-(Csv|Html|Json|Xml)|Copy-(Item|ItemProperty)|Debug-Process|Disable-(ComputerRestore|PSBreakpoint|PSRemoting|PSSessionConfiguration)|Disconnect-PSSession|Enable-(ComputerRestore|PSBreakpoint|PSRemoting|PSSessionConfiguration)|Enter-PSSession|Exit-PSSession|Export-(Alias|Clixml|Console|Csv|FormatData|ModuleMember|PSSession)|ForEach-Object|Format-(Custom|List|Table|Wide)|Get-(Alias|ChildItem|Command|ComputerRestorePoint|Content|ControlPanelItem|Culture|Date|Event|EventLog|EventSubscriber|FormatData|Help|History|Host|HotFix|Item|ItemProperty|Job|Location|Member|Module|Process|PSBreakpoint|PSCallStack|PSDrive|PSProvider|PSSession|PSSessionConfiguration|PSSnapin|Random|Service|TraceSource|Transaction|TypeData|UICulture|Unique|Variable|WmiObject)|Group-Object|Import-(Alias|Clixml|Csv|LocalizedData|Module|PSSession)|Invoke-(Command|Expression|History|Item|RestMethod|WebRequest|WmiMethod)|Join-Path|Limit-EventLog|Measure-(Command|Object)|Move-(Item|ItemProperty)|New-(Alias|Event|EventLog|Item|ItemProperty|Module|ModuleManifest|Object|PSDrive|PSSession|PSSessionConfigurationFile|PSSessionOption|PSTransportOption|Service|TimeSpan|Variable|WebServiceProxy)|Out-(Default|File|GridView|Host|Null|Printer|String)|Pop-Location|Push-Location|Read-Host|Receive-(Job|PSSession)|Register-(EngineEvent|ObjectEvent|PSSessionConfiguration|WmiEvent)|Remove-(Computer|Event|EventLog|Item|ItemProperty|Job|Module|PSBreakpoint|PSDrive|PSSession|PSSnapin|TypeData|Variable|WmiObject)|Rename-(Computer|Item|ItemProperty)|Reset-ComputerMachinePassword|Resolve-Path|Restart-(Computer|Service)|Restore-Computer|Resume-(Job|Service)|Save-Help|Select-(Object|String|Xml)|Send-MailMessage|Set-(Alias|Content|Date|Item|ItemProperty|Location|PSBreakpoint|PSDebug|PSSessionConfiguration|Service|StrictMode|TraceSource|Variable|WmiInstance)|Show-(Command|ControlPanelItem|EventLog)|Sort-Object|Split-Path|Start-(Job|Process|Service|Sleep|Transaction)|Stop-(Computer|Job|Process|Service)|Suspend-(Job|Service)|Tee-Object|Test-(ComputerSecureChannel|Connection|ModuleManifest|Path|PSSessionConfigurationFile)|Trace-Command|Unblock-File|Undo-Transaction|Unregister-(Event|PSSessionConfiguration)|Update-(FormatData|Help|List|TypeData)|Use-Transaction|Wait-(Event|Job|Process)|Where-Object|Write-(Debug|Error|EventLog|Host|Output|Progress|Verbose|Warning))\b/i,
		/\b(ac|cat|chdir|clc|cli|clp|clv|compare|copy|cp|cpi|cpp|cvpa|dbp|del|diff|dir|ebp|echo|epal|epcsv|epsn|erase|fc|fl|ft|fw|gal|gbp|gc|gci|gcs|gdr|gi|gl|gm|gp|gps|group|gsv|gu|gv|gwmi|iex|ii|ipal|ipcsv|ipsn|irm|iwmi|iwr|kill|lp|ls|measure|mi|mount|move|mp|mv|nal|ndr|ni|nv|ogv|popd|ps|pushd|pwd|rbp|rd|rdr|ren|ri|rm|rmdir|rni|rnp|rp|rv|rvpa|rwmi|sal|saps|sasv|sbp|sc|select|set|shcm|si|sl|sleep|sls|sort|sp|spps|spsv|start|sv|swmi|tee|trcm|type|write)\b/i
	],
	// per http://technet.microsoft.com/en-us/library/hh847744.aspx
	'keyword': /\b(Begin|Break|Catch|Class|Continue|Data|Define|Do|DynamicParam|Else|ElseIf|End|Exit|Filter|Finally|For|ForEach|From|Function|If|InlineScript|Parallel|Param|Process|Return|Sequence|Switch|Throw|Trap|Try|Until|Using|Var|While|Workflow)\b/i,
	'operator': {
		pattern: /(\W?)(!|-(eq|ne|gt|ge|lt|le|sh[lr]|not|b?(and|x?or)|(Not)?(Like|Match|Contains|In)|Replace|Join|is(Not)?|as)\b|-[-=]?|\+[+=]?|[*\/%]=?)/i,
		lookbehind: true
	},
	'punctuation': /[|{}[\];(),.]/
};

// Variable interpolation inside strings, and nested expressions
Prism.languages.powershell.string[0].inside.boolean = Prism.languages.powershell.boolean;
Prism.languages.powershell.string[0].inside.variable = Prism.languages.powershell.variable;
Prism.languages.powershell.string[0].inside.function.inside = Prism.util.clone(Prism.languages.powershell);

/* **********************************************
     Begin prism-php.js
********************************************** */

/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */

Prism.languages.php = Prism.languages.extend('clike', {
	'keyword': /\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/i,
	'constant': /\b[A-Z0-9_]{2,}\b/,
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|\/\/.*)/,
		lookbehind: true
	}
});

// Shell-like comments are matched after strings, because they are less
// common than strings containing hashes...
Prism.languages.insertBefore('php', 'class-name', {
	'shell-comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true,
		alias: 'comment'
	}
});

Prism.languages.insertBefore('php', 'keyword', {
	'delimiter': /\?>|<\?(?:php)?/i,
	'variable': /\$\w+\b/i,
	'package': {
		pattern: /(\\|namespace\s+|use\s+)[\w\\]+/,
		lookbehind: true,
		inside: {
			punctuation: /\\/
		}
	}
});

// Must be defined after the function pattern
Prism.languages.insertBefore('php', 'operator', {
	'property': {
		pattern: /(->)[\w]+/,
		lookbehind: true
	}
});

// Add HTML support of the markup language exists
if (Prism.languages.markup) {

	// Tokenize all inline PHP blocks that are wrapped in <?php ?>
	// This allows for easy PHP + markup highlighting
	Prism.hooks.add('before-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		env.tokenStack = [];

		env.backupCode = env.code;
		env.code = env.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/ig, function(match) {
			env.tokenStack.push(match);

			return '{{{PHP' + env.tokenStack.length + '}}}';
		});
	});

	// Restore env.code for other plugins (e.g. line-numbers)
	Prism.hooks.add('before-insert', function(env) {
		if (env.language === 'php') {
			env.code = env.backupCode;
			delete env.backupCode;
		}
	});

	// Re-insert the tokens after highlighting
	Prism.hooks.add('after-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		for (var i = 0, t; t = env.tokenStack[i]; i++) {
			// The replace prevents $$, $&, $`, $', $n, $nn from being interpreted as special patterns
			env.highlightedCode = env.highlightedCode.replace('{{{PHP' + (i + 1) + '}}}', Prism.highlight(t, env.grammar, 'php').replace(/\$/g, '$$$$'));
		}

		env.element.innerHTML = env.highlightedCode;
	});

	// Wrap tokens in classes that are missing them
	Prism.hooks.add('wrap', function(env) {
		if (env.language === 'php' && env.type === 'markup') {
			env.content = env.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g, "<span class=\"token php\">$1</span>");
		}
	});

	// Add the rules before all others
	Prism.languages.insertBefore('php', 'comment', {
		'markup': {
			pattern: /<[^?]\/?(.*?)>/,
			inside: Prism.languages.markup
		},
		'php': /\{\{\{PHP[0-9]+\}\}\}/
	});
}


/* **********************************************
     Begin prism-php-extras.js
********************************************** */

Prism.languages.insertBefore('php', 'variable', {
	'this': /\$this\b/,
	'global': /\$(?:_(?:SERVER|GET|POST|FILES|REQUEST|SESSION|ENV|COOKIE)|GLOBALS|HTTP_RAW_POST_DATA|argc|argv|php_errormsg|http_response_header)/,
	'scope': {
		pattern: /\b[\w\\]+::/,
		inside: {
			keyword: /(static|self|parent)/,
			punctuation: /(::|\\)/
		}
	}
});

/* **********************************************
     Begin prism-perl.js
********************************************** */

Prism.languages.perl = {
	'comment': [
		{
			// POD
			pattern: /(^\s*)=\w+[\s\S]*?=cut.*/m,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\$])#.*/,
			lookbehind: true
		}
	],
	// TODO Could be nice to handle Heredoc too.
	'string': [
		// q/.../
		/\b(?:q|qq|qx|qw)\s*([^a-zA-Z0-9\s\{\(\[<])(?:[^\\]|\\[\s\S])*?\1/,
	
		// q a...a
		/\b(?:q|qq|qx|qw)\s+([a-zA-Z0-9])(?:[^\\]|\\[\s\S])*?\1/,
	
		// q(...)
		/\b(?:q|qq|qx|qw)\s*\((?:[^()\\]|\\[\s\S])*\)/,
	
		// q{...}
		/\b(?:q|qq|qx|qw)\s*\{(?:[^{}\\]|\\[\s\S])*\}/,
	
		// q[...]
		/\b(?:q|qq|qx|qw)\s*\[(?:[^[\]\\]|\\[\s\S])*\]/,
	
		// q<...>
		/\b(?:q|qq|qx|qw)\s*<(?:[^<>\\]|\\[\s\S])*>/,

		// "...", `...`
		/("|`)(?:[^\\]|\\[\s\S])*?\1/,

		// '...'
		// FIXME Multi-line single-quoted strings are not supported as they would break variables containing '
		/'(?:[^'\\\r\n]|\\.)*'/
	],
	'regex': [
		// m/.../
		/\b(?:m|qr)\s*([^a-zA-Z0-9\s\{\(\[<])(?:[^\\]|\\[\s\S])*?\1[msixpodualngc]*/,
	
		// m a...a
		/\b(?:m|qr)\s+([a-zA-Z0-9])(?:[^\\]|\\.)*?\1[msixpodualngc]*/,
	
		// m(...)
		/\b(?:m|qr)\s*\((?:[^()\\]|\\[\s\S])*\)[msixpodualngc]*/,
	
		// m{...}
		/\b(?:m|qr)\s*\{(?:[^{}\\]|\\[\s\S])*\}[msixpodualngc]*/,
	
		// m[...]
		/\b(?:m|qr)\s*\[(?:[^[\]\\]|\\[\s\S])*\][msixpodualngc]*/,
	
		// m<...>
		/\b(?:m|qr)\s*<(?:[^<>\\]|\\[\s\S])*>[msixpodualngc]*/,

		// The lookbehinds prevent -s from breaking
		// FIXME We don't handle change of separator like s(...)[...]
		// s/.../.../
		{
			pattern: /(^|[^-]\b)(?:s|tr|y)\s*([^a-zA-Z0-9\s\{\(\[<])(?:[^\\]|\\[\s\S])*?\2(?:[^\\]|\\[\s\S])*?\2[msixpodualngcer]*/,
			lookbehind: true
		},
	
		// s a...a...a
		{
			pattern: /(^|[^-]\b)(?:s|tr|y)\s+([a-zA-Z0-9])(?:[^\\]|\\[\s\S])*?\2(?:[^\\]|\\[\s\S])*?\2[msixpodualngcer]*/,
			lookbehind: true
		},
	
		// s(...)(...)
		{
			pattern: /(^|[^-]\b)(?:s|tr|y)\s*\((?:[^()\\]|\\[\s\S])*\)\s*\((?:[^()\\]|\\[\s\S])*\)[msixpodualngcer]*/,
			lookbehind: true
		},
	
		// s{...}{...}
		{
			pattern: /(^|[^-]\b)(?:s|tr|y)\s*\{(?:[^{}\\]|\\[\s\S])*\}\s*\{(?:[^{}\\]|\\[\s\S])*\}[msixpodualngcer]*/,
			lookbehind: true
		},
	
		// s[...][...]
		{
			pattern: /(^|[^-]\b)(?:s|tr|y)\s*\[(?:[^[\]\\]|\\[\s\S])*\]\s*\[(?:[^[\]\\]|\\[\s\S])*\][msixpodualngcer]*/,
			lookbehind: true
		},
	
		// s<...><...>
		{
			pattern: /(^|[^-]\b)(?:s|tr|y)\s*<(?:[^<>\\]|\\[\s\S])*>\s*<(?:[^<>\\]|\\[\s\S])*>[msixpodualngcer]*/,
			lookbehind: true
		},
	
		// /.../
		// The look-ahead tries to prevent two divisions on
		// the same line from being highlighted as regex.
		// This does not support multi-line regex.
		/\/(?:[^\/\\\r\n]|\\.)*\/[msixpodualngc]*(?=\s*(?:$|[\r\n,.;})&|\-+*~<>!?^]|(lt|gt|le|ge|eq|ne|cmp|not|and|or|xor|x)\b))/
	],

	// FIXME Not sure about the handling of ::, ', and #
	'variable': [
		// ${^POSTMATCH}
		/[&*$@%]\{\^[A-Z]+\}/,
		// $^V
		/[&*$@%]\^[A-Z_]/,
		// ${...}
		/[&*$@%]#?(?=\{)/,
		// $foo
		/[&*$@%]#?((::)*'?(?!\d)[\w$]+)+(::)*/i,
		// $1
		/[&*$@%]\d+/,
		// $_, @_, %!
		// The negative lookahead prevents from breaking the %= operator
		/(?!%=)[$@%][!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]/
	],
	'filehandle': {
		// <>, <FOO>, _
		pattern: /<(?![<=])\S*>|\b_\b/,
		alias: 'symbol'
	},
	'vstring': {
		// v1.2, 1.2.3
		pattern: /v\d+(\.\d+)*|\d+(\.\d+){2,}/,
		alias: 'string'
	},
	'function': {
		pattern: /sub [a-z0-9_]+/i,
		inside: {
			keyword: /sub/
		}
	},
	'keyword': /\b(any|break|continue|default|delete|die|do|else|elsif|eval|for|foreach|given|goto|if|last|local|my|next|our|package|print|redo|require|say|state|sub|switch|undef|unless|until|use|when|while)\b/,
	'number': /\b-?(0x[\dA-Fa-f](_?[\dA-Fa-f])*|0b[01](_?[01])*|(\d(_?\d)*)?\.?\d(_?\d)*([Ee][+-]?\d+)?)\b/,
	'operator': /-[rwxoRWXOezsfdlpSbctugkTBMAC]\b|\+[+=]?|-[-=>]?|\*\*?=?|\/\/?=?|=[=~>]?|~[~=]?|\|\|?=?|&&?=?|<(?:=>?|<=?)?|>>?=?|![~=]?|[%^]=?|\.(?:=|\.\.?)?|[\\?]|\bx(?:=|\b)|\b(lt|gt|le|ge|eq|ne|cmp|not|and|or|xor)\b/,
	'punctuation': /[{}[\];(),:]/
};


/* **********************************************
     Begin prism-pascal.js
********************************************** */

// Based on Free Pascal

/* TODO
	Support inline asm ?
*/

Prism.languages.pascal = {
	'comment': [
		/\(\*[\s\S]+?\*\)/,
		/\{[\s\S]+?\}/,
		/\/\/.*/
	],
	'string': /(?:'(?:''|[^'\r\n])*'|#[&$%]?[a-f\d]+)+|\^[a-z]/i,
	'keyword': [
		{
			// Turbo Pascal
			pattern: /(^|[^&])\b(?:absolute|array|asm|begin|case|const|constructor|destructor|do|downto|else|end|file|for|function|goto|if|implementation|inherited|inline|interface|label|nil|object|of|operator|packed|procedure|program|record|reintroduce|repeat|self|set|string|then|to|type|unit|until|uses|var|while|with)\b/i,
			lookbehind: true
		},
		{
			// Free Pascal
			pattern: /(^|[^&])\b(?:dispose|exit|false|new|true)\b/i,
			lookbehind: true
		},
		{
			// Object Pascal
			pattern: /(^|[^&])\b(?:class|dispinterface|except|exports|finalization|finally|initialization|inline|library|on|out|packed|property|raise|resourcestring|threadvar|try)\b/i,
			lookbehind: true
		},
		{
			// Modifiers
			pattern: /(^|[^&])\b(?:absolute|abstract|alias|assembler|bitpacked|break|cdecl|continue|cppdecl|cvar|default|deprecated|dynamic|enumerator|experimental|export|external|far|far16|forward|generic|helper|implements|index|interrupt|iochecks|local|message|name|near|nodefault|noreturn|nostackframe|oldfpccall|otherwise|overload|override|pascal|platform|private|protected|public|published|read|register|reintroduce|result|safecall|saveregisters|softfloat|specialize|static|stdcall|stored|strict|unaligned|unimplemented|varargs|virtual|write)\b/i,
			lookbehind: true
		}
	],
	'number': [
		// Hexadecimal, octal and binary
		/[+-]?(?:[&%]\d+|\$[a-f\d]+)/i,
		// Decimal
		/([+-]|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?/i
	],
	'operator': [
		/\.\.|\*\*|:=|<[<=>]?|>[>=]?|[+\-*\/]=?|[@^=]/i,
		{
			pattern: /(^|[^&])\b(?:and|as|div|exclude|in|include|is|mod|not|or|shl|shr|xor)\b/,
			lookbehind: true
		}
	],
	'punctuation': /\(\.|\.\)|[()\[\]:;,.]/
};

/* **********************************************
     Begin prism-ocaml.js
********************************************** */

Prism.languages.ocaml = {
	'comment': /\(\*[\s\S]*?\*\)/,
	'string': [
		/"(?:\\.|[^\\\r\n"])*"/,
		/(['`])(?:\\(?:\d+|x[\da-f]+|.)|(?!\1)[^\\\r\n])\1/i
	],
	'number': /\b-?(?:0x[\da-f][\da-f_]+|(?:0[bo])?\d[\d_]*\.?[\d_]*(?:e[+-]?[\d_]+)?)/i,
	'type': {
		pattern: /\B['`][a-z\d_]*/i,
		alias: 'variable'
	},
	'directive': {
		pattern: /\B#[a-z\d_]+/i,
		alias: 'function'
	},
	'keyword': /\b(?:as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|match|method|module|mutable|new|object|of|open|prefix|private|rec|then|sig|struct|to|try|type|val|value|virtual|where|while|with)\b/,
	'boolean': /\b(?:false|true)\b/,
	// Custom operators are allowed
	'operator': /:=|[=<>@^|&+\-*\/$%!?~][!$%&\*+\-.\/:<=>?@^|~]*|\b(?:and|asr|land|lor|lxor|lsl|lsr|mod|nor|or)\b/,
	'punctuation': /[(){}\[\]|_.,:;]/
};

/* **********************************************
     Begin prism-c.js
********************************************** */

Prism.languages.c = Prism.languages.extend('clike', {
	'keyword': /\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/,
	'operator': /\-[>-]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|?\||[~^%?*\/]/,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)[ful]*\b/i
});

Prism.languages.insertBefore('c', 'string', {
	'macro': {
		// allow for multiline macro definitions
		// spaces after the # character compile fine with gcc
		pattern: /(^\s*)#\s*[a-z]+([^\r\n\\]|\\.|\\(?:\r\n?|\n))*/im,
		lookbehind: true,
		alias: 'property',
		inside: {
			// highlight the path of the include statement as a string
			'string': {
				pattern: /(#\s*include\s*)(<.+?>|("|')(\\?.)+?\3)/,
				lookbehind: true
			}
		}
	}
});

delete Prism.languages.c['class-name'];
delete Prism.languages.c['boolean'];


/* **********************************************
     Begin prism-objectivec.js
********************************************** */

Prism.languages.objectivec = Prism.languages.extend('c', {
	'keyword': /\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|in|self|super)\b|(@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,
	'string': /("|')(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|@"(\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
	'operator': /-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/
});


/* **********************************************
     Begin prism-nsis.js
********************************************** */

/**
 * Original by Jan T. Sott (http://github.com/idleberg)
 *
 * Includes all commands and plug-ins shipped with NSIS 3.0a2
 */
 Prism.languages.nsis = {
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|[#;].*)/,
		lookbehind: true
	},
	'string': /("|')(\\?.)*?\1/,
	'keyword': /\b(Abort|Add(BrandingImage|Size)|AdvSplash|Allow(RootDirInstall|SkipFiles)|AutoCloseWindow|Banner|BG(Font|Gradient|Image)|BrandingText|BringToFront|Call(InstDLL)?|Caption|ChangeUI|CheckBitmap|ClearErrors|CompletedText|ComponentText|CopyFiles|CRCCheck|Create(Directory|Font|ShortCut)|Delete(INISec|INIStr|RegKey|RegValue)?|Detail(Print|sButtonText)|Dialer|Dir(Text|Var|Verify)|EnableWindow|Enum(RegKey|RegValue)|Exch|Exec(Shell|Wait)?|ExpandEnvStrings|File(BufSize|Close|ErrorText|Open|Read|ReadByte|ReadUTF16LE|ReadWord|WriteUTF16LE|Seek|Write|WriteByte|WriteWord)?|Find(Close|First|Next|Window)|FlushINI|Get(CurInstType|CurrentAddress|DlgItem|DLLVersion(Local)?|ErrorLevel|FileTime(Local)?|FullPathName|Function(Address|End)?|InstDirError|LabelAddress|TempFileName)|Goto|HideWindow|Icon|If(Abort|Errors|FileExists|RebootFlag|Silent)|InitPluginsDir|Install(ButtonText|Colors|Dir(RegKey)?)|InstProgressFlags|Inst(Type(GetText|SetText)?)|Int(CmpU?|Fmt|Op)|IsWindow|Lang(DLL|String)|License(BkColor|Data|ForceSelection|LangString|Text)|LoadLanguageFile|LockWindow|Log(Set|Text)|Manifest(DPIAware|SupportedOS)|Math|MessageBox|MiscButtonText|Name|Nop|ns(Dialogs|Exec)|NSISdl|OutFile|Page(Callbacks)?|Pop|Push|Quit|Read(EnvStr|INIStr|RegDWORD|RegStr)|Reboot|RegDLL|Rename|RequestExecutionLevel|ReserveFile|Return|RMDir|SearchPath|Section(End|GetFlags|GetInstTypes|GetSize|GetText|Group|In|SetFlags|SetInstTypes|SetSize|SetText)?|SendMessage|Set(AutoClose|BrandingImage|Compress|Compressor(DictSize)?|CtlColors|CurInstType|DatablockOptimize|DateSave|Details(Print|View)|ErrorLevel|Errors|FileAttributes|Font|OutPath|Overwrite|PluginUnload|RebootFlag|RegView|ShellVarContext|Silent)|Show(InstDetails|UninstDetails|Window)|Silent(Install|UnInstall)|Sleep|SpaceTexts|Splash|StartMenu|Str(CmpS?|Cpy|Len)|SubCaption|System|Unicode|Uninstall(ButtonText|Caption|Icon|SubCaption|Text)|UninstPage|UnRegDLL|UserInfo|Var|VI(AddVersionKey|FileVersion|ProductVersion)|VPatch|WindowIcon|Write(INIStr|RegBin|RegDWORD|RegExpandStr|RegStr|Uninstaller)|XPStyle)\b/,
	'property': /\b(admin|all|auto|both|colored|false|force|hide|highest|lastused|leave|listonly|none|normal|notset|off|on|open|print|show|silent|silentlog|smooth|textonly|true|user|ARCHIVE|FILE_(ATTRIBUTE_ARCHIVE|ATTRIBUTE_NORMAL|ATTRIBUTE_OFFLINE|ATTRIBUTE_READONLY|ATTRIBUTE_SYSTEM|ATTRIBUTE_TEMPORARY)|HK(CR|CU|DD|LM|PD|U)|HKEY_(CLASSES_ROOT|CURRENT_CONFIG|CURRENT_USER|DYN_DATA|LOCAL_MACHINE|PERFORMANCE_DATA|USERS)|ID(ABORT|CANCEL|IGNORE|NO|OK|RETRY|YES)|MB_(ABORTRETRYIGNORE|DEFBUTTON1|DEFBUTTON2|DEFBUTTON3|DEFBUTTON4|ICONEXCLAMATION|ICONINFORMATION|ICONQUESTION|ICONSTOP|OK|OKCANCEL|RETRYCANCEL|RIGHT|RTLREADING|SETFOREGROUND|TOPMOST|USERICON|YESNO)|NORMAL|OFFLINE|READONLY|SHCTX|SHELL_CONTEXT|SYSTEM|TEMPORARY)\b/,
	'variable': /\$[({]?[-_\w]+[)}]?/i,
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/,
	'operator': /--?|\+\+?|<=?|>=?|==?=?|&&?|\|?\||[?*\/~^%]/,
	'punctuation': /[{}[\];(),.:]/,
	'important': /!(addincludedir|addplugindir|appendfile|cd|define|delfile|echo|else|endif|error|execute|finalize|getdllversionsystem|ifdef|ifmacrodef|ifmacrondef|ifndef|if|include|insertmacro|macroend|macro|makensis|packhdr|searchparse|searchreplace|tempfile|undef|verbose|warning)\b/i
};


/* **********************************************
     Begin prism-nim.js
********************************************** */

Prism.languages.nim = {
	'comment': /#.*/,
	// Double-quoted strings can be prefixed by an identifier (Generalized raw string literals)
	// Character literals are handled specifically to prevent issues with numeric type suffixes
	'string': /(?:(?:\b(?!\d)(?:\w|\\x[8-9a-fA-F][0-9a-fA-F])+)?(?:"""[\s\S]*?"""(?!")|"(?:\\[\s\S]|""|[^"\\])*")|'(?:\\(?:\d+|x[\da-fA-F]{2}|.)|[^'])')/,
	// The negative look ahead prevents wrong highlighting of the .. operator
	'number': /\b(?:0[xXoObB][\da-fA-F_]+|\d[\d_]*(?:(?!\.\.)\.[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)(?:'?[iuf]\d*)?/,
	'keyword': /\b(?:addr|as|asm|atomic|bind|block|break|case|cast|concept|const|continue|converter|defer|discard|distinct|do|elif|else|end|enum|except|export|finally|for|from|func|generic|if|import|include|interface|iterator|let|macro|method|mixin|nil|object|out|proc|ptr|raise|ref|return|static|template|try|tuple|type|using|var|when|while|with|without|yield)\b/,
	'function': {
		pattern: /(?:(?!\d)(?:\w|\\x[8-9a-fA-F][0-9a-fA-F])+|`[^`\r\n]+`)\*?(?:\[[^\]]+\])?(?=\s*\()/,
		inside: {
			'operator': /\*$/
		}
	},
	// We don't want to highlight operators inside backticks
	'ignore': {
		pattern: /`[^`\r\n]+`/,
		inside: {
			'punctuation': /`/
		}
	},
	'operator': {
		// Look behind and look ahead prevent wrong highlighting of punctuations [. .] {. .} (. .)
		// but allow the slice operator .. to take precedence over them
		// One can define his own operators in Nim so all combination of operators might be an operator.
		pattern: /(^|[({\[](?=\.\.)|(?![({\[]\.).)(?:(?:[=+\-*\/<>@$~&%|!?^:\\]|\.\.|\.(?![)}\]]))+|\b(?:and|div|of|or|in|is|isnot|mod|not|notin|shl|shr|xor)\b)/m,
		lookbehind: true
	},
	'punctuation': /[({\[]\.|\.[)}\]]|[`(){}\[\],:]/
};

/* **********************************************
     Begin prism-nasm.js
********************************************** */

Prism.languages.nasm = {
	'comment': /;.*$/m,
	'string': /("|'|`)(\\?.)*?\1/m,
	'label': {
		pattern: /(^\s*)[A-Za-z._?$][\w.?$@~#]*:/m,
		lookbehind: true,
		alias: 'function'
	},
	'keyword': [
		/\[?BITS (16|32|64)\]?/m,
		{
			pattern: /(^\s*)section\s*[a-zA-Z\.]+:?/im,
			lookbehind: true
		},
		/(?:extern|global)[^;\r\n]*/im,
		/(?:CPU|FLOAT|DEFAULT).*$/m
	],
	'register': {
		pattern: /\b(?:st\d|[xyz]mm\d\d?|[cdt]r\d|r\d\d?[bwd]?|[er]?[abcd]x|[abcd][hl]|[er]?(bp|sp|si|di)|[cdefgs]s)\b/i,
		alias: 'variable'
	},
	'number': /(\b|-|(?=\$))(0[hx][\da-f]*\.?[\da-f]+(p[+-]?\d+)?|\d[\da-f]+[hx]|\$\d[\da-f]*|0[oq][0-7]+|[0-7]+[oq]|0[by][01]+|[01]+[by]|0[dt]\d+|\d*\.?\d+(\.?e[+-]?\d+)?[dt]?)\b/i,
	'operator': /[\[\]*+\-\/%<>=&|$!]/
};


/* **********************************************
     Begin prism-monkey.js
********************************************** */

Prism.languages.monkey = {
	'string': /"[^"\r\n]*"/,
	'comment': [
		/^#Rem\s+[\s\S]*?^#End/im,
		/'.+/,
	],
	'preprocessor': {
		pattern: /(^[ \t]*)#.+/m,
		lookbehind: true,
		alias: 'comment'
	},
	'function': /\w+(?=\()/,
	'type-char': {
		pattern: /(\w)[?%#$]/,
		lookbehind: true,
		alias: 'variable'
	},
	'number': {
		pattern: /((?:\.\.)?)(?:(?:\b|\B-\.?|\B\.)\d+((?!\.\.)\.\d*)?|\$[\da-f]+)/i,
		lookbehind: true
	},
	'keyword': /\b(?:Void|Strict|Public|Private|Property|Bool|Int|Float|String|Array|Object|Continue|Exit|Import|Extern|New|Self|Super|Try|Catch|Eachin|True|False|Extends|Abstract|Final|Select|Case|Default|Const|Local|Global|Field|Method|Function|Class|End|If|Then|Else|ElseIf|EndIf|While|Wend|Repeat|Until|Forever|For|To|Step|Next|Return|Module|Interface|Implements|Inline|Throw|Null)\b/i,
	'operator': /\.\.|<[=>]?|>=?|:?=|(?:[+\-*\/&~|]|\b(?:Mod|Shl|Shr)\b)=?|\b(?:And|Not|Or)\b/i,
	'punctuation': /[.,:;()\[\]]/
};

/* **********************************************
     Begin prism-mizar.js
********************************************** */

Prism.languages.mizar = {
	'comment': /::.+/,
	'keyword': /@proof\b|\b(?:according|aggregate|all|and|antonym|are|as|associativity|assume|asymmetry|attr|be|begin|being|by|canceled|case|cases|clusters?|coherence|commutativity|compatibility|connectedness|consider|consistency|constructors|contradiction|correctness|def|deffunc|define|definitions?|defpred|do|does|equals|end|environ|ex|exactly|existence|for|from|func|given|hence|hereby|holds|idempotence|identity|iff?|implies|involutiveness|irreflexivity|is|it|let|means|mode|non|not|notations?|now|of|or|otherwise|over|per|pred|prefix|projectivity|proof|provided|qua|reconsider|redefine|reduce|reducibility|reflexivity|registrations?|requirements|reserve|sch|schemes?|section|selector|set|sethood|st|struct|such|suppose|symmetry|synonym|take|that|the|then|theorems?|thesis|thus|to|transitivity|uniqueness|vocabular(?:y|ies)|when|where|with|wrt)\b/,
	'parameter': {
		pattern: /\$(?:10|\d)/,
		alias: 'variable'
	},
	'variable': /\w+(?=:)/,
	'number': /(?:\b|-)\d+\b/,
	'operator': /\.\.\.|->|&|\.?=/,
	'punctuation': /\(#|#\)|[,:;\[\](){}]/
};

/* **********************************************
     Begin prism-mel.js
********************************************** */

Prism.languages.mel = {
	'comment': /\/\/.*/,
	'code': {
		pattern: /`(?:\\.|[^\\`\r\n])*`/,
		alias: 'italic',
		inside: {
			'delimiter': {
				pattern: /^`|`$/,
				alias: 'punctuation'
			}
			// See rest below
		}
	},
	'string': /"(?:\\.|[^\\"\r\n])*"/,
	'variable': /\$\w+/,
	'number': /(?:\b|-)(?:0x[\da-fA-F]+|\d+\.?\d*)/,
	'flag': {
		pattern: /-[^\d\W]\w*/,
		alias: 'operator'
	},
	'keyword': /\b(?:break|case|continue|default|do|else|float|for|global|if|in|int|matrix|proc|return|string|switch|vector|while)\b/,
	'function': /\w+(?=\()|\b(?:about|abs|addAttr|addAttributeEditorNodeHelp|addDynamic|addNewShelfTab|addPP|addPanelCategory|addPrefixToName|advanceToNextDrivenKey|affectedNet|affects|aimConstraint|air|alias|aliasAttr|align|alignCtx|alignCurve|alignSurface|allViewFit|ambientLight|angle|angleBetween|animCone|animCurveEditor|animDisplay|animView|annotate|appendStringArray|applicationName|applyAttrPreset|applyTake|arcLenDimContext|arcLengthDimension|arclen|arrayMapper|art3dPaintCtx|artAttrCtx|artAttrPaintVertexCtx|artAttrSkinPaintCtx|artAttrTool|artBuildPaintMenu|artFluidAttrCtx|artPuttyCtx|artSelectCtx|artSetPaintCtx|artUserPaintCtx|assignCommand|assignInputDevice|assignViewportFactories|attachCurve|attachDeviceAttr|attachSurface|attrColorSliderGrp|attrCompatibility|attrControlGrp|attrEnumOptionMenu|attrEnumOptionMenuGrp|attrFieldGrp|attrFieldSliderGrp|attrNavigationControlGrp|attrPresetEditWin|attributeExists|attributeInfo|attributeMenu|attributeQuery|autoKeyframe|autoPlace|bakeClip|bakeFluidShading|bakePartialHistory|bakeResults|bakeSimulation|basename|basenameEx|batchRender|bessel|bevel|bevelPlus|binMembership|bindSkin|blend2|blendShape|blendShapeEditor|blendShapePanel|blendTwoAttr|blindDataType|boneLattice|boundary|boxDollyCtx|boxZoomCtx|bufferCurve|buildBookmarkMenu|buildKeyframeMenu|button|buttonManip|CBG|cacheFile|cacheFileCombine|cacheFileMerge|cacheFileTrack|camera|cameraView|canCreateManip|canvas|capitalizeString|catch|catchQuiet|ceil|changeSubdivComponentDisplayLevel|changeSubdivRegion|channelBox|character|characterMap|characterOutlineEditor|characterize|chdir|checkBox|checkBoxGrp|checkDefaultRenderGlobals|choice|circle|circularFillet|clamp|clear|clearCache|clip|clipEditor|clipEditorCurrentTimeCtx|clipSchedule|clipSchedulerOutliner|clipTrimBefore|closeCurve|closeSurface|cluster|cmdFileOutput|cmdScrollFieldExecuter|cmdScrollFieldReporter|cmdShell|coarsenSubdivSelectionList|collision|color|colorAtPoint|colorEditor|colorIndex|colorIndexSliderGrp|colorSliderButtonGrp|colorSliderGrp|columnLayout|commandEcho|commandLine|commandPort|compactHairSystem|componentEditor|compositingInterop|computePolysetVolume|condition|cone|confirmDialog|connectAttr|connectControl|connectDynamic|connectJoint|connectionInfo|constrain|constrainValue|constructionHistory|container|containsMultibyte|contextInfo|control|convertFromOldLayers|convertIffToPsd|convertLightmap|convertSolidTx|convertTessellation|convertUnit|copyArray|copyFlexor|copyKey|copySkinWeights|cos|cpButton|cpCache|cpClothSet|cpCollision|cpConstraint|cpConvClothToMesh|cpForces|cpGetSolverAttr|cpPanel|cpProperty|cpRigidCollisionFilter|cpSeam|cpSetEdit|cpSetSolverAttr|cpSolver|cpSolverTypes|cpTool|cpUpdateClothUVs|createDisplayLayer|createDrawCtx|createEditor|createLayeredPsdFile|createMotionField|createNewShelf|createNode|createRenderLayer|createSubdivRegion|cross|crossProduct|ctxAbort|ctxCompletion|ctxEditMode|ctxTraverse|currentCtx|currentTime|currentTimeCtx|currentUnit|curve|curveAddPtCtx|curveCVCtx|curveEPCtx|curveEditorCtx|curveIntersect|curveMoveEPCtx|curveOnSurface|curveSketchCtx|cutKey|cycleCheck|cylinder|dagPose|date|defaultLightListCheckBox|defaultNavigation|defineDataServer|defineVirtualDevice|deformer|deg_to_rad|delete|deleteAttr|deleteShadingGroupsAndMaterials|deleteShelfTab|deleteUI|deleteUnusedBrushes|delrandstr|detachCurve|detachDeviceAttr|detachSurface|deviceEditor|devicePanel|dgInfo|dgdirty|dgeval|dgtimer|dimWhen|directKeyCtx|directionalLight|dirmap|dirname|disable|disconnectAttr|disconnectJoint|diskCache|displacementToPoly|displayAffected|displayColor|displayCull|displayLevelOfDetail|displayPref|displayRGBColor|displaySmoothness|displayStats|displayString|displaySurface|distanceDimContext|distanceDimension|doBlur|dolly|dollyCtx|dopeSheetEditor|dot|dotProduct|doubleProfileBirailSurface|drag|dragAttrContext|draggerContext|dropoffLocator|duplicate|duplicateCurve|duplicateSurface|dynCache|dynControl|dynExport|dynExpression|dynGlobals|dynPaintEditor|dynParticleCtx|dynPref|dynRelEdPanel|dynRelEditor|dynamicLoad|editAttrLimits|editDisplayLayerGlobals|editDisplayLayerMembers|editRenderLayerAdjustment|editRenderLayerGlobals|editRenderLayerMembers|editor|editorTemplate|effector|emit|emitter|enableDevice|encodeString|endString|endsWith|env|equivalent|equivalentTol|erf|error|eval|evalDeferred|evalEcho|event|exactWorldBoundingBox|exclusiveLightCheckBox|exec|executeForEachObject|exists|exp|expression|expressionEditorListen|extendCurve|extendSurface|extrude|fcheck|fclose|feof|fflush|fgetline|fgetword|file|fileBrowserDialog|fileDialog|fileExtension|fileInfo|filetest|filletCurve|filter|filterCurve|filterExpand|filterStudioImport|findAllIntersections|findAnimCurves|findKeyframe|findMenuItem|findRelatedSkinCluster|finder|firstParentOf|fitBspline|flexor|floatEq|floatField|floatFieldGrp|floatScrollBar|floatSlider|floatSlider2|floatSliderButtonGrp|floatSliderGrp|floor|flow|fluidCacheInfo|fluidEmitter|fluidVoxelInfo|flushUndo|fmod|fontDialog|fopen|formLayout|format|fprint|frameLayout|fread|freeFormFillet|frewind|fromNativePath|fwrite|gamma|gauss|geometryConstraint|getApplicationVersionAsFloat|getAttr|getClassification|getDefaultBrush|getFileList|getFluidAttr|getInputDeviceRange|getMayaPanelTypes|getModifiers|getPanel|getParticleAttr|getPluginResource|getenv|getpid|glRender|glRenderEditor|globalStitch|gmatch|goal|gotoBindPose|grabColor|gradientControl|gradientControlNoAttr|graphDollyCtx|graphSelectContext|graphTrackCtx|gravity|grid|gridLayout|group|groupObjectsByName|HfAddAttractorToAS|HfAssignAS|HfBuildEqualMap|HfBuildFurFiles|HfBuildFurImages|HfCancelAFR|HfConnectASToHF|HfCreateAttractor|HfDeleteAS|HfEditAS|HfPerformCreateAS|HfRemoveAttractorFromAS|HfSelectAttached|HfSelectAttractors|HfUnAssignAS|hardenPointCurve|hardware|hardwareRenderPanel|headsUpDisplay|headsUpMessage|help|helpLine|hermite|hide|hilite|hitTest|hotBox|hotkey|hotkeyCheck|hsv_to_rgb|hudButton|hudSlider|hudSliderButton|hwReflectionMap|hwRender|hwRenderLoad|hyperGraph|hyperPanel|hyperShade|hypot|iconTextButton|iconTextCheckBox|iconTextRadioButton|iconTextRadioCollection|iconTextScrollList|iconTextStaticLabel|ikHandle|ikHandleCtx|ikHandleDisplayScale|ikSolver|ikSplineHandleCtx|ikSystem|ikSystemInfo|ikfkDisplayMethod|illustratorCurves|image|imfPlugins|inheritTransform|insertJoint|insertJointCtx|insertKeyCtx|insertKnotCurve|insertKnotSurface|instance|instanceable|instancer|intField|intFieldGrp|intScrollBar|intSlider|intSliderGrp|interToUI|internalVar|intersect|iprEngine|isAnimCurve|isConnected|isDirty|isParentOf|isSameObject|isTrue|isValidObjectName|isValidString|isValidUiName|isolateSelect|itemFilter|itemFilterAttr|itemFilterRender|itemFilterType|joint|jointCluster|jointCtx|jointDisplayScale|jointLattice|keyTangent|keyframe|keyframeOutliner|keyframeRegionCurrentTimeCtx|keyframeRegionDirectKeyCtx|keyframeRegionDollyCtx|keyframeRegionInsertKeyCtx|keyframeRegionMoveKeyCtx|keyframeRegionScaleKeyCtx|keyframeRegionSelectKeyCtx|keyframeRegionSetKeyCtx|keyframeRegionTrackCtx|keyframeStats|lassoContext|lattice|latticeDeformKeyCtx|launch|launchImageEditor|layerButton|layeredShaderPort|layeredTexturePort|layout|layoutDialog|lightList|lightListEditor|lightListPanel|lightlink|lineIntersection|linearPrecision|linstep|listAnimatable|listAttr|listCameras|listConnections|listDeviceAttachments|listHistory|listInputDeviceAxes|listInputDeviceButtons|listInputDevices|listMenuAnnotation|listNodeTypes|listPanelCategories|listRelatives|listSets|listTransforms|listUnselected|listerEditor|loadFluid|loadNewShelf|loadPlugin|loadPluginLanguageResources|loadPrefObjects|localizedPanelLabel|lockNode|loft|log|longNameOf|lookThru|ls|lsThroughFilter|lsType|lsUI|Mayatomr|mag|makeIdentity|makeLive|makePaintable|makeRoll|makeSingleSurface|makeTubeOn|makebot|manipMoveContext|manipMoveLimitsCtx|manipOptions|manipRotateContext|manipRotateLimitsCtx|manipScaleContext|manipScaleLimitsCtx|marker|match|max|memory|menu|menuBarLayout|menuEditor|menuItem|menuItemToShelf|menuSet|menuSetPref|messageLine|min|minimizeApp|mirrorJoint|modelCurrentTimeCtx|modelEditor|modelPanel|mouse|movIn|movOut|move|moveIKtoFK|moveKeyCtx|moveVertexAlongDirection|multiProfileBirailSurface|mute|nParticle|nameCommand|nameField|namespace|namespaceInfo|newPanelItems|newton|nodeCast|nodeIconButton|nodeOutliner|nodePreset|nodeType|noise|nonLinear|normalConstraint|normalize|nurbsBoolean|nurbsCopyUVSet|nurbsCube|nurbsEditUV|nurbsPlane|nurbsSelect|nurbsSquare|nurbsToPoly|nurbsToPolygonsPref|nurbsToSubdiv|nurbsToSubdivPref|nurbsUVSet|nurbsViewDirectionVector|objExists|objectCenter|objectLayer|objectType|objectTypeUI|obsoleteProc|oceanNurbsPreviewPlane|offsetCurve|offsetCurveOnSurface|offsetSurface|openGLExtension|openMayaPref|optionMenu|optionMenuGrp|optionVar|orbit|orbitCtx|orientConstraint|outlinerEditor|outlinerPanel|overrideModifier|paintEffectsDisplay|pairBlend|palettePort|paneLayout|panel|panelConfiguration|panelHistory|paramDimContext|paramDimension|paramLocator|parent|parentConstraint|particle|particleExists|particleInstancer|particleRenderInfo|partition|pasteKey|pathAnimation|pause|pclose|percent|performanceOptions|pfxstrokes|pickWalk|picture|pixelMove|planarSrf|plane|play|playbackOptions|playblast|plugAttr|plugNode|pluginInfo|pluginResourceUtil|pointConstraint|pointCurveConstraint|pointLight|pointMatrixMult|pointOnCurve|pointOnSurface|pointPosition|poleVectorConstraint|polyAppend|polyAppendFacetCtx|polyAppendVertex|polyAutoProjection|polyAverageNormal|polyAverageVertex|polyBevel|polyBlendColor|polyBlindData|polyBoolOp|polyBridgeEdge|polyCacheMonitor|polyCheck|polyChipOff|polyClipboard|polyCloseBorder|polyCollapseEdge|polyCollapseFacet|polyColorBlindData|polyColorDel|polyColorPerVertex|polyColorSet|polyCompare|polyCone|polyCopyUV|polyCrease|polyCreaseCtx|polyCreateFacet|polyCreateFacetCtx|polyCube|polyCut|polyCutCtx|polyCylinder|polyCylindricalProjection|polyDelEdge|polyDelFacet|polyDelVertex|polyDuplicateAndConnect|polyDuplicateEdge|polyEditUV|polyEditUVShell|polyEvaluate|polyExtrudeEdge|polyExtrudeFacet|polyExtrudeVertex|polyFlipEdge|polyFlipUV|polyForceUV|polyGeoSampler|polyHelix|polyInfo|polyInstallAction|polyLayoutUV|polyListComponentConversion|polyMapCut|polyMapDel|polyMapSew|polyMapSewMove|polyMergeEdge|polyMergeEdgeCtx|polyMergeFacet|polyMergeFacetCtx|polyMergeUV|polyMergeVertex|polyMirrorFace|polyMoveEdge|polyMoveFacet|polyMoveFacetUV|polyMoveUV|polyMoveVertex|polyNormal|polyNormalPerVertex|polyNormalizeUV|polyOptUvs|polyOptions|polyOutput|polyPipe|polyPlanarProjection|polyPlane|polyPlatonicSolid|polyPoke|polyPrimitive|polyPrism|polyProjection|polyPyramid|polyQuad|polyQueryBlindData|polyReduce|polySelect|polySelectConstraint|polySelectConstraintMonitor|polySelectCtx|polySelectEditCtx|polySeparate|polySetToFaceNormal|polySewEdge|polyShortestPathCtx|polySmooth|polySoftEdge|polySphere|polySphericalProjection|polySplit|polySplitCtx|polySplitEdge|polySplitRing|polySplitVertex|polyStraightenUVBorder|polySubdivideEdge|polySubdivideFacet|polyToSubdiv|polyTorus|polyTransfer|polyTriangulate|polyUVSet|polyUnite|polyWedgeFace|popen|popupMenu|pose|pow|preloadRefEd|print|progressBar|progressWindow|projFileViewer|projectCurve|projectTangent|projectionContext|projectionManip|promptDialog|propModCtx|propMove|psdChannelOutliner|psdEditTextureFile|psdExport|psdTextureFile|putenv|pwd|python|querySubdiv|quit|rad_to_deg|radial|radioButton|radioButtonGrp|radioCollection|radioMenuItemCollection|rampColorPort|rand|randomizeFollicles|randstate|rangeControl|readTake|rebuildCurve|rebuildSurface|recordAttr|recordDevice|redo|reference|referenceEdit|referenceQuery|refineSubdivSelectionList|refresh|refreshAE|registerPluginResource|rehash|reloadImage|removeJoint|removeMultiInstance|removePanelCategory|rename|renameAttr|renameSelectionList|renameUI|render|renderGlobalsNode|renderInfo|renderLayerButton|renderLayerParent|renderLayerPostProcess|renderLayerUnparent|renderManip|renderPartition|renderQualityNode|renderSettings|renderThumbnailUpdate|renderWindowEditor|renderWindowSelectContext|renderer|reorder|reorderDeformers|requires|reroot|resampleFluid|resetAE|resetPfxToPolyCamera|resetTool|resolutionNode|retarget|reverseCurve|reverseSurface|revolve|rgb_to_hsv|rigidBody|rigidSolver|roll|rollCtx|rootOf|rot|rotate|rotationInterpolation|roundConstantRadius|rowColumnLayout|rowLayout|runTimeCommand|runup|sampleImage|saveAllShelves|saveAttrPreset|saveFluid|saveImage|saveInitialState|saveMenu|savePrefObjects|savePrefs|saveShelf|saveToolSettings|scale|scaleBrushBrightness|scaleComponents|scaleConstraint|scaleKey|scaleKeyCtx|sceneEditor|sceneUIReplacement|scmh|scriptCtx|scriptEditorInfo|scriptJob|scriptNode|scriptTable|scriptToShelf|scriptedPanel|scriptedPanelType|scrollField|scrollLayout|sculpt|searchPathArray|seed|selLoadSettings|select|selectContext|selectCurveCV|selectKey|selectKeyCtx|selectKeyframeRegionCtx|selectMode|selectPref|selectPriority|selectType|selectedNodes|selectionConnection|separator|setAttr|setAttrEnumResource|setAttrMapping|setAttrNiceNameResource|setConstraintRestPosition|setDefaultShadingGroup|setDrivenKeyframe|setDynamic|setEditCtx|setEditor|setFluidAttr|setFocus|setInfinity|setInputDeviceMapping|setKeyCtx|setKeyPath|setKeyframe|setKeyframeBlendshapeTargetWts|setMenuMode|setNodeNiceNameResource|setNodeTypeFlag|setParent|setParticleAttr|setPfxToPolyCamera|setPluginResource|setProject|setStampDensity|setStartupMessage|setState|setToolTo|setUITemplate|setXformManip|sets|shadingConnection|shadingGeometryRelCtx|shadingLightRelCtx|shadingNetworkCompare|shadingNode|shapeCompare|shelfButton|shelfLayout|shelfTabLayout|shellField|shortNameOf|showHelp|showHidden|showManipCtx|showSelectionInTitle|showShadingGroupAttrEditor|showWindow|sign|simplify|sin|singleProfileBirailSurface|size|sizeBytes|skinCluster|skinPercent|smoothCurve|smoothTangentSurface|smoothstep|snap2to2|snapKey|snapMode|snapTogetherCtx|snapshot|soft|softMod|softModCtx|sort|sound|soundControl|source|spaceLocator|sphere|sphrand|spotLight|spotLightPreviewPort|spreadSheetEditor|spring|sqrt|squareSurface|srtContext|stackTrace|startString|startsWith|stitchAndExplodeShell|stitchSurface|stitchSurfacePoints|strcmp|stringArrayCatenate|stringArrayContains|stringArrayCount|stringArrayInsertAtIndex|stringArrayIntersector|stringArrayRemove|stringArrayRemoveAtIndex|stringArrayRemoveDuplicates|stringArrayRemoveExact|stringArrayToString|stringToStringArray|strip|stripPrefixFromName|stroke|subdAutoProjection|subdCleanTopology|subdCollapse|subdDuplicateAndConnect|subdEditUV|subdListComponentConversion|subdMapCut|subdMapSewMove|subdMatchTopology|subdMirror|subdToBlind|subdToPoly|subdTransferUVsToCache|subdiv|subdivCrease|subdivDisplaySmoothness|substitute|substituteAllString|substituteGeometry|substring|surface|surfaceSampler|surfaceShaderList|swatchDisplayPort|switchTable|symbolButton|symbolCheckBox|sysFile|system|tabLayout|tan|tangentConstraint|texLatticeDeformContext|texManipContext|texMoveContext|texMoveUVShellContext|texRotateContext|texScaleContext|texSelectContext|texSelectShortestPathCtx|texSmudgeUVContext|texWinToolCtx|text|textCurves|textField|textFieldButtonGrp|textFieldGrp|textManip|textScrollList|textToShelf|textureDisplacePlane|textureHairColor|texturePlacementContext|textureWindow|threadCount|threePointArcCtx|timeControl|timePort|timerX|toNativePath|toggle|toggleAxis|toggleWindowVisibility|tokenize|tokenizeList|tolerance|tolower|toolButton|toolCollection|toolDropped|toolHasOptions|toolPropertyWindow|torus|toupper|trace|track|trackCtx|transferAttributes|transformCompare|transformLimits|translator|trim|trunc|truncateFluidCache|truncateHairCache|tumble|tumbleCtx|turbulence|twoPointArcCtx|uiRes|uiTemplate|unassignInputDevice|undo|undoInfo|ungroup|uniform|unit|unloadPlugin|untangleUV|untitledFileName|untrim|upAxis|updateAE|userCtx|uvLink|uvSnapshot|validateShelfName|vectorize|view2dToolCtx|viewCamera|viewClipPlane|viewFit|viewHeadOn|viewLookAt|viewManip|viewPlace|viewSet|visor|volumeAxis|vortex|waitCursor|warning|webBrowser|webBrowserPrefs|whatIs|window|windowPref|wire|wireContext|workspace|wrinkle|wrinkleContext|writeTake|xbmLangPathList|xform)\b/,
	
	'operator': [
		/\+[+=]?|-[-=]?|&&|\|\||[<>]=|[*\/!=]=?|[%^]/,
		{
			// We don't want to match <<
			pattern: /(^|[^<])<(?!<)/,
			lookbehind: true
		},
		{
			// We don't want to match >>
			pattern: /(^|[^>])>(?!>)/,
			lookbehind: true
		}
	],
	'punctuation': /<<|>>|[.,:;?\[\](){}]/
};
Prism.languages.mel['code'].inside.rest = Prism.util.clone(Prism.languages.mel);

/* **********************************************
     Begin prism-matlab.js
********************************************** */

Prism.languages.matlab = {
	// We put string before comment, because of printf() patterns that contain "%"
	'string': /\B'(?:''|[^'\n])*'/,
	'comment': [
		/%\{[\s\S]*?\}%/,
		/%.+/
	],
	// FIXME We could handle imaginary numbers as a whole
	'number': /\b-?(?:\d*\.?\d+(?:[eE][+-]?\d+)?(?:[ij])?|[ij])\b/,
	'keyword': /\b(?:break|case|catch|continue|else|elseif|end|for|function|if|inf|NaN|otherwise|parfor|pause|pi|return|switch|try|while)\b/,
	'function': /(?!\d)\w+(?=\s*\()/,
	'operator': /\.?[*^\/\\']|[+\-:@]|[<>=~]=?|&&?|\|\|?/,
	'punctuation': /\.{3}|[.,;\[\](){}!]/
};

/* **********************************************
     Begin prism-markdown.js
********************************************** */

Prism.languages.markdown = Prism.languages.extend('markup', {});
Prism.languages.insertBefore('markdown', 'prolog', {
	'blockquote': {
		// > ...
		pattern: /^>(?:[\t ]*>)*/m,
		alias: 'punctuation'
	},
	'code': [
		{
			// Prefixed by 4 spaces or 1 tab
			pattern: /^(?: {4}|\t).+/m,
			alias: 'keyword'
		},
		{
			// `code`
			// ``code``
			pattern: /``.+?``|`[^`\n]+`/,
			alias: 'keyword'
		}
	],
	'title': [
		{
			// title 1
			// =======

			// title 2
			// -------
			pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
			alias: 'important',
			inside: {
				punctuation: /==+$|--+$/
			}
		},
		{
			// # title 1
			// ###### title 6
			pattern: /(^\s*)#+.+/m,
			lookbehind: true,
			alias: 'important',
			inside: {
				punctuation: /^#+|#+$/
			}
		}
	],
	'hr': {
		// ***
		// ---
		// * * *
		// -----------
		pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'list': {
		// * item
		// + item
		// - item
		// 1. item
		pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'url-reference': {
		// [id]: http://example.com "Optional title"
		// [id]: http://example.com 'Optional title'
		// [id]: http://example.com (Optional title)
		// [id]: <http://example.com> "Optional title"
		pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
		inside: {
			'variable': {
				pattern: /^(!?\[)[^\]]+/,
				lookbehind: true
			},
			'string': /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
			'punctuation': /^[\[\]!:]|[<>]/
		},
		alias: 'url'
	},
	'bold': {
		// **strong**
		// __strong__

		// Allow only one line break
		pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		inside: {
			'punctuation': /^\*\*|^__|\*\*$|__$/
		}
	},
	'italic': {
		// *em*
		// _em_

		// Allow only one line break
		pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		inside: {
			'punctuation': /^[*_]|[*_]$/
		}
	},
	'url': {
		// [example](http://example.com "Optional title")
		// [example] [id]
		pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
		inside: {
			'variable': {
				pattern: /(!?\[)[^\]]+(?=\]$)/,
				lookbehind: true
			},
			'string': {
				pattern: /"(?:\\.|[^"\\])*"(?=\)$)/
			}
		}
	}
});

Prism.languages.markdown['bold'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['italic'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['bold'].inside['italic'] = Prism.util.clone(Prism.languages.markdown['italic']);
Prism.languages.markdown['italic'].inside['bold'] = Prism.util.clone(Prism.languages.markdown['bold']);

/* **********************************************
     Begin prism-makefile.js
********************************************** */

Prism.languages.makefile = {
	'comment': {
		pattern: /(^|[^\\])#(?:\\(?:\r\n|[\s\S])|.)*/,
		lookbehind: true
	},
	'string': /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,

	// Built-in target names
	'builtin': /\.[A-Z][^:#=\s]+(?=\s*:(?!=))/,

	// Targets
	'symbol': {
		pattern: /^[^:=\r\n]+(?=\s*:(?!=))/m,
		inside: {
			'variable': /\$+(?:[^(){}:#=\s]+|(?=[({]))/
		}
	},
	'variable': /\$+(?:[^(){}:#=\s]+|\([@*%<^+?][DF]\)|(?=[({]))/,

	'keyword': [
		// Directives
		/-include\b|\b(?:define|else|endef|endif|export|ifn?def|ifn?eq|include|override|private|sinclude|undefine|unexport|vpath)\b/,
		// Functions
		{
			pattern: /(\()(?:addsuffix|abspath|and|basename|call|dir|error|eval|file|filter(?:-out)?|findstring|firstword|flavor|foreach|guile|if|info|join|lastword|load|notdir|or|origin|patsubst|realpath|shell|sort|strip|subst|suffix|value|warning|wildcard|word(?:s|list)?)(?=[ \t])/,
			lookbehind: true
		}
	],
	'operator': /(?:::|[?:+!])?=|[|@]/,
	'punctuation': /[:;(){}]/
};

/* **********************************************
     Begin prism-lolcode.js
********************************************** */

Prism.languages.lolcode = {
	'comment': [
		/\bOBTW\s+[\s\S]*?\s+TLDR\b/,
		/\bBTW.+/
	],
	'string': {
		pattern: /"(?::.|[^"])*"/,
		inside: {
			'variable': /:\{[^}]+\}/,
			'symbol': [
				/:\([a-f\d]+\)/i,
				/:\[[^\]]+\]/,
				/:[)>o":]/
			]
		}
	},
	'number': /(-|\b)\d*\.?\d+/,
	'symbol': {
		pattern: /(^|\s)(?:A )?(?:YARN|NUMBR|NUMBAR|TROOF|BUKKIT|NOOB)(?=\s|,|$)/,
		lookbehind: true,
		inside: {
			'keyword': /A(?=\s)/
		}
	},
	'label': {
		pattern: /((?:^|\s)(?:IM IN YR|IM OUTTA YR) )[a-zA-Z]\w*/,
		lookbehind: true,
		alias: 'string'
	},
	'function': {
		pattern: /((?:^|\s)(?:I IZ|HOW IZ I|IZ) )[a-zA-Z]\w*/,
		lookbehind: true
	},
	'keyword': [
		{
			pattern: /(^|\s)(?:O HAI IM|KTHX|HAI|KTHXBYE|I HAS A|ITZ(?: A)?|R|AN|MKAY|SMOOSH|MAEK|IS NOW(?: A)?|VISIBLE|GIMMEH|O RLY\?|YA RLY|NO WAI|OIC|MEBBE|WTF\?|OMG|OMGWTF|GTFO|IM IN YR|IM OUTTA YR|FOUND YR|YR|TIL|WILE|UPPIN|NERFIN|I IZ|HOW IZ I|IF U SAY SO|SRS|HAS A|LIEK(?: A)?|IZ)(?=\s|,|$)/,
			lookbehind: true
		},
		/'Z(?=\s|,|$)/
	],
	'boolean': {
		pattern: /(^|\s)(?:WIN|FAIL)(?=\s|,|$)/,
		lookbehind: true
	},
	'variable': {
		pattern: /(^|\s)IT(?=\s|,|$)/,
		lookbehind: true
	},
	'operator': {
		pattern: /(^|\s)(?:NOT|BOTH SAEM|DIFFRINT|(?:SUM|DIFF|PRODUKT|QUOSHUNT|MOD|BIGGR|SMALLR|BOTH|EITHER|WON|ALL|ANY) OF)(?=\s|,|$)/,
		lookbehind: true
	},
	'punctuation': /\.{3}|…|,|!/
};

/* **********************************************
     Begin prism-less.js
********************************************** */

/* FIXME :
 :extend() is not handled specifically : its highlighting is buggy.
 Mixin usage must be inside a ruleset to be highlighted.
 At-rules (e.g. import) containing interpolations are buggy.
 Detached rulesets are highlighted as at-rules.
 A comment before a mixin usage prevents the latter to be properly highlighted.
 */

Prism.languages.less = Prism.languages.extend('css', {
	'comment': [
		/\/\*[\w\W]*?\*\//,
		{
			pattern: /(^|[^\\])\/\/.*/,
			lookbehind: true
		}
	],
	'atrule': {
		pattern: /@[\w-]+?(?:\([^{}]+\)|[^(){};])*?(?=\s*\{)/i,
		inside: {
			'punctuation': /[:()]/
		}
	},
	// selectors and mixins are considered the same
	'selector': {
		pattern: /(?:@\{[\w-]+\}|[^{};\s@])(?:@\{[\w-]+\}|\([^{}]*\)|[^{};@])*?(?=\s*\{)/,
		inside: {
			// mixin parameters
			'variable': /@+[\w-]+/
		}
	},

	'property': /(?:@\{[\w-]+\}|[\w-])+(?:\+_?)?(?=\s*:)/i,
	'punctuation': /[{}();:,]/,
	'operator': /[+\-*\/]/
});

// Invert function and punctuation positions
Prism.languages.insertBefore('less', 'punctuation', {
	'function': Prism.languages.less.function
});

Prism.languages.insertBefore('less', 'property', {
	'variable': [
		// Variable declaration (the colon must be consumed!)
		{
			pattern: /@[\w-]+\s*:/,
			inside: {
				"punctuation": /:/
			}
		},

		// Variable usage
		/@@?[\w-]+/
	],
	'mixin-usage': {
		pattern: /([{;]\s*)[.#](?!\d)[\w-]+.*?(?=[(;])/,
		lookbehind: true,
		alias: 'function'
	}
});


/* **********************************************
     Begin prism-latex.js
********************************************** */

(function(Prism) {
	var funcPattern = /\\([^a-z()[\]]|[a-z\*]+)/i,
	    insideEqu = {
		    'equation-command': {
			    pattern: funcPattern,
			    alias: 'regex'
		    }
	    };

	Prism.languages.latex = {
		'comment': /%.*/m,
		// the verbatim environment prints whitespace to the document
		'cdata':  {
			pattern: /(\\begin\{((?:verbatim|lstlisting)\*?)\})([\w\W]*?)(?=\\end\{\2\})/,
			lookbehind: true
		},
		/*
		 * equations can be between $ $ or \( \) or \[ \]
		 * (all are multiline)
		 */
		'equation': [
			{
				pattern: /\$(?:\\?[\w\W])*?\$|\\\((?:\\?[\w\W])*?\\\)|\\\[(?:\\?[\w\W])*?\\\]/,
				inside: insideEqu,
				alias: 'string'
			},
			{
				pattern: /(\\begin\{((?:equation|math|eqnarray|align|multline|gather)\*?)\})([\w\W]*?)(?=\\end\{\2\})/,
				lookbehind: true,
				inside: insideEqu,
				alias: 'string'
			}
		],
		/*
		 * arguments which are keywords or references are highlighted
		 * as keywords
		 */
		'keyword': {
			pattern: /(\\(?:begin|end|ref|cite|label|usepackage|documentclass)(?:\[[^\]]+\])?\{)[^}]+(?=\})/,
			lookbehind: true
		},
		'url': {
			pattern: /(\\url\{)[^}]+(?=\})/,
			lookbehind: true
		},
		/*
		 * section or chapter headlines are highlighted as bold so that
		 * they stand out more
		 */
		'headline': {
			pattern: /(\\(?:part|chapter|section|subsection|frametitle|subsubsection|paragraph|subparagraph|subsubparagraph|subsubsubparagraph)\*?(?:\[[^\]]+\])?\{)[^}]+(?=\}(?:\[[^\]]+\])?)/,
			lookbehind: true,
			alias: 'class-name'
		},
		'function': {
			pattern: funcPattern,
			alias: 'selector'
		},
		'punctuation': /[[\]{}&]/
	};
})(Prism);


/* **********************************************
     Begin prism-keyman.js
********************************************** */

Prism.languages.keyman = {
	'comment': /\bc\s.*/i,
	'function': /\[\s*((CTRL|SHIFT|ALT|LCTRL|RCTRL|LALT|RALT|CAPS|NCAPS)\s+)*([TKU]_[a-z0-9_?]+|".+?"|'.+?')\s*\]/i,  // virtual key
	'string': /("|')((?!\1).)*\1/,
	'bold': [   // header statements, system stores and variable system stores
		/&(baselayout|bitmap|capsononly|capsalwaysoff|shiftfreescaps|copyright|ethnologuecode|hotkey|includecodes|keyboardversion|kmw_embedcss|kmw_embedjs|kmw_helpfile|kmw_helptext|kmw_rtl|language|layer|layoutfile|message|mnemoniclayout|name|oldcharposmatching|platform|targets|version|visualkeyboard|windowslanguages)\b/i,
		/\b(bitmap|bitmaps|caps on only|caps always off|shift frees caps|copyright|hotkey|language|layout|message|name|version)\b/i
	],
	'keyword': /\b(any|baselayout|beep|call|context|deadkey|dk|if|index|layer|notany|nul|outs|platform|return|reset|save|set|store|use)\b/i,  // rule keywords
	'atrule': /\b(ansi|begin|unicode|group|using keys|match|nomatch)\b/i,   // structural keywords
	'number': /\b(U\+[\dA-F]+|d\d+|x[\da-f]+|\d+)\b/i, // U+####, x###, d### characters and numbers
	'operator': /[+>\\,()]/,
	'tag': /\$(keyman|kmfl|weaver|keymanweb|keymanonly):/i   // prefixes
};

/* **********************************************
     Begin prism-julia.js
********************************************** */

Prism.languages.julia= {
	'comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true
	},
	'string': /"""[\s\S]+?"""|'''[\s\S]+?'''|("|')(\\?.)*?\1/,
	'keyword' : /\b(abstract|baremodule|begin|bitstype|break|catch|ccall|const|continue|do|else|elseif|end|export|finally|for|function|global|if|immutable|import|importall|let|local|macro|module|print|println|quote|return|try|type|typealias|using|while)\b/,
	'boolean' : /\b(true|false)\b/,
	'number' : /\b-?(0[box])?(?:[\da-f]+\.?\d*|\.\d+)(?:[efp][+-]?\d+)?j?\b/i,
	'operator': /\+=?|-=?|\*=?|\/[\/=]?|\\=?|\^=?|%=?|÷=?|!=?=?|&=?|\|[=>]?|\$=?|<(?:<=?|[=:])?|>(?:=|>>?=?)?|==?=?|[~≠≤≥]/,
	'punctuation' : /[{}[\];(),.:]/
};

/* **********************************************
     Begin prism-jade.js
********************************************** */

(function(Prism) {
	// TODO:
	// - Add CSS highlighting inside <style> tags
	// - Add support for multi-line code blocks
	// - Add support for interpolation #{} and !{}
	// - Add support for tag interpolation #[]
	// - Add explicit support for plain text using |
	// - Add support for markup embedded in plain text

	Prism.languages.jade = {

		// Multiline stuff should appear before the rest

		// This handles both single-line and multi-line comments
		'comment': {
			pattern: /(^([\t ]*))\/\/.*((?:\r?\n|\r)\2[\t ]+.+)*/m,
			lookbehind: true
		},

		// All the tag-related part is in lookbehind
		// so that it can be highlighted by the "tag" pattern
		'multiline-script': {
			pattern: /(^([\t ]*)script\b.*\.[\t ]*)((?:\r?\n|\r(?!\n))(?:\2[\t ]+.+|\s*?(?=\r?\n|\r)))+/m,
			lookbehind: true,
			inside: {
				rest: Prism.languages.javascript
			}
		},

		// See at the end of the file for known filters
		'filter': {
			pattern: /(^([\t ]*)):.+((?:\r?\n|\r(?!\n))(?:\2[\t ]+.+|\s*?(?=\r?\n|\r)))+/m,
			lookbehind: true,
			inside: {
				'filter-name': {
					pattern: /^:[\w-]+/,
					alias: 'variable'
				}
			}
		},

		'multiline-plain-text': {
			pattern: /(^([\t ]*)[\w\-#.]+\.[\t ]*)((?:\r?\n|\r(?!\n))(?:\2[\t ]+.+|\s*?(?=\r?\n|\r)))+/m,
			lookbehind: true
		},
		'markup': {
			pattern: /(^[\t ]*)<.+/m,
			lookbehind: true,
			inside: {
				rest: Prism.languages.markup
			}
		},
		'doctype': {
			pattern: /((?:^|\n)[\t ]*)doctype(?: .+)?/,
			lookbehind: true
		},

		// This handle all conditional and loop keywords
		'flow-control': {
			pattern: /(^[\t ]*)(?:if|unless|else|case|when|default|each|while)\b(?: .+)?/m,
			lookbehind: true,
			inside: {
				'each': {
					pattern: /^each .+? in\b/,
					inside: {
						'keyword': /\b(?:each|in)\b/,
						'punctuation': /,/
					}
				},
				'branch': {
					pattern: /^(?:if|unless|else|case|when|default|while)\b/,
					alias: 'keyword'
				},
				rest: Prism.languages.javascript
			}
		},
		'keyword': {
			pattern: /(^[\t ]*)(?:block|extends|include|append|prepend)\b.+/m,
			lookbehind: true
		},
		'mixin': [
			// Declaration
			{
				pattern: /(^[\t ]*)mixin .+/m,
				lookbehind: true,
				inside: {
					'keyword': /^mixin/,
					'function': /\w+(?=\s*\(|\s*$)/,
					'punctuation': /[(),.]/
				}
			},
			// Usage
			{
				pattern: /(^[\t ]*)\+.+/m,
				lookbehind: true,
				inside: {
					'name': {
						pattern: /^\+\w+/,
						alias: 'function'
					},
					'rest': Prism.languages.javascript
				}
			}
		],
		'script': {
			pattern: /(^[\t ]*script(?:(?:&[^(]+)?\([^)]+\))*[\t ]+).+/m,
			lookbehind: true,
			inside: {
				rest: Prism.languages.javascript
			}
		},

		'plain-text': {
			pattern: /(^[\t ]*(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?[\t ]+).+/m,
			lookbehind: true
		},
		'tag': {
			pattern: /(^[\t ]*)(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?:?/m,
			lookbehind: true,
			inside: {
				'attributes': [
					{
						pattern: /&[^(]+\([^)]+\)/,
						inside: {
							rest: Prism.languages.javascript
						}
					},
					{
						pattern: /\([^)]+\)/,
						inside: {
							'attr-value': {
								pattern: /(=\s*)(?:\{[^}]*\}|[^,)\r\n]+)/,
								lookbehind: true,
								inside: {
									rest: Prism.languages.javascript
								}
							},
							'attr-name': /[\w-]+(?=\s*!?=|\s*[,)])/,
							'punctuation': /[!=(),]+/
						}
					}
				],
				'punctuation': /:/
			}
		},
		'code': [
			{
				pattern: /(^[\t ]*(?:-|!?=)).+/m,
				lookbehind: true,
				inside: {
					rest: Prism.languages.javascript
				}
			}
		],
		'punctuation': /[.\-!=|]+/
	};

	var filter_pattern = '(^([\\t ]*)):{{filter_name}}((?:\\r?\\n|\\r(?!\\n))(?:\\2[\\t ]+.+|\\s*?(?=\\r?\\n|\\r)))+';

	// Non exhaustive list of available filters and associated languages
	var filters = [
		{filter:'atpl',language:'twig'},
		{filter:'coffee',language:'coffeescript'},
		'ejs',
		'handlebars',
		'hogan',
		'less',
		'livescript',
		'markdown',
		'mustache',
		'plates',
		{filter:'sass',language:'scss'},
		'stylus',
		'swig'

	];
	var all_filters = {};
	for (var i = 0, l = filters.length; i < l; i++) {
		var filter = filters[i];
		filter = typeof filter === 'string' ? {filter: filter, language: filter} : filter;
		if (Prism.languages[filter.language]) {
			all_filters['filter-' + filter.filter] = {
				pattern: RegExp(filter_pattern.replace('{{filter_name}}', filter.filter), 'm'),
				lookbehind: true,
				inside: {
					'filter-name': {
						pattern: /^:[\w-]+/,
						alias: 'variable'
					},
					rest: Prism.languages[filter.language]
				}
			}
		}
	}

	Prism.languages.insertBefore('jade', 'filter', all_filters);

}(Prism));

/* **********************************************
     Begin prism-j.js
********************************************** */

Prism.languages.j = {
	'comment': /\bNB\..*/,
	'string': /'(?:''|[^'\r\n])*'/,
	'keyword': /\b(?:(?:adverb|conjunction|CR|def|define|dyad|LF|monad|noun|verb)\b|(?:assert|break|case|catch[dt]?|continue|do|else|elseif|end|fcase|for|for_\w+|goto_\w+|if|label_\w+|return|select|throw|try|while|whilst)\.)/,
	'verb': {
		// Negative look-ahead prevents bad highlighting
		// of ^: ;. =. =: !. !:
		pattern: /(?!\^:|;\.|[=!][.:])(?:\{(?:\.|::?)?|p(?:\.\.?|:)|[=!\]]|[<>+*\-%$|,#][.:]?|[\^?]\.?|[;\[]:?|[~}"i][.:]|[ACeEIjLor]\.|(?:[_\/\\qsux]|_?\d):)/,
		alias: 'keyword'
	},
	'number': /\b_?(?:(?!\d:)\d+(?:\.\d+)?(?:(?:[ejpx]|ad|ar)_?\d+(?:\.\d+)?)*(?:b_?[\da-z]+(?:\.[\da-z]+)?)?|_(?!\.))/,
	'adverb': {
		pattern: /[~}]|[\/\\]\.?|[bfM]\.|t[.:]/,
		alias: 'builtin'
	},
	'operator': /[=a][.:]|_\./,
	'conjunction': {
		pattern: /&(?:\.:?|:)?|[.:@][.:]?|[!D][.:]|[;dHT]\.|`:?|[\^LS]:|"/,
		alias: 'variable'
	},
	'punctuation': /[()]/
};

/* **********************************************
     Begin prism-ini.js
********************************************** */

Prism.languages.ini= {
	'comment': /^[ \t]*;.*$/m,
	'important': /\[.*?\]/,
	'constant': /^[ \t]*[^\s=]+?(?=[ \t]*=)/m,
	'attr-value': {
		pattern: /=.*/,
		inside: {
			'punctuation': /^[=]/
		}
	}
};

/* **********************************************
     Begin prism-inform7.js
********************************************** */

Prism.languages.inform7 = {
	'string': {
		pattern: /"[^"]*"/,
		inside: {
			'substitution': {
				pattern: /\[[^\]]+\]/,
				inside: {
					'delimiter': {
						pattern:/\[|\]/,
						alias: 'punctuation'
					}
					// See rest below
				}
			}
		}
	},
	'comment': /\[[^\]]+\]/,
	'title': {
		pattern: /^[ \t]*(?:volume|book|part(?! of)|chapter|section|table)\b.+/im,
		alias: 'important'
	},
	'number': {
		pattern: /(^|[^-])(?:(?:\b|-)\d+(?:\.\d+)?(?:\^\d+)?\w*|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve))\b(?!-)/i,
		lookbehind: true
	},
	'verb': {
		pattern: /(^|[^-])\b(?:applying to|are|attacking|answering|asking|be(?:ing)?|burning|buying|called|carries|carry(?! out)|carrying|climbing|closing|conceal(?:s|ing)?|consulting|contain(?:s|ing)?|cutting|drinking|dropping|eating|enclos(?:es?|ing)|entering|examining|exiting|getting|giving|going|ha(?:ve|s|ving)|hold(?:s|ing)?|impl(?:y|ies)|incorporat(?:es?|ing)|inserting|is|jumping|kissing|listening|locking|looking|mean(?:s|ing)?|opening|provid(?:es?|ing)|pulling|pushing|putting|relat(?:es?|ing)|removing|searching|see(?:s|ing)?|setting|showing|singing|sleeping|smelling|squeezing|switching|support(?:s|ing)?|swearing|taking|tasting|telling|thinking|throwing|touching|turning|tying|unlock(?:s|ing)?|var(?:y|ies|ying)|waiting|waking|waving|wear(?:s|ing)?)\b(?!-)/i,
		lookbehind: true,
		alias: 'operator'
	},
	'keyword': {
		pattern: /(^|[^-])\b(?:after|before|carry out|check|continue the action|definition(?= *:)|do nothing|else|end (?:if|unless|the story)|every turn|if|include|instead(?: of)?|let|move|no|now|otherwise|repeat|report|resume the story|rule for|running through|say(?:ing)?|stop the action|test|try(?:ing)?|understand|unless|use|when|while|yes)\b(?!-)/i,
		lookbehind: true
	},
	'property': {
		pattern: /(^|[^-])\b(?:adjacent(?! to)|carried|closed|concealed|contained|dark|described|edible|empty|enclosed|enterable|even|female|fixed in place|full|handled|held|improper-named|incorporated|inedible|invisible|lighted|lit|lock(?:able|ed)|male|marked for listing|mentioned|negative|neuter|non-(?:empty|full|recurring)|odd|opaque|open(?:able)?|plural-named|portable|positive|privately-named|proper-named|provided|publically-named|pushable between rooms|recurring|related|rubbing|scenery|seen|singular-named|supported|swinging|switch(?:able|ed(?: on| off)?)|touch(?:able|ed)|transparent|unconcealed|undescribed|unlit|unlocked|unmarked for listing|unmentioned|unopenable|untouchable|unvisited|variable|visible|visited|wearable|worn)\b(?!-)/i,
		lookbehind: true,
		alias: 'symbol'
	},
	'position': {
		pattern: /(^|[^-])\b(?:above|adjacent to|back side of|below|between|down|east|everywhere|front side|here|in|inside(?: from)?|north(?:east|west)?|nowhere|on(?: top of)?|other side|outside(?: from)?|parts? of|regionally in|south(?:east|west)?|through|up|west|within)\b(?!-)/i,
		lookbehind: true,
		alias: 'keyword'
	},
	'type': {
		pattern: /(^|[^-])\b(?:actions?|activit(?:y|ies)|actors?|animals?|backdrops?|containers?|devices?|directions?|doors?|holders?|kinds?|lists?|m[ae]n|nobody|nothing|nouns?|numbers?|objects?|people|persons?|player(?:'s holdall)?|regions?|relations?|rooms?|rule(?:book)?s?|scenes?|someone|something|supporters?|tables?|texts?|things?|time|vehicles?|wom[ae]n)\b(?!-)/i,
		lookbehind: true,
		alias: 'variable'
	},
	'punctuation': /[.,:;(){}]/
};

Prism.languages.inform7['string'].inside['substitution'].inside.rest = Prism.util.clone(Prism.languages.inform7);
// We don't want the remaining text in the substitution to be highlighted as the string.
Prism.languages.inform7['string'].inside['substitution'].inside.rest.text = {
	pattern: /\S(?:\s*\S)*/,
	alias: 'comment'
};

/* **********************************************
     Begin prism-http.js
********************************************** */

Prism.languages.http = {
	'request-line': {
		pattern: /^(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b\shttps?:\/\/\S+\sHTTP\/[0-9.]+/m,
		inside: {
			// HTTP Verb
			property: /^(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b/,
			// Path or query argument
			'attr-name': /:\w+/
		}
	},
	'response-status': {
		pattern: /^HTTP\/1.[01] [0-9]+.*/m,
		inside: {
			// Status, e.g. 200 OK
			property: {
                pattern: /(^HTTP\/1.[01] )[0-9]+.*/i,
                lookbehind: true
            }
		}
	},
	// HTTP header name
	'header-name': {
        pattern: /^[\w-]+:(?=.)/m,
        alias: 'keyword'
    }
};

// Create a mapping of Content-Type headers to language definitions
var httpLanguages = {
	'application/json': Prism.languages.javascript,
	'application/xml': Prism.languages.markup,
	'text/xml': Prism.languages.markup,
	'text/html': Prism.languages.markup
};

// Insert each content type parser that has its associated language
// currently loaded.
for (var contentType in httpLanguages) {
	if (httpLanguages[contentType]) {
		var options = {};
		options[contentType] = {
			pattern: new RegExp('(content-type:\\s*' + contentType + '[\\w\\W]*?)(?:\\r?\\n|\\r){2}[\\w\\W]*', 'i'),
			lookbehind: true,
			inside: {
				rest: httpLanguages[contentType]
			}
		};
		Prism.languages.insertBefore('http', 'header-name', options);
	}
}


/* **********************************************
     Begin prism-haskell.js
********************************************** */

Prism.languages.haskell= {
	'comment': {
		pattern: /(^|[^-!#$%*+=?&@|~.:<>^\\\/])(--[^-!#$%*+=?&@|~.:<>^\\\/].*|{-[\w\W]*?-})/m,
		lookbehind: true
	},
	'char': /'([^\\']|\\([abfnrtv\\"'&]|\^[A-Z@[\]\^_]|NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|\d+|o[0-7]+|x[0-9a-fA-F]+))'/,
	'string': /"([^\\"]|\\([abfnrtv\\"'&]|\^[A-Z@[\]\^_]|NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|\d+|o[0-7]+|x[0-9a-fA-F]+)|\\\s+\\)*"/,
	'keyword' : /\b(case|class|data|deriving|do|else|if|in|infixl|infixr|instance|let|module|newtype|of|primitive|then|type|where)\b/,
	'import_statement' : {
		// The imported or hidden names are not included in this import
		// statement. This is because we want to highlight those exactly like
		// we do for the names in the program.
		pattern: /(\r?\n|\r|^)\s*import\s+(qualified\s+)?([A-Z][_a-zA-Z0-9']*)(\.[A-Z][_a-zA-Z0-9']*)*(\s+as\s+([A-Z][_a-zA-Z0-9']*)(\.[A-Z][_a-zA-Z0-9']*)*)?(\s+hiding\b)?/m,
		inside: {
			'keyword': /\b(import|qualified|as|hiding)\b/
		}
	},
	// These are builtin variables only. Constructors are highlighted later as a constant.
	'builtin': /\b(abs|acos|acosh|all|and|any|appendFile|approxRational|asTypeOf|asin|asinh|atan|atan2|atanh|basicIORun|break|catch|ceiling|chr|compare|concat|concatMap|const|cos|cosh|curry|cycle|decodeFloat|denominator|digitToInt|div|divMod|drop|dropWhile|either|elem|encodeFloat|enumFrom|enumFromThen|enumFromThenTo|enumFromTo|error|even|exp|exponent|fail|filter|flip|floatDigits|floatRadix|floatRange|floor|fmap|foldl|foldl1|foldr|foldr1|fromDouble|fromEnum|fromInt|fromInteger|fromIntegral|fromRational|fst|gcd|getChar|getContents|getLine|group|head|id|inRange|index|init|intToDigit|interact|ioError|isAlpha|isAlphaNum|isAscii|isControl|isDenormalized|isDigit|isHexDigit|isIEEE|isInfinite|isLower|isNaN|isNegativeZero|isOctDigit|isPrint|isSpace|isUpper|iterate|last|lcm|length|lex|lexDigits|lexLitChar|lines|log|logBase|lookup|map|mapM|mapM_|max|maxBound|maximum|maybe|min|minBound|minimum|mod|negate|not|notElem|null|numerator|odd|or|ord|otherwise|pack|pi|pred|primExitWith|print|product|properFraction|putChar|putStr|putStrLn|quot|quotRem|range|rangeSize|read|readDec|readFile|readFloat|readHex|readIO|readInt|readList|readLitChar|readLn|readOct|readParen|readSigned|reads|readsPrec|realToFrac|recip|rem|repeat|replicate|return|reverse|round|scaleFloat|scanl|scanl1|scanr|scanr1|seq|sequence|sequence_|show|showChar|showInt|showList|showLitChar|showParen|showSigned|showString|shows|showsPrec|significand|signum|sin|sinh|snd|sort|span|splitAt|sqrt|subtract|succ|sum|tail|take|takeWhile|tan|tanh|threadToIOResult|toEnum|toInt|toInteger|toLower|toRational|toUpper|truncate|uncurry|undefined|unlines|until|unwords|unzip|unzip3|userError|words|writeFile|zip|zip3|zipWith|zipWith3)\b/,
	// decimal integers and floating point numbers | octal integers | hexadecimal integers
	'number' : /\b(\d+(\.\d+)?(e[+-]?\d+)?|0o[0-7]+|0x[0-9a-f]+)\b/i,
	// Most of this is needed because of the meaning of a single '.'.
	// If it stands alone freely, it is the function composition.
	// It may also be a separator between a module name and an identifier => no
	// operator. If it comes together with other special characters it is an
	// operator too.
	'operator' : /\s\.\s|[-!#$%*+=?&@|~.:<>^\\\/]*\.[-!#$%*+=?&@|~.:<>^\\\/]+|[-!#$%*+=?&@|~.:<>^\\\/]+\.[-!#$%*+=?&@|~.:<>^\\\/]*|[-!#$%*+=?&@|~:<>^\\\/]+|`([A-Z][_a-zA-Z0-9']*\.)*[_a-z][_a-zA-Z0-9']*`/,
	// In Haskell, nearly everything is a variable, do not highlight these.
	'hvariable': /\b([A-Z][_a-zA-Z0-9']*\.)*[_a-z][_a-zA-Z0-9']*\b/,
	'constant': /\b([A-Z][_a-zA-Z0-9']*\.)*[A-Z][_a-zA-Z0-9']*\b/,
	'punctuation' : /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-handlebars.js
********************************************** */

(function(Prism) {

	var handlebars_pattern = /\{\{\{[\w\W]+?\}\}\}|\{\{[\w\W]+?\}\}/g;

	Prism.languages.handlebars = Prism.languages.extend('markup', {
		'handlebars': {
			pattern: handlebars_pattern,
			inside: {
				'delimiter': {
					pattern: /^\{\{\{?|\}\}\}?$/i,
					alias: 'punctuation'
				},
				'string': /(["'])(\\?.)*?\1/,
				'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee][+-]?\d+)?)\b/,
				'boolean': /\b(true|false)\b/,
				'block': {
					pattern: /^(\s*~?\s*)[#\/]\S+?(?=\s*~?\s*$|\s)/i,
					lookbehind: true,
					alias: 'keyword'
				},
				'brackets': {
					pattern: /\[[^\]]+\]/,
					inside: {
						punctuation: /\[|\]/,
						variable: /[\w\W]+/
					}
				},
				'punctuation': /[!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]/,
				'variable': /[^!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~\s]+/
			}
		}
	});

	// Comments are inserted at top so that they can
	// surround markup
	Prism.languages.insertBefore('handlebars', 'tag', {
		'handlebars-comment': {
			pattern: /\{\{![\w\W]*?\}\}/,
			alias: ['handlebars','comment']
		}
	});

	// Tokenize all inline Handlebars expressions that are wrapped in {{ }} or {{{ }}}
	// This allows for easy Handlebars + markup highlighting
	Prism.hooks.add('before-highlight', function(env) {
		if (env.language !== 'handlebars') {
			return;
		}

		env.tokenStack = [];

		env.backupCode = env.code;
		env.code = env.code.replace(handlebars_pattern, function(match) {
			env.tokenStack.push(match);

			return '___HANDLEBARS' + env.tokenStack.length + '___';
		});
	});

	// Restore env.code for other plugins (e.g. line-numbers)
	Prism.hooks.add('before-insert', function(env) {
		if (env.language === 'handlebars') {
			env.code = env.backupCode;
			delete env.backupCode;
		}
	});

	// Re-insert the tokens after highlighting
	// and highlight them with defined grammar
	Prism.hooks.add('after-highlight', function(env) {
		if (env.language !== 'handlebars') {
			return;
		}

		for (var i = 0, t; t = env.tokenStack[i]; i++) {
			// The replace prevents $$, $&, $`, $', $n, $nn from being interpreted as special patterns
			env.highlightedCode = env.highlightedCode.replace('___HANDLEBARS' + (i + 1) + '___', Prism.highlight(t, env.grammar, 'handlebars').replace(/\$/g, '$$$$'));
		}

		env.element.innerHTML = env.highlightedCode;
	});

}(Prism));


/* **********************************************
     Begin prism-haml.js
********************************************** */

/* TODO
	Handle multiline code after tag
	    %foo= some |
			multiline |
			code |
*/

(function(Prism) {

	Prism.languages.haml = {
		// Multiline stuff should appear before the rest

		'multiline-comment': {
			pattern: /((?:^|\r?\n|\r)([\t ]*))(?:\/|-#).*((?:\r?\n|\r)\2[\t ]+.+)*/,
			lookbehind: true,
			alias: 'comment'
		},

		'multiline-code': [
			{
				pattern: /((?:^|\r?\n|\r)([\t ]*)(?:[~-]|[&!]?=)).*,[\t ]*((?:\r?\n|\r)\2[\t ]+.*,[\t ]*)*((?:\r?\n|\r)\2[\t ]+.+)/,
				lookbehind: true,
				inside: {
					rest: Prism.languages.ruby
				}
			},
			{
				pattern: /((?:^|\r?\n|\r)([\t ]*)(?:[~-]|[&!]?=)).*\|[\t ]*((?:\r?\n|\r)\2[\t ]+.*\|[\t ]*)*/,
				lookbehind: true,
				inside: {
					rest: Prism.languages.ruby
				}
			}
		],

		// See at the end of the file for known filters
		'filter': {
			pattern: /((?:^|\r?\n|\r)([\t ]*)):[\w-]+((?:\r?\n|\r)(?:\2[\t ]+.+|\s*?(?=\r?\n|\r)))+/,
			lookbehind: true,
			inside: {
				'filter-name': {
					pattern: /^:[\w-]+/,
					alias: 'variable'
				}
			}
		},

		'markup': {
			pattern: /((?:^|\r?\n|\r)[\t ]*)<.+/,
			lookbehind: true,
			inside: {
				rest: Prism.languages.markup
			}
		},
		'doctype': {
			pattern: /((?:^|\r?\n|\r)[\t ]*)!!!(?: .+)?/,
			lookbehind: true
		},
		'tag': {
			// Allows for one nested group of braces
			pattern: /((?:^|\r?\n|\r)[\t ]*)[%.#][\w\-#.]*[\w\-](?:\([^)]+\)|\{(?:\{[^}]+\}|[^}])+\}|\[[^\]]+\])*[\/<>]*/,
			lookbehind: true,
			inside: {
				'attributes': [
					{
						// Lookbehind tries to prevent interpolations for breaking it all
						// Allows for one nested group of braces
						pattern: /(^|[^#])\{(?:\{[^}]+\}|[^}])+\}/,
						lookbehind: true,
						inside: {
							rest: Prism.languages.ruby
						}
					},
					{
						pattern: /\([^)]+\)/,
						inside: {
							'attr-value': {
								pattern: /(=\s*)(?:"(?:\\?.)*?"|[^)\s]+)/,
								lookbehind: true
							},
							'attr-name': /[\w:-]+(?=\s*!?=|\s*[,)])/,
							'punctuation': /[=(),]/
						}
					},
					{
						pattern: /\[[^\]]+\]/,
						inside: {
							rest: Prism.languages.ruby
						}
					}
				],
				'punctuation': /[<>]/
			}
		},
		'code': {
			pattern: /((?:^|\r?\n|\r)[\t ]*(?:[~-]|[&!]?=)).+/,
			lookbehind: true,
			inside: {
				rest: Prism.languages.ruby
			}
		},
		// Interpolations in plain text
		'interpolation': {
			pattern: /#\{[^}]+\}/,
			inside: {
				'delimiter': {
					pattern: /^#\{|\}$/,
					alias: 'punctuation'
				},
				rest: Prism.languages.ruby
			}
		},
		'punctuation': {
			pattern: /((?:^|\r?\n|\r)[\t ]*)[~=\-&!]+/,
			lookbehind: true
		}
	};

	var filter_pattern = '((?:^|\\r?\\n|\\r)([\\t ]*)):{{filter_name}}((?:\\r?\\n|\\r)(?:\\2[\\t ]+.+|\\s*?(?=\\r?\\n|\\r)))+';

	// Non exhaustive list of available filters and associated languages
	var filters = [
		'css',
		{filter:'coffee',language:'coffeescript'},
		'erb',
		'javascript',
		'less',
		'markdown',
		'ruby',
		'scss',
		'textile'
	];
	var all_filters = {};
	for (var i = 0, l = filters.length; i < l; i++) {
		var filter = filters[i];
		filter = typeof filter === 'string' ? {filter: filter, language: filter} : filter;
		if (Prism.languages[filter.language]) {
			all_filters['filter-' + filter.filter] = {
				pattern: RegExp(filter_pattern.replace('{{filter_name}}', filter.filter)),
				lookbehind: true,
				inside: {
					'filter-name': {
						pattern: /^:[\w-]+/,
						alias: 'variable'
					},
					rest: Prism.languages[filter.language]
				}
			}
		}
	}

	Prism.languages.insertBefore('haml', 'filter', all_filters);

}(Prism));

/* **********************************************
     Begin prism-groovy.js
********************************************** */

Prism.languages.groovy = Prism.languages.extend('clike', {
	'keyword': /\b(as|def|in|abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|trait|transient|try|void|volatile|while)\b/,
	'string': /("""|''')[\W\w]*?\1|("|'|\/)(?:\\?.)*?\2|(\$\/)(\$\/\$|[\W\w])*?\/\$/,
	'number': /\b(?:0b[01_]+|0x[\da-f_]+(?:\.[\da-f_p\-]+)?|[\d_]+(?:\.[\d_]+)?(?:e[+-]?[\d]+)?)[glidf]?\b/i,
	'operator': {
		pattern: /(^|[^.])(~|==?~?|\?[.:]?|\*(?:[.=]|\*=?)?|\.[@&]|\.\.<|\.{1,2}(?!\.)|-[-=>]?|\+[+=]?|!=?|<(?:<=?|=>?)?|>(?:>>?=?|=)?|&[&=]?|\|[|=]?|\/=?|\^=?|%=?)/,
		lookbehind: true
	},
	'punctuation': /\.+|[{}[\];(),:$]/
});

Prism.languages.insertBefore('groovy', 'string', {
	'shebang': {
		pattern: /#!.+/,
		alias: 'comment'
	}
});

Prism.languages.insertBefore('groovy', 'punctuation', {
	'spock-block': /\b(setup|given|when|then|and|cleanup|expect|where):/
});

Prism.languages.insertBefore('groovy', 'function', {
	'annotation': {
		pattern: /(^|[^.])@\w+/,
		lookbehind: true
	}
});

// Handle string interpolation
Prism.hooks.add('wrap', function(env) {
	if (env.language === 'groovy' && env.type === 'string') {
		var delimiter = env.content[0];

		if (delimiter != "'") {
			var pattern = /([^\\])(\$(\{.*?\}|[\w\.]+))/;
			if (delimiter === '$') {
				pattern = /([^\$])(\$(\{.*?\}|[\w\.]+))/;
			}
			env.content = Prism.highlight(env.content, {
				'expression': {
					pattern: pattern,
					lookbehind: true,
					inside: Prism.languages.groovy
				}
			});

			env.classes.push(delimiter === '/' ? 'regex' : 'gstring');
		}
	}
});


/* **********************************************
     Begin prism-go.js
********************************************** */

Prism.languages.go = Prism.languages.extend('clike', {
	'keyword': /\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
	'builtin': /\b(bool|byte|complex(64|128)|error|float(32|64)|rune|string|u?int(8|16|32|64|)|uintptr|append|cap|close|complex|copy|delete|imag|len|make|new|panic|print(ln)?|real|recover)\b/,
	'boolean': /\b(_|iota|nil|true|false)\b/,
	'operator': /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
	'number': /\b(-?(0x[a-f\d]+|(\d+\.?\d*|\.\d+)(e[-+]?\d+)?)i?)\b/i,
	'string': /("|'|`)(\\?.|\r|\n)*?\1/
});
delete Prism.languages.go['class-name'];


/* **********************************************
     Begin prism-glsl.js
********************************************** */

Prism.languages.glsl = Prism.languages.extend('clike', {
	'comment': [
		/\/\*[\w\W]*?\*\//,
		/\/\/(?:\\(?:\r\n|[\s\S])|.)*/
	],
	'number': /\b(?:0x[\da-f]+|(?:\.\d+|\d+\.?\d*)(?:e[+-]?\d+)?)[ulf]*\b/i,
	'keyword': /\b(?:attribute|const|uniform|varying|buffer|shared|coherent|volatile|restrict|readonly|writeonly|atomic_uint|layout|centroid|flat|smooth|noperspective|patch|sample|break|continue|do|for|while|switch|case|default|if|else|subroutine|in|out|inout|float|double|int|void|bool|true|false|invariant|precise|discard|return|d?mat[234](?:x[234])?|[ibdu]?vec[234]|uint|lowp|mediump|highp|precision|[iu]?sampler[123]D|[iu]?samplerCube|sampler[12]DShadow|samplerCubeShadow|[iu]?sampler[12]DArray|sampler[12]DArrayShadow|[iu]?sampler2DRect|sampler2DRectShadow|[iu]?samplerBuffer|[iu]?sampler2DMS(?:Array)?|[iu]?samplerCubeArray|samplerCubeArrayShadow|[iu]?image[123]D|[iu]?image2DRect|[iu]?imageCube|[iu]?imageBuffer|[iu]?image[12]DArray|[iu]?imageCubeArray|[iu]?image2DMS(?:Array)?|struct|common|partition|active|asm|class|union|enum|typedef|template|this|resource|goto|inline|noinline|public|static|extern|external|interface|long|short|half|fixed|unsigned|superp|input|output|hvec[234]|fvec[234]|sampler3DRect|filter|sizeof|cast|namespace|using)\b/
});

Prism.languages.insertBefore('glsl', 'comment', {
	'preprocessor': {
		pattern: /(^[ \t]*)#(?:(?:define|undef|if|ifdef|ifndef|else|elif|endif|error|pragma|extension|version|line)\b)?/m,
		lookbehind: true,
		alias: 'builtin'
	}
});

/* **********************************************
     Begin prism-git.js
********************************************** */

Prism.languages.git = {
	/*
	 * A simple one line comment like in a git status command
	 * For instance:
	 * $ git status
	 * # On branch infinite-scroll
	 * # Your branch and 'origin/sharedBranches/frontendTeam/infinite-scroll' have diverged,
	 * # and have 1 and 2 different commits each, respectively.
	 * nothing to commit (working directory clean)
	 */
	'comment': /^#.*/m,

	/*
	 * Regexp to match the changed lines in a git diff output. Check the example below.
	 */
	'deleted': /^[-–].*/m,
	'inserted': /^\+.*/m,

	/*
	 * a string (double and simple quote)
	 */
	'string': /("|')(\\?.)*?\1/m,

	/*
	 * a git command. It starts with a random prompt finishing by a $, then "git" then some other parameters
	 * For instance:
	 * $ git add file.txt
	 */
	'command': {
		pattern: /^.*\$ git .*$/m,
		inside: {
			/*
			 * A git command can contain a parameter starting by a single or a double dash followed by a string
			 * For instance:
			 * $ git diff --cached
			 * $ git log -p
			 */
			'parameter': /\s(--|-)\w+/m
		}
	},

	/*
	 * Coordinates displayed in a git diff command
	 * For instance:
	 * $ git diff
	 * diff --git file.txt file.txt
	 * index 6214953..1d54a52 100644
	 * --- file.txt
	 * +++ file.txt
	 * @@ -1 +1,2 @@
	 * -Here's my tetx file
	 * +Here's my text file
	 * +And this is the second line
	 */
	'coord': /^@@.*@@$/m,

	/*
	 * Match a "commit [SHA1]" line in a git log output.
	 * For instance:
	 * $ git log
	 * commit a11a14ef7e26f2ca62d4b35eac455ce636d0dc09
	 * Author: lgiraudel
	 * Date:   Mon Feb 17 11:18:34 2014 +0100
	 *
	 *     Add of a new line
	 */
	'commit_sha1': /^commit \w{40}$/m
};


/* **********************************************
     Begin prism-gherkin.js
********************************************** */

Prism.languages.gherkin = {
	'pystring': {
		pattern: /("""|''')[\s\S]+?\1/,
		alias: 'string'
	},
	'comment': {
		pattern: /((^|\r?\n|\r)[ \t]*)#.*/,
		lookbehind: true
	},
	'tag': {
		pattern: /((^|\r?\n|\r)[ \t]*)@\S*/,
		lookbehind: true
	},
	'feature': {
		pattern: /((^|\r?\n|\r)[ \t]*)(Ability|Ahoy matey!|Arwedd|Aspekt|Besigheid Behoefte|Business Need|Caracteristica|Característica|Egenskab|Egenskap|Eiginleiki|Feature|Fīča|Fitur|Fonctionnalité|Fonksyonalite|Funcionalidade|Funcionalitat|Functionalitate|Funcţionalitate|Funcționalitate|Functionaliteit|Fungsi|Funkcia|Funkcija|Funkcionalitāte|Funkcionalnost|Funkcja|Funksie|Funktionalität|Funktionalitéit|Funzionalità|Hwaet|Hwæt|Jellemző|Karakteristik|laH|Lastnost|Mak|Mogucnost|Mogućnost|Moznosti|Možnosti|OH HAI|Omadus|Ominaisuus|Osobina|Özellik|perbogh|poQbogh malja'|Potrzeba biznesowa|Požadavek|Požiadavka|Pretty much|Qap|Qu'meH 'ut|Savybė|Tính năng|Trajto|Vermoë|Vlastnosť|Właściwość|Značilnost|Δυνατότητα|Λειτουργία|Могућност|Мөмкинлек|Особина|Свойство|Үзенчәлеклелек|Функционал|Функционалност|Функция|Функціонал|תכונה|خاصية|خصوصیت|صلاحیت|کاروبار کی ضرورت|وِیژگی|रूप लेख|ਖਾਸੀਅਤ|ਨਕਸ਼ ਨੁਹਾਰ|ਮੁਹਾਂਦਰਾ|గుణము|ಹೆಚ್ಚಳ|ความต้องการทางธุรกิจ|ความสามารถ|โครงหลัก|기능|フィーチャ|功能|機能):([^:]+(?:\r?\n|\r|$))*/,
		lookbehind: true,
		inside: {
			'important': {
				pattern: /(:)[^\r\n]+/,
				lookbehind: true
			},
			keyword: /[^:\r\n]+:/
		}
	},
	'scenario': {
		pattern: /((^|\r?\n|\r)[ \t]*)(Abstract Scenario|Abstrakt Scenario|Achtergrond|Aer|Ær|Agtergrond|All y'all|Antecedentes|Antecedents|Atburðarás|Atburðarásir|Awww, look mate|B4|Background|Baggrund|Bakgrund|Bakgrunn|Bakgrunnur|Beispiele|Beispiller|Bối cảnh|Cefndir|Cenario|Cenário|Cenario de Fundo|Cenário de Fundo|Cenarios|Cenários|Contesto|Context|Contexte|Contexto|Conto|Contoh|Contone|Dæmi|Dasar|Dead men tell no tales|Delineacao do Cenario|Delineação do Cenário|Dis is what went down|Dữ liệu|Dyagram senaryo|Dyagram Senaryo|Egzanp|Ejemplos|Eksempler|Ekzemploj|Enghreifftiau|Esbozo do escenario|Escenari|Escenario|Esempi|Esquema de l'escenari|Esquema del escenario|Esquema do Cenario|Esquema do Cenário|Examples|EXAMPLZ|Exempel|Exemple|Exemples|Exemplos|First off|Fono|Forgatókönyv|Forgatókönyv vázlat|Fundo|Geçmiş|ghantoH|Grundlage|Hannergrond|Háttér|Heave to|Istorik|Juhtumid|Keadaan|Khung kịch bản|Khung tình huống|Kịch bản|Koncept|Konsep skenario|Kontèks|Kontekst|Kontekstas|Konteksts|Kontext|Konturo de la scenaro|Latar Belakang|lut|lut chovnatlh|lutmey|Lýsing Atburðarásar|Lýsing Dæma|Menggariskan Senario|MISHUN|MISHUN SRSLY|mo'|Náčrt Scenára|Náčrt Scénáře|Náčrt Scenáru|Oris scenarija|Örnekler|Osnova|Osnova Scenára|Osnova scénáře|Osnutek|Ozadje|Paraugs|Pavyzdžiai|Példák|Piemēri|Plan du scénario|Plan du Scénario|Plan senaryo|Plan Senaryo|Plang vum Szenario|Pozadí|Pozadie|Pozadina|Príklady|Příklady|Primer|Primeri|Primjeri|Przykłady|Raamstsenaarium|Reckon it's like|Rerefons|Scenár|Scénář|Scenarie|Scenarij|Scenarijai|Scenarijaus šablonas|Scenariji|Scenārijs|Scenārijs pēc parauga|Scenarijus|Scenario|Scénario|Scenario Amlinellol|Scenario Outline|Scenario Template|Scenariomal|Scenariomall|Scenarios|Scenariu|Scenariusz|Scenaro|Schema dello scenario|Se ðe|Se the|Se þe|Senario|Senaryo|Senaryo deskripsyon|Senaryo Deskripsyon|Senaryo taslağı|Shiver me timbers|Situācija|Situai|Situasie|Situasie Uiteensetting|Skenario|Skenario konsep|Skica|Structura scenariu|Structură scenariu|Struktura scenarija|Stsenaarium|Swa|Swa hwaer swa|Swa hwær swa|Szablon scenariusza|Szenario|Szenariogrundriss|Tapaukset|Tapaus|Tapausaihio|Taust|Tausta|Template Keadaan|Template Senario|Template Situai|The thing of it is|Tình huống|Variantai|Voorbeelde|Voorbeelden|Wharrimean is|Yo\-ho\-ho|You'll wanna|Założenia|Παραδείγματα|Περιγραφή Σεναρίου|Σενάρια|Σενάριο|Υπόβαθρο|Кереш|Контекст|Концепт|Мисаллар|Мисоллар|Основа|Передумова|Позадина|Предистория|Предыстория|Приклади|Пример|Примери|Примеры|Рамка на сценарий|Скица|Структура сценарија|Структура сценария|Структура сценарію|Сценарий|Сценарий структураси|Сценарийның төзелеше|Сценарији|Сценарио|Сценарій|Тарих|Үрнәкләр|דוגמאות|רקע|תבנית תרחיש|תרחיש|الخلفية|الگوی سناریو|امثلة|پس منظر|زمینه|سناریو|سيناريو|سيناريو مخطط|مثالیں|منظر نامے کا خاکہ|منظرنامہ|نمونه ها|उदाहरण|परिदृश्य|परिदृश्य रूपरेखा|पृष्ठभूमि|ਉਦਾਹਰਨਾਂ|ਪਟਕਥਾ|ਪਟਕਥਾ ਢਾਂਚਾ|ਪਟਕਥਾ ਰੂਪ ਰੇਖਾ|ਪਿਛੋਕੜ|ఉదాహరణలు|కథనం|నేపథ్యం|సన్నివేశం|ಉದಾಹರಣೆಗಳು|ಕಥಾಸಾರಾಂಶ|ವಿವರಣೆ|ಹಿನ್ನೆಲೆ|โครงสร้างของเหตุการณ์|ชุดของตัวอย่าง|ชุดของเหตุการณ์|แนวคิด|สรุปเหตุการณ์|เหตุการณ์|배경|시나리오|시나리오 개요|예|サンプル|シナリオ|シナリオアウトライン|シナリオテンプレ|シナリオテンプレート|テンプレ|例|例子|剧本|剧本大纲|劇本|劇本大綱|场景|场景大纲|場景|場景大綱|背景):[^:\r\n]*/,
		lookbehind: true,
		inside: {
			'important': {
				pattern: /(:)[^\r\n]*/,
				lookbehind: true
			},
			keyword: /[^:\r\n]+:/
		}
	},
	'table-body': {
		pattern: /((?:\r?\n|\r)[ \t]*\|.+\|[^\r\n]*)+/,
		lookbehind: true,
		inside: {
			'outline': {
				pattern: /<[^>]+?>/,
				alias: 'variable'
			},
			'td': {
				pattern: /\s*[^\s|][^|]*/,
				alias: 'string'
			},
			'punctuation': /\|/
		}
	},
	'table-head': {
		pattern: /((?:\r?\n|\r)[ \t]*\|.+\|[^\r\n]*)/,
		inside: {
			'th': {
				pattern: /\s*[^\s|][^|]*/,
				alias: 'variable'
			},
			'punctuation': /\|/
		}
	},
	'atrule': {
		pattern: /((?:\r?\n|\r)[ \t]+)('ach|'a|'ej|7|a|A také|A taktiež|A tiež|A zároveň|Aber|Ac|Adott|Akkor|Ak|Aleshores|Ale|Ali|Allora|Alors|Als|Ama|Amennyiben|Amikor|Ampak|an|AN|Ananging|And y'all|And|Angenommen|Anrhegedig a|An|Apabila|Atès|Atesa|Atunci|Avast!|Aye|A|awer|Bagi|Banjur|Bet|Biết|Blimey!|Buh|But at the end of the day I reckon|But y'all|But|BUT|Cal|Când|Cando|Cand|Ce|Cuando|Če|Ða ðe|Ða|Dadas|Dada|Dados|Dado|DaH ghu' bejlu'|dann|Dann|Dano|Dan|Dar|Dat fiind|Data|Date fiind|Date|Dati fiind|Dati|Daţi fiind|Dați fiind|Dato|DEN|Den youse gotta|Dengan|De|Diberi|Diyelim ki|Donada|Donat|Donitaĵo|Do|Dun|Duota|Ðurh|Eeldades|Ef|Eğer ki|Entao|Então|Entón|Entonces|En|Epi|E|És|Etant donnée|Etant donné|Et|Étant données|Étant donnée|Étant donné|Etant données|Etant donnés|Étant donnés|Fakat|Gangway!|Gdy|Gegeben seien|Gegeben sei|Gegeven|Gegewe|ghu' noblu'|Gitt|Given y'all|Given|Givet|Givun|Ha|Cho|I CAN HAZ|In|Ir|It's just unbelievable|I|Ja|Jeśli|Jeżeli|Kadar|Kada|Kad|Kai|Kaj|Když|Keď|Kemudian|Ketika|Khi|Kiedy|Ko|Kuid|Kui|Kun|Lan|latlh|Le sa a|Let go and haul|Le|Lè sa a|Lè|Logo|Lorsqu'<|Lorsque|mä|Maar|Mais|Mając|Majd|Maka|Manawa|Mas|Ma|Menawa|Men|Mutta|Nalikaning|Nalika|Nanging|Når|När|Nato|Nhưng|Niin|Njuk|O zaman|Og|Och|Oletetaan|Onda|Ond|Oraz|Pak|Pero|Però|Podano|Pokiaľ|Pokud|Potem|Potom|Privzeto|Pryd|qaSDI'|Quando|Quand|Quan|Så|Sed|Se|Siis|Sipoze ke|Sipoze Ke|Sipoze|Si|Şi|Și|Soit|Stel|Tada|Tad|Takrat|Tak|Tapi|Ter|Tetapi|Tha the|Tha|Then y'all|Then|Thì|Thurh|Toda|Too right|ugeholl|Und|Un|Và|vaj|Vendar|Ve|wann|Wanneer|WEN|Wenn|When y'all|When|Wtedy|Wun|Y'know|Yeah nah|Yna|Youse know like when|Youse know when youse got|Y|Za predpokladu|Za předpokladu|Zadani|Zadano|Zadan|Zadate|Zadato|Zakładając|Zaradi|Zatati|Þa þe|Þa|Þá|Þegar|Þurh|Αλλά|Δεδομένου|Και|Όταν|Τότε|А також|Агар|Але|Али|Аммо|А|Әгәр|Әйтик|Әмма|Бирок|Ва|Вә|Дадено|Дано|Допустим|Если|Задате|Задати|Задато|И|І|К тому же|Када|Кад|Когато|Когда|Коли|Ләкин|Лекин|Нәтиҗәдә|Нехай|Но|Онда|Припустимо, що|Припустимо|Пусть|Также|Та|Тогда|Тоді|То|Унда|Һәм|Якщо|אבל|אזי|אז|בהינתן|וגם|כאשר|آنگاه|اذاً|اگر|اما|اور|با فرض|بالفرض|بفرض|پھر|تب|ثم|جب|عندما|فرض کیا|لكن|لیکن|متى|هنگامی|و|अगर|और|कदा|किन्तु|चूंकि|जब|तथा|तदा|तब|परन्तु|पर|यदि|ਅਤੇ|ਜਦੋਂ|ਜਿਵੇਂ ਕਿ|ਜੇਕਰ|ਤਦ|ਪਰ|అప్పుడు|ఈ పరిస్థితిలో|కాని|చెప్పబడినది|మరియు|ಆದರೆ|ನಂತರ|ನೀಡಿದ|ಮತ್ತು|ಸ್ಥಿತಿಯನ್ನು|กำหนดให้|ดังนั้น|แต่|เมื่อ|และ|그러면<|그리고<|단<|만약<|만일<|먼저<|조건<|하지만<|かつ<|しかし<|ただし<|ならば<|もし<|並且<|但し<|但是<|假如<|假定<|假設<|假设<|前提<|同时<|同時<|并且<|当<|當<|而且<|那么<|那麼<)(?=[ \t]+)/,
		lookbehind: true
	},
	'string': {
		pattern: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/,
		inside: {
			'outline': {
				pattern: /<[^>]+?>/,
				alias: 'variable'
			}
		}
	},
	'outline': {
		pattern: /<[^>]+?>/,
		alias: 'variable'
	}
};


/* **********************************************
     Begin prism-fortran.js
********************************************** */

Prism.languages.fortran = {
	'quoted-number': {
		pattern: /[BOZ](['"])[A-F0-9]+\1/i,
		alias: 'number'
	},
	'string': {
		pattern: /(?:\w+_)?(['"])(?:\1\1|&(?:\r\n?|\n)(?:\s*!.+(?:\r\n?|\n))?|(?!\1).)*(?:\1|&)/,
		inside: {
			'comment': {
				pattern: /(&(?:\r\n?|\n)\s*)!.*/,
				lookbehind: true
			}
		}
	},
	'comment': /!.*/,
	'boolean': /\.(?:TRUE|FALSE)\.(?:_\w+)?/i,
	'number': /(?:\b|[+-])(?:\d+(?:\.\d*)?|\.\d+)(?:[ED][+-]?\d+)?(?:_\w+)?/i,
	'keyword': [
		// Types
		/\b(?:INTEGER|REAL|DOUBLE ?PRECISION|COMPLEX|CHARACTER|LOGICAL)\b/i,
		// END statements
		/\b(?:END ?)?(?:BLOCK ?DATA|DO|FILE|FORALL|FUNCTION|IF|INTERFACE|MODULE(?! PROCEDURE)|PROGRAM|SELECT|SUBROUTINE|TYPE|WHERE)\b/i,
		// Statements
		/\b(?:ALLOCATABLE|ALLOCATE|BACKSPACE|CALL|CASE|CLOSE|COMMON|CONTAINS|CONTINUE|CYCLE|DATA|DEALLOCATE|DIMENSION|DO|END|EQUIVALENCE|EXIT|EXTERNAL|FORMAT|GO ?TO|IMPLICIT(?: NONE)?|INQUIRE|INTENT|INTRINSIC|MODULE PROCEDURE|NAMELIST|NULLIFY|OPEN|OPTIONAL|PARAMETER|POINTER|PRINT|PRIVATE|PUBLIC|READ|RETURN|REWIND|SAVE|SELECT|STOP|TARGET|WHILE|WRITE)\b/i,
		// Others
		/\b(?:ASSIGNMENT|DEFAULT|ELEMENTAL|ELSE|ELSEWHERE|ELSEIF|ENTRY|IN|INCLUDE|INOUT|KIND|NULL|ONLY|OPERATOR|OUT|PURE|RECURSIVE|RESULT|SEQUENCE|STAT|THEN|USE)\b/i
	],
	'operator': [
		/\*\*|\/\/|=>|[=\/]=|[<>]=?|::|[+\-*=%]|\.(?:EQ|NE|LT|LE|GT|GE|NOT|AND|OR|EQV|NEQV)\.|\.[A-Z]+\./i,
		{
			// Use lookbehind to prevent confusion with (/ /)
			pattern: /(^|(?!\().)\/(?!\))/,
			lookbehind: true
		}
	],
	'punctuation': /\(\/|\/\)|[(),;:&]/
};

/* **********************************************
     Begin prism-fsharp.js
********************************************** */

Prism.languages.fsharp = Prism.languages.extend('clike', {
	'comment': [
		{
			pattern: /(^|[^\\])\(\*[\w\W]*?\*\)/,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'keyword': /\b(?:let|return|use|yield)(?:!\B|\b)|\b(abstract|and|as|assert|base|begin|class|default|delegate|do|done|downcast|downto|elif|else|end|exception|extern|false|finally|for|fun|function|global|if|in|inherit|inline|interface|internal|lazy|match|member|module|mutable|namespace|new|not|null|of|open|or|override|private|public|rec|select|static|struct|then|to|true|try|type|upcast|val|void|when|while|with|asr|land|lor|lsl|lsr|lxor|mod|sig|atomic|break|checked|component|const|constraint|constructor|continue|eager|event|external|fixed|functor|include|method|mixin|object|parallel|process|protected|pure|sealed|tailcall|trait|virtual|volatile)\b/,
	'string': /(?:"""[\s\S]*?"""|@"(?:""|[^"])*"|("|')(?:\\\1|\\?(?!\1)[\s\S])*\1)B?/,
	'number': [
		/\b-?0x[\da-fA-F]+(un|lf|LF)?\b/,
		/\b-?0b[01]+(y|uy)?\b/,
		/\b-?(\d*\.?\d+|\d+\.)([fFmM]|[eE][+-]?\d+)?\b/,
		/\b-?\d+(y|uy|s|us|l|u|ul|L|UL|I)?\b/
	]
});
Prism.languages.insertBefore('fsharp', 'keyword', {
	'preprocessor': /^[^\r\n\S]*#.*/m
});

/* **********************************************
     Begin prism-erlang.js
********************************************** */

Prism.languages.erlang = {
	'comment': /%.+/,
	'string': /"(?:\\?.)*?"/,
	'quoted-function': {
		pattern: /'(?:\\.|[^'\\])+'(?=\()/,
		alias: 'function'
	},
	'quoted-atom': {
		pattern: /'(?:\\.|[^'\\])+'/,
		alias: 'atom'
	},
	'boolean': /\b(?:true|false)\b/,
	'keyword': /\b(?:fun|when|case|of|end|if|receive|after|try|catch)\b/,
	'number': [
		/\$\\?./,
		/\d+#[a-z0-9]+/i,
		/(?:\b|-)\d*\.?\d+([Ee][+-]?\d+)?\b/
	],
	'function': /\b[a-z][\w@]*(?=\()/,
	'variable': {
		// Look-behind is used to prevent wrong highlighting of atoms containing "@"
		pattern: /(^|[^@])(?:\b|\?)[A-Z_][\w@]*/,
		lookbehind: true
	},
	'operator': [
		/[=\/<>:]=|=[:\/]=|\+\+?|--?|[=*\/!]|\b(?:bnot|div|rem|band|bor|bxor|bsl|bsr|not|and|or|xor|orelse|andalso)\b/,
		{
			// We don't want to match <<
			pattern: /(^|[^<])<(?!<)/,
			lookbehind: true
		},
		{
			// We don't want to match >>
			pattern: /(^|[^>])>(?!>)/,
			lookbehind: true
		}
	],
	'atom': /\b[a-z][\w@]*/,
	'punctuation': /[()[\]{}:;,.#|]|<<|>>/

};

/* **********************************************
     Begin prism-elixir.js
********************************************** */

Prism.languages.elixir = {
	// Negative look-ahead is needed for string interpolation
	'comment': /#(?!\{).*/,
	// ~r"""foo""", ~r'''foo''', ~r/foo/, ~r|foo|, ~r"foo", ~r'foo', ~r(foo), ~r[foo], ~r{foo}, ~r<foo>
	'regex': /~[rR](?:("""|'''|[\/|"'])(?:\\.|(?!\1)[^\\])+\1|\((?:\\\)|[^)])+\)|\[(?:\\\]|[^\]])+\]|\{(?:\\\}|[^}])+\}|<(?:\\>|[^>])+>)[uismxfr]*/,
	'string': [
		{
			// ~s"""foo""", ~s'''foo''', ~s/foo/, ~s|foo|, ~s"foo", ~s'foo', ~s(foo), ~s[foo], ~s{foo}, ~s<foo>
			pattern: /~[cCsSwW](?:("""|'''|[\/|"'])(?:\\.|(?!\1)[^\\])+\1|\((?:\\\)|[^)])+\)|\[(?:\\\]|[^\]])+\]|\{(?:\\\}|#\{[^}]+\}|[^}])+\}|<(?:\\>|[^>])+>)[csa]?/,
			inside: {
				// See interpolation below
			}
		},
		{
			pattern: /("""|''')[\s\S]*?\1/,
			inside: {
				// See interpolation below
			}
		},
		{
			// Multi-line strings are allowed
			pattern: /("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/,
			inside: {
				// See interpolation below
			}
		}
	],
	'atom': {
		// Look-behind prevents bad highlighting of the :: operator
		pattern: /(^|[^:]):\w+/,
		lookbehind: true,
		alias: 'symbol'
	},
	// Look-ahead prevents bad highlighting of the :: operator
	'attr-name': /\w+:(?!:)/,
	'capture': {
		// Look-behind prevents bad highlighting of the && operator
		pattern: /(^|[^&])&(?:[^&\s\d()][^\s()]*|(?=\())/,
		lookbehind: true,
		alias: 'function'
	},
	'argument': {
		// Look-behind prevents bad highlighting of the && operator
		pattern: /(^|[^&])&\d+/,
		lookbehind: true,
		alias: 'variable'
	},
	'attribute': {
		pattern: /@[\S]+/,
		alias: 'variable'
	},
	'number': /\b(?:0[box][a-f\d_]+|\d[\d_]*)(?:\.[\d_]+)?(?:e[+-]?[\d_]+)?\b/i,
	'keyword': /\b(?:after|alias|and|case|catch|cond|def(?:callback|exception|impl|module|p|protocol|struct)?|do|else|end|fn|for|if|import|not|or|require|rescue|try|unless|use|when)\b/,
	'boolean': /\b(?:true|false|nil)\b/,
	'operator': [
		/\bin\b|&&?|\|[|>]?|\\\\|::|\.\.\.?|\+\+?|-[->]?|<[-=>]|>=|!==?|\B!|=(?:==?|[>~])?|[*\/^]/,
		{
			// We don't want to match <<
			pattern: /([^<])<(?!<)/,
			lookbehind: true
		},
		{
			// We don't want to match >>
			pattern: /([^>])>(?!>)/,
			lookbehind: true
		}
	],
	'punctuation': /<<|>>|[.,%\[\]{}()]/
};

Prism.languages.elixir.string.forEach(function(o) {
	o.inside = {
		'interpolation': {
			pattern: /#\{[^}]+\}/,
			inside: {
				'delimiter': {
					pattern: /^#\{|\}$/,
					alias: 'punctuation'
				},
				rest: Prism.util.clone(Prism.languages.elixir)
			}
		}
	};
});

/* **********************************************
     Begin prism-eiffel.js
********************************************** */

Prism.languages.eiffel = {
	'string': [
		// Aligned-verbatim-strings
		/"([^[]*)\[[\s\S]+?\]\1"/,
		// Non-aligned-verbatim-strings
		/"([^{]*)\{[\s\S]+?\}\1"/,
		// Single-line string
		/"(?:%\s+%|%"|.)*?"/
	],
	// (comments including quoted strings not supported)
	'comment': /--.*/,
	// normal char | special char | char code
	'char': /'(?:%'|.)+?'/,
	'keyword': /\b(?:across|agent|alias|all|and|attached|as|assign|attribute|check|class|convert|create|Current|debug|deferred|detachable|do|else|elseif|end|ensure|expanded|export|external|feature|from|frozen|if|implies|inherit|inspect|invariant|like|local|loop|not|note|obsolete|old|once|or|Precursor|redefine|rename|require|rescue|Result|retry|select|separate|some|then|undefine|until|variant|Void|when|xor)\b/i,
	'boolean': /\b(?:True|False)\b/i,
	'number': [
		// hexa | octal | bin
		/\b0[xcb][\da-f](?:_*[\da-f])*\b/i,
		// Decimal
		/(?:\d(?:_*\d)*)?\.(?:(?:\d(?:_*\d)*)?[eE][+-]?)?\d(?:_*\d)*|\d(?:_*\d)*\.?/
	],
	'punctuation': /:=|<<|>>|\(\||\|\)|->|\.(?=\w)|[{}[\];(),:?]/,
	'operator': /\\\\|\|\.\.\||\.\.|\/[~\/=]?|[><]=?|[-+*^=~]/
};


/* **********************************************
     Begin prism-docker.js
********************************************** */

Prism.languages.docker = {
	'keyword': {
		pattern: /(^\s*)(?:ONBUILD|FROM|MAINTAINER|RUN|EXPOSE|ENV|ADD|COPY|VOLUME|USER|WORKDIR|CMD|LABEL|ENTRYPOINT)(?=\s)/mi,
		lookbehind: true
	},
	'string': /("|')(?:(?!\1)[^\\\r\n]|\\(?:\r\n|[\s\S]))*?\1/,
	'comment': /#.*/,
	'punctuation': /---|\.\.\.|[:[\]{}\-,|>?]/
};

/* **********************************************
     Begin prism-diff.js
********************************************** */

Prism.languages.diff = {
	'coord': [
		// Match all kinds of coord lines (prefixed by "+++", "---" or "***").
		/^(?:\*{3}|-{3}|\+{3}).*$/m,
		// Match "@@ ... @@" coord lines in unified diff.
		/^@@.*@@$/m,
		// Match coord lines in normal diff (starts with a number).
		/^\d+.*$/m
	],

	// Match inserted and deleted lines. Support both +/- and >/< styles.
	'deleted': /^[-<].+$/m,
	'inserted': /^[+>].+$/m,

	// Match "different" lines (prefixed with "!") in context diff.
	'diff': {
		'pattern': /^!(?!!).+$/m,
		'alias': 'important'
	}
};

/* **********************************************
     Begin prism-dart.js
********************************************** */

Prism.languages.dart = Prism.languages.extend('clike', {
	'string': [
		/r?("""|''')[\s\S]*?\1/,
		/r?("|')(\\?.)*?\1/
	],
	'keyword': [
		/\b(?:async|sync|yield)\*/,
		/\b(?:abstract|assert|async|await|break|case|catch|class|const|continue|default|deferred|do|dynamic|else|enum|export|external|extends|factory|final|finally|for|get|if|implements|import|in|library|new|null|operator|part|rethrow|return|set|static|super|switch|this|throw|try|typedef|var|void|while|with|yield)\b/
	],
	'operator': /\bis!|\b(?:as|is)\b|\+\+|--|&&|\|\||<<=?|>>=?|~(?:\/=?)?|[+\-*\/%&^|=!<>]=?|\?/
});

Prism.languages.insertBefore('dart','function',{
	'metadata': {
		pattern: /@\w+/,
		alias: 'symbol'
	}
});

/* **********************************************
     Begin prism-d.js
********************************************** */

Prism.languages.d = Prism.languages.extend('clike', {
	'string': [
		// r"", x""
		/\b[rx]"(\\.|[^\\"])*"[cwd]?/,
		// q"[]", q"()", q"<>", q"{}"
		/\bq"(?:\[[\s\S]*?\]|\([\s\S]*?\)|<[\s\S]*?>|\{[\s\S]*?\})"/,
		// q"IDENT
		// ...
		// IDENT"
		/\bq"([_a-zA-Z][_a-zA-Z\d]*)(?:\r?\n|\r)[\s\S]*?(?:\r?\n|\r)\1"/,
		// q"//", q"||", etc.
		/\bq"(.)[\s\S]*?\1"/,
		// Characters
		/'(?:\\'|\\?[^']+)'/,

		/(["`])(\\.|(?!\1)[^\\])*\1[cwd]?/
	],

	'number': [
		// The lookbehind and the negative look-ahead try to prevent bad highlighting of the .. operator
		// Hexadecimal numbers must be handled separately to avoid problems with exponent "e"
		/\b0x\.?[a-f\d_]+(?:(?!\.\.)\.[a-f\d_]*)?(?:p[+-]?[a-f\d_]+)?[ulfi]*/i,
		{
			pattern: /((?:\.\.)?)(?:\b0b\.?|\b|\.)\d[\d_]*(?:(?!\.\.)\.[\d_]*)?(?:e[+-]?\d[\d_]*)?[ulfi]*/i,
			lookbehind: true
		}
	],

	// In order: $, keywords and special tokens, globally defined symbols
	'keyword': /\$|\b(?:abstract|alias|align|asm|assert|auto|body|bool|break|byte|case|cast|catch|cdouble|cent|cfloat|char|class|const|continue|creal|dchar|debug|default|delegate|delete|deprecated|do|double|else|enum|export|extern|false|final|finally|float|for|foreach|foreach_reverse|function|goto|idouble|if|ifloat|immutable|import|inout|int|interface|invariant|ireal|lazy|long|macro|mixin|module|new|nothrow|null|out|override|package|pragma|private|protected|public|pure|real|ref|return|scope|shared|short|static|struct|super|switch|synchronized|template|this|throw|true|try|typedef|typeid|typeof|ubyte|ucent|uint|ulong|union|unittest|ushort|version|void|volatile|wchar|while|with|__(?:(?:FILE|MODULE|LINE|FUNCTION|PRETTY_FUNCTION|DATE|EOF|TIME|TIMESTAMP|VENDOR|VERSION)__|gshared|traits|vector|parameters)|string|wstring|dstring|size_t|ptrdiff_t)\b/,
	'operator': /\|[|=]?|&[&=]?|\+[+=]?|-[-=]?|\.?\.\.|=[>=]?|!(?:i[ns]\b|<>?=?|>=?|=)?|\bi[ns]\b|(?:<[<>]?|>>?>?|\^\^|[*\/%^~])=?/
});


Prism.languages.d.comment = [
	// Shebang
	/^\s*#!.+/,
	// /+ +/
	{
		// Allow one level of nesting
		pattern: /(^|[^\\])\/\+(?:\/\+[\w\W]*?\+\/|[\w\W])*?\+\//,
		lookbehind: true
	}
].concat(Prism.languages.d.comment);

Prism.languages.insertBefore('d', 'comment', {
	'token-string': {
		// Allow one level of nesting
		pattern: /\bq\{(?:|\{[^}]*\}|[^}])*\}/,
		alias: 'string'
	}
});

Prism.languages.insertBefore('d', 'keyword', {
	'property': /\B@\w*/
});

Prism.languages.insertBefore('d', 'function', {
	'register': {
		// Iasm registers
		pattern: /\b(?:[ABCD][LHX]|E[ABCD]X|E?(?:BP|SP|DI|SI)|[ECSDGF]S|CR[0234]|DR[012367]|TR[3-7]|X?MM[0-7]|R[ABCD]X|[BS]PL|R[BS]P|[DS]IL|R[DS]I|R(?:[89]|1[0-5])[BWD]?|XMM(?:[89]|1[0-5])|YMM(?:1[0-5]|\d))\b|\bST(?:\([0-7]\)|\b)/,
		alias: 'variable'
	}
});

/* **********************************************
     Begin prism-css-extras.js
********************************************** */

Prism.languages.css.selector = {
	pattern: /[^\{\}\s][^\{\}]*(?=\s*\{)/,
	inside: {
		'pseudo-element': /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,
		'pseudo-class': /:[-\w]+(?:\(.*\))?/,
		'class': /\.[-:\.\w]+/,
		'id': /#[-:\.\w]+/
	}
};

Prism.languages.insertBefore('css', 'function', {
	'hexcode': /#[\da-f]{3,6}/i,
	'entity': /\\[\da-f]{1,8}/i,
	'number': /[\d%\.]+/
});

/* **********************************************
     Begin prism-coffeescript.js
********************************************** */

(function(Prism) {

// Ignore comments starting with { to privilege string interpolation highlighting
var comment = /#(?!\{).+/,
    interpolation = {
    	pattern: /#\{[^}]+\}/,
    	alias: 'variable'
    };

Prism.languages.coffeescript = Prism.languages.extend('javascript', {
	'comment': comment,
	'string': [

		// Strings are multiline
		/'(?:\\?[^\\])*?'/,

		{
			// Strings are multiline
			pattern: /"(?:\\?[^\\])*?"/,
			inside: {
				'interpolation': interpolation
			}
		}
	],
	'keyword': /\b(and|break|by|catch|class|continue|debugger|delete|do|each|else|extend|extends|false|finally|for|if|in|instanceof|is|isnt|let|loop|namespace|new|no|not|null|of|off|on|or|own|return|super|switch|then|this|throw|true|try|typeof|undefined|unless|until|when|while|window|with|yes|yield)\b/,
	'class-member': {
		pattern: /@(?!\d)\w+/,
		alias: 'variable'
	}
});

Prism.languages.insertBefore('coffeescript', 'comment', {
	'multiline-comment': {
		pattern: /###[\s\S]+?###/,
		alias: 'comment'
	},

	// Block regexp can contain comments and interpolation
	'block-regex': {
		pattern: /\/{3}[\s\S]*?\/{3}/,
		alias: 'regex',
		inside: {
			'comment': comment,
			'interpolation': interpolation
		}
	}
});

Prism.languages.insertBefore('coffeescript', 'string', {
	'inline-javascript': {
		pattern: /`(?:\\?[\s\S])*?`/,
		inside: {
			'delimiter': {
				pattern: /^`|`$/,
				alias: 'punctuation'
			},
			rest: Prism.languages.javascript
		}
	},

	// Block strings
	'multiline-string': [
		{
			pattern: /'''[\s\S]*?'''/,
			alias: 'string'
		},
		{
			pattern: /"""[\s\S]*?"""/,
			alias: 'string',
			inside: {
				interpolation: interpolation
			}
		}
	]

});

Prism.languages.insertBefore('coffeescript', 'keyword', {
	// Object property
	'property': /(?!\d)\w+(?=\s*:(?!:))/
});

}(Prism));

/* **********************************************
     Begin prism-cpp.js
********************************************** */

Prism.languages.cpp = Prism.languages.extend('c', {
	'keyword': /\b(alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|nullptr|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,
	'boolean': /\b(true|false)\b/,
	'operator': /[-+]{1,2}|!=?|<{1,2}=?|>{1,2}=?|\->|:{1,2}|={1,2}|\^|~|%|&{1,2}|\|?\||\?|\*|\/|\b(and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/
});

Prism.languages.insertBefore('cpp', 'keyword', {
	'class-name': {
		pattern: /(class\s+)[a-z0-9_]+/i,
		lookbehind: true
	}
});

/* **********************************************
     Begin prism-csharp.js
********************************************** */

Prism.languages.csharp = Prism.languages.extend('clike', {
	'keyword': /\b(abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|add|alias|ascending|async|await|descending|dynamic|from|get|global|group|into|join|let|orderby|partial|remove|select|set|value|var|where|yield)\b/,
	'string': [
		/@("|')(\1\1|\\\1|\\?(?!\1)[\s\S])*\1/,
		/("|')(\\?.)*?\1/
	],
	'number': /\b-?(0x[\da-f]+|\d*\.?\d+)\b/i
});

Prism.languages.insertBefore('csharp', 'keyword', {
	'preprocessor': {
		pattern: /(^\s*)#.*/m,
		lookbehind: true
	}
});


/* **********************************************
     Begin prism-brainfuck.js
********************************************** */

Prism.languages.brainfuck = {
	'pointer': {
		pattern: /<|>/,
		alias: 'keyword'
	},
	'increment': {
		pattern: /\+/,
		alias: 'inserted'
	},
	'decrement': {
		pattern: /-/,
		alias: 'deleted'
	},
	'branching': {
		pattern: /\[|\]/,
		alias: 'important'
	},
	'operator': /[.,]/,
	'comment': /\S+/
};

/* **********************************************
     Begin prism-bison.js
********************************************** */

Prism.languages.bison = Prism.languages.extend('c', {});

Prism.languages.insertBefore('bison', 'comment', {
	'bison': {
		// This should match all the beginning of the file
		// including the prologue(s), the bison declarations and
		// the grammar rules.
		pattern: /^[\s\S]*?%%[\s\S]*?%%/,
		inside: {
			'c': {
				// Allow for one level of nested braces
				pattern: /%\{[\s\S]*?%\}|\{(?:\{[^}]*\}|[^{}])*\}/,
				inside: {
					'delimiter': {
						pattern: /^%?\{|%?\}$/,
						alias: 'punctuation'
					},
					'bison-variable': {
						pattern: /[$@](?:<[^\s>]+>)?[\w$]+/,
						alias: 'variable',
						inside: {
							'punctuation': /<|>/
						}
					},
					rest: Prism.languages.c
				}
			},
			'comment': Prism.languages.c.comment,
			'string': Prism.languages.c.string,
			'property': /\S+(?=:)/,
			'keyword': /%\w+/,
			'number': {
				pattern: /(^|[^@])\b(?:0x[\da-f]+|\d+)/i,
				lookbehind: true
			},
			'punctuation': /%[%?]|[|:;\[\]<>]/
		}
	}
});

/* **********************************************
     Begin prism-basic.js
********************************************** */

Prism.languages.basic = {
	'string': /"(?:""|[!#$%&'()*,\/:;<=>?^_ +\-.A-Z\d])*"/i,
	'comment': {
		pattern: /(?:!|REM\b).+/i,
		inside: {
			'keyword': /^REM/i
		}
	},
	'number': /(?:\b|\B[.-])(?:\d+\.?\d*)(?:E[+-]?\d+)?/i,
	'keyword': /\b(?:AS|BEEP|BLOAD|BSAVE|CALL(?: ABSOLUTE)?|CASE|CHAIN|CHDIR|CLEAR|CLOSE|CLS|COM|COMMON|CONST|DATA|DECLARE|DEF(?: FN| SEG|DBL|INT|LNG|SNG|STR)|DIM|DO|DOUBLE|ELSE|ELSEIF|END|ENVIRON|ERASE|ERROR|EXIT|FIELD|FILES|FOR|FUNCTION|GET|GOSUB|GOTO|IF|INPUT|INTEGER|IOCTL|KEY|KILL|LINE INPUT|LOCATE|LOCK|LONG|LOOP|LSET|MKDIR|NAME|NEXT|OFF|ON(?: COM| ERROR| KEY| TIMER)?|OPEN|OPTION BASE|OUT|POKE|PUT|READ|REDIM|REM|RESTORE|RESUME|RETURN|RMDIR|RSET|RUN|SHARED|SINGLE|SELECT CASE|SHELL|SLEEP|STATIC|STEP|STOP|STRING|SUB|SWAP|SYSTEM|THEN|TIMER|TO|TROFF|TRON|TYPE|UNLOCK|UNTIL|USING|VIEW PRINT|WAIT|WEND|WHILE|WRITE)(?:\$|\b)/i,
	'function': /\b(?:ABS|ACCESS|ACOS|ANGLE|AREA|ARITHMETIC|ARRAY|ASIN|ASK|AT|ATN|BASE|BEGIN|BREAK|CAUSE|CEIL|CHR|CLIP|COLLATE|COLOR|CON|COS|COSH|COT|CSC|DATE|DATUM|DEBUG|DECIMAL|DEF|DEG|DEGREES|DELETE|DET|DEVICE|DISPLAY|DOT|ELAPSED|EPS|ERASABLE|EXLINE|EXP|EXTERNAL|EXTYPE|FILETYPE|FIXED|FP|GO|GRAPH|HANDLER|IDN|IMAGE|IN|INT|INTERNAL|IP|IS|KEYED|LBOUND|LCASE|LEFT|LEN|LENGTH|LET|LINE|LINES|LOG|LOG10|LOG2|LTRIM|MARGIN|MAT|MAX|MAXNUM|MID|MIN|MISSING|MOD|NATIVE|NUL|NUMERIC|OF|OPTION|ORD|ORGANIZATION|OUTIN|OUTPUT|PI|POINT|POINTER|POINTS|POS|PRINT|PROGRAM|PROMPT|RAD|RADIANS|RANDOMIZE|RECORD|RECSIZE|RECTYPE|RELATIVE|REMAINDER|REPEAT|REST|RETRY|REWRITE|RIGHT|RND|ROUND|RTRIM|SAME|SEC|SELECT|SEQUENTIAL|SET|SETTER|SGN|SIN|SINH|SIZE|SKIP|SQR|STANDARD|STATUS|STR|STREAM|STYLE|TAB|TAN|TANH|TEMPLATE|TEXT|THERE|TIME|TIMEOUT|TRACE|TRANSFORM|TRUNCATE|UBOUND|UCASE|USE|VAL|VARIABLE|VIEWPORT|WHEN|WINDOW|WITH|ZER|ZONEWIDTH)(?:\$|\b)/i,
	'operator': /<[=>]?|>=?|[+\-*\/^=&]|\b(?:AND|EQV|IMP|NOT|OR|XOR)\b/i,
	'punctuation': /[,;:()]/
};

/* **********************************************
     Begin prism-bash.js
********************************************** */

Prism.languages.bash = Prism.languages.extend('clike', {
	'comment': {
		pattern: /(^|[^"{\\])#.*/,
		lookbehind: true
	},
	'string': {
		//allow multiline string
		pattern: /("|')(\\?[\s\S])*?\1/,
		inside: {
			//'property' class reused for bash variables
			'property': /\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^\}]+\})/
		}
	},
	// Redefined to prevent highlighting of numbers in filenames
	'number': {
		pattern: /([^\w\.])-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/,
		lookbehind: true
	},
	// Originally based on http://ss64.com/bash/
	'function': /\b(?:alias|apropos|apt-get|aptitude|aspell|awk|basename|bash|bc|bg|builtin|bzip2|cal|cat|cd|cfdisk|chgrp|chmod|chown|chroot|chkconfig|cksum|clear|cmp|comm|command|cp|cron|crontab|csplit|cut|date|dc|dd|ddrescue|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|enable|env|ethtool|eval|exec|expand|expect|export|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|getopts|git|grep|groupadd|groupdel|groupmod|groups|gzip|hash|head|help|hg|history|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|jobs|join|kill|killall|less|link|ln|locate|logname|logout|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|make|man|mkdir|mkfifo|mkisofs|mknod|more|most|mount|mtools|mtr|mv|mmv|nano|netstat|nice|nl|nohup|notify-send|nslookup|open|op|passwd|paste|pathchk|ping|pkill|popd|pr|printcap|printenv|printf|ps|pushd|pv|pwd|quota|quotacheck|quotactl|ram|rar|rcp|read|readarray|readonly|reboot|rename|renice|remsync|rev|rm|rmdir|rsync|screen|scp|sdiff|sed|seq|service|sftp|shift|shopt|shutdown|sleep|slocate|sort|source|split|ssh|stat|strace|su|sudo|sum|suspend|sync|tail|tar|tee|test|time|timeout|times|touch|top|traceroute|trap|tr|tsort|tty|type|ulimit|umask|umount|unalias|uname|unexpand|uniq|units|unrar|unshar|uptime|useradd|userdel|usermod|users|uuencode|uudecode|v|vdir|vi|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yes|zip)\b/,
	'keyword': /\b(if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)\b/
});

Prism.languages.insertBefore('bash', 'keyword', {
	//'property' class reused for bash variables
	'property': /\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^}]+\})/
});
Prism.languages.insertBefore('bash', 'comment', {
	//shebang must be before comment, 'important' class from css reused
	'important': /^#!\s*\/bin\/bash|^#!\s*\/bin\/sh/
});


/* **********************************************
     Begin prism-autohotkey.js
********************************************** */

// NOTES - follows first-first highlight method, block is locked after highlight, different from SyntaxHl
Prism.languages.autohotkey= {
	'comment': {
		pattern: /(^[^";\n]*("[^"\n]*?"[^"\n]*?)*)(;.*$|^\s*\/\*[\s\S]*\n\*\/)/m,
		lookbehind: true
	},
	'string': /"(([^"\n\r]|"")*)"/m,
	'function': /[^\(\); \t,\n\+\*\-=\?>:\\\/<&%\[\]]+?(?=\()/m,  //function - don't use .*\) in the end bcoz string locks it
	'tag': /^[ \t]*[^\s:]+?(?=:(?:[^:]|$))/m,  //labels
	'variable': /%\w+%/,
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/,
	'operator': /\?|\/\/?=?|:=|\|[=|]?|&[=&]?|\+[=+]?|-[=-]?|\*[=*]?|<(?:<=?|>|=)?|>>?=?|[.^!=~]=?|\b(?:AND|NOT|OR)\b/,
	'punctuation': /[\{}[\]\(\):,]/,
	'boolean': /\b(true|false)\b/,

	'selector': /\b(AutoTrim|BlockInput|Break|Click|ClipWait|Continue|Control|ControlClick|ControlFocus|ControlGet|ControlGetFocus|ControlGetPos|ControlGetText|ControlMove|ControlSend|ControlSendRaw|ControlSetText|CoordMode|Critical|DetectHiddenText|DetectHiddenWindows|Drive|DriveGet|DriveSpaceFree|EnvAdd|EnvDiv|EnvGet|EnvMult|EnvSet|EnvSub|EnvUpdate|Exit|ExitApp|FileAppend|FileCopy|FileCopyDir|FileCreateDir|FileCreateShortcut|FileDelete|FileEncoding|FileGetAttrib|FileGetShortcut|FileGetSize|FileGetTime|FileGetVersion|FileInstall|FileMove|FileMoveDir|FileRead|FileReadLine|FileRecycle|FileRecycleEmpty|FileRemoveDir|FileSelectFile|FileSelectFolder|FileSetAttrib|FileSetTime|FormatTime|GetKeyState|Gosub|Goto|GroupActivate|GroupAdd|GroupClose|GroupDeactivate|Gui|GuiControl|GuiControlGet|Hotkey|ImageSearch|IniDelete|IniRead|IniWrite|Input|InputBox|KeyWait|ListHotkeys|ListLines|ListVars|Loop|Menu|MouseClick|MouseClickDrag|MouseGetPos|MouseMove|MsgBox|OnExit|OutputDebug|Pause|PixelGetColor|PixelSearch|PostMessage|Process|Progress|Random|RegDelete|RegRead|RegWrite|Reload|Repeat|Return|Run|RunAs|RunWait|Send|SendEvent|SendInput|SendMessage|SendMode|SendPlay|SendRaw|SetBatchLines|SetCapslockState|SetControlDelay|SetDefaultMouseSpeed|SetEnv|SetFormat|SetKeyDelay|SetMouseDelay|SetNumlockState|SetScrollLockState|SetStoreCapslockMode|SetTimer|SetTitleMatchMode|SetWinDelay|SetWorkingDir|Shutdown|Sleep|Sort|SoundBeep|SoundGet|SoundGetWaveVolume|SoundPlay|SoundSet|SoundSetWaveVolume|SplashImage|SplashTextOff|SplashTextOn|SplitPath|StatusBarGetText|StatusBarWait|StringCaseSense|StringGetPos|StringLeft|StringLen|StringLower|StringMid|StringReplace|StringRight|StringSplit|StringTrimLeft|StringTrimRight|StringUpper|Suspend|SysGet|Thread|ToolTip|Transform|TrayTip|URLDownloadToFile|WinActivate|WinActivateBottom|WinClose|WinGet|WinGetActiveStats|WinGetActiveTitle|WinGetClass|WinGetPos|WinGetText|WinGetTitle|WinHide|WinKill|WinMaximize|WinMenuSelectItem|WinMinimize|WinMinimizeAll|WinMinimizeAllUndo|WinMove|WinRestore|WinSet|WinSetTitle|WinShow|WinWait|WinWaitActive|WinWaitClose|WinWaitNotActive)\b/i,

	'constant': /\b(a_ahkpath|a_ahkversion|a_appdata|a_appdatacommon|a_autotrim|a_batchlines|a_caretx|a_carety|a_computername|a_controldelay|a_cursor|a_dd|a_ddd|a_dddd|a_defaultmousespeed|a_desktop|a_desktopcommon|a_detecthiddentext|a_detecthiddenwindows|a_endchar|a_eventinfo|a_exitreason|a_formatfloat|a_formatinteger|a_gui|a_guievent|a_guicontrol|a_guicontrolevent|a_guiheight|a_guiwidth|a_guix|a_guiy|a_hour|a_iconfile|a_iconhidden|a_iconnumber|a_icontip|a_index|a_ipaddress1|a_ipaddress2|a_ipaddress3|a_ipaddress4|a_isadmin|a_iscompiled|a_iscritical|a_ispaused|a_issuspended|a_isunicode|a_keydelay|a_language|a_lasterror|a_linefile|a_linenumber|a_loopfield|a_loopfileattrib|a_loopfiledir|a_loopfileext|a_loopfilefullpath|a_loopfilelongpath|a_loopfilename|a_loopfileshortname|a_loopfileshortpath|a_loopfilesize|a_loopfilesizekb|a_loopfilesizemb|a_loopfiletimeaccessed|a_loopfiletimecreated|a_loopfiletimemodified|a_loopreadline|a_loopregkey|a_loopregname|a_loopregsubkey|a_loopregtimemodified|a_loopregtype|a_mday|a_min|a_mm|a_mmm|a_mmmm|a_mon|a_mousedelay|a_msec|a_mydocuments|a_now|a_nowutc|a_numbatchlines|a_ostype|a_osversion|a_priorhotkey|programfiles|a_programfiles|a_programs|a_programscommon|a_screenheight|a_screenwidth|a_scriptdir|a_scriptfullpath|a_scriptname|a_sec|a_space|a_startmenu|a_startmenucommon|a_startup|a_startupcommon|a_stringcasesense|a_tab|a_temp|a_thisfunc|a_thishotkey|a_thislabel|a_thismenu|a_thismenuitem|a_thismenuitempos|a_tickcount|a_timeidle|a_timeidlephysical|a_timesincepriorhotkey|a_timesincethishotkey|a_titlematchmode|a_titlematchmodespeed|a_username|a_wday|a_windelay|a_windir|a_workingdir|a_yday|a_year|a_yweek|a_yyyy|clipboard|clipboardall|comspec|errorlevel)\b/i,

	'builtin': /\b(abs|acos|asc|asin|atan|ceil|chr|class|cos|dllcall|exp|fileexist|Fileopen|floor|il_add|il_create|il_destroy|instr|substr|isfunc|islabel|IsObject|ln|log|lv_add|lv_delete|lv_deletecol|lv_getcount|lv_getnext|lv_gettext|lv_insert|lv_insertcol|lv_modify|lv_modifycol|lv_setimagelist|mod|onmessage|numget|numput|registercallback|regexmatch|regexreplace|round|sin|tan|sqrt|strlen|sb_seticon|sb_setparts|sb_settext|strsplit|tv_add|tv_delete|tv_getchild|tv_getcount|tv_getnext|tv_get|tv_getparent|tv_getprev|tv_getselection|tv_gettext|tv_modify|varsetcapacity|winactive|winexist|__New|__Call|__Get|__Set)\b/i,

	'symbol': /\b(alt|altdown|altup|appskey|backspace|browser_back|browser_favorites|browser_forward|browser_home|browser_refresh|browser_search|browser_stop|bs|capslock|ctrl|ctrlbreak|ctrldown|ctrlup|del|delete|down|end|enter|esc|escape|f1|f10|f11|f12|f13|f14|f15|f16|f17|f18|f19|f2|f20|f21|f22|f23|f24|f3|f4|f5|f6|f7|f8|f9|home|ins|insert|joy1|joy10|joy11|joy12|joy13|joy14|joy15|joy16|joy17|joy18|joy19|joy2|joy20|joy21|joy22|joy23|joy24|joy25|joy26|joy27|joy28|joy29|joy3|joy30|joy31|joy32|joy4|joy5|joy6|joy7|joy8|joy9|joyaxes|joybuttons|joyinfo|joyname|joypov|joyr|joyu|joyv|joyx|joyy|joyz|lalt|launch_app1|launch_app2|launch_mail|launch_media|lbutton|lcontrol|lctrl|left|lshift|lwin|lwindown|lwinup|mbutton|media_next|media_play_pause|media_prev|media_stop|numlock|numpad0|numpad1|numpad2|numpad3|numpad4|numpad5|numpad6|numpad7|numpad8|numpad9|numpadadd|numpadclear|numpaddel|numpaddiv|numpaddot|numpaddown|numpadend|numpadenter|numpadhome|numpadins|numpadleft|numpadmult|numpadpgdn|numpadpgup|numpadright|numpadsub|numpadup|pgdn|pgup|printscreen|ralt|rbutton|rcontrol|rctrl|right|rshift|rwin|rwindown|rwinup|scrolllock|shift|shiftdown|shiftup|space|tab|up|volume_down|volume_mute|volume_up|wheeldown|wheelleft|wheelright|wheelup|xbutton1|xbutton2)\b/i,

	'important': /#\b(AllowSameLineComments|ClipboardTimeout|CommentFlag|ErrorStdOut|EscapeChar|HotkeyInterval|HotkeyModifierTimeout|Hotstring|IfWinActive|IfWinExist|IfWinNotActive|IfWinNotExist|Include|IncludeAgain|InstallKeybdHook|InstallMouseHook|KeyHistory|LTrim|MaxHotkeysPerInterval|MaxMem|MaxThreads|MaxThreadsBuffer|MaxThreadsPerHotkey|NoEnv|NoTrayIcon|Persistent|SingleInstance|UseHook|WinActivateForce)\b/i,

	'keyword': /\b(Abort|AboveNormal|Add|ahk_class|ahk_group|ahk_id|ahk_pid|All|Alnum|Alpha|AltSubmit|AltTab|AltTabAndMenu|AltTabMenu|AltTabMenuDismiss|AlwaysOnTop|AutoSize|Background|BackgroundTrans|BelowNormal|between|BitAnd|BitNot|BitOr|BitShiftLeft|BitShiftRight|BitXOr|Bold|Border|Button|ByRef|Checkbox|Checked|CheckedGray|Choose|ChooseString|Close|Color|ComboBox|Contains|ControlList|Count|Date|DateTime|Days|DDL|Default|DeleteAll|Delimiter|Deref|Destroy|Digit|Disable|Disabled|DropDownList|Edit|Eject|Else|Enable|Enabled|Error|Exist|Expand|ExStyle|FileSystem|First|Flash|Float|FloatFast|Focus|Font|for|global|Grid|Group|GroupBox|GuiClose|GuiContextMenu|GuiDropFiles|GuiEscape|GuiSize|Hdr|Hidden|Hide|High|HKCC|HKCR|HKCU|HKEY_CLASSES_ROOT|HKEY_CURRENT_CONFIG|HKEY_CURRENT_USER|HKEY_LOCAL_MACHINE|HKEY_USERS|HKLM|HKU|Hours|HScroll|Icon|IconSmall|ID|IDLast|If|IfEqual|IfExist|IfGreater|IfGreaterOrEqual|IfInString|IfLess|IfLessOrEqual|IfMsgBox|IfNotEqual|IfNotExist|IfNotInString|IfWinActive|IfWinExist|IfWinNotActive|IfWinNotExist|Ignore|ImageList|in|Integer|IntegerFast|Interrupt|is|italic|Join|Label|LastFound|LastFoundExist|Limit|Lines|List|ListBox|ListView|local|Lock|Logoff|Low|Lower|Lowercase|MainWindow|Margin|Maximize|MaximizeBox|MaxSize|Minimize|MinimizeBox|MinMax|MinSize|Minutes|MonthCal|Mouse|Move|Multi|NA|No|NoActivate|NoDefault|NoHide|NoIcon|NoMainWindow|norm|Normal|NoSort|NoSortHdr|NoStandard|Not|NoTab|NoTimers|Number|Off|Ok|On|OwnDialogs|Owner|Parse|Password|Picture|Pixel|Pos|Pow|Priority|ProcessName|Radio|Range|Read|ReadOnly|Realtime|Redraw|REG_BINARY|REG_DWORD|REG_EXPAND_SZ|REG_MULTI_SZ|REG_SZ|Region|Relative|Rename|Report|Resize|Restore|Retry|RGB|Screen|Seconds|Section|Serial|SetLabel|ShiftAltTab|Show|Single|Slider|SortDesc|Standard|static|Status|StatusBar|StatusCD|strike|Style|Submit|SysMenu|Tab2|TabStop|Text|Theme|Tile|ToggleCheck|ToggleEnable|ToolWindow|Top|Topmost|TransColor|Transparent|Tray|TreeView|TryAgain|Type|UnCheck|underline|Unicode|Unlock|UpDown|Upper|Uppercase|UseErrorLevel|Vis|VisFirst|Visible|VScroll|Wait|WaitClose|WantCtrlA|WantF2|WantReturn|While|Wrap|Xdigit|xm|xp|xs|Yes|ym|yp|ys)\b/i
};

/* **********************************************
     Begin prism-aspnet.js
********************************************** */

Prism.languages.aspnet = Prism.languages.extend('markup', {
	'page-directive tag': {
		pattern: /<%\s*@.*%>/i,
		inside: {
			'page-directive tag': /<%\s*@\s*(?:Assembly|Control|Implements|Import|Master(?:Type)?|OutputCache|Page|PreviousPageType|Reference|Register)?|%>/i,
			rest: Prism.languages.markup.tag.inside
		}
	},
	'directive tag': {
		pattern: /<%.*%>/i,
		inside: {
			'directive tag': /<%\s*?[$=%#:]{0,2}|%>/i,
			rest: Prism.languages.csharp
		}
	}
});
// Regexp copied from prism-markup, with a negative look-ahead added
Prism.languages.aspnet.tag.pattern = /<(?!%)\/?[^\s>\/]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i;

// match directives of attribute value foo="<% Bar %>"
Prism.languages.insertBefore('inside', 'punctuation', {
	'directive tag': Prism.languages.aspnet['directive tag']
}, Prism.languages.aspnet.tag.inside["attr-value"]);

Prism.languages.insertBefore('aspnet', 'comment', {
	'asp comment': /<%--[\w\W]*?--%>/
});

// script runat="server" contains csharp, not javascript
Prism.languages.insertBefore('aspnet', Prism.languages.javascript ? 'script' : 'tag', {
	'asp script': {
		pattern: /<script(?=.*runat=['"]?server['"]?)[\w\W]*?>[\w\W]*?<\/script>/i,
		inside: {
			tag: {
				pattern: /<\/?script\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?>/i,
				inside: Prism.languages.aspnet.tag.inside
			},
			rest: Prism.languages.csharp || {}
		}
	}
});

// Hacks to fix eager tag matching finishing too early: <script src="<% Foo.Bar %>"> => <script src="<% Foo.Bar %>
if ( Prism.languages.aspnet.style ) {
	Prism.languages.aspnet.style.inside.tag.pattern = /<\/?style\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?>/i;
	Prism.languages.aspnet.style.inside.tag.inside = Prism.languages.aspnet.tag.inside;
}
if ( Prism.languages.aspnet.script ) {
	Prism.languages.aspnet.script.inside.tag.pattern = Prism.languages.aspnet['asp script'].inside.tag.pattern;
	Prism.languages.aspnet.script.inside.tag.inside = Prism.languages.aspnet.tag.inside;
}

/* **********************************************
     Begin prism-applescript.js
********************************************** */

Prism.languages.applescript = {
	'comment': [
		// Allow one level of nesting
		/\(\*(?:\(\*[\w\W]*?\*\)|[\w\W])*?\*\)/,
		/--.+/,
		/#.+/
	],
	'string': /"(?:\\?.)*?"/,
	'number': /\b-?\d*\.?\d+([Ee]-?\d+)?\b/,
	'operator': [
		/[&=≠≤≥*+\-\/÷^]|[<>]=?/,
		/\b(?:(?:start|begin|end)s? with|(?:(?:does not|doesn't) contain|contains?)|(?:is|isn't|is not) (?:in|contained by)|(?:(?:is|isn't|is not) )?(?:greater|less) than(?: or equal)?(?: to)?|(?:(?:does not|doesn't) come|comes) (?:before|after)|(?:is|isn't|is not) equal(?: to)?|(?:(?:does not|doesn't) equal|equals|equal to|isn't|is not)|(?:a )?(?:ref(?: to)?|reference to)|(?:and|or|div|mod|as|not))\b/
	],
	'keyword': /\b(?:about|above|after|against|apart from|around|aside from|at|back|before|beginning|behind|below|beneath|beside|between|but|by|considering|continue|copy|does|eighth|else|end|equal|error|every|exit|false|fifth|first|for|fourth|from|front|get|given|global|if|ignoring|in|instead of|into|is|it|its|last|local|me|middle|my|ninth|of|on|onto|out of|over|prop|property|put|repeat|return|returning|second|set|seventh|since|sixth|some|tell|tenth|that|the|then|third|through|thru|timeout|times|to|transaction|true|try|until|where|while|whose|with|without)\b/,
	'class': {
		pattern: /\b(?:alias|application|boolean|class|constant|date|file|integer|list|number|POSIX file|real|record|reference|RGB color|script|text|centimetres|centimeters|feet|inches|kilometres|kilometers|metres|meters|miles|yards|square feet|square kilometres|square kilometers|square metres|square meters|square miles|square yards|cubic centimetres|cubic centimeters|cubic feet|cubic inches|cubic metres|cubic meters|cubic yards|gallons|litres|liters|quarts|grams|kilograms|ounces|pounds|degrees Celsius|degrees Fahrenheit|degrees Kelvin)\b/,
		alias: 'builtin'
	},
	'punctuation': /[{}():,¬«»《》]/
};

/* **********************************************
     Begin prism-apl.js
********************************************** */

Prism.languages.apl = {
	'comment': /(?:⍝|#[! ]).*$/m,
	'string': /'(?:[^'\r\n]|'')*'/,
	'number': /¯?(?:\d*\.?\d+(?:e[+¯]?\d+)?|¯|∞)(?:j¯?(?:\d*\.?\d+(?:e[\+¯]?\d+)?|¯|∞))?/i,
	'statement': /:[A-Z][a-z][A-Za-z]*\b/,
	'system-function': {
		pattern: /⎕[A-Z]+/i,
		alias: 'function'
	},
	'constant': /[⍬⌾#⎕⍞]/,
	'function': /[-+×÷⌈⌊∣|⍳?*⍟○!⌹<≤=>≥≠≡≢∊⍷∪∩~∨∧⍱⍲⍴,⍪⌽⊖⍉↑↓⊂⊃⌷⍋⍒⊤⊥⍕⍎⊣⊢⍁⍂≈⍯↗¤→]/,
	'monadic-operator': {
		pattern: /[\\\/⌿⍀¨⍨⌶&∥]/,
		alias: 'operator'
	},
	'dyadic-operator': {
		pattern: /[.⍣⍠⍤∘⌸]/,
		alias: 'operator'
	},
	'assignment': {
		pattern: /←/,
		alias: 'keyword'
	},
	'punctuation': /[\[;\]()◇⋄]/,
	'dfn': {
		pattern: /[{}⍺⍵⍶⍹∇⍫:]/,
		alias: 'builtin'
	}
};

/* **********************************************
     Begin prism-apacheconf.js
********************************************** */

Prism.languages.apacheconf = {
	'comment': /#.*/,
	'directive-inline': {
		pattern: /^(\s*)\b(AcceptFilter|AcceptPathInfo|AccessFileName|Action|AddAlt|AddAltByEncoding|AddAltByType|AddCharset|AddDefaultCharset|AddDescription|AddEncoding|AddHandler|AddIcon|AddIconByEncoding|AddIconByType|AddInputFilter|AddLanguage|AddModuleInfo|AddOutputFilter|AddOutputFilterByType|AddType|Alias|AliasMatch|Allow|AllowCONNECT|AllowEncodedSlashes|AllowMethods|AllowOverride|AllowOverrideList|Anonymous|Anonymous_LogEmail|Anonymous_MustGiveEmail|Anonymous_NoUserID|Anonymous_VerifyEmail|AsyncRequestWorkerFactor|AuthBasicAuthoritative|AuthBasicFake|AuthBasicProvider|AuthBasicUseDigestAlgorithm|AuthDBDUserPWQuery|AuthDBDUserRealmQuery|AuthDBMGroupFile|AuthDBMType|AuthDBMUserFile|AuthDigestAlgorithm|AuthDigestDomain|AuthDigestNonceLifetime|AuthDigestProvider|AuthDigestQop|AuthDigestShmemSize|AuthFormAuthoritative|AuthFormBody|AuthFormDisableNoStore|AuthFormFakeBasicAuth|AuthFormLocation|AuthFormLoginRequiredLocation|AuthFormLoginSuccessLocation|AuthFormLogoutLocation|AuthFormMethod|AuthFormMimetype|AuthFormPassword|AuthFormProvider|AuthFormSitePassphrase|AuthFormSize|AuthFormUsername|AuthGroupFile|AuthLDAPAuthorizePrefix|AuthLDAPBindAuthoritative|AuthLDAPBindDN|AuthLDAPBindPassword|AuthLDAPCharsetConfig|AuthLDAPCompareAsUser|AuthLDAPCompareDNOnServer|AuthLDAPDereferenceAliases|AuthLDAPGroupAttribute|AuthLDAPGroupAttributeIsDN|AuthLDAPInitialBindAsUser|AuthLDAPInitialBindPattern|AuthLDAPMaxSubGroupDepth|AuthLDAPRemoteUserAttribute|AuthLDAPRemoteUserIsDN|AuthLDAPSearchAsUser|AuthLDAPSubGroupAttribute|AuthLDAPSubGroupClass|AuthLDAPUrl|AuthMerging|AuthName|AuthnCacheContext|AuthnCacheEnable|AuthnCacheProvideFor|AuthnCacheSOCache|AuthnCacheTimeout|AuthnzFcgiCheckAuthnProvider|AuthnzFcgiDefineProvider|AuthType|AuthUserFile|AuthzDBDLoginToReferer|AuthzDBDQuery|AuthzDBDRedirectQuery|AuthzDBMType|AuthzSendForbiddenOnFailure|BalancerGrowth|BalancerInherit|BalancerMember|BalancerPersist|BrowserMatch|BrowserMatchNoCase|BufferedLogs|BufferSize|CacheDefaultExpire|CacheDetailHeader|CacheDirLength|CacheDirLevels|CacheDisable|CacheEnable|CacheFile|CacheHeader|CacheIgnoreCacheControl|CacheIgnoreHeaders|CacheIgnoreNoLastMod|CacheIgnoreQueryString|CacheIgnoreURLSessionIdentifiers|CacheKeyBaseURL|CacheLastModifiedFactor|CacheLock|CacheLockMaxAge|CacheLockPath|CacheMaxExpire|CacheMaxFileSize|CacheMinExpire|CacheMinFileSize|CacheNegotiatedDocs|CacheQuickHandler|CacheReadSize|CacheReadTime|CacheRoot|CacheSocache|CacheSocacheMaxSize|CacheSocacheMaxTime|CacheSocacheMinTime|CacheSocacheReadSize|CacheSocacheReadTime|CacheStaleOnError|CacheStoreExpired|CacheStoreNoStore|CacheStorePrivate|CGIDScriptTimeout|CGIMapExtension|CharsetDefault|CharsetOptions|CharsetSourceEnc|CheckCaseOnly|CheckSpelling|ChrootDir|ContentDigest|CookieDomain|CookieExpires|CookieName|CookieStyle|CookieTracking|CoreDumpDirectory|CustomLog|Dav|DavDepthInfinity|DavGenericLockDB|DavLockDB|DavMinTimeout|DBDExptime|DBDInitSQL|DBDKeep|DBDMax|DBDMin|DBDParams|DBDPersist|DBDPrepareSQL|DBDriver|DefaultIcon|DefaultLanguage|DefaultRuntimeDir|DefaultType|Define|DeflateBufferSize|DeflateCompressionLevel|DeflateFilterNote|DeflateInflateLimitRequestBody|DeflateInflateRatioBurst|DeflateInflateRatioLimit|DeflateMemLevel|DeflateWindowSize|Deny|DirectoryCheckHandler|DirectoryIndex|DirectoryIndexRedirect|DirectorySlash|DocumentRoot|DTracePrivileges|DumpIOInput|DumpIOOutput|EnableExceptionHook|EnableMMAP|EnableSendfile|Error|ErrorDocument|ErrorLog|ErrorLogFormat|Example|ExpiresActive|ExpiresByType|ExpiresDefault|ExtendedStatus|ExtFilterDefine|ExtFilterOptions|FallbackResource|FileETag|FilterChain|FilterDeclare|FilterProtocol|FilterProvider|FilterTrace|ForceLanguagePriority|ForceType|ForensicLog|GprofDir|GracefulShutdownTimeout|Group|Header|HeaderName|HeartbeatAddress|HeartbeatListen|HeartbeatMaxServers|HeartbeatStorage|HeartbeatStorage|HostnameLookups|IdentityCheck|IdentityCheckTimeout|ImapBase|ImapDefault|ImapMenu|Include|IncludeOptional|IndexHeadInsert|IndexIgnore|IndexIgnoreReset|IndexOptions|IndexOrderDefault|IndexStyleSheet|InputSed|ISAPIAppendLogToErrors|ISAPIAppendLogToQuery|ISAPICacheFile|ISAPIFakeAsync|ISAPILogNotSupported|ISAPIReadAheadBuffer|KeepAlive|KeepAliveTimeout|KeptBodySize|LanguagePriority|LDAPCacheEntries|LDAPCacheTTL|LDAPConnectionPoolTTL|LDAPConnectionTimeout|LDAPLibraryDebug|LDAPOpCacheEntries|LDAPOpCacheTTL|LDAPReferralHopLimit|LDAPReferrals|LDAPRetries|LDAPRetryDelay|LDAPSharedCacheFile|LDAPSharedCacheSize|LDAPTimeout|LDAPTrustedClientCert|LDAPTrustedGlobalCert|LDAPTrustedMode|LDAPVerifyServerCert|LimitInternalRecursion|LimitRequestBody|LimitRequestFields|LimitRequestFieldSize|LimitRequestLine|LimitXMLRequestBody|Listen|ListenBackLog|LoadFile|LoadModule|LogFormat|LogLevel|LogMessage|LuaAuthzProvider|LuaCodeCache|LuaHookAccessChecker|LuaHookAuthChecker|LuaHookCheckUserID|LuaHookFixups|LuaHookInsertFilter|LuaHookLog|LuaHookMapToStorage|LuaHookTranslateName|LuaHookTypeChecker|LuaInherit|LuaInputFilter|LuaMapHandler|LuaOutputFilter|LuaPackageCPath|LuaPackagePath|LuaQuickHandler|LuaRoot|LuaScope|MaxConnectionsPerChild|MaxKeepAliveRequests|MaxMemFree|MaxRangeOverlaps|MaxRangeReversals|MaxRanges|MaxRequestWorkers|MaxSpareServers|MaxSpareThreads|MaxThreads|MergeTrailers|MetaDir|MetaFiles|MetaSuffix|MimeMagicFile|MinSpareServers|MinSpareThreads|MMapFile|ModemStandard|ModMimeUsePathInfo|MultiviewsMatch|Mutex|NameVirtualHost|NoProxy|NWSSLTrustedCerts|NWSSLUpgradeable|Options|Order|OutputSed|PassEnv|PidFile|PrivilegesMode|Protocol|ProtocolEcho|ProxyAddHeaders|ProxyBadHeader|ProxyBlock|ProxyDomain|ProxyErrorOverride|ProxyExpressDBMFile|ProxyExpressDBMType|ProxyExpressEnable|ProxyFtpDirCharset|ProxyFtpEscapeWildcards|ProxyFtpListOnWildcard|ProxyHTMLBufSize|ProxyHTMLCharsetOut|ProxyHTMLDocType|ProxyHTMLEnable|ProxyHTMLEvents|ProxyHTMLExtended|ProxyHTMLFixups|ProxyHTMLInterp|ProxyHTMLLinks|ProxyHTMLMeta|ProxyHTMLStripComments|ProxyHTMLURLMap|ProxyIOBufferSize|ProxyMaxForwards|ProxyPass|ProxyPassInherit|ProxyPassInterpolateEnv|ProxyPassMatch|ProxyPassReverse|ProxyPassReverseCookieDomain|ProxyPassReverseCookiePath|ProxyPreserveHost|ProxyReceiveBufferSize|ProxyRemote|ProxyRemoteMatch|ProxyRequests|ProxySCGIInternalRedirect|ProxySCGISendfile|ProxySet|ProxySourceAddress|ProxyStatus|ProxyTimeout|ProxyVia|ReadmeName|ReceiveBufferSize|Redirect|RedirectMatch|RedirectPermanent|RedirectTemp|ReflectorHeader|RemoteIPHeader|RemoteIPInternalProxy|RemoteIPInternalProxyList|RemoteIPProxiesHeader|RemoteIPTrustedProxy|RemoteIPTrustedProxyList|RemoveCharset|RemoveEncoding|RemoveHandler|RemoveInputFilter|RemoveLanguage|RemoveOutputFilter|RemoveType|RequestHeader|RequestReadTimeout|Require|RewriteBase|RewriteCond|RewriteEngine|RewriteMap|RewriteOptions|RewriteRule|RLimitCPU|RLimitMEM|RLimitNPROC|Satisfy|ScoreBoardFile|Script|ScriptAlias|ScriptAliasMatch|ScriptInterpreterSource|ScriptLog|ScriptLogBuffer|ScriptLogLength|ScriptSock|SecureListen|SeeRequestTail|SendBufferSize|ServerAdmin|ServerAlias|ServerLimit|ServerName|ServerPath|ServerRoot|ServerSignature|ServerTokens|Session|SessionCookieName|SessionCookieName2|SessionCookieRemove|SessionCryptoCipher|SessionCryptoDriver|SessionCryptoPassphrase|SessionCryptoPassphraseFile|SessionDBDCookieName|SessionDBDCookieName2|SessionDBDCookieRemove|SessionDBDDeleteLabel|SessionDBDInsertLabel|SessionDBDPerUser|SessionDBDSelectLabel|SessionDBDUpdateLabel|SessionEnv|SessionExclude|SessionHeader|SessionInclude|SessionMaxAge|SetEnv|SetEnvIf|SetEnvIfExpr|SetEnvIfNoCase|SetHandler|SetInputFilter|SetOutputFilter|SSIEndTag|SSIErrorMsg|SSIETag|SSILastModified|SSILegacyExprParser|SSIStartTag|SSITimeFormat|SSIUndefinedEcho|SSLCACertificateFile|SSLCACertificatePath|SSLCADNRequestFile|SSLCADNRequestPath|SSLCARevocationCheck|SSLCARevocationFile|SSLCARevocationPath|SSLCertificateChainFile|SSLCertificateFile|SSLCertificateKeyFile|SSLCipherSuite|SSLCompression|SSLCryptoDevice|SSLEngine|SSLFIPS|SSLHonorCipherOrder|SSLInsecureRenegotiation|SSLOCSPDefaultResponder|SSLOCSPEnable|SSLOCSPOverrideResponder|SSLOCSPResponderTimeout|SSLOCSPResponseMaxAge|SSLOCSPResponseTimeSkew|SSLOCSPUseRequestNonce|SSLOpenSSLConfCmd|SSLOptions|SSLPassPhraseDialog|SSLProtocol|SSLProxyCACertificateFile|SSLProxyCACertificatePath|SSLProxyCARevocationCheck|SSLProxyCARevocationFile|SSLProxyCARevocationPath|SSLProxyCheckPeerCN|SSLProxyCheckPeerExpire|SSLProxyCheckPeerName|SSLProxyCipherSuite|SSLProxyEngine|SSLProxyMachineCertificateChainFile|SSLProxyMachineCertificateFile|SSLProxyMachineCertificatePath|SSLProxyProtocol|SSLProxyVerify|SSLProxyVerifyDepth|SSLRandomSeed|SSLRenegBufferSize|SSLRequire|SSLRequireSSL|SSLSessionCache|SSLSessionCacheTimeout|SSLSessionTicketKeyFile|SSLSRPUnknownUserSeed|SSLSRPVerifierFile|SSLStaplingCache|SSLStaplingErrorCacheTimeout|SSLStaplingFakeTryLater|SSLStaplingForceURL|SSLStaplingResponderTimeout|SSLStaplingResponseMaxAge|SSLStaplingResponseTimeSkew|SSLStaplingReturnResponderErrors|SSLStaplingStandardCacheTimeout|SSLStrictSNIVHostCheck|SSLUserName|SSLUseStapling|SSLVerifyClient|SSLVerifyDepth|StartServers|StartThreads|Substitute|Suexec|SuexecUserGroup|ThreadLimit|ThreadsPerChild|ThreadStackSize|TimeOut|TraceEnable|TransferLog|TypesConfig|UnDefine|UndefMacro|UnsetEnv|Use|UseCanonicalName|UseCanonicalPhysicalPort|User|UserDir|VHostCGIMode|VHostCGIPrivs|VHostGroup|VHostPrivs|VHostSecure|VHostUser|VirtualDocumentRoot|VirtualDocumentRootIP|VirtualScriptAlias|VirtualScriptAliasIP|WatchdogInterval|XBitHack|xml2EncAlias|xml2EncDefault|xml2StartParse)\b/mi,
		lookbehind: true,
		alias: 'property'
	},
	'directive-block': {
		pattern: /<\/?\b(AuthnProviderAlias|AuthzProviderAlias|Directory|DirectoryMatch|Else|ElseIf|Files|FilesMatch|If|IfDefine|IfModule|IfVersion|Limit|LimitExcept|Location|LocationMatch|Macro|Proxy|RequireAll|RequireAny|RequireNone|VirtualHost)\b *.*>/i,
		inside: {
			'directive-block': {
				pattern: /^<\/?\w+/,
				inside: {
					'punctuation': /^<\/?/
				},
				alias: 'tag'
			},
			'directive-block-parameter': {
				pattern: /.*[^>]/,
				inside: {
					'punctuation': /:/,
					'string': {
						pattern: /("|').*\1/,
						inside: {
							'variable': /(\$|%)\{?(\w\.?(\+|\-|:)?)+\}?/
						}
					}
				},
				alias: 'attr-value'
			},
			'punctuation': />/
		},
		alias: 'tag'
	},
	'directive-flags': {
		pattern: /\[(\w,?)+\]/,
		alias: 'keyword'
	},
	'string': {
		pattern: /("|').*\1/,
		inside: {
			'variable': /(\$|%)\{?(\w\.?(\+|\-|:)?)+\}?/
		}
	},
	'variable': /(\$|%)\{?(\w\.?(\+|\-|:)?)+\}?/,
	'regex': /\^?.*\$|\^.*\$?/
};


/* **********************************************
     Begin prism-actionscript.js
********************************************** */

Prism.languages.actionscript = Prism.languages.extend('javascript',  {
	'keyword': /\b(?:as|break|case|catch|class|const|default|delete|do|else|extends|finally|for|function|if|implements|import|in|instanceof|interface|internal|is|native|new|null|package|private|protected|public|return|super|switch|this|throw|try|typeof|use|var|void|while|with|dynamic|each|final|get|include|namespace|native|override|set|static)\b/,
	'operator': /\+\+|--|(?:[+\-*\/%^]|&&?|\|\|?|<<?|>>?>?|[!=]=?)=?|[~?@]/
});
Prism.languages.actionscript['class-name'].alias = 'function';

if (Prism.languages.markup) {
	Prism.languages.insertBefore('actionscript', 'string', {
		'xml': {
			pattern: /(^|[^.])<\/?\w+(?:\s+[^\s>\/=]+=("|')(?:\\\1|\\?(?!\1)[\w\W])*\2)*\s*\/?>/,
			lookbehind: true,
			inside: {
				rest: Prism.languages.markup
			}
		}
	});
}

/* **********************************************
     Begin prism-abap.js
********************************************** */

Prism.languages.abap = {
	'comment': /^\*.*/m,
	'string' : /(`|')(\\?.)*?\1/m,
	'string-template': {
		pattern: /(\||\})(\\?.)*?(?=\||\{)/,
		lookbehind: true,
		alias: 'string'
	},
	/* End Of Line comments should not interfere with strings when the  
	quote character occurs within them. We assume a string being highlighted
	inside an EOL comment is more acceptable than the opposite.
	*/
	'eol-comment': {
		pattern: /(^|\s)".*/m,
		lookbehind: true,
		alias: 'comment'
	},
	'keyword' : {
		pattern: /(\s|\.|^)(?:SCIENTIFIC_WITH_LEADING_ZERO|SCALE_PRESERVING_SCIENTIFIC|RMC_COMMUNICATION_FAILURE|END-ENHANCEMENT-SECTION|MULTIPLY-CORRESPONDING|SUBTRACT-CORRESPONDING|VERIFICATION-MESSAGE|DIVIDE-CORRESPONDING|ENHANCEMENT-SECTION|CURRENCY_CONVERSION|RMC_SYSTEM_FAILURE|START-OF-SELECTION|MOVE-CORRESPONDING|RMC_INVALID_STATUS|CUSTOMER-FUNCTION|END-OF-DEFINITION|ENHANCEMENT-POINT|SYSTEM-EXCEPTIONS|ADD-CORRESPONDING|SCALE_PRESERVING|SELECTION-SCREEN|CURSOR-SELECTION|END-OF-SELECTION|LOAD-OF-PROGRAM|SCROLL-BOUNDARY|SELECTION-TABLE|EXCEPTION-TABLE|IMPLEMENTATIONS|PARAMETER-TABLE|RIGHT-JUSTIFIED|UNIT_CONVERSION|AUTHORITY-CHECK|LIST-PROCESSING|SIGN_AS_POSTFIX|COL_BACKGROUND|IMPLEMENTATION|INTERFACE-POOL|TRANSFORMATION|IDENTIFICATION|ENDENHANCEMENT|LINE-SELECTION|INITIALIZATION|LEFT-JUSTIFIED|SELECT-OPTIONS|SELECTION-SETS|COMMUNICATION|CORRESPONDING|DECIMAL_SHIFT|PRINT-CONTROL|VALUE-REQUEST|CHAIN-REQUEST|FUNCTION-POOL|FIELD-SYMBOLS|FUNCTIONALITY|INVERTED-DATE|SELECTION-SET|CLASS-METHODS|OUTPUT-LENGTH|CLASS-CODING|COL_NEGATIVE|ERRORMESSAGE|FIELD-GROUPS|HELP-REQUEST|NO-EXTENSION|NO-TOPOFPAGE|REDEFINITION|DISPLAY-MODE|ENDINTERFACE|EXIT-COMMAND|FIELD-SYMBOL|NO-SCROLLING|SHORTDUMP-ID|ACCESSPOLICY|CLASS-EVENTS|COL_POSITIVE|DECLARATIONS|ENHANCEMENTS|FILTER-TABLE|SWITCHSTATES|SYNTAX-CHECK|TRANSPORTING|ASYNCHRONOUS|SYNTAX-TRACE|TOKENIZATION|USER-COMMAND|WITH-HEADING|ABAP-SOURCE|BREAK-POINT|CHAIN-INPUT|COMPRESSION|FIXED-POINT|NEW-SECTION|NON-UNICODE|OCCURRENCES|RESPONSIBLE|SYSTEM-CALL|TRACE-TABLE|ABBREVIATED|CHAR-TO-HEX|END-OF-FILE|ENDFUNCTION|ENVIRONMENT|ASSOCIATION|COL_HEADING|EDITOR-CALL|END-OF-PAGE|ENGINEERING|IMPLEMENTED|INTENSIFIED|RADIOBUTTON|SYSTEM-EXIT|TOP-OF-PAGE|TRANSACTION|APPLICATION|CONCATENATE|DESTINATION|ENHANCEMENT|IMMEDIATELY|NO-GROUPING|PRECOMPILED|REPLACEMENT|TITLE-LINES|ACTIVATION|BYTE-ORDER|CLASS-POOL|CONNECTION|CONVERSION|DEFINITION|DEPARTMENT|EXPIRATION|INHERITING|MESSAGE-ID|NO-HEADING|PERFORMING|QUEUE-ONLY|RIGHTSPACE|SCIENTIFIC|STATUSINFO|STRUCTURES|SYNCPOINTS|WITH-TITLE|ATTRIBUTES|BOUNDARIES|CLASS-DATA|COL_NORMAL|DD\/MM\/YYYY|DESCENDING|INTERFACES|LINE-COUNT|MM\/DD\/YYYY|NON-UNIQUE|PRESERVING|SELECTIONS|STATEMENTS|SUBROUTINE|TRUNCATION|TYPE-POOLS|ARITHMETIC|BACKGROUND|ENDPROVIDE|EXCEPTIONS|IDENTIFIER|INDEX-LINE|OBLIGATORY|PARAMETERS|PERCENTAGE|PUSHBUTTON|RESOLUTION|COMPONENTS|DEALLOCATE|DISCONNECT|DUPLICATES|FIRST-LINE|HEAD-LINES|NO-DISPLAY|OCCURRENCE|RESPECTING|RETURNCODE|SUBMATCHES|TRACE-FILE|ASCENDING|BYPASSING|ENDMODULE|EXCEPTION|EXCLUDING|EXPORTING|INCREMENT|MATCHCODE|PARAMETER|PARTIALLY|PREFERRED|REFERENCE|REPLACING|RETURNING|SELECTION|SEPARATED|SPECIFIED|STATEMENT|TIMESTAMP|TYPE-POOL|ACCEPTING|APPENDAGE|ASSIGNING|COL_GROUP|COMPARING|CONSTANTS|DANGEROUS|IMPORTING|INSTANCES|LEFTSPACE|LOG-POINT|QUICKINFO|READ-ONLY|SCROLLING|SQLSCRIPT|STEP-LOOP|TOP-LINES|TRANSLATE|APPENDING|AUTHORITY|CHARACTER|COMPONENT|CONDITION|DIRECTORY|DUPLICATE|MESSAGING|RECEIVING|SUBSCREEN|ACCORDING|COL_TOTAL|END-LINES|ENDMETHOD|ENDSELECT|EXPANDING|EXTENSION|INCLUDING|INFOTYPES|INTERFACE|INTERVALS|LINE-SIZE|PF-STATUS|PROCEDURE|PROTECTED|REQUESTED|RESUMABLE|RIGHTPLUS|SAP-SPOOL|SECONDARY|STRUCTURE|SUBSTRING|TABLEVIEW|NUMOFCHAR|ADJACENT|ANALYSIS|ASSIGNED|BACKWARD|CHANNELS|CHECKBOX|CONTINUE|CRITICAL|DATAINFO|DD\/MM\/YY|DURATION|ENCODING|ENDCLASS|FUNCTION|LEFTPLUS|LINEFEED|MM\/DD\/YY|OVERFLOW|RECEIVED|SKIPPING|SORTABLE|STANDARD|SUBTRACT|SUPPRESS|TABSTRIP|TITLEBAR|TRUNCATE|UNASSIGN|WHENEVER|ANALYZER|COALESCE|COMMENTS|CONDENSE|DECIMALS|DEFERRED|ENDWHILE|EXPLICIT|KEYWORDS|MESSAGES|POSITION|PRIORITY|RECEIVER|RENAMING|TIMEZONE|TRAILING|ALLOCATE|CENTERED|CIRCULAR|CONTROLS|CURRENCY|DELETING|DESCRIBE|DISTANCE|ENDCATCH|EXPONENT|EXTENDED|GENERATE|IGNORING|INCLUDES|INTERNAL|MAJOR-ID|MODIFIER|NEW-LINE|OPTIONAL|PROPERTY|ROLLBACK|STARTING|SUPPLIED|ABSTRACT|CHANGING|CONTEXTS|CREATING|CUSTOMER|DATABASE|DAYLIGHT|DEFINING|DISTINCT|DIVISION|ENABLING|ENDCHAIN|ESCAPING|HARMLESS|IMPLICIT|INACTIVE|LANGUAGE|MINOR-ID|MULTIPLY|NEW-PAGE|NO-TITLE|POS_HIGH|SEPARATE|TEXTPOOL|TRANSFER|SELECTOR|DBMAXLEN|ITERATOR|SELECTOR|ARCHIVE|BIT-XOR|BYTE-CO|COLLECT|COMMENT|CURRENT|DEFAULT|DISPLAY|ENDFORM|EXTRACT|LEADING|LISTBOX|LOCATOR|MEMBERS|METHODS|NESTING|POS_LOW|PROCESS|PROVIDE|RAISING|RESERVE|SECONDS|SUMMARY|VISIBLE|BETWEEN|BIT-AND|BYTE-CS|CLEANUP|COMPUTE|CONTROL|CONVERT|DATASET|ENDCASE|FORWARD|HEADERS|HOTSPOT|INCLUDE|INVERSE|KEEPING|NO-ZERO|OBJECTS|OVERLAY|PADDING|PATTERN|PROGRAM|REFRESH|SECTION|SUMMING|TESTING|VERSION|WINDOWS|WITHOUT|BIT-NOT|BYTE-CA|BYTE-NA|CASTING|CONTEXT|COUNTRY|DYNAMIC|ENABLED|ENDLOOP|EXECUTE|FRIENDS|HANDLER|HEADING|INITIAL|\*-INPUT|LOGFILE|MAXIMUM|MINIMUM|NO-GAPS|NO-SIGN|PRAGMAS|PRIMARY|PRIVATE|REDUCED|REPLACE|REQUEST|RESULTS|UNICODE|WARNING|ALIASES|BYTE-CN|BYTE-NS|CALLING|COL_KEY|COLUMNS|CONNECT|ENDEXEC|ENTRIES|EXCLUDE|FILTERS|FURTHER|HELP-ID|LOGICAL|MAPPING|MESSAGE|NAMETAB|OPTIONS|PACKAGE|PERFORM|RECEIVE|STATICS|VARYING|BINDING|CHARLEN|GREATER|XSTRLEN|ACCEPT|APPEND|DETAIL|ELSEIF|ENDING|ENDTRY|FORMAT|FRAMES|GIVING|HASHED|HEADER|IMPORT|INSERT|MARGIN|MODULE|NATIVE|OBJECT|OFFSET|REMOTE|RESUME|SAVING|SIMPLE|SUBMIT|TABBED|TOKENS|UNIQUE|UNPACK|UPDATE|WINDOW|YELLOW|ACTUAL|ASPECT|CENTER|CURSOR|DELETE|DIALOG|DIVIDE|DURING|ERRORS|EVENTS|EXTEND|FILTER|HANDLE|HAVING|IGNORE|LITTLE|MEMORY|NO-GAP|OCCURS|OPTION|PERSON|PLACES|PUBLIC|REDUCE|REPORT|RESULT|SINGLE|SORTED|SWITCH|SYNTAX|TARGET|VALUES|WRITER|ASSERT|BLOCKS|BOUNDS|BUFFER|CHANGE|COLUMN|COMMIT|CONCAT|COPIES|CREATE|DDMMYY|DEFINE|ENDIAN|ESCAPE|EXPAND|KERNEL|LAYOUT|LEGACY|LEVELS|MMDDYY|NUMBER|OUTPUT|RANGES|READER|RETURN|SCREEN|SEARCH|SELECT|SHARED|SOURCE|STABLE|STATIC|SUBKEY|SUFFIX|TABLES|UNWIND|YYMMDD|ASSIGN|BACKUP|BEFORE|BINARY|BIT-OR|BLANKS|CLIENT|CODING|COMMON|DEMAND|DYNPRO|EXCEPT|EXISTS|EXPORT|FIELDS|GLOBAL|GROUPS|LENGTH|LOCALE|MEDIUM|METHOD|MODIFY|NESTED|OTHERS|REJECT|SCROLL|SUPPLY|SYMBOL|ENDFOR|STRLEN|ALIGN|BEGIN|BOUND|ENDAT|ENTRY|EVENT|FINAL|FLUSH|GRANT|INNER|SHORT|USING|WRITE|AFTER|BLACK|BLOCK|CLOCK|COLOR|COUNT|DUMMY|EMPTY|ENDDO|ENDON|GREEN|INDEX|INOUT|LEAVE|LEVEL|LINES|MODIF|ORDER|OUTER|RANGE|RESET|RETRY|RIGHT|SMART|SPLIT|STYLE|TABLE|THROW|UNDER|UNTIL|UPPER|UTF-8|WHERE|ALIAS|BLANK|CLEAR|CLOSE|EXACT|FETCH|FIRST|FOUND|GROUP|LLANG|LOCAL|OTHER|REGEX|SPOOL|TITLE|TYPES|VALID|WHILE|ALPHA|BOXED|CATCH|CHAIN|CHECK|CLASS|COVER|ENDIF|EQUIV|FIELD|FLOOR|FRAME|INPUT|LOWER|MATCH|NODES|PAGES|PRINT|RAISE|ROUND|SHIFT|SPACE|SPOTS|STAMP|STATE|TASKS|TIMES|TRMAC|ULINE|UNION|VALUE|WIDTH|EQUAL|LOG10|TRUNC|BLOB|CASE|CEIL|CLOB|COND|EXIT|FILE|GAPS|HOLD|INCL|INTO|KEEP|KEYS|LAST|LINE|LONG|LPAD|MAIL|MODE|OPEN|PINK|READ|ROWS|TEST|THEN|ZERO|AREA|BACK|BADI|BYTE|CAST|EDIT|EXEC|FAIL|FIND|FKEQ|FONT|FREE|GKEQ|HIDE|INIT|ITNO|LATE|LOOP|MAIN|MARK|MOVE|NEXT|NULL|RISK|ROLE|UNIT|WAIT|ZONE|BASE|CALL|CODE|DATA|DATE|FKGE|GKGE|HIGH|KIND|LEFT|LIST|MASK|MESH|NAME|NODE|PACK|PAGE|POOL|SEND|SIGN|SIZE|SOME|STOP|TASK|TEXT|TIME|USER|VARY|WITH|WORD|BLUE|CONV|COPY|DEEP|ELSE|FORM|FROM|HINT|ICON|JOIN|LIKE|LOAD|ONLY|PART|SCAN|SKIP|SORT|TYPE|UNIX|VIEW|WHEN|WORK|ACOS|ASIN|ATAN|COSH|EACH|FRAC|LESS|RTTI|SINH|SQRT|TANH|AVG|BIT|DIV|ISO|LET|OUT|PAD|SQL|ALL|CI_|CPI|END|LOB|LPI|MAX|MIN|NEW|OLE|RUN|SET|\?TO|YES|ABS|ADD|AND|BIG|FOR|HDB|JOB|LOW|NOT|SAP|TRY|VIA|XML|ANY|GET|IDS|KEY|MOD|OFF|PUT|RAW|RED|REF|SUM|TAB|XSD|CNT|COS|EXP|LOG|SIN|TAN|XOR|AT|CO|CP|DO|GT|ID|IF|NS|OR|BT|CA|CS|GE|NA|NB|EQ|IN|LT|NE|NO|OF|ON|PF|TO|AS|BY|CN|IS|LE|NP|UP|E|I|M|O|Z|C|X)\b/i,
		lookbehind: true
	},
	/* Numbers can be only integers. Decimal or Hex appear only as strings */
	'number' : /\b\d+\b/,
	/* Operators must always be surrounded by whitespace, they cannot be put 
	adjacent to operands. 
	*/
	'operator' : {
		pattern: /(\s)(?:\*\*?|<[=>]?|>=?|\?=|[-+\/=])(?=\s)/,
		lookbehind: true
	},
	'string-operator' : {
		pattern: /(\s)&&?(?=\s)/,
		lookbehind: true,
		/* The official editor highlights */
		alias: "keyword"
	},
	'token-operator' : [{
		/* Special operators used to access structure components, class methods/attributes, etc. */
		pattern: /(\w)(?:->?|=>|[~|{}])(?=\w)/,
		lookbehind: true,
		alias: "punctuation"
	}, {
	    /* Special tokens used do delimit string templates */
	    pattern: /[|{}]/,
		alias: "punctuation"
	}],
	'punctuation' : /[,.:()]/
};
return Prism;
};

if (typeof define === 'function' && define.amd) {
	define(function() { return prism({}, typeof window !== 'undefined' ? window : global); });
} else if (typeof module === 'object' && module.exports) {
	module.exports = prism({}, typeof window !== 'undefined' ? window : global);
} else {
	var w = typeof window !== 'undefined' ? window : global;
	prism(this || w, w);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/vertex.c":[function(require,module,exports){
module.exports = function parse(params){
      var template = "attribute vec4 a_position; \n" +
" \n" +
"uniform mat4 u_matrix; \n" +
" \n" +
"void main() { \n" +
"  gl_Position = u_matrix * a_position; \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],"/Users/home/javascript/webgl-triangles/index.js":[function(require,module,exports){
var mat4 = require('gl-mat4');

// Adds a canvas to the parent element and start rendering the scene
// using the given vertex and fragment shaders.
function add(parentEL, vert, frag) {

    var glCanvas = getCanvas(parentEL);

    //Create a matrix to transform the triangle
    var matrix = mat4.create();
    //Move it back 4 units
    mat4.translate(matrix, matrix, [0.0, 0.0, -4.0]);
    
    attacheMouseListeners(glCanvas, matrix);
    
    glCanvas.gl.enable(glCanvas.gl.DEPTH_TEST);
    
    //create a simple renderer for a simple triangle
    var renderer = simpleRenderer(glCanvas.gl, 1, vert, frag, new Float32Array([-0.5,-0.5,-1.0,0.0,0.5,-1.0,0.5,-0.5,-1.0]));


    //Called when a frame is scheduled.  A rapid sequence of scene draws creates the animation effect.
    var renderFn = function(timestamp) {

        mat4.rotateY(matrix, matrix, Math.PI/512);
        renderer(matrix, [1, 0, 0]);
        var second = mat4.create();
        mat4.rotateY(second, matrix, 2*Math.PI/3);
        renderer(second, [0, 1, 0]);
        var third = mat4.create();
        mat4.rotateY(third, second, 2*Math.PI/3);
        renderer(third, [0, 0, 1]);
        window.requestAnimationFrame(renderFn);
    }

    window.requestAnimationFrame(renderFn);

}

// Get A WebGL context
function getCanvas(parent) {
    //Create a canvas with specified attributes and append it to the parent.
    var canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 1024;
    
    var div    = document.createElement('div');
    canvas.setAttribute('id', 'mycanvas');
    div.setAttribute('id', 'glcanvas');
    parent.appendChild(div);
    div.appendChild(canvas);
    
    var gl     = canvas.getContext('webgl');
    return {canvas: canvas, gl : gl}
}

function attacheMouseListeners(canvas, matrix) {
    
    document.onmousemove = handleMouseMove(matrix);
    
}

function handleMouseMove(matrix) {

    var lastX = 0;
    var lastY = 0;
    return function( event ) {

        var x = event.clientX;
        var y = event.clientY;

        var diffX = x - lastX;
        var diffY = y - lastY;
        
        mat4.rotateY(matrix, matrix, (diffX/960) * Math.PI);
        mat4.rotateX(matrix, matrix, (diffY/1024) * Math.PI);

        lastX = x;
        lastY = y;
    }
}

//Returns a simple rendering function that draws the passed in vertices.
function simpleRenderer(gl, aspect, vert, frag, vertices) {

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vert());
    gl.compileShader(vertexShader);
    
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, frag());
    gl.compileShader(fragmentShader);
    
    var shaders = [vertexShader, fragmentShader];
    var program = gl.createProgram();
    shaders.forEach(function(shader) {
        gl.attachShader(program, shader);
    })
    gl.linkProgram(program);
    
    return function(parentNode, color) {
        gl.clear(gl.GL_COLOR_BUFFER_BIT);

        //Field of view is very similar to a cameras field of view.
        var fieldOfView = Math.PI/2;
        //Far edge of scene defines how far away an object can be from the camera before it disappears.
        var farEdgeOfScene = 100;
        //Near edge of scene defines how close an object can be from the camera before it disappears.
        var nearEdgeOfScene = 1;

        //Creates a perspective transformation from the above parameters.
        var perspective = mat4.perspective(mat4.create(), fieldOfView, aspect, nearEdgeOfScene, farEdgeOfScene);
        //Apply perspective to the parent transformation (translate + rotation)
        var projection = mat4.multiply(mat4.create(), perspective, parentNode);
        
        gl.useProgram(program);
        
        var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    
        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, projection);

        // set the color
        var colorLocation = gl.getUniformLocation(program, "u_color");
        gl.uniform4f(colorLocation, color[0], color[1], color[2], 1.0);
        
        // Create a buffer for the positions
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        
        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
    
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
    }

}

module.exports = add;

},{"gl-mat4":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/index.js"}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/adjoint.js":[function(require,module,exports){
module.exports = adjoint;

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function adjoint(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/clone.js":[function(require,module,exports){
module.exports = clone;

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
function clone(a) {
    var out = new Float32Array(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/copy.js":[function(require,module,exports){
module.exports = copy;

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/create.js":[function(require,module,exports){
module.exports = create;

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
function create() {
    var out = new Float32Array(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/determinant.js":[function(require,module,exports){
module.exports = determinant;

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/fromQuat.js":[function(require,module,exports){
module.exports = fromQuat;

/**
 * Creates a matrix from a quaternion rotation.
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @returns {mat4} out
 */
function fromQuat(out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/fromRotationTranslation.js":[function(require,module,exports){
module.exports = fromRotationTranslation;

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
function fromRotationTranslation(out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/frustum.js":[function(require,module,exports){
module.exports = frustum;

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
function frustum(out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/identity.js":[function(require,module,exports){
module.exports = identity;

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/index.js":[function(require,module,exports){
module.exports = {
  create: require('./create')
  , clone: require('./clone')
  , copy: require('./copy')
  , identity: require('./identity')
  , transpose: require('./transpose')
  , invert: require('./invert')
  , adjoint: require('./adjoint')
  , determinant: require('./determinant')
  , multiply: require('./multiply')
  , translate: require('./translate')
  , scale: require('./scale')
  , rotate: require('./rotate')
  , rotateX: require('./rotateX')
  , rotateY: require('./rotateY')
  , rotateZ: require('./rotateZ')
  , fromRotationTranslation: require('./fromRotationTranslation')
  , fromQuat: require('./fromQuat')
  , frustum: require('./frustum')
  , perspective: require('./perspective')
  , perspectiveFromFieldOfView: require('./perspectiveFromFieldOfView')
  , ortho: require('./ortho')
  , lookAt: require('./lookAt')
  , str: require('./str')
}
},{"./adjoint":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/adjoint.js","./clone":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/clone.js","./copy":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/copy.js","./create":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/create.js","./determinant":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/determinant.js","./fromQuat":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/fromQuat.js","./fromRotationTranslation":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/fromRotationTranslation.js","./frustum":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/frustum.js","./identity":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/identity.js","./invert":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/invert.js","./lookAt":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/lookAt.js","./multiply":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/multiply.js","./ortho":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/ortho.js","./perspective":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/perspective.js","./perspectiveFromFieldOfView":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/perspectiveFromFieldOfView.js","./rotate":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotate.js","./rotateX":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotateX.js","./rotateY":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotateY.js","./rotateZ":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotateZ.js","./scale":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/scale.js","./str":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/str.js","./translate":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/translate.js","./transpose":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/transpose.js"}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/invert.js":[function(require,module,exports){
module.exports = invert;

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function invert(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/lookAt.js":[function(require,module,exports){
var identity = require('./identity');

module.exports = lookAt;

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < 0.000001 &&
        Math.abs(eyey - centery) < 0.000001 &&
        Math.abs(eyez - centerz) < 0.000001) {
        return identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};
},{"./identity":"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/identity.js"}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/multiply.js":[function(require,module,exports){
module.exports = multiply;

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply(out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/ortho.js":[function(require,module,exports){
module.exports = ortho;

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function ortho(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/perspective.js":[function(require,module,exports){
module.exports = perspective;

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/perspectiveFromFieldOfView.js":[function(require,module,exports){
module.exports = perspectiveFromFieldOfView;

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspectiveFromFieldOfView(out, fov, near, far) {
    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0),
        downTan = Math.tan(fov.downDegrees * Math.PI/180.0),
        leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0),
        rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = ((upTan - downTan) * yScale * 0.5);
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = (far * near) / (near - far);
    out[15] = 0.0;
    return out;
}


},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotate.js":[function(require,module,exports){
module.exports = rotate;

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function rotate(out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < 0.000001) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotateX.js":[function(require,module,exports){
module.exports = rotateX;

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateX(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotateY.js":[function(require,module,exports){
module.exports = rotateY;

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateY(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/rotateZ.js":[function(require,module,exports){
module.exports = rotateZ;

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateZ(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/scale.js":[function(require,module,exports){
module.exports = scale;

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/str.js":[function(require,module,exports){
module.exports = str;

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/translate.js":[function(require,module,exports){
module.exports = translate;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
function translate(out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};
},{}],"/Users/home/javascript/webgl-triangles/node_modules/gl-mat4/transpose.js":[function(require,module,exports){
module.exports = transpose;

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};
},{}]},{},["/Users/home/Blog/public/articles/use-browserify-and-minifyify-to-combine-minify-and-obfuscate-multiple-javascript-files/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmcmFnbWVudC5jIiwiaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy1wYWNrYWdlL3ByaXNtLmpzIiwidmVydGV4LmMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L2Fkam9pbnQuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9jbG9uZS5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L2NvcHkuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9jcmVhdGUuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9kZXRlcm1pbmFudC5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L2Zyb21RdWF0LmpzIiwiLi4vLi4vLi4vLi4vamF2YXNjcmlwdC93ZWJnbC10cmlhbmdsZXMvbm9kZV9tb2R1bGVzL2dsLW1hdDQvZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24uanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9mcnVzdHVtLmpzIiwiLi4vLi4vLi4vLi4vamF2YXNjcmlwdC93ZWJnbC10cmlhbmdsZXMvbm9kZV9tb2R1bGVzL2dsLW1hdDQvaWRlbnRpdHkuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9pbmRleC5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L2ludmVydC5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L2xvb2tBdC5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L211bHRpcGx5LmpzIiwiLi4vLi4vLi4vLi4vamF2YXNjcmlwdC93ZWJnbC10cmlhbmdsZXMvbm9kZV9tb2R1bGVzL2dsLW1hdDQvb3J0aG8uanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9wZXJzcGVjdGl2ZS5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L3BlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3LmpzIiwiLi4vLi4vLi4vLi4vamF2YXNjcmlwdC93ZWJnbC10cmlhbmdsZXMvbm9kZV9tb2R1bGVzL2dsLW1hdDQvcm90YXRlLmpzIiwiLi4vLi4vLi4vLi4vamF2YXNjcmlwdC93ZWJnbC10cmlhbmdsZXMvbm9kZV9tb2R1bGVzL2dsLW1hdDQvcm90YXRlWC5qcyIsIi4uLy4uLy4uLy4uL2phdmFzY3JpcHQvd2ViZ2wtdHJpYW5nbGVzL25vZGVfbW9kdWxlcy9nbC1tYXQ0L3JvdGF0ZVkuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9yb3RhdGVaLmpzIiwiLi4vLi4vLi4vLi4vamF2YXNjcmlwdC93ZWJnbC10cmlhbmdsZXMvbm9kZV9tb2R1bGVzL2dsLW1hdDQvc2NhbGUuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC9zdHIuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC90cmFuc2xhdGUuanMiLCIuLi8uLi8uLi8uLi9qYXZhc2NyaXB0L3dlYmdsLXRyaWFuZ2xlcy9ub2RlX21vZHVsZXMvZ2wtbWF0NC90cmFuc3Bvc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6c0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlKHBhcmFtcyl7XHJcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IFwicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7IFxcblwiICtcblwiIFxcblwiICtcblwidW5pZm9ybSB2ZWM0IHVfY29sb3I7IFxcblwiICtcblwiIFxcblwiICtcblwidm9pZCBtYWluKCkgeyBcXG5cIiArXG5cIiBcXG5cIiArXG5cIiAgLy8gY29udmVydCB0aGUgcmVjdGFuZ2xlIGZyb20gcGl4ZWxzIHRvIDAuMCB0byAxLjAgXFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHVfY29sb3I7IFxcblwiICtcblwiIFxcblwiICtcblwifSBcXG5cIiArXG5cIiBcXG5cIiBcclxuICAgICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9XHJcbiAgICAgIGZvcih2YXIga2V5IGluIHBhcmFtcykge1xyXG4gICAgICAgIHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChcInt7XCIra2V5K1wifX1cIixcImdcIilcclxuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UobWF0Y2hlciwgcGFyYW1zW2tleV0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRlbXBsYXRlXHJcbiAgICB9O1xuIiwidmFyIHByaXNtID0gcmVxdWlyZSgncHJpc21qcy1wYWNrYWdlJyk7XG52YXIgdHJpYW5nbGVzID0gcmVxdWlyZSgnd2ViZ2wtdHJpYW5nbGVzJyk7XG5cbnZhciBmcmFnID0gcmVxdWlyZSgnLi9mcmFnbWVudC5jJyk7XG52YXIgdmVydCA9IHJlcXVpcmUoJy4vdmVydGV4LmMnKTtcblxucHJpc20uaGlnaGxpZ2h0QWxsKCk7XG5cbnZhciBib2R5ICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF07XG50cmlhbmdsZXMoYm9keSwgdmVydCwgZnJhZyk7XG4iLCJ2YXIgcHJpc20gPSBmdW5jdGlvbiAoc2VsZiwgd2luZG93KSB7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY29yZS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG52YXIgX3NlbGYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpXG5cdD8gd2luZG93ICAgLy8gaWYgaW4gYnJvd3NlclxuXHQ6IChcblx0XHQodHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGUpXG5cdFx0PyBzZWxmIC8vIGlmIGluIHdvcmtlclxuXHRcdDoge30gICAvLyBpZiBpbiBub2RlIGpzXG5cdCk7XG5cbi8qKlxuICogUHJpc206IExpZ2h0d2VpZ2h0LCByb2J1c3QsIGVsZWdhbnQgc3ludGF4IGhpZ2hsaWdodGluZ1xuICogTUlUIGxpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHAvXG4gKiBAYXV0aG9yIExlYSBWZXJvdSBodHRwOi8vbGVhLnZlcm91Lm1lXG4gKi9cblxudmFyIFByaXNtID0gKGZ1bmN0aW9uKCl7XG5cbi8vIFByaXZhdGUgaGVscGVyIHZhcnNcbnZhciBsYW5nID0gL1xcYmxhbmcoPzp1YWdlKT8tKD8hXFwqKShcXHcrKVxcYi9pO1xuXG52YXIgXyA9IF9zZWxmLlByaXNtID0ge1xuXHR1dGlsOiB7XG5cdFx0ZW5jb2RlOiBmdW5jdGlvbiAodG9rZW5zKSB7XG5cdFx0XHRpZiAodG9rZW5zIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBUb2tlbih0b2tlbnMudHlwZSwgXy51dGlsLmVuY29kZSh0b2tlbnMuY29udGVudCksIHRva2Vucy5hbGlhcyk7XG5cdFx0XHR9IGVsc2UgaWYgKF8udXRpbC50eXBlKHRva2VucykgPT09ICdBcnJheScpIHtcblx0XHRcdFx0cmV0dXJuIHRva2Vucy5tYXAoXy51dGlsLmVuY29kZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdG9rZW5zLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHlwZTogZnVuY3Rpb24gKG8pIHtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdCAoXFx3KylcXF0vKVsxXTtcblx0XHR9LFxuXG5cdFx0Ly8gRGVlcCBjbG9uZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gKGUuZy4gdG8gZXh0ZW5kIGl0KVxuXHRcdGNsb25lOiBmdW5jdGlvbiAobykge1xuXHRcdFx0dmFyIHR5cGUgPSBfLnV0aWwudHlwZShvKTtcblxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ09iamVjdCc6XG5cdFx0XHRcdFx0dmFyIGNsb25lID0ge307XG5cblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbykge1xuXHRcdFx0XHRcdFx0aWYgKG8uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0XHRjbG9uZVtrZXldID0gXy51dGlsLmNsb25lKG9ba2V5XSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGNsb25lO1xuXG5cdFx0XHRcdGNhc2UgJ0FycmF5Jzpcblx0XHRcdFx0XHQvLyBDaGVjayBmb3IgZXhpc3RlbmNlIGZvciBJRThcblx0XHRcdFx0XHRyZXR1cm4gby5tYXAgJiYgby5tYXAoZnVuY3Rpb24odikgeyByZXR1cm4gXy51dGlsLmNsb25lKHYpOyB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG87XG5cdFx0fVxuXHR9LFxuXG5cdGxhbmd1YWdlczoge1xuXHRcdGV4dGVuZDogZnVuY3Rpb24gKGlkLCByZWRlZikge1xuXHRcdFx0dmFyIGxhbmcgPSBfLnV0aWwuY2xvbmUoXy5sYW5ndWFnZXNbaWRdKTtcblxuXHRcdFx0Zm9yICh2YXIga2V5IGluIHJlZGVmKSB7XG5cdFx0XHRcdGxhbmdba2V5XSA9IHJlZGVmW2tleV07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsYW5nO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbnNlcnQgYSB0b2tlbiBiZWZvcmUgYW5vdGhlciB0b2tlbiBpbiBhIGxhbmd1YWdlIGxpdGVyYWxcblx0XHQgKiBBcyB0aGlzIG5lZWRzIHRvIHJlY3JlYXRlIHRoZSBvYmplY3QgKHdlIGNhbm5vdCBhY3R1YWxseSBpbnNlcnQgYmVmb3JlIGtleXMgaW4gb2JqZWN0IGxpdGVyYWxzKSxcblx0XHQgKiB3ZSBjYW5ub3QganVzdCBwcm92aWRlIGFuIG9iamVjdCwgd2UgbmVlZCBhbm9iamVjdCBhbmQgYSBrZXkuXG5cdFx0ICogQHBhcmFtIGluc2lkZSBUaGUga2V5IChvciBsYW5ndWFnZSBpZCkgb2YgdGhlIHBhcmVudFxuXHRcdCAqIEBwYXJhbSBiZWZvcmUgVGhlIGtleSB0byBpbnNlcnQgYmVmb3JlLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBmdW5jdGlvbiBhcHBlbmRzIGluc3RlYWQuXG5cdFx0ICogQHBhcmFtIGluc2VydCBPYmplY3Qgd2l0aCB0aGUga2V5L3ZhbHVlIHBhaXJzIHRvIGluc2VydFxuXHRcdCAqIEBwYXJhbSByb290IFRoZSBvYmplY3QgdGhhdCBjb250YWlucyBgaW5zaWRlYC4gSWYgZXF1YWwgdG8gUHJpc20ubGFuZ3VhZ2VzLCBpdCBjYW4gYmUgb21pdHRlZC5cblx0XHQgKi9cblx0XHRpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChpbnNpZGUsIGJlZm9yZSwgaW5zZXJ0LCByb290KSB7XG5cdFx0XHRyb290ID0gcm9vdCB8fCBfLmxhbmd1YWdlcztcblx0XHRcdHZhciBncmFtbWFyID0gcm9vdFtpbnNpZGVdO1xuXHRcdFx0XG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG5cdFx0XHRcdGluc2VydCA9IGFyZ3VtZW50c1sxXTtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAodmFyIG5ld1Rva2VuIGluIGluc2VydCkge1xuXHRcdFx0XHRcdGlmIChpbnNlcnQuaGFzT3duUHJvcGVydHkobmV3VG9rZW4pKSB7XG5cdFx0XHRcdFx0XHRncmFtbWFyW25ld1Rva2VuXSA9IGluc2VydFtuZXdUb2tlbl07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gZ3JhbW1hcjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dmFyIHJldCA9IHt9O1xuXG5cdFx0XHRmb3IgKHZhciB0b2tlbiBpbiBncmFtbWFyKSB7XG5cblx0XHRcdFx0aWYgKGdyYW1tYXIuaGFzT3duUHJvcGVydHkodG9rZW4pKSB7XG5cblx0XHRcdFx0XHRpZiAodG9rZW4gPT0gYmVmb3JlKSB7XG5cblx0XHRcdFx0XHRcdGZvciAodmFyIG5ld1Rva2VuIGluIGluc2VydCkge1xuXG5cdFx0XHRcdFx0XHRcdGlmIChpbnNlcnQuaGFzT3duUHJvcGVydHkobmV3VG9rZW4pKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0W25ld1Rva2VuXSA9IGluc2VydFtuZXdUb2tlbl07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXRbdG9rZW5dID0gZ3JhbW1hclt0b2tlbl07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gVXBkYXRlIHJlZmVyZW5jZXMgaW4gb3RoZXIgbGFuZ3VhZ2UgZGVmaW5pdGlvbnNcblx0XHRcdF8ubGFuZ3VhZ2VzLkRGUyhfLmxhbmd1YWdlcywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHJvb3RbaW5zaWRlXSAmJiBrZXkgIT0gaW5zaWRlKSB7XG5cdFx0XHRcdFx0dGhpc1trZXldID0gcmV0O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHJvb3RbaW5zaWRlXSA9IHJldDtcblx0XHR9LFxuXG5cdFx0Ly8gVHJhdmVyc2UgYSBsYW5ndWFnZSBkZWZpbml0aW9uIHdpdGggRGVwdGggRmlyc3QgU2VhcmNoXG5cdFx0REZTOiBmdW5jdGlvbihvLCBjYWxsYmFjaywgdHlwZSkge1xuXHRcdFx0Zm9yICh2YXIgaSBpbiBvKSB7XG5cdFx0XHRcdGlmIChvLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChvLCBpLCBvW2ldLCB0eXBlIHx8IGkpO1xuXG5cdFx0XHRcdFx0aWYgKF8udXRpbC50eXBlKG9baV0pID09PSAnT2JqZWN0Jykge1xuXHRcdFx0XHRcdFx0Xy5sYW5ndWFnZXMuREZTKG9baV0sIGNhbGxiYWNrKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoXy51dGlsLnR5cGUob1tpXSkgPT09ICdBcnJheScpIHtcblx0XHRcdFx0XHRcdF8ubGFuZ3VhZ2VzLkRGUyhvW2ldLCBjYWxsYmFjaywgaSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRwbHVnaW5zOiB7fSxcblx0XG5cdGhpZ2hsaWdodEFsbDogZnVuY3Rpb24oYXN5bmMsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnY29kZVtjbGFzcyo9XCJsYW5ndWFnZS1cIl0sIFtjbGFzcyo9XCJsYW5ndWFnZS1cIl0gY29kZSwgY29kZVtjbGFzcyo9XCJsYW5nLVwiXSwgW2NsYXNzKj1cImxhbmctXCJdIGNvZGUnKTtcblxuXHRcdGZvciAodmFyIGk9MCwgZWxlbWVudDsgZWxlbWVudCA9IGVsZW1lbnRzW2krK107KSB7XG5cdFx0XHRfLmhpZ2hsaWdodEVsZW1lbnQoZWxlbWVudCwgYXN5bmMgPT09IHRydWUsIGNhbGxiYWNrKTtcblx0XHR9XG5cdH0sXG5cblx0aGlnaGxpZ2h0RWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCwgYXN5bmMsIGNhbGxiYWNrKSB7XG5cdFx0Ly8gRmluZCBsYW5ndWFnZVxuXHRcdHZhciBsYW5ndWFnZSwgZ3JhbW1hciwgcGFyZW50ID0gZWxlbWVudDtcblxuXHRcdHdoaWxlIChwYXJlbnQgJiYgIWxhbmcudGVzdChwYXJlbnQuY2xhc3NOYW1lKSkge1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0bGFuZ3VhZ2UgPSAocGFyZW50LmNsYXNzTmFtZS5tYXRjaChsYW5nKSB8fCBbLCcnXSlbMV07XG5cdFx0XHRncmFtbWFyID0gXy5sYW5ndWFnZXNbbGFuZ3VhZ2VdO1xuXHRcdH1cblxuXHRcdC8vIFNldCBsYW5ndWFnZSBvbiB0aGUgZWxlbWVudCwgaWYgbm90IHByZXNlbnRcblx0XHRlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UobGFuZywgJycpLnJlcGxhY2UoL1xccysvZywgJyAnKSArICcgbGFuZ3VhZ2UtJyArIGxhbmd1YWdlO1xuXG5cdFx0Ly8gU2V0IGxhbmd1YWdlIG9uIHRoZSBwYXJlbnQsIGZvciBzdHlsaW5nXG5cdFx0cGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXG5cdFx0aWYgKC9wcmUvaS50ZXN0KHBhcmVudC5ub2RlTmFtZSkpIHtcblx0XHRcdHBhcmVudC5jbGFzc05hbWUgPSBwYXJlbnQuY2xhc3NOYW1lLnJlcGxhY2UobGFuZywgJycpLnJlcGxhY2UoL1xccysvZywgJyAnKSArICcgbGFuZ3VhZ2UtJyArIGxhbmd1YWdlO1xuXHRcdH1cblxuXHRcdHZhciBjb2RlID0gZWxlbWVudC50ZXh0Q29udGVudDtcblxuXHRcdHZhciBlbnYgPSB7XG5cdFx0XHRlbGVtZW50OiBlbGVtZW50LFxuXHRcdFx0bGFuZ3VhZ2U6IGxhbmd1YWdlLFxuXHRcdFx0Z3JhbW1hcjogZ3JhbW1hcixcblx0XHRcdGNvZGU6IGNvZGVcblx0XHR9O1xuXG5cdFx0aWYgKCFjb2RlIHx8ICFncmFtbWFyKSB7XG5cdFx0XHRfLmhvb2tzLnJ1bignY29tcGxldGUnLCBlbnYpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdF8uaG9va3MucnVuKCdiZWZvcmUtaGlnaGxpZ2h0JywgZW52KTtcblxuXHRcdGlmIChhc3luYyAmJiBfc2VsZi5Xb3JrZXIpIHtcblx0XHRcdHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKF8uZmlsZW5hbWUpO1xuXG5cdFx0XHR3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBUb2tlbi5zdHJpbmdpZnkoSlNPTi5wYXJzZShldnQuZGF0YSksIGxhbmd1YWdlKTtcblxuXHRcdFx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLWluc2VydCcsIGVudik7XG5cblx0XHRcdFx0ZW52LmVsZW1lbnQuaW5uZXJIVE1MID0gZW52LmhpZ2hsaWdodGVkQ29kZTtcblxuXHRcdFx0XHRjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKGVudi5lbGVtZW50KTtcblx0XHRcdFx0Xy5ob29rcy5ydW4oJ2FmdGVyLWhpZ2hsaWdodCcsIGVudik7XG5cdFx0XHRcdF8uaG9va3MucnVuKCdjb21wbGV0ZScsIGVudik7XG5cdFx0XHR9O1xuXG5cdFx0XHR3b3JrZXIucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRsYW5ndWFnZTogZW52Lmxhbmd1YWdlLFxuXHRcdFx0XHRjb2RlOiBlbnYuY29kZSxcblx0XHRcdFx0aW1tZWRpYXRlQ2xvc2U6IHRydWVcblx0XHRcdH0pKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRlbnYuaGlnaGxpZ2h0ZWRDb2RlID0gXy5oaWdobGlnaHQoZW52LmNvZGUsIGVudi5ncmFtbWFyLCBlbnYubGFuZ3VhZ2UpO1xuXG5cdFx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLWluc2VydCcsIGVudik7XG5cblx0XHRcdGVudi5lbGVtZW50LmlubmVySFRNTCA9IGVudi5oaWdobGlnaHRlZENvZGU7XG5cblx0XHRcdGNhbGxiYWNrICYmIGNhbGxiYWNrLmNhbGwoZWxlbWVudCk7XG5cblx0XHRcdF8uaG9va3MucnVuKCdhZnRlci1oaWdobGlnaHQnLCBlbnYpO1xuXHRcdFx0Xy5ob29rcy5ydW4oJ2NvbXBsZXRlJywgZW52KTtcblx0XHR9XG5cdH0sXG5cblx0aGlnaGxpZ2h0OiBmdW5jdGlvbiAodGV4dCwgZ3JhbW1hciwgbGFuZ3VhZ2UpIHtcblx0XHR2YXIgdG9rZW5zID0gXy50b2tlbml6ZSh0ZXh0LCBncmFtbWFyKTtcblx0XHRyZXR1cm4gVG9rZW4uc3RyaW5naWZ5KF8udXRpbC5lbmNvZGUodG9rZW5zKSwgbGFuZ3VhZ2UpO1xuXHR9LFxuXG5cdHRva2VuaXplOiBmdW5jdGlvbih0ZXh0LCBncmFtbWFyLCBsYW5ndWFnZSkge1xuXHRcdHZhciBUb2tlbiA9IF8uVG9rZW47XG5cblx0XHR2YXIgc3RyYXJyID0gW3RleHRdO1xuXG5cdFx0dmFyIHJlc3QgPSBncmFtbWFyLnJlc3Q7XG5cblx0XHRpZiAocmVzdCkge1xuXHRcdFx0Zm9yICh2YXIgdG9rZW4gaW4gcmVzdCkge1xuXHRcdFx0XHRncmFtbWFyW3Rva2VuXSA9IHJlc3RbdG9rZW5dO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWxldGUgZ3JhbW1hci5yZXN0O1xuXHRcdH1cblxuXHRcdHRva2VubG9vcDogZm9yICh2YXIgdG9rZW4gaW4gZ3JhbW1hcikge1xuXHRcdFx0aWYoIWdyYW1tYXIuaGFzT3duUHJvcGVydHkodG9rZW4pIHx8ICFncmFtbWFyW3Rva2VuXSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHBhdHRlcm5zID0gZ3JhbW1hclt0b2tlbl07XG5cdFx0XHRwYXR0ZXJucyA9IChfLnV0aWwudHlwZShwYXR0ZXJucykgPT09IFwiQXJyYXlcIikgPyBwYXR0ZXJucyA6IFtwYXR0ZXJuc107XG5cblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgcGF0dGVybnMubGVuZ3RoOyArK2opIHtcblx0XHRcdFx0dmFyIHBhdHRlcm4gPSBwYXR0ZXJuc1tqXSxcblx0XHRcdFx0XHRpbnNpZGUgPSBwYXR0ZXJuLmluc2lkZSxcblx0XHRcdFx0XHRsb29rYmVoaW5kID0gISFwYXR0ZXJuLmxvb2tiZWhpbmQsXG5cdFx0XHRcdFx0bG9va2JlaGluZExlbmd0aCA9IDAsXG5cdFx0XHRcdFx0YWxpYXMgPSBwYXR0ZXJuLmFsaWFzO1xuXG5cdFx0XHRcdHBhdHRlcm4gPSBwYXR0ZXJuLnBhdHRlcm4gfHwgcGF0dGVybjtcblxuXHRcdFx0XHRmb3IgKHZhciBpPTA7IGk8c3RyYXJyLmxlbmd0aDsgaSsrKSB7IC8vIERvbuKAmXQgY2FjaGUgbGVuZ3RoIGFzIGl0IGNoYW5nZXMgZHVyaW5nIHRoZSBsb29wXG5cblx0XHRcdFx0XHR2YXIgc3RyID0gc3RyYXJyW2ldO1xuXG5cdFx0XHRcdFx0aWYgKHN0cmFyci5sZW5ndGggPiB0ZXh0Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Ly8gU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsIEFCT1JULCBBQk9SVCFcblx0XHRcdFx0XHRcdGJyZWFrIHRva2VubG9vcDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoc3RyIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHBhdHRlcm4ubGFzdEluZGV4ID0gMDtcblxuXHRcdFx0XHRcdHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyhzdHIpO1xuXG5cdFx0XHRcdFx0aWYgKG1hdGNoKSB7XG5cdFx0XHRcdFx0XHRpZihsb29rYmVoaW5kKSB7XG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmRMZW5ndGggPSBtYXRjaFsxXS5sZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHZhciBmcm9tID0gbWF0Y2guaW5kZXggLSAxICsgbG9va2JlaGluZExlbmd0aCxcblx0XHRcdFx0XHRcdFx0bWF0Y2ggPSBtYXRjaFswXS5zbGljZShsb29rYmVoaW5kTGVuZ3RoKSxcblx0XHRcdFx0XHRcdFx0bGVuID0gbWF0Y2gubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHR0byA9IGZyb20gKyBsZW4sXG5cdFx0XHRcdFx0XHRcdGJlZm9yZSA9IHN0ci5zbGljZSgwLCBmcm9tICsgMSksXG5cdFx0XHRcdFx0XHRcdGFmdGVyID0gc3RyLnNsaWNlKHRvICsgMSk7XG5cblx0XHRcdFx0XHRcdHZhciBhcmdzID0gW2ksIDFdO1xuXG5cdFx0XHRcdFx0XHRpZiAoYmVmb3JlKSB7XG5cdFx0XHRcdFx0XHRcdGFyZ3MucHVzaChiZWZvcmUpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgd3JhcHBlZCA9IG5ldyBUb2tlbih0b2tlbiwgaW5zaWRlPyBfLnRva2VuaXplKG1hdGNoLCBpbnNpZGUpIDogbWF0Y2gsIGFsaWFzKTtcblxuXHRcdFx0XHRcdFx0YXJncy5wdXNoKHdyYXBwZWQpO1xuXG5cdFx0XHRcdFx0XHRpZiAoYWZ0ZXIpIHtcblx0XHRcdFx0XHRcdFx0YXJncy5wdXNoKGFmdGVyKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0QXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShzdHJhcnIsIGFyZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzdHJhcnI7XG5cdH0sXG5cblx0aG9va3M6IHtcblx0XHRhbGw6IHt9LFxuXG5cdFx0YWRkOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBob29rcyA9IF8uaG9va3MuYWxsO1xuXG5cdFx0XHRob29rc1tuYW1lXSA9IGhvb2tzW25hbWVdIHx8IFtdO1xuXG5cdFx0XHRob29rc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcblx0XHR9LFxuXG5cdFx0cnVuOiBmdW5jdGlvbiAobmFtZSwgZW52KSB7XG5cdFx0XHR2YXIgY2FsbGJhY2tzID0gXy5ob29rcy5hbGxbbmFtZV07XG5cblx0XHRcdGlmICghY2FsbGJhY2tzIHx8ICFjYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaT0wLCBjYWxsYmFjazsgY2FsbGJhY2sgPSBjYWxsYmFja3NbaSsrXTspIHtcblx0XHRcdFx0Y2FsbGJhY2soZW52KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbnZhciBUb2tlbiA9IF8uVG9rZW4gPSBmdW5jdGlvbih0eXBlLCBjb250ZW50LCBhbGlhcykge1xuXHR0aGlzLnR5cGUgPSB0eXBlO1xuXHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuXHR0aGlzLmFsaWFzID0gYWxpYXM7XG59O1xuXG5Ub2tlbi5zdHJpbmdpZnkgPSBmdW5jdGlvbihvLCBsYW5ndWFnZSwgcGFyZW50KSB7XG5cdGlmICh0eXBlb2YgbyA9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0aWYgKF8udXRpbC50eXBlKG8pID09PSAnQXJyYXknKSB7XG5cdFx0cmV0dXJuIG8ubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBUb2tlbi5zdHJpbmdpZnkoZWxlbWVudCwgbGFuZ3VhZ2UsIG8pO1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0dmFyIGVudiA9IHtcblx0XHR0eXBlOiBvLnR5cGUsXG5cdFx0Y29udGVudDogVG9rZW4uc3RyaW5naWZ5KG8uY29udGVudCwgbGFuZ3VhZ2UsIHBhcmVudCksXG5cdFx0dGFnOiAnc3BhbicsXG5cdFx0Y2xhc3NlczogWyd0b2tlbicsIG8udHlwZV0sXG5cdFx0YXR0cmlidXRlczoge30sXG5cdFx0bGFuZ3VhZ2U6IGxhbmd1YWdlLFxuXHRcdHBhcmVudDogcGFyZW50XG5cdH07XG5cblx0aWYgKGVudi50eXBlID09ICdjb21tZW50Jykge1xuXHRcdGVudi5hdHRyaWJ1dGVzWydzcGVsbGNoZWNrJ10gPSAndHJ1ZSc7XG5cdH1cblxuXHRpZiAoby5hbGlhcykge1xuXHRcdHZhciBhbGlhc2VzID0gXy51dGlsLnR5cGUoby5hbGlhcykgPT09ICdBcnJheScgPyBvLmFsaWFzIDogW28uYWxpYXNdO1xuXHRcdEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVudi5jbGFzc2VzLCBhbGlhc2VzKTtcblx0fVxuXG5cdF8uaG9va3MucnVuKCd3cmFwJywgZW52KTtcblxuXHR2YXIgYXR0cmlidXRlcyA9ICcnO1xuXG5cdGZvciAodmFyIG5hbWUgaW4gZW52LmF0dHJpYnV0ZXMpIHtcblx0XHRhdHRyaWJ1dGVzICs9IChhdHRyaWJ1dGVzID8gJyAnIDogJycpICsgbmFtZSArICc9XCInICsgKGVudi5hdHRyaWJ1dGVzW25hbWVdIHx8ICcnKSArICdcIic7XG5cdH1cblxuXHRyZXR1cm4gJzwnICsgZW52LnRhZyArICcgY2xhc3M9XCInICsgZW52LmNsYXNzZXMuam9pbignICcpICsgJ1wiICcgKyBhdHRyaWJ1dGVzICsgJz4nICsgZW52LmNvbnRlbnQgKyAnPC8nICsgZW52LnRhZyArICc+JztcblxufTtcblxuaWYgKCFfc2VsZi5kb2N1bWVudCkge1xuXHRpZiAoIV9zZWxmLmFkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHQvLyBpbiBOb2RlLmpzXG5cdFx0cmV0dXJuIF9zZWxmLlByaXNtO1xuXHR9XG4gXHQvLyBJbiB3b3JrZXJcblx0X3NlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldnQuZGF0YSksXG5cdFx0ICAgIGxhbmcgPSBtZXNzYWdlLmxhbmd1YWdlLFxuXHRcdCAgICBjb2RlID0gbWVzc2FnZS5jb2RlLFxuXHRcdFx0aW1tZWRpYXRlQ2xvc2UgPSBtZXNzYWdlLmltbWVkaWF0ZUNsb3NlO1xuXG5cdFx0X3NlbGYucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoXy51dGlsLmVuY29kZShfLnRva2VuaXplKGNvZGUsIF8ubGFuZ3VhZ2VzW2xhbmddKSkpKTtcblx0XHRpZiAoaW1tZWRpYXRlQ2xvc2UpIHtcblx0XHRcdF9zZWxmLmNsb3NlKCk7XG5cdFx0fVxuXHR9LCBmYWxzZSk7XG5cblx0cmV0dXJuIF9zZWxmLlByaXNtO1xufVxuXG4vLyBHZXQgY3VycmVudCBzY3JpcHQgYW5kIGhpZ2hsaWdodFxudmFyIHNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcblxuc2NyaXB0ID0gc2NyaXB0W3NjcmlwdC5sZW5ndGggLSAxXTtcblxuaWYgKHNjcmlwdCkge1xuXHRfLmZpbGVuYW1lID0gc2NyaXB0LnNyYztcblxuXHRpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAmJiAhc2NyaXB0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1tYW51YWwnKSkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBfLmhpZ2hsaWdodEFsbCk7XG5cdH1cbn1cblxucmV0dXJuIF9zZWxmLlByaXNtO1xuXG59KSgpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBQcmlzbTtcbn1cblxuLy8gaGFjayBmb3IgY29tcG9uZW50cyB0byB3b3JrIGNvcnJlY3RseSBpbiBub2RlLmpzXG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0Z2xvYmFsLlByaXNtID0gUHJpc207XG59XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS15YW1sLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy55YW1sID0ge1xuXHQnc2NhbGFyJzoge1xuXHRcdHBhdHRlcm46IC8oW1xcLTpdXFxzKighW15cXHNdKyk/WyBcXHRdKlt8Pl0pWyBcXHRdKig/OigoPzpcXHI/XFxufFxccilbIFxcdF0rKVteXFxyXFxuXSsoPzpcXDNbXlxcclxcbl0rKSopLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnc3RyaW5nJ1xuXHR9LFxuXHQnY29tbWVudCc6IC8jLiovLFxuXHQna2V5Jzoge1xuXHRcdHBhdHRlcm46IC8oXFxzKls6XFwtLFt7XFxyXFxuP11bIFxcdF0qKCFbXlxcc10rKT9bIFxcdF0qKVteXFxyXFxue1tcXF19LCNdKz8oPz1cXHMqOlxccykvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICdhdHJ1bGUnXG5cdH0sXG5cdCdkaXJlY3RpdmUnOiB7XG5cdFx0cGF0dGVybjogLyheWyBcXHRdKiklLisvbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnaW1wb3J0YW50J1xuXHR9LFxuXHQnZGF0ZXRpbWUnOiB7XG5cdFx0cGF0dGVybjogLyhbOlxcLSxbe11cXHMqKCFbXlxcc10rKT9bIFxcdF0qKShcXGR7NH0tXFxkXFxkPy1cXGRcXGQ/KFt0VF18WyBcXHRdKylcXGRcXGQ/OlxcZHsyfTpcXGR7Mn0oXFwuXFxkKik/WyBcXHRdKihafFstK11cXGRcXGQ/KDpcXGR7Mn0pPyk/fFxcZHs0fS1cXGR7Mn0tXFxkezJ9fFxcZFxcZD86XFxkezJ9KDpcXGR7Mn0oXFwuXFxkKik/KT8pKD89WyBcXHRdKigkfCx8XXx9KSkvbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnbnVtYmVyJ1xuXHR9LFxuXHQnYm9vbGVhbic6IHtcblx0XHRwYXR0ZXJuOiAvKFs6XFwtLFt7XVxccyooIVteXFxzXSspP1sgXFx0XSopKHRydWV8ZmFsc2UpWyBcXHRdKig/PSR8LHxdfH0pL2ltLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICdpbXBvcnRhbnQnXG5cdH0sXG5cdCdudWxsJzoge1xuXHRcdHBhdHRlcm46IC8oWzpcXC0sW3tdXFxzKighW15cXHNdKyk/WyBcXHRdKikobnVsbHx+KVsgXFx0XSooPz0kfCx8XXx9KS9pbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnaW1wb3J0YW50J1xuXHR9LFxuXHQnc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC8oWzpcXC0sW3tdXFxzKighW15cXHNdKyk/WyBcXHRdKikoXCIoPzpbXlwiXFxcXF18XFxcXC4pKlwifCcoPzpbXidcXFxcXXxcXFxcLikqJykoPz1bIFxcdF0qKCR8LHxdfH0pKS9tLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J251bWJlcic6IHtcblx0XHRwYXR0ZXJuOiAvKFs6XFwtLFt7XVxccyooIVteXFxzXSspP1sgXFx0XSopWytcXC1dPygweFtcXGRhLWZdK3wwb1swLTddK3woXFxkK1xcLj9cXGQqfFxcLj9cXGQrKShlW1xcK1xcLV0/XFxkKyk/fFxcLmluZnxcXC5uYW4pWyBcXHRdKig/PSR8LHxdfH0pL2ltLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J3RhZyc6IC8hW15cXHNdKy8sXG5cdCdpbXBvcnRhbnQnOiAvWyYqXVtcXHddKy8sXG5cdCdwdW5jdHVhdGlvbic6IC8tLS18WzpbXFxde31cXC0sfD4/XXxcXC5cXC5cXC4vXG59O1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tbWFya3VwLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5tYXJrdXAgPSB7XG5cdCdjb21tZW50JzogLzwhLS1bXFx3XFxXXSo/LS0+Lyxcblx0J3Byb2xvZyc6IC88XFw/W1xcd1xcV10rP1xcPz4vLFxuXHQnZG9jdHlwZSc6IC88IURPQ1RZUEVbXFx3XFxXXSs/Pi8sXG5cdCdjZGF0YSc6IC88IVxcW0NEQVRBXFxbW1xcd1xcV10qP11dPi9pLFxuXHQndGFnJzoge1xuXHRcdHBhdHRlcm46IC88XFwvP1teXFxzPlxcLz0uXSsoPzpcXHMrW15cXHM+XFwvPV0rKD86PSg/OihcInwnKSg/OlxcXFxcXDF8XFxcXD8oPyFcXDEpW1xcd1xcV10pKlxcMXxbXlxccydcIj49XSspKT8pKlxccypcXC8/Pi9pLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3RhZyc6IHtcblx0XHRcdFx0cGF0dGVybjogL148XFwvP1teXFxzPlxcL10rL2ksXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9ePFxcLz8vLFxuXHRcdFx0XHRcdCduYW1lc3BhY2UnOiAvXlteXFxzPlxcLzpdKzovXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnYXR0ci12YWx1ZSc6IHtcblx0XHRcdFx0cGF0dGVybjogLz0oPzooJ3xcIilbXFx3XFxXXSo/KFxcMSl8W15cXHM+XSspL2ksXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bPT5cIiddL1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL1xcLz8+Lyxcblx0XHRcdCdhdHRyLW5hbWUnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9bXlxccz5cXC9dKy8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCduYW1lc3BhY2UnOiAvXlteXFxzPlxcLzpdKzovXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblx0fSxcblx0J2VudGl0eSc6IC8mIz9bXFxkYS16XXsxLDh9Oy9pXG59O1xuXG4vLyBQbHVnaW4gdG8gbWFrZSBlbnRpdHkgdGl0bGUgc2hvdyB0aGUgcmVhbCBlbnRpdHksIGlkZWEgYnkgUm9tYW4gS29tYXJvdlxuUHJpc20uaG9va3MuYWRkKCd3cmFwJywgZnVuY3Rpb24oZW52KSB7XG5cblx0aWYgKGVudi50eXBlID09PSAnZW50aXR5Jykge1xuXHRcdGVudi5hdHRyaWJ1dGVzWyd0aXRsZSddID0gZW52LmNvbnRlbnQucmVwbGFjZSgvJmFtcDsvLCAnJicpO1xuXHR9XG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLnhtbCA9IFByaXNtLmxhbmd1YWdlcy5tYXJrdXA7XG5QcmlzbS5sYW5ndWFnZXMuaHRtbCA9IFByaXNtLmxhbmd1YWdlcy5tYXJrdXA7XG5QcmlzbS5sYW5ndWFnZXMubWF0aG1sID0gUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cDtcblByaXNtLmxhbmd1YWdlcy5zdmcgPSBQcmlzbS5sYW5ndWFnZXMubWFya3VwO1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20td2lraS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMud2lraSA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ21hcmt1cCcsIHtcblx0J2Jsb2NrLWNvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pXFwvXFwqW1xcd1xcV10qP1xcKlxcLy8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ2NvbW1lbnQnXG5cdH0sXG5cdCdoZWFkaW5nJzoge1xuXHRcdHBhdHRlcm46IC9eKD0rKS4rP1xcMS9tLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3B1bmN0dWF0aW9uJzogL149K3w9KyQvLFxuXHRcdFx0J2ltcG9ydGFudCc6IC8uKy9cblx0XHR9XG5cdH0sXG5cdCdlbXBoYXNpcyc6IHtcblx0XHQvLyBUT0RPIE11bHRpLWxpbmVcblx0XHRwYXR0ZXJuOiAvKCd7Miw1fSkuKz9cXDEvLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2JvbGQgaXRhbGljJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvKCcnJycnKS4rPyg/PVxcMSkvLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0J2JvbGQnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC8oJycnKVteJ10oPzouKj9bXiddKT8oPz1cXDEpLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdCdpdGFsaWMnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC8oJycpW14nXSg/Oi4qP1teJ10pPyg/PVxcMSkvLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL14nJyt8JycrJC9cblx0XHR9XG5cdH0sXG5cdCdocic6IHtcblx0XHRwYXR0ZXJuOiAvXi17NCx9L20sXG5cdFx0YWxpYXM6ICdwdW5jdHVhdGlvbidcblx0fSxcblx0J3VybCc6IFtcblx0XHQvSVNCTiArKD86OTdbODldWyAtXT8pPyg/OlxcZFsgLV0/KXs5fVtcXGR4XVxcYnwoPzpSRkN8UE1JRCkgK1xcZCsvaSxcblx0XHQvXFxbXFxbLis/XFxdXFxdfFxcWy4rP1xcXS9cblx0XSxcblx0J3ZhcmlhYmxlJzogW1xuXHRcdC9fX1tBLVpdK19fLyxcblx0XHQvLyBGSVhNRSBOZXN0ZWQgc3RydWN0dXJlcyBzaG91bGQgYmUgaGFuZGxlZFxuXHRcdC8vIHt7Zm9ybWF0bnVtOnt7I2V4cHI6e3t7M319fX19fX1cblx0XHQvXFx7ezN9Lis/XFx9ezN9Lyxcblx0XHQvXFx7XFx7Lis/fX0vXG5cdF0sXG5cdCdzeW1ib2wnOiBbXG5cdFx0L14jcmVkaXJlY3QvaW0sXG5cdFx0L357Myw1fS9cblx0XSxcblx0Ly8gSGFuZGxlIHRhYmxlIGF0dHJzOlxuXHQvLyB7fFxuXHQvLyAhIHN0eWxlPVwidGV4dC1hbGlnbjpsZWZ0O1wifCBJdGVtXG5cdC8vIHx9XG5cdCd0YWJsZS10YWcnOiB7XG5cdFx0cGF0dGVybjogLygoPzpefFt8IV0pW3whXSlbXnxcXHJcXG5dK1xcfCg/IVxcfCkvbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3RhYmxlLWJhcic6IHtcblx0XHRcdFx0cGF0dGVybjogL1xcfCQvLFxuXHRcdFx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHRcdFx0fSxcblx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXBbJ3RhZyddLmluc2lkZVxuXHRcdH1cblx0fSxcblx0J3B1bmN0dWF0aW9uJzogL14oPzpcXHtcXHx8XFx8XFx9fFxcfC18WyojOjshfF0pfFxcfFxcfHwhIS9tXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnd2lraScsICd0YWcnLCB7XG5cdC8vIFByZXZlbnQgaGlnaGxpZ2h0aW5nIGluc2lkZSA8bm93aWtpPiwgPHNvdXJjZT4gYW5kIDxwcmU+IHRhZ3Ncblx0J25vd2lraSc6IHtcblx0XHRwYXR0ZXJuOiAvPChub3dpa2l8cHJlfHNvdXJjZSlcXGJbXFx3XFxXXSo/PltcXHdcXFddKj88XFwvXFwxPi9pLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3RhZyc6IHtcblx0XHRcdFx0cGF0dGVybjogLzwoPzpub3dpa2l8cHJlfHNvdXJjZSlcXGJbXFx3XFxXXSo/Pnw8XFwvKD86bm93aWtpfHByZXxzb3VyY2UpPi9pLFxuXHRcdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXBbJ3RhZyddLmluc2lkZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufSk7XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS12aGRsLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy52aGRsID0ge1xuXHQnY29tbWVudCc6IC8tLS4rLyxcblx0Ly8gc3VwcG9ydCBmb3IgYWxsIGxvZ2ljIHZlY3RvcnNcblx0J3ZoZGwtdmVjdG9ycyc6IHtcblx0XHQncGF0dGVybic6IC9cXGJbb3hiXVwiW1xcZGEtZl9dK1wifFwiWzAxdXh6d2xoLV0rXCIvaSxcblx0XHQnYWxpYXMnOiAnbnVtYmVyJ1xuXHR9LFxuXHQvLyBzdXBwb3J0IGZvciBvcGVyYXRvciBvdmVybG9hZGluZyBpbmNsdWRlZFxuXHQncXVvdGVkLWZ1bmN0aW9uJzoge1xuXHRcdHBhdHRlcm46IC9cIlxcUys/XCIoPz1cXCgpLyxcblx0XHRhbGlhczogJ2Z1bmN0aW9uJ1xuXHR9LFxuXHQnc3RyaW5nJzogL1wiKD86W15cXFxcXFxyXFxuXXxcXFxcPyg/OlxcclxcbnxbXFxzXFxTXSkpKj9cIi8sXG5cdCdjb25zdGFudCc6IC9cXGIoPzp1c2V8bGlicmFyeSlcXGIvaSxcblx0Ly8gc3VwcG9ydCBmb3IgcHJlZGVmaW5lZCBhdHRyaWJ1dGVzIGluY2x1ZGVkXG5cdCdrZXl3b3JkJzogL1xcYig/OidhY3RpdmV8J2FzY2VuZGluZ3wnYmFzZXwnZGVsYXllZHwnZHJpdmluZ3wnZHJpdmluZ192YWx1ZXwnZXZlbnR8J2hpZ2h8J2ltYWdlfCdpbnN0YW5jZV9uYW1lfCdsYXN0X2FjdGl2ZXwnbGFzdF9ldmVudHwnbGFzdF92YWx1ZXwnbGVmdHwnbGVmdG9mfCdsZW5ndGh8J2xvd3wncGF0aF9uYW1lfCdwb3N8J3ByZWR8J3F1aWV0fCdyYW5nZXwncmV2ZXJzZV9yYW5nZXwncmlnaHR8J3JpZ2h0b2Z8J3NpbXBsZV9uYW1lfCdzdGFibGV8J3N1Y2N8J3RyYW5zYWN0aW9ufCd2YWx8J3ZhbHVlfGFjY2Vzc3xhZnRlcnxhbGlhc3xhbGx8YXJjaGl0ZWN0dXJlfGFycmF5fGFzc2VydHxhdHRyaWJ1dGV8YmVnaW58YmxvY2t8Ym9keXxidWZmZXJ8YnVzfGNhc2V8Y29tcG9uZW50fGNvbmZpZ3VyYXRpb258Y29uc3RhbnR8ZGlzY29ubmVjdHxkb3dudG98ZWxzZXxlbHNpZnxlbmR8ZW50aXR5fGV4aXR8ZmlsZXxmb3J8ZnVuY3Rpb258Z2VuZXJhdGV8Z2VuZXJpY3xncm91cHxndWFyZGVkfGlmfGltcHVyZXxpbnxpbmVydGlhbHxpbm91dHxpc3xsYWJlbHxsaWJyYXJ5fGxpbmthZ2V8bGl0ZXJhbHxsb29wfG1hcHxuZXd8bmV4dHxudWxsfG9mfG9ufG9wZW58b3RoZXJzfG91dHxwYWNrYWdlfHBvcnR8cG9zdHBvbmVkfHByb2NlZHVyZXxwcm9jZXNzfHB1cmV8cmFuZ2V8cmVjb3JkfHJlZ2lzdGVyfHJlamVjdHxyZXBvcnR8cmV0dXJufHNlbGVjdHxzZXZlcml0eXxzaGFyZWR8c2lnbmFsfHN1YnR5cGV8dGhlbnx0b3x0cmFuc3BvcnR8dHlwZXx1bmFmZmVjdGVkfHVuaXRzfHVudGlsfHVzZXx2YXJpYWJsZXx3YWl0fHdoZW58d2hpbGV8d2l0aClcXGIvaSxcblx0J2Jvb2xlYW4nOiAvXFxiKD86dHJ1ZXxmYWxzZSlcXGIvaSxcblx0J2Z1bmN0aW9uJzogL1thLXowLTlfXSsoPz1cXCgpL2ksXG5cdC8vIGRlY2ltYWwsIGJhc2VkLCBwaHlzaWNhbCwgYW5kIGV4cG9uZW50aWFsIG51bWJlcnMgc3VwcG9ydGVkXG5cdCdudW1iZXInOiAvJ1swMXV4endsaC1dJ3xcXGIoPzpcXGQrI1tcXGRhLWZfLl0rI3xcXGRbXFxkXy5dKikoPzplWy0rXT9cXGQrKT8vaSxcblx0J29wZXJhdG9yJzogL1s8Pl09P3w6PXxbLSsqLyY9XXxcXGIoPzphYnN8bm90fG1vZHxyZW18c2xsfHNybHxzbGF8c3JhfHJvbHxyb3J8YW5kfG9yfG5hbmR8eG5vcnx4b3J8bm9yKVxcYi9pLFxuXHQncHVuY3R1YXRpb24nOiAvW3t9W1xcXTsoKSwuOl0vXG59O1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tdmVyaWxvZy5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMudmVyaWxvZyA9IHtcbiAgJ2NvbW1lbnQnOiAvXFwvXFwvLip8XFwvXFwqW1xcd1xcV10qP1xcKlxcLy8sXG4gICdzdHJpbmcnOiAvXCIoPzpcXFxcKD86XFxyXFxufFtcXHNcXFNdKXxbXlwiXFxcXFxcclxcbl0pKlwiLyxcbiAgLy8gc3VwcG9ydCBmb3IgYW55IGtlcm5lbCBmdW5jdGlvbiAoZXg6ICRkaXNwbGF5KCkpXG4gICdwcm9wZXJ0eSc6IC9cXEJcXCRcXHcrXFxiLyxcbiAgLy8gc3VwcG9ydCBmb3IgdXNlciBkZWZpbmVkIGNvbnN0YW50cyAoZXg6IGBkZWZpbmUpXG4gICdjb25zdGFudCc6IC9cXEJgXFx3K1xcYi8sXG4gICdmdW5jdGlvbic6IC9bYS16XFxkX10rKD89XFwoKS9pLFxuICAvLyBzdXBwb3J0IGZvciB2ZXJpbG9nIGFuZCBzeXN0ZW0gdmVyaWxvZyBrZXl3b3Jkc1xuICAna2V5d29yZCc6IC9cXGIoPzphbGlhc3xhbmR8YXNzZXJ0fGFzc2lnbnxhc3N1bWV8YXV0b21hdGljfGJlZm9yZXxiZWdpbnxiaW5kfGJpbnN8Ymluc29mfGJpdHxicmVha3xidWZ8YnVmaWYwfGJ1ZmlmMXxieXRlfGNsYXNzfGNhc2V8Y2FzZXh8Y2FzZXp8Y2VsbHxjaGFuZGxlfGNsb2NraW5nfGNtb3N8Y29uZmlnfGNvbnN0fGNvbnN0cmFpbnR8Y29udGV4dHxjb250aW51ZXxjb3Zlcnxjb3Zlcmdyb3VwfGNvdmVycG9pbnR8Y3Jvc3N8ZGVhc3NpZ258ZGVmYXVsdHxkZWZwYXJhbXxkZXNpZ258ZGlzYWJsZXxkaXN0fGRvfGVkZ2V8ZWxzZXxlbmR8ZW5kY2FzZXxlbmRjbGFzc3xlbmRjbG9ja2luZ3xlbmRjb25maWd8ZW5kZnVuY3Rpb258ZW5kZ2VuZXJhdGV8ZW5kZ3JvdXB8ZW5kaW50ZXJmYWNlfGVuZG1vZHVsZXxlbmRwYWNrYWdlfGVuZHByaW1pdGl2ZXxlbmRwcm9ncmFtfGVuZHByb3BlcnR5fGVuZHNwZWNpZnl8ZW5kc2VxdWVuY2V8ZW5kdGFibGV8ZW5kdGFza3xlbnVtfGV2ZW50fGV4cGVjdHxleHBvcnR8ZXh0ZW5kc3xleHRlcm58ZmluYWx8Zmlyc3RfbWF0Y2h8Zm9yfGZvcmNlfGZvcmVhY2h8Zm9yZXZlcnxmb3JrfGZvcmtqb2lufGZ1bmN0aW9ufGdlbmVyYXRlfGdlbnZhcnxoaWdoejB8aGlnaHoxfGlmfGlmZnxpZm5vbmV8aWdub3JlX2JpbnN8aWxsZWdhbF9iaW5zfGltcG9ydHxpbmNkaXJ8aW5jbHVkZXxpbml0aWFsfGlub3V0fGlucHV0fGluc2lkZXxpbnN0YW5jZXxpbnR8aW50ZWdlcnxpbnRlcmZhY2V8aW50ZXJzZWN0fGpvaW58am9pbl9hbnl8am9pbl9ub25lfGxhcmdlfGxpYmxpc3R8bGlicmFyeXxsb2NhbHxsb2NhbHBhcmFtfGxvZ2ljfGxvbmdpbnR8bWFjcm9tb2R1bGV8bWF0Y2hlc3xtZWRpdW18bW9kcG9ydHxtb2R1bGV8bmFuZHxuZWdlZGdlfG5ld3xubW9zfG5vcnxub3Nob3djYW5jZWxsZWR8bm90fG5vdGlmMHxub3RpZjF8bnVsbHxvcnxvdXRwdXR8cGFja2FnZXxwYWNrZWR8cGFyYW1ldGVyfHBtb3N8cG9zZWRnZXxwcmltaXRpdmV8cHJpb3JpdHl8cHJvZ3JhbXxwcm9wZXJ0eXxwcm90ZWN0ZWR8cHVsbDB8cHVsbDF8cHVsbGRvd258cHVsbHVwfHB1bHNlc3R5bGVfb25ldmVudHxwdWxzZXN0eWxlX29uZGV0ZWN0fHB1cmV8cmFuZHxyYW5kY3xyYW5kY2FzZXxyYW5kc2VxdWVuY2V8cmNtb3N8cmVhbHxyZWFsdGltZXxyZWZ8cmVnfHJlbGVhc2V8cmVwZWF0fHJldHVybnxybm1vc3xycG1vc3xydHJhbnxydHJhbmlmMHxydHJhbmlmMXxzY2FsYXJlZHxzZXF1ZW5jZXxzaG9ydGludHxzaG9ydHJlYWx8c2hvd2NhbmNlbGxlZHxzaWduZWR8c21hbGx8c29sdmV8c3BlY2lmeXxzcGVjcGFyYW18c3RhdGljfHN0cmluZ3xzdHJvbmcwfHN0cm9uZzF8c3RydWN0fHN1cGVyfHN1cHBseTB8c3VwcGx5MXx0YWJsZXx0YWdnZWR8dGFza3x0aGlzfHRocm91Z2hvdXR8dGltZXx0aW1lcHJlY2lzaW9ufHRpbWV1bml0fHRyYW58dHJhbmlmMHx0cmFuaWYxfHRyaXx0cmkwfHRyaTF8dHJpYW5kfHRyaW9yfHRyaXJlZ3x0eXBlfHR5cGVkZWZ8dW5pb258dW5pcXVlfHVuc2lnbmVkfHVzZXx1d2lyZXx2YXJ8dmVjdG9yZWR8dmlydHVhbHx2b2lkfHdhaXR8d2FpdF9vcmRlcnx3YW5kfHdlYWswfHdlYWsxfHdoaWxlfHdpbGRjYXJkfHdpcmV8d2l0aHx3aXRoaW58d29yfHhub3J8eG9yKVxcYi8sXG4gIC8vIGJvbGQgaGlnaGxpZ2h0aW5nIGZvciBhbGwgdmVyaWxvZyBhbmQgc3lzdGVtIHZlcmlsb2cgbG9naWMgYmxvY2tzXG4gICdpbXBvcnRhbnQnOiAvXFxiKD86YWx3YXlzX2xhdGNofGFsd2F5c19jb21ifGFsd2F5c19mZnxhbHdheXMpXFxiID9APy8sXG4gIC8vIHN1cHBvcnQgZm9yIHRpbWUgdGlja3MsIHZlY3RvcnMsIGFuZCByZWFsIG51bWJlcnNcbiAgJ251bWJlcic6IC9cXEIjIz9cXGQrfCg/OlxcYlxcZCspPydbb2RiaF0gP1tcXGRhLWZ6eF8/XSt8XFxiXFxkKlsuX10/XFxkKyg/OmVbLStdP1xcZCspPy9pLFxuICAnb3BlcmF0b3InOiAvWy0re31efiUqXFwvPz0hPD4mfF0rLyxcbiAgJ3B1bmN0dWF0aW9uJzogL1tbXFxdOygpLC46XS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY2xpa2UuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmNsaWtlID0ge1xuXHQnY29tbWVudCc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSlcXC9cXCpbXFx3XFxXXSo/XFwqXFwvLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXlxcXFw6XSlcXC9cXC8uKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQnc3RyaW5nJzogLyhbXCInXSkoXFxcXCg/OlxcclxcbnxbXFxzXFxTXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMS8sXG5cdCdjbGFzcy1uYW1lJzoge1xuXHRcdHBhdHRlcm46IC8oKD86XFxiKD86Y2xhc3N8aW50ZXJmYWNlfGV4dGVuZHN8aW1wbGVtZW50c3x0cmFpdHxpbnN0YW5jZW9mfG5ldylcXHMrKXwoPzpjYXRjaFxccytcXCgpKVthLXowLTlfXFwuXFxcXF0rL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdHB1bmN0dWF0aW9uOiAvKFxcLnxcXFxcKS9cblx0XHR9XG5cdH0sXG5cdCdrZXl3b3JkJzogL1xcYihpZnxlbHNlfHdoaWxlfGRvfGZvcnxyZXR1cm58aW58aW5zdGFuY2VvZnxmdW5jdGlvbnxuZXd8dHJ5fHRocm93fGNhdGNofGZpbmFsbHl8bnVsbHxicmVha3xjb250aW51ZSlcXGIvLFxuXHQnYm9vbGVhbic6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvLFxuXHQnZnVuY3Rpb24nOiAvW2EtejAtOV9dKyg/PVxcKCkvaSxcblx0J251bWJlcic6IC9cXGItPyg/OjB4W1xcZGEtZl0rfFxcZCpcXC4/XFxkKyg/OmVbKy1dP1xcZCspPylcXGIvaSxcblx0J29wZXJhdG9yJzogLy0tP3xcXCtcXCs/fCE9Pz0/fDw9P3w+PT98PT0/PT98JiY/fFxcfFxcfD98XFw/fFxcKnxcXC98fnxcXF58JS8sXG5cdCdwdW5jdHVhdGlvbic6IC9be31bXFxdOygpLC46XS9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1qYXZhc2NyaXB0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0ID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhc3xhc3luY3xhd2FpdHxicmVha3xjYXNlfGNhdGNofGNsYXNzfGNvbnN0fGNvbnRpbnVlfGRlYnVnZ2VyfGRlZmF1bHR8ZGVsZXRlfGRvfGVsc2V8ZW51bXxleHBvcnR8ZXh0ZW5kc3xmYWxzZXxmaW5hbGx5fGZvcnxmcm9tfGZ1bmN0aW9ufGdldHxpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnxpbnN0YW5jZW9mfGludGVyZmFjZXxsZXR8bmV3fG51bGx8b2Z8cGFja2FnZXxwcml2YXRlfHByb3RlY3RlZHxwdWJsaWN8cmV0dXJufHNldHxzdGF0aWN8c3VwZXJ8c3dpdGNofHRoaXN8dGhyb3d8dHJ1ZXx0cnl8dHlwZW9mfHZhcnx2b2lkfHdoaWxlfHdpdGh8eWllbGQpXFxiLyxcblx0J251bWJlcic6IC9cXGItPygweFtcXGRBLUZhLWZdK3wwYlswMV0rfDBvWzAtN10rfFxcZCpcXC4/XFxkKyhbRWVdWystXT9cXGQrKT98TmFOfEluZmluaXR5KVxcYi8sXG5cdC8vIEFsbG93IGZvciBhbGwgbm9uLUFTQ0lJIGNoYXJhY3RlcnMgKFNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMDA4NDQ0KVxuXHQnZnVuY3Rpb24nOiAvW18kYS16QS1aXFx4QTAtXFx1RkZGRl1bXyRhLXpBLVowLTlcXHhBMC1cXHVGRkZGXSooPz1cXCgpL2lcbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdqYXZhc2NyaXB0JywgJ2tleXdvcmQnLCB7XG5cdCdyZWdleCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W14vXSlcXC8oPyFcXC8pKFxcWy4rP118XFxcXC58W14vXFxcXFxcclxcbl0pK1xcL1tnaW15dV17MCw1fSg/PVxccyooJHxbXFxyXFxuLC47fSldKSkvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2phdmFzY3JpcHQnLCAnY2xhc3MtbmFtZScsIHtcblx0J3RlbXBsYXRlLXN0cmluZyc6IHtcblx0XHRwYXR0ZXJuOiAvYCg/OlxcXFxgfFxcXFw/W15gXSkqYC8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnaW50ZXJwb2xhdGlvbic6IHtcblx0XHRcdFx0cGF0dGVybjogL1xcJFxce1tefV0rXFx9Lyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J2ludGVycG9sYXRpb24tcHVuY3R1YXRpb24nOiB7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxcJFxce3xcXH0kLyxcblx0XHRcdFx0XHRcdGFsaWFzOiAncHVuY3R1YXRpb24nXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdFxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J3N0cmluZyc6IC9bXFxzXFxTXSsvXG5cdFx0fVxuXHR9XG59KTtcblxuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya3VwJywgJ3RhZycsIHtcblx0XHQnc2NyaXB0Jzoge1xuXHRcdFx0cGF0dGVybjogLzxzY3JpcHRbXFx3XFxXXSo/PltcXHdcXFddKj88XFwvc2NyaXB0Pi9pLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCd0YWcnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogLzxzY3JpcHRbXFx3XFxXXSo/Pnw8XFwvc2NyaXB0Pi9pLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcuaW5zaWRlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0XG5cdFx0XHR9LFxuXHRcdFx0YWxpYXM6ICdsYW5ndWFnZS1qYXZhc2NyaXB0J1xuXHRcdH1cblx0fSk7XG59XG5cblByaXNtLmxhbmd1YWdlcy5qcyA9IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXR5cGVzY3JpcHQuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnR5cGVzY3JpcHQgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdqYXZhc2NyaXB0Jywge1xuXHQna2V5d29yZCc6IC9cXGIoYnJlYWt8Y2FzZXxjYXRjaHxjbGFzc3xjb25zdHxjb250aW51ZXxkZWJ1Z2dlcnxkZWZhdWx0fGRlbGV0ZXxkb3xlbHNlfGVudW18ZXhwb3J0fGV4dGVuZHN8ZmFsc2V8ZmluYWxseXxmb3J8ZnVuY3Rpb258Z2V0fGlmfGltcGxlbWVudHN8aW1wb3J0fGlufGluc3RhbmNlb2Z8aW50ZXJmYWNlfGxldHxuZXd8bnVsbHxwYWNrYWdlfHByaXZhdGV8cHJvdGVjdGVkfHB1YmxpY3xyZXR1cm58c2V0fHN0YXRpY3xzdXBlcnxzd2l0Y2h8dGhpc3x0aHJvd3x0cnVlfHRyeXx0eXBlb2Z8dmFyfHZvaWR8d2hpbGV8d2l0aHx5aWVsZHxtb2R1bGV8ZGVjbGFyZXxjb25zdHJ1Y3RvcnxzdHJpbmd8RnVuY3Rpb258YW55fG51bWJlcnxib29sZWFufEFycmF5fGVudW0pXFxiL1xufSk7XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS10d2lnLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy50d2lnID0ge1xuXHQnY29tbWVudCc6IC9cXHsjW1xcc1xcU10qPyNcXH0vLFxuXHQndGFnJzoge1xuXHRcdHBhdHRlcm46IC9cXHtcXHtbXFxzXFxTXSo/XFx9XFx9fFxceyVbXFxzXFxTXSo/JVxcfS8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnbGQnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9eKD86XFx7XFx7XFwtP3xcXHslXFwtP1xccypcXHcrKS8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eKD86XFx7XFx7fFxceyUpXFwtPy8sXG5cdFx0XHRcdFx0J2tleXdvcmQnOiAvXFx3Ky9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdyZCc6IHtcblx0XHRcdFx0cGF0dGVybjogL1xcLT8oPzolXFx9fFxcfVxcfSkkLyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogLy4qL1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J3N0cmluZyc6IHtcblx0XHRcdFx0cGF0dGVybjogLyhcInwnKSg/OlxcXFw/LikqP1xcMS8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eWydcIl18WydcIl0kL1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2tleXdvcmQnOiAvXFxiKD86ZXZlbnxpZnxvZGQpXFxiLyxcblx0XHRcdCdib29sZWFuJzogL1xcYig/OnRydWV8ZmFsc2V8bnVsbClcXGIvLFxuXHRcdFx0J251bWJlcic6IC9cXGItPyg/OjB4W1xcZEEtRmEtZl0rfFxcZCpcXC4/XFxkKyhbRWVdWy0rXT9cXGQrKT8pXFxiLyxcblx0XHRcdCdvcGVyYXRvcic6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBhdHRlcm46IC8oXFxzKSg/OmFuZHxiXFwtYW5kfGJcXC14b3J8YlxcLW9yfGVuZHMgd2l0aHxpbnxpc3xtYXRjaGVzfG5vdHxvcnxzYW1lIGFzfHN0YXJ0cyB3aXRoKSg/PVxccykvLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0L1s9PD5dPT98IT18XFwqXFwqP3xcXC9cXC8/fFxcPzo/fFstK34lfF0vXG5cdFx0XHRdLFxuXHRcdFx0J3Byb3BlcnR5JzogL1xcYlthLXpBLVpfXVthLXpBLVowLTlfXSpcXGIvLFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL1soKVxcW1xcXXt9Oi4sXS9cblx0XHR9XG5cdH0sXG5cblx0Ly8gVGhlIHJlc3QgY2FuIGJlIHBhcnNlZCBhcyBIVE1MXG5cdCdvdGhlcic6IHtcblx0XHQvLyBXZSB3YW50IG5vbi1ibGFuayBtYXRjaGVzXG5cdFx0cGF0dGVybjogL1xcUyg/OltcXHNcXFNdKlxcUyk/Lyxcblx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXBcblx0fVxufTtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXRleHRpbGUuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuKGZ1bmN0aW9uKFByaXNtKSB7XG5cdC8vIFdlIGRvbid0IGFsbG93IGZvciBwaXBlcyBpbnNpZGUgcGFyZW50aGVzZXNcblx0Ly8gdG8gbm90IGJyZWFrIHRhYmxlIHBhdHRlcm4gfCguIGZvbyB8KS4gYmFyIHxcblx0dmFyIG1vZGlmaWVyUmVnZXggPSAnKD86XFxcXChbXnwpXStcXFxcKXxcXFxcW1teXFxcXF1dK1xcXFxdfFxcXFx7W159XStcXFxcfSkrJztcblx0dmFyIG1vZGlmaWVyVG9rZW5zID0ge1xuXHRcdCdjc3MnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvXFx7W159XStcXH0vLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5jc3Ncblx0XHRcdH1cblx0XHR9LFxuXHRcdCdjbGFzcy1pZCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXFwoKVteKV0rKD89XFwpKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0YWxpYXM6ICdhdHRyLXZhbHVlJ1xuXHRcdH0sXG5cdFx0J2xhbmcnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKFxcWylbXlxcXV0rKD89XFxdKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0YWxpYXM6ICdhdHRyLXZhbHVlJ1xuXHRcdH0sXG5cdFx0Ly8gQW55dGhpbmcgZWxzZSBpcyBwdW5jdHVhdGlvbiAodGhlIGZpcnN0IHBhdHRlcm4gaXMgZm9yIHJvdy9jb2wgc3BhbnMgaW5zaWRlIHRhYmxlcylcblx0XHQncHVuY3R1YXRpb24nOiAvW1xcXFxcXC9dXFxkK3xcXFMvXG5cdH07XG5cblxuXHRQcmlzbS5sYW5ndWFnZXMudGV4dGlsZSA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ21hcmt1cCcsIHtcblx0XHQncGhyYXNlJzoge1xuXHRcdFx0cGF0dGVybjogLyhefFxccnxcXG4pXFxTW1xcc1xcU10qPyg/PSR8XFxyP1xcblxccj9cXG58XFxyXFxyKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cblx0XHRcdFx0Ly8gaDEuIEhlYWRlciAxXG5cdFx0XHRcdCdibG9jay10YWcnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogUmVnRXhwKCdeW2Etel1cXFxcdyooPzonICsgbW9kaWZpZXJSZWdleCArICd8Wzw+PSgpXSkqXFxcXC4nKSxcblx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdCdtb2RpZmllcic6IHtcblx0XHRcdFx0XHRcdFx0cGF0dGVybjogUmVnRXhwKCcoXlthLXpdXFxcXHcqKSg/OicgKyBtb2RpZmllclJlZ2V4ICsgJ3xbPD49KCldKSsoPz1cXFxcLiknKSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS51dGlsLmNsb25lKG1vZGlmaWVyVG9rZW5zKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCd0YWcnOiAvXlthLXpdXFx3Ki8sXG5cdFx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXFwuJC9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Ly8gIyBMaXN0IGl0ZW1cblx0XHRcdFx0Ly8gKiBMaXN0IGl0ZW1cblx0XHRcdFx0J2xpc3QnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogUmVnRXhwKCdeWyojXSsoPzonICsgbW9kaWZpZXJSZWdleCArICcpP1xcXFxzKy4rJywgJ20nKSxcblx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdCdtb2RpZmllcic6IHtcblx0XHRcdFx0XHRcdFx0cGF0dGVybjogUmVnRXhwKCcoXlsqI10rKScgKyBtb2RpZmllclJlZ2V4KSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS51dGlsLmNsb25lKG1vZGlmaWVyVG9rZW5zKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eWyojXSsvXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8vIHwgY2VsbCB8IGNlbGwgfCBjZWxsIHxcblx0XHRcdFx0J3RhYmxlJzoge1xuXHRcdFx0XHRcdC8vIE1vZGlmaWVycyBjYW4gYmUgYXBwbGllZCB0byB0aGUgcm93OiB7Y29sb3I6cmVkfS58MXwyfDN8XG5cdFx0XHRcdFx0Ly8gb3IgdGhlIGNlbGw6IHx7Y29sb3I6cmVkfS4xfDJ8M3xcblx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJ14oPzooPzonICsgbW9kaWZpZXJSZWdleCArICd8Wzw+PSgpXn5dKStcXFxcLlxcXFxzKik/KD86XFxcXHwoPzooPzonICsgbW9kaWZpZXJSZWdleCArICd8Wzw+PSgpXn5fXXxbXFxcXFxcXFwvXVxcXFxkKykrXFxcXC4pP1tefF0qKStcXFxcfCcsICdtJyksXG5cdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHQnbW9kaWZpZXInOiB7XG5cdFx0XHRcdFx0XHRcdC8vIE1vZGlmaWVycyBmb3Igcm93cyBhZnRlciB0aGUgZmlyc3Qgb25lIGFyZVxuXHRcdFx0XHRcdFx0XHQvLyBwcmVjZWRlZCBieSBhIHBpcGUgYW5kIGEgbGluZSBmZWVkXG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cCgnKF58XFxcXHwoPzpcXFxccj9cXFxcbnxcXFxccik/KSg/OicgKyBtb2RpZmllclJlZ2V4ICsgJ3xbPD49KClefl9dfFtcXFxcXFxcXC9dXFxcXGQrKSsoPz1cXFxcLiknKSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS51dGlsLmNsb25lKG1vZGlmaWVyVG9rZW5zKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9cXHx8XlxcLi9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0J2lubGluZSc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJyhcXFxcKlxcXFwqfF9ffFxcXFw/XFxcXD98WypfJUArXFxcXC1efl0pKD86JyArIG1vZGlmaWVyUmVnZXggKyAnKT8uKz9cXFxcMScpLFxuXHRcdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdFx0Ly8gTm90ZTogc3VwZXJzY3JpcHRzIGFuZCBzdWJzY3JpcHRzIGFyZSBub3QgaGFuZGxlZCBzcGVjaWZpY2FsbHlcblxuXHRcdFx0XHRcdFx0Ly8gKmJvbGQqLCAqKmJvbGQqKlxuXHRcdFx0XHRcdFx0J2JvbGQnOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cCgnKCheXFxcXCpcXFxcKj8pKD86JyArIG1vZGlmaWVyUmVnZXggKyAnKT8pLis/KD89XFxcXDIpJyksXG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0XHRcdH0sXG5cblx0XHRcdFx0XHRcdC8vIF9pdGFsaWNfLCBfX2l0YWxpY19fXG5cdFx0XHRcdFx0XHQnaXRhbGljJzoge1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJygoXl9fPykoPzonICsgbW9kaWZpZXJSZWdleCArICcpPykuKz8oPz1cXFxcMiknKSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdFx0Ly8gPz9jaXRlPz9cblx0XHRcdFx0XHRcdCdjaXRlJzoge1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJyheXFxcXD9cXFxcPyg/OicgKyBtb2RpZmllclJlZ2V4ICsgJyk/KS4rPyg/PVxcXFw/XFxcXD8pJyksXG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGFsaWFzOiAnc3RyaW5nJ1xuXHRcdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdFx0Ly8gQGNvZGVAXG5cdFx0XHRcdFx0XHQnY29kZSc6IHtcblx0XHRcdFx0XHRcdFx0cGF0dGVybjogUmVnRXhwKCcoXkAoPzonICsgbW9kaWZpZXJSZWdleCArICcpPykuKz8oPz1AKScpLFxuXHRcdFx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRhbGlhczogJ2tleXdvcmQnXG5cdFx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0XHQvLyAraW5zZXJ0ZWQrXG5cdFx0XHRcdFx0XHQnaW5zZXJ0ZWQnOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cCgnKF5cXFxcKyg/OicgKyBtb2RpZmllclJlZ2V4ICsgJyk/KS4rPyg/PVxcXFwrKScpLFxuXHRcdFx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0XHQvLyAtZGVsZXRlZC1cblx0XHRcdFx0XHRcdCdkZWxldGVkJzoge1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJyheLSg/OicgKyBtb2RpZmllclJlZ2V4ICsgJyk/KS4rPyg/PS0pJyksXG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0XHRcdH0sXG5cblx0XHRcdFx0XHRcdC8vICVzcGFuJVxuXHRcdFx0XHRcdFx0J3NwYW4nOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cCgnKF4lKD86JyArIG1vZGlmaWVyUmVnZXggKyAnKT8pLis/KD89JSknKSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdFx0J21vZGlmaWVyJzoge1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJyheXFxcXCpcXFxcKnxfX3xcXFxcP1xcXFw/fFsqXyVAK1xcXFwtXn5dKScgKyBtb2RpZmllclJlZ2V4KSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS51dGlsLmNsb25lKG1vZGlmaWVyVG9rZW5zKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bKl8lP0ArXFwtXn5dKy9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Ly8gW2FsaWFzXWh0dHA6Ly9leGFtcGxlLmNvbVxuXHRcdFx0XHQnbGluay1yZWYnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogL15cXFtbXlxcXV0rXFxdXFxTKyQvbSxcblx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdCdzdHJpbmcnOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IC8oXFxbKVteXFxdXSsoPz1cXF0pLyxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCd1cmwnOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IC8oXFxdKVxcUyskLyxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bXFxbXFxdXS9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Ly8gXCJ0ZXh0XCI6aHR0cDovL2V4YW1wbGUuY29tXG5cdFx0XHRcdC8vIFwidGV4dFwiOmxpbmstcmVmXG5cdFx0XHRcdCdsaW5rJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cCgnXCIoPzonICsgbW9kaWZpZXJSZWdleCArICcpP1teXCJdK1wiOi4rPyg/PVteXFxcXHcvXT8oPzpcXFxcc3wkKSknKSxcblx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdCd0ZXh0Jzoge1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJyheXCIoPzonICsgbW9kaWZpZXJSZWdleCArICcpPylbXlwiXSsoPz1cIiknKSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCdtb2RpZmllcic6IHtcblx0XHRcdFx0XHRcdFx0cGF0dGVybjogUmVnRXhwKCcoXlwiKScgKyBtb2RpZmllclJlZ2V4KSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS51dGlsLmNsb25lKG1vZGlmaWVyVG9rZW5zKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCd1cmwnOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IC8oOikuKy8sXG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvW1wiOl0vXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8vICFpbWFnZS5qcGchXG5cdFx0XHRcdC8vICFpbWFnZS5qcGcoVGl0bGUpITpodHRwOi8vZXhhbXBsZS5jb21cblx0XHRcdFx0J2ltYWdlJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cCgnISg/OicgKyBtb2RpZmllclJlZ2V4ICsgJ3xbPD49KCldKSpbXiFcXFxccygpXSsoPzpcXFxcKFteKV0rXFxcXCkpPyEoPzo6Lis/KD89W15cXFxcdy9dPyg/OlxcXFxzfCQpKSk/JyksXG5cdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHQnc291cmNlJzoge1xuXHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoJyheISg/OicgKyBtb2RpZmllclJlZ2V4ICsgJ3xbPD49KCldKSopW14hXFxcXHMoKV0rKD86XFxcXChbXildK1xcXFwpKT8oPz0hKScpLFxuXHRcdFx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRhbGlhczogJ3VybCdcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHQnbW9kaWZpZXInOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IFJlZ0V4cCgnKF4hKSg/OicgKyBtb2RpZmllclJlZ2V4ICsgJ3xbPD49KCldKSsnKSxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS51dGlsLmNsb25lKG1vZGlmaWVyVG9rZW5zKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCd1cmwnOiB7XG5cdFx0XHRcdFx0XHRcdHBhdHRlcm46IC8oOikuKy8sXG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvWyE6XS9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Ly8gRm9vdG5vdGVbMV1cblx0XHRcdFx0J2Zvb3Rub3RlJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9cXGJcXFtcXGQrXFxdLyxcblx0XHRcdFx0XHRhbGlhczogJ2NvbW1lbnQnLFxuXHRcdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL1xcW3xcXF0vXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8vIENTUyhDYXNjYWRpbmcgU3R5bGUgU2hlZXQpXG5cdFx0XHRcdCdhY3JvbnltJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9cXGJbQS1aXFxkXStcXChbXildK1xcKS8sXG5cdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHQnY29tbWVudCc6IHtcblx0XHRcdFx0XHRcdFx0cGF0dGVybjogLyhcXCgpW14pXSsoPz1cXCkpLyxcblx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bKCldL1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblxuXHRcdFx0XHQvLyBQcmlzbShDKVxuXHRcdFx0XHQnbWFyayc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXFxiXFwoKFRNfFJ8QylcXCkvLFxuXHRcdFx0XHRcdGFsaWFzOiAnY29tbWVudCcsXG5cdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHQncHVuY3R1YXRpb24nOi9bKCldL1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0dmFyIG5lc3RlZFBhdHRlcm5zID0ge1xuXHRcdCdpbmxpbmUnOiBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ2lubGluZSddKSxcblx0XHQnbGluayc6IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLnRleHRpbGVbJ3BocmFzZSddLmluc2lkZVsnbGluayddKSxcblx0XHQnaW1hZ2UnOiBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ2ltYWdlJ10pLFxuXHRcdCdmb290bm90ZSc6IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLnRleHRpbGVbJ3BocmFzZSddLmluc2lkZVsnZm9vdG5vdGUnXSksXG5cdFx0J2Fjcm9ueW0nOiBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ2Fjcm9ueW0nXSksXG5cdFx0J21hcmsnOiBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ21hcmsnXSlcblx0fTtcblxuXHQvLyBBbGxvdyBzb21lIG5lc3Rpbmdcblx0UHJpc20ubGFuZ3VhZ2VzLnRleHRpbGVbJ3BocmFzZSddLmluc2lkZVsnaW5saW5lJ10uaW5zaWRlWydib2xkJ10uaW5zaWRlID0gbmVzdGVkUGF0dGVybnM7XG5cdFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ2lubGluZSddLmluc2lkZVsnaXRhbGljJ10uaW5zaWRlID0gbmVzdGVkUGF0dGVybnM7XG5cdFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ2lubGluZSddLmluc2lkZVsnaW5zZXJ0ZWQnXS5pbnNpZGUgPSBuZXN0ZWRQYXR0ZXJucztcblx0UHJpc20ubGFuZ3VhZ2VzLnRleHRpbGVbJ3BocmFzZSddLmluc2lkZVsnaW5saW5lJ10uaW5zaWRlWydkZWxldGVkJ10uaW5zaWRlID0gbmVzdGVkUGF0dGVybnM7XG5cdFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ2lubGluZSddLmluc2lkZVsnc3BhbiddLmluc2lkZSA9IG5lc3RlZFBhdHRlcm5zO1xuXG5cdC8vIEFsbG93IHNvbWUgc3R5bGVzIGluc2lkZSB0YWJsZSBjZWxsc1xuXHRQcmlzbS5sYW5ndWFnZXMudGV4dGlsZVsncGhyYXNlJ10uaW5zaWRlWyd0YWJsZSddLmluc2lkZVsnaW5saW5lJ10gPSBuZXN0ZWRQYXR0ZXJuc1snaW5saW5lJ107XG5cdFByaXNtLmxhbmd1YWdlcy50ZXh0aWxlWydwaHJhc2UnXS5pbnNpZGVbJ3RhYmxlJ10uaW5zaWRlWydsaW5rJ10gPSBuZXN0ZWRQYXR0ZXJuc1snbGluayddO1xuXHRQcmlzbS5sYW5ndWFnZXMudGV4dGlsZVsncGhyYXNlJ10uaW5zaWRlWyd0YWJsZSddLmluc2lkZVsnaW1hZ2UnXSA9IG5lc3RlZFBhdHRlcm5zWydpbWFnZSddO1xuXHRQcmlzbS5sYW5ndWFnZXMudGV4dGlsZVsncGhyYXNlJ10uaW5zaWRlWyd0YWJsZSddLmluc2lkZVsnZm9vdG5vdGUnXSA9IG5lc3RlZFBhdHRlcm5zWydmb290bm90ZSddO1xuXHRQcmlzbS5sYW5ndWFnZXMudGV4dGlsZVsncGhyYXNlJ10uaW5zaWRlWyd0YWJsZSddLmluc2lkZVsnYWNyb255bSddID0gbmVzdGVkUGF0dGVybnNbJ2Fjcm9ueW0nXTtcblx0UHJpc20ubGFuZ3VhZ2VzLnRleHRpbGVbJ3BocmFzZSddLmluc2lkZVsndGFibGUnXS5pbnNpZGVbJ21hcmsnXSA9IG5lc3RlZFBhdHRlcm5zWydtYXJrJ107XG5cbn0oUHJpc20pKTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS10Y2wuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnRjbCA9IHtcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pIy4qLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdzdHJpbmcnOiAvXCIoPzpbXlwiXFxcXFxcclxcbl18XFxcXCg/OlxcclxcbnxbXFxzXFxTXSkpKlwiLyxcblx0J3ZhcmlhYmxlJzogW1xuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXFwkKSg/Ojo6KT8oPzpbYS16QS1aMC05XSs6OikqW2EtekEtWjAtOV9dKy8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKFxcJCl7W159XSt9Lyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXlxccypzZXRbIFxcdF0rKSg/Ojo6KT8oPzpbYS16QS1aMC05XSs6OikqW2EtekEtWjAtOV9dKy9tLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0XSxcblx0J2Z1bmN0aW9uJzoge1xuXHRcdHBhdHRlcm46IC8oXlxccypwcm9jWyBcXHRdKylbXlxcc10rL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnYnVpbHRpbic6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF5cXHMqKSg/OnByb2N8cmV0dXJufGNsYXNzfGVycm9yfGV2YWx8ZXhpdHxmb3J8Zm9yZWFjaHxpZnxzd2l0Y2h8d2hpbGV8YnJlYWt8Y29udGludWUpXFxiL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQvXFxiKGVsc2VpZnxlbHNlKVxcYi9cblx0XSxcblx0J3Njb3BlJzoge1xuXHRcdHBhdHRlcm46IC8oXlxccyopKGdsb2JhbHx1cHZhcnx2YXJpYWJsZSlcXGIvbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnY29uc3RhbnQnXG5cdH0sXG5cdCdrZXl3b3JkJzoge1xuXHRcdHBhdHRlcm46IC8oXlxccyp8XFxbKShhZnRlcnxhcHBlbmR8YXBwbHl8YXJyYXl8YXV0b18oPzpleGVjb2t8aW1wb3J0fGxvYWR8bWtpbmRleHxxdWFsaWZ5fHJlc2V0KXxhdXRvbWtpbmRleF9vbGR8YmdlcnJvcnxiaW5hcnl8Y2F0Y2h8Y2R8Y2hhbnxjbG9ja3xjbG9zZXxjb25jYXR8ZGRlfGRpY3R8ZW5jb2Rpbmd8ZW9mfGV4ZWN8ZXhwcnxmYmxvY2tlZHxmY29uZmlndXJlfGZjb3B5fGZpbGUoPzpldmVudHxuYW1lKT98Zmx1c2h8Z2V0c3xnbG9ifGhpc3Rvcnl8aHR0cHxpbmNyfGluZm98aW50ZXJwfGpvaW58bGFwcGVuZHxsYXNzaWdufGxpbmRleHxsaW5zZXJ0fGxpc3R8bGxlbmd0aHxsb2FkfGxyYW5nZXxscmVwZWF0fGxyZXBsYWNlfGxyZXZlcnNlfGxzZWFyY2h8bHNldHxsc29ydHxtYXRoKD86ZnVuY3xvcCl8bWVtb3J5fG1zZ2NhdHxuYW1lc3BhY2V8b3BlbnxwYWNrYWdlfHBhcnJheXxwaWR8cGtnX21rSW5kZXh8cGxhdGZvcm18cHV0c3xwd2R8cmVfc3ludGF4fHJlYWR8cmVmY2hhbnxyZWdleHB8cmVnaXN0cnl8cmVnc3VifHJlbmFtZXxTYWZlX0Jhc2V8c2NhbnxzZWVrfHNldHxzb2NrZXR8c291cmNlfHNwbGl0fHN0cmluZ3xzdWJzdHxUY2x8dGNsKD86X2VuZE9mV29yZHxfZmluZExpYnJhcnl8c3RhcnRPZig/Ok5leHR8UHJldmlvdXMpV29yZHx3b3JkQnJlYWsoPzpBZnRlcnxCZWZvcmUpfHRlc3R8dmFycyl8dGVsbHx0aW1lfHRtfHRyYWNlfHVua25vd258dW5sb2FkfHVuc2V0fHVwZGF0ZXx1cGxldmVsfHZ3YWl0KVxcYi9tLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J29wZXJhdG9yJzogLyE9P3xcXCpcXCo/fD09fCYmP3xcXHxcXHw/fDxbPTxdP3w+Wz0+XT98Wy0rflxcLyU/Xl18XFxiKD86ZXF8bmV8aW58bmkpXFxiLyxcblx0J3B1bmN0dWF0aW9uJzogL1t7fSgpXFxbXFxdXS9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1zd2lmdC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vLyBpc3N1ZXM6IG5lc3RlZCBtdWx0aWxpbmUgY29tbWVudHNcblByaXNtLmxhbmd1YWdlcy5zd2lmdCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQnc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC8oXCJ8JykoXFxcXCg/OlxcKCg/OlteKCldfFxcKFteKV0rXFwpKStcXCl8XFxyXFxufFtcXHNcXFNdKXwoPyFcXDEpW15cXFxcXFxyXFxuXSkqXFwxLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdpbnRlcnBvbGF0aW9uJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvXFxcXFxcKCg/OlteKCldfFxcKFteKV0rXFwpKStcXCkvLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRkZWxpbWl0ZXI6IHtcblx0XHRcdFx0XHRcdHBhdHRlcm46IC9eXFxcXFxcKHxcXCkkLyxcblx0XHRcdFx0XHRcdGFsaWFzOiAndmFyaWFibGUnXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIFNlZSByZXN0IGJlbG93XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdCdrZXl3b3JkJzogL1xcYihhc3xhc3NvY2lhdGl2aXR5fGJyZWFrfGNhc2V8Y2F0Y2h8Y2xhc3N8Y29udGludWV8Y29udmVuaWVuY2V8ZGVmYXVsdHxkZWZlcnxkZWluaXR8ZGlkU2V0fGRvfGR5bmFtaWMoPzpUeXBlKT98ZWxzZXxlbnVtfGV4dGVuc2lvbnxmYWxsdGhyb3VnaHxmaW5hbHxmb3J8ZnVuY3xnZXR8Z3VhcmR8aWZ8aW1wb3J0fGlufGluZml4fGluaXR8aW5vdXR8aW50ZXJuYWx8aXN8bGF6eXxsZWZ0fGxldHxtdXRhdGluZ3xuZXd8bm9uZXxub25tdXRhdGluZ3xvcGVyYXRvcnxvcHRpb25hbHxvdmVycmlkZXxwb3N0Zml4fHByZWNlZGVuY2V8cHJlZml4fHByaXZhdGV8UHJvdG9jb2x8cHVibGljfHJlcGVhdHxyZXF1aXJlZHxyZXRocm93c3xyZXR1cm58cmlnaHR8c2FmZXxzZWxmfFNlbGZ8c2V0fHN0YXRpY3xzdHJ1Y3R8c3Vic2NyaXB0fHN1cGVyfHN3aXRjaHx0aHJvd3M/fHRyeXxUeXBlfHR5cGVhbGlhc3x1bm93bmVkfHVuc2FmZXx2YXJ8d2Vha3x3aGVyZXx3aGlsZXx3aWxsU2V0fF9fKD86Q09MVU1OX198RklMRV9ffEZVTkNUSU9OX198TElORV9fKSlcXGIvLFxuXHQnbnVtYmVyJzogL1xcYihbXFxkX10rKFxcLltcXGRlX10rKT98MHhbYS1mMC05X10rKFxcLlthLWYwLTlwX10rKT98MGJbMDFfXSt8MG9bMC03X10rKVxcYi9pLFxuXHQnY29uc3RhbnQnOiAvXFxiKG5pbHxbQS1aX117Mix9fGtbQS1aXVtBLVphLXpfXSspXFxiLyxcblx0J2F0cnVsZSc6IC9AXFxiKElCKD86T3V0bGV0fERlc2lnbmFibGV8QWN0aW9ufEluc3BlY3RhYmxlKXxjbGFzc19wcm90b2NvbHxleHBvcnRlZHxub3JldHVybnxOUyg/OkNvcHlpbmd8TWFuYWdlZCl8b2JqY3xVSUFwcGxpY2F0aW9uTWFpbnxhdXRvX2Nsb3N1cmUpXFxiLyxcblx0J2J1aWx0aW4nOiAvXFxiKFtBLVpdXFxTK3xhYnN8YWR2YW5jZXxhbGlnbm9mKD86VmFsdWUpP3xhc3NlcnR8Y29udGFpbnN8Y291bnQoPzpFbGVtZW50cyk/fGRlYnVnUHJpbnQoPzpsbik/fGRpc3RhbmNlfGRyb3AoPzpGaXJzdHxMYXN0KXxkdW1wfGVudW1lcmF0ZXxlcXVhbHxmaWx0ZXJ8ZmluZHxmaXJzdHxnZXRWYUxpc3R8aW5kaWNlc3xpc0VtcHR5fGpvaW58bGFzdHxsZXhpY29ncmFwaGljYWxDb21wYXJlfG1hcHxtYXgoPzpFbGVtZW50KT98bWluKD86RWxlbWVudCk/fG51bWVyaWNDYXN0fG92ZXJsYXBzfHBhcnRpdGlvbnxwcmludCg/OmxuKT98cmVkdWNlfHJlZmxlY3R8cmV2ZXJzZXxzaXplb2YoPzpWYWx1ZSk/fHNvcnQoPzplZCk/fHNwbGl0fHN0YXJ0c1dpdGh8c3RyaWRlKD86b2YoPzpWYWx1ZSk/KT98c3VmZml4fHN3YXB8dG9EZWJ1Z1N0cmluZ3x0b1N0cmluZ3x0cmFuc2NvZGV8dW5kZXJlc3RpbWF0ZUNvdW50fHVuc2FmZUJpdENhc3R8d2l0aCg/OkV4dGVuZGVkTGlmZXRpbWV8VW5zYWZlKD86TXV0YWJsZVBvaW50ZXJzP3xQb2ludGVycz8pfFZhTGlzdCkpXFxiL1xufSk7XG5QcmlzbS5sYW5ndWFnZXMuc3dpZnRbJ3N0cmluZyddLmluc2lkZVsnaW50ZXJwb2xhdGlvbiddLmluc2lkZS5yZXN0ID0gUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMuc3dpZnQpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXN0eWx1cy5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4oZnVuY3Rpb24gKFByaXNtKSB7XG5cdHZhciBpbnNpZGUgPSB7XG5cdFx0J3VybCc6IC91cmxcXCgoW1wiJ10/KS4qP1xcMVxcKS9pLFxuXHRcdCdzdHJpbmcnOiAvKFwifCcpKD86W15cXFxcXFxyXFxuXXxcXFxcKD86XFxyXFxufFtcXHNcXFNdKSkqP1xcMS8sXG5cdFx0J2ludGVycG9sYXRpb24nOiBudWxsLCAvLyBTZWUgYmVsb3dcblx0XHQnZnVuYyc6IG51bGwsIC8vIFNlZSBiZWxvd1xuXHRcdCdpbXBvcnRhbnQnOiAvXFxCISg/OmltcG9ydGFudHxvcHRpb25hbClcXGIvaSxcblx0XHQna2V5d29yZCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXnxcXHMrKSg/Oig/OmlmfGVsc2V8Zm9yfHJldHVybnx1bmxlc3MpKD89XFxzK3wkKXxAW1xcdy1dKykvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0J2hleGNvZGUnOiAvI1tcXGRhLWZdezMsNn0vaSxcblx0XHQnbnVtYmVyJzogL1xcYlxcZCsoPzpcXC5cXGQrKT8lPy8sXG5cdFx0J2Jvb2xlYW4nOiAvXFxiKD86dHJ1ZXxmYWxzZSlcXGIvLFxuXHRcdCdvcGVyYXRvcic6IFtcblx0XHRcdC8vIFdlIHdhbnQgbm9uLXdvcmQgY2hhcnMgYXJvdW5kIFwiLVwiIGJlY2F1c2UgaXQgaXNcblx0XHRcdC8vIGFjY2VwdGVkIGluIHByb3BlcnR5IG5hbWVzLlxuXHRcdFx0L358WyshXFwvJTw+Pz1dPT98Wy06XT18XFwqWyo9XT98XFwuK3wmJnxcXHxcXHx8XFxCLVxcQnxcXGIoPzphbmR8aW58aXMoPzogYXwgZGVmaW5lZHwgbm90fG50KT98bm90fG9yKVxcYi9cblx0XHRdLFxuXHRcdCdwdW5jdHVhdGlvbic6IC9be30oKVxcW1xcXTs6LF0vXG5cdH07XG5cblx0aW5zaWRlWydpbnRlcnBvbGF0aW9uJ10gPSB7XG5cdFx0cGF0dGVybjogL1xce1teXFxyXFxufTpdK1xcfS8sXG5cdFx0YWxpYXM6ICd2YXJpYWJsZScsXG5cdFx0aW5zaWRlOiBQcmlzbS51dGlsLmNsb25lKGluc2lkZSlcblx0fTtcblx0aW5zaWRlWydmdW5jJ10gPSB7XG5cdFx0cGF0dGVybjogL1tcXHctXStcXChbXildKlxcKS4qLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdmdW5jdGlvbic6IC9eW14oXSsvLFxuXHRcdFx0cmVzdDogUHJpc20udXRpbC5jbG9uZShpbnNpZGUpXG5cdFx0fVxuXHR9O1xuXG5cdFByaXNtLmxhbmd1YWdlcy5zdHlsdXMgPSB7XG5cdFx0J2NvbW1lbnQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkoXFwvXFwqW1xcd1xcV10qP1xcKlxcL3xcXC9cXC8uKikvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0J2F0cnVsZS1kZWNsYXJhdGlvbic6IHtcblx0XHRcdHBhdHRlcm46IC8oXlxccyopQC4rL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdhdHJ1bGUnOiAvXkBbXFx3LV0rLyxcblx0XHRcdFx0cmVzdDogaW5zaWRlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQndmFyaWFibGUtZGVjbGFyYXRpb24nOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF5bIFxcdF0qKVtcXHckLV0rXFxzKi4/PVsgXFx0XSooPzooPzpcXHtbXn1dKlxcfXwuKyl8JCkvbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J3ZhcmlhYmxlJzogL15cXFMrLyxcblx0XHRcdFx0cmVzdDogaW5zaWRlXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdCdzdGF0ZW1lbnQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF5bIFxcdF0qKSg/OmlmfGVsc2V8Zm9yfHJldHVybnx1bmxlc3MpWyBcXHRdKy4rL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdGtleXdvcmQ6IC9eXFxTKy8sXG5cdFx0XHRcdHJlc3Q6IGluc2lkZVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBBIHByb3BlcnR5L3ZhbHVlIHBhaXIgY2Fubm90IGVuZCB3aXRoIGEgY29tbWEgb3IgYSBicmFjZVxuXHRcdC8vIEl0IGNhbm5vdCBoYXZlIGluZGVudGVkIGNvbnRlbnQgdW5sZXNzIGl0IGVuZGVkIHdpdGggYSBzZW1pY29sb25cblx0XHQncHJvcGVydHktZGVjbGFyYXRpb24nOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKCg/Ol58XFx7KShbIFxcdF0qKSkoPzpbXFx3LV18XFx7W159XFxyXFxuXStcXH0pKyg/Olxccyo6XFxzKnxbIFxcdF0rKVtee1xcclxcbl0qKD86O3xbXntcXHJcXG4sXSg/PSQpKD8hKFxccj9cXG58XFxyKSg/Olxce3xcXDJbIFxcdF0rKSkpL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdwcm9wZXJ0eSc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXlteXFxzOl0rLyxcblx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdCdpbnRlcnBvbGF0aW9uJzogaW5zaWRlLmludGVycG9sYXRpb25cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlc3Q6IGluc2lkZVxuXHRcdFx0fVxuXHRcdH0sXG5cblxuXG5cdFx0Ly8gQSBzZWxlY3RvciBjYW4gY29udGFpbiBwYXJlbnRoZXNlcyBvbmx5IGFzIHBhcnQgb2YgYSBwc2V1ZG8tZWxlbWVudFxuXHRcdC8vIEl0IGNhbiBzcGFuIG11bHRpcGxlIGxpbmVzLlxuXHRcdC8vIEl0IG11c3QgZW5kIHdpdGggYSBjb21tYSBvciBhbiBhY2NvbGFkZSBvciBoYXZlIGluZGVudGVkIGNvbnRlbnQuXG5cdFx0J3NlbGVjdG9yJzoge1xuXHRcdFx0cGF0dGVybjogLyheWyBcXHRdKikoPzooPz1cXFMpKD86W157fVxcclxcbjooKV18Ojo/W1xcdy1dKyg/OlxcKFteKVxcclxcbl0qXFwpKT98XFx7W159XFxyXFxuXStcXH0pKykoPzooPzpcXHI/XFxufFxccikoPzpcXDEoPzooPz1cXFMpKD86W157fVxcclxcbjooKV18Ojo/W1xcdy1dKyg/OlxcKFteKVxcclxcbl0qXFwpKT98XFx7W159XFxyXFxuXStcXH0pKykpKSooPzosJHxcXHt8KD89KD86XFxyP1xcbnxcXHIpKD86XFx7fFxcMVsgXFx0XSspKSkvbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2ludGVycG9sYXRpb24nOiBpbnNpZGUuaW50ZXJwb2xhdGlvbixcblx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL1t7fSxdL1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQnZnVuYyc6IGluc2lkZS5mdW5jLFxuXHRcdCdzdHJpbmcnOiBpbnNpZGUuc3RyaW5nLFxuXHRcdCdpbnRlcnBvbGF0aW9uJzogaW5zaWRlLmludGVycG9sYXRpb24sXG5cdFx0J3B1bmN0dWF0aW9uJzogL1t7fSgpXFxbXFxdOzouXS9cblx0fTtcbn0oUHJpc20pKTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1zcWwuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnNxbD0geyBcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pKD86XFwvXFwqW1xcd1xcV10qP1xcKlxcL3woPzotLXxcXC9cXC98IykuKikvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J3N0cmluZycgOiB7XG5cdFx0cGF0dGVybjogLyhefFteQFxcXFxdKShcInwnKSg/OlxcXFw/W1xcc1xcU10pKj9cXDIvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J3ZhcmlhYmxlJzogL0BbXFx3LiRdK3xAKFwifCd8YCkoPzpcXFxcP1tcXHNcXFNdKSs/XFwxLyxcblx0J2Z1bmN0aW9uJzogL1xcYig/OkNPVU5UfFNVTXxBVkd8TUlOfE1BWHxGSVJTVHxMQVNUfFVDQVNFfExDQVNFfE1JRHxMRU58Uk9VTkR8Tk9XfEZPUk1BVCkoPz1cXHMqXFwoKS9pLCAvLyBTaG91bGQgd2UgaGlnaGxpZ2h0IHVzZXIgZGVmaW5lZCBmdW5jdGlvbnMgdG9vP1xuXHQna2V5d29yZCc6IC9cXGIoPzpBQ1RJT058QUREfEFGVEVSfEFMR09SSVRITXxBTEx8QUxURVJ8QU5BTFlaRXxBTll8QVBQTFl8QVN8QVNDfEFVVEhPUklaQVRJT058QkFDS1VQfEJEQnxCRUdJTnxCRVJLRUxFWURCfEJJR0lOVHxCSU5BUll8QklUfEJMT0J8Qk9PTHxCT09MRUFOfEJSRUFLfEJST1dTRXxCVFJFRXxCVUxLfEJZfENBTEx8Q0FTQ0FERUQ/fENBU0V8Q0hBSU58Q0hBUiBWQVJZSU5HfENIQVJBQ1RFUiAoPzpTRVR8VkFSWUlORyl8Q0hBUlNFVHxDSEVDS3xDSEVDS1BPSU5UfENMT1NFfENMVVNURVJFRHxDT0FMRVNDRXxDT0xMQVRFfENPTFVNTnxDT0xVTU5TfENPTU1FTlR8Q09NTUlUfENPTU1JVFRFRHxDT01QVVRFfENPTk5FQ1R8Q09OU0lTVEVOVHxDT05TVFJBSU5UfENPTlRBSU5TfENPTlRBSU5TVEFCTEV8Q09OVElOVUV8Q09OVkVSVHxDUkVBVEV8Q1JPU1N8Q1VSUkVOVCg/Ol9EQVRFfF9USU1FfF9USU1FU1RBTVB8X1VTRVIpP3xDVVJTT1J8REFUQSg/OkJBU0VTPyk/fERBVEVUSU1FfERCQ0N8REVBTExPQ0FURXxERUN8REVDSU1BTHxERUNMQVJFfERFRkFVTFR8REVGSU5FUnxERUxBWUVEfERFTEVURXxERU5ZfERFU0N8REVTQ1JJQkV8REVURVJNSU5JU1RJQ3xESVNBQkxFfERJU0NBUkR8RElTS3xESVNUSU5DVHxESVNUSU5DVFJPV3xESVNUUklCVVRFRHxET3xET1VCTEUoPzogUFJFQ0lTSU9OKT98RFJPUHxEVU1NWXxEVU1QKD86RklMRSk/fERVUExJQ0FURSBLRVl8RUxTRXxFTkFCTEV8RU5DTE9TRUQgQll8RU5EfEVOR0lORXxFTlVNfEVSUkxWTHxFUlJPUlN8RVNDQVBFKD86RCBCWSk/fEVYQ0VQVHxFWEVDKD86VVRFKT98RVhJU1RTfEVYSVR8RVhQTEFJTnxFWFRFTkRFRHxGRVRDSHxGSUVMRFN8RklMRXxGSUxMRkFDVE9SfEZJUlNUfEZJWEVEfEZMT0FUfEZPTExPV0lOR3xGT1IoPzogRUFDSCBST1cpP3xGT1JDRXxGT1JFSUdOfEZSRUVURVhUKD86VEFCTEUpP3xGUk9NfEZVTEx8RlVOQ1RJT058R0VPTUVUUlkoPzpDT0xMRUNUSU9OKT98R0xPQkFMfEdPVE98R1JBTlR8R1JPVVB8SEFORExFUnxIQVNIfEhBVklOR3xIT0xETE9DS3xJREVOVElUWSg/Ol9JTlNFUlR8Q09MKT98SUZ8SUdOT1JFfElNUE9SVHxJTkRFWHxJTkZJTEV8SU5ORVJ8SU5OT0RCfElOT1VUfElOU0VSVHxJTlR8SU5URUdFUnxJTlRFUlNFQ1R8SU5UT3xJTlZPS0VSfElTT0xBVElPTiBMRVZFTHxKT0lOfEtFWVM/fEtJTEx8TEFOR1VBR0UgU1FMfExBU1R8TEVGVHxMSU1JVHxMSU5FTk98TElORVN8TElORVNUUklOR3xMT0FEfExPQ0FMfExPQ0t8TE9ORyg/OkJMT0J8VEVYVCl8TUFUQ0goPzpFRCk/fE1FRElVTSg/OkJMT0J8SU5UfFRFWFQpfE1FUkdFfE1JRERMRUlOVHxNT0RJRklFUyBTUUwgREFUQXxNT0RJRll8TVVMVEkoPzpMSU5FU1RSSU5HfFBPSU5UfFBPTFlHT04pfE5BVElPTkFMKD86IENIQVIgVkFSWUlOR3wgQ0hBUkFDVEVSKD86IFZBUllJTkcpP3wgVkFSQ0hBUik/fE5BVFVSQUx8TkNIQVIoPzogVkFSQ0hBUik/fE5FWFR8Tk8oPzogU1FMfENIRUNLfENZQ0xFKT98Tk9OQ0xVU1RFUkVEfE5VTExJRnxOVU1FUklDfE9GRj98T0ZGU0VUUz98T058T1BFTig/OkRBVEFTT1VSQ0V8UVVFUll8Uk9XU0VUKT98T1BUSU1JWkV8T1BUSU9OKD86QUxMWSk/fE9SREVSfE9VVCg/OkVSfEZJTEUpP3xPVkVSfFBBUlRJQUx8UEFSVElUSU9OfFBFUkNFTlR8UElWT1R8UExBTnxQT0lOVHxQT0xZR09OfFBSRUNFRElOR3xQUkVDSVNJT058UFJFVnxQUklNQVJZfFBSSU5UfFBSSVZJTEVHRVN8UFJPQyg/OkVEVVJFKT98UFVCTElDfFBVUkdFfFFVSUNLfFJBSVNFUlJPUnxSRUFEKD86UyBTUUwgREFUQXxURVhUKT98UkVBTHxSRUNPTkZJR1VSRXxSRUZFUkVOQ0VTfFJFTEVBU0V8UkVOQU1FfFJFUEVBVEFCTEV8UkVQTElDQVRJT058UkVRVUlSRXxSRVNUT1JFfFJFU1RSSUNUfFJFVFVSTlM/fFJFVk9LRXxSSUdIVHxST0xMQkFDS3xST1VUSU5FfFJPVyg/OkNPVU5UfEdVSURDT0x8Uyk/fFJUUkVFfFJVTEV8U0FWRSg/OlBPSU5UKT98U0NIRU1BfFNFTEVDVHxTRVJJQUwoPzpJWkFCTEUpP3xTRVNTSU9OKD86X1VTRVIpP3xTRVQoPzpVU0VSKT98U0hBUkUgTU9ERXxTSE9XfFNIVVRET1dOfFNJTVBMRXxTTUFMTElOVHxTTkFQU0hPVHxTT01FfFNPTkFNRXxTVEFSVCg/OklORyBCWSk/fFNUQVRJU1RJQ1N8U1RBVFVTfFNUUklQRUR8U1lTVEVNX1VTRVJ8VEFCTEVTP3xUQUJMRVNQQUNFfFRFTVAoPzpPUkFSWXxUQUJMRSk/fFRFUk1JTkFURUQgQll8VEVYVCg/OlNJWkUpP3xUSEVOfFRJTUVTVEFNUHxUSU5ZKD86QkxPQnxJTlR8VEVYVCl8VE9QP3xUUkFOKD86U0FDVElPTlM/KT98VFJJR0dFUnxUUlVOQ0FURXxUU0VRVUFMfFRZUEVTP3xVTkJPVU5ERUR8VU5DT01NSVRURUR8VU5ERUZJTkVEfFVOSU9OfFVOSVFVRXxVTlBJVk9UfFVQREFURSg/OlRFWFQpP3xVU0FHRXxVU0V8VVNFUnxVU0lOR3xWQUxVRVM/fFZBUig/OkJJTkFSWXxDSEFSfENIQVJBQ1RFUnxZSU5HKXxWSUVXfFdBSVRGT1J8V0FSTklOR1N8V0hFTnxXSEVSRXxXSElMRXxXSVRIKD86IFJPTExVUHxJTik/fFdPUkt8V1JJVEUoPzpURVhUKT8pXFxiL2ksXG5cdCdib29sZWFuJzogL1xcYig/OlRSVUV8RkFMU0V8TlVMTClcXGIvaSxcblx0J251bWJlcic6IC9cXGItPyg/OjB4KT9cXGQqXFwuP1tcXGRhLWZdK1xcYi8sXG5cdCdvcGVyYXRvcic6IC9bLSsqXFwvPSVefl18JiY/fFxcfD9cXHx8IT0/fDwoPzo9Pj98PHw+KT98Pls+PV0/fFxcYig/OkFORHxCRVRXRUVOfElOfExJS0V8Tk9UfE9SfElTfERJVnxSRUdFWFB8UkxJS0V8U09VTkRTIExJS0V8WE9SKVxcYi9pLFxuXHQncHVuY3R1YXRpb24nOiAvWztbXFxdKClgLC5dL1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1zbWFydHkuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuLyogVE9ET1xuXHRBZGQgc3VwcG9ydCBmb3IgdmFyaWFibGVzIGluc2lkZSBkb3VibGUgcXVvdGVkIHN0cmluZ3Ncblx0QWRkIHN1cHBvcnQgZm9yIHtwaHB9XG4qL1xuXG4oZnVuY3Rpb24oUHJpc20pIHtcblxuXHR2YXIgc21hcnR5X3BhdHRlcm4gPSAvXFx7XFwqW1xcd1xcV10rP1xcKlxcfXxcXHtbXFx3XFxXXSs/XFx9L2c7XG5cdHZhciBzbWFydHlfbGl0dGVyYWxfc3RhcnQgPSAne2xpdGVyYWx9Jztcblx0dmFyIHNtYXJ0eV9saXR0ZXJhbF9lbmQgPSAney9saXRlcmFsfSc7XG5cdHZhciBzbWFydHlfbGl0dGVyYWxfbW9kZSA9IGZhbHNlO1xuXHRcblx0UHJpc20ubGFuZ3VhZ2VzLnNtYXJ0eSA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ21hcmt1cCcsIHtcblx0XHQnc21hcnR5Jzoge1xuXHRcdFx0cGF0dGVybjogc21hcnR5X3BhdHRlcm4sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2RlbGltaXRlcic6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxce3xcXH0kL2ksXG5cdFx0XHRcdFx0YWxpYXM6ICdwdW5jdHVhdGlvbidcblx0XHRcdFx0fSxcblx0XHRcdFx0J3N0cmluZyc6IC8oW1wiJ10pKD86XFxcXD8uKSo/XFwxLyxcblx0XHRcdFx0J251bWJlcic6IC9cXGItPyg/OjB4W1xcZEEtRmEtZl0rfFxcZCpcXC4/XFxkKyg/OltFZV1bLStdP1xcZCspPylcXGIvLFxuXHRcdFx0XHQndmFyaWFibGUnOiBbXG5cdFx0XHRcdFx0L1xcJCg/IVxcZClcXHcrLyxcblx0XHRcdFx0XHQvIyg/IVxcZClcXHcrIy8sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cGF0dGVybjogLyhcXC58LT4pKD8hXFxkKVxcdysvLFxuXHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cGF0dGVybjogLyhcXFspKD8hXFxkKVxcdysoPz1cXF0pLyxcblx0XHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdCdmdW5jdGlvbic6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvKFxcfFxccyopQD8oPyFcXGQpXFx3Ky8sXG5cdFx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvXlxcLz8oPyFcXGQpXFx3Ky8sXG5cdFx0XHRcdFx0Lyg/IVxcZClcXHcrKD89XFwoKS9cblx0XHRcdFx0XSxcblx0XHRcdFx0J2F0dHItbmFtZSc6IHtcblx0XHRcdFx0XHQvLyBWYWx1ZSBpcyBtYWRlIG9wdGlvbmFsIGJlY2F1c2UgaXQgbWF5IGhhdmUgYWxyZWFkeSBiZWVuIHRva2VuaXplZFxuXHRcdFx0XHRcdHBhdHRlcm46IC9cXHcrXFxzKj1cXHMqKD86KD8hXFxkKVxcdyspPy8sXG5cdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHRcInZhcmlhYmxlXCI6IHtcblx0XHRcdFx0XHRcdFx0cGF0dGVybjogLyg9XFxzKikoPyFcXGQpXFx3Ky8sXG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcIm9wZXJhdG9yXCI6IC89L1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0J3B1bmN0dWF0aW9uJzogW1xuXHRcdFx0XHRcdC9bXFxbXFxdKCkuLDpgXXxcXC0+L1xuXHRcdFx0XHRdLFxuXHRcdFx0XHQnb3BlcmF0b3InOiBbXG5cdFx0XHRcdFx0L1srXFwtKlxcLyVdfD09Pz0/fFshPD5dPT98JiZ8XFx8XFx8Py8sXG5cdFx0XHRcdFx0L1xcYmlzXFxzKyg/Om5vdFxccyspPyg/OmRpdnxldmVufG9kZCkoPzpcXHMrYnkpP1xcYi8sXG5cdFx0XHRcdFx0L1xcYig/OmVxfG5lcT98Z3R8bHR8Z3Q/ZXxsdD9lfG5vdHxtb2R8b3J8YW5kKVxcYi9cblx0XHRcdFx0XSxcblx0XHRcdFx0J2tleXdvcmQnOiAvXFxiKD86ZmFsc2V8b2ZmfG9ufG5vfHRydWV8eWVzKVxcYi9cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIENvbW1lbnRzIGFyZSBpbnNlcnRlZCBhdCB0b3Agc28gdGhhdCB0aGV5IGNhblxuXHQvLyBzdXJyb3VuZCBtYXJrdXBcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnc21hcnR5JywgJ3RhZycsIHtcblx0XHQnc21hcnR5LWNvbW1lbnQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvXFx7XFwqW1xcd1xcV10qP1xcKlxcfS8sXG5cdFx0XHRhbGlhczogWydzbWFydHknLCdjb21tZW50J11cblx0XHR9XG5cdH0pO1xuXG5cdC8vIFRva2VuaXplIGFsbCBpbmxpbmUgU21hcnR5IGV4cHJlc3Npb25zXG5cdFByaXNtLmhvb2tzLmFkZCgnYmVmb3JlLWhpZ2hsaWdodCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgIT09ICdzbWFydHknKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZW52LnRva2VuU3RhY2sgPSBbXTtcblxuXHRcdGVudi5iYWNrdXBDb2RlID0gZW52LmNvZGU7XG5cdFx0ZW52LmNvZGUgPSBlbnYuY29kZS5yZXBsYWNlKHNtYXJ0eV9wYXR0ZXJuLCBmdW5jdGlvbihtYXRjaCkge1xuXG5cdFx0XHQvLyBTbWFydHkgdGFncyBpbnNpZGUge2xpdGVyYWx9IGJsb2NrIGFyZSBpZ25vcmVkXG5cdFx0XHRpZihtYXRjaCA9PT0gc21hcnR5X2xpdHRlcmFsX2VuZCkge1xuXHRcdFx0XHRzbWFydHlfbGl0dGVyYWxfbW9kZSA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighc21hcnR5X2xpdHRlcmFsX21vZGUpIHtcblx0XHRcdFx0aWYobWF0Y2ggPT09IHNtYXJ0eV9saXR0ZXJhbF9zdGFydCkge1xuXHRcdFx0XHRcdHNtYXJ0eV9saXR0ZXJhbF9tb2RlID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbnYudG9rZW5TdGFjay5wdXNoKG1hdGNoKTtcblxuXHRcdFx0XHRyZXR1cm4gJ19fX1NNQVJUWScgKyBlbnYudG9rZW5TdGFjay5sZW5ndGggKyAnX19fJztcblx0XHRcdH1cblx0XHRcdHJldHVybiBtYXRjaDtcblx0XHR9KTtcblx0fSk7XG5cblx0Ly8gUmVzdG9yZSBlbnYuY29kZSBmb3Igb3RoZXIgcGx1Z2lucyAoZS5nLiBsaW5lLW51bWJlcnMpXG5cdFByaXNtLmhvb2tzLmFkZCgnYmVmb3JlLWluc2VydCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgPT09ICdzbWFydHknKSB7XG5cdFx0XHRlbnYuY29kZSA9IGVudi5iYWNrdXBDb2RlO1xuXHRcdFx0ZGVsZXRlIGVudi5iYWNrdXBDb2RlO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gUmUtaW5zZXJ0IHRoZSB0b2tlbnMgYWZ0ZXIgaGlnaGxpZ2h0aW5nXG5cdC8vIGFuZCBoaWdobGlnaHQgdGhlbSB3aXRoIGRlZmluZWQgZ3JhbW1hclxuXHRQcmlzbS5ob29rcy5hZGQoJ2FmdGVyLWhpZ2hsaWdodCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgIT09ICdzbWFydHknKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDAsIHQ7IHQgPSBlbnYudG9rZW5TdGFja1tpXTsgaSsrKSB7XG5cdFx0XHQvLyBUaGUgcmVwbGFjZSBwcmV2ZW50cyAkJCwgJCYsICRgLCAkJywgJG4sICRubiBmcm9tIGJlaW5nIGludGVycHJldGVkIGFzIHNwZWNpYWwgcGF0dGVybnNcblx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlLnJlcGxhY2UoJ19fX1NNQVJUWScgKyAoaSArIDEpICsgJ19fXycsIFByaXNtLmhpZ2hsaWdodCh0LCBlbnYuZ3JhbW1hciwgJ3NtYXJ0eScpLnJlcGxhY2UoL1xcJC9nLCAnJCQkJCcpKTtcblx0XHR9XG5cblx0XHRlbnYuZWxlbWVudC5pbm5lckhUTUwgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlO1xuXHR9KTtcblxufShQcmlzbSkpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXNtYWxsdGFsay5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuc21hbGx0YWxrID0ge1xuXHQnY29tbWVudCc6IC9cIig/OlwiXCJ8W15cIl0pK1wiLyxcblx0J3N0cmluZyc6IC8nKD86Jyd8W14nXSkrJy8sXG5cdCdzeW1ib2wnOiAvI1tcXGRhLXpdK3wjKD86LXwoWytcXC9cXFxcKn48Pj1AJXwmPyFdKVxcMT8pfCMoPz1cXCgpL2ksXG5cdCdibG9jay1hcmd1bWVudHMnOiB7XG5cdFx0cGF0dGVybjogLyhcXFtcXHMqKTpbXlxcW3xdKj9cXHwvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQndmFyaWFibGUnOiAvOltcXGRhLXpdKy9pLFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL1xcfC9cblx0XHR9XG5cdH0sXG5cdCd0ZW1wb3JhcnktdmFyaWFibGVzJzoge1xuXHRcdHBhdHRlcm46IC9cXHxbXnxdK1xcfC8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQndmFyaWFibGUnOiAvW1xcZGEtel0rL2ksXG5cdFx0XHQncHVuY3R1YXRpb24nOiAvXFx8L1xuXHRcdH1cblx0fSxcblx0J2tleXdvcmQnOiAvXFxiKD86bmlsfHRydWV8ZmFsc2V8c2VsZnxzdXBlcnxuZXcpXFxiLyxcblx0J2NoYXJhY3Rlcic6IHtcblx0XHRwYXR0ZXJuOiAvXFwkLi8sXG5cdFx0YWxpYXM6ICdzdHJpbmcnXG5cdH0sXG5cdCdudW1iZXInOiBbXG5cdFx0L1xcZCtyLT9bXFxkQS1aXSsoPzpcXC5bXFxkQS1aXSspPyg/OmUtP1xcZCspPy8sXG5cdFx0Lyg/OlxcQi18XFxiKVxcZCsoPzpcXC5cXGQrKT8oPzplLT9cXGQrKT8vXG5cdF0sXG5cdCdvcGVyYXRvcic6IC9bPD1dPT98Oj18flt+PV18XFwvXFwvP3xcXFxcXFxcXHw+Wz49XT98WyFeK1xcLSomfCxAXS8sXG5cdCdwdW5jdHVhdGlvbic6IC9bLjs6P1xcW1xcXSgpe31dL1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1zY2hlbWUuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnNjaGVtZSA9IHtcblx0J2NvbW1lbnQnIDogLzsuKi8sXG5cdCdzdHJpbmcnIDogIC9cIig/OlteXCJcXFxcXFxyXFxuXXxcXFxcLikqP1wifCdbXignXFxzXSovLFxuXHQna2V5d29yZCcgOiB7XG5cdFx0cGF0dGVybiA6IC8oXFwoKSg/OmRlZmluZSg/Oi1zeW50YXh8LWxpYnJhcnl8LXZhbHVlcyk/fCg/OmNhc2UtKT9sYW1iZGF8bGV0KD86XFwqfHJlYyk/KD86LXZhbHVlcyk/fGVsc2V8aWZ8Y29uZHxiZWdpbnxkZWxheSg/Oi1mb3JjZSk/fHBhcmFtZXRlcml6ZXxndWFyZHxzZXQhfCg/OnF1YXNpLSk/cXVvdGV8c3ludGF4LXJ1bGVzKS8sXG5cdFx0bG9va2JlaGluZCA6IHRydWVcblx0fSxcblx0J2J1aWx0aW4nIDoge1xuXHRcdHBhdHRlcm4gOiAgLyhcXCgpKD86KD86Y29uc3xjYXJ8Y2RyfGxpc3R8Y2FsbC13aXRoLWN1cnJlbnQtY29udGludWF0aW9ufGNhbGxcXC9jY3xhcHBlbmR8YWJzfGFwcGx5fGV2YWwpXFxifG51bGxcXD98cGFpclxcP3xib29sZWFuXFw/fGVvZi1vYmplY3RcXD98Y2hhclxcP3xwcm9jZWR1cmVcXD98bnVtYmVyXFw/fHBvcnRcXD98c3RyaW5nXFw/fHZlY3RvclxcP3xzeW1ib2xcXD98Ynl0ZXZlY3RvclxcPykvLFxuXHRcdGxvb2tiZWhpbmQgOiB0cnVlXG5cdH0sXG5cdCdudW1iZXInIDoge1xuXHRcdHBhdHRlcm46IC8oXFxzfFxcKSlbLStdP1swLTldKlxcLj9bMC05XSsoPzpcXHMqWy0rXVxccypbMC05XSpcXC4/WzAtOV0raSk/XFxiLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdib29sZWFuJyA6IC8jW3RmXS8sXG5cdCdvcGVyYXRvcic6IHtcblx0XHRwYXR0ZXJuOiAvKFxcKCkoPzpbLSsqJVxcL118Wzw+XT0/fD0+PykvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J2Z1bmN0aW9uJyA6IHtcblx0XHRwYXR0ZXJuIDogLyhcXCgpW15cXHMoKV0qKD89XFxzKS8sXG5cdFx0bG9va2JlaGluZCA6IHRydWVcblx0fSxcblx0J3B1bmN0dWF0aW9uJyA6IC9bKCldL1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1qYXZhLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5qYXZhID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhYnN0cmFjdHxjb250aW51ZXxmb3J8bmV3fHN3aXRjaHxhc3NlcnR8ZGVmYXVsdHxnb3RvfHBhY2thZ2V8c3luY2hyb25pemVkfGJvb2xlYW58ZG98aWZ8cHJpdmF0ZXx0aGlzfGJyZWFrfGRvdWJsZXxpbXBsZW1lbnRzfHByb3RlY3RlZHx0aHJvd3xieXRlfGVsc2V8aW1wb3J0fHB1YmxpY3x0aHJvd3N8Y2FzZXxlbnVtfGluc3RhbmNlb2Z8cmV0dXJufHRyYW5zaWVudHxjYXRjaHxleHRlbmRzfGludHxzaG9ydHx0cnl8Y2hhcnxmaW5hbHxpbnRlcmZhY2V8c3RhdGljfHZvaWR8Y2xhc3N8ZmluYWxseXxsb25nfHN0cmljdGZwfHZvbGF0aWxlfGNvbnN0fGZsb2F0fG5hdGl2ZXxzdXBlcnx3aGlsZSlcXGIvLFxuXHQnbnVtYmVyJzogL1xcYjBiWzAxXStcXGJ8XFxiMHhbXFxkYS1mXSpcXC4/W1xcZGEtZnBcXC1dK1xcYnxcXGJcXGQqXFwuP1xcZCsoPzplWystXT9cXGQrKT9bZGZdP1xcYi9pLFxuXHQnb3BlcmF0b3InOiB7XG5cdFx0cGF0dGVybjogLyhefFteLl0pKD86XFwrWys9XT98LVstPV0/fCE9P3w8PD89P3w+Pj8+Pz0/fD09P3wmWyY9XT98XFx8W3w9XT98XFwqPT98XFwvPT98JT0/fFxcXj0/fFs/On5dKS9tLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tc2NhbGEuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnNjYWxhID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnamF2YScsIHtcblx0J2tleXdvcmQnOiAvPC18PT58XFxiKD86YWJzdHJhY3R8Y2FzZXxjYXRjaHxjbGFzc3xkZWZ8ZG98ZWxzZXxleHRlbmRzfGZpbmFsfGZpbmFsbHl8Zm9yfGZvclNvbWV8aWZ8aW1wbGljaXR8aW1wb3J0fGxhenl8bWF0Y2h8bmV3fG51bGx8b2JqZWN0fG92ZXJyaWRlfHBhY2thZ2V8cHJpdmF0ZXxwcm90ZWN0ZWR8cmV0dXJufHNlYWxlZHxzZWxmfHN1cGVyfHRoaXN8dGhyb3d8dHJhaXR8dHJ5fHR5cGV8dmFsfHZhcnx3aGlsZXx3aXRofHlpZWxkKVxcYi8sXG5cdCdzdHJpbmcnOiAvXCJcIlwiW1xcV1xcd10qP1wiXCJcInxcIig/OlteXCJcXFxcXFxyXFxuXXxcXFxcLikqXCJ8Jyg/OlteXFxcXFxcclxcbiddfFxcXFwuW15cXFxcJ10qKScvLFxuXHQnYnVpbHRpbic6IC9cXGIoPzpTdHJpbmd8SW50fExvbmd8U2hvcnR8Qnl0ZXxCb29sZWFufERvdWJsZXxGbG9hdHxDaGFyfEFueXxBbnlSZWZ8QW55VmFsfFVuaXR8Tm90aGluZylcXGIvLFxuXHQnbnVtYmVyJzogL1xcYig/OjB4W1xcZGEtZl0qXFwuP1tcXGRhLWZdK3xcXGQqXFwuP1xcZCtlP1xcZCpbZGZsXT8pXFxiL2ksXG5cdCdzeW1ib2wnOiAvJ1teXFxkXFxzXFxcXF1cXHcqL1xufSk7XG5kZWxldGUgUHJpc20ubGFuZ3VhZ2VzLnNjYWxhWydjbGFzcy1uYW1lJ107XG5kZWxldGUgUHJpc20ubGFuZ3VhZ2VzLnNjYWxhWydmdW5jdGlvbiddO1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY3NzLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5jc3MgPSB7XG5cdCdjb21tZW50JzogL1xcL1xcKltcXHdcXFddKj9cXCpcXC8vLFxuXHQnYXRydWxlJzoge1xuXHRcdHBhdHRlcm46IC9AW1xcdy1dKz8uKj8oO3woPz1cXHMqXFx7KSkvaSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdydWxlJzogL0BbXFx3LV0rL1xuXHRcdFx0Ly8gU2VlIHJlc3QgYmVsb3dcblx0XHR9XG5cdH0sXG5cdCd1cmwnOiAvdXJsXFwoKD86KFtcIiddKShcXFxcKD86XFxyXFxufFtcXHdcXFddKXwoPyFcXDEpW15cXFxcXFxyXFxuXSkqXFwxfC4qPylcXCkvaSxcblx0J3NlbGVjdG9yJzogL1teXFx7XFx9XFxzXVteXFx7XFx9O10qPyg/PVxccypcXHspLyxcblx0J3N0cmluZyc6IC8oXCJ8JykoXFxcXCg/OlxcclxcbnxbXFx3XFxXXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMS8sXG5cdCdwcm9wZXJ0eSc6IC8oXFxifFxcQilbXFx3LV0rKD89XFxzKjopL2ksXG5cdCdpbXBvcnRhbnQnOiAvXFxCIWltcG9ydGFudFxcYi9pLFxuXHQnZnVuY3Rpb24nOiAvWy1hLXowLTldKyg/PVxcKCkvaSxcblx0J3B1bmN0dWF0aW9uJzogL1soKXt9OzpdL1xufTtcblxuUHJpc20ubGFuZ3VhZ2VzLmNzc1snYXRydWxlJ10uaW5zaWRlLnJlc3QgPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5jc3MpO1xuXG5pZiAoUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cCkge1xuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdtYXJrdXAnLCAndGFnJywge1xuXHRcdCdzdHlsZSc6IHtcblx0XHRcdHBhdHRlcm46IC88c3R5bGVbXFx3XFxXXSo/PltcXHdcXFddKj88XFwvc3R5bGU+L2ksXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J3RhZyc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvPHN0eWxlW1xcd1xcV10qPz58PFxcL3N0eWxlPi9pLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcuaW5zaWRlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5jc3Ncblx0XHRcdH0sXG5cdFx0XHRhbGlhczogJ2xhbmd1YWdlLWNzcydcblx0XHR9XG5cdH0pO1xuXHRcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnaW5zaWRlJywgJ2F0dHItdmFsdWUnLCB7XG5cdFx0J3N0eWxlLWF0dHInOiB7XG5cdFx0XHRwYXR0ZXJuOiAvXFxzKnN0eWxlPShcInwnKS4qP1xcMS9pLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdhdHRyLW5hbWUnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogL15cXHMqc3R5bGUvaSxcblx0XHRcdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAudGFnLmluc2lkZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXlxccyo9XFxzKlsnXCJdfFsnXCJdXFxzKiQvLFxuXHRcdFx0XHQnYXR0ci12YWx1ZSc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvLisvaSxcblx0XHRcdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5jc3Ncblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGFsaWFzOiAnbGFuZ3VhZ2UtY3NzJ1xuXHRcdH1cblx0fSwgUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcpO1xufVxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXNjc3MuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnNjc3MgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjc3MnLCB7XG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKSg/OlxcL1xcKltcXHdcXFddKj9cXCpcXC98XFwvXFwvLiopLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdhdHJ1bGUnOiB7XG5cdFx0cGF0dGVybjogL0BbXFx3LV0rKD86XFwoW14oKV0rXFwpfFteKF0pKj8oPz1cXHMrW3s7XSkvLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3J1bGUnOiAvQFtcXHctXSsvXG5cdFx0XHQvLyBTZWUgcmVzdCBiZWxvd1xuXHRcdH1cblx0fSxcblx0Ly8gdXJsLCBjb21wYXNzaWZpZWRcblx0J3VybCc6IC8oPzpbLWEtel0rLSkqdXJsKD89XFwoKS9pLFxuXHQvLyBDU1Mgc2VsZWN0b3IgcmVnZXggaXMgbm90IGFwcHJvcHJpYXRlIGZvciBTYXNzXG5cdC8vIHNpbmNlIHRoZXJlIGNhbiBiZSBsb3QgbW9yZSB0aGluZ3MgKHZhciwgQCBkaXJlY3RpdmUsIG5lc3RpbmcuLilcblx0Ly8gYSBzZWxlY3RvciBtdXN0IHN0YXJ0IGF0IHRoZSBlbmQgb2YgYSBwcm9wZXJ0eSBvciBhZnRlciBhIGJyYWNlIChlbmQgb2Ygb3RoZXIgcnVsZXMgb3IgbmVzdGluZylcblx0Ly8gaXQgY2FuIGNvbnRhaW4gc29tZSBjaGFyYWN0ZXJzIHRoYXQgYXJlbid0IHVzZWQgZm9yIGRlZmluaW5nIHJ1bGVzIG9yIGVuZCBvZiBzZWxlY3RvciwgJiAocGFyZW50IHNlbGVjdG9yKSwgb3IgaW50ZXJwb2xhdGVkIHZhcmlhYmxlXG5cdC8vIHRoZSBlbmQgb2YgYSBzZWxlY3RvciBpcyBmb3VuZCB3aGVuIHRoZXJlIGlzIG5vIHJ1bGVzIGluIGl0ICgge30gb3Ige1xcc30pIG9yIGlmIHRoZXJlIGlzIGEgcHJvcGVydHkgKGJlY2F1c2UgYW4gaW50ZXJwb2xhdGVkIHZhclxuXHQvLyBjYW4gXCJwYXNzXCIgYXMgYSBzZWxlY3Rvci0gZS5nOiBwcm9wZXIjeyRlcnR5fSlcblx0Ly8gdGhpcyBvbmUgd2FzIGhhcmQgdG8gZG8sIHNvIHBsZWFzZSBiZSBjYXJlZnVsIGlmIHlvdSBlZGl0IHRoaXMgb25lIDopXG5cdCdzZWxlY3Rvcic6IHtcblx0XHQvLyBJbml0aWFsIGxvb2stYWhlYWQgaXMgdXNlZCB0byBwcmV2ZW50IG1hdGNoaW5nIG9mIGJsYW5rIHNlbGVjdG9yc1xuXHRcdHBhdHRlcm46IC8oPz1cXFMpW15AO1xce1xcfVxcKFxcKV0/KFteQDtcXHtcXH1cXChcXCldfCZ8I1xce1xcJFstX1xcd10rXFx9KSsoPz1cXHMqXFx7KFxcfXxcXHN8W15cXH1dKyg6fFxceylbXlxcfV0rKSkvbSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdwbGFjZWhvbGRlcic6IC8lWy1fXFx3XSsvXG5cdFx0fVxuXHR9XG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnc2NzcycsICdhdHJ1bGUnLCB7XG5cdCdrZXl3b3JkJzogW1xuXHRcdC9AKD86aWZ8ZWxzZSg/OiBpZik/fGZvcnxlYWNofHdoaWxlfGltcG9ydHxleHRlbmR8ZGVidWd8d2FybnxtaXhpbnxpbmNsdWRlfGZ1bmN0aW9ufHJldHVybnxjb250ZW50KS9pLFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oICspKD86ZnJvbXx0aHJvdWdoKSg/PSApLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF1cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdzY3NzJywgJ3Byb3BlcnR5Jywge1xuXHQvLyB2YXIgYW5kIGludGVycG9sYXRlZCB2YXJzXG5cdCd2YXJpYWJsZSc6IC9cXCRbLV9cXHddK3wjXFx7XFwkWy1fXFx3XStcXH0vXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnc2NzcycsICdmdW5jdGlvbicsIHtcblx0J3BsYWNlaG9sZGVyJzoge1xuXHRcdHBhdHRlcm46IC8lWy1fXFx3XSsvLFxuXHRcdGFsaWFzOiAnc2VsZWN0b3InXG5cdH0sXG5cdCdzdGF0ZW1lbnQnOiAvXFxCISg/OmRlZmF1bHR8b3B0aW9uYWwpXFxiL2ksXG5cdCdib29sZWFuJzogL1xcYig/OnRydWV8ZmFsc2UpXFxiLyxcblx0J251bGwnOiAvXFxibnVsbFxcYi8sXG5cdCdvcGVyYXRvcic6IHtcblx0XHRwYXR0ZXJuOiAvKFxccykoPzpbLSsqXFwvJV18Wz0hXT18PD0/fD49P3xhbmR8b3J8bm90KSg/PVxccykvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5zY3NzWydhdHJ1bGUnXS5pbnNpZGUucmVzdCA9IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLnNjc3MpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXNhc3MuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuKGZ1bmN0aW9uKFByaXNtKSB7XG5cdFByaXNtLmxhbmd1YWdlcy5zYXNzID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY3NzJywge1xuXHRcdC8vIFNhc3MgY29tbWVudHMgZG9uJ3QgbmVlZCB0byBiZSBjbG9zZWQsIG9ubHkgaW5kZW50ZWRcblx0XHQnY29tbWVudCc6IHtcblx0XHRcdHBhdHRlcm46IC9eKFsgXFx0XSopXFwvW1xcLypdLiooPzooPzpcXHI/XFxufFxccilcXDFbIFxcdF0rLispKi9tLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0fSk7XG5cblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnc2FzcycsICdhdHJ1bGUnLCB7XG5cdFx0Ly8gV2Ugd2FudCB0byBjb25zdW1lIHRoZSB3aG9sZSBsaW5lXG5cdFx0J2F0cnVsZS1saW5lJzoge1xuXHRcdFx0Ly8gSW5jbHVkZXMgc3VwcG9ydCBmb3IgPSBhbmQgKyBzaG9ydGN1dHNcblx0XHRcdHBhdHRlcm46IC9eKD86WyBcXHRdKilbQCs9XS4rL20sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2F0cnVsZSc6IC8oPzpAW1xcdy1dK3xbKz1dKS9tXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0ZGVsZXRlIFByaXNtLmxhbmd1YWdlcy5zYXNzLmF0cnVsZTtcblxuXG5cdHZhciB2YXJpYWJsZSA9IC8oKFxcJFstX1xcd10rKXwoI1xce1xcJFstX1xcd10rXFx9KSkvaTtcblx0dmFyIG9wZXJhdG9yID0gW1xuXHRcdC9bKypcXC8lXXxbPSFdPXw8PT98Pj0/fFxcYig/OmFuZHxvcnxub3QpXFxiLyxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKFxccyspLSg/PVxccykvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0XTtcblxuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdzYXNzJywgJ3Byb3BlcnR5Jywge1xuXHRcdC8vIFdlIHdhbnQgdG8gY29uc3VtZSB0aGUgd2hvbGUgbGluZVxuXHRcdCd2YXJpYWJsZS1saW5lJzoge1xuXHRcdFx0cGF0dGVybjogL15bIFxcdF0qXFwkLisvbSxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvOi8sXG5cdFx0XHRcdCd2YXJpYWJsZSc6IHZhcmlhYmxlLFxuXHRcdFx0XHQnb3BlcmF0b3InOiBvcGVyYXRvclxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly8gV2Ugd2FudCB0byBjb25zdW1lIHRoZSB3aG9sZSBsaW5lXG5cdFx0J3Byb3BlcnR5LWxpbmUnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvXlsgXFx0XSooPzpbXjpcXHNdKyAqOi4qfDpbXjpcXHNdKy4qKS9tLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdwcm9wZXJ0eSc6IFtcblx0XHRcdFx0XHQvW146XFxzXSsoPz1cXHMqOikvLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHBhdHRlcm46IC8oOilbXjpcXHNdKy8sXG5cdFx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRdLFxuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvOi8sXG5cdFx0XHRcdCd2YXJpYWJsZSc6IHZhcmlhYmxlLFxuXHRcdFx0XHQnb3BlcmF0b3InOiBvcGVyYXRvcixcblx0XHRcdFx0J2ltcG9ydGFudCc6IFByaXNtLmxhbmd1YWdlcy5zYXNzLmltcG9ydGFudFxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdGRlbGV0ZSBQcmlzbS5sYW5ndWFnZXMuc2Fzcy5wcm9wZXJ0eTtcblx0ZGVsZXRlIFByaXNtLmxhbmd1YWdlcy5zYXNzLmltcG9ydGFudDtcblxuXHQvLyBOb3cgdGhhdCB3aG9sZSBsaW5lcyBmb3Igb3RoZXIgcGF0dGVybnMgYXJlIGNvbnN1bWVkLFxuXHQvLyB3aGF0J3MgbGVmdCBzaG91bGQgYmUgc2VsZWN0b3JzXG5cdGRlbGV0ZSBQcmlzbS5sYW5ndWFnZXMuc2Fzcy5zZWxlY3Rvcjtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnc2FzcycsICdwdW5jdHVhdGlvbicsIHtcblx0XHQnc2VsZWN0b3InOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKFsgXFx0XSopXFxTKD86LD9bXixcXHJcXG5dKykqKD86LCg/Olxccj9cXG58XFxyKVxcMVsgXFx0XStcXFMoPzosP1teLFxcclxcbl0rKSopKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHR9KTtcblxufShQcmlzbSkpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXNhcy5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuc2FzID0ge1xuXHQnZGF0YWxpbmVzJzoge1xuXHRcdHBhdHRlcm46IC9eXFxzKig/Oig/OmRhdGEpP2xpbmVzfGNhcmRzKTtbXFxzXFxTXSs/KD86XFxyP1xcbnxcXHIpOy9pbSxcblx0XHRhbGlhczogJ3N0cmluZycsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQna2V5d29yZCc6IHtcblx0XHRcdFx0cGF0dGVybjogL14oXFxzKikoPzooPzpkYXRhKT9saW5lc3xjYXJkcykvaSxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdCdwdW5jdHVhdGlvbic6IC87L1xuXHRcdH1cblx0fSxcblx0J2NvbW1lbnQnOiBbXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyheXFxzKnw7XFxzKilcXCouKjsvbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdC9cXC9cXCpbXFxzXFxTXSs/XFwqXFwvL1xuXHRdLFxuXHQnZGF0ZXRpbWUnOiB7XG5cdFx0Ly8gJzFqYW4yMDEzJ2QsICc5OjI1OjE5cG0ndCwgJzE4amFuMjAwMzo5OjI3OjA1YW0nZHRcblx0XHRwYXR0ZXJuOiAvJ1teJ10rJyg/OmR0P3x0KVxcYi9pLFxuXHRcdGFsaWFzOiAnbnVtYmVyJ1xuXHR9LFxuXHQnc3RyaW5nJzogLyhbXCInXSkoPzpcXDFcXDF8KD8hXFwxKVtcXHNcXFNdKSpcXDEvLFxuXHQna2V5d29yZCc6IC9cXGIoPzpkYXRhfGVsc2V8Zm9ybWF0fGlmfGlucHV0fHByb2N8cnVufHRoZW4pXFxiL2ksXG5cdC8vIERlY2ltYWwgKDEuMmUyMyksIGhleGFkZWNpbWFsICgwYzF4KVxuXHQnbnVtYmVyJzogLyg/OlxcQi18XFxiKSg/OltcXGRhLWZdK3h8XFxkKyg/OlxcLlxcZCspPyg/OmVbKy1dP1xcZCspPykvaSxcblx0J29wZXJhdG9yJzogL1xcKlxcKj98XFx8XFx8P3whIT98wqbCpj98PFs+PV0/fD5bPD1dP3xbLStcXC89Jl18W37CrF5dPT98XFxiKD86ZXF8bmV8Z3R8bHR8Z2V8bGV8aW58bm90KVxcYi9pLFxuXHQncHVuY3R1YXRpb24nOiAvWyQlQC4oKXt9XFxbXFxdOyxcXFxcXS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcnVzdC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKiBUT0RPXG5cdEFkZCBzdXBwb3J0IGZvciBNYXJrZG93biBub3RhdGlvbiBpbnNpZGUgZG9jIGNvbW1lbnRzXG5cdEFkZCBzdXBwb3J0IGZvciBuZXN0ZWQgYmxvY2sgY29tbWVudHMuLi5cblx0TWF0Y2ggY2xvc3VyZSBwYXJhbXMgZXZlbiB3aGVuIG5vdCBmb2xsb3dlZCBieSBkYXNoIG9yIGJyYWNlXG5cdEFkZCBiZXR0ZXIgc3VwcG9ydCBmb3IgbWFjcm8gZGVmaW5pdGlvblxuKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnJ1c3QgPSB7XG5cdCdjb21tZW50JzogW1xuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKVxcL1xcKltcXHdcXFddKj9cXCpcXC8vLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteXFxcXDpdKVxcL1xcLy4qLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF0sXG5cdCdzdHJpbmcnOiBbXG5cdFx0L2I/cigjKilcIig/OlxcXFw/LikqP1wiXFwxLyxcblx0XHQvYj8oXCJ8JykoPzpcXFxcPy4pKj9cXDEvXG5cdF0sXG5cdCdrZXl3b3JkJzogL1xcYig/OmFic3RyYWN0fGFsaWdub2Z8YXN8YmV8Ym94fGJyZWFrfGNvbnN0fGNvbnRpbnVlfGNyYXRlfGRvfGVsc2V8ZW51bXxleHRlcm58ZmFsc2V8ZmluYWx8Zm58Zm9yfGlmfGltcGx8aW58bGV0fGxvb3B8bWF0Y2h8bW9kfG1vdmV8bXV0fG9mZnNldG9mfG9uY2V8b3ZlcnJpZGV8cHJpdnxwdWJ8cHVyZXxyZWZ8cmV0dXJufHNpemVvZnxzdGF0aWN8c2VsZnxzdHJ1Y3R8c3VwZXJ8dHJ1ZXx0cmFpdHx0eXBlfHR5cGVvZnx1bnNhZmV8dW5zaXplZHx1c2V8dmlydHVhbHx3aGVyZXx3aGlsZXx5aWVsZClcXGIvLFxuXG5cdCdhdHRyaWJ1dGUnOiB7XG5cdFx0cGF0dGVybjogLyMhP1xcWy4rP1xcXS8sXG5cdFx0YWxpYXM6ICdhdHRyLW5hbWUnXG5cdH0sXG5cblx0J2Z1bmN0aW9uJzogW1xuXHRcdC9bYS16MC05X10rKD89XFxzKlxcKCkvaSxcblx0XHQvLyBNYWNyb3MgY2FuIHVzZSBwYXJlbnMgb3IgYnJhY2tldHNcblx0XHQvW2EtejAtOV9dKyEoPz1cXHMqXFwofFxcWykvaVxuXHRdLFxuXHQnbWFjcm8tcnVsZXMnOiB7XG5cdFx0cGF0dGVybjogL1thLXowLTlfXSshL2ksXG5cdFx0YWxpYXM6ICdmdW5jdGlvbidcblx0fSxcblxuXHQvLyBIZXgsIG9jdCwgYmluLCBkZWMgbnVtYmVycyB3aXRoIHZpc3VhbCBzZXBhcmF0b3JzIGFuZCB0eXBlIHN1ZmZpeFxuXHQnbnVtYmVyJzogL1xcYi0/KD86MHhbXFxkQS1GYS1mXSg/Ol8/W1xcZEEtRmEtZl0pKnwwb1swLTddKD86Xz9bMC03XSkqfDBiWzAxXSg/Ol8/WzAxXSkqfChcXGQoXz9cXGQpKik/XFwuP1xcZChfP1xcZCkqKFtFZV1bKy1dP1xcZCspPykoPzpfPyg/OltpdV0oPzo4fDE2fDMyfDY0KT98ZjMyfGY2NCkpP1xcYi8sXG5cblx0Ly8gQ2xvc3VyZSBwYXJhbXMgc2hvdWxkIG5vdCBiZSBjb25mdXNlZCB3aXRoIGJpdHdpc2UgT1IgfFxuXHQnY2xvc3VyZS1wYXJhbXMnOiB7XG5cdFx0cGF0dGVybjogL1xcfFtefF0qXFx8KD89XFxzKlt7LV0pLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdwdW5jdHVhdGlvbic6IC9bXFx8OixdLyxcblx0XHRcdCdvcGVyYXRvcic6IC9bJipdL1xuXHRcdH1cblx0fSxcblx0J3B1bmN0dWF0aW9uJzogL1t7fVtcXF07KCksOl18XFwuK3wtPi8sXG5cdCdvcGVyYXRvcic6IC9bLSsqXFwvJSFePV09P3xAfCZbJj1dP3xcXHxbfD1dP3w8PD89P3w+Pj89Py9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcnVieS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKipcbiAqIE9yaWdpbmFsIGJ5IFNhbXVlbCBGbG9yZXNcbiAqXG4gKiBBZGRzIHRoZSBmb2xsb3dpbmcgbmV3IHRva2VuIGNsYXNzZXM6XG4gKiBcdFx0Y29uc3RhbnQsIGJ1aWx0aW4sIHZhcmlhYmxlLCBzeW1ib2wsIHJlZ2V4XG4gKi9cbihmdW5jdGlvbihQcmlzbSkge1xuXHRQcmlzbS5sYW5ndWFnZXMucnVieSA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHRcdCdjb21tZW50JzogLyMoPyFcXHtbXlxcclxcbl0qP1xcfSkuKi8sXG5cdFx0J2tleXdvcmQnOiAvXFxiKGFsaWFzfGFuZHxCRUdJTnxiZWdpbnxicmVha3xjYXNlfGNsYXNzfGRlZnxkZWZpbmVfbWV0aG9kfGRlZmluZWR8ZG98ZWFjaHxlbHNlfGVsc2lmfEVORHxlbmR8ZW5zdXJlfGZhbHNlfGZvcnxpZnxpbnxtb2R1bGV8bmV3fG5leHR8bmlsfG5vdHxvcnxyYWlzZXxyZWRvfHJlcXVpcmV8cmVzY3VlfHJldHJ5fHJldHVybnxzZWxmfHN1cGVyfHRoZW58dGhyb3d8dHJ1ZXx1bmRlZnx1bmxlc3N8dW50aWx8d2hlbnx3aGlsZXx5aWVsZClcXGIvXG5cdH0pO1xuXG5cdHZhciBpbnRlcnBvbGF0aW9uID0ge1xuXHRcdHBhdHRlcm46IC8jXFx7W159XStcXH0vLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2RlbGltaXRlcic6IHtcblx0XHRcdFx0cGF0dGVybjogL14jXFx7fFxcfSQvLFxuXHRcdFx0XHRhbGlhczogJ3RhZydcblx0XHRcdH0sXG5cdFx0XHRyZXN0OiBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5ydWJ5KVxuXHRcdH1cblx0fTtcblxuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdydWJ5JywgJ2tleXdvcmQnLCB7XG5cdFx0J3JlZ2V4JzogW1xuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvJXIoW15hLXpBLVowLTlcXHNcXHtcXChcXFs8XSkoPzpbXlxcXFxdfFxcXFxbXFxzXFxTXSkqP1xcMVtnaW1dezAsM30vLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnaW50ZXJwb2xhdGlvbic6IGludGVycG9sYXRpb25cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogLyVyXFwoKD86W14oKVxcXFxdfFxcXFxbXFxzXFxTXSkqXFwpW2dpbV17MCwzfS8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdpbnRlcnBvbGF0aW9uJzogaW50ZXJwb2xhdGlvblxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHQvLyBIZXJlIHdlIG5lZWQgdG8gc3BlY2lmaWNhbGx5IGFsbG93IGludGVycG9sYXRpb25cblx0XHRcdFx0cGF0dGVybjogLyVyXFx7KD86W14je31cXFxcXXwjKD86XFx7W159XStcXH0pP3xcXFxcW1xcc1xcU10pKlxcfVtnaW1dezAsM30vLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnaW50ZXJwb2xhdGlvbic6IGludGVycG9sYXRpb25cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogLyVyXFxbKD86W15cXFtcXF1cXFxcXXxcXFxcW1xcc1xcU10pKlxcXVtnaW1dezAsM30vLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnaW50ZXJwb2xhdGlvbic6IGludGVycG9sYXRpb25cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogLyVyPCg/OltePD5cXFxcXXxcXFxcW1xcc1xcU10pKj5bZ2ltXXswLDN9Lyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J2ludGVycG9sYXRpb24nOiBpbnRlcnBvbGF0aW9uXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHBhdHRlcm46IC8oXnxbXi9dKVxcLyg/IVxcLykoXFxbLis/XXxcXFxcLnxbXi9cXHJcXG5dKStcXC9bZ2ltXXswLDN9KD89XFxzKigkfFtcXHJcXG4sLjt9KV0pKS8sXG5cdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdH1cblx0XHRdLFxuXHRcdCd2YXJpYWJsZSc6IC9bQCRdK1thLXpBLVpfXVthLXpBLVpfMC05XSooPzpbPyFdfFxcYikvLFxuXHRcdCdzeW1ib2wnOiAvOlthLXpBLVpfXVthLXpBLVpfMC05XSooPzpbPyFdfFxcYikvXG5cdH0pO1xuXG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3J1YnknLCAnbnVtYmVyJywge1xuXHRcdCdidWlsdGluJzogL1xcYihBcnJheXxCaWdudW18QmluZGluZ3xDbGFzc3xDb250aW51YXRpb258RGlyfEV4Y2VwdGlvbnxGYWxzZUNsYXNzfEZpbGV8U3RhdHxGaWxlfEZpeG51bXxGbG9hZHxIYXNofEludGVnZXJ8SU98TWF0Y2hEYXRhfE1ldGhvZHxNb2R1bGV8TmlsQ2xhc3N8TnVtZXJpY3xPYmplY3R8UHJvY3xSYW5nZXxSZWdleHB8U3RyaW5nfFN0cnVjdHxUTVN8U3ltYm9sfFRocmVhZEdyb3VwfFRocmVhZHxUaW1lfFRydWVDbGFzcylcXGIvLFxuXHRcdCdjb25zdGFudCc6IC9cXGJbQS1aXVthLXpBLVpfMC05XSooPzpbPyFdfFxcYikvXG5cdH0pO1xuXG5cdFByaXNtLmxhbmd1YWdlcy5ydWJ5LnN0cmluZyA9IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvJVtxUWlJd1d4c10/KFteYS16QS1aMC05XFxzXFx7XFwoXFxbPF0pKD86W15cXFxcXXxcXFxcW1xcc1xcU10pKj9cXDEvLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdpbnRlcnBvbGF0aW9uJzogaW50ZXJwb2xhdGlvblxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyVbcVFpSXdXeHNdP1xcKCg/OlteKClcXFxcXXxcXFxcW1xcc1xcU10pKlxcKS8sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2ludGVycG9sYXRpb24nOiBpbnRlcnBvbGF0aW9uXG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHQvLyBIZXJlIHdlIG5lZWQgdG8gc3BlY2lmaWNhbGx5IGFsbG93IGludGVycG9sYXRpb25cblx0XHRcdHBhdHRlcm46IC8lW3FRaUl3V3hzXT9cXHsoPzpbXiN7fVxcXFxdfCMoPzpcXHtbXn1dK1xcfSk/fFxcXFxbXFxzXFxTXSkqXFx9Lyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnaW50ZXJwb2xhdGlvbic6IGludGVycG9sYXRpb25cblx0XHRcdH1cblx0XHR9LFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8lW3FRaUl3V3hzXT9cXFsoPzpbXlxcW1xcXVxcXFxdfFxcXFxbXFxzXFxTXSkqXFxdLyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnaW50ZXJwb2xhdGlvbic6IGludGVycG9sYXRpb25cblx0XHRcdH1cblx0XHR9LFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8lW3FRaUl3V3hzXT88KD86W148PlxcXFxdfFxcXFxbXFxzXFxTXSkqPi8sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2ludGVycG9sYXRpb24nOiBpbnRlcnBvbGF0aW9uXG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKFwifCcpKCNcXHtbXn1dK1xcfXxcXFxcKD86XFxyP1xcbnxcXHIpfFxcXFw/LikqP1xcMS8sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2ludGVycG9sYXRpb24nOiBpbnRlcnBvbGF0aW9uXG5cdFx0XHR9XG5cdFx0fVxuXHRdO1xufShQcmlzbSkpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXJpcC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMucmlwID0ge1xuXHQnY29tbWVudCc6IC8jLiovLFxuXG5cdCdrZXl3b3JkJzogLyg/Oj0+fC0+KXxcXGIoPzpjbGFzc3xpZnxlbHNlfHN3aXRjaHxjYXNlfHJldHVybnxleGl0fHRyeXxjYXRjaHxmaW5hbGx5fHJhaXNlKVxcYi8sXG5cblx0J2J1aWx0aW4nOiAvQHxcXGJTeXN0ZW1cXGIvLFxuXG5cdCdib29sZWFuJzogL1xcYig/OnRydWV8ZmFsc2UpXFxiLyxcblxuXHQnZGF0ZSc6IC9cXGJcXGR7NH0tXFxkezJ9LVxcZHsyfVxcYi8sXG5cdCd0aW1lJzogL1xcYlxcZHsyfTpcXGR7Mn06XFxkezJ9XFxiLyxcblx0J2RhdGV0aW1lJzogL1xcYlxcZHs0fS1cXGR7Mn0tXFxkezJ9VFxcZHsyfTpcXGR7Mn06XFxkezJ9XFxiLyxcblxuXHQnY2hhcmFjdGVyJzogL1xcQmBbXlxcc2AnXCIsLjo7I1xcL1xcXFwoKTw+XFxbXFxde31dXFxiLyxcblxuXHQncmVnZXgnOiB7XG5cdFx0cGF0dGVybjogLyhefFteL10pXFwvKD8hXFwvKShcXFsuKz9dfFxcXFwufFteL1xcXFxcXHJcXG5dKStcXC8oPz1cXHMqKCR8W1xcclxcbiwuO30pXSkpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cblx0J3N5bWJvbCc6IC86W15cXGRcXHNgJ1wiLC46OyNcXC9cXFxcKCk8PlxcW1xcXXt9XVteXFxzYCdcIiwuOjsjXFwvXFxcXCgpPD5cXFtcXF17fV0qLyxcblx0J3N0cmluZyc6IC8oXCJ8JykoXFxcXD8uKSo/XFwxLyxcblx0J251bWJlcic6IC9bKy1dPyg/Oig/OlxcZCtcXC5cXGQrKXwoPzpcXGQrKSkvLFxuXG5cdCdwdW5jdHVhdGlvbic6IC8oPzpcXC57MiwzfSl8W2AsLjo7PVxcL1xcXFwoKTw+XFxbXFxde31dLyxcblxuXHQncmVmZXJlbmNlJzogL1teXFxkXFxzYCdcIiwuOjsjXFwvXFxcXCgpPD5cXFtcXF17fV1bXlxcc2AnXCIsLjo7I1xcL1xcXFwoKTw+XFxbXFxde31dKi9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1yZXN0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5yZXN0ID0ge1xuXHQndGFibGUnOiBbXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhcXHMqKSg/OlxcK1s9LV0rKStcXCsoPzpcXHI/XFxufFxccikoPzpcXDEoPzpbK3xdLispK1srfF0oPzpcXHI/XFxufFxccikpK1xcMSg/OlxcK1s9LV0rKStcXCsvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXFx8fCg/OlxcK1s9LV0rKStcXCsvXG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKFxccyopKD86PSsgKykrPSsoKD86XFxyP1xcbnxcXHIpXFwxLispKyg/Olxccj9cXG58XFxyKVxcMSg/Oj0rICspKz0rKD89KD86XFxyP1xcbnxcXHIpezJ9fFxccyokKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bPS1dKy9cblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cblx0Ly8gRGlyZWN0aXZlLWxpa2UgcGF0dGVybnNcblxuXHQnc3Vic3RpdHV0aW9uLWRlZic6IHtcblx0XHRwYXR0ZXJuOiAvKF5cXHMqXFwuXFwuIClcXHwoPzpbXnxcXHNdKD86W158XSpbXnxcXHNdKT8pXFx8IFteOl0rOjovbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3N1YnN0aXR1dGlvbic6IHtcblx0XHRcdFx0cGF0dGVybjogL15cXHwoPzpbXnxcXHNdfFtefFxcc11bXnxdKltefFxcc10pXFx8Lyxcblx0XHRcdFx0YWxpYXM6ICdhdHRyLXZhbHVlJyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL15cXHx8XFx8JC9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdkaXJlY3RpdmUnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC8oICspW146XSs6Oi8sXG5cdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdGFsaWFzOiAnZnVuY3Rpb24nLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvOjokL1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQnbGluay10YXJnZXQnOiBbXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyheXFxzKlxcLlxcLiApXFxbW15cXF1dK1xcXS9tLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGFsaWFzOiAnc3RyaW5nJyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXlxcW3xcXF0kL1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyheXFxzKlxcLlxcLiApXyg/OmBbXmBdK2B8KD86W146XFxcXF18XFxcXC4pKyk6L20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0YWxpYXM6ICdzdHJpbmcnLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eX3w6JC9cblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdCdkaXJlY3RpdmUnOiB7XG5cdFx0cGF0dGVybjogLyheXFxzKlxcLlxcLiApW146XSs6Oi9tLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICdmdW5jdGlvbicsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQncHVuY3R1YXRpb24nOiAvOjokL1xuXHRcdH1cblx0fSxcblx0J2NvbW1lbnQnOiB7XG5cdFx0Ly8gVGhlIHR3byBhbHRlcm5hdGl2ZXMgdHJ5IHRvIHByZXZlbnQgaGlnaGxpZ2h0aW5nIG9mIGJsYW5rIGNvbW1lbnRzXG5cdFx0cGF0dGVybjogLyheXFxzKlxcLlxcLikoPzooPzogLispPyg/Oig/Olxccj9cXG58XFxyKS4rKSt8IC4rKSg/PSg/Olxccj9cXG58XFxyKXsyfXwkKS9tLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblxuXHQndGl0bGUnOiBbXG5cdFx0Ly8gT3ZlcmxpbmVkIGFuZCB1bmRlcmxpbmVkXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogL14oKFshXCIjJCUmJygpKissXFwtLlxcLzo7PD0+P0BcXFtcXFxcXFxdXl9ge3x9fl0pXFwyKykoPzpcXHI/XFxufFxccikuKyg/Olxccj9cXG58XFxyKVxcMSQvbSxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXlshXCIjJCUmJygpKissXFwtLlxcLzo7PD0+P0BcXFtcXFxcXFxdXl9ge3x9fl0rfFshXCIjJCUmJygpKissXFwtLlxcLzo7PD0+P0BcXFtcXFxcXFxdXl9ge3x9fl0rJC8sXG5cdFx0XHRcdCdpbXBvcnRhbnQnOiAvLisvXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vIFVuZGVybGluZWQgb25seVxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnwoPzpcXHI/XFxufFxccil7Mn0pLisoPzpcXHI/XFxufFxccikoWyFcIiMkJSYnKCkqKyxcXC0uXFwvOjs8PT4/QFxcW1xcXFxcXF1eX2B7fH1+XSlcXDIrKD89XFxyP1xcbnxcXHJ8JCkvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvWyFcIiMkJSYnKCkqKyxcXC0uXFwvOjs8PT4/QFxcW1xcXFxcXF1eX2B7fH1+XSskLyxcblx0XHRcdFx0J2ltcG9ydGFudCc6IC8uKy9cblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdCdocic6IHtcblx0XHRwYXR0ZXJuOiAvKCg/Olxccj9cXG58XFxyKXsyfSkoWyFcIiMkJSYnKCkqKyxcXC0uXFwvOjs8PT4/QFxcW1xcXFxcXF1eX2B7fH1+XSlcXDJ7Myx9KD89KD86XFxyP1xcbnxcXHIpezJ9KS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHR9LFxuXHQnZmllbGQnOiB7XG5cdFx0cGF0dGVybjogLyheXFxzKik6W146XFxyXFxuXSs6KD89ICkvbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnYXR0ci1uYW1lJ1xuXHR9LFxuXHQnY29tbWFuZC1saW5lLW9wdGlvbic6IHtcblx0XHRwYXR0ZXJuOiAvKF5cXHMqKSg/OlsrLV1bYS16XFxkXXwoPzpcXC1cXC18XFwvKVthLXpcXGQtXSspKD86WyA9XSg/OlthLXpdW2EtelxcZF8tXSp8PFtePD5dKz4pKT8oPzosICg/OlsrLV1bYS16XFxkXXwoPzpcXC1cXC18XFwvKVthLXpcXGQtXSspKD86WyA9XSg/OlthLXpdW2EtelxcZF8tXSp8PFtePD5dKz4pKT8pKig/PSg/Olxccj9cXG58XFxyKT8gezIsfVxcUykvaW0sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3N5bWJvbCdcblx0fSxcblx0J2xpdGVyYWwtYmxvY2snOiB7XG5cdFx0cGF0dGVybjogLzo6KD86XFxyP1xcbnxcXHIpezJ9KFsgXFx0XSspLisoPzooPzpcXHI/XFxufFxccilcXDEuKykqLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdsaXRlcmFsLWJsb2NrLXB1bmN0dWF0aW9uJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvXjo6Lyxcblx0XHRcdFx0YWxpYXM6ICdwdW5jdHVhdGlvbidcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdCdxdW90ZWQtbGl0ZXJhbC1ibG9jayc6IHtcblx0XHRwYXR0ZXJuOiAvOjooPzpcXHI/XFxufFxccil7Mn0oWyFcIiMkJSYnKCkqKyxcXC0uXFwvOjs8PT4/QFxcW1xcXFxcXF1eX2B7fH1+XSkuKig/Oig/Olxccj9cXG58XFxyKVxcMS4qKSovLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2xpdGVyYWwtYmxvY2stcHVuY3R1YXRpb24nOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9eKD86Ojp8KFshXCIjJCUmJygpKissXFwtLlxcLzo7PD0+P0BcXFtcXFxcXFxdXl9ge3x9fl0pXFwxKikvbSxcblx0XHRcdFx0YWxpYXM6ICdwdW5jdHVhdGlvbidcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdCdsaXN0LWJ1bGxldCc6IHtcblx0XHRwYXR0ZXJuOiAvKF5cXHMqKSg/OlsqK1xcLeKAouKAo+KBg118XFwoPyg/OlxcZCt8W2Etel18W2l2eGRjbG1dKylcXCl8KD86XFxkK3xbYS16XXxbaXZ4ZGNsbV0rKVxcLikoPz0gKS9pbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAncHVuY3R1YXRpb24nXG5cdH0sXG5cdCdkb2N0ZXN0LWJsb2NrJzoge1xuXHRcdHBhdHRlcm46IC8oXlxccyopPj4+IC4rKD86KD86XFxyP1xcbnxcXHIpLispKi9tLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQncHVuY3R1YXRpb24nOiAvXj4+Pi9cblx0XHR9XG5cdH0sXG5cblx0J2lubGluZSc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W1xcc1xcLTpcXC8nXCI8KFxcW3tdKSg/OjpbXjpdKzpgLio/YHxgLio/YDpbXjpdKzp8KFxcKlxcKj98YGA/fFxcfCkoPyFcXHMpLio/W15cXHNdXFwyKD89W1xcc1xcLS4sOjshP1xcXFxcXC8nXCIpXFxdfV18JCkpL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdib2xkJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC8oXlxcKlxcKikuKyg/PVxcKlxcKiQpLyxcblx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdpdGFsaWMnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogLyheXFwqKS4rKD89XFwqJCkvLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0J2lubGluZS1saXRlcmFsJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC8oXmBgKS4rKD89YGAkKS8sXG5cdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRhbGlhczogJ3N5bWJvbCdcblx0XHRcdFx0fSxcblx0XHRcdFx0J3JvbGUnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogL146W146XSs6fDpbXjpdKzokLyxcblx0XHRcdFx0XHRhbGlhczogJ2Z1bmN0aW9uJyxcblx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eOnw6JC9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdpbnRlcnByZXRlZC10ZXh0Jzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC8oXmApLisoPz1gJCkvLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdFx0YWxpYXM6ICdhdHRyLXZhbHVlJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQnc3Vic3RpdHV0aW9uJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC8oXlxcfCkuKyg/PVxcfCQpLyxcblx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRcdGFsaWFzOiAnYXR0ci12YWx1ZSdcblx0XHRcdFx0fSxcblx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL1xcKlxcKj98YGA/fFxcfC9cblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cblx0J2xpbmsnOiBbXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogL1xcW1teXFxdXStcXF1fKD89W1xcc1xcLS4sOjshP1xcXFxcXC8nXCIpXFxdfV18JCkvLFxuXHRcdFx0YWxpYXM6ICdzdHJpbmcnLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eXFxbfFxcXV8kL1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyg/OlxcYlthLXpcXGRdKD86W18uOitdP1thLXpcXGRdKykqXz9ffGBbXmBdK2BfP198X2BbXmBdK2ApKD89W1xcc1xcLS4sOjshP1xcXFxcXC8nXCIpXFxdfV18JCkvaSxcblx0XHRcdGFsaWFzOiAnc3RyaW5nJyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXl8/YHxgJHxgP18/XyQvXG5cdFx0XHR9XG5cdFx0fVxuXHRdLFxuXG5cdC8vIExpbmUgYmxvY2sgc3RhcnQsXG5cdC8vIHF1b3RlIGF0dHJpYnV0aW9uLFxuXHQvLyBleHBsaWNpdCBtYXJrdXAgc3RhcnQsXG5cdC8vIGFuZCBhbm9ueW1vdXMgaHlwZXJsaW5rIHRhcmdldCBzaG9ydGN1dCAoX18pXG5cdCdwdW5jdHVhdGlvbic6IHtcblx0XHRwYXR0ZXJuOiAvKF5cXHMqKSg/OlxcfCg/PSB8JCl8KD86LS0tP3zigJR8XFwuXFwufF9fKSg/PSApfFxcLlxcLiQpL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWpzeC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4oZnVuY3Rpb24oUHJpc20pIHtcblxudmFyIGphdmFzY3JpcHQgPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmpzeCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ21hcmt1cCcsIGphdmFzY3JpcHQpO1xuUHJpc20ubGFuZ3VhZ2VzLmpzeC50YWcucGF0dGVybj0gLzxcXC8/W1xcdzotXStcXHMqKD86XFxzK1tcXHc6LV0rKD86PSg/OihcInwnKShcXFxcP1tcXHdcXFddKSo/XFwxfFteXFxzJ1wiPj1dK3woXFx7W1xcd1xcV10qP1xcfSkpKT9cXHMqKSpcXC8/Pi9pO1xuXG5QcmlzbS5sYW5ndWFnZXMuanN4LnRhZy5pbnNpZGVbJ2F0dHItdmFsdWUnXS5wYXR0ZXJuID0gLz1bXlxce10oPzooJ3xcIilbXFx3XFxXXSo/KFxcMSl8W15cXHM+XSspL2k7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2luc2lkZScsICdhdHRyLXZhbHVlJyx7XG5cdCdzY3JpcHQnOiB7XG5cdFx0Ly8gQWxsb3cgZm9yIG9uZSBsZXZlbCBvZiBuZXN0aW5nXG5cdFx0cGF0dGVybjogLz0oXFx7KD86XFx7W159XSpcXH18W159XSkrXFx9KS9pLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2Z1bmN0aW9uJyA6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0LmZ1bmN0aW9uLFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL1s9e31bXFxdOygpLC46XS8sXG5cdFx0XHQna2V5d29yZCc6ICBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdC5rZXl3b3JkXG5cdFx0fSxcblx0XHQnYWxpYXMnOiAnbGFuZ3VhZ2UtamF2YXNjcmlwdCdcblx0fVxufSwgUHJpc20ubGFuZ3VhZ2VzLmpzeC50YWcpO1xuXG59KFByaXNtKSk7XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1yLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5yID0ge1xuXHQnY29tbWVudCc6IC8jLiovLFxuXHQnc3RyaW5nJzogLyhbJ1wiXSkoPzpcXFxcPy4pKj9cXDEvLFxuXHQncGVyY2VudC1vcGVyYXRvcic6IHtcblx0XHQvLyBJbmNsdWRlcyB1c2VyLWRlZmluZWQgb3BlcmF0b3JzXG5cdFx0Ly8gYW5kICUlLCAlKiUsICUvJSwgJWluJSwgJW8lLCAleCVcblx0XHRwYXR0ZXJuOiAvJVteJVxcc10qJS8sXG5cdFx0YWxpYXM6ICdvcGVyYXRvcidcblx0fSxcblx0J2Jvb2xlYW4nOiAvXFxiKD86VFJVRXxGQUxTRSlcXGIvLFxuXHQnZWxsaXBzaXMnOiAvXFwuXFwuKD86XFwufFxcZCspLyxcblx0J251bWJlcic6IFtcblx0XHQvXFxiKD86TmFOfEluZilcXGIvLFxuXHRcdC9cXGIoPzoweFtcXGRBLUZhLWZdKyg/OlxcLlxcZCopP3xcXGQqXFwuP1xcZCspKD86W0VlUHBdWystXT9cXGQrKT9baUxdP1xcYi9cblx0XSxcblx0J2tleXdvcmQnOiAvXFxiKD86aWZ8ZWxzZXxyZXBlYXR8d2hpbGV8ZnVuY3Rpb258Zm9yfGlufG5leHR8YnJlYWt8TlVMTHxOQXxOQV9pbnRlZ2VyX3xOQV9yZWFsX3xOQV9jb21wbGV4X3xOQV9jaGFyYWN0ZXJfKVxcYi8sXG5cdCdvcGVyYXRvcic6IC8tPj8+P3w8KD86PXw8Py0pP3xbPj0hXT0/fDo6P3wmJj98XFx8XFx8P3xbKypcXC9eJEB+XS8sXG5cdCdwdW5jdHVhdGlvbic6IC9bKCl7fVxcW1xcXSw7XS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcW9yZS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMucW9yZSA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQnY29tbWVudCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkoPzpcXC9cXCpbXFx3XFxXXSo/XFwqXFwvfCg/OlxcL1xcL3wjKS4qKS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQvLyBPdmVycmlkZGVuIHRvIGFsbG93IHVuZXNjYXBlZCBtdWx0aS1saW5lIHN0cmluZ3Ncblx0J3N0cmluZyc6IC8oXCJ8JykoXFxcXCg/OlxcclxcbnxbXFxzXFxTXSl8KD8hXFwxKVteXFxcXF0pKlxcMS8sXG5cdCd2YXJpYWJsZSc6IC9cXCQoPyFcXGQpXFx3K1xcYi8sXG5cdCdrZXl3b3JkJzogL1xcYig/OmFic3RyYWN0fGFueXxhc3NlcnR8YmluYXJ5fGJvb2x8Ym9vbGVhbnxicmVha3xieXRlfGNhc2V8Y2F0Y2h8Y2hhcnxjbGFzc3xjb2RlfGNvbnN0fGNvbnRpbnVlfGRhdGF8ZGVmYXVsdHxkb3xkb3VibGV8ZWxzZXxlbnVtfGV4dGVuZHN8ZmluYWx8ZmluYWxseXxmbG9hdHxmb3J8Z290b3xoYXNofGlmfGltcGxlbWVudHN8aW1wb3J0fGluaGVyaXRzfGluc3RhbmNlb2Z8aW50fGludGVyZmFjZXxsb25nfG15fG5hdGl2ZXxuZXd8bm90aGluZ3xudWxsfG9iamVjdHxvdXJ8b3dufHByaXZhdGV8cmVmZXJlbmNlfHJldGhyb3d8cmV0dXJufHNob3J0fHNvZnQoPzppbnR8ZmxvYXR8bnVtYmVyfGJvb2x8c3RyaW5nfGRhdGV8bGlzdCl8c3RhdGljfHN0cmljdGZwfHN0cmluZ3xzdWJ8c3VwZXJ8c3dpdGNofHN5bmNocm9uaXplZHx0aGlzfHRocm93fHRocm93c3x0cmFuc2llbnR8dHJ5fHZvaWR8dm9sYXRpbGV8d2hpbGUpXFxiLyxcblx0J251bWJlcic6IC9cXGIoPzowYlswMV0rfDB4W1xcZGEtZl0qXFwuP1tcXGRhLWZwXFwtXSt8XFxkKlxcLj9cXGQrZT9cXGQqW2RmXXxcXGQqXFwuP1xcZCspXFxiL2ksXG5cdCdib29sZWFuJzogL1xcYig/OnRydWV8ZmFsc2UpXFxiL2ksXG5cdCdvcGVyYXRvcic6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15cXC5dKSg/OlxcK1srPV0/fC1bLT1dP3xbIT1dKD86PT0/fH4pP3w+Pj89P3w8KD86PT4/fDw9Pyk/fCZbJj1dP3xcXHxbfD1dP3xbKlxcLyVeXT0/fFt+P10pLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdmdW5jdGlvbic6IC9cXCQ/XFxiKD8hXFxkKVxcdysoPz1cXCgpL1xufSk7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMucSA9IHtcblx0J3N0cmluZyc6IC9cIig/OlxcXFwufFteXCJcXFxcXFxyXFxuXSkqXCIvLFxuXHQnY29tbWVudCc6IFtcblx0XHQvLyBGcm9tIGh0dHA6Ly9jb2RlLmt4LmNvbS93aWtpL1JlZmVyZW5jZS9TbGFzaDpcblx0XHQvLyBXaGVuIC8gaXMgZm9sbG93aW5nIGEgc3BhY2UgKG9yIGEgcmlnaHQgcGFyZW50aGVzaXMsIGJyYWNrZXQsIG9yIGJyYWNlKSwgaXQgaXMgaWdub3JlZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBsaW5lLlxuXHRcdHtcblxuXHRcdFx0cGF0dGVybjogLyhbXFx0IClcXF19XSlcXC8uKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQvLyBGcm9tIGh0dHA6Ly9jb2RlLmt4LmNvbS93aWtpL1JlZmVyZW5jZS9TbGFzaDpcblx0XHQvLyBBIGxpbmUgd2hpY2ggaGFzIC8gYXMgaXRzIGZpcnN0IGNoYXJhY3RlciBhbmQgY29udGFpbnMgYXQgbGVhc3Qgb25lIG90aGVyIG5vbi13aGl0ZXNwYWNlIGNoYXJhY3RlciBpcyBhIHdob2xlLWxpbmUgY29tbWVudCBhbmQgaXMgaWdub3JlZCBlbnRpcmVseS5cblx0XHQvLyBBIC8gb24gYSBsaW5lIGJ5IGl0c2VsZiBiZWdpbnMgYSBtdWx0aWxpbmUgY29tbWVudCB3aGljaCBpcyB0ZXJtaW5hdGVkIGJ5IHRoZSBuZXh0IFxcIG9uIGEgbGluZSBieSBpdHNlbGYuXG5cdFx0Ly8gSWYgYSAvIGlzIG5vdCBtYXRjaGVkIGJ5IGEgXFwsIHRoZSBtdWx0aWxpbmUgY29tbWVudCBpcyB1bnRlcm1pbmF0ZWQgYW5kIGNvbnRpbnVlcyB0byBlbmQgb2YgZmlsZS5cblx0XHQvLyBUaGUgLyBhbmQgXFwgbXVzdCBiZSB0aGUgZmlyc3QgY2hhciBvbiB0aGUgbGluZSwgYnV0IG1heSBiZSBmb2xsb3dlZCBieSBhbnkgYW1vdW50IG9mIHdoaXRlc3BhY2UuXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFxccj9cXG58XFxyKVxcL1tcXHQgXSooPzooPzpcXHI/XFxufFxccikoPzouKig/Olxccj9cXG58XFxyKSkqPyg/OlxcXFwoPz1bXFx0IF0qKD86XFxyP1xcbnxcXHIpKXwkKXxcXFMuKikvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Ly8gRnJvbSBodHRwOi8vY29kZS5reC5jb20vd2lraS9SZWZlcmVuY2UvU2xhc2g6XG5cdFx0Ly8gQSBcXCBvbiBhIGxpbmUgYnkgaXRzZWxmIHdpdGggbm8gcHJlY2VkaW5nIG1hdGNoaW5nIC8gd2lsbCBjb21tZW50IHRvIGVuZCBvZiBmaWxlLlxuXHRcdC9eXFxcXFtcXHQgXSooPzpcXHI/XFxufFxccilbXFxzXFxTXSsvbSxcblxuXHRcdC9eIyEuKy9tXG5cdF0sXG5cdCdzeW1ib2wnOiAvYCg/OjpcXFMrfFtcXHcuXSopLyxcblx0J2RhdGV0aW1lJzoge1xuXHRcdHBhdHRlcm46IC8wTlttZHp1dnRdfDBXW2R0el18XFxkezR9XFwuXFxkXFxkKD86bXxcXC5cXGRcXGQoPzpUKD86XFxkXFxkKD86OlxcZFxcZCg/OjpcXGRcXGQoPzpbLjpdXFxkXFxkXFxkKT8pPyk/KT8pP1tkel0/KXxcXGRcXGQ6XFxkXFxkKD86OlxcZFxcZCg/OlsuOl1cXGRcXGRcXGQpPyk/W3V2dF0/Lyxcblx0XHRhbGlhczogJ251bWJlcidcblx0fSxcblx0Ly8gVGhlIG5lZ2F0aXZlIGxvb2stYWhlYWQgcHJldmVudHMgYmFkIGhpZ2hsaWdodGluZ1xuXHQvLyBvZiB2ZXJicyAwOiBhbmQgMTpcblx0J251bWJlcic6IC9cXGItPyg/IVswMV06KSg/OjBbd25dfDBXW2hqXT98ME5baGplXT98MHhbXFxkYS1mQS1GXSt8XFxkK1xcLj9cXGQqKD86ZVsrLV0/XFxkKyk/W2hqZmViXT8pLyxcblx0J2tleXdvcmQnOiAvXFxcXFxcdytcXGJ8XFxiKD86YWJzfGFjb3N8YWowP3xhbGx8YW5kfGFueXxhc2N8YXNpbnxhc29mfGF0YW58YXR0cnxhdmdzP3xiaW5yP3xieXxjZWlsaW5nfGNvbHN8Y29yfGNvc3xjb3VudHxjb3Z8Y3Jvc3N8Y3N2fGN1dHxkZWxldGV8ZGVsdGFzfGRlc2N8ZGV2fGRpZmZlcnxkaXN0aW5jdHxkaXZ8ZG98ZHNhdmV8ZWp8ZW5saXN0fGV2YWx8ZXhjZXB0fGV4ZWN8ZXhpdHxleHB8ZmJ5fGZpbGxzfGZpcnN0fGZrZXlzfGZsaXB8Zmxvb3J8ZnJvbXxnZXR8Z2V0ZW52fGdyb3VwfGd0aW1lfGhjbG9zZXxoY291bnR8aGRlbHxob3Blbnxoc3ltfGlhc2N8aWRlbnRpdHl8aWRlc2N8aWZ8aWp8aW58aW5zZXJ0fGludGVyfGludnxrZXlzP3xsYXN0fGxpa2V8bGlzdHxsamY/fGxvYWR8bG9nfGxvd2VyfGxzcXxsdGltZXxsdHJpbXxtYXZnfG1heHM/fG1jb3VudHxtZDV8bWRldnxtZWR8bWV0YXxtaW5zP3xtbWF4fG1taW58bW11fG1vZHxtc3VtfG5lZ3xuZXh0fG5vdHxudWxsfG9yfG92ZXJ8cGFyc2V8cGVhY2h8cGp8cGxpc3R8cHJkcz98cHJldnxwcmlvcnxyYW5kfHJhbmt8cmF0aW9zfHJhemV8cmVhZDB8cmVhZDF8cmVjaXByb2NhbHxyZXZhbHxyZXZlcnNlfHJsb2FkfHJvdGF0ZXxyc2F2ZXxydHJpbXxzYXZlfHNjYW58c2NvdnxzZGV2fHNlbGVjdHxzZXR8c2V0ZW52fHNob3d8c2lnbnVtfHNpbnxzcXJ0fHNzcj98c3RyaW5nfHN1Ymxpc3R8c3Vtcz98c3Z8c3ZhcnxzeXN0ZW18dGFibGVzfHRhbnx0aWx8dHJpbXx0eGZ8dHlwZXx1anx1bmdyb3VwfHVuaW9ufHVwZGF0ZXx1cHBlcnx1cHNlcnR8dmFsdWV8dmFyfHZpZXdzP3x2c3x3YXZnfHdoZXJlfHdoaWxlfHdpdGhpbnx3ajE/fHdzdW18d3d8eGFzY3x4YmFyfHhjb2xzP3x4ZGVzY3x4ZXhwfHhncm91cHx4a2V5fHhsb2d8eHByZXZ8eHJhbmspXFxiLyxcblx0J2FkdmVyYic6IHtcblx0XHRwYXR0ZXJuOiAvWydcXC9cXFxcXTo/fFxcYmVhY2hcXGIvLFxuXHRcdGFsaWFzOiAnZnVuY3Rpb24nXG5cdH0sXG5cdCd2ZXJiJzoge1xuXHRcdHBhdHRlcm46IC8oPzpcXEJcXC5cXEJ8XFxiWzAxXTp8PFs9Pl0/fD49P3xbOitcXC0qJSwhP19+PXwkJiNAXl0pOj8vLFxuXHRcdGFsaWFzOiAnb3BlcmF0b3InXG5cdH0sXG5cdCdwdW5jdHVhdGlvbic6IC9bKCl7fVxcW1xcXTsuXS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcHl0aG9uLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5weXRob249IHtcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pIy4qLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdzdHJpbmcnOiAvXCJcIlwiW1xcc1xcU10rP1wiXCJcInwnJydbXFxzXFxTXSs/JycnfChcInwnKSg/OlxcXFw/LikqP1xcMS8sXG5cdCdmdW5jdGlvbicgOiB7XG5cdFx0cGF0dGVybjogLygoPzpefFxccylkZWZbIFxcdF0rKVthLXpBLVpfXVthLXpBLVowLTlfXSooPz1cXCgpL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnY2xhc3MtbmFtZSc6IHtcblx0XHRwYXR0ZXJuOiAvKFxcYmNsYXNzXFxzKylbYS16MC05X10rL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQna2V5d29yZCcgOiAvXFxiKD86YXN8YXNzZXJ0fGFzeW5jfGF3YWl0fGJyZWFrfGNsYXNzfGNvbnRpbnVlfGRlZnxkZWx8ZWxpZnxlbHNlfGV4Y2VwdHxleGVjfGZpbmFsbHl8Zm9yfGZyb218Z2xvYmFsfGlmfGltcG9ydHxpbnxpc3xsYW1iZGF8cGFzc3xwcmludHxyYWlzZXxyZXR1cm58dHJ5fHdoaWxlfHdpdGh8eWllbGQpXFxiLyxcblx0J2Jvb2xlYW4nIDogL1xcYig/OlRydWV8RmFsc2UpXFxiLyxcblx0J251bWJlcicgOiAvXFxiLT8oPzowW2JvXSk/KD86KD86XFxkfDB4W1xcZGEtZl0pW1xcZGEtZl0qXFwuP1xcZCp8XFwuXFxkKykoPzplWystXT9cXGQrKT9qP1xcYi9pLFxuXHQnb3BlcmF0b3InIDogL1stKyU9XT0/fCE9fFxcKlxcKj89P3xcXC9cXC8/PT98PFs8PT5dP3w+Wz0+XT98WyZ8Xn5dfFxcYig/Om9yfGFuZHxub3QpXFxiLyxcblx0J3B1bmN0dWF0aW9uJyA6IC9be31bXFxdOygpLC46XS9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1wdXJlLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbihmdW5jdGlvbiAoUHJpc20pIHtcblx0UHJpc20ubGFuZ3VhZ2VzLnB1cmUgPSB7XG5cdFx0J2lubGluZS1sYW5nJzoge1xuXHRcdFx0cGF0dGVybjogLyU8W1xcc1xcU10rPyU+Lyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnbGFuZyc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvKF4lPCAqKS1cXCotLis/LVxcKi0vLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdFx0YWxpYXM6ICdjb21tZW50J1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQnZGVsaW1pdGVyJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9eJTwuKnwlPiQvLFxuXHRcdFx0XHRcdGFsaWFzOiAncHVuY3R1YXRpb24nXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdCdjb21tZW50JzogW1xuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSlcXC9cXCpbXFx3XFxXXSo/XFwqXFwvLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogLyhefFteXFxcXDpdKVxcL1xcLy4qLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8jIS4rL1xuXHRcdF0sXG5cdFx0J3N0cmluZyc6IC9cIig/OlxcXFwufFteXCJcXFxcXFxyXFxuXSkqXCIvLFxuXHRcdCdudW1iZXInOiB7XG5cdFx0XHQvLyBUaGUgbG9vay1iZWhpbmQgcHJldmVudHMgd3JvbmcgaGlnaGxpZ2h0aW5nIG9mIHRoZSAuLiBvcGVyYXRvclxuXHRcdFx0cGF0dGVybjogLygoPzpcXC5cXC4pPykoPzpcXGIoPzppbmZ8bmFuKVxcYnxcXGIweFtcXGRhLWZdK3woPzpcXGIoPzowYik/XFxkKyg/OlxcLlxcZCk/fFxcQlxcLlxcZClcXGQqKD86ZVsrLV0/XFxkKyk/TD8pL2ksXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQna2V5d29yZCc6IC9cXGIoPzphbnN8YnJlYWt8YnR8Y2FzZXxjYXRjaHxjZHxjbGVhcnxjb25zdHxkZWZ8ZGVsfGR1bXB8ZWxzZXxlbmR8ZXhpdHxleHRlcm58ZmFsc2V8Zm9yY2V8aGVscHxpZnxpbmZpeFtscl0/fGludGVyZmFjZXxsZXR8bHN8bWVtfG5hbWVzcGFjZXxub25maXh8TlVMTHxvZnxvdGhlcndpc2V8b3V0Zml4fG92ZXJyaWRlfHBvc3RmaXh8cHJlZml4fHByaXZhdGV8cHVibGljfHB3ZHxxdWl0fHJ1bnxzYXZlfHNob3d8c3RhdHN8dGhlbnx0aHJvd3x0cmFjZXx0cnVlfHR5cGV8dW5kZXJyaWRlfHVzaW5nfHdoZW58d2l0aClcXGIvLFxuXHRcdCdmdW5jdGlvbic6IC9cXGIoPzphYnN8YWRkXyg/Oig/OmZ1bmRlZnxpbnRlcmZhY2V8bWFjZGVmfHR5cGVkZWYpKD86X2F0KT98YWRkcnxjb25zdGRlZnx2YXJkZWYpfGFsbHxhbnl8YXBwbHA/fGFyaXR5fGJpZ2ludHA/fGJsb2IoPzpfY3JjfF9zaXplfHApP3xib29scD98Ynl0ZV8oPzptYXRyaXh8cG9pbnRlcil8Ynl0ZV9jP3N0cmluZyg/Ol9wb2ludGVyKT98Y2FsbG9jfGNhdHxjYXRtYXB8Y2VpbHxjaGFyW3BzXT98Y2hlY2tfcHRydGFnfGNocnxjbGVhcl9zZW50cnl8Y2xlYXJzeW18Y2xvc3VyZXA/fGNtYXRyaXhwP3xjb2xzP3xjb2xjYXQoPzptYXApP3xjb2xtYXB8Y29scmV2fGNvbHZlY3Rvcig/OnB8c2VxKT98Y29tcGxleCg/Ol9mbG9hdF8oPzptYXRyaXh8cG9pbnRlcil8X21hdHJpeCg/Ol92aWV3KT98X3BvaW50ZXJ8cCk/fGNvbmp8Y29va2VkcD98Y3N0fGNzdHJpbmcoPzpfKD86ZHVwfGxpc3R8dmVjdG9yKSk/fGN1cnJ5Mz98Y3ljbGVuP3xkZWxfKD86Y29uc3RkZWZ8ZnVuZGVmfGludGVyZmFjZXxtYWNkZWZ8dHlwZWRlZnx2YXJkZWYpfGRlbGV0ZXxkaWFnKD86bWF0KT98ZGltfGRtYXRyaXhwP3xkb3xkb3VibGUoPzpfbWF0cml4KD86X3ZpZXcpP3xfcG9pbnRlcnxwKT98ZG93aXRoMz98ZHJvcHxkcm9wd2hpbGV8ZXZhbCg/OmNtZCk/fGV4YWN0cHxmaWx0ZXJ8Zml4fGZpeGl0eXxmbGlwfGZsb2F0KD86X21hdHJpeHxfcG9pbnRlcil8Zmxvb3J8Zm9sZFtscl0xP3xmcmFjfGZyZWV8ZnVucD98ZnVuY3Rpb25wP3xnY2R8Z2V0KD86Xyg/OmJ5dGV8Y29uc3RkZWZ8ZG91YmxlfGZsb2F0fGZ1bmRlZnxpbnQoPzo2NCk/fGludGVyZmFjZSg/Ol90eXBlZGVmKT98bG9uZ3xtYWNkZWZ8cG9pbnRlcnxwdHJ0YWd8c2hvcnR8c2VudHJ5fHN0cmluZ3x0eXBlZGVmfHZhcmRlZikpP3xnbG9ic3ltfGhhc2h8aGVhZHxpZHxpbXxpbWF0cml4cD98aW5kZXh8aW5leGFjdHB8aW5mcHxpbml0fGluc2VydHxpbnQoPzpfbWF0cml4KD86X3ZpZXcpP3xfcG9pbnRlcnxwKT98aW50NjRfKD86bWF0cml4fHBvaW50ZXIpfGludGVnZXJwP3xpdGVyYXRlbj98aXRlcndoaWxlfGpvaW58a2V5cz98bGFtYmRhcD98bGFzdCg/OmVycig/OnBvcyk/KT98bGNkfGxpc3RbMnBdP3xsaXN0bWFwfG1ha2VfcHRydGFnfG1hbGxvY3xtYXB8bWF0Y2F0fG1hdHJpeHA/fG1heHxtZW1iZXJ8bWlufG5hbnB8bmFyZ3N8bm1hdHJpeHA/fG51bGx8bnVtYmVycD98b3JkfHBhY2soPzplZCk/fHBvaW50ZXIoPzpfY2FzdHxfdGFnfF90eXBlfHApP3xwb3d8cHJlZHxwdHJ0YWd8cHV0KD86Xyg/OmJ5dGV8ZG91YmxlfGZsb2F0fGludCg/OjY0KT98bG9uZ3xwb2ludGVyfHNob3J0fHN0cmluZykpP3xyYXRpb25hbHA/fHJlfHJlYWxwP3xyZWFsbG9jfHJlY29yZHA/fHJlZGltfHJlZHVjZSg/Ol93aXRoKT98cmVmcD98cmVwZWF0bj98cmV2ZXJzZXxybGlzdHA/fHJvdW5kfHJvd3M/fHJvd2NhdCg/Om1hcCk/fHJvd21hcHxyb3dyZXZ8cm93dmVjdG9yKD86cHxzZXEpP3xzYW1lfHNjYW5bbHJdMT98c2VudHJ5fHNnbnxzaG9ydF8oPzptYXRyaXh8cG9pbnRlcil8c2xpY2V8c21hdHJpeHA/fHNvcnR8c3BsaXR8c3RyfHN0cmNhdHxzdHJlYW18c3RyaWRlfHN0cmluZyg/Ol8oPzpkdXB8bGlzdHx2ZWN0b3IpfHApP3xzdWJkaWFnKD86bWF0KT98c3VibWF0fHN1YnNlcTI/fHN1YnN0cnxzdWNjfHN1cGRpYWcoPzptYXQpP3xzeW1ib2xwP3x0YWlsfHRha2V8dGFrZXdoaWxlfHRodW5rcD98dHJhbnNwb3NlfHRydW5jfHR1cGxlcD98dHlwZXB8dWJ5dGV8dWludCg/OjY0KT98dWxvbmd8dW5jdXJyeTM/fHVucmVmfHVuemlwMz98dXBkYXRlfHVzaG9ydHx2YWxzP3x2YXJwP3x2ZWN0b3IoPzpwfHNlcSk/fHZvaWR8emlwMz98emlwd2l0aDM/KVxcYi8sXG5cdFx0J3NwZWNpYWwnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvXFxiX19bYS16XStfX1xcYi9pLFxuXHRcdFx0YWxpYXM6ICdidWlsdGluJ1xuXHRcdH0sXG5cdFx0Ly8gQW55IGNvbWJpbmF0aW9uIG9mIG9wZXJhdG9yIGNoYXJzIGNhbiBiZSBhbiBvcGVyYXRvclxuXHRcdCdvcGVyYXRvcic6IC8oPz1cXGJffFteX10pWyFcIiMkJSYnKissXFwtLlxcLzo8PT4/QFxcXFxeX2B8flxcdTAwYTEtXFx1MDBiZlxcdTAwZDctXFx1MDBmN1xcdTIwZDAtXFx1MmJmZl0rfFxcYig/OmFuZHxkaXZ8bW9kfG5vdHxvcilcXGIvLFxuXHRcdC8vIEZJWE1FOiBIb3cgY2FuIHdlIHByZXZlbnQgfCBhbmQgLCB0byBiZSBoaWdobGlnaHRlZCBhcyBvcGVyYXRvciB3aGVuIHRoZXkgYXJlIHVzZWQgYWxvbmU/XG5cdFx0J3B1bmN0dWF0aW9uJzogL1soKXt9XFxbXFxdOyx8XS9cblx0fTtcblxuXHR2YXIgaW5saW5lTGFuZ3VhZ2VzID0gW1xuXHRcdCdjJyxcblx0XHR7IGxhbmc6ICdjKysnLCBhbGlhczogJ2NwcCcgfSxcblx0XHQnZm9ydHJhbicsXG5cdFx0J2F0cycsXG5cdFx0J2RzcCdcblx0XTtcblx0dmFyIGlubGluZUxhbmd1YWdlUmUgPSAnJTwgKi1cXFxcKi0gKntsYW5nfVxcXFxkKiAqLVxcXFwqLVtcXFxcc1xcXFxTXSs/JT4nO1xuXG5cdGlubGluZUxhbmd1YWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChsYW5nKSB7XG5cdFx0dmFyIGFsaWFzID0gbGFuZztcblx0XHRpZiAodHlwZW9mIGxhbmcgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRhbGlhcyA9IGxhbmcuYWxpYXM7XG5cdFx0XHRsYW5nID0gbGFuZy5sYW5nO1xuXHRcdH1cblx0XHRpZiAoUHJpc20ubGFuZ3VhZ2VzW2FsaWFzXSkge1xuXHRcdFx0dmFyIG8gPSB7fTtcblx0XHRcdG9bJ2lubGluZS1sYW5nLScgKyBhbGlhc10gPSB7XG5cdFx0XHRcdHBhdHRlcm46IFJlZ0V4cChpbmxpbmVMYW5ndWFnZVJlLnJlcGxhY2UoJ3tsYW5nfScsIGxhbmcucmVwbGFjZSgvKFsuKyo/XFwvXFxcXCgpe31cXFtcXF1dKS9nLCdcXFxcJDEnKSksICdpJyksXG5cdFx0XHRcdGluc2lkZTogUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMucHVyZVsnaW5saW5lLWxhbmcnXS5pbnNpZGUpXG5cdFx0XHR9O1xuXHRcdFx0b1snaW5saW5lLWxhbmctJyArIGFsaWFzXS5pbnNpZGUucmVzdCA9IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzW2FsaWFzXSk7XG5cdFx0XHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdwdXJlJywgJ2lubGluZS1sYW5nJywgbyk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBDIGlzIHRoZSBkZWZhdWx0IGlubGluZSBsYW5ndWFnZVxuXHRpZiAoUHJpc20ubGFuZ3VhZ2VzLmMpIHtcblx0XHRQcmlzbS5sYW5ndWFnZXMucHVyZVsnaW5saW5lLWxhbmcnXS5pbnNpZGUucmVzdCA9IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLmMpO1xuXHR9XG5cbn0oUHJpc20pKTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1wcm9sb2cuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnByb2xvZyA9IHtcblx0Ly8gU3ludGF4IGRlcGVuZHMgb24gdGhlIGltcGxlbWVudGF0aW9uXG5cdCdjb21tZW50JzogW1xuXHRcdC8lLisvLFxuXHRcdC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL1xuXHRdLFxuXHQvLyBEZXBlbmRpbmcgb24gdGhlIGltcGxlbWVudGF0aW9uLCBzdHJpbmdzIG1heSBhbGxvdyBlc2NhcGVkIG5ld2xpbmVzIGFuZCBxdW90ZS1lc2NhcGVcblx0J3N0cmluZyc6IC8oW1wiJ10pKD86XFwxXFwxfFxcXFwoPzpcXHJcXG58W1xcc1xcU10pfCg/IVxcMSlbXlxcXFxcXHJcXG5dKSpcXDEvLFxuXHQnYnVpbHRpbic6IC9cXGIoPzpmeHxmeXx4Zlt4eV0/fHlmeD8pXFxiLyxcblx0J3ZhcmlhYmxlJzogL1xcYltBLVpfXVxcdyovLFxuXHQvLyBGSVhNRTogU2hvdWxkIHdlIGxpc3QgYWxsIG51bGwtYXJ5IHByZWRpY2F0ZXMgKG5vdCBmb2xsb3dlZCBieSBhIHBhcmVudGhlc2lzKSBsaWtlIGhhbHQsIHRyYWNlLCBldGMuP1xuXHQnZnVuY3Rpb24nOiAvXFxiW2Etel1cXHcqKD86KD89XFwoKXxcXC9cXGQrKS8sXG5cdCdudW1iZXInOiAvXFxiXFxkK1xcLj9cXGQqLyxcblx0Ly8gQ3VzdG9tIG9wZXJhdG9ycyBhcmUgYWxsb3dlZFxuXHQnb3BlcmF0b3InOiAvWzpcXFxcPT48XFwtPypAXFwvOytefCEkLl0rfFxcYig/OmlzfG1vZHxub3R8eG9yKVxcYi8sXG5cdCdwdW5jdHVhdGlvbic6IC9bKCl7fVxcW1xcXSxdL1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1wcm9jZXNzaW5nLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5wcm9jZXNzaW5nID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYig/OmJyZWFrfGNhdGNofGNhc2V8Y2xhc3N8Y29udGludWV8ZGVmYXVsdHxlbHNlfGV4dGVuZHN8ZmluYWx8Zm9yfGlmfGltcGxlbWVudHN8aW1wb3J0fG5ld3xudWxsfHByaXZhdGV8cHVibGljfHJldHVybnxzdGF0aWN8c3VwZXJ8c3dpdGNofHRoaXN8dHJ5fHZvaWR8d2hpbGUpXFxiLyxcblx0J29wZXJhdG9yJzogLzxbPD1dP3w+Wz49XT98JiY/fFxcfFxcfD98WyU/XXxbIT0rXFwtKlxcL109Py9cbn0pO1xuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgncHJvY2Vzc2luZycsICdudW1iZXInLCB7XG5cdC8vIFNwZWNpYWwgY2FzZTogWE1MIGlzIGEgdHlwZVxuXHQnY29uc3RhbnQnOiAvXFxiKD8hWE1MXFxiKVtBLVpdW0EtWlxcZF9dK1xcYi8sXG5cdCd0eXBlJzoge1xuXHRcdHBhdHRlcm46IC9cXGIoPzpib29sZWFufGJ5dGV8Y2hhcnxjb2xvcnxkb3VibGV8ZmxvYXR8aW50fFhNTHxbQS1aXVtBLVphLXpcXGRfXSopXFxiLyxcblx0XHRhbGlhczogJ3ZhcmlhYmxlJ1xuXHR9XG59KTtcblxuLy8gU3BhY2VzIGFyZSBhbGxvd2VkIGJldHdlZW4gZnVuY3Rpb24gbmFtZSBhbmQgcGFyZW50aGVzaXNcblByaXNtLmxhbmd1YWdlcy5wcm9jZXNzaW5nWydmdW5jdGlvbiddLnBhdHRlcm4gPSAvW2EtejAtOV9dKyg/PVxccypcXCgpL2k7XG5cbi8vIENsYXNzLW5hbWVzIGlzIG5vdCBzdHlsZWQgYnkgZGVmYXVsdFxuUHJpc20ubGFuZ3VhZ2VzLnByb2Nlc3NpbmdbJ2NsYXNzLW5hbWUnXS5hbGlhcyA9ICd2YXJpYWJsZSc7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcG93ZXJzaGVsbC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMucG93ZXJzaGVsbCA9IHtcblx0J2NvbW1lbnQnOiBbXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteYF0pPCNbXFx3XFxXXSo/Iz4vLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteYF0pIy4rLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF0sXG5cdCdzdHJpbmcnOiBbXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogL1wiKGA/W1xcd1xcV10pKj9cIi8sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2Z1bmN0aW9uJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9bXmBdXFwkXFwoLio/XFwpLyxcblx0XHRcdFx0XHQvLyBQb3B1bGF0ZWQgYXQgZW5kIG9mIGZpbGVcblx0XHRcdFx0XHRpbnNpZGU6IHt9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdC8nKFteJ118JycpKicvXG5cdF0sXG5cdC8vIE1hdGNoZXMgbmFtZSBzcGFjZXMgYXMgd2VsbCBhcyBjYXN0cywgYXR0cmlidXRlIGRlY29yYXRvcnMuIEZvcmNlIHN0YXJ0aW5nIHdpdGggbGV0dGVyIHRvIGF2b2lkIG1hdGNoaW5nIGFycmF5IGluZGljZXNcblx0J25hbWVzcGFjZSc6IC9cXFtbYS16XVtcXHdcXFddKj9cXF0vaSxcblx0J2Jvb2xlYW4nOiAvXFwkKHRydWV8ZmFsc2UpXFxiL2ksXG5cdCd2YXJpYWJsZSc6IC9cXCRcXHcrXFxiL2ksXG5cdC8vIENtZGxldHMgYW5kIGFsaWFzZXMuIEFsaWFzZXMgc2hvdWxkIGNvbWUgbGFzdCwgb3RoZXJ3aXNlIFwid3JpdGVcIiBnZXRzIHByZWZlcnJlZCBvdmVyIFwid3JpdGUtaG9zdFwiIGZvciBleGFtcGxlXG5cdC8vIEdldC1Db21tYW5kIHwgP3sgJF8uTW9kdWxlTmFtZSAtbWF0Y2ggXCJNaWNyb3NvZnQuUG93ZXJTaGVsbC4oVXRpbHxDb3JlfE1hbmFnZW1lbnQpXCIgfVxuXHQvLyBHZXQtQWxpYXMgfCA/eyAkXy5SZWZlcmVuY2VkQ29tbWFuZC5Nb2R1bGUuTmFtZSAtbWF0Y2ggXCJNaWNyb3NvZnQuUG93ZXJTaGVsbC4oVXRpbHxDb3JlfE1hbmFnZW1lbnQpXCIgfVxuXHQnZnVuY3Rpb24nOiBbXG5cdFx0L1xcYihBZGQtKENvbXB1dGVyfENvbnRlbnR8SGlzdG9yeXxNZW1iZXJ8UFNTbmFwaW58VHlwZSl8Q2hlY2twb2ludC1Db21wdXRlcnxDbGVhci0oQ29udGVudHxFdmVudExvZ3xIaXN0b3J5fEl0ZW18SXRlbVByb3BlcnR5fFZhcmlhYmxlKXxDb21wYXJlLU9iamVjdHxDb21wbGV0ZS1UcmFuc2FjdGlvbnxDb25uZWN0LVBTU2Vzc2lvbnxDb252ZXJ0RnJvbS0oQ3N2fEpzb258U3RyaW5nRGF0YSl8Q29udmVydC1QYXRofENvbnZlcnRUby0oQ3N2fEh0bWx8SnNvbnxYbWwpfENvcHktKEl0ZW18SXRlbVByb3BlcnR5KXxEZWJ1Zy1Qcm9jZXNzfERpc2FibGUtKENvbXB1dGVyUmVzdG9yZXxQU0JyZWFrcG9pbnR8UFNSZW1vdGluZ3xQU1Nlc3Npb25Db25maWd1cmF0aW9uKXxEaXNjb25uZWN0LVBTU2Vzc2lvbnxFbmFibGUtKENvbXB1dGVyUmVzdG9yZXxQU0JyZWFrcG9pbnR8UFNSZW1vdGluZ3xQU1Nlc3Npb25Db25maWd1cmF0aW9uKXxFbnRlci1QU1Nlc3Npb258RXhpdC1QU1Nlc3Npb258RXhwb3J0LShBbGlhc3xDbGl4bWx8Q29uc29sZXxDc3Z8Rm9ybWF0RGF0YXxNb2R1bGVNZW1iZXJ8UFNTZXNzaW9uKXxGb3JFYWNoLU9iamVjdHxGb3JtYXQtKEN1c3RvbXxMaXN0fFRhYmxlfFdpZGUpfEdldC0oQWxpYXN8Q2hpbGRJdGVtfENvbW1hbmR8Q29tcHV0ZXJSZXN0b3JlUG9pbnR8Q29udGVudHxDb250cm9sUGFuZWxJdGVtfEN1bHR1cmV8RGF0ZXxFdmVudHxFdmVudExvZ3xFdmVudFN1YnNjcmliZXJ8Rm9ybWF0RGF0YXxIZWxwfEhpc3Rvcnl8SG9zdHxIb3RGaXh8SXRlbXxJdGVtUHJvcGVydHl8Sm9ifExvY2F0aW9ufE1lbWJlcnxNb2R1bGV8UHJvY2Vzc3xQU0JyZWFrcG9pbnR8UFNDYWxsU3RhY2t8UFNEcml2ZXxQU1Byb3ZpZGVyfFBTU2Vzc2lvbnxQU1Nlc3Npb25Db25maWd1cmF0aW9ufFBTU25hcGlufFJhbmRvbXxTZXJ2aWNlfFRyYWNlU291cmNlfFRyYW5zYWN0aW9ufFR5cGVEYXRhfFVJQ3VsdHVyZXxVbmlxdWV8VmFyaWFibGV8V21pT2JqZWN0KXxHcm91cC1PYmplY3R8SW1wb3J0LShBbGlhc3xDbGl4bWx8Q3N2fExvY2FsaXplZERhdGF8TW9kdWxlfFBTU2Vzc2lvbil8SW52b2tlLShDb21tYW5kfEV4cHJlc3Npb258SGlzdG9yeXxJdGVtfFJlc3RNZXRob2R8V2ViUmVxdWVzdHxXbWlNZXRob2QpfEpvaW4tUGF0aHxMaW1pdC1FdmVudExvZ3xNZWFzdXJlLShDb21tYW5kfE9iamVjdCl8TW92ZS0oSXRlbXxJdGVtUHJvcGVydHkpfE5ldy0oQWxpYXN8RXZlbnR8RXZlbnRMb2d8SXRlbXxJdGVtUHJvcGVydHl8TW9kdWxlfE1vZHVsZU1hbmlmZXN0fE9iamVjdHxQU0RyaXZlfFBTU2Vzc2lvbnxQU1Nlc3Npb25Db25maWd1cmF0aW9uRmlsZXxQU1Nlc3Npb25PcHRpb258UFNUcmFuc3BvcnRPcHRpb258U2VydmljZXxUaW1lU3BhbnxWYXJpYWJsZXxXZWJTZXJ2aWNlUHJveHkpfE91dC0oRGVmYXVsdHxGaWxlfEdyaWRWaWV3fEhvc3R8TnVsbHxQcmludGVyfFN0cmluZyl8UG9wLUxvY2F0aW9ufFB1c2gtTG9jYXRpb258UmVhZC1Ib3N0fFJlY2VpdmUtKEpvYnxQU1Nlc3Npb24pfFJlZ2lzdGVyLShFbmdpbmVFdmVudHxPYmplY3RFdmVudHxQU1Nlc3Npb25Db25maWd1cmF0aW9ufFdtaUV2ZW50KXxSZW1vdmUtKENvbXB1dGVyfEV2ZW50fEV2ZW50TG9nfEl0ZW18SXRlbVByb3BlcnR5fEpvYnxNb2R1bGV8UFNCcmVha3BvaW50fFBTRHJpdmV8UFNTZXNzaW9ufFBTU25hcGlufFR5cGVEYXRhfFZhcmlhYmxlfFdtaU9iamVjdCl8UmVuYW1lLShDb21wdXRlcnxJdGVtfEl0ZW1Qcm9wZXJ0eSl8UmVzZXQtQ29tcHV0ZXJNYWNoaW5lUGFzc3dvcmR8UmVzb2x2ZS1QYXRofFJlc3RhcnQtKENvbXB1dGVyfFNlcnZpY2UpfFJlc3RvcmUtQ29tcHV0ZXJ8UmVzdW1lLShKb2J8U2VydmljZSl8U2F2ZS1IZWxwfFNlbGVjdC0oT2JqZWN0fFN0cmluZ3xYbWwpfFNlbmQtTWFpbE1lc3NhZ2V8U2V0LShBbGlhc3xDb250ZW50fERhdGV8SXRlbXxJdGVtUHJvcGVydHl8TG9jYXRpb258UFNCcmVha3BvaW50fFBTRGVidWd8UFNTZXNzaW9uQ29uZmlndXJhdGlvbnxTZXJ2aWNlfFN0cmljdE1vZGV8VHJhY2VTb3VyY2V8VmFyaWFibGV8V21pSW5zdGFuY2UpfFNob3ctKENvbW1hbmR8Q29udHJvbFBhbmVsSXRlbXxFdmVudExvZyl8U29ydC1PYmplY3R8U3BsaXQtUGF0aHxTdGFydC0oSm9ifFByb2Nlc3N8U2VydmljZXxTbGVlcHxUcmFuc2FjdGlvbil8U3RvcC0oQ29tcHV0ZXJ8Sm9ifFByb2Nlc3N8U2VydmljZSl8U3VzcGVuZC0oSm9ifFNlcnZpY2UpfFRlZS1PYmplY3R8VGVzdC0oQ29tcHV0ZXJTZWN1cmVDaGFubmVsfENvbm5lY3Rpb258TW9kdWxlTWFuaWZlc3R8UGF0aHxQU1Nlc3Npb25Db25maWd1cmF0aW9uRmlsZSl8VHJhY2UtQ29tbWFuZHxVbmJsb2NrLUZpbGV8VW5kby1UcmFuc2FjdGlvbnxVbnJlZ2lzdGVyLShFdmVudHxQU1Nlc3Npb25Db25maWd1cmF0aW9uKXxVcGRhdGUtKEZvcm1hdERhdGF8SGVscHxMaXN0fFR5cGVEYXRhKXxVc2UtVHJhbnNhY3Rpb258V2FpdC0oRXZlbnR8Sm9ifFByb2Nlc3MpfFdoZXJlLU9iamVjdHxXcml0ZS0oRGVidWd8RXJyb3J8RXZlbnRMb2d8SG9zdHxPdXRwdXR8UHJvZ3Jlc3N8VmVyYm9zZXxXYXJuaW5nKSlcXGIvaSxcblx0XHQvXFxiKGFjfGNhdHxjaGRpcnxjbGN8Y2xpfGNscHxjbHZ8Y29tcGFyZXxjb3B5fGNwfGNwaXxjcHB8Y3ZwYXxkYnB8ZGVsfGRpZmZ8ZGlyfGVicHxlY2hvfGVwYWx8ZXBjc3Z8ZXBzbnxlcmFzZXxmY3xmbHxmdHxmd3xnYWx8Z2JwfGdjfGdjaXxnY3N8Z2RyfGdpfGdsfGdtfGdwfGdwc3xncm91cHxnc3Z8Z3V8Z3Z8Z3dtaXxpZXh8aWl8aXBhbHxpcGNzdnxpcHNufGlybXxpd21pfGl3cnxraWxsfGxwfGxzfG1lYXN1cmV8bWl8bW91bnR8bW92ZXxtcHxtdnxuYWx8bmRyfG5pfG52fG9ndnxwb3BkfHBzfHB1c2hkfHB3ZHxyYnB8cmR8cmRyfHJlbnxyaXxybXxybWRpcnxybml8cm5wfHJwfHJ2fHJ2cGF8cndtaXxzYWx8c2Fwc3xzYXN2fHNicHxzY3xzZWxlY3R8c2V0fHNoY218c2l8c2x8c2xlZXB8c2xzfHNvcnR8c3B8c3Bwc3xzcHN2fHN0YXJ0fHN2fHN3bWl8dGVlfHRyY218dHlwZXx3cml0ZSlcXGIvaVxuXHRdLFxuXHQvLyBwZXIgaHR0cDovL3RlY2huZXQubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2hoODQ3NzQ0LmFzcHhcblx0J2tleXdvcmQnOiAvXFxiKEJlZ2lufEJyZWFrfENhdGNofENsYXNzfENvbnRpbnVlfERhdGF8RGVmaW5lfERvfER5bmFtaWNQYXJhbXxFbHNlfEVsc2VJZnxFbmR8RXhpdHxGaWx0ZXJ8RmluYWxseXxGb3J8Rm9yRWFjaHxGcm9tfEZ1bmN0aW9ufElmfElubGluZVNjcmlwdHxQYXJhbGxlbHxQYXJhbXxQcm9jZXNzfFJldHVybnxTZXF1ZW5jZXxTd2l0Y2h8VGhyb3d8VHJhcHxUcnl8VW50aWx8VXNpbmd8VmFyfFdoaWxlfFdvcmtmbG93KVxcYi9pLFxuXHQnb3BlcmF0b3InOiB7XG5cdFx0cGF0dGVybjogLyhcXFc/KSghfC0oZXF8bmV8Z3R8Z2V8bHR8bGV8c2hbbHJdfG5vdHxiPyhhbmR8eD9vcil8KE5vdCk/KExpa2V8TWF0Y2h8Q29udGFpbnN8SW4pfFJlcGxhY2V8Sm9pbnxpcyhOb3QpP3xhcylcXGJ8LVstPV0/fFxcK1srPV0/fFsqXFwvJV09PykvaSxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdwdW5jdHVhdGlvbic6IC9bfHt9W1xcXTsoKSwuXS9cbn07XG5cbi8vIFZhcmlhYmxlIGludGVycG9sYXRpb24gaW5zaWRlIHN0cmluZ3MsIGFuZCBuZXN0ZWQgZXhwcmVzc2lvbnNcblByaXNtLmxhbmd1YWdlcy5wb3dlcnNoZWxsLnN0cmluZ1swXS5pbnNpZGUuYm9vbGVhbiA9IFByaXNtLmxhbmd1YWdlcy5wb3dlcnNoZWxsLmJvb2xlYW47XG5QcmlzbS5sYW5ndWFnZXMucG93ZXJzaGVsbC5zdHJpbmdbMF0uaW5zaWRlLnZhcmlhYmxlID0gUHJpc20ubGFuZ3VhZ2VzLnBvd2Vyc2hlbGwudmFyaWFibGU7XG5QcmlzbS5sYW5ndWFnZXMucG93ZXJzaGVsbC5zdHJpbmdbMF0uaW5zaWRlLmZ1bmN0aW9uLmluc2lkZSA9IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLnBvd2Vyc2hlbGwpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLXBocC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKipcbiAqIE9yaWdpbmFsIGJ5IEFhcm9uIEhhcnVuOiBodHRwOi8vYWFoYWNyZWF0aXZlLmNvbS8yMDEyLzA3LzMxL3BocC1zeW50YXgtaGlnaGxpZ2h0aW5nLXByaXNtL1xuICogTW9kaWZpZWQgYnkgTWlsZXMgSm9obnNvbjogaHR0cDovL21pbGVzai5tZVxuICpcbiAqIFN1cHBvcnRzIHRoZSBmb2xsb3dpbmc6XG4gKiBcdFx0LSBFeHRlbmRzIGNsaWtlIHN5bnRheFxuICogXHRcdC0gU3VwcG9ydCBmb3IgUEhQIDUuMysgKG5hbWVzcGFjZXMsIHRyYWl0cywgZ2VuZXJhdG9ycywgZXRjKVxuICogXHRcdC0gU21hcnRlciBjb25zdGFudCBhbmQgZnVuY3Rpb24gbWF0Y2hpbmdcbiAqXG4gKiBBZGRzIHRoZSBmb2xsb3dpbmcgbmV3IHRva2VuIGNsYXNzZXM6XG4gKiBcdFx0Y29uc3RhbnQsIGRlbGltaXRlciwgdmFyaWFibGUsIGZ1bmN0aW9uLCBwYWNrYWdlXG4gKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnBocCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQna2V5d29yZCc6IC9cXGIoYW5kfG9yfHhvcnxhcnJheXxhc3xicmVha3xjYXNlfGNmdW5jdGlvbnxjbGFzc3xjb25zdHxjb250aW51ZXxkZWNsYXJlfGRlZmF1bHR8ZGllfGRvfGVsc2V8ZWxzZWlmfGVuZGRlY2xhcmV8ZW5kZm9yfGVuZGZvcmVhY2h8ZW5kaWZ8ZW5kc3dpdGNofGVuZHdoaWxlfGV4dGVuZHN8Zm9yfGZvcmVhY2h8ZnVuY3Rpb258aW5jbHVkZXxpbmNsdWRlX29uY2V8Z2xvYmFsfGlmfG5ld3xyZXR1cm58c3RhdGljfHN3aXRjaHx1c2V8cmVxdWlyZXxyZXF1aXJlX29uY2V8dmFyfHdoaWxlfGFic3RyYWN0fGludGVyZmFjZXxwdWJsaWN8aW1wbGVtZW50c3xwcml2YXRlfHByb3RlY3RlZHxwYXJlbnR8dGhyb3d8bnVsbHxlY2hvfHByaW50fHRyYWl0fG5hbWVzcGFjZXxmaW5hbHx5aWVsZHxnb3RvfGluc3RhbmNlb2Z8ZmluYWxseXx0cnl8Y2F0Y2gpXFxiL2ksXG5cdCdjb25zdGFudCc6IC9cXGJbQS1aMC05X117Mix9XFxiLyxcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pKD86XFwvXFwqW1xcd1xcV10qP1xcKlxcL3xcXC9cXC8uKikvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cbi8vIFNoZWxsLWxpa2UgY29tbWVudHMgYXJlIG1hdGNoZWQgYWZ0ZXIgc3RyaW5ncywgYmVjYXVzZSB0aGV5IGFyZSBsZXNzXG4vLyBjb21tb24gdGhhbiBzdHJpbmdzIGNvbnRhaW5pbmcgaGFzaGVzLi4uXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdwaHAnLCAnY2xhc3MtbmFtZScsIHtcblx0J3NoZWxsLWNvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pIy4qLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnY29tbWVudCdcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICdrZXl3b3JkJywge1xuXHQnZGVsaW1pdGVyJzogL1xcPz58PFxcPyg/OnBocCk/L2ksXG5cdCd2YXJpYWJsZSc6IC9cXCRcXHcrXFxiL2ksXG5cdCdwYWNrYWdlJzoge1xuXHRcdHBhdHRlcm46IC8oXFxcXHxuYW1lc3BhY2VcXHMrfHVzZVxccyspW1xcd1xcXFxdKy8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdHB1bmN0dWF0aW9uOiAvXFxcXC9cblx0XHR9XG5cdH1cbn0pO1xuXG4vLyBNdXN0IGJlIGRlZmluZWQgYWZ0ZXIgdGhlIGZ1bmN0aW9uIHBhdHRlcm5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICdvcGVyYXRvcicsIHtcblx0J3Byb3BlcnR5Jzoge1xuXHRcdHBhdHRlcm46IC8oLT4pW1xcd10rLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH1cbn0pO1xuXG4vLyBBZGQgSFRNTCBzdXBwb3J0IG9mIHRoZSBtYXJrdXAgbGFuZ3VhZ2UgZXhpc3RzXG5pZiAoUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cCkge1xuXG5cdC8vIFRva2VuaXplIGFsbCBpbmxpbmUgUEhQIGJsb2NrcyB0aGF0IGFyZSB3cmFwcGVkIGluIDw/cGhwID8+XG5cdC8vIFRoaXMgYWxsb3dzIGZvciBlYXN5IFBIUCArIG1hcmt1cCBoaWdobGlnaHRpbmdcblx0UHJpc20uaG9va3MuYWRkKCdiZWZvcmUtaGlnaGxpZ2h0JywgZnVuY3Rpb24oZW52KSB7XG5cdFx0aWYgKGVudi5sYW5ndWFnZSAhPT0gJ3BocCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRlbnYudG9rZW5TdGFjayA9IFtdO1xuXG5cdFx0ZW52LmJhY2t1cENvZGUgPSBlbnYuY29kZTtcblx0XHRlbnYuY29kZSA9IGVudi5jb2RlLnJlcGxhY2UoLyg/OjxcXD9waHB8PFxcPylbXFx3XFxXXSo/KD86XFw/PikvaWcsIGZ1bmN0aW9uKG1hdGNoKSB7XG5cdFx0XHRlbnYudG9rZW5TdGFjay5wdXNoKG1hdGNoKTtcblxuXHRcdFx0cmV0dXJuICd7e3tQSFAnICsgZW52LnRva2VuU3RhY2subGVuZ3RoICsgJ319fSc7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdC8vIFJlc3RvcmUgZW52LmNvZGUgZm9yIG90aGVyIHBsdWdpbnMgKGUuZy4gbGluZS1udW1iZXJzKVxuXHRQcmlzbS5ob29rcy5hZGQoJ2JlZm9yZS1pbnNlcnQnLCBmdW5jdGlvbihlbnYpIHtcblx0XHRpZiAoZW52Lmxhbmd1YWdlID09PSAncGhwJykge1xuXHRcdFx0ZW52LmNvZGUgPSBlbnYuYmFja3VwQ29kZTtcblx0XHRcdGRlbGV0ZSBlbnYuYmFja3VwQ29kZTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIFJlLWluc2VydCB0aGUgdG9rZW5zIGFmdGVyIGhpZ2hsaWdodGluZ1xuXHRQcmlzbS5ob29rcy5hZGQoJ2FmdGVyLWhpZ2hsaWdodCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgIT09ICdwaHAnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDAsIHQ7IHQgPSBlbnYudG9rZW5TdGFja1tpXTsgaSsrKSB7XG5cdFx0XHQvLyBUaGUgcmVwbGFjZSBwcmV2ZW50cyAkJCwgJCYsICRgLCAkJywgJG4sICRubiBmcm9tIGJlaW5nIGludGVycHJldGVkIGFzIHNwZWNpYWwgcGF0dGVybnNcblx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlLnJlcGxhY2UoJ3t7e1BIUCcgKyAoaSArIDEpICsgJ319fScsIFByaXNtLmhpZ2hsaWdodCh0LCBlbnYuZ3JhbW1hciwgJ3BocCcpLnJlcGxhY2UoL1xcJC9nLCAnJCQkJCcpKTtcblx0XHR9XG5cblx0XHRlbnYuZWxlbWVudC5pbm5lckhUTUwgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlO1xuXHR9KTtcblxuXHQvLyBXcmFwIHRva2VucyBpbiBjbGFzc2VzIHRoYXQgYXJlIG1pc3NpbmcgdGhlbVxuXHRQcmlzbS5ob29rcy5hZGQoJ3dyYXAnLCBmdW5jdGlvbihlbnYpIHtcblx0XHRpZiAoZW52Lmxhbmd1YWdlID09PSAncGhwJyAmJiBlbnYudHlwZSA9PT0gJ21hcmt1cCcpIHtcblx0XHRcdGVudi5jb250ZW50ID0gZW52LmNvbnRlbnQucmVwbGFjZSgvKFxce1xce1xce1BIUFswLTldK1xcfVxcfVxcfSkvZywgXCI8c3BhbiBjbGFzcz1cXFwidG9rZW4gcGhwXFxcIj4kMTwvc3Bhbj5cIik7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBBZGQgdGhlIHJ1bGVzIGJlZm9yZSBhbGwgb3RoZXJzXG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICdjb21tZW50Jywge1xuXHRcdCdtYXJrdXAnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvPFteP11cXC8/KC4qPyk+Lyxcblx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cFxuXHRcdH0sXG5cdFx0J3BocCc6IC9cXHtcXHtcXHtQSFBbMC05XStcXH1cXH1cXH0vXG5cdH0pO1xufVxuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcGhwLWV4dHJhcy5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdwaHAnLCAndmFyaWFibGUnLCB7XG5cdCd0aGlzJzogL1xcJHRoaXNcXGIvLFxuXHQnZ2xvYmFsJzogL1xcJCg/Ol8oPzpTRVJWRVJ8R0VUfFBPU1R8RklMRVN8UkVRVUVTVHxTRVNTSU9OfEVOVnxDT09LSUUpfEdMT0JBTFN8SFRUUF9SQVdfUE9TVF9EQVRBfGFyZ2N8YXJndnxwaHBfZXJyb3Jtc2d8aHR0cF9yZXNwb25zZV9oZWFkZXIpLyxcblx0J3Njb3BlJzoge1xuXHRcdHBhdHRlcm46IC9cXGJbXFx3XFxcXF0rOjovLFxuXHRcdGluc2lkZToge1xuXHRcdFx0a2V5d29yZDogLyhzdGF0aWN8c2VsZnxwYXJlbnQpLyxcblx0XHRcdHB1bmN0dWF0aW9uOiAvKDo6fFxcXFwpL1xuXHRcdH1cblx0fVxufSk7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tcGVybC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMucGVybCA9IHtcblx0J2NvbW1lbnQnOiBbXG5cdFx0e1xuXHRcdFx0Ly8gUE9EXG5cdFx0XHRwYXR0ZXJuOiAvKF5cXHMqKT1cXHcrW1xcc1xcU10qPz1jdXQuKi9tLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteXFxcXCRdKSMuKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQvLyBUT0RPIENvdWxkIGJlIG5pY2UgdG8gaGFuZGxlIEhlcmVkb2MgdG9vLlxuXHQnc3RyaW5nJzogW1xuXHRcdC8vIHEvLi4uL1xuXHRcdC9cXGIoPzpxfHFxfHF4fHF3KVxccyooW15hLXpBLVowLTlcXHNcXHtcXChcXFs8XSkoPzpbXlxcXFxdfFxcXFxbXFxzXFxTXSkqP1xcMS8sXG5cdFxuXHRcdC8vIHEgYS4uLmFcblx0XHQvXFxiKD86cXxxcXxxeHxxdylcXHMrKFthLXpBLVowLTldKSg/OlteXFxcXF18XFxcXFtcXHNcXFNdKSo/XFwxLyxcblx0XG5cdFx0Ly8gcSguLi4pXG5cdFx0L1xcYig/OnF8cXF8cXh8cXcpXFxzKlxcKCg/OlteKClcXFxcXXxcXFxcW1xcc1xcU10pKlxcKS8sXG5cdFxuXHRcdC8vIHF7Li4ufVxuXHRcdC9cXGIoPzpxfHFxfHF4fHF3KVxccypcXHsoPzpbXnt9XFxcXF18XFxcXFtcXHNcXFNdKSpcXH0vLFxuXHRcblx0XHQvLyBxWy4uLl1cblx0XHQvXFxiKD86cXxxcXxxeHxxdylcXHMqXFxbKD86W15bXFxdXFxcXF18XFxcXFtcXHNcXFNdKSpcXF0vLFxuXHRcblx0XHQvLyBxPC4uLj5cblx0XHQvXFxiKD86cXxxcXxxeHxxdylcXHMqPCg/OltePD5cXFxcXXxcXFxcW1xcc1xcU10pKj4vLFxuXG5cdFx0Ly8gXCIuLi5cIiwgYC4uLmBcblx0XHQvKFwifGApKD86W15cXFxcXXxcXFxcW1xcc1xcU10pKj9cXDEvLFxuXG5cdFx0Ly8gJy4uLidcblx0XHQvLyBGSVhNRSBNdWx0aS1saW5lIHNpbmdsZS1xdW90ZWQgc3RyaW5ncyBhcmUgbm90IHN1cHBvcnRlZCBhcyB0aGV5IHdvdWxkIGJyZWFrIHZhcmlhYmxlcyBjb250YWluaW5nICdcblx0XHQvJyg/OlteJ1xcXFxcXHJcXG5dfFxcXFwuKSonL1xuXHRdLFxuXHQncmVnZXgnOiBbXG5cdFx0Ly8gbS8uLi4vXG5cdFx0L1xcYig/Om18cXIpXFxzKihbXmEtekEtWjAtOVxcc1xce1xcKFxcWzxdKSg/OlteXFxcXF18XFxcXFtcXHNcXFNdKSo/XFwxW21zaXhwb2R1YWxuZ2NdKi8sXG5cdFxuXHRcdC8vIG0gYS4uLmFcblx0XHQvXFxiKD86bXxxcilcXHMrKFthLXpBLVowLTldKSg/OlteXFxcXF18XFxcXC4pKj9cXDFbbXNpeHBvZHVhbG5nY10qLyxcblx0XG5cdFx0Ly8gbSguLi4pXG5cdFx0L1xcYig/Om18cXIpXFxzKlxcKCg/OlteKClcXFxcXXxcXFxcW1xcc1xcU10pKlxcKVttc2l4cG9kdWFsbmdjXSovLFxuXHRcblx0XHQvLyBtey4uLn1cblx0XHQvXFxiKD86bXxxcilcXHMqXFx7KD86W157fVxcXFxdfFxcXFxbXFxzXFxTXSkqXFx9W21zaXhwb2R1YWxuZ2NdKi8sXG5cdFxuXHRcdC8vIG1bLi4uXVxuXHRcdC9cXGIoPzptfHFyKVxccypcXFsoPzpbXltcXF1cXFxcXXxcXFxcW1xcc1xcU10pKlxcXVttc2l4cG9kdWFsbmdjXSovLFxuXHRcblx0XHQvLyBtPC4uLj5cblx0XHQvXFxiKD86bXxxcilcXHMqPCg/OltePD5cXFxcXXxcXFxcW1xcc1xcU10pKj5bbXNpeHBvZHVhbG5nY10qLyxcblxuXHRcdC8vIFRoZSBsb29rYmVoaW5kcyBwcmV2ZW50IC1zIGZyb20gYnJlYWtpbmdcblx0XHQvLyBGSVhNRSBXZSBkb24ndCBoYW5kbGUgY2hhbmdlIG9mIHNlcGFyYXRvciBsaWtlIHMoLi4uKVsuLi5dXG5cdFx0Ly8gcy8uLi4vLi4uL1xuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXi1dXFxiKSg/OnN8dHJ8eSlcXHMqKFteYS16QS1aMC05XFxzXFx7XFwoXFxbPF0pKD86W15cXFxcXXxcXFxcW1xcc1xcU10pKj9cXDIoPzpbXlxcXFxdfFxcXFxbXFxzXFxTXSkqP1xcMlttc2l4cG9kdWFsbmdjZXJdKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XG5cdFx0Ly8gcyBhLi4uYS4uLmFcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W14tXVxcYikoPzpzfHRyfHkpXFxzKyhbYS16QS1aMC05XSkoPzpbXlxcXFxdfFxcXFxbXFxzXFxTXSkqP1xcMig/OlteXFxcXF18XFxcXFtcXHNcXFNdKSo/XFwyW21zaXhwb2R1YWxuZ2Nlcl0qLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcblx0XHQvLyBzKC4uLikoLi4uKVxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXi1dXFxiKSg/OnN8dHJ8eSlcXHMqXFwoKD86W14oKVxcXFxdfFxcXFxbXFxzXFxTXSkqXFwpXFxzKlxcKCg/OlteKClcXFxcXXxcXFxcW1xcc1xcU10pKlxcKVttc2l4cG9kdWFsbmdjZXJdKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XG5cdFx0Ly8gc3suLi59ey4uLn1cblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W14tXVxcYikoPzpzfHRyfHkpXFxzKlxceyg/Oltee31cXFxcXXxcXFxcW1xcc1xcU10pKlxcfVxccypcXHsoPzpbXnt9XFxcXF18XFxcXFtcXHNcXFNdKSpcXH1bbXNpeHBvZHVhbG5nY2VyXSovLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFxuXHRcdC8vIHNbLi4uXVsuLi5dXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteLV1cXGIpKD86c3x0cnx5KVxccypcXFsoPzpbXltcXF1cXFxcXXxcXFxcW1xcc1xcU10pKlxcXVxccypcXFsoPzpbXltcXF1cXFxcXXxcXFxcW1xcc1xcU10pKlxcXVttc2l4cG9kdWFsbmdjZXJdKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XG5cdFx0Ly8gczwuLi4+PC4uLj5cblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W14tXVxcYikoPzpzfHRyfHkpXFxzKjwoPzpbXjw+XFxcXF18XFxcXFtcXHNcXFNdKSo+XFxzKjwoPzpbXjw+XFxcXF18XFxcXFtcXHNcXFNdKSo+W21zaXhwb2R1YWxuZ2Nlcl0qLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcblx0XHQvLyAvLi4uL1xuXHRcdC8vIFRoZSBsb29rLWFoZWFkIHRyaWVzIHRvIHByZXZlbnQgdHdvIGRpdmlzaW9ucyBvblxuXHRcdC8vIHRoZSBzYW1lIGxpbmUgZnJvbSBiZWluZyBoaWdobGlnaHRlZCBhcyByZWdleC5cblx0XHQvLyBUaGlzIGRvZXMgbm90IHN1cHBvcnQgbXVsdGktbGluZSByZWdleC5cblx0XHQvXFwvKD86W15cXC9cXFxcXFxyXFxuXXxcXFxcLikqXFwvW21zaXhwb2R1YWxuZ2NdKig/PVxccyooPzokfFtcXHJcXG4sLjt9KSZ8XFwtKyp+PD4hP15dfChsdHxndHxsZXxnZXxlcXxuZXxjbXB8bm90fGFuZHxvcnx4b3J8eClcXGIpKS9cblx0XSxcblxuXHQvLyBGSVhNRSBOb3Qgc3VyZSBhYm91dCB0aGUgaGFuZGxpbmcgb2YgOjosICcsIGFuZCAjXG5cdCd2YXJpYWJsZSc6IFtcblx0XHQvLyAke15QT1NUTUFUQ0h9XG5cdFx0L1smKiRAJV1cXHtcXF5bQS1aXStcXH0vLFxuXHRcdC8vICReVlxuXHRcdC9bJiokQCVdXFxeW0EtWl9dLyxcblx0XHQvLyAkey4uLn1cblx0XHQvWyYqJEAlXSM/KD89XFx7KS8sXG5cdFx0Ly8gJGZvb1xuXHRcdC9bJiokQCVdIz8oKDo6KSonPyg/IVxcZClbXFx3JF0rKSsoOjopKi9pLFxuXHRcdC8vICQxXG5cdFx0L1smKiRAJV1cXGQrLyxcblx0XHQvLyAkXywgQF8sICUhXG5cdFx0Ly8gVGhlIG5lZ2F0aXZlIGxvb2thaGVhZCBwcmV2ZW50cyBmcm9tIGJyZWFraW5nIHRoZSAlPSBvcGVyYXRvclxuXHRcdC8oPyElPSlbJEAlXVshXCIjJCUmJygpKissXFwtLlxcLzo7PD0+P0BbXFxcXFxcXV5fYHt8fX5dL1xuXHRdLFxuXHQnZmlsZWhhbmRsZSc6IHtcblx0XHQvLyA8PiwgPEZPTz4sIF9cblx0XHRwYXR0ZXJuOiAvPCg/IVs8PV0pXFxTKj58XFxiX1xcYi8sXG5cdFx0YWxpYXM6ICdzeW1ib2wnXG5cdH0sXG5cdCd2c3RyaW5nJzoge1xuXHRcdC8vIHYxLjIsIDEuMi4zXG5cdFx0cGF0dGVybjogL3ZcXGQrKFxcLlxcZCspKnxcXGQrKFxcLlxcZCspezIsfS8sXG5cdFx0YWxpYXM6ICdzdHJpbmcnXG5cdH0sXG5cdCdmdW5jdGlvbic6IHtcblx0XHRwYXR0ZXJuOiAvc3ViIFthLXowLTlfXSsvaSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdGtleXdvcmQ6IC9zdWIvXG5cdFx0fVxuXHR9LFxuXHQna2V5d29yZCc6IC9cXGIoYW55fGJyZWFrfGNvbnRpbnVlfGRlZmF1bHR8ZGVsZXRlfGRpZXxkb3xlbHNlfGVsc2lmfGV2YWx8Zm9yfGZvcmVhY2h8Z2l2ZW58Z290b3xpZnxsYXN0fGxvY2FsfG15fG5leHR8b3VyfHBhY2thZ2V8cHJpbnR8cmVkb3xyZXF1aXJlfHNheXxzdGF0ZXxzdWJ8c3dpdGNofHVuZGVmfHVubGVzc3x1bnRpbHx1c2V8d2hlbnx3aGlsZSlcXGIvLFxuXHQnbnVtYmVyJzogL1xcYi0/KDB4W1xcZEEtRmEtZl0oXz9bXFxkQS1GYS1mXSkqfDBiWzAxXShfP1swMV0pKnwoXFxkKF8/XFxkKSopP1xcLj9cXGQoXz9cXGQpKihbRWVdWystXT9cXGQrKT8pXFxiLyxcblx0J29wZXJhdG9yJzogLy1bcnd4b1JXWE9lenNmZGxwU2JjdHVna1RCTUFDXVxcYnxcXCtbKz1dP3wtWy09Pl0/fFxcKlxcKj89P3xcXC9cXC8/PT98PVs9fj5dP3x+W349XT98XFx8XFx8Pz0/fCYmPz0/fDwoPzo9Pj98PD0/KT98Pj4/PT98IVt+PV0/fFslXl09P3xcXC4oPzo9fFxcLlxcLj8pP3xbXFxcXD9dfFxcYngoPzo9fFxcYil8XFxiKGx0fGd0fGxlfGdlfGVxfG5lfGNtcHxub3R8YW5kfG9yfHhvcilcXGIvLFxuXHQncHVuY3R1YXRpb24nOiAvW3t9W1xcXTsoKSw6XS9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1wYXNjYWwuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuLy8gQmFzZWQgb24gRnJlZSBQYXNjYWxcblxuLyogVE9ET1xuXHRTdXBwb3J0IGlubGluZSBhc20gP1xuKi9cblxuUHJpc20ubGFuZ3VhZ2VzLnBhc2NhbCA9IHtcblx0J2NvbW1lbnQnOiBbXG5cdFx0L1xcKFxcKltcXHNcXFNdKz9cXCpcXCkvLFxuXHRcdC9cXHtbXFxzXFxTXSs/XFx9Lyxcblx0XHQvXFwvXFwvLiovXG5cdF0sXG5cdCdzdHJpbmcnOiAvKD86Jyg/OicnfFteJ1xcclxcbl0pKid8I1smJCVdP1thLWZcXGRdKykrfFxcXlthLXpdL2ksXG5cdCdrZXl3b3JkJzogW1xuXHRcdHtcblx0XHRcdC8vIFR1cmJvIFBhc2NhbFxuXHRcdFx0cGF0dGVybjogLyhefFteJl0pXFxiKD86YWJzb2x1dGV8YXJyYXl8YXNtfGJlZ2lufGNhc2V8Y29uc3R8Y29uc3RydWN0b3J8ZGVzdHJ1Y3Rvcnxkb3xkb3dudG98ZWxzZXxlbmR8ZmlsZXxmb3J8ZnVuY3Rpb258Z290b3xpZnxpbXBsZW1lbnRhdGlvbnxpbmhlcml0ZWR8aW5saW5lfGludGVyZmFjZXxsYWJlbHxuaWx8b2JqZWN0fG9mfG9wZXJhdG9yfHBhY2tlZHxwcm9jZWR1cmV8cHJvZ3JhbXxyZWNvcmR8cmVpbnRyb2R1Y2V8cmVwZWF0fHNlbGZ8c2V0fHN0cmluZ3x0aGVufHRvfHR5cGV8dW5pdHx1bnRpbHx1c2VzfHZhcnx3aGlsZXx3aXRoKVxcYi9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gRnJlZSBQYXNjYWxcblx0XHRcdHBhdHRlcm46IC8oXnxbXiZdKVxcYig/OmRpc3Bvc2V8ZXhpdHxmYWxzZXxuZXd8dHJ1ZSlcXGIvaSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdHtcblx0XHRcdC8vIE9iamVjdCBQYXNjYWxcblx0XHRcdHBhdHRlcm46IC8oXnxbXiZdKVxcYig/OmNsYXNzfGRpc3BpbnRlcmZhY2V8ZXhjZXB0fGV4cG9ydHN8ZmluYWxpemF0aW9ufGZpbmFsbHl8aW5pdGlhbGl6YXRpb258aW5saW5lfGxpYnJhcnl8b258b3V0fHBhY2tlZHxwcm9wZXJ0eXxyYWlzZXxyZXNvdXJjZXN0cmluZ3x0aHJlYWR2YXJ8dHJ5KVxcYi9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gTW9kaWZpZXJzXG5cdFx0XHRwYXR0ZXJuOiAvKF58W14mXSlcXGIoPzphYnNvbHV0ZXxhYnN0cmFjdHxhbGlhc3xhc3NlbWJsZXJ8Yml0cGFja2VkfGJyZWFrfGNkZWNsfGNvbnRpbnVlfGNwcGRlY2x8Y3ZhcnxkZWZhdWx0fGRlcHJlY2F0ZWR8ZHluYW1pY3xlbnVtZXJhdG9yfGV4cGVyaW1lbnRhbHxleHBvcnR8ZXh0ZXJuYWx8ZmFyfGZhcjE2fGZvcndhcmR8Z2VuZXJpY3xoZWxwZXJ8aW1wbGVtZW50c3xpbmRleHxpbnRlcnJ1cHR8aW9jaGVja3N8bG9jYWx8bWVzc2FnZXxuYW1lfG5lYXJ8bm9kZWZhdWx0fG5vcmV0dXJufG5vc3RhY2tmcmFtZXxvbGRmcGNjYWxsfG90aGVyd2lzZXxvdmVybG9hZHxvdmVycmlkZXxwYXNjYWx8cGxhdGZvcm18cHJpdmF0ZXxwcm90ZWN0ZWR8cHVibGljfHB1Ymxpc2hlZHxyZWFkfHJlZ2lzdGVyfHJlaW50cm9kdWNlfHJlc3VsdHxzYWZlY2FsbHxzYXZlcmVnaXN0ZXJzfHNvZnRmbG9hdHxzcGVjaWFsaXplfHN0YXRpY3xzdGRjYWxsfHN0b3JlZHxzdHJpY3R8dW5hbGlnbmVkfHVuaW1wbGVtZW50ZWR8dmFyYXJnc3x2aXJ0dWFsfHdyaXRlKVxcYi9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0XSxcblx0J251bWJlcic6IFtcblx0XHQvLyBIZXhhZGVjaW1hbCwgb2N0YWwgYW5kIGJpbmFyeVxuXHRcdC9bKy1dPyg/OlsmJV1cXGQrfFxcJFthLWZcXGRdKykvaSxcblx0XHQvLyBEZWNpbWFsXG5cdFx0LyhbKy1dfFxcYilcXGQrKD86XFwuXFxkKyk/KD86ZVsrLV0/XFxkKyk/L2lcblx0XSxcblx0J29wZXJhdG9yJzogW1xuXHRcdC9cXC5cXC58XFwqXFwqfDo9fDxbPD0+XT98Pls+PV0/fFsrXFwtKlxcL109P3xbQF49XS9pLFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXiZdKVxcYig/OmFuZHxhc3xkaXZ8ZXhjbHVkZXxpbnxpbmNsdWRlfGlzfG1vZHxub3R8b3J8c2hsfHNocnx4b3IpXFxiLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF0sXG5cdCdwdW5jdHVhdGlvbic6IC9cXChcXC58XFwuXFwpfFsoKVxcW1xcXTo7LC5dL1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1vY2FtbC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMub2NhbWwgPSB7XG5cdCdjb21tZW50JzogL1xcKFxcKltcXHNcXFNdKj9cXCpcXCkvLFxuXHQnc3RyaW5nJzogW1xuXHRcdC9cIig/OlxcXFwufFteXFxcXFxcclxcblwiXSkqXCIvLFxuXHRcdC8oWydgXSkoPzpcXFxcKD86XFxkK3x4W1xcZGEtZl0rfC4pfCg/IVxcMSlbXlxcXFxcXHJcXG5dKVxcMS9pXG5cdF0sXG5cdCdudW1iZXInOiAvXFxiLT8oPzoweFtcXGRhLWZdW1xcZGEtZl9dK3woPzowW2JvXSk/XFxkW1xcZF9dKlxcLj9bXFxkX10qKD86ZVsrLV0/W1xcZF9dKyk/KS9pLFxuXHQndHlwZSc6IHtcblx0XHRwYXR0ZXJuOiAvXFxCWydgXVthLXpcXGRfXSovaSxcblx0XHRhbGlhczogJ3ZhcmlhYmxlJ1xuXHR9LFxuXHQnZGlyZWN0aXZlJzoge1xuXHRcdHBhdHRlcm46IC9cXEIjW2EtelxcZF9dKy9pLFxuXHRcdGFsaWFzOiAnZnVuY3Rpb24nXG5cdH0sXG5cdCdrZXl3b3JkJzogL1xcYig/OmFzfGFzc2VydHxiZWdpbnxjbGFzc3xjb25zdHJhaW50fGRvfGRvbmV8ZG93bnRvfGVsc2V8ZW5kfGV4Y2VwdGlvbnxleHRlcm5hbHxmb3J8ZnVufGZ1bmN0aW9ufGZ1bmN0b3J8aWZ8aW58aW5jbHVkZXxpbmhlcml0fGluaXRpYWxpemVyfGxhenl8bGV0fG1hdGNofG1ldGhvZHxtb2R1bGV8bXV0YWJsZXxuZXd8b2JqZWN0fG9mfG9wZW58cHJlZml4fHByaXZhdGV8cmVjfHRoZW58c2lnfHN0cnVjdHx0b3x0cnl8dHlwZXx2YWx8dmFsdWV8dmlydHVhbHx3aGVyZXx3aGlsZXx3aXRoKVxcYi8sXG5cdCdib29sZWFuJzogL1xcYig/OmZhbHNlfHRydWUpXFxiLyxcblx0Ly8gQ3VzdG9tIG9wZXJhdG9ycyBhcmUgYWxsb3dlZFxuXHQnb3BlcmF0b3InOiAvOj18Wz08PkBefCYrXFwtKlxcLyQlIT9+XVshJCUmXFwqK1xcLS5cXC86PD0+P0BefH5dKnxcXGIoPzphbmR8YXNyfGxhbmR8bG9yfGx4b3J8bHNsfGxzcnxtb2R8bm9yfG9yKVxcYi8sXG5cdCdwdW5jdHVhdGlvbic6IC9bKCl7fVxcW1xcXXxfLiw6O10vXG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWMuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmMgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjbGlrZScsIHtcblx0J2tleXdvcmQnOiAvXFxiKGFzbXx0eXBlb2Z8aW5saW5lfGF1dG98YnJlYWt8Y2FzZXxjaGFyfGNvbnN0fGNvbnRpbnVlfGRlZmF1bHR8ZG98ZG91YmxlfGVsc2V8ZW51bXxleHRlcm58ZmxvYXR8Zm9yfGdvdG98aWZ8aW50fGxvbmd8cmVnaXN0ZXJ8cmV0dXJufHNob3J0fHNpZ25lZHxzaXplb2Z8c3RhdGljfHN0cnVjdHxzd2l0Y2h8dHlwZWRlZnx1bmlvbnx1bnNpZ25lZHx2b2lkfHZvbGF0aWxlfHdoaWxlKVxcYi8sXG5cdCdvcGVyYXRvcic6IC9cXC1bPi1dP3xcXCtcXCs/fCE9P3w8PD89P3w+Pj89P3w9PT98JiY/fFxcfD9cXHx8W35eJT8qXFwvXS8sXG5cdCdudW1iZXInOiAvXFxiLT8oPzoweFtcXGRhLWZdK3xcXGQqXFwuP1xcZCsoPzplWystXT9cXGQrKT8pW2Z1bF0qXFxiL2lcbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdjJywgJ3N0cmluZycsIHtcblx0J21hY3JvJzoge1xuXHRcdC8vIGFsbG93IGZvciBtdWx0aWxpbmUgbWFjcm8gZGVmaW5pdGlvbnNcblx0XHQvLyBzcGFjZXMgYWZ0ZXIgdGhlICMgY2hhcmFjdGVyIGNvbXBpbGUgZmluZSB3aXRoIGdjY1xuXHRcdHBhdHRlcm46IC8oXlxccyopI1xccypbYS16XSsoW15cXHJcXG5cXFxcXXxcXFxcLnxcXFxcKD86XFxyXFxuP3xcXG4pKSovaW0sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3Byb3BlcnR5Jyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdC8vIGhpZ2hsaWdodCB0aGUgcGF0aCBvZiB0aGUgaW5jbHVkZSBzdGF0ZW1lbnQgYXMgYSBzdHJpbmdcblx0XHRcdCdzdHJpbmcnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC8oI1xccyppbmNsdWRlXFxzKikoPC4rPz58KFwifCcpKFxcXFw/LikrP1xcMykvLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcblxuZGVsZXRlIFByaXNtLmxhbmd1YWdlcy5jWydjbGFzcy1uYW1lJ107XG5kZWxldGUgUHJpc20ubGFuZ3VhZ2VzLmNbJ2Jvb2xlYW4nXTtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW9iamVjdGl2ZWMuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLm9iamVjdGl2ZWMgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjJywge1xuXHQna2V5d29yZCc6IC9cXGIoYXNtfHR5cGVvZnxpbmxpbmV8YXV0b3xicmVha3xjYXNlfGNoYXJ8Y29uc3R8Y29udGludWV8ZGVmYXVsdHxkb3xkb3VibGV8ZWxzZXxlbnVtfGV4dGVybnxmbG9hdHxmb3J8Z290b3xpZnxpbnR8bG9uZ3xyZWdpc3RlcnxyZXR1cm58c2hvcnR8c2lnbmVkfHNpemVvZnxzdGF0aWN8c3RydWN0fHN3aXRjaHx0eXBlZGVmfHVuaW9ufHVuc2lnbmVkfHZvaWR8dm9sYXRpbGV8d2hpbGV8aW58c2VsZnxzdXBlcilcXGJ8KEBpbnRlcmZhY2V8QGVuZHxAaW1wbGVtZW50YXRpb258QHByb3RvY29sfEBjbGFzc3xAcHVibGljfEBwcm90ZWN0ZWR8QHByaXZhdGV8QHByb3BlcnR5fEB0cnl8QGNhdGNofEBmaW5hbGx5fEB0aHJvd3xAc3ludGhlc2l6ZXxAZHluYW1pY3xAc2VsZWN0b3IpXFxiLyxcblx0J3N0cmluZyc6IC8oXCJ8JykoXFxcXCg/OlxcclxcbnxbXFxzXFxTXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMXxAXCIoXFxcXCg/OlxcclxcbnxbXFxzXFxTXSl8W15cIlxcXFxcXHJcXG5dKSpcIi8sXG5cdCdvcGVyYXRvcic6IC8tWy0+XT98XFwrXFwrP3whPT98PDw/PT98Pj4/PT98PT0/fCYmP3xcXHxcXHw/fFt+XiU/KlxcL0BdL1xufSk7XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1uc2lzLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbi8qKlxuICogT3JpZ2luYWwgYnkgSmFuIFQuIFNvdHQgKGh0dHA6Ly9naXRodWIuY29tL2lkbGViZXJnKVxuICpcbiAqIEluY2x1ZGVzIGFsbCBjb21tYW5kcyBhbmQgcGx1Zy1pbnMgc2hpcHBlZCB3aXRoIE5TSVMgMy4wYTJcbiAqL1xuIFByaXNtLmxhbmd1YWdlcy5uc2lzID0ge1xuXHQnY29tbWVudCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkoXFwvXFwqW1xcd1xcV10qP1xcKlxcL3xbIztdLiopLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdzdHJpbmcnOiAvKFwifCcpKFxcXFw/LikqP1xcMS8sXG5cdCdrZXl3b3JkJzogL1xcYihBYm9ydHxBZGQoQnJhbmRpbmdJbWFnZXxTaXplKXxBZHZTcGxhc2h8QWxsb3coUm9vdERpckluc3RhbGx8U2tpcEZpbGVzKXxBdXRvQ2xvc2VXaW5kb3d8QmFubmVyfEJHKEZvbnR8R3JhZGllbnR8SW1hZ2UpfEJyYW5kaW5nVGV4dHxCcmluZ1RvRnJvbnR8Q2FsbChJbnN0RExMKT98Q2FwdGlvbnxDaGFuZ2VVSXxDaGVja0JpdG1hcHxDbGVhckVycm9yc3xDb21wbGV0ZWRUZXh0fENvbXBvbmVudFRleHR8Q29weUZpbGVzfENSQ0NoZWNrfENyZWF0ZShEaXJlY3Rvcnl8Rm9udHxTaG9ydEN1dCl8RGVsZXRlKElOSVNlY3xJTklTdHJ8UmVnS2V5fFJlZ1ZhbHVlKT98RGV0YWlsKFByaW50fHNCdXR0b25UZXh0KXxEaWFsZXJ8RGlyKFRleHR8VmFyfFZlcmlmeSl8RW5hYmxlV2luZG93fEVudW0oUmVnS2V5fFJlZ1ZhbHVlKXxFeGNofEV4ZWMoU2hlbGx8V2FpdCk/fEV4cGFuZEVudlN0cmluZ3N8RmlsZShCdWZTaXplfENsb3NlfEVycm9yVGV4dHxPcGVufFJlYWR8UmVhZEJ5dGV8UmVhZFVURjE2TEV8UmVhZFdvcmR8V3JpdGVVVEYxNkxFfFNlZWt8V3JpdGV8V3JpdGVCeXRlfFdyaXRlV29yZCk/fEZpbmQoQ2xvc2V8Rmlyc3R8TmV4dHxXaW5kb3cpfEZsdXNoSU5JfEdldChDdXJJbnN0VHlwZXxDdXJyZW50QWRkcmVzc3xEbGdJdGVtfERMTFZlcnNpb24oTG9jYWwpP3xFcnJvckxldmVsfEZpbGVUaW1lKExvY2FsKT98RnVsbFBhdGhOYW1lfEZ1bmN0aW9uKEFkZHJlc3N8RW5kKT98SW5zdERpckVycm9yfExhYmVsQWRkcmVzc3xUZW1wRmlsZU5hbWUpfEdvdG98SGlkZVdpbmRvd3xJY29ufElmKEFib3J0fEVycm9yc3xGaWxlRXhpc3RzfFJlYm9vdEZsYWd8U2lsZW50KXxJbml0UGx1Z2luc0RpcnxJbnN0YWxsKEJ1dHRvblRleHR8Q29sb3JzfERpcihSZWdLZXkpPyl8SW5zdFByb2dyZXNzRmxhZ3N8SW5zdChUeXBlKEdldFRleHR8U2V0VGV4dCk/KXxJbnQoQ21wVT98Rm10fE9wKXxJc1dpbmRvd3xMYW5nKERMTHxTdHJpbmcpfExpY2Vuc2UoQmtDb2xvcnxEYXRhfEZvcmNlU2VsZWN0aW9ufExhbmdTdHJpbmd8VGV4dCl8TG9hZExhbmd1YWdlRmlsZXxMb2NrV2luZG93fExvZyhTZXR8VGV4dCl8TWFuaWZlc3QoRFBJQXdhcmV8U3VwcG9ydGVkT1MpfE1hdGh8TWVzc2FnZUJveHxNaXNjQnV0dG9uVGV4dHxOYW1lfE5vcHxucyhEaWFsb2dzfEV4ZWMpfE5TSVNkbHxPdXRGaWxlfFBhZ2UoQ2FsbGJhY2tzKT98UG9wfFB1c2h8UXVpdHxSZWFkKEVudlN0cnxJTklTdHJ8UmVnRFdPUkR8UmVnU3RyKXxSZWJvb3R8UmVnRExMfFJlbmFtZXxSZXF1ZXN0RXhlY3V0aW9uTGV2ZWx8UmVzZXJ2ZUZpbGV8UmV0dXJufFJNRGlyfFNlYXJjaFBhdGh8U2VjdGlvbihFbmR8R2V0RmxhZ3N8R2V0SW5zdFR5cGVzfEdldFNpemV8R2V0VGV4dHxHcm91cHxJbnxTZXRGbGFnc3xTZXRJbnN0VHlwZXN8U2V0U2l6ZXxTZXRUZXh0KT98U2VuZE1lc3NhZ2V8U2V0KEF1dG9DbG9zZXxCcmFuZGluZ0ltYWdlfENvbXByZXNzfENvbXByZXNzb3IoRGljdFNpemUpP3xDdGxDb2xvcnN8Q3VySW5zdFR5cGV8RGF0YWJsb2NrT3B0aW1pemV8RGF0ZVNhdmV8RGV0YWlscyhQcmludHxWaWV3KXxFcnJvckxldmVsfEVycm9yc3xGaWxlQXR0cmlidXRlc3xGb250fE91dFBhdGh8T3ZlcndyaXRlfFBsdWdpblVubG9hZHxSZWJvb3RGbGFnfFJlZ1ZpZXd8U2hlbGxWYXJDb250ZXh0fFNpbGVudCl8U2hvdyhJbnN0RGV0YWlsc3xVbmluc3REZXRhaWxzfFdpbmRvdyl8U2lsZW50KEluc3RhbGx8VW5JbnN0YWxsKXxTbGVlcHxTcGFjZVRleHRzfFNwbGFzaHxTdGFydE1lbnV8U3RyKENtcFM/fENweXxMZW4pfFN1YkNhcHRpb258U3lzdGVtfFVuaWNvZGV8VW5pbnN0YWxsKEJ1dHRvblRleHR8Q2FwdGlvbnxJY29ufFN1YkNhcHRpb258VGV4dCl8VW5pbnN0UGFnZXxVblJlZ0RMTHxVc2VySW5mb3xWYXJ8VkkoQWRkVmVyc2lvbktleXxGaWxlVmVyc2lvbnxQcm9kdWN0VmVyc2lvbil8VlBhdGNofFdpbmRvd0ljb258V3JpdGUoSU5JU3RyfFJlZ0JpbnxSZWdEV09SRHxSZWdFeHBhbmRTdHJ8UmVnU3RyfFVuaW5zdGFsbGVyKXxYUFN0eWxlKVxcYi8sXG5cdCdwcm9wZXJ0eSc6IC9cXGIoYWRtaW58YWxsfGF1dG98Ym90aHxjb2xvcmVkfGZhbHNlfGZvcmNlfGhpZGV8aGlnaGVzdHxsYXN0dXNlZHxsZWF2ZXxsaXN0b25seXxub25lfG5vcm1hbHxub3RzZXR8b2ZmfG9ufG9wZW58cHJpbnR8c2hvd3xzaWxlbnR8c2lsZW50bG9nfHNtb290aHx0ZXh0b25seXx0cnVlfHVzZXJ8QVJDSElWRXxGSUxFXyhBVFRSSUJVVEVfQVJDSElWRXxBVFRSSUJVVEVfTk9STUFMfEFUVFJJQlVURV9PRkZMSU5FfEFUVFJJQlVURV9SRUFET05MWXxBVFRSSUJVVEVfU1lTVEVNfEFUVFJJQlVURV9URU1QT1JBUlkpfEhLKENSfENVfEREfExNfFBEfFUpfEhLRVlfKENMQVNTRVNfUk9PVHxDVVJSRU5UX0NPTkZJR3xDVVJSRU5UX1VTRVJ8RFlOX0RBVEF8TE9DQUxfTUFDSElORXxQRVJGT1JNQU5DRV9EQVRBfFVTRVJTKXxJRChBQk9SVHxDQU5DRUx8SUdOT1JFfE5PfE9LfFJFVFJZfFlFUyl8TUJfKEFCT1JUUkVUUllJR05PUkV8REVGQlVUVE9OMXxERUZCVVRUT04yfERFRkJVVFRPTjN8REVGQlVUVE9ONHxJQ09ORVhDTEFNQVRJT058SUNPTklORk9STUFUSU9OfElDT05RVUVTVElPTnxJQ09OU1RPUHxPS3xPS0NBTkNFTHxSRVRSWUNBTkNFTHxSSUdIVHxSVExSRUFESU5HfFNFVEZPUkVHUk9VTkR8VE9QTU9TVHxVU0VSSUNPTnxZRVNOTyl8Tk9STUFMfE9GRkxJTkV8UkVBRE9OTFl8U0hDVFh8U0hFTExfQ09OVEVYVHxTWVNURU18VEVNUE9SQVJZKVxcYi8sXG5cdCd2YXJpYWJsZSc6IC9cXCRbKHtdP1stX1xcd10rWyl9XT8vaSxcblx0J251bWJlcic6IC9cXGItPygweFtcXGRBLUZhLWZdK3xcXGQqXFwuP1xcZCsoW0VlXS0/XFxkKyk/KVxcYi8sXG5cdCdvcGVyYXRvcic6IC8tLT98XFwrXFwrP3w8PT98Pj0/fD09Pz0/fCYmP3xcXHw/XFx8fFs/KlxcL35eJV0vLFxuXHQncHVuY3R1YXRpb24nOiAvW3t9W1xcXTsoKSwuOl0vLFxuXHQnaW1wb3J0YW50JzogLyEoYWRkaW5jbHVkZWRpcnxhZGRwbHVnaW5kaXJ8YXBwZW5kZmlsZXxjZHxkZWZpbmV8ZGVsZmlsZXxlY2hvfGVsc2V8ZW5kaWZ8ZXJyb3J8ZXhlY3V0ZXxmaW5hbGl6ZXxnZXRkbGx2ZXJzaW9uc3lzdGVtfGlmZGVmfGlmbWFjcm9kZWZ8aWZtYWNyb25kZWZ8aWZuZGVmfGlmfGluY2x1ZGV8aW5zZXJ0bWFjcm98bWFjcm9lbmR8bWFjcm98bWFrZW5zaXN8cGFja2hkcnxzZWFyY2hwYXJzZXxzZWFyY2hyZXBsYWNlfHRlbXBmaWxlfHVuZGVmfHZlcmJvc2V8d2FybmluZylcXGIvaVxufTtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW5pbS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMubmltID0ge1xuXHQnY29tbWVudCc6IC8jLiovLFxuXHQvLyBEb3VibGUtcXVvdGVkIHN0cmluZ3MgY2FuIGJlIHByZWZpeGVkIGJ5IGFuIGlkZW50aWZpZXIgKEdlbmVyYWxpemVkIHJhdyBzdHJpbmcgbGl0ZXJhbHMpXG5cdC8vIENoYXJhY3RlciBsaXRlcmFscyBhcmUgaGFuZGxlZCBzcGVjaWZpY2FsbHkgdG8gcHJldmVudCBpc3N1ZXMgd2l0aCBudW1lcmljIHR5cGUgc3VmZml4ZXNcblx0J3N0cmluZyc6IC8oPzooPzpcXGIoPyFcXGQpKD86XFx3fFxcXFx4WzgtOWEtZkEtRl1bMC05YS1mQS1GXSkrKT8oPzpcIlwiXCJbXFxzXFxTXSo/XCJcIlwiKD8hXCIpfFwiKD86XFxcXFtcXHNcXFNdfFwiXCJ8W15cIlxcXFxdKSpcIil8Jyg/OlxcXFwoPzpcXGQrfHhbXFxkYS1mQS1GXXsyfXwuKXxbXiddKScpLyxcblx0Ly8gVGhlIG5lZ2F0aXZlIGxvb2sgYWhlYWQgcHJldmVudHMgd3JvbmcgaGlnaGxpZ2h0aW5nIG9mIHRoZSAuLiBvcGVyYXRvclxuXHQnbnVtYmVyJzogL1xcYig/OjBbeFhvT2JCXVtcXGRhLWZBLUZfXSt8XFxkW1xcZF9dKig/Oig/IVxcLlxcLilcXC5bXFxkX10qKT8oPzpbZUVdWystXT9cXGRbXFxkX10qKT8pKD86Jz9baXVmXVxcZCopPy8sXG5cdCdrZXl3b3JkJzogL1xcYig/OmFkZHJ8YXN8YXNtfGF0b21pY3xiaW5kfGJsb2NrfGJyZWFrfGNhc2V8Y2FzdHxjb25jZXB0fGNvbnN0fGNvbnRpbnVlfGNvbnZlcnRlcnxkZWZlcnxkaXNjYXJkfGRpc3RpbmN0fGRvfGVsaWZ8ZWxzZXxlbmR8ZW51bXxleGNlcHR8ZXhwb3J0fGZpbmFsbHl8Zm9yfGZyb218ZnVuY3xnZW5lcmljfGlmfGltcG9ydHxpbmNsdWRlfGludGVyZmFjZXxpdGVyYXRvcnxsZXR8bWFjcm98bWV0aG9kfG1peGlufG5pbHxvYmplY3R8b3V0fHByb2N8cHRyfHJhaXNlfHJlZnxyZXR1cm58c3RhdGljfHRlbXBsYXRlfHRyeXx0dXBsZXx0eXBlfHVzaW5nfHZhcnx3aGVufHdoaWxlfHdpdGh8d2l0aG91dHx5aWVsZClcXGIvLFxuXHQnZnVuY3Rpb24nOiB7XG5cdFx0cGF0dGVybjogLyg/Oig/IVxcZCkoPzpcXHd8XFxcXHhbOC05YS1mQS1GXVswLTlhLWZBLUZdKSt8YFteYFxcclxcbl0rYClcXCo/KD86XFxbW15cXF1dK1xcXSk/KD89XFxzKlxcKCkvLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J29wZXJhdG9yJzogL1xcKiQvXG5cdFx0fVxuXHR9LFxuXHQvLyBXZSBkb24ndCB3YW50IHRvIGhpZ2hsaWdodCBvcGVyYXRvcnMgaW5zaWRlIGJhY2t0aWNrc1xuXHQnaWdub3JlJzoge1xuXHRcdHBhdHRlcm46IC9gW15gXFxyXFxuXStgLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdwdW5jdHVhdGlvbic6IC9gL1xuXHRcdH1cblx0fSxcblx0J29wZXJhdG9yJzoge1xuXHRcdC8vIExvb2sgYmVoaW5kIGFuZCBsb29rIGFoZWFkIHByZXZlbnQgd3JvbmcgaGlnaGxpZ2h0aW5nIG9mIHB1bmN0dWF0aW9ucyBbLiAuXSB7LiAufSAoLiAuKVxuXHRcdC8vIGJ1dCBhbGxvdyB0aGUgc2xpY2Ugb3BlcmF0b3IgLi4gdG8gdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlbVxuXHRcdC8vIE9uZSBjYW4gZGVmaW5lIGhpcyBvd24gb3BlcmF0b3JzIGluIE5pbSBzbyBhbGwgY29tYmluYXRpb24gb2Ygb3BlcmF0b3JzIG1pZ2h0IGJlIGFuIG9wZXJhdG9yLlxuXHRcdHBhdHRlcm46IC8oXnxbKHtcXFtdKD89XFwuXFwuKXwoPyFbKHtcXFtdXFwuKS4pKD86KD86Wz0rXFwtKlxcLzw+QCR+JiV8IT9eOlxcXFxdfFxcLlxcLnxcXC4oPyFbKX1cXF1dKSkrfFxcYig/OmFuZHxkaXZ8b2Z8b3J8aW58aXN8aXNub3R8bW9kfG5vdHxub3RpbnxzaGx8c2hyfHhvcilcXGIpL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQncHVuY3R1YXRpb24nOiAvWyh7XFxbXVxcLnxcXC5bKX1cXF1dfFtgKCl7fVxcW1xcXSw6XS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tbmFzbS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMubmFzbSA9IHtcblx0J2NvbW1lbnQnOiAvOy4qJC9tLFxuXHQnc3RyaW5nJzogLyhcInwnfGApKFxcXFw/LikqP1xcMS9tLFxuXHQnbGFiZWwnOiB7XG5cdFx0cGF0dGVybjogLyheXFxzKilbQS1aYS16Ll8/JF1bXFx3Lj8kQH4jXSo6L20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ2Z1bmN0aW9uJ1xuXHR9LFxuXHQna2V5d29yZCc6IFtcblx0XHQvXFxbP0JJVFMgKDE2fDMyfDY0KVxcXT8vbSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF5cXHMqKXNlY3Rpb25cXHMqW2EtekEtWlxcLl0rOj8vaW0sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHQvKD86ZXh0ZXJufGdsb2JhbClbXjtcXHJcXG5dKi9pbSxcblx0XHQvKD86Q1BVfEZMT0FUfERFRkFVTFQpLiokL21cblx0XSxcblx0J3JlZ2lzdGVyJzoge1xuXHRcdHBhdHRlcm46IC9cXGIoPzpzdFxcZHxbeHl6XW1tXFxkXFxkP3xbY2R0XXJcXGR8clxcZFxcZD9bYndkXT98W2VyXT9bYWJjZF14fFthYmNkXVtobF18W2VyXT8oYnB8c3B8c2l8ZGkpfFtjZGVmZ3NdcylcXGIvaSxcblx0XHRhbGlhczogJ3ZhcmlhYmxlJ1xuXHR9LFxuXHQnbnVtYmVyJzogLyhcXGJ8LXwoPz1cXCQpKSgwW2h4XVtcXGRhLWZdKlxcLj9bXFxkYS1mXSsocFsrLV0/XFxkKyk/fFxcZFtcXGRhLWZdK1toeF18XFwkXFxkW1xcZGEtZl0qfDBbb3FdWzAtN10rfFswLTddK1tvcV18MFtieV1bMDFdK3xbMDFdK1tieV18MFtkdF1cXGQrfFxcZCpcXC4/XFxkKyhcXC4/ZVsrLV0/XFxkKyk/W2R0XT8pXFxiL2ksXG5cdCdvcGVyYXRvcic6IC9bXFxbXFxdKitcXC1cXC8lPD49JnwkIV0vXG59O1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tbW9ua2V5LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5tb25rZXkgPSB7XG5cdCdzdHJpbmcnOiAvXCJbXlwiXFxyXFxuXSpcIi8sXG5cdCdjb21tZW50JzogW1xuXHRcdC9eI1JlbVxccytbXFxzXFxTXSo/XiNFbmQvaW0sXG5cdFx0LycuKy8sXG5cdF0sXG5cdCdwcmVwcm9jZXNzb3InOiB7XG5cdFx0cGF0dGVybjogLyheWyBcXHRdKikjLisvbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnY29tbWVudCdcblx0fSxcblx0J2Z1bmN0aW9uJzogL1xcdysoPz1cXCgpLyxcblx0J3R5cGUtY2hhcic6IHtcblx0XHRwYXR0ZXJuOiAvKFxcdylbPyUjJF0vLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICd2YXJpYWJsZSdcblx0fSxcblx0J251bWJlcic6IHtcblx0XHRwYXR0ZXJuOiAvKCg/OlxcLlxcLik/KSg/Oig/OlxcYnxcXEItXFwuP3xcXEJcXC4pXFxkKygoPyFcXC5cXC4pXFwuXFxkKik/fFxcJFtcXGRhLWZdKykvaSxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdrZXl3b3JkJzogL1xcYig/OlZvaWR8U3RyaWN0fFB1YmxpY3xQcml2YXRlfFByb3BlcnR5fEJvb2x8SW50fEZsb2F0fFN0cmluZ3xBcnJheXxPYmplY3R8Q29udGludWV8RXhpdHxJbXBvcnR8RXh0ZXJufE5ld3xTZWxmfFN1cGVyfFRyeXxDYXRjaHxFYWNoaW58VHJ1ZXxGYWxzZXxFeHRlbmRzfEFic3RyYWN0fEZpbmFsfFNlbGVjdHxDYXNlfERlZmF1bHR8Q29uc3R8TG9jYWx8R2xvYmFsfEZpZWxkfE1ldGhvZHxGdW5jdGlvbnxDbGFzc3xFbmR8SWZ8VGhlbnxFbHNlfEVsc2VJZnxFbmRJZnxXaGlsZXxXZW5kfFJlcGVhdHxVbnRpbHxGb3JldmVyfEZvcnxUb3xTdGVwfE5leHR8UmV0dXJufE1vZHVsZXxJbnRlcmZhY2V8SW1wbGVtZW50c3xJbmxpbmV8VGhyb3d8TnVsbClcXGIvaSxcblx0J29wZXJhdG9yJzogL1xcLlxcLnw8Wz0+XT98Pj0/fDo/PXwoPzpbK1xcLSpcXC8mfnxdfFxcYig/Ok1vZHxTaGx8U2hyKVxcYik9P3xcXGIoPzpBbmR8Tm90fE9yKVxcYi9pLFxuXHQncHVuY3R1YXRpb24nOiAvWy4sOjsoKVxcW1xcXV0vXG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW1pemFyLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5taXphciA9IHtcblx0J2NvbW1lbnQnOiAvOjouKy8sXG5cdCdrZXl3b3JkJzogL0Bwcm9vZlxcYnxcXGIoPzphY2NvcmRpbmd8YWdncmVnYXRlfGFsbHxhbmR8YW50b255bXxhcmV8YXN8YXNzb2NpYXRpdml0eXxhc3N1bWV8YXN5bW1ldHJ5fGF0dHJ8YmV8YmVnaW58YmVpbmd8Ynl8Y2FuY2VsZWR8Y2FzZXxjYXNlc3xjbHVzdGVycz98Y29oZXJlbmNlfGNvbW11dGF0aXZpdHl8Y29tcGF0aWJpbGl0eXxjb25uZWN0ZWRuZXNzfGNvbnNpZGVyfGNvbnNpc3RlbmN5fGNvbnN0cnVjdG9yc3xjb250cmFkaWN0aW9ufGNvcnJlY3RuZXNzfGRlZnxkZWZmdW5jfGRlZmluZXxkZWZpbml0aW9ucz98ZGVmcHJlZHxkb3xkb2VzfGVxdWFsc3xlbmR8ZW52aXJvbnxleHxleGFjdGx5fGV4aXN0ZW5jZXxmb3J8ZnJvbXxmdW5jfGdpdmVufGhlbmNlfGhlcmVieXxob2xkc3xpZGVtcG90ZW5jZXxpZGVudGl0eXxpZmY/fGltcGxpZXN8aW52b2x1dGl2ZW5lc3N8aXJyZWZsZXhpdml0eXxpc3xpdHxsZXR8bWVhbnN8bW9kZXxub258bm90fG5vdGF0aW9ucz98bm93fG9mfG9yfG90aGVyd2lzZXxvdmVyfHBlcnxwcmVkfHByZWZpeHxwcm9qZWN0aXZpdHl8cHJvb2Z8cHJvdmlkZWR8cXVhfHJlY29uc2lkZXJ8cmVkZWZpbmV8cmVkdWNlfHJlZHVjaWJpbGl0eXxyZWZsZXhpdml0eXxyZWdpc3RyYXRpb25zP3xyZXF1aXJlbWVudHN8cmVzZXJ2ZXxzY2h8c2NoZW1lcz98c2VjdGlvbnxzZWxlY3RvcnxzZXR8c2V0aG9vZHxzdHxzdHJ1Y3R8c3VjaHxzdXBwb3NlfHN5bW1ldHJ5fHN5bm9ueW18dGFrZXx0aGF0fHRoZXx0aGVufHRoZW9yZW1zP3x0aGVzaXN8dGh1c3x0b3x0cmFuc2l0aXZpdHl8dW5pcXVlbmVzc3x2b2NhYnVsYXIoPzp5fGllcyl8d2hlbnx3aGVyZXx3aXRofHdydClcXGIvLFxuXHQncGFyYW1ldGVyJzoge1xuXHRcdHBhdHRlcm46IC9cXCQoPzoxMHxcXGQpLyxcblx0XHRhbGlhczogJ3ZhcmlhYmxlJ1xuXHR9LFxuXHQndmFyaWFibGUnOiAvXFx3Kyg/PTopLyxcblx0J251bWJlcic6IC8oPzpcXGJ8LSlcXGQrXFxiLyxcblx0J29wZXJhdG9yJzogL1xcLlxcLlxcLnwtPnwmfFxcLj89Lyxcblx0J3B1bmN0dWF0aW9uJzogL1xcKCN8I1xcKXxbLDo7XFxbXFxdKCl7fV0vXG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW1lbC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMubWVsID0ge1xuXHQnY29tbWVudCc6IC9cXC9cXC8uKi8sXG5cdCdjb2RlJzoge1xuXHRcdHBhdHRlcm46IC9gKD86XFxcXC58W15cXFxcYFxcclxcbl0pKmAvLFxuXHRcdGFsaWFzOiAnaXRhbGljJyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdkZWxpbWl0ZXInOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9eYHxgJC8sXG5cdFx0XHRcdGFsaWFzOiAncHVuY3R1YXRpb24nXG5cdFx0XHR9XG5cdFx0XHQvLyBTZWUgcmVzdCBiZWxvd1xuXHRcdH1cblx0fSxcblx0J3N0cmluZyc6IC9cIig/OlxcXFwufFteXFxcXFwiXFxyXFxuXSkqXCIvLFxuXHQndmFyaWFibGUnOiAvXFwkXFx3Ky8sXG5cdCdudW1iZXInOiAvKD86XFxifC0pKD86MHhbXFxkYS1mQS1GXSt8XFxkK1xcLj9cXGQqKS8sXG5cdCdmbGFnJzoge1xuXHRcdHBhdHRlcm46IC8tW15cXGRcXFddXFx3Ki8sXG5cdFx0YWxpYXM6ICdvcGVyYXRvcidcblx0fSxcblx0J2tleXdvcmQnOiAvXFxiKD86YnJlYWt8Y2FzZXxjb250aW51ZXxkZWZhdWx0fGRvfGVsc2V8ZmxvYXR8Zm9yfGdsb2JhbHxpZnxpbnxpbnR8bWF0cml4fHByb2N8cmV0dXJufHN0cmluZ3xzd2l0Y2h8dmVjdG9yfHdoaWxlKVxcYi8sXG5cdCdmdW5jdGlvbic6IC9cXHcrKD89XFwoKXxcXGIoPzphYm91dHxhYnN8YWRkQXR0cnxhZGRBdHRyaWJ1dGVFZGl0b3JOb2RlSGVscHxhZGREeW5hbWljfGFkZE5ld1NoZWxmVGFifGFkZFBQfGFkZFBhbmVsQ2F0ZWdvcnl8YWRkUHJlZml4VG9OYW1lfGFkdmFuY2VUb05leHREcml2ZW5LZXl8YWZmZWN0ZWROZXR8YWZmZWN0c3xhaW1Db25zdHJhaW50fGFpcnxhbGlhc3xhbGlhc0F0dHJ8YWxpZ258YWxpZ25DdHh8YWxpZ25DdXJ2ZXxhbGlnblN1cmZhY2V8YWxsVmlld0ZpdHxhbWJpZW50TGlnaHR8YW5nbGV8YW5nbGVCZXR3ZWVufGFuaW1Db25lfGFuaW1DdXJ2ZUVkaXRvcnxhbmltRGlzcGxheXxhbmltVmlld3xhbm5vdGF0ZXxhcHBlbmRTdHJpbmdBcnJheXxhcHBsaWNhdGlvbk5hbWV8YXBwbHlBdHRyUHJlc2V0fGFwcGx5VGFrZXxhcmNMZW5EaW1Db250ZXh0fGFyY0xlbmd0aERpbWVuc2lvbnxhcmNsZW58YXJyYXlNYXBwZXJ8YXJ0M2RQYWludEN0eHxhcnRBdHRyQ3R4fGFydEF0dHJQYWludFZlcnRleEN0eHxhcnRBdHRyU2tpblBhaW50Q3R4fGFydEF0dHJUb29sfGFydEJ1aWxkUGFpbnRNZW51fGFydEZsdWlkQXR0ckN0eHxhcnRQdXR0eUN0eHxhcnRTZWxlY3RDdHh8YXJ0U2V0UGFpbnRDdHh8YXJ0VXNlclBhaW50Q3R4fGFzc2lnbkNvbW1hbmR8YXNzaWduSW5wdXREZXZpY2V8YXNzaWduVmlld3BvcnRGYWN0b3JpZXN8YXR0YWNoQ3VydmV8YXR0YWNoRGV2aWNlQXR0cnxhdHRhY2hTdXJmYWNlfGF0dHJDb2xvclNsaWRlckdycHxhdHRyQ29tcGF0aWJpbGl0eXxhdHRyQ29udHJvbEdycHxhdHRyRW51bU9wdGlvbk1lbnV8YXR0ckVudW1PcHRpb25NZW51R3JwfGF0dHJGaWVsZEdycHxhdHRyRmllbGRTbGlkZXJHcnB8YXR0ck5hdmlnYXRpb25Db250cm9sR3JwfGF0dHJQcmVzZXRFZGl0V2lufGF0dHJpYnV0ZUV4aXN0c3xhdHRyaWJ1dGVJbmZvfGF0dHJpYnV0ZU1lbnV8YXR0cmlidXRlUXVlcnl8YXV0b0tleWZyYW1lfGF1dG9QbGFjZXxiYWtlQ2xpcHxiYWtlRmx1aWRTaGFkaW5nfGJha2VQYXJ0aWFsSGlzdG9yeXxiYWtlUmVzdWx0c3xiYWtlU2ltdWxhdGlvbnxiYXNlbmFtZXxiYXNlbmFtZUV4fGJhdGNoUmVuZGVyfGJlc3NlbHxiZXZlbHxiZXZlbFBsdXN8YmluTWVtYmVyc2hpcHxiaW5kU2tpbnxibGVuZDJ8YmxlbmRTaGFwZXxibGVuZFNoYXBlRWRpdG9yfGJsZW5kU2hhcGVQYW5lbHxibGVuZFR3b0F0dHJ8YmxpbmREYXRhVHlwZXxib25lTGF0dGljZXxib3VuZGFyeXxib3hEb2xseUN0eHxib3hab29tQ3R4fGJ1ZmZlckN1cnZlfGJ1aWxkQm9va21hcmtNZW51fGJ1aWxkS2V5ZnJhbWVNZW51fGJ1dHRvbnxidXR0b25NYW5pcHxDQkd8Y2FjaGVGaWxlfGNhY2hlRmlsZUNvbWJpbmV8Y2FjaGVGaWxlTWVyZ2V8Y2FjaGVGaWxlVHJhY2t8Y2FtZXJhfGNhbWVyYVZpZXd8Y2FuQ3JlYXRlTWFuaXB8Y2FudmFzfGNhcGl0YWxpemVTdHJpbmd8Y2F0Y2h8Y2F0Y2hRdWlldHxjZWlsfGNoYW5nZVN1YmRpdkNvbXBvbmVudERpc3BsYXlMZXZlbHxjaGFuZ2VTdWJkaXZSZWdpb258Y2hhbm5lbEJveHxjaGFyYWN0ZXJ8Y2hhcmFjdGVyTWFwfGNoYXJhY3Rlck91dGxpbmVFZGl0b3J8Y2hhcmFjdGVyaXplfGNoZGlyfGNoZWNrQm94fGNoZWNrQm94R3JwfGNoZWNrRGVmYXVsdFJlbmRlckdsb2JhbHN8Y2hvaWNlfGNpcmNsZXxjaXJjdWxhckZpbGxldHxjbGFtcHxjbGVhcnxjbGVhckNhY2hlfGNsaXB8Y2xpcEVkaXRvcnxjbGlwRWRpdG9yQ3VycmVudFRpbWVDdHh8Y2xpcFNjaGVkdWxlfGNsaXBTY2hlZHVsZXJPdXRsaW5lcnxjbGlwVHJpbUJlZm9yZXxjbG9zZUN1cnZlfGNsb3NlU3VyZmFjZXxjbHVzdGVyfGNtZEZpbGVPdXRwdXR8Y21kU2Nyb2xsRmllbGRFeGVjdXRlcnxjbWRTY3JvbGxGaWVsZFJlcG9ydGVyfGNtZFNoZWxsfGNvYXJzZW5TdWJkaXZTZWxlY3Rpb25MaXN0fGNvbGxpc2lvbnxjb2xvcnxjb2xvckF0UG9pbnR8Y29sb3JFZGl0b3J8Y29sb3JJbmRleHxjb2xvckluZGV4U2xpZGVyR3JwfGNvbG9yU2xpZGVyQnV0dG9uR3JwfGNvbG9yU2xpZGVyR3JwfGNvbHVtbkxheW91dHxjb21tYW5kRWNob3xjb21tYW5kTGluZXxjb21tYW5kUG9ydHxjb21wYWN0SGFpclN5c3RlbXxjb21wb25lbnRFZGl0b3J8Y29tcG9zaXRpbmdJbnRlcm9wfGNvbXB1dGVQb2x5c2V0Vm9sdW1lfGNvbmRpdGlvbnxjb25lfGNvbmZpcm1EaWFsb2d8Y29ubmVjdEF0dHJ8Y29ubmVjdENvbnRyb2x8Y29ubmVjdER5bmFtaWN8Y29ubmVjdEpvaW50fGNvbm5lY3Rpb25JbmZvfGNvbnN0cmFpbnxjb25zdHJhaW5WYWx1ZXxjb25zdHJ1Y3Rpb25IaXN0b3J5fGNvbnRhaW5lcnxjb250YWluc011bHRpYnl0ZXxjb250ZXh0SW5mb3xjb250cm9sfGNvbnZlcnRGcm9tT2xkTGF5ZXJzfGNvbnZlcnRJZmZUb1BzZHxjb252ZXJ0TGlnaHRtYXB8Y29udmVydFNvbGlkVHh8Y29udmVydFRlc3NlbGxhdGlvbnxjb252ZXJ0VW5pdHxjb3B5QXJyYXl8Y29weUZsZXhvcnxjb3B5S2V5fGNvcHlTa2luV2VpZ2h0c3xjb3N8Y3BCdXR0b258Y3BDYWNoZXxjcENsb3RoU2V0fGNwQ29sbGlzaW9ufGNwQ29uc3RyYWludHxjcENvbnZDbG90aFRvTWVzaHxjcEZvcmNlc3xjcEdldFNvbHZlckF0dHJ8Y3BQYW5lbHxjcFByb3BlcnR5fGNwUmlnaWRDb2xsaXNpb25GaWx0ZXJ8Y3BTZWFtfGNwU2V0RWRpdHxjcFNldFNvbHZlckF0dHJ8Y3BTb2x2ZXJ8Y3BTb2x2ZXJUeXBlc3xjcFRvb2x8Y3BVcGRhdGVDbG90aFVWc3xjcmVhdGVEaXNwbGF5TGF5ZXJ8Y3JlYXRlRHJhd0N0eHxjcmVhdGVFZGl0b3J8Y3JlYXRlTGF5ZXJlZFBzZEZpbGV8Y3JlYXRlTW90aW9uRmllbGR8Y3JlYXRlTmV3U2hlbGZ8Y3JlYXRlTm9kZXxjcmVhdGVSZW5kZXJMYXllcnxjcmVhdGVTdWJkaXZSZWdpb258Y3Jvc3N8Y3Jvc3NQcm9kdWN0fGN0eEFib3J0fGN0eENvbXBsZXRpb258Y3R4RWRpdE1vZGV8Y3R4VHJhdmVyc2V8Y3VycmVudEN0eHxjdXJyZW50VGltZXxjdXJyZW50VGltZUN0eHxjdXJyZW50VW5pdHxjdXJ2ZXxjdXJ2ZUFkZFB0Q3R4fGN1cnZlQ1ZDdHh8Y3VydmVFUEN0eHxjdXJ2ZUVkaXRvckN0eHxjdXJ2ZUludGVyc2VjdHxjdXJ2ZU1vdmVFUEN0eHxjdXJ2ZU9uU3VyZmFjZXxjdXJ2ZVNrZXRjaEN0eHxjdXRLZXl8Y3ljbGVDaGVja3xjeWxpbmRlcnxkYWdQb3NlfGRhdGV8ZGVmYXVsdExpZ2h0TGlzdENoZWNrQm94fGRlZmF1bHROYXZpZ2F0aW9ufGRlZmluZURhdGFTZXJ2ZXJ8ZGVmaW5lVmlydHVhbERldmljZXxkZWZvcm1lcnxkZWdfdG9fcmFkfGRlbGV0ZXxkZWxldGVBdHRyfGRlbGV0ZVNoYWRpbmdHcm91cHNBbmRNYXRlcmlhbHN8ZGVsZXRlU2hlbGZUYWJ8ZGVsZXRlVUl8ZGVsZXRlVW51c2VkQnJ1c2hlc3xkZWxyYW5kc3RyfGRldGFjaEN1cnZlfGRldGFjaERldmljZUF0dHJ8ZGV0YWNoU3VyZmFjZXxkZXZpY2VFZGl0b3J8ZGV2aWNlUGFuZWx8ZGdJbmZvfGRnZGlydHl8ZGdldmFsfGRndGltZXJ8ZGltV2hlbnxkaXJlY3RLZXlDdHh8ZGlyZWN0aW9uYWxMaWdodHxkaXJtYXB8ZGlybmFtZXxkaXNhYmxlfGRpc2Nvbm5lY3RBdHRyfGRpc2Nvbm5lY3RKb2ludHxkaXNrQ2FjaGV8ZGlzcGxhY2VtZW50VG9Qb2x5fGRpc3BsYXlBZmZlY3RlZHxkaXNwbGF5Q29sb3J8ZGlzcGxheUN1bGx8ZGlzcGxheUxldmVsT2ZEZXRhaWx8ZGlzcGxheVByZWZ8ZGlzcGxheVJHQkNvbG9yfGRpc3BsYXlTbW9vdGhuZXNzfGRpc3BsYXlTdGF0c3xkaXNwbGF5U3RyaW5nfGRpc3BsYXlTdXJmYWNlfGRpc3RhbmNlRGltQ29udGV4dHxkaXN0YW5jZURpbWVuc2lvbnxkb0JsdXJ8ZG9sbHl8ZG9sbHlDdHh8ZG9wZVNoZWV0RWRpdG9yfGRvdHxkb3RQcm9kdWN0fGRvdWJsZVByb2ZpbGVCaXJhaWxTdXJmYWNlfGRyYWd8ZHJhZ0F0dHJDb250ZXh0fGRyYWdnZXJDb250ZXh0fGRyb3BvZmZMb2NhdG9yfGR1cGxpY2F0ZXxkdXBsaWNhdGVDdXJ2ZXxkdXBsaWNhdGVTdXJmYWNlfGR5bkNhY2hlfGR5bkNvbnRyb2x8ZHluRXhwb3J0fGR5bkV4cHJlc3Npb258ZHluR2xvYmFsc3xkeW5QYWludEVkaXRvcnxkeW5QYXJ0aWNsZUN0eHxkeW5QcmVmfGR5blJlbEVkUGFuZWx8ZHluUmVsRWRpdG9yfGR5bmFtaWNMb2FkfGVkaXRBdHRyTGltaXRzfGVkaXREaXNwbGF5TGF5ZXJHbG9iYWxzfGVkaXREaXNwbGF5TGF5ZXJNZW1iZXJzfGVkaXRSZW5kZXJMYXllckFkanVzdG1lbnR8ZWRpdFJlbmRlckxheWVyR2xvYmFsc3xlZGl0UmVuZGVyTGF5ZXJNZW1iZXJzfGVkaXRvcnxlZGl0b3JUZW1wbGF0ZXxlZmZlY3RvcnxlbWl0fGVtaXR0ZXJ8ZW5hYmxlRGV2aWNlfGVuY29kZVN0cmluZ3xlbmRTdHJpbmd8ZW5kc1dpdGh8ZW52fGVxdWl2YWxlbnR8ZXF1aXZhbGVudFRvbHxlcmZ8ZXJyb3J8ZXZhbHxldmFsRGVmZXJyZWR8ZXZhbEVjaG98ZXZlbnR8ZXhhY3RXb3JsZEJvdW5kaW5nQm94fGV4Y2x1c2l2ZUxpZ2h0Q2hlY2tCb3h8ZXhlY3xleGVjdXRlRm9yRWFjaE9iamVjdHxleGlzdHN8ZXhwfGV4cHJlc3Npb258ZXhwcmVzc2lvbkVkaXRvckxpc3RlbnxleHRlbmRDdXJ2ZXxleHRlbmRTdXJmYWNlfGV4dHJ1ZGV8ZmNoZWNrfGZjbG9zZXxmZW9mfGZmbHVzaHxmZ2V0bGluZXxmZ2V0d29yZHxmaWxlfGZpbGVCcm93c2VyRGlhbG9nfGZpbGVEaWFsb2d8ZmlsZUV4dGVuc2lvbnxmaWxlSW5mb3xmaWxldGVzdHxmaWxsZXRDdXJ2ZXxmaWx0ZXJ8ZmlsdGVyQ3VydmV8ZmlsdGVyRXhwYW5kfGZpbHRlclN0dWRpb0ltcG9ydHxmaW5kQWxsSW50ZXJzZWN0aW9uc3xmaW5kQW5pbUN1cnZlc3xmaW5kS2V5ZnJhbWV8ZmluZE1lbnVJdGVtfGZpbmRSZWxhdGVkU2tpbkNsdXN0ZXJ8ZmluZGVyfGZpcnN0UGFyZW50T2Z8Zml0QnNwbGluZXxmbGV4b3J8ZmxvYXRFcXxmbG9hdEZpZWxkfGZsb2F0RmllbGRHcnB8ZmxvYXRTY3JvbGxCYXJ8ZmxvYXRTbGlkZXJ8ZmxvYXRTbGlkZXIyfGZsb2F0U2xpZGVyQnV0dG9uR3JwfGZsb2F0U2xpZGVyR3JwfGZsb29yfGZsb3d8Zmx1aWRDYWNoZUluZm98Zmx1aWRFbWl0dGVyfGZsdWlkVm94ZWxJbmZvfGZsdXNoVW5kb3xmbW9kfGZvbnREaWFsb2d8Zm9wZW58Zm9ybUxheW91dHxmb3JtYXR8ZnByaW50fGZyYW1lTGF5b3V0fGZyZWFkfGZyZWVGb3JtRmlsbGV0fGZyZXdpbmR8ZnJvbU5hdGl2ZVBhdGh8ZndyaXRlfGdhbW1hfGdhdXNzfGdlb21ldHJ5Q29uc3RyYWludHxnZXRBcHBsaWNhdGlvblZlcnNpb25Bc0Zsb2F0fGdldEF0dHJ8Z2V0Q2xhc3NpZmljYXRpb258Z2V0RGVmYXVsdEJydXNofGdldEZpbGVMaXN0fGdldEZsdWlkQXR0cnxnZXRJbnB1dERldmljZVJhbmdlfGdldE1heWFQYW5lbFR5cGVzfGdldE1vZGlmaWVyc3xnZXRQYW5lbHxnZXRQYXJ0aWNsZUF0dHJ8Z2V0UGx1Z2luUmVzb3VyY2V8Z2V0ZW52fGdldHBpZHxnbFJlbmRlcnxnbFJlbmRlckVkaXRvcnxnbG9iYWxTdGl0Y2h8Z21hdGNofGdvYWx8Z290b0JpbmRQb3NlfGdyYWJDb2xvcnxncmFkaWVudENvbnRyb2x8Z3JhZGllbnRDb250cm9sTm9BdHRyfGdyYXBoRG9sbHlDdHh8Z3JhcGhTZWxlY3RDb250ZXh0fGdyYXBoVHJhY2tDdHh8Z3Jhdml0eXxncmlkfGdyaWRMYXlvdXR8Z3JvdXB8Z3JvdXBPYmplY3RzQnlOYW1lfEhmQWRkQXR0cmFjdG9yVG9BU3xIZkFzc2lnbkFTfEhmQnVpbGRFcXVhbE1hcHxIZkJ1aWxkRnVyRmlsZXN8SGZCdWlsZEZ1ckltYWdlc3xIZkNhbmNlbEFGUnxIZkNvbm5lY3RBU1RvSEZ8SGZDcmVhdGVBdHRyYWN0b3J8SGZEZWxldGVBU3xIZkVkaXRBU3xIZlBlcmZvcm1DcmVhdGVBU3xIZlJlbW92ZUF0dHJhY3RvckZyb21BU3xIZlNlbGVjdEF0dGFjaGVkfEhmU2VsZWN0QXR0cmFjdG9yc3xIZlVuQXNzaWduQVN8aGFyZGVuUG9pbnRDdXJ2ZXxoYXJkd2FyZXxoYXJkd2FyZVJlbmRlclBhbmVsfGhlYWRzVXBEaXNwbGF5fGhlYWRzVXBNZXNzYWdlfGhlbHB8aGVscExpbmV8aGVybWl0ZXxoaWRlfGhpbGl0ZXxoaXRUZXN0fGhvdEJveHxob3RrZXl8aG90a2V5Q2hlY2t8aHN2X3RvX3JnYnxodWRCdXR0b258aHVkU2xpZGVyfGh1ZFNsaWRlckJ1dHRvbnxod1JlZmxlY3Rpb25NYXB8aHdSZW5kZXJ8aHdSZW5kZXJMb2FkfGh5cGVyR3JhcGh8aHlwZXJQYW5lbHxoeXBlclNoYWRlfGh5cG90fGljb25UZXh0QnV0dG9ufGljb25UZXh0Q2hlY2tCb3h8aWNvblRleHRSYWRpb0J1dHRvbnxpY29uVGV4dFJhZGlvQ29sbGVjdGlvbnxpY29uVGV4dFNjcm9sbExpc3R8aWNvblRleHRTdGF0aWNMYWJlbHxpa0hhbmRsZXxpa0hhbmRsZUN0eHxpa0hhbmRsZURpc3BsYXlTY2FsZXxpa1NvbHZlcnxpa1NwbGluZUhhbmRsZUN0eHxpa1N5c3RlbXxpa1N5c3RlbUluZm98aWtma0Rpc3BsYXlNZXRob2R8aWxsdXN0cmF0b3JDdXJ2ZXN8aW1hZ2V8aW1mUGx1Z2luc3xpbmhlcml0VHJhbnNmb3JtfGluc2VydEpvaW50fGluc2VydEpvaW50Q3R4fGluc2VydEtleUN0eHxpbnNlcnRLbm90Q3VydmV8aW5zZXJ0S25vdFN1cmZhY2V8aW5zdGFuY2V8aW5zdGFuY2VhYmxlfGluc3RhbmNlcnxpbnRGaWVsZHxpbnRGaWVsZEdycHxpbnRTY3JvbGxCYXJ8aW50U2xpZGVyfGludFNsaWRlckdycHxpbnRlclRvVUl8aW50ZXJuYWxWYXJ8aW50ZXJzZWN0fGlwckVuZ2luZXxpc0FuaW1DdXJ2ZXxpc0Nvbm5lY3RlZHxpc0RpcnR5fGlzUGFyZW50T2Z8aXNTYW1lT2JqZWN0fGlzVHJ1ZXxpc1ZhbGlkT2JqZWN0TmFtZXxpc1ZhbGlkU3RyaW5nfGlzVmFsaWRVaU5hbWV8aXNvbGF0ZVNlbGVjdHxpdGVtRmlsdGVyfGl0ZW1GaWx0ZXJBdHRyfGl0ZW1GaWx0ZXJSZW5kZXJ8aXRlbUZpbHRlclR5cGV8am9pbnR8am9pbnRDbHVzdGVyfGpvaW50Q3R4fGpvaW50RGlzcGxheVNjYWxlfGpvaW50TGF0dGljZXxrZXlUYW5nZW50fGtleWZyYW1lfGtleWZyYW1lT3V0bGluZXJ8a2V5ZnJhbWVSZWdpb25DdXJyZW50VGltZUN0eHxrZXlmcmFtZVJlZ2lvbkRpcmVjdEtleUN0eHxrZXlmcmFtZVJlZ2lvbkRvbGx5Q3R4fGtleWZyYW1lUmVnaW9uSW5zZXJ0S2V5Q3R4fGtleWZyYW1lUmVnaW9uTW92ZUtleUN0eHxrZXlmcmFtZVJlZ2lvblNjYWxlS2V5Q3R4fGtleWZyYW1lUmVnaW9uU2VsZWN0S2V5Q3R4fGtleWZyYW1lUmVnaW9uU2V0S2V5Q3R4fGtleWZyYW1lUmVnaW9uVHJhY2tDdHh8a2V5ZnJhbWVTdGF0c3xsYXNzb0NvbnRleHR8bGF0dGljZXxsYXR0aWNlRGVmb3JtS2V5Q3R4fGxhdW5jaHxsYXVuY2hJbWFnZUVkaXRvcnxsYXllckJ1dHRvbnxsYXllcmVkU2hhZGVyUG9ydHxsYXllcmVkVGV4dHVyZVBvcnR8bGF5b3V0fGxheW91dERpYWxvZ3xsaWdodExpc3R8bGlnaHRMaXN0RWRpdG9yfGxpZ2h0TGlzdFBhbmVsfGxpZ2h0bGlua3xsaW5lSW50ZXJzZWN0aW9ufGxpbmVhclByZWNpc2lvbnxsaW5zdGVwfGxpc3RBbmltYXRhYmxlfGxpc3RBdHRyfGxpc3RDYW1lcmFzfGxpc3RDb25uZWN0aW9uc3xsaXN0RGV2aWNlQXR0YWNobWVudHN8bGlzdEhpc3Rvcnl8bGlzdElucHV0RGV2aWNlQXhlc3xsaXN0SW5wdXREZXZpY2VCdXR0b25zfGxpc3RJbnB1dERldmljZXN8bGlzdE1lbnVBbm5vdGF0aW9ufGxpc3ROb2RlVHlwZXN8bGlzdFBhbmVsQ2F0ZWdvcmllc3xsaXN0UmVsYXRpdmVzfGxpc3RTZXRzfGxpc3RUcmFuc2Zvcm1zfGxpc3RVbnNlbGVjdGVkfGxpc3RlckVkaXRvcnxsb2FkRmx1aWR8bG9hZE5ld1NoZWxmfGxvYWRQbHVnaW58bG9hZFBsdWdpbkxhbmd1YWdlUmVzb3VyY2VzfGxvYWRQcmVmT2JqZWN0c3xsb2NhbGl6ZWRQYW5lbExhYmVsfGxvY2tOb2RlfGxvZnR8bG9nfGxvbmdOYW1lT2Z8bG9va1RocnV8bHN8bHNUaHJvdWdoRmlsdGVyfGxzVHlwZXxsc1VJfE1heWF0b21yfG1hZ3xtYWtlSWRlbnRpdHl8bWFrZUxpdmV8bWFrZVBhaW50YWJsZXxtYWtlUm9sbHxtYWtlU2luZ2xlU3VyZmFjZXxtYWtlVHViZU9ufG1ha2Vib3R8bWFuaXBNb3ZlQ29udGV4dHxtYW5pcE1vdmVMaW1pdHNDdHh8bWFuaXBPcHRpb25zfG1hbmlwUm90YXRlQ29udGV4dHxtYW5pcFJvdGF0ZUxpbWl0c0N0eHxtYW5pcFNjYWxlQ29udGV4dHxtYW5pcFNjYWxlTGltaXRzQ3R4fG1hcmtlcnxtYXRjaHxtYXh8bWVtb3J5fG1lbnV8bWVudUJhckxheW91dHxtZW51RWRpdG9yfG1lbnVJdGVtfG1lbnVJdGVtVG9TaGVsZnxtZW51U2V0fG1lbnVTZXRQcmVmfG1lc3NhZ2VMaW5lfG1pbnxtaW5pbWl6ZUFwcHxtaXJyb3JKb2ludHxtb2RlbEN1cnJlbnRUaW1lQ3R4fG1vZGVsRWRpdG9yfG1vZGVsUGFuZWx8bW91c2V8bW92SW58bW92T3V0fG1vdmV8bW92ZUlLdG9GS3xtb3ZlS2V5Q3R4fG1vdmVWZXJ0ZXhBbG9uZ0RpcmVjdGlvbnxtdWx0aVByb2ZpbGVCaXJhaWxTdXJmYWNlfG11dGV8blBhcnRpY2xlfG5hbWVDb21tYW5kfG5hbWVGaWVsZHxuYW1lc3BhY2V8bmFtZXNwYWNlSW5mb3xuZXdQYW5lbEl0ZW1zfG5ld3Rvbnxub2RlQ2FzdHxub2RlSWNvbkJ1dHRvbnxub2RlT3V0bGluZXJ8bm9kZVByZXNldHxub2RlVHlwZXxub2lzZXxub25MaW5lYXJ8bm9ybWFsQ29uc3RyYWludHxub3JtYWxpemV8bnVyYnNCb29sZWFufG51cmJzQ29weVVWU2V0fG51cmJzQ3ViZXxudXJic0VkaXRVVnxudXJic1BsYW5lfG51cmJzU2VsZWN0fG51cmJzU3F1YXJlfG51cmJzVG9Qb2x5fG51cmJzVG9Qb2x5Z29uc1ByZWZ8bnVyYnNUb1N1YmRpdnxudXJic1RvU3ViZGl2UHJlZnxudXJic1VWU2V0fG51cmJzVmlld0RpcmVjdGlvblZlY3RvcnxvYmpFeGlzdHN8b2JqZWN0Q2VudGVyfG9iamVjdExheWVyfG9iamVjdFR5cGV8b2JqZWN0VHlwZVVJfG9ic29sZXRlUHJvY3xvY2Vhbk51cmJzUHJldmlld1BsYW5lfG9mZnNldEN1cnZlfG9mZnNldEN1cnZlT25TdXJmYWNlfG9mZnNldFN1cmZhY2V8b3BlbkdMRXh0ZW5zaW9ufG9wZW5NYXlhUHJlZnxvcHRpb25NZW51fG9wdGlvbk1lbnVHcnB8b3B0aW9uVmFyfG9yYml0fG9yYml0Q3R4fG9yaWVudENvbnN0cmFpbnR8b3V0bGluZXJFZGl0b3J8b3V0bGluZXJQYW5lbHxvdmVycmlkZU1vZGlmaWVyfHBhaW50RWZmZWN0c0Rpc3BsYXl8cGFpckJsZW5kfHBhbGV0dGVQb3J0fHBhbmVMYXlvdXR8cGFuZWx8cGFuZWxDb25maWd1cmF0aW9ufHBhbmVsSGlzdG9yeXxwYXJhbURpbUNvbnRleHR8cGFyYW1EaW1lbnNpb258cGFyYW1Mb2NhdG9yfHBhcmVudHxwYXJlbnRDb25zdHJhaW50fHBhcnRpY2xlfHBhcnRpY2xlRXhpc3RzfHBhcnRpY2xlSW5zdGFuY2VyfHBhcnRpY2xlUmVuZGVySW5mb3xwYXJ0aXRpb258cGFzdGVLZXl8cGF0aEFuaW1hdGlvbnxwYXVzZXxwY2xvc2V8cGVyY2VudHxwZXJmb3JtYW5jZU9wdGlvbnN8cGZ4c3Ryb2tlc3xwaWNrV2Fsa3xwaWN0dXJlfHBpeGVsTW92ZXxwbGFuYXJTcmZ8cGxhbmV8cGxheXxwbGF5YmFja09wdGlvbnN8cGxheWJsYXN0fHBsdWdBdHRyfHBsdWdOb2RlfHBsdWdpbkluZm98cGx1Z2luUmVzb3VyY2VVdGlsfHBvaW50Q29uc3RyYWludHxwb2ludEN1cnZlQ29uc3RyYWludHxwb2ludExpZ2h0fHBvaW50TWF0cml4TXVsdHxwb2ludE9uQ3VydmV8cG9pbnRPblN1cmZhY2V8cG9pbnRQb3NpdGlvbnxwb2xlVmVjdG9yQ29uc3RyYWludHxwb2x5QXBwZW5kfHBvbHlBcHBlbmRGYWNldEN0eHxwb2x5QXBwZW5kVmVydGV4fHBvbHlBdXRvUHJvamVjdGlvbnxwb2x5QXZlcmFnZU5vcm1hbHxwb2x5QXZlcmFnZVZlcnRleHxwb2x5QmV2ZWx8cG9seUJsZW5kQ29sb3J8cG9seUJsaW5kRGF0YXxwb2x5Qm9vbE9wfHBvbHlCcmlkZ2VFZGdlfHBvbHlDYWNoZU1vbml0b3J8cG9seUNoZWNrfHBvbHlDaGlwT2ZmfHBvbHlDbGlwYm9hcmR8cG9seUNsb3NlQm9yZGVyfHBvbHlDb2xsYXBzZUVkZ2V8cG9seUNvbGxhcHNlRmFjZXR8cG9seUNvbG9yQmxpbmREYXRhfHBvbHlDb2xvckRlbHxwb2x5Q29sb3JQZXJWZXJ0ZXh8cG9seUNvbG9yU2V0fHBvbHlDb21wYXJlfHBvbHlDb25lfHBvbHlDb3B5VVZ8cG9seUNyZWFzZXxwb2x5Q3JlYXNlQ3R4fHBvbHlDcmVhdGVGYWNldHxwb2x5Q3JlYXRlRmFjZXRDdHh8cG9seUN1YmV8cG9seUN1dHxwb2x5Q3V0Q3R4fHBvbHlDeWxpbmRlcnxwb2x5Q3lsaW5kcmljYWxQcm9qZWN0aW9ufHBvbHlEZWxFZGdlfHBvbHlEZWxGYWNldHxwb2x5RGVsVmVydGV4fHBvbHlEdXBsaWNhdGVBbmRDb25uZWN0fHBvbHlEdXBsaWNhdGVFZGdlfHBvbHlFZGl0VVZ8cG9seUVkaXRVVlNoZWxsfHBvbHlFdmFsdWF0ZXxwb2x5RXh0cnVkZUVkZ2V8cG9seUV4dHJ1ZGVGYWNldHxwb2x5RXh0cnVkZVZlcnRleHxwb2x5RmxpcEVkZ2V8cG9seUZsaXBVVnxwb2x5Rm9yY2VVVnxwb2x5R2VvU2FtcGxlcnxwb2x5SGVsaXh8cG9seUluZm98cG9seUluc3RhbGxBY3Rpb258cG9seUxheW91dFVWfHBvbHlMaXN0Q29tcG9uZW50Q29udmVyc2lvbnxwb2x5TWFwQ3V0fHBvbHlNYXBEZWx8cG9seU1hcFNld3xwb2x5TWFwU2V3TW92ZXxwb2x5TWVyZ2VFZGdlfHBvbHlNZXJnZUVkZ2VDdHh8cG9seU1lcmdlRmFjZXR8cG9seU1lcmdlRmFjZXRDdHh8cG9seU1lcmdlVVZ8cG9seU1lcmdlVmVydGV4fHBvbHlNaXJyb3JGYWNlfHBvbHlNb3ZlRWRnZXxwb2x5TW92ZUZhY2V0fHBvbHlNb3ZlRmFjZXRVVnxwb2x5TW92ZVVWfHBvbHlNb3ZlVmVydGV4fHBvbHlOb3JtYWx8cG9seU5vcm1hbFBlclZlcnRleHxwb2x5Tm9ybWFsaXplVVZ8cG9seU9wdFV2c3xwb2x5T3B0aW9uc3xwb2x5T3V0cHV0fHBvbHlQaXBlfHBvbHlQbGFuYXJQcm9qZWN0aW9ufHBvbHlQbGFuZXxwb2x5UGxhdG9uaWNTb2xpZHxwb2x5UG9rZXxwb2x5UHJpbWl0aXZlfHBvbHlQcmlzbXxwb2x5UHJvamVjdGlvbnxwb2x5UHlyYW1pZHxwb2x5UXVhZHxwb2x5UXVlcnlCbGluZERhdGF8cG9seVJlZHVjZXxwb2x5U2VsZWN0fHBvbHlTZWxlY3RDb25zdHJhaW50fHBvbHlTZWxlY3RDb25zdHJhaW50TW9uaXRvcnxwb2x5U2VsZWN0Q3R4fHBvbHlTZWxlY3RFZGl0Q3R4fHBvbHlTZXBhcmF0ZXxwb2x5U2V0VG9GYWNlTm9ybWFsfHBvbHlTZXdFZGdlfHBvbHlTaG9ydGVzdFBhdGhDdHh8cG9seVNtb290aHxwb2x5U29mdEVkZ2V8cG9seVNwaGVyZXxwb2x5U3BoZXJpY2FsUHJvamVjdGlvbnxwb2x5U3BsaXR8cG9seVNwbGl0Q3R4fHBvbHlTcGxpdEVkZ2V8cG9seVNwbGl0UmluZ3xwb2x5U3BsaXRWZXJ0ZXh8cG9seVN0cmFpZ2h0ZW5VVkJvcmRlcnxwb2x5U3ViZGl2aWRlRWRnZXxwb2x5U3ViZGl2aWRlRmFjZXR8cG9seVRvU3ViZGl2fHBvbHlUb3J1c3xwb2x5VHJhbnNmZXJ8cG9seVRyaWFuZ3VsYXRlfHBvbHlVVlNldHxwb2x5VW5pdGV8cG9seVdlZGdlRmFjZXxwb3Blbnxwb3B1cE1lbnV8cG9zZXxwb3d8cHJlbG9hZFJlZkVkfHByaW50fHByb2dyZXNzQmFyfHByb2dyZXNzV2luZG93fHByb2pGaWxlVmlld2VyfHByb2plY3RDdXJ2ZXxwcm9qZWN0VGFuZ2VudHxwcm9qZWN0aW9uQ29udGV4dHxwcm9qZWN0aW9uTWFuaXB8cHJvbXB0RGlhbG9nfHByb3BNb2RDdHh8cHJvcE1vdmV8cHNkQ2hhbm5lbE91dGxpbmVyfHBzZEVkaXRUZXh0dXJlRmlsZXxwc2RFeHBvcnR8cHNkVGV4dHVyZUZpbGV8cHV0ZW52fHB3ZHxweXRob258cXVlcnlTdWJkaXZ8cXVpdHxyYWRfdG9fZGVnfHJhZGlhbHxyYWRpb0J1dHRvbnxyYWRpb0J1dHRvbkdycHxyYWRpb0NvbGxlY3Rpb258cmFkaW9NZW51SXRlbUNvbGxlY3Rpb258cmFtcENvbG9yUG9ydHxyYW5kfHJhbmRvbWl6ZUZvbGxpY2xlc3xyYW5kc3RhdGV8cmFuZ2VDb250cm9sfHJlYWRUYWtlfHJlYnVpbGRDdXJ2ZXxyZWJ1aWxkU3VyZmFjZXxyZWNvcmRBdHRyfHJlY29yZERldmljZXxyZWRvfHJlZmVyZW5jZXxyZWZlcmVuY2VFZGl0fHJlZmVyZW5jZVF1ZXJ5fHJlZmluZVN1YmRpdlNlbGVjdGlvbkxpc3R8cmVmcmVzaHxyZWZyZXNoQUV8cmVnaXN0ZXJQbHVnaW5SZXNvdXJjZXxyZWhhc2h8cmVsb2FkSW1hZ2V8cmVtb3ZlSm9pbnR8cmVtb3ZlTXVsdGlJbnN0YW5jZXxyZW1vdmVQYW5lbENhdGVnb3J5fHJlbmFtZXxyZW5hbWVBdHRyfHJlbmFtZVNlbGVjdGlvbkxpc3R8cmVuYW1lVUl8cmVuZGVyfHJlbmRlckdsb2JhbHNOb2RlfHJlbmRlckluZm98cmVuZGVyTGF5ZXJCdXR0b258cmVuZGVyTGF5ZXJQYXJlbnR8cmVuZGVyTGF5ZXJQb3N0UHJvY2Vzc3xyZW5kZXJMYXllclVucGFyZW50fHJlbmRlck1hbmlwfHJlbmRlclBhcnRpdGlvbnxyZW5kZXJRdWFsaXR5Tm9kZXxyZW5kZXJTZXR0aW5nc3xyZW5kZXJUaHVtYm5haWxVcGRhdGV8cmVuZGVyV2luZG93RWRpdG9yfHJlbmRlcldpbmRvd1NlbGVjdENvbnRleHR8cmVuZGVyZXJ8cmVvcmRlcnxyZW9yZGVyRGVmb3JtZXJzfHJlcXVpcmVzfHJlcm9vdHxyZXNhbXBsZUZsdWlkfHJlc2V0QUV8cmVzZXRQZnhUb1BvbHlDYW1lcmF8cmVzZXRUb29sfHJlc29sdXRpb25Ob2RlfHJldGFyZ2V0fHJldmVyc2VDdXJ2ZXxyZXZlcnNlU3VyZmFjZXxyZXZvbHZlfHJnYl90b19oc3Z8cmlnaWRCb2R5fHJpZ2lkU29sdmVyfHJvbGx8cm9sbEN0eHxyb290T2Z8cm90fHJvdGF0ZXxyb3RhdGlvbkludGVycG9sYXRpb258cm91bmRDb25zdGFudFJhZGl1c3xyb3dDb2x1bW5MYXlvdXR8cm93TGF5b3V0fHJ1blRpbWVDb21tYW5kfHJ1bnVwfHNhbXBsZUltYWdlfHNhdmVBbGxTaGVsdmVzfHNhdmVBdHRyUHJlc2V0fHNhdmVGbHVpZHxzYXZlSW1hZ2V8c2F2ZUluaXRpYWxTdGF0ZXxzYXZlTWVudXxzYXZlUHJlZk9iamVjdHN8c2F2ZVByZWZzfHNhdmVTaGVsZnxzYXZlVG9vbFNldHRpbmdzfHNjYWxlfHNjYWxlQnJ1c2hCcmlnaHRuZXNzfHNjYWxlQ29tcG9uZW50c3xzY2FsZUNvbnN0cmFpbnR8c2NhbGVLZXl8c2NhbGVLZXlDdHh8c2NlbmVFZGl0b3J8c2NlbmVVSVJlcGxhY2VtZW50fHNjbWh8c2NyaXB0Q3R4fHNjcmlwdEVkaXRvckluZm98c2NyaXB0Sm9ifHNjcmlwdE5vZGV8c2NyaXB0VGFibGV8c2NyaXB0VG9TaGVsZnxzY3JpcHRlZFBhbmVsfHNjcmlwdGVkUGFuZWxUeXBlfHNjcm9sbEZpZWxkfHNjcm9sbExheW91dHxzY3VscHR8c2VhcmNoUGF0aEFycmF5fHNlZWR8c2VsTG9hZFNldHRpbmdzfHNlbGVjdHxzZWxlY3RDb250ZXh0fHNlbGVjdEN1cnZlQ1Z8c2VsZWN0S2V5fHNlbGVjdEtleUN0eHxzZWxlY3RLZXlmcmFtZVJlZ2lvbkN0eHxzZWxlY3RNb2RlfHNlbGVjdFByZWZ8c2VsZWN0UHJpb3JpdHl8c2VsZWN0VHlwZXxzZWxlY3RlZE5vZGVzfHNlbGVjdGlvbkNvbm5lY3Rpb258c2VwYXJhdG9yfHNldEF0dHJ8c2V0QXR0ckVudW1SZXNvdXJjZXxzZXRBdHRyTWFwcGluZ3xzZXRBdHRyTmljZU5hbWVSZXNvdXJjZXxzZXRDb25zdHJhaW50UmVzdFBvc2l0aW9ufHNldERlZmF1bHRTaGFkaW5nR3JvdXB8c2V0RHJpdmVuS2V5ZnJhbWV8c2V0RHluYW1pY3xzZXRFZGl0Q3R4fHNldEVkaXRvcnxzZXRGbHVpZEF0dHJ8c2V0Rm9jdXN8c2V0SW5maW5pdHl8c2V0SW5wdXREZXZpY2VNYXBwaW5nfHNldEtleUN0eHxzZXRLZXlQYXRofHNldEtleWZyYW1lfHNldEtleWZyYW1lQmxlbmRzaGFwZVRhcmdldFd0c3xzZXRNZW51TW9kZXxzZXROb2RlTmljZU5hbWVSZXNvdXJjZXxzZXROb2RlVHlwZUZsYWd8c2V0UGFyZW50fHNldFBhcnRpY2xlQXR0cnxzZXRQZnhUb1BvbHlDYW1lcmF8c2V0UGx1Z2luUmVzb3VyY2V8c2V0UHJvamVjdHxzZXRTdGFtcERlbnNpdHl8c2V0U3RhcnR1cE1lc3NhZ2V8c2V0U3RhdGV8c2V0VG9vbFRvfHNldFVJVGVtcGxhdGV8c2V0WGZvcm1NYW5pcHxzZXRzfHNoYWRpbmdDb25uZWN0aW9ufHNoYWRpbmdHZW9tZXRyeVJlbEN0eHxzaGFkaW5nTGlnaHRSZWxDdHh8c2hhZGluZ05ldHdvcmtDb21wYXJlfHNoYWRpbmdOb2RlfHNoYXBlQ29tcGFyZXxzaGVsZkJ1dHRvbnxzaGVsZkxheW91dHxzaGVsZlRhYkxheW91dHxzaGVsbEZpZWxkfHNob3J0TmFtZU9mfHNob3dIZWxwfHNob3dIaWRkZW58c2hvd01hbmlwQ3R4fHNob3dTZWxlY3Rpb25JblRpdGxlfHNob3dTaGFkaW5nR3JvdXBBdHRyRWRpdG9yfHNob3dXaW5kb3d8c2lnbnxzaW1wbGlmeXxzaW58c2luZ2xlUHJvZmlsZUJpcmFpbFN1cmZhY2V8c2l6ZXxzaXplQnl0ZXN8c2tpbkNsdXN0ZXJ8c2tpblBlcmNlbnR8c21vb3RoQ3VydmV8c21vb3RoVGFuZ2VudFN1cmZhY2V8c21vb3Roc3RlcHxzbmFwMnRvMnxzbmFwS2V5fHNuYXBNb2RlfHNuYXBUb2dldGhlckN0eHxzbmFwc2hvdHxzb2Z0fHNvZnRNb2R8c29mdE1vZEN0eHxzb3J0fHNvdW5kfHNvdW5kQ29udHJvbHxzb3VyY2V8c3BhY2VMb2NhdG9yfHNwaGVyZXxzcGhyYW5kfHNwb3RMaWdodHxzcG90TGlnaHRQcmV2aWV3UG9ydHxzcHJlYWRTaGVldEVkaXRvcnxzcHJpbmd8c3FydHxzcXVhcmVTdXJmYWNlfHNydENvbnRleHR8c3RhY2tUcmFjZXxzdGFydFN0cmluZ3xzdGFydHNXaXRofHN0aXRjaEFuZEV4cGxvZGVTaGVsbHxzdGl0Y2hTdXJmYWNlfHN0aXRjaFN1cmZhY2VQb2ludHN8c3RyY21wfHN0cmluZ0FycmF5Q2F0ZW5hdGV8c3RyaW5nQXJyYXlDb250YWluc3xzdHJpbmdBcnJheUNvdW50fHN0cmluZ0FycmF5SW5zZXJ0QXRJbmRleHxzdHJpbmdBcnJheUludGVyc2VjdG9yfHN0cmluZ0FycmF5UmVtb3ZlfHN0cmluZ0FycmF5UmVtb3ZlQXRJbmRleHxzdHJpbmdBcnJheVJlbW92ZUR1cGxpY2F0ZXN8c3RyaW5nQXJyYXlSZW1vdmVFeGFjdHxzdHJpbmdBcnJheVRvU3RyaW5nfHN0cmluZ1RvU3RyaW5nQXJyYXl8c3RyaXB8c3RyaXBQcmVmaXhGcm9tTmFtZXxzdHJva2V8c3ViZEF1dG9Qcm9qZWN0aW9ufHN1YmRDbGVhblRvcG9sb2d5fHN1YmRDb2xsYXBzZXxzdWJkRHVwbGljYXRlQW5kQ29ubmVjdHxzdWJkRWRpdFVWfHN1YmRMaXN0Q29tcG9uZW50Q29udmVyc2lvbnxzdWJkTWFwQ3V0fHN1YmRNYXBTZXdNb3ZlfHN1YmRNYXRjaFRvcG9sb2d5fHN1YmRNaXJyb3J8c3ViZFRvQmxpbmR8c3ViZFRvUG9seXxzdWJkVHJhbnNmZXJVVnNUb0NhY2hlfHN1YmRpdnxzdWJkaXZDcmVhc2V8c3ViZGl2RGlzcGxheVNtb290aG5lc3N8c3Vic3RpdHV0ZXxzdWJzdGl0dXRlQWxsU3RyaW5nfHN1YnN0aXR1dGVHZW9tZXRyeXxzdWJzdHJpbmd8c3VyZmFjZXxzdXJmYWNlU2FtcGxlcnxzdXJmYWNlU2hhZGVyTGlzdHxzd2F0Y2hEaXNwbGF5UG9ydHxzd2l0Y2hUYWJsZXxzeW1ib2xCdXR0b258c3ltYm9sQ2hlY2tCb3h8c3lzRmlsZXxzeXN0ZW18dGFiTGF5b3V0fHRhbnx0YW5nZW50Q29uc3RyYWludHx0ZXhMYXR0aWNlRGVmb3JtQ29udGV4dHx0ZXhNYW5pcENvbnRleHR8dGV4TW92ZUNvbnRleHR8dGV4TW92ZVVWU2hlbGxDb250ZXh0fHRleFJvdGF0ZUNvbnRleHR8dGV4U2NhbGVDb250ZXh0fHRleFNlbGVjdENvbnRleHR8dGV4U2VsZWN0U2hvcnRlc3RQYXRoQ3R4fHRleFNtdWRnZVVWQ29udGV4dHx0ZXhXaW5Ub29sQ3R4fHRleHR8dGV4dEN1cnZlc3x0ZXh0RmllbGR8dGV4dEZpZWxkQnV0dG9uR3JwfHRleHRGaWVsZEdycHx0ZXh0TWFuaXB8dGV4dFNjcm9sbExpc3R8dGV4dFRvU2hlbGZ8dGV4dHVyZURpc3BsYWNlUGxhbmV8dGV4dHVyZUhhaXJDb2xvcnx0ZXh0dXJlUGxhY2VtZW50Q29udGV4dHx0ZXh0dXJlV2luZG93fHRocmVhZENvdW50fHRocmVlUG9pbnRBcmNDdHh8dGltZUNvbnRyb2x8dGltZVBvcnR8dGltZXJYfHRvTmF0aXZlUGF0aHx0b2dnbGV8dG9nZ2xlQXhpc3x0b2dnbGVXaW5kb3dWaXNpYmlsaXR5fHRva2VuaXplfHRva2VuaXplTGlzdHx0b2xlcmFuY2V8dG9sb3dlcnx0b29sQnV0dG9ufHRvb2xDb2xsZWN0aW9ufHRvb2xEcm9wcGVkfHRvb2xIYXNPcHRpb25zfHRvb2xQcm9wZXJ0eVdpbmRvd3x0b3J1c3x0b3VwcGVyfHRyYWNlfHRyYWNrfHRyYWNrQ3R4fHRyYW5zZmVyQXR0cmlidXRlc3x0cmFuc2Zvcm1Db21wYXJlfHRyYW5zZm9ybUxpbWl0c3x0cmFuc2xhdG9yfHRyaW18dHJ1bmN8dHJ1bmNhdGVGbHVpZENhY2hlfHRydW5jYXRlSGFpckNhY2hlfHR1bWJsZXx0dW1ibGVDdHh8dHVyYnVsZW5jZXx0d29Qb2ludEFyY0N0eHx1aVJlc3x1aVRlbXBsYXRlfHVuYXNzaWduSW5wdXREZXZpY2V8dW5kb3x1bmRvSW5mb3x1bmdyb3VwfHVuaWZvcm18dW5pdHx1bmxvYWRQbHVnaW58dW50YW5nbGVVVnx1bnRpdGxlZEZpbGVOYW1lfHVudHJpbXx1cEF4aXN8dXBkYXRlQUV8dXNlckN0eHx1dkxpbmt8dXZTbmFwc2hvdHx2YWxpZGF0ZVNoZWxmTmFtZXx2ZWN0b3JpemV8dmlldzJkVG9vbEN0eHx2aWV3Q2FtZXJhfHZpZXdDbGlwUGxhbmV8dmlld0ZpdHx2aWV3SGVhZE9ufHZpZXdMb29rQXR8dmlld01hbmlwfHZpZXdQbGFjZXx2aWV3U2V0fHZpc29yfHZvbHVtZUF4aXN8dm9ydGV4fHdhaXRDdXJzb3J8d2FybmluZ3x3ZWJCcm93c2VyfHdlYkJyb3dzZXJQcmVmc3x3aGF0SXN8d2luZG93fHdpbmRvd1ByZWZ8d2lyZXx3aXJlQ29udGV4dHx3b3Jrc3BhY2V8d3JpbmtsZXx3cmlua2xlQ29udGV4dHx3cml0ZVRha2V8eGJtTGFuZ1BhdGhMaXN0fHhmb3JtKVxcYi8sXG5cdFxuXHQnb3BlcmF0b3InOiBbXG5cdFx0L1xcK1srPV0/fC1bLT1dP3wmJnxcXHxcXHx8Wzw+XT18WypcXC8hPV09P3xbJV5dLyxcblx0XHR7XG5cdFx0XHQvLyBXZSBkb24ndCB3YW50IHRvIG1hdGNoIDw8XG5cdFx0XHRwYXR0ZXJuOiAvKF58W148XSk8KD8hPCkvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gV2UgZG9uJ3Qgd2FudCB0byBtYXRjaCA+PlxuXHRcdFx0cGF0dGVybjogLyhefFtePl0pPig/IT4pLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF0sXG5cdCdwdW5jdHVhdGlvbic6IC88PHw+PnxbLiw6Oz9cXFtcXF0oKXt9XS9cbn07XG5QcmlzbS5sYW5ndWFnZXMubWVsWydjb2RlJ10uaW5zaWRlLnJlc3QgPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5tZWwpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW1hdGxhYi5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMubWF0bGFiID0ge1xuXHQvLyBXZSBwdXQgc3RyaW5nIGJlZm9yZSBjb21tZW50LCBiZWNhdXNlIG9mIHByaW50ZigpIHBhdHRlcm5zIHRoYXQgY29udGFpbiBcIiVcIlxuXHQnc3RyaW5nJzogL1xcQicoPzonJ3xbXidcXG5dKSonLyxcblx0J2NvbW1lbnQnOiBbXG5cdFx0LyVcXHtbXFxzXFxTXSo/XFx9JS8sXG5cdFx0LyUuKy9cblx0XSxcblx0Ly8gRklYTUUgV2UgY291bGQgaGFuZGxlIGltYWdpbmFyeSBudW1iZXJzIGFzIGEgd2hvbGVcblx0J251bWJlcic6IC9cXGItPyg/OlxcZCpcXC4/XFxkKyg/OltlRV1bKy1dP1xcZCspPyg/Oltpal0pP3xbaWpdKVxcYi8sXG5cdCdrZXl3b3JkJzogL1xcYig/OmJyZWFrfGNhc2V8Y2F0Y2h8Y29udGludWV8ZWxzZXxlbHNlaWZ8ZW5kfGZvcnxmdW5jdGlvbnxpZnxpbmZ8TmFOfG90aGVyd2lzZXxwYXJmb3J8cGF1c2V8cGl8cmV0dXJufHN3aXRjaHx0cnl8d2hpbGUpXFxiLyxcblx0J2Z1bmN0aW9uJzogLyg/IVxcZClcXHcrKD89XFxzKlxcKCkvLFxuXHQnb3BlcmF0b3InOiAvXFwuP1sqXlxcL1xcXFwnXXxbK1xcLTpAXXxbPD49fl09P3wmJj98XFx8XFx8Py8sXG5cdCdwdW5jdHVhdGlvbic6IC9cXC57M318Wy4sO1xcW1xcXSgpe30hXS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tbWFya2Rvd24uanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnbWFya3VwJywge30pO1xuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya2Rvd24nLCAncHJvbG9nJywge1xuXHQnYmxvY2txdW90ZSc6IHtcblx0XHQvLyA+IC4uLlxuXHRcdHBhdHRlcm46IC9ePig/OltcXHQgXSo+KSovbSxcblx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHR9LFxuXHQnY29kZSc6IFtcblx0XHR7XG5cdFx0XHQvLyBQcmVmaXhlZCBieSA0IHNwYWNlcyBvciAxIHRhYlxuXHRcdFx0cGF0dGVybjogL14oPzogezR9fFxcdCkuKy9tLFxuXHRcdFx0YWxpYXM6ICdrZXl3b3JkJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gYGNvZGVgXG5cdFx0XHQvLyBgYGNvZGVgYFxuXHRcdFx0cGF0dGVybjogL2BgLis/YGB8YFteYFxcbl0rYC8sXG5cdFx0XHRhbGlhczogJ2tleXdvcmQnXG5cdFx0fVxuXHRdLFxuXHQndGl0bGUnOiBbXG5cdFx0e1xuXHRcdFx0Ly8gdGl0bGUgMVxuXHRcdFx0Ly8gPT09PT09PVxuXG5cdFx0XHQvLyB0aXRsZSAyXG5cdFx0XHQvLyAtLS0tLS0tXG5cdFx0XHRwYXR0ZXJuOiAvXFx3Ky4qKD86XFxyP1xcbnxcXHIpKD86PT0rfC0tKykvLFxuXHRcdFx0YWxpYXM6ICdpbXBvcnRhbnQnLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHB1bmN0dWF0aW9uOiAvPT0rJHwtLSskL1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gIyB0aXRsZSAxXG5cdFx0XHQvLyAjIyMjIyMgdGl0bGUgNlxuXHRcdFx0cGF0dGVybjogLyheXFxzKikjKy4rL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0YWxpYXM6ICdpbXBvcnRhbnQnLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHB1bmN0dWF0aW9uOiAvXiMrfCMrJC9cblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdCdocic6IHtcblx0XHQvLyAqKipcblx0XHQvLyAtLS1cblx0XHQvLyAqICogKlxuXHRcdC8vIC0tLS0tLS0tLS0tXG5cdFx0cGF0dGVybjogLyheXFxzKikoWyotXSkoW1xcdCBdKlxcMil7Mix9KD89XFxzKiQpL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHR9LFxuXHQnbGlzdCc6IHtcblx0XHQvLyAqIGl0ZW1cblx0XHQvLyArIGl0ZW1cblx0XHQvLyAtIGl0ZW1cblx0XHQvLyAxLiBpdGVtXG5cdFx0cGF0dGVybjogLyheXFxzKikoPzpbKistXXxcXGQrXFwuKSg/PVtcXHQgXS4pL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHR9LFxuXHQndXJsLXJlZmVyZW5jZSc6IHtcblx0XHQvLyBbaWRdOiBodHRwOi8vZXhhbXBsZS5jb20gXCJPcHRpb25hbCB0aXRsZVwiXG5cdFx0Ly8gW2lkXTogaHR0cDovL2V4YW1wbGUuY29tICdPcHRpb25hbCB0aXRsZSdcblx0XHQvLyBbaWRdOiBodHRwOi8vZXhhbXBsZS5jb20gKE9wdGlvbmFsIHRpdGxlKVxuXHRcdC8vIFtpZF06IDxodHRwOi8vZXhhbXBsZS5jb20+IFwiT3B0aW9uYWwgdGl0bGVcIlxuXHRcdHBhdHRlcm46IC8hP1xcW1teXFxdXStcXF06W1xcdCBdKyg/OlxcUyt8PCg/OlxcXFwufFtePlxcXFxdKSs+KSg/OltcXHQgXSsoPzpcIig/OlxcXFwufFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwufFteJ1xcXFxdKSonfFxcKCg/OlxcXFwufFteKVxcXFxdKSpcXCkpKT8vLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3ZhcmlhYmxlJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvXighP1xcWylbXlxcXV0rLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdCdzdHJpbmcnOiAvKD86XCIoPzpcXFxcLnxbXlwiXFxcXF0pKlwifCcoPzpcXFxcLnxbXidcXFxcXSkqJ3xcXCgoPzpcXFxcLnxbXilcXFxcXSkqXFwpKSQvLFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL15bXFxbXFxdITpdfFs8Pl0vXG5cdFx0fSxcblx0XHRhbGlhczogJ3VybCdcblx0fSxcblx0J2JvbGQnOiB7XG5cdFx0Ly8gKipzdHJvbmcqKlxuXHRcdC8vIF9fc3Ryb25nX19cblxuXHRcdC8vIEFsbG93IG9ubHkgb25lIGxpbmUgYnJlYWtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkoXFwqXFwqfF9fKSg/Oig/Olxccj9cXG58XFxyKSg/IVxccj9cXG58XFxyKXwuKSs/XFwyLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3B1bmN0dWF0aW9uJzogL15cXCpcXCp8Xl9ffFxcKlxcKiR8X18kL1xuXHRcdH1cblx0fSxcblx0J2l0YWxpYyc6IHtcblx0XHQvLyAqZW0qXG5cdFx0Ly8gX2VtX1xuXG5cdFx0Ly8gQWxsb3cgb25seSBvbmUgbGluZSBicmVha1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKShbKl9dKSg/Oig/Olxccj9cXG58XFxyKSg/IVxccj9cXG58XFxyKXwuKSs/XFwyLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3B1bmN0dWF0aW9uJzogL15bKl9dfFsqX10kL1xuXHRcdH1cblx0fSxcblx0J3VybCc6IHtcblx0XHQvLyBbZXhhbXBsZV0oaHR0cDovL2V4YW1wbGUuY29tIFwiT3B0aW9uYWwgdGl0bGVcIilcblx0XHQvLyBbZXhhbXBsZV0gW2lkXVxuXHRcdHBhdHRlcm46IC8hP1xcW1teXFxdXStcXF0oPzpcXChbXlxccyldKyg/OltcXHQgXStcIig/OlxcXFwufFteXCJcXFxcXSkqXCIpP1xcKXwgP1xcW1teXFxdXFxuXSpcXF0pLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCd2YXJpYWJsZSc6IHtcblx0XHRcdFx0cGF0dGVybjogLyghP1xcWylbXlxcXV0rKD89XFxdJCkvLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0J3N0cmluZyc6IHtcblx0XHRcdFx0cGF0dGVybjogL1wiKD86XFxcXC58W15cIlxcXFxdKSpcIig/PVxcKSQpL1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsnYm9sZCddLmluc2lkZVsndXJsJ10gPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsndXJsJ10pO1xuUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duWydpdGFsaWMnXS5pbnNpZGVbJ3VybCddID0gUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMubWFya2Rvd25bJ3VybCddKTtcblByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsnYm9sZCddLmluc2lkZVsnaXRhbGljJ10gPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5tYXJrZG93blsnaXRhbGljJ10pO1xuUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duWydpdGFsaWMnXS5pbnNpZGVbJ2JvbGQnXSA9IFByaXNtLnV0aWwuY2xvbmUoUHJpc20ubGFuZ3VhZ2VzLm1hcmtkb3duWydib2xkJ10pO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW1ha2VmaWxlLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5tYWtlZmlsZSA9IHtcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pIyg/OlxcXFwoPzpcXHJcXG58W1xcc1xcU10pfC4pKi8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnc3RyaW5nJzogLyhbXCInXSkoPzpcXFxcKD86XFxyXFxufFtcXHNcXFNdKXwoPyFcXDEpW15cXFxcXFxyXFxuXSkqXFwxLyxcblxuXHQvLyBCdWlsdC1pbiB0YXJnZXQgbmFtZXNcblx0J2J1aWx0aW4nOiAvXFwuW0EtWl1bXjojPVxcc10rKD89XFxzKjooPyE9KSkvLFxuXG5cdC8vIFRhcmdldHNcblx0J3N5bWJvbCc6IHtcblx0XHRwYXR0ZXJuOiAvXlteOj1cXHJcXG5dKyg/PVxccyo6KD8hPSkpL20sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQndmFyaWFibGUnOiAvXFwkKyg/OlteKCl7fTojPVxcc10rfCg/PVsoe10pKS9cblx0XHR9XG5cdH0sXG5cdCd2YXJpYWJsZSc6IC9cXCQrKD86W14oKXt9OiM9XFxzXSt8XFwoW0AqJTxeKz9dW0RGXVxcKXwoPz1bKHtdKSkvLFxuXG5cdCdrZXl3b3JkJzogW1xuXHRcdC8vIERpcmVjdGl2ZXNcblx0XHQvLWluY2x1ZGVcXGJ8XFxiKD86ZGVmaW5lfGVsc2V8ZW5kZWZ8ZW5kaWZ8ZXhwb3J0fGlmbj9kZWZ8aWZuP2VxfGluY2x1ZGV8b3ZlcnJpZGV8cHJpdmF0ZXxzaW5jbHVkZXx1bmRlZmluZXx1bmV4cG9ydHx2cGF0aClcXGIvLFxuXHRcdC8vIEZ1bmN0aW9uc1xuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXFwoKSg/OmFkZHN1ZmZpeHxhYnNwYXRofGFuZHxiYXNlbmFtZXxjYWxsfGRpcnxlcnJvcnxldmFsfGZpbGV8ZmlsdGVyKD86LW91dCk/fGZpbmRzdHJpbmd8Zmlyc3R3b3JkfGZsYXZvcnxmb3JlYWNofGd1aWxlfGlmfGluZm98am9pbnxsYXN0d29yZHxsb2FkfG5vdGRpcnxvcnxvcmlnaW58cGF0c3Vic3R8cmVhbHBhdGh8c2hlbGx8c29ydHxzdHJpcHxzdWJzdHxzdWZmaXh8dmFsdWV8d2FybmluZ3x3aWxkY2FyZHx3b3JkKD86c3xsaXN0KT8pKD89WyBcXHRdKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQnb3BlcmF0b3InOiAvKD86Ojp8Wz86KyFdKT89fFt8QF0vLFxuXHQncHVuY3R1YXRpb24nOiAvWzo7KCl7fV0vXG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWxvbGNvZGUuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmxvbGNvZGUgPSB7XG5cdCdjb21tZW50JzogW1xuXHRcdC9cXGJPQlRXXFxzK1tcXHNcXFNdKj9cXHMrVExEUlxcYi8sXG5cdFx0L1xcYkJUVy4rL1xuXHRdLFxuXHQnc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC9cIig/OjoufFteXCJdKSpcIi8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQndmFyaWFibGUnOiAvOlxce1tefV0rXFx9Lyxcblx0XHRcdCdzeW1ib2wnOiBbXG5cdFx0XHRcdC86XFwoW2EtZlxcZF0rXFwpL2ksXG5cdFx0XHRcdC86XFxbW15cXF1dK1xcXS8sXG5cdFx0XHRcdC86Wyk+b1wiOl0vXG5cdFx0XHRdXG5cdFx0fVxuXHR9LFxuXHQnbnVtYmVyJzogLygtfFxcYilcXGQqXFwuP1xcZCsvLFxuXHQnc3ltYm9sJzoge1xuXHRcdHBhdHRlcm46IC8oXnxcXHMpKD86QSApPyg/OllBUk58TlVNQlJ8TlVNQkFSfFRST09GfEJVS0tJVHxOT09CKSg/PVxcc3wsfCQpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2tleXdvcmQnOiAvQSg/PVxccykvXG5cdFx0fVxuXHR9LFxuXHQnbGFiZWwnOiB7XG5cdFx0cGF0dGVybjogLygoPzpefFxccykoPzpJTSBJTiBZUnxJTSBPVVRUQSBZUikgKVthLXpBLVpdXFx3Ki8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3N0cmluZydcblx0fSxcblx0J2Z1bmN0aW9uJzoge1xuXHRcdHBhdHRlcm46IC8oKD86XnxcXHMpKD86SSBJWnxIT1cgSVogSXxJWikgKVthLXpBLVpdXFx3Ki8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQna2V5d29yZCc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58XFxzKSg/Ok8gSEFJIElNfEtUSFh8SEFJfEtUSFhCWUV8SSBIQVMgQXxJVFooPzogQSk/fFJ8QU58TUtBWXxTTU9PU0h8TUFFS3xJUyBOT1coPzogQSk/fFZJU0lCTEV8R0lNTUVIfE8gUkxZXFw/fFlBIFJMWXxOTyBXQUl8T0lDfE1FQkJFfFdURlxcP3xPTUd8T01HV1RGfEdURk98SU0gSU4gWVJ8SU0gT1VUVEEgWVJ8Rk9VTkQgWVJ8WVJ8VElMfFdJTEV8VVBQSU58TkVSRklOfEkgSVp8SE9XIElaIEl8SUYgVSBTQVkgU098U1JTfEhBUyBBfExJRUsoPzogQSk/fElaKSg/PVxcc3wsfCQpLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdC8nWig/PVxcc3wsfCQpL1xuXHRdLFxuXHQnYm9vbGVhbic6IHtcblx0XHRwYXR0ZXJuOiAvKF58XFxzKSg/OldJTnxGQUlMKSg/PVxcc3wsfCQpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCd2YXJpYWJsZSc6IHtcblx0XHRwYXR0ZXJuOiAvKF58XFxzKUlUKD89XFxzfCx8JCkvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J29wZXJhdG9yJzoge1xuXHRcdHBhdHRlcm46IC8oXnxcXHMpKD86Tk9UfEJPVEggU0FFTXxESUZGUklOVHwoPzpTVU18RElGRnxQUk9EVUtUfFFVT1NIVU5UfE1PRHxCSUdHUnxTTUFMTFJ8Qk9USHxFSVRIRVJ8V09OfEFMTHxBTlkpIE9GKSg/PVxcc3wsfCQpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdwdW5jdHVhdGlvbic6IC9cXC57M3184oCmfCx8IS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tbGVzcy5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKiBGSVhNRSA6XG4gOmV4dGVuZCgpIGlzIG5vdCBoYW5kbGVkIHNwZWNpZmljYWxseSA6IGl0cyBoaWdobGlnaHRpbmcgaXMgYnVnZ3kuXG4gTWl4aW4gdXNhZ2UgbXVzdCBiZSBpbnNpZGUgYSBydWxlc2V0IHRvIGJlIGhpZ2hsaWdodGVkLlxuIEF0LXJ1bGVzIChlLmcuIGltcG9ydCkgY29udGFpbmluZyBpbnRlcnBvbGF0aW9ucyBhcmUgYnVnZ3kuXG4gRGV0YWNoZWQgcnVsZXNldHMgYXJlIGhpZ2hsaWdodGVkIGFzIGF0LXJ1bGVzLlxuIEEgY29tbWVudCBiZWZvcmUgYSBtaXhpbiB1c2FnZSBwcmV2ZW50cyB0aGUgbGF0dGVyIHRvIGJlIHByb3Blcmx5IGhpZ2hsaWdodGVkLlxuICovXG5cblByaXNtLmxhbmd1YWdlcy5sZXNzID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY3NzJywge1xuXHQnY29tbWVudCc6IFtcblx0XHQvXFwvXFwqW1xcd1xcV10qP1xcKlxcLy8sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteXFxcXF0pXFwvXFwvLiovLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0XSxcblx0J2F0cnVsZSc6IHtcblx0XHRwYXR0ZXJuOiAvQFtcXHctXSs/KD86XFwoW157fV0rXFwpfFteKCl7fTtdKSo/KD89XFxzKlxceykvaSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdwdW5jdHVhdGlvbic6IC9bOigpXS9cblx0XHR9XG5cdH0sXG5cdC8vIHNlbGVjdG9ycyBhbmQgbWl4aW5zIGFyZSBjb25zaWRlcmVkIHRoZSBzYW1lXG5cdCdzZWxlY3Rvcic6IHtcblx0XHRwYXR0ZXJuOiAvKD86QFxce1tcXHctXStcXH18W157fTtcXHNAXSkoPzpAXFx7W1xcdy1dK1xcfXxcXChbXnt9XSpcXCl8W157fTtAXSkqPyg/PVxccypcXHspLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdC8vIG1peGluIHBhcmFtZXRlcnNcblx0XHRcdCd2YXJpYWJsZSc6IC9AK1tcXHctXSsvXG5cdFx0fVxuXHR9LFxuXG5cdCdwcm9wZXJ0eSc6IC8oPzpAXFx7W1xcdy1dK1xcfXxbXFx3LV0pKyg/OlxcK18/KT8oPz1cXHMqOikvaSxcblx0J3B1bmN0dWF0aW9uJzogL1t7fSgpOzosXS8sXG5cdCdvcGVyYXRvcic6IC9bK1xcLSpcXC9dL1xufSk7XG5cbi8vIEludmVydCBmdW5jdGlvbiBhbmQgcHVuY3R1YXRpb24gcG9zaXRpb25zXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdsZXNzJywgJ3B1bmN0dWF0aW9uJywge1xuXHQnZnVuY3Rpb24nOiBQcmlzbS5sYW5ndWFnZXMubGVzcy5mdW5jdGlvblxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2xlc3MnLCAncHJvcGVydHknLCB7XG5cdCd2YXJpYWJsZSc6IFtcblx0XHQvLyBWYXJpYWJsZSBkZWNsYXJhdGlvbiAodGhlIGNvbG9uIG11c3QgYmUgY29uc3VtZWQhKVxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC9AW1xcdy1dK1xccyo6Lyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcInB1bmN0dWF0aW9uXCI6IC86L1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBWYXJpYWJsZSB1c2FnZVxuXHRcdC9AQD9bXFx3LV0rL1xuXHRdLFxuXHQnbWl4aW4tdXNhZ2UnOiB7XG5cdFx0cGF0dGVybjogLyhbeztdXFxzKilbLiNdKD8hXFxkKVtcXHctXSsuKj8oPz1bKDtdKS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ2Z1bmN0aW9uJ1xuXHR9XG59KTtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWxhdGV4LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbihmdW5jdGlvbihQcmlzbSkge1xuXHR2YXIgZnVuY1BhdHRlcm4gPSAvXFxcXChbXmEteigpW1xcXV18W2EtelxcKl0rKS9pLFxuXHQgICAgaW5zaWRlRXF1ID0ge1xuXHRcdCAgICAnZXF1YXRpb24tY29tbWFuZCc6IHtcblx0XHRcdCAgICBwYXR0ZXJuOiBmdW5jUGF0dGVybixcblx0XHRcdCAgICBhbGlhczogJ3JlZ2V4J1xuXHRcdCAgICB9XG5cdCAgICB9O1xuXG5cdFByaXNtLmxhbmd1YWdlcy5sYXRleCA9IHtcblx0XHQnY29tbWVudCc6IC8lLiovbSxcblx0XHQvLyB0aGUgdmVyYmF0aW0gZW52aXJvbm1lbnQgcHJpbnRzIHdoaXRlc3BhY2UgdG8gdGhlIGRvY3VtZW50XG5cdFx0J2NkYXRhJzogIHtcblx0XHRcdHBhdHRlcm46IC8oXFxcXGJlZ2luXFx7KCg/OnZlcmJhdGltfGxzdGxpc3RpbmcpXFwqPylcXH0pKFtcXHdcXFddKj8pKD89XFxcXGVuZFxce1xcMlxcfSkvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Lypcblx0XHQgKiBlcXVhdGlvbnMgY2FuIGJlIGJldHdlZW4gJCAkIG9yIFxcKCBcXCkgb3IgXFxbIFxcXVxuXHRcdCAqIChhbGwgYXJlIG11bHRpbGluZSlcblx0XHQgKi9cblx0XHQnZXF1YXRpb24nOiBbXG5cdFx0XHR7XG5cdFx0XHRcdHBhdHRlcm46IC9cXCQoPzpcXFxcP1tcXHdcXFddKSo/XFwkfFxcXFxcXCgoPzpcXFxcP1tcXHdcXFddKSo/XFxcXFxcKXxcXFxcXFxbKD86XFxcXD9bXFx3XFxXXSkqP1xcXFxcXF0vLFxuXHRcdFx0XHRpbnNpZGU6IGluc2lkZUVxdSxcblx0XHRcdFx0YWxpYXM6ICdzdHJpbmcnXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvKFxcXFxiZWdpblxceygoPzplcXVhdGlvbnxtYXRofGVxbmFycmF5fGFsaWdufG11bHRsaW5lfGdhdGhlcilcXCo/KVxcfSkoW1xcd1xcV10qPykoPz1cXFxcZW5kXFx7XFwyXFx9KS8sXG5cdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdGluc2lkZTogaW5zaWRlRXF1LFxuXHRcdFx0XHRhbGlhczogJ3N0cmluZydcblx0XHRcdH1cblx0XHRdLFxuXHRcdC8qXG5cdFx0ICogYXJndW1lbnRzIHdoaWNoIGFyZSBrZXl3b3JkcyBvciByZWZlcmVuY2VzIGFyZSBoaWdobGlnaHRlZFxuXHRcdCAqIGFzIGtleXdvcmRzXG5cdFx0ICovXG5cdFx0J2tleXdvcmQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKFxcXFwoPzpiZWdpbnxlbmR8cmVmfGNpdGV8bGFiZWx8dXNlcGFja2FnZXxkb2N1bWVudGNsYXNzKSg/OlxcW1teXFxdXStcXF0pP1xceylbXn1dKyg/PVxcfSkvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0J3VybCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXFxcXHVybFxceylbXn1dKyg/PVxcfSkvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Lypcblx0XHQgKiBzZWN0aW9uIG9yIGNoYXB0ZXIgaGVhZGxpbmVzIGFyZSBoaWdobGlnaHRlZCBhcyBib2xkIHNvIHRoYXRcblx0XHQgKiB0aGV5IHN0YW5kIG91dCBtb3JlXG5cdFx0ICovXG5cdFx0J2hlYWRsaW5lJzoge1xuXHRcdFx0cGF0dGVybjogLyhcXFxcKD86cGFydHxjaGFwdGVyfHNlY3Rpb258c3Vic2VjdGlvbnxmcmFtZXRpdGxlfHN1YnN1YnNlY3Rpb258cGFyYWdyYXBofHN1YnBhcmFncmFwaHxzdWJzdWJwYXJhZ3JhcGh8c3Vic3Vic3VicGFyYWdyYXBoKVxcKj8oPzpcXFtbXlxcXV0rXFxdKT9cXHspW159XSsoPz1cXH0oPzpcXFtbXlxcXV0rXFxdKT8pLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRhbGlhczogJ2NsYXNzLW5hbWUnXG5cdFx0fSxcblx0XHQnZnVuY3Rpb24nOiB7XG5cdFx0XHRwYXR0ZXJuOiBmdW5jUGF0dGVybixcblx0XHRcdGFsaWFzOiAnc2VsZWN0b3InXG5cdFx0fSxcblx0XHQncHVuY3R1YXRpb24nOiAvW1tcXF17fSZdL1xuXHR9O1xufSkoUHJpc20pO1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20ta2V5bWFuLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5rZXltYW4gPSB7XG5cdCdjb21tZW50JzogL1xcYmNcXHMuKi9pLFxuXHQnZnVuY3Rpb24nOiAvXFxbXFxzKigoQ1RSTHxTSElGVHxBTFR8TENUUkx8UkNUUkx8TEFMVHxSQUxUfENBUFN8TkNBUFMpXFxzKykqKFtUS1VdX1thLXowLTlfP10rfFwiLis/XCJ8Jy4rPycpXFxzKlxcXS9pLCAgLy8gdmlydHVhbCBrZXlcblx0J3N0cmluZyc6IC8oXCJ8JykoKD8hXFwxKS4pKlxcMS8sXG5cdCdib2xkJzogWyAgIC8vIGhlYWRlciBzdGF0ZW1lbnRzLCBzeXN0ZW0gc3RvcmVzIGFuZCB2YXJpYWJsZSBzeXN0ZW0gc3RvcmVzXG5cdFx0LyYoYmFzZWxheW91dHxiaXRtYXB8Y2Fwc29ub25seXxjYXBzYWx3YXlzb2ZmfHNoaWZ0ZnJlZXNjYXBzfGNvcHlyaWdodHxldGhub2xvZ3VlY29kZXxob3RrZXl8aW5jbHVkZWNvZGVzfGtleWJvYXJkdmVyc2lvbnxrbXdfZW1iZWRjc3N8a213X2VtYmVkanN8a213X2hlbHBmaWxlfGttd19oZWxwdGV4dHxrbXdfcnRsfGxhbmd1YWdlfGxheWVyfGxheW91dGZpbGV8bWVzc2FnZXxtbmVtb25pY2xheW91dHxuYW1lfG9sZGNoYXJwb3NtYXRjaGluZ3xwbGF0Zm9ybXx0YXJnZXRzfHZlcnNpb258dmlzdWFsa2V5Ym9hcmR8d2luZG93c2xhbmd1YWdlcylcXGIvaSxcblx0XHQvXFxiKGJpdG1hcHxiaXRtYXBzfGNhcHMgb24gb25seXxjYXBzIGFsd2F5cyBvZmZ8c2hpZnQgZnJlZXMgY2Fwc3xjb3B5cmlnaHR8aG90a2V5fGxhbmd1YWdlfGxheW91dHxtZXNzYWdlfG5hbWV8dmVyc2lvbilcXGIvaVxuXHRdLFxuXHQna2V5d29yZCc6IC9cXGIoYW55fGJhc2VsYXlvdXR8YmVlcHxjYWxsfGNvbnRleHR8ZGVhZGtleXxka3xpZnxpbmRleHxsYXllcnxub3Rhbnl8bnVsfG91dHN8cGxhdGZvcm18cmV0dXJufHJlc2V0fHNhdmV8c2V0fHN0b3JlfHVzZSlcXGIvaSwgIC8vIHJ1bGUga2V5d29yZHNcblx0J2F0cnVsZSc6IC9cXGIoYW5zaXxiZWdpbnx1bmljb2RlfGdyb3VwfHVzaW5nIGtleXN8bWF0Y2h8bm9tYXRjaClcXGIvaSwgICAvLyBzdHJ1Y3R1cmFsIGtleXdvcmRzXG5cdCdudW1iZXInOiAvXFxiKFVcXCtbXFxkQS1GXSt8ZFxcZCt8eFtcXGRhLWZdK3xcXGQrKVxcYi9pLCAvLyBVKyMjIyMsIHgjIyMsIGQjIyMgY2hhcmFjdGVycyBhbmQgbnVtYmVyc1xuXHQnb3BlcmF0b3InOiAvWys+XFxcXCwoKV0vLFxuXHQndGFnJzogL1xcJChrZXltYW58a21mbHx3ZWF2ZXJ8a2V5bWFud2VifGtleW1hbm9ubHkpOi9pICAgLy8gcHJlZml4ZXNcbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tanVsaWEuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmp1bGlhPSB7XG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKSMuKi8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnc3RyaW5nJzogL1wiXCJcIltcXHNcXFNdKz9cIlwiXCJ8JycnW1xcc1xcU10rPycnJ3woXCJ8JykoXFxcXD8uKSo/XFwxLyxcblx0J2tleXdvcmQnIDogL1xcYihhYnN0cmFjdHxiYXJlbW9kdWxlfGJlZ2lufGJpdHN0eXBlfGJyZWFrfGNhdGNofGNjYWxsfGNvbnN0fGNvbnRpbnVlfGRvfGVsc2V8ZWxzZWlmfGVuZHxleHBvcnR8ZmluYWxseXxmb3J8ZnVuY3Rpb258Z2xvYmFsfGlmfGltbXV0YWJsZXxpbXBvcnR8aW1wb3J0YWxsfGxldHxsb2NhbHxtYWNyb3xtb2R1bGV8cHJpbnR8cHJpbnRsbnxxdW90ZXxyZXR1cm58dHJ5fHR5cGV8dHlwZWFsaWFzfHVzaW5nfHdoaWxlKVxcYi8sXG5cdCdib29sZWFuJyA6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvLFxuXHQnbnVtYmVyJyA6IC9cXGItPygwW2JveF0pPyg/OltcXGRhLWZdK1xcLj9cXGQqfFxcLlxcZCspKD86W2VmcF1bKy1dP1xcZCspP2o/XFxiL2ksXG5cdCdvcGVyYXRvcic6IC9cXCs9P3wtPT98XFwqPT98XFwvW1xcLz1dP3xcXFxcPT98XFxePT98JT0/fMO3PT98IT0/PT98Jj0/fFxcfFs9Pl0/fFxcJD0/fDwoPzo8PT98Wz06XSk/fD4oPzo9fD4+Pz0/KT98PT0/PT98W37iiaDiiaTiiaVdLyxcblx0J3B1bmN0dWF0aW9uJyA6IC9be31bXFxdOygpLC46XS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tamFkZS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4oZnVuY3Rpb24oUHJpc20pIHtcblx0Ly8gVE9ETzpcblx0Ly8gLSBBZGQgQ1NTIGhpZ2hsaWdodGluZyBpbnNpZGUgPHN0eWxlPiB0YWdzXG5cdC8vIC0gQWRkIHN1cHBvcnQgZm9yIG11bHRpLWxpbmUgY29kZSBibG9ja3Ncblx0Ly8gLSBBZGQgc3VwcG9ydCBmb3IgaW50ZXJwb2xhdGlvbiAje30gYW5kICF7fVxuXHQvLyAtIEFkZCBzdXBwb3J0IGZvciB0YWcgaW50ZXJwb2xhdGlvbiAjW11cblx0Ly8gLSBBZGQgZXhwbGljaXQgc3VwcG9ydCBmb3IgcGxhaW4gdGV4dCB1c2luZyB8XG5cdC8vIC0gQWRkIHN1cHBvcnQgZm9yIG1hcmt1cCBlbWJlZGRlZCBpbiBwbGFpbiB0ZXh0XG5cblx0UHJpc20ubGFuZ3VhZ2VzLmphZGUgPSB7XG5cblx0XHQvLyBNdWx0aWxpbmUgc3R1ZmYgc2hvdWxkIGFwcGVhciBiZWZvcmUgdGhlIHJlc3RcblxuXHRcdC8vIFRoaXMgaGFuZGxlcyBib3RoIHNpbmdsZS1saW5lIGFuZCBtdWx0aS1saW5lIGNvbW1lbnRzXG5cdFx0J2NvbW1lbnQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF4oW1xcdCBdKikpXFwvXFwvLiooKD86XFxyP1xcbnxcXHIpXFwyW1xcdCBdKy4rKSovbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXG5cdFx0Ly8gQWxsIHRoZSB0YWctcmVsYXRlZCBwYXJ0IGlzIGluIGxvb2tiZWhpbmRcblx0XHQvLyBzbyB0aGF0IGl0IGNhbiBiZSBoaWdobGlnaHRlZCBieSB0aGUgXCJ0YWdcIiBwYXR0ZXJuXG5cdFx0J211bHRpbGluZS1zY3JpcHQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF4oW1xcdCBdKilzY3JpcHRcXGIuKlxcLltcXHQgXSopKCg/Olxccj9cXG58XFxyKD8hXFxuKSkoPzpcXDJbXFx0IF0rLit8XFxzKj8oPz1cXHI/XFxufFxccikpKSsvbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8gU2VlIGF0IHRoZSBlbmQgb2YgdGhlIGZpbGUgZm9yIGtub3duIGZpbHRlcnNcblx0XHQnZmlsdGVyJzoge1xuXHRcdFx0cGF0dGVybjogLyheKFtcXHQgXSopKTouKygoPzpcXHI/XFxufFxccig/IVxcbikpKD86XFwyW1xcdCBdKy4rfFxccyo/KD89XFxyP1xcbnxcXHIpKSkrL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdmaWx0ZXItbmFtZSc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXjpbXFx3LV0rLyxcblx0XHRcdFx0XHRhbGlhczogJ3ZhcmlhYmxlJ1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdCdtdWx0aWxpbmUtcGxhaW4tdGV4dCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXihbXFx0IF0qKVtcXHdcXC0jLl0rXFwuW1xcdCBdKikoKD86XFxyP1xcbnxcXHIoPyFcXG4pKSg/OlxcMltcXHQgXSsuK3xcXHMqPyg/PVxccj9cXG58XFxyKSkpKy9tLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0J21hcmt1cCc6IHtcblx0XHRcdHBhdHRlcm46IC8oXltcXHQgXSopPC4rL20sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXBcblx0XHRcdH1cblx0XHR9LFxuXHRcdCdkb2N0eXBlJzoge1xuXHRcdFx0cGF0dGVybjogLygoPzpefFxcbilbXFx0IF0qKWRvY3R5cGUoPzogLispPy8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgaGFuZGxlIGFsbCBjb25kaXRpb25hbCBhbmQgbG9vcCBrZXl3b3Jkc1xuXHRcdCdmbG93LWNvbnRyb2wnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF5bXFx0IF0qKSg/OmlmfHVubGVzc3xlbHNlfGNhc2V8d2hlbnxkZWZhdWx0fGVhY2h8d2hpbGUpXFxiKD86IC4rKT8vbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2VhY2gnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogL15lYWNoIC4rPyBpblxcYi8sXG5cdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHQna2V5d29yZCc6IC9cXGIoPzplYWNofGluKVxcYi8sXG5cdFx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvLC9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdicmFuY2gnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogL14oPzppZnx1bmxlc3N8ZWxzZXxjYXNlfHdoZW58ZGVmYXVsdHx3aGlsZSlcXGIvLFxuXHRcdFx0XHRcdGFsaWFzOiAna2V5d29yZCdcblx0XHRcdFx0fSxcblx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHRcdH1cblx0XHR9LFxuXHRcdCdrZXl3b3JkJzoge1xuXHRcdFx0cGF0dGVybjogLyheW1xcdCBdKikoPzpibG9ja3xleHRlbmRzfGluY2x1ZGV8YXBwZW5kfHByZXBlbmQpXFxiLisvbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdCdtaXhpbic6IFtcblx0XHRcdC8vIERlY2xhcmF0aW9uXG5cdFx0XHR7XG5cdFx0XHRcdHBhdHRlcm46IC8oXltcXHQgXSopbWl4aW4gLisvbSxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J2tleXdvcmQnOiAvXm1peGluLyxcblx0XHRcdFx0XHQnZnVuY3Rpb24nOiAvXFx3Kyg/PVxccypcXCh8XFxzKiQpLyxcblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvWygpLC5dL1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Ly8gVXNhZ2Vcblx0XHRcdHtcblx0XHRcdFx0cGF0dGVybjogLyheW1xcdCBdKilcXCsuKy9tLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnbmFtZSc6IHtcblx0XHRcdFx0XHRcdHBhdHRlcm46IC9eXFwrXFx3Ky8sXG5cdFx0XHRcdFx0XHRhbGlhczogJ2Z1bmN0aW9uJ1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0J3Jlc3QnOiBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XSxcblx0XHQnc2NyaXB0Jzoge1xuXHRcdFx0cGF0dGVybjogLyheW1xcdCBdKnNjcmlwdCg/Oig/OiZbXihdKyk/XFwoW14pXStcXCkpKltcXHQgXSspLisvbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0J3BsYWluLXRleHQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF5bXFx0IF0qKD8hLSlbXFx3XFwtIy5dKltcXHdcXC1dKD86KD86JlteKF0rKT9cXChbXildK1xcKSkqXFwvP1tcXHQgXSspLisvbSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdCd0YWcnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF5bXFx0IF0qKSg/IS0pW1xcd1xcLSMuXSpbXFx3XFwtXSg/Oig/OiZbXihdKyk/XFwoW14pXStcXCkpKlxcLz86Py9tLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnYXR0cmlidXRlcyc6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvJlteKF0rXFwoW14pXStcXCkvLFxuXHRcdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvXFwoW14pXStcXCkvLFxuXHRcdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHRcdCdhdHRyLXZhbHVlJzoge1xuXHRcdFx0XHRcdFx0XHRcdHBhdHRlcm46IC8oPVxccyopKD86XFx7W159XSpcXH18W14sKVxcclxcbl0rKS8sXG5cdFx0XHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHQnYXR0ci1uYW1lJzogL1tcXHctXSsoPz1cXHMqIT89fFxccypbLCldKS8sXG5cdFx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bIT0oKSxdKy9cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdCdwdW5jdHVhdGlvbic6IC86L1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0J2NvZGUnOiBbXG5cdFx0XHR7XG5cdFx0XHRcdHBhdHRlcm46IC8oXltcXHQgXSooPzotfCE/PSkpLisvbSxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdF0sXG5cdFx0J3B1bmN0dWF0aW9uJzogL1suXFwtIT18XSsvXG5cdH07XG5cblx0dmFyIGZpbHRlcl9wYXR0ZXJuID0gJyheKFtcXFxcdCBdKikpOnt7ZmlsdGVyX25hbWV9fSgoPzpcXFxccj9cXFxcbnxcXFxccig/IVxcXFxuKSkoPzpcXFxcMltcXFxcdCBdKy4rfFxcXFxzKj8oPz1cXFxccj9cXFxcbnxcXFxccikpKSsnO1xuXG5cdC8vIE5vbiBleGhhdXN0aXZlIGxpc3Qgb2YgYXZhaWxhYmxlIGZpbHRlcnMgYW5kIGFzc29jaWF0ZWQgbGFuZ3VhZ2VzXG5cdHZhciBmaWx0ZXJzID0gW1xuXHRcdHtmaWx0ZXI6J2F0cGwnLGxhbmd1YWdlOid0d2lnJ30sXG5cdFx0e2ZpbHRlcjonY29mZmVlJyxsYW5ndWFnZTonY29mZmVlc2NyaXB0J30sXG5cdFx0J2VqcycsXG5cdFx0J2hhbmRsZWJhcnMnLFxuXHRcdCdob2dhbicsXG5cdFx0J2xlc3MnLFxuXHRcdCdsaXZlc2NyaXB0Jyxcblx0XHQnbWFya2Rvd24nLFxuXHRcdCdtdXN0YWNoZScsXG5cdFx0J3BsYXRlcycsXG5cdFx0e2ZpbHRlcjonc2FzcycsbGFuZ3VhZ2U6J3Njc3MnfSxcblx0XHQnc3R5bHVzJyxcblx0XHQnc3dpZydcblxuXHRdO1xuXHR2YXIgYWxsX2ZpbHRlcnMgPSB7fTtcblx0Zm9yICh2YXIgaSA9IDAsIGwgPSBmaWx0ZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdHZhciBmaWx0ZXIgPSBmaWx0ZXJzW2ldO1xuXHRcdGZpbHRlciA9IHR5cGVvZiBmaWx0ZXIgPT09ICdzdHJpbmcnID8ge2ZpbHRlcjogZmlsdGVyLCBsYW5ndWFnZTogZmlsdGVyfSA6IGZpbHRlcjtcblx0XHRpZiAoUHJpc20ubGFuZ3VhZ2VzW2ZpbHRlci5sYW5ndWFnZV0pIHtcblx0XHRcdGFsbF9maWx0ZXJzWydmaWx0ZXItJyArIGZpbHRlci5maWx0ZXJdID0ge1xuXHRcdFx0XHRwYXR0ZXJuOiBSZWdFeHAoZmlsdGVyX3BhdHRlcm4ucmVwbGFjZSgne3tmaWx0ZXJfbmFtZX19JywgZmlsdGVyLmZpbHRlciksICdtJyksXG5cdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdmaWx0ZXItbmFtZSc6IHtcblx0XHRcdFx0XHRcdHBhdHRlcm46IC9eOltcXHctXSsvLFxuXHRcdFx0XHRcdFx0YWxpYXM6ICd2YXJpYWJsZSdcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlc1tmaWx0ZXIubGFuZ3VhZ2VdXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdqYWRlJywgJ2ZpbHRlcicsIGFsbF9maWx0ZXJzKTtcblxufShQcmlzbSkpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWouanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmogPSB7XG5cdCdjb21tZW50JzogL1xcYk5CXFwuLiovLFxuXHQnc3RyaW5nJzogLycoPzonJ3xbXidcXHJcXG5dKSonLyxcblx0J2tleXdvcmQnOiAvXFxiKD86KD86YWR2ZXJifGNvbmp1bmN0aW9ufENSfGRlZnxkZWZpbmV8ZHlhZHxMRnxtb25hZHxub3VufHZlcmIpXFxifCg/OmFzc2VydHxicmVha3xjYXNlfGNhdGNoW2R0XT98Y29udGludWV8ZG98ZWxzZXxlbHNlaWZ8ZW5kfGZjYXNlfGZvcnxmb3JfXFx3K3xnb3RvX1xcdyt8aWZ8bGFiZWxfXFx3K3xyZXR1cm58c2VsZWN0fHRocm93fHRyeXx3aGlsZXx3aGlsc3QpXFwuKS8sXG5cdCd2ZXJiJzoge1xuXHRcdC8vIE5lZ2F0aXZlIGxvb2stYWhlYWQgcHJldmVudHMgYmFkIGhpZ2hsaWdodGluZ1xuXHRcdC8vIG9mIF46IDsuID0uID06ICEuICE6XG5cdFx0cGF0dGVybjogLyg/IVxcXjp8O1xcLnxbPSFdWy46XSkoPzpcXHsoPzpcXC58Ojo/KT98cCg/OlxcLlxcLj98Oil8Wz0hXFxdXXxbPD4rKlxcLSUkfCwjXVsuOl0/fFtcXF4/XVxcLj98WztcXFtdOj98W359XCJpXVsuOl18W0FDZUVJakxvcl1cXC58KD86W19cXC9cXFxccXN1eF18Xz9cXGQpOikvLFxuXHRcdGFsaWFzOiAna2V5d29yZCdcblx0fSxcblx0J251bWJlcic6IC9cXGJfPyg/Oig/IVxcZDopXFxkKyg/OlxcLlxcZCspPyg/Oig/OltlanB4XXxhZHxhcilfP1xcZCsoPzpcXC5cXGQrKT8pKig/OmJfP1tcXGRhLXpdKyg/OlxcLltcXGRhLXpdKyk/KT98Xyg/IVxcLikpLyxcblx0J2FkdmVyYic6IHtcblx0XHRwYXR0ZXJuOiAvW359XXxbXFwvXFxcXF1cXC4/fFtiZk1dXFwufHRbLjpdLyxcblx0XHRhbGlhczogJ2J1aWx0aW4nXG5cdH0sXG5cdCdvcGVyYXRvcic6IC9bPWFdWy46XXxfXFwuLyxcblx0J2Nvbmp1bmN0aW9uJzoge1xuXHRcdHBhdHRlcm46IC8mKD86XFwuOj98Oik/fFsuOkBdWy46XT98WyFEXVsuOl18WztkSFRdXFwufGA6P3xbXFxeTFNdOnxcIi8sXG5cdFx0YWxpYXM6ICd2YXJpYWJsZSdcblx0fSxcblx0J3B1bmN0dWF0aW9uJzogL1soKV0vXG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWluaS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5pPSB7XG5cdCdjb21tZW50JzogL15bIFxcdF0qOy4qJC9tLFxuXHQnaW1wb3J0YW50JzogL1xcWy4qP1xcXS8sXG5cdCdjb25zdGFudCc6IC9eWyBcXHRdKlteXFxzPV0rPyg/PVsgXFx0XSo9KS9tLFxuXHQnYXR0ci12YWx1ZSc6IHtcblx0XHRwYXR0ZXJuOiAvPS4qLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdwdW5jdHVhdGlvbic6IC9eWz1dL1xuXHRcdH1cblx0fVxufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1pbmZvcm03LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5pbmZvcm03ID0ge1xuXHQnc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC9cIlteXCJdKlwiLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdzdWJzdGl0dXRpb24nOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9cXFtbXlxcXV0rXFxdLyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J2RlbGltaXRlcic6IHtcblx0XHRcdFx0XHRcdHBhdHRlcm46L1xcW3xcXF0vLFxuXHRcdFx0XHRcdFx0YWxpYXM6ICdwdW5jdHVhdGlvbidcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gU2VlIHJlc3QgYmVsb3dcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0J2NvbW1lbnQnOiAvXFxbW15cXF1dK1xcXS8sXG5cdCd0aXRsZSc6IHtcblx0XHRwYXR0ZXJuOiAvXlsgXFx0XSooPzp2b2x1bWV8Ym9va3xwYXJ0KD8hIG9mKXxjaGFwdGVyfHNlY3Rpb258dGFibGUpXFxiLisvaW0sXG5cdFx0YWxpYXM6ICdpbXBvcnRhbnQnXG5cdH0sXG5cdCdudW1iZXInOiB7XG5cdFx0cGF0dGVybjogLyhefFteLV0pKD86KD86XFxifC0pXFxkKyg/OlxcLlxcZCspPyg/OlxcXlxcZCspP1xcdyp8XFxiKD86b25lfHR3b3x0aHJlZXxmb3VyfGZpdmV8c2l4fHNldmVufGVpZ2h0fG5pbmV8dGVufGVsZXZlbnx0d2VsdmUpKVxcYig/IS0pL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQndmVyYic6IHtcblx0XHRwYXR0ZXJuOiAvKF58W14tXSlcXGIoPzphcHBseWluZyB0b3xhcmV8YXR0YWNraW5nfGFuc3dlcmluZ3xhc2tpbmd8YmUoPzppbmcpP3xidXJuaW5nfGJ1eWluZ3xjYWxsZWR8Y2Fycmllc3xjYXJyeSg/ISBvdXQpfGNhcnJ5aW5nfGNsaW1iaW5nfGNsb3Npbmd8Y29uY2VhbCg/OnN8aW5nKT98Y29uc3VsdGluZ3xjb250YWluKD86c3xpbmcpP3xjdXR0aW5nfGRyaW5raW5nfGRyb3BwaW5nfGVhdGluZ3xlbmNsb3MoPzplcz98aW5nKXxlbnRlcmluZ3xleGFtaW5pbmd8ZXhpdGluZ3xnZXR0aW5nfGdpdmluZ3xnb2luZ3xoYSg/OnZlfHN8dmluZyl8aG9sZCg/OnN8aW5nKT98aW1wbCg/Onl8aWVzKXxpbmNvcnBvcmF0KD86ZXM/fGluZyl8aW5zZXJ0aW5nfGlzfGp1bXBpbmd8a2lzc2luZ3xsaXN0ZW5pbmd8bG9ja2luZ3xsb29raW5nfG1lYW4oPzpzfGluZyk/fG9wZW5pbmd8cHJvdmlkKD86ZXM/fGluZyl8cHVsbGluZ3xwdXNoaW5nfHB1dHRpbmd8cmVsYXQoPzplcz98aW5nKXxyZW1vdmluZ3xzZWFyY2hpbmd8c2VlKD86c3xpbmcpP3xzZXR0aW5nfHNob3dpbmd8c2luZ2luZ3xzbGVlcGluZ3xzbWVsbGluZ3xzcXVlZXppbmd8c3dpdGNoaW5nfHN1cHBvcnQoPzpzfGluZyk/fHN3ZWFyaW5nfHRha2luZ3x0YXN0aW5nfHRlbGxpbmd8dGhpbmtpbmd8dGhyb3dpbmd8dG91Y2hpbmd8dHVybmluZ3x0eWluZ3x1bmxvY2soPzpzfGluZyk/fHZhcig/Onl8aWVzfHlpbmcpfHdhaXRpbmd8d2FraW5nfHdhdmluZ3x3ZWFyKD86c3xpbmcpPylcXGIoPyEtKS9pLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICdvcGVyYXRvcidcblx0fSxcblx0J2tleXdvcmQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteLV0pXFxiKD86YWZ0ZXJ8YmVmb3JlfGNhcnJ5IG91dHxjaGVja3xjb250aW51ZSB0aGUgYWN0aW9ufGRlZmluaXRpb24oPz0gKjopfGRvIG5vdGhpbmd8ZWxzZXxlbmQgKD86aWZ8dW5sZXNzfHRoZSBzdG9yeSl8ZXZlcnkgdHVybnxpZnxpbmNsdWRlfGluc3RlYWQoPzogb2YpP3xsZXR8bW92ZXxub3xub3d8b3RoZXJ3aXNlfHJlcGVhdHxyZXBvcnR8cmVzdW1lIHRoZSBzdG9yeXxydWxlIGZvcnxydW5uaW5nIHRocm91Z2h8c2F5KD86aW5nKT98c3RvcCB0aGUgYWN0aW9ufHRlc3R8dHJ5KD86aW5nKT98dW5kZXJzdGFuZHx1bmxlc3N8dXNlfHdoZW58d2hpbGV8eWVzKVxcYig/IS0pL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQncHJvcGVydHknOiB7XG5cdFx0cGF0dGVybjogLyhefFteLV0pXFxiKD86YWRqYWNlbnQoPyEgdG8pfGNhcnJpZWR8Y2xvc2VkfGNvbmNlYWxlZHxjb250YWluZWR8ZGFya3xkZXNjcmliZWR8ZWRpYmxlfGVtcHR5fGVuY2xvc2VkfGVudGVyYWJsZXxldmVufGZlbWFsZXxmaXhlZCBpbiBwbGFjZXxmdWxsfGhhbmRsZWR8aGVsZHxpbXByb3Blci1uYW1lZHxpbmNvcnBvcmF0ZWR8aW5lZGlibGV8aW52aXNpYmxlfGxpZ2h0ZWR8bGl0fGxvY2soPzphYmxlfGVkKXxtYWxlfG1hcmtlZCBmb3IgbGlzdGluZ3xtZW50aW9uZWR8bmVnYXRpdmV8bmV1dGVyfG5vbi0oPzplbXB0eXxmdWxsfHJlY3VycmluZyl8b2RkfG9wYXF1ZXxvcGVuKD86YWJsZSk/fHBsdXJhbC1uYW1lZHxwb3J0YWJsZXxwb3NpdGl2ZXxwcml2YXRlbHktbmFtZWR8cHJvcGVyLW5hbWVkfHByb3ZpZGVkfHB1YmxpY2FsbHktbmFtZWR8cHVzaGFibGUgYmV0d2VlbiByb29tc3xyZWN1cnJpbmd8cmVsYXRlZHxydWJiaW5nfHNjZW5lcnl8c2VlbnxzaW5ndWxhci1uYW1lZHxzdXBwb3J0ZWR8c3dpbmdpbmd8c3dpdGNoKD86YWJsZXxlZCg/OiBvbnwgb2ZmKT8pfHRvdWNoKD86YWJsZXxlZCl8dHJhbnNwYXJlbnR8dW5jb25jZWFsZWR8dW5kZXNjcmliZWR8dW5saXR8dW5sb2NrZWR8dW5tYXJrZWQgZm9yIGxpc3Rpbmd8dW5tZW50aW9uZWR8dW5vcGVuYWJsZXx1bnRvdWNoYWJsZXx1bnZpc2l0ZWR8dmFyaWFibGV8dmlzaWJsZXx2aXNpdGVkfHdlYXJhYmxlfHdvcm4pXFxiKD8hLSkvaSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnc3ltYm9sJ1xuXHR9LFxuXHQncG9zaXRpb24nOiB7XG5cdFx0cGF0dGVybjogLyhefFteLV0pXFxiKD86YWJvdmV8YWRqYWNlbnQgdG98YmFjayBzaWRlIG9mfGJlbG93fGJldHdlZW58ZG93bnxlYXN0fGV2ZXJ5d2hlcmV8ZnJvbnQgc2lkZXxoZXJlfGlufGluc2lkZSg/OiBmcm9tKT98bm9ydGgoPzplYXN0fHdlc3QpP3xub3doZXJlfG9uKD86IHRvcCBvZik/fG90aGVyIHNpZGV8b3V0c2lkZSg/OiBmcm9tKT98cGFydHM/IG9mfHJlZ2lvbmFsbHkgaW58c291dGgoPzplYXN0fHdlc3QpP3x0aHJvdWdofHVwfHdlc3R8d2l0aGluKVxcYig/IS0pL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ2tleXdvcmQnXG5cdH0sXG5cdCd0eXBlJzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXi1dKVxcYig/OmFjdGlvbnM/fGFjdGl2aXQoPzp5fGllcyl8YWN0b3JzP3xhbmltYWxzP3xiYWNrZHJvcHM/fGNvbnRhaW5lcnM/fGRldmljZXM/fGRpcmVjdGlvbnM/fGRvb3JzP3xob2xkZXJzP3xraW5kcz98bGlzdHM/fG1bYWVdbnxub2JvZHl8bm90aGluZ3xub3Vucz98bnVtYmVycz98b2JqZWN0cz98cGVvcGxlfHBlcnNvbnM/fHBsYXllcig/OidzIGhvbGRhbGwpP3xyZWdpb25zP3xyZWxhdGlvbnM/fHJvb21zP3xydWxlKD86Ym9vayk/cz98c2NlbmVzP3xzb21lb25lfHNvbWV0aGluZ3xzdXBwb3J0ZXJzP3x0YWJsZXM/fHRleHRzP3x0aGluZ3M/fHRpbWV8dmVoaWNsZXM/fHdvbVthZV1uKVxcYig/IS0pL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ3ZhcmlhYmxlJ1xuXHR9LFxuXHQncHVuY3R1YXRpb24nOiAvWy4sOjsoKXt9XS9cbn07XG5cblByaXNtLmxhbmd1YWdlcy5pbmZvcm03WydzdHJpbmcnXS5pbnNpZGVbJ3N1YnN0aXR1dGlvbiddLmluc2lkZS5yZXN0ID0gUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMuaW5mb3JtNyk7XG4vLyBXZSBkb24ndCB3YW50IHRoZSByZW1haW5pbmcgdGV4dCBpbiB0aGUgc3Vic3RpdHV0aW9uIHRvIGJlIGhpZ2hsaWdodGVkIGFzIHRoZSBzdHJpbmcuXG5QcmlzbS5sYW5ndWFnZXMuaW5mb3JtN1snc3RyaW5nJ10uaW5zaWRlWydzdWJzdGl0dXRpb24nXS5pbnNpZGUucmVzdC50ZXh0ID0ge1xuXHRwYXR0ZXJuOiAvXFxTKD86XFxzKlxcUykqLyxcblx0YWxpYXM6ICdjb21tZW50J1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1odHRwLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5odHRwID0ge1xuXHQncmVxdWVzdC1saW5lJzoge1xuXHRcdHBhdHRlcm46IC9eKFBPU1R8R0VUfFBVVHxERUxFVEV8T1BUSU9OU3xQQVRDSHxUUkFDRXxDT05ORUNUKVxcYlxcc2h0dHBzPzpcXC9cXC9cXFMrXFxzSFRUUFxcL1swLTkuXSsvbSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdC8vIEhUVFAgVmVyYlxuXHRcdFx0cHJvcGVydHk6IC9eKFBPU1R8R0VUfFBVVHxERUxFVEV8T1BUSU9OU3xQQVRDSHxUUkFDRXxDT05ORUNUKVxcYi8sXG5cdFx0XHQvLyBQYXRoIG9yIHF1ZXJ5IGFyZ3VtZW50XG5cdFx0XHQnYXR0ci1uYW1lJzogLzpcXHcrL1xuXHRcdH1cblx0fSxcblx0J3Jlc3BvbnNlLXN0YXR1cyc6IHtcblx0XHRwYXR0ZXJuOiAvXkhUVFBcXC8xLlswMV0gWzAtOV0rLiovbSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdC8vIFN0YXR1cywgZS5nLiAyMDAgT0tcblx0XHRcdHByb3BlcnR5OiB7XG4gICAgICAgICAgICAgICAgcGF0dGVybjogLyheSFRUUFxcLzEuWzAxXSApWzAtOV0rLiovaSxcbiAgICAgICAgICAgICAgICBsb29rYmVoaW5kOiB0cnVlXG4gICAgICAgICAgICB9XG5cdFx0fVxuXHR9LFxuXHQvLyBIVFRQIGhlYWRlciBuYW1lXG5cdCdoZWFkZXItbmFtZSc6IHtcbiAgICAgICAgcGF0dGVybjogL15bXFx3LV0rOig/PS4pL20sXG4gICAgICAgIGFsaWFzOiAna2V5d29yZCdcbiAgICB9XG59O1xuXG4vLyBDcmVhdGUgYSBtYXBwaW5nIG9mIENvbnRlbnQtVHlwZSBoZWFkZXJzIHRvIGxhbmd1YWdlIGRlZmluaXRpb25zXG52YXIgaHR0cExhbmd1YWdlcyA9IHtcblx0J2FwcGxpY2F0aW9uL2pzb24nOiBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdCxcblx0J2FwcGxpY2F0aW9uL3htbCc6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAsXG5cdCd0ZXh0L3htbCc6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAsXG5cdCd0ZXh0L2h0bWwnOiBQcmlzbS5sYW5ndWFnZXMubWFya3VwXG59O1xuXG4vLyBJbnNlcnQgZWFjaCBjb250ZW50IHR5cGUgcGFyc2VyIHRoYXQgaGFzIGl0cyBhc3NvY2lhdGVkIGxhbmd1YWdlXG4vLyBjdXJyZW50bHkgbG9hZGVkLlxuZm9yICh2YXIgY29udGVudFR5cGUgaW4gaHR0cExhbmd1YWdlcykge1xuXHRpZiAoaHR0cExhbmd1YWdlc1tjb250ZW50VHlwZV0pIHtcblx0XHR2YXIgb3B0aW9ucyA9IHt9O1xuXHRcdG9wdGlvbnNbY29udGVudFR5cGVdID0ge1xuXHRcdFx0cGF0dGVybjogbmV3IFJlZ0V4cCgnKGNvbnRlbnQtdHlwZTpcXFxccyonICsgY29udGVudFR5cGUgKyAnW1xcXFx3XFxcXFddKj8pKD86XFxcXHI/XFxcXG58XFxcXHIpezJ9W1xcXFx3XFxcXFddKicsICdpJyksXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHJlc3Q6IGh0dHBMYW5ndWFnZXNbY29udGVudFR5cGVdXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdodHRwJywgJ2hlYWRlci1uYW1lJywgb3B0aW9ucyk7XG5cdH1cbn1cblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWhhc2tlbGwuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmhhc2tlbGw9IHtcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteLSEjJCUqKz0/JkB8fi46PD5eXFxcXFxcL10pKC0tW14tISMkJSorPT8mQHx+Ljo8Pl5cXFxcXFwvXS4qfHstW1xcd1xcV10qPy19KS9tLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J2NoYXInOiAvJyhbXlxcXFwnXXxcXFxcKFthYmZucnR2XFxcXFwiJyZdfFxcXltBLVpAW1xcXVxcXl9dfE5VTHxTT0h8U1RYfEVUWHxFT1R8RU5RfEFDS3xCRUx8QlN8SFR8TEZ8VlR8RkZ8Q1J8U098U0l8RExFfERDMXxEQzJ8REMzfERDNHxOQUt8U1lOfEVUQnxDQU58RU18U1VCfEVTQ3xGU3xHU3xSU3xVU3xTUHxERUx8XFxkK3xvWzAtN10rfHhbMC05YS1mQS1GXSspKScvLFxuXHQnc3RyaW5nJzogL1wiKFteXFxcXFwiXXxcXFxcKFthYmZucnR2XFxcXFwiJyZdfFxcXltBLVpAW1xcXVxcXl9dfE5VTHxTT0h8U1RYfEVUWHxFT1R8RU5RfEFDS3xCRUx8QlN8SFR8TEZ8VlR8RkZ8Q1J8U098U0l8RExFfERDMXxEQzJ8REMzfERDNHxOQUt8U1lOfEVUQnxDQU58RU18U1VCfEVTQ3xGU3xHU3xSU3xVU3xTUHxERUx8XFxkK3xvWzAtN10rfHhbMC05YS1mQS1GXSspfFxcXFxcXHMrXFxcXCkqXCIvLFxuXHQna2V5d29yZCcgOiAvXFxiKGNhc2V8Y2xhc3N8ZGF0YXxkZXJpdmluZ3xkb3xlbHNlfGlmfGlufGluZml4bHxpbmZpeHJ8aW5zdGFuY2V8bGV0fG1vZHVsZXxuZXd0eXBlfG9mfHByaW1pdGl2ZXx0aGVufHR5cGV8d2hlcmUpXFxiLyxcblx0J2ltcG9ydF9zdGF0ZW1lbnQnIDoge1xuXHRcdC8vIFRoZSBpbXBvcnRlZCBvciBoaWRkZW4gbmFtZXMgYXJlIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGltcG9ydFxuXHRcdC8vIHN0YXRlbWVudC4gVGhpcyBpcyBiZWNhdXNlIHdlIHdhbnQgdG8gaGlnaGxpZ2h0IHRob3NlIGV4YWN0bHkgbGlrZVxuXHRcdC8vIHdlIGRvIGZvciB0aGUgbmFtZXMgaW4gdGhlIHByb2dyYW0uXG5cdFx0cGF0dGVybjogLyhcXHI/XFxufFxccnxeKVxccyppbXBvcnRcXHMrKHF1YWxpZmllZFxccyspPyhbQS1aXVtfYS16QS1aMC05J10qKShcXC5bQS1aXVtfYS16QS1aMC05J10qKSooXFxzK2FzXFxzKyhbQS1aXVtfYS16QS1aMC05J10qKShcXC5bQS1aXVtfYS16QS1aMC05J10qKSopPyhcXHMraGlkaW5nXFxiKT8vbSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdrZXl3b3JkJzogL1xcYihpbXBvcnR8cXVhbGlmaWVkfGFzfGhpZGluZylcXGIvXG5cdFx0fVxuXHR9LFxuXHQvLyBUaGVzZSBhcmUgYnVpbHRpbiB2YXJpYWJsZXMgb25seS4gQ29uc3RydWN0b3JzIGFyZSBoaWdobGlnaHRlZCBsYXRlciBhcyBhIGNvbnN0YW50LlxuXHQnYnVpbHRpbic6IC9cXGIoYWJzfGFjb3N8YWNvc2h8YWxsfGFuZHxhbnl8YXBwZW5kRmlsZXxhcHByb3hSYXRpb25hbHxhc1R5cGVPZnxhc2lufGFzaW5ofGF0YW58YXRhbjJ8YXRhbmh8YmFzaWNJT1J1bnxicmVha3xjYXRjaHxjZWlsaW5nfGNocnxjb21wYXJlfGNvbmNhdHxjb25jYXRNYXB8Y29uc3R8Y29zfGNvc2h8Y3Vycnl8Y3ljbGV8ZGVjb2RlRmxvYXR8ZGVub21pbmF0b3J8ZGlnaXRUb0ludHxkaXZ8ZGl2TW9kfGRyb3B8ZHJvcFdoaWxlfGVpdGhlcnxlbGVtfGVuY29kZUZsb2F0fGVudW1Gcm9tfGVudW1Gcm9tVGhlbnxlbnVtRnJvbVRoZW5Ub3xlbnVtRnJvbVRvfGVycm9yfGV2ZW58ZXhwfGV4cG9uZW50fGZhaWx8ZmlsdGVyfGZsaXB8ZmxvYXREaWdpdHN8ZmxvYXRSYWRpeHxmbG9hdFJhbmdlfGZsb29yfGZtYXB8Zm9sZGx8Zm9sZGwxfGZvbGRyfGZvbGRyMXxmcm9tRG91YmxlfGZyb21FbnVtfGZyb21JbnR8ZnJvbUludGVnZXJ8ZnJvbUludGVncmFsfGZyb21SYXRpb25hbHxmc3R8Z2NkfGdldENoYXJ8Z2V0Q29udGVudHN8Z2V0TGluZXxncm91cHxoZWFkfGlkfGluUmFuZ2V8aW5kZXh8aW5pdHxpbnRUb0RpZ2l0fGludGVyYWN0fGlvRXJyb3J8aXNBbHBoYXxpc0FscGhhTnVtfGlzQXNjaWl8aXNDb250cm9sfGlzRGVub3JtYWxpemVkfGlzRGlnaXR8aXNIZXhEaWdpdHxpc0lFRUV8aXNJbmZpbml0ZXxpc0xvd2VyfGlzTmFOfGlzTmVnYXRpdmVaZXJvfGlzT2N0RGlnaXR8aXNQcmludHxpc1NwYWNlfGlzVXBwZXJ8aXRlcmF0ZXxsYXN0fGxjbXxsZW5ndGh8bGV4fGxleERpZ2l0c3xsZXhMaXRDaGFyfGxpbmVzfGxvZ3xsb2dCYXNlfGxvb2t1cHxtYXB8bWFwTXxtYXBNX3xtYXh8bWF4Qm91bmR8bWF4aW11bXxtYXliZXxtaW58bWluQm91bmR8bWluaW11bXxtb2R8bmVnYXRlfG5vdHxub3RFbGVtfG51bGx8bnVtZXJhdG9yfG9kZHxvcnxvcmR8b3RoZXJ3aXNlfHBhY2t8cGl8cHJlZHxwcmltRXhpdFdpdGh8cHJpbnR8cHJvZHVjdHxwcm9wZXJGcmFjdGlvbnxwdXRDaGFyfHB1dFN0cnxwdXRTdHJMbnxxdW90fHF1b3RSZW18cmFuZ2V8cmFuZ2VTaXplfHJlYWR8cmVhZERlY3xyZWFkRmlsZXxyZWFkRmxvYXR8cmVhZEhleHxyZWFkSU98cmVhZEludHxyZWFkTGlzdHxyZWFkTGl0Q2hhcnxyZWFkTG58cmVhZE9jdHxyZWFkUGFyZW58cmVhZFNpZ25lZHxyZWFkc3xyZWFkc1ByZWN8cmVhbFRvRnJhY3xyZWNpcHxyZW18cmVwZWF0fHJlcGxpY2F0ZXxyZXR1cm58cmV2ZXJzZXxyb3VuZHxzY2FsZUZsb2F0fHNjYW5sfHNjYW5sMXxzY2FucnxzY2FucjF8c2VxfHNlcXVlbmNlfHNlcXVlbmNlX3xzaG93fHNob3dDaGFyfHNob3dJbnR8c2hvd0xpc3R8c2hvd0xpdENoYXJ8c2hvd1BhcmVufHNob3dTaWduZWR8c2hvd1N0cmluZ3xzaG93c3xzaG93c1ByZWN8c2lnbmlmaWNhbmR8c2lnbnVtfHNpbnxzaW5ofHNuZHxzb3J0fHNwYW58c3BsaXRBdHxzcXJ0fHN1YnRyYWN0fHN1Y2N8c3VtfHRhaWx8dGFrZXx0YWtlV2hpbGV8dGFufHRhbmh8dGhyZWFkVG9JT1Jlc3VsdHx0b0VudW18dG9JbnR8dG9JbnRlZ2VyfHRvTG93ZXJ8dG9SYXRpb25hbHx0b1VwcGVyfHRydW5jYXRlfHVuY3Vycnl8dW5kZWZpbmVkfHVubGluZXN8dW50aWx8dW53b3Jkc3x1bnppcHx1bnppcDN8dXNlckVycm9yfHdvcmRzfHdyaXRlRmlsZXx6aXB8emlwM3x6aXBXaXRofHppcFdpdGgzKVxcYi8sXG5cdC8vIGRlY2ltYWwgaW50ZWdlcnMgYW5kIGZsb2F0aW5nIHBvaW50IG51bWJlcnMgfCBvY3RhbCBpbnRlZ2VycyB8IGhleGFkZWNpbWFsIGludGVnZXJzXG5cdCdudW1iZXInIDogL1xcYihcXGQrKFxcLlxcZCspPyhlWystXT9cXGQrKT98MG9bMC03XSt8MHhbMC05YS1mXSspXFxiL2ksXG5cdC8vIE1vc3Qgb2YgdGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBvZiB0aGUgbWVhbmluZyBvZiBhIHNpbmdsZSAnLicuXG5cdC8vIElmIGl0IHN0YW5kcyBhbG9uZSBmcmVlbHksIGl0IGlzIHRoZSBmdW5jdGlvbiBjb21wb3NpdGlvbi5cblx0Ly8gSXQgbWF5IGFsc28gYmUgYSBzZXBhcmF0b3IgYmV0d2VlbiBhIG1vZHVsZSBuYW1lIGFuZCBhbiBpZGVudGlmaWVyID0+IG5vXG5cdC8vIG9wZXJhdG9yLiBJZiBpdCBjb21lcyB0b2dldGhlciB3aXRoIG90aGVyIHNwZWNpYWwgY2hhcmFjdGVycyBpdCBpcyBhblxuXHQvLyBvcGVyYXRvciB0b28uXG5cdCdvcGVyYXRvcicgOiAvXFxzXFwuXFxzfFstISMkJSorPT8mQHx+Ljo8Pl5cXFxcXFwvXSpcXC5bLSEjJCUqKz0/JkB8fi46PD5eXFxcXFxcL10rfFstISMkJSorPT8mQHx+Ljo8Pl5cXFxcXFwvXStcXC5bLSEjJCUqKz0/JkB8fi46PD5eXFxcXFxcL10qfFstISMkJSorPT8mQHx+Ojw+XlxcXFxcXC9dK3xgKFtBLVpdW19hLXpBLVowLTknXSpcXC4pKltfYS16XVtfYS16QS1aMC05J10qYC8sXG5cdC8vIEluIEhhc2tlbGwsIG5lYXJseSBldmVyeXRoaW5nIGlzIGEgdmFyaWFibGUsIGRvIG5vdCBoaWdobGlnaHQgdGhlc2UuXG5cdCdodmFyaWFibGUnOiAvXFxiKFtBLVpdW19hLXpBLVowLTknXSpcXC4pKltfYS16XVtfYS16QS1aMC05J10qXFxiLyxcblx0J2NvbnN0YW50JzogL1xcYihbQS1aXVtfYS16QS1aMC05J10qXFwuKSpbQS1aXVtfYS16QS1aMC05J10qXFxiLyxcblx0J3B1bmN0dWF0aW9uJyA6IC9be31bXFxdOygpLC46XS9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1oYW5kbGViYXJzLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbihmdW5jdGlvbihQcmlzbSkge1xuXG5cdHZhciBoYW5kbGViYXJzX3BhdHRlcm4gPSAvXFx7XFx7XFx7W1xcd1xcV10rP1xcfVxcfVxcfXxcXHtcXHtbXFx3XFxXXSs/XFx9XFx9L2c7XG5cblx0UHJpc20ubGFuZ3VhZ2VzLmhhbmRsZWJhcnMgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdtYXJrdXAnLCB7XG5cdFx0J2hhbmRsZWJhcnMnOiB7XG5cdFx0XHRwYXR0ZXJuOiBoYW5kbGViYXJzX3BhdHRlcm4sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2RlbGltaXRlcic6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxce1xce1xcez98XFx9XFx9XFx9PyQvaSxcblx0XHRcdFx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQnc3RyaW5nJzogLyhbXCInXSkoXFxcXD8uKSo/XFwxLyxcblx0XHRcdFx0J251bWJlcic6IC9cXGItPygweFtcXGRBLUZhLWZdK3xcXGQqXFwuP1xcZCsoW0VlXVsrLV0/XFxkKyk/KVxcYi8sXG5cdFx0XHRcdCdib29sZWFuJzogL1xcYih0cnVlfGZhbHNlKVxcYi8sXG5cdFx0XHRcdCdibG9jayc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXihcXHMqfj9cXHMqKVsjXFwvXVxcUys/KD89XFxzKn4/XFxzKiR8XFxzKS9pLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdFx0YWxpYXM6ICdrZXl3b3JkJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQnYnJhY2tldHMnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogL1xcW1teXFxdXStcXF0vLFxuXHRcdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdFx0cHVuY3R1YXRpb246IC9cXFt8XFxdLyxcblx0XHRcdFx0XHRcdHZhcmlhYmxlOiAvW1xcd1xcV10rL1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL1shXCIjJSYnKCkqKywuXFwvOzw9PkBcXFtcXFxcXFxdXmB7fH1+XS8sXG5cdFx0XHRcdCd2YXJpYWJsZSc6IC9bXiFcIiMlJicoKSorLC5cXC87PD0+QFxcW1xcXFxcXF1eYHt8fX5cXHNdKy9cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIENvbW1lbnRzIGFyZSBpbnNlcnRlZCBhdCB0b3Agc28gdGhhdCB0aGV5IGNhblxuXHQvLyBzdXJyb3VuZCBtYXJrdXBcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnaGFuZGxlYmFycycsICd0YWcnLCB7XG5cdFx0J2hhbmRsZWJhcnMtY29tbWVudCc6IHtcblx0XHRcdHBhdHRlcm46IC9cXHtcXHshW1xcd1xcV10qP1xcfVxcfS8sXG5cdFx0XHRhbGlhczogWydoYW5kbGViYXJzJywnY29tbWVudCddXG5cdFx0fVxuXHR9KTtcblxuXHQvLyBUb2tlbml6ZSBhbGwgaW5saW5lIEhhbmRsZWJhcnMgZXhwcmVzc2lvbnMgdGhhdCBhcmUgd3JhcHBlZCBpbiB7eyB9fSBvciB7e3sgfX19XG5cdC8vIFRoaXMgYWxsb3dzIGZvciBlYXN5IEhhbmRsZWJhcnMgKyBtYXJrdXAgaGlnaGxpZ2h0aW5nXG5cdFByaXNtLmhvb2tzLmFkZCgnYmVmb3JlLWhpZ2hsaWdodCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgIT09ICdoYW5kbGViYXJzJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGVudi50b2tlblN0YWNrID0gW107XG5cblx0XHRlbnYuYmFja3VwQ29kZSA9IGVudi5jb2RlO1xuXHRcdGVudi5jb2RlID0gZW52LmNvZGUucmVwbGFjZShoYW5kbGViYXJzX3BhdHRlcm4sIGZ1bmN0aW9uKG1hdGNoKSB7XG5cdFx0XHRlbnYudG9rZW5TdGFjay5wdXNoKG1hdGNoKTtcblxuXHRcdFx0cmV0dXJuICdfX19IQU5ETEVCQVJTJyArIGVudi50b2tlblN0YWNrLmxlbmd0aCArICdfX18nO1xuXHRcdH0pO1xuXHR9KTtcblxuXHQvLyBSZXN0b3JlIGVudi5jb2RlIGZvciBvdGhlciBwbHVnaW5zIChlLmcuIGxpbmUtbnVtYmVycylcblx0UHJpc20uaG9va3MuYWRkKCdiZWZvcmUtaW5zZXJ0JywgZnVuY3Rpb24oZW52KSB7XG5cdFx0aWYgKGVudi5sYW5ndWFnZSA9PT0gJ2hhbmRsZWJhcnMnKSB7XG5cdFx0XHRlbnYuY29kZSA9IGVudi5iYWNrdXBDb2RlO1xuXHRcdFx0ZGVsZXRlIGVudi5iYWNrdXBDb2RlO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gUmUtaW5zZXJ0IHRoZSB0b2tlbnMgYWZ0ZXIgaGlnaGxpZ2h0aW5nXG5cdC8vIGFuZCBoaWdobGlnaHQgdGhlbSB3aXRoIGRlZmluZWQgZ3JhbW1hclxuXHRQcmlzbS5ob29rcy5hZGQoJ2FmdGVyLWhpZ2hsaWdodCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgIT09ICdoYW5kbGViYXJzJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwLCB0OyB0ID0gZW52LnRva2VuU3RhY2tbaV07IGkrKykge1xuXHRcdFx0Ly8gVGhlIHJlcGxhY2UgcHJldmVudHMgJCQsICQmLCAkYCwgJCcsICRuLCAkbm4gZnJvbSBiZWluZyBpbnRlcnByZXRlZCBhcyBzcGVjaWFsIHBhdHRlcm5zXG5cdFx0XHRlbnYuaGlnaGxpZ2h0ZWRDb2RlID0gZW52LmhpZ2hsaWdodGVkQ29kZS5yZXBsYWNlKCdfX19IQU5ETEVCQVJTJyArIChpICsgMSkgKyAnX19fJywgUHJpc20uaGlnaGxpZ2h0KHQsIGVudi5ncmFtbWFyLCAnaGFuZGxlYmFycycpLnJlcGxhY2UoL1xcJC9nLCAnJCQkJCcpKTtcblx0XHR9XG5cblx0XHRlbnYuZWxlbWVudC5pbm5lckhUTUwgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlO1xuXHR9KTtcblxufShQcmlzbSkpO1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20taGFtbC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKiBUT0RPXG5cdEhhbmRsZSBtdWx0aWxpbmUgY29kZSBhZnRlciB0YWdcblx0ICAgICVmb289IHNvbWUgfFxuXHRcdFx0bXVsdGlsaW5lIHxcblx0XHRcdGNvZGUgfFxuKi9cblxuKGZ1bmN0aW9uKFByaXNtKSB7XG5cblx0UHJpc20ubGFuZ3VhZ2VzLmhhbWwgPSB7XG5cdFx0Ly8gTXVsdGlsaW5lIHN0dWZmIHNob3VsZCBhcHBlYXIgYmVmb3JlIHRoZSByZXN0XG5cblx0XHQnbXVsdGlsaW5lLWNvbW1lbnQnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKCg/Ol58XFxyP1xcbnxcXHIpKFtcXHQgXSopKSg/OlxcL3wtIykuKigoPzpcXHI/XFxufFxccilcXDJbXFx0IF0rLispKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0YWxpYXM6ICdjb21tZW50J1xuXHRcdH0sXG5cblx0XHQnbXVsdGlsaW5lLWNvZGUnOiBbXG5cdFx0XHR7XG5cdFx0XHRcdHBhdHRlcm46IC8oKD86XnxcXHI/XFxufFxccikoW1xcdCBdKikoPzpbfi1dfFsmIV0/PSkpLiosW1xcdCBdKigoPzpcXHI/XFxufFxccilcXDJbXFx0IF0rLiosW1xcdCBdKikqKCg/Olxccj9cXG58XFxyKVxcMltcXHQgXSsuKykvLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMucnVieVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRwYXR0ZXJuOiAvKCg/Ol58XFxyP1xcbnxcXHIpKFtcXHQgXSopKD86W34tXXxbJiFdPz0pKS4qXFx8W1xcdCBdKigoPzpcXHI/XFxufFxccilcXDJbXFx0IF0rLipcXHxbXFx0IF0qKSovLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMucnVieVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XSxcblxuXHRcdC8vIFNlZSBhdCB0aGUgZW5kIG9mIHRoZSBmaWxlIGZvciBrbm93biBmaWx0ZXJzXG5cdFx0J2ZpbHRlcic6IHtcblx0XHRcdHBhdHRlcm46IC8oKD86XnxcXHI/XFxufFxccikoW1xcdCBdKikpOltcXHctXSsoKD86XFxyP1xcbnxcXHIpKD86XFwyW1xcdCBdKy4rfFxccyo/KD89XFxyP1xcbnxcXHIpKSkrLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2ZpbHRlci1uYW1lJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9eOltcXHctXSsvLFxuXHRcdFx0XHRcdGFsaWFzOiAndmFyaWFibGUnXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0J21hcmt1cCc6IHtcblx0XHRcdHBhdHRlcm46IC8oKD86XnxcXHI/XFxufFxccilbXFx0IF0qKTwuKy8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXBcblx0XHRcdH1cblx0XHR9LFxuXHRcdCdkb2N0eXBlJzoge1xuXHRcdFx0cGF0dGVybjogLygoPzpefFxccj9cXG58XFxyKVtcXHQgXSopISEhKD86IC4rKT8vLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0J3RhZyc6IHtcblx0XHRcdC8vIEFsbG93cyBmb3Igb25lIG5lc3RlZCBncm91cCBvZiBicmFjZXNcblx0XHRcdHBhdHRlcm46IC8oKD86XnxcXHI/XFxufFxccilbXFx0IF0qKVslLiNdW1xcd1xcLSMuXSpbXFx3XFwtXSg/OlxcKFteKV0rXFwpfFxceyg/Olxce1tefV0rXFx9fFtefV0pK1xcfXxcXFtbXlxcXV0rXFxdKSpbXFwvPD5dKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdCdhdHRyaWJ1dGVzJzogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIExvb2tiZWhpbmQgdHJpZXMgdG8gcHJldmVudCBpbnRlcnBvbGF0aW9ucyBmb3IgYnJlYWtpbmcgaXQgYWxsXG5cdFx0XHRcdFx0XHQvLyBBbGxvd3MgZm9yIG9uZSBuZXN0ZWQgZ3JvdXAgb2YgYnJhY2VzXG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvKF58W14jXSlcXHsoPzpcXHtbXn1dK1xcfXxbXn1dKStcXH0vLFxuXHRcdFx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMucnVieVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cGF0dGVybjogL1xcKFteKV0rXFwpLyxcblx0XHRcdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdFx0XHQnYXR0ci12YWx1ZSc6IHtcblx0XHRcdFx0XHRcdFx0XHRwYXR0ZXJuOiAvKD1cXHMqKSg/OlwiKD86XFxcXD8uKSo/XCJ8W14pXFxzXSspLyxcblx0XHRcdFx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdCdhdHRyLW5hbWUnOiAvW1xcdzotXSsoPz1cXHMqIT89fFxccypbLCldKS8sXG5cdFx0XHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bPSgpLF0vXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvXFxbW15cXF1dK1xcXS8sXG5cdFx0XHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLnJ1Ynlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9bPD5dL1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0J2NvZGUnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKCg/Ol58XFxyP1xcbnxcXHIpW1xcdCBdKig/Olt+LV18WyYhXT89KSkuKy8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5ydWJ5XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvLyBJbnRlcnBvbGF0aW9ucyBpbiBwbGFpbiB0ZXh0XG5cdFx0J2ludGVycG9sYXRpb24nOiB7XG5cdFx0XHRwYXR0ZXJuOiAvI1xce1tefV0rXFx9Lyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnZGVsaW1pdGVyJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9eI1xce3xcXH0kLyxcblx0XHRcdFx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMucnVieVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0J3B1bmN0dWF0aW9uJzoge1xuXHRcdFx0cGF0dGVybjogLygoPzpefFxccj9cXG58XFxyKVtcXHQgXSopW349XFwtJiFdKy8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHR9O1xuXG5cdHZhciBmaWx0ZXJfcGF0dGVybiA9ICcoKD86XnxcXFxccj9cXFxcbnxcXFxccikoW1xcXFx0IF0qKSk6e3tmaWx0ZXJfbmFtZX19KCg/OlxcXFxyP1xcXFxufFxcXFxyKSg/OlxcXFwyW1xcXFx0IF0rLit8XFxcXHMqPyg/PVxcXFxyP1xcXFxufFxcXFxyKSkpKyc7XG5cblx0Ly8gTm9uIGV4aGF1c3RpdmUgbGlzdCBvZiBhdmFpbGFibGUgZmlsdGVycyBhbmQgYXNzb2NpYXRlZCBsYW5ndWFnZXNcblx0dmFyIGZpbHRlcnMgPSBbXG5cdFx0J2NzcycsXG5cdFx0e2ZpbHRlcjonY29mZmVlJyxsYW5ndWFnZTonY29mZmVlc2NyaXB0J30sXG5cdFx0J2VyYicsXG5cdFx0J2phdmFzY3JpcHQnLFxuXHRcdCdsZXNzJyxcblx0XHQnbWFya2Rvd24nLFxuXHRcdCdydWJ5Jyxcblx0XHQnc2NzcycsXG5cdFx0J3RleHRpbGUnXG5cdF07XG5cdHZhciBhbGxfZmlsdGVycyA9IHt9O1xuXHRmb3IgKHZhciBpID0gMCwgbCA9IGZpbHRlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0dmFyIGZpbHRlciA9IGZpbHRlcnNbaV07XG5cdFx0ZmlsdGVyID0gdHlwZW9mIGZpbHRlciA9PT0gJ3N0cmluZycgPyB7ZmlsdGVyOiBmaWx0ZXIsIGxhbmd1YWdlOiBmaWx0ZXJ9IDogZmlsdGVyO1xuXHRcdGlmIChQcmlzbS5sYW5ndWFnZXNbZmlsdGVyLmxhbmd1YWdlXSkge1xuXHRcdFx0YWxsX2ZpbHRlcnNbJ2ZpbHRlci0nICsgZmlsdGVyLmZpbHRlcl0gPSB7XG5cdFx0XHRcdHBhdHRlcm46IFJlZ0V4cChmaWx0ZXJfcGF0dGVybi5yZXBsYWNlKCd7e2ZpbHRlcl9uYW1lfX0nLCBmaWx0ZXIuZmlsdGVyKSksXG5cdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdmaWx0ZXItbmFtZSc6IHtcblx0XHRcdFx0XHRcdHBhdHRlcm46IC9eOltcXHctXSsvLFxuXHRcdFx0XHRcdFx0YWxpYXM6ICd2YXJpYWJsZSdcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlc1tmaWx0ZXIubGFuZ3VhZ2VdXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdoYW1sJywgJ2ZpbHRlcicsIGFsbF9maWx0ZXJzKTtcblxufShQcmlzbSkpO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWdyb292eS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuZ3Jvb3Z5ID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhc3xkZWZ8aW58YWJzdHJhY3R8YXNzZXJ0fGJvb2xlYW58YnJlYWt8Ynl0ZXxjYXNlfGNhdGNofGNoYXJ8Y2xhc3N8Y29uc3R8Y29udGludWV8ZGVmYXVsdHxkb3xkb3VibGV8ZWxzZXxlbnVtfGV4dGVuZHN8ZmluYWx8ZmluYWxseXxmbG9hdHxmb3J8Z290b3xpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnN0YW5jZW9mfGludHxpbnRlcmZhY2V8bG9uZ3xuYXRpdmV8bmV3fHBhY2thZ2V8cHJpdmF0ZXxwcm90ZWN0ZWR8cHVibGljfHJldHVybnxzaG9ydHxzdGF0aWN8c3RyaWN0ZnB8c3VwZXJ8c3dpdGNofHN5bmNocm9uaXplZHx0aGlzfHRocm93fHRocm93c3x0cmFpdHx0cmFuc2llbnR8dHJ5fHZvaWR8dm9sYXRpbGV8d2hpbGUpXFxiLyxcblx0J3N0cmluZyc6IC8oXCJcIlwifCcnJylbXFxXXFx3XSo/XFwxfChcInwnfFxcLykoPzpcXFxcPy4pKj9cXDJ8KFxcJFxcLykoXFwkXFwvXFwkfFtcXFdcXHddKSo/XFwvXFwkLyxcblx0J251bWJlcic6IC9cXGIoPzowYlswMV9dK3wweFtcXGRhLWZfXSsoPzpcXC5bXFxkYS1mX3BcXC1dKyk/fFtcXGRfXSsoPzpcXC5bXFxkX10rKT8oPzplWystXT9bXFxkXSspPylbZ2xpZGZdP1xcYi9pLFxuXHQnb3BlcmF0b3InOiB7XG5cdFx0cGF0dGVybjogLyhefFteLl0pKH58PT0/fj98XFw/Wy46XT98XFwqKD86Wy49XXxcXCo9Pyk/fFxcLltAJl18XFwuXFwuPHxcXC57MSwyfSg/IVxcLil8LVstPT5dP3xcXCtbKz1dP3whPT98PCg/Ojw9P3w9Pj8pP3w+KD86Pj4/PT98PSk/fCZbJj1dP3xcXHxbfD1dP3xcXC89P3xcXF49P3wlPT8pLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdwdW5jdHVhdGlvbic6IC9cXC4rfFt7fVtcXF07KCksOiRdL1xufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2dyb292eScsICdzdHJpbmcnLCB7XG5cdCdzaGViYW5nJzoge1xuXHRcdHBhdHRlcm46IC8jIS4rLyxcblx0XHRhbGlhczogJ2NvbW1lbnQnXG5cdH1cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdncm9vdnknLCAncHVuY3R1YXRpb24nLCB7XG5cdCdzcG9jay1ibG9jayc6IC9cXGIoc2V0dXB8Z2l2ZW58d2hlbnx0aGVufGFuZHxjbGVhbnVwfGV4cGVjdHx3aGVyZSk6L1xufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2dyb292eScsICdmdW5jdGlvbicsIHtcblx0J2Fubm90YXRpb24nOiB7XG5cdFx0cGF0dGVybjogLyhefFteLl0pQFxcdysvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cbi8vIEhhbmRsZSBzdHJpbmcgaW50ZXJwb2xhdGlvblxuUHJpc20uaG9va3MuYWRkKCd3cmFwJywgZnVuY3Rpb24oZW52KSB7XG5cdGlmIChlbnYubGFuZ3VhZ2UgPT09ICdncm9vdnknICYmIGVudi50eXBlID09PSAnc3RyaW5nJykge1xuXHRcdHZhciBkZWxpbWl0ZXIgPSBlbnYuY29udGVudFswXTtcblxuXHRcdGlmIChkZWxpbWl0ZXIgIT0gXCInXCIpIHtcblx0XHRcdHZhciBwYXR0ZXJuID0gLyhbXlxcXFxdKShcXCQoXFx7Lio/XFx9fFtcXHdcXC5dKykpLztcblx0XHRcdGlmIChkZWxpbWl0ZXIgPT09ICckJykge1xuXHRcdFx0XHRwYXR0ZXJuID0gLyhbXlxcJF0pKFxcJChcXHsuKj9cXH18W1xcd1xcLl0rKSkvO1xuXHRcdFx0fVxuXHRcdFx0ZW52LmNvbnRlbnQgPSBQcmlzbS5oaWdobGlnaHQoZW52LmNvbnRlbnQsIHtcblx0XHRcdFx0J2V4cHJlc3Npb24nOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogcGF0dGVybixcblx0XHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmdyb292eVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0ZW52LmNsYXNzZXMucHVzaChkZWxpbWl0ZXIgPT09ICcvJyA/ICdyZWdleCcgOiAnZ3N0cmluZycpO1xuXHRcdH1cblx0fVxufSk7XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1nby5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuZ28gPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjbGlrZScsIHtcblx0J2tleXdvcmQnOiAvXFxiKGJyZWFrfGNhc2V8Y2hhbnxjb25zdHxjb250aW51ZXxkZWZhdWx0fGRlZmVyfGVsc2V8ZmFsbHRocm91Z2h8Zm9yfGZ1bmN8Z28odG8pP3xpZnxpbXBvcnR8aW50ZXJmYWNlfG1hcHxwYWNrYWdlfHJhbmdlfHJldHVybnxzZWxlY3R8c3RydWN0fHN3aXRjaHx0eXBlfHZhcilcXGIvLFxuXHQnYnVpbHRpbic6IC9cXGIoYm9vbHxieXRlfGNvbXBsZXgoNjR8MTI4KXxlcnJvcnxmbG9hdCgzMnw2NCl8cnVuZXxzdHJpbmd8dT9pbnQoOHwxNnwzMnw2NHwpfHVpbnRwdHJ8YXBwZW5kfGNhcHxjbG9zZXxjb21wbGV4fGNvcHl8ZGVsZXRlfGltYWd8bGVufG1ha2V8bmV3fHBhbmljfHByaW50KGxuKT98cmVhbHxyZWNvdmVyKVxcYi8sXG5cdCdib29sZWFuJzogL1xcYihffGlvdGF8bmlsfHRydWV8ZmFsc2UpXFxiLyxcblx0J29wZXJhdG9yJzogL1sqXFwvJV4hPV09P3xcXCtbPStdP3wtWz0tXT98XFx8Wz18XT98Jig/Oj18JnxcXF49Pyk/fD4oPzo+PT98PSk/fDwoPzo8PT98PXwtKT98Oj18XFwuXFwuXFwuLyxcblx0J251bWJlcic6IC9cXGIoLT8oMHhbYS1mXFxkXSt8KFxcZCtcXC4/XFxkKnxcXC5cXGQrKShlWy0rXT9cXGQrKT8paT8pXFxiL2ksXG5cdCdzdHJpbmcnOiAvKFwifCd8YCkoXFxcXD8ufFxccnxcXG4pKj9cXDEvXG59KTtcbmRlbGV0ZSBQcmlzbS5sYW5ndWFnZXMuZ29bJ2NsYXNzLW5hbWUnXTtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWdsc2wuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmdsc2wgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjbGlrZScsIHtcblx0J2NvbW1lbnQnOiBbXG5cdFx0L1xcL1xcKltcXHdcXFddKj9cXCpcXC8vLFxuXHRcdC9cXC9cXC8oPzpcXFxcKD86XFxyXFxufFtcXHNcXFNdKXwuKSovXG5cdF0sXG5cdCdudW1iZXInOiAvXFxiKD86MHhbXFxkYS1mXSt8KD86XFwuXFxkK3xcXGQrXFwuP1xcZCopKD86ZVsrLV0/XFxkKyk/KVt1bGZdKlxcYi9pLFxuXHQna2V5d29yZCc6IC9cXGIoPzphdHRyaWJ1dGV8Y29uc3R8dW5pZm9ybXx2YXJ5aW5nfGJ1ZmZlcnxzaGFyZWR8Y29oZXJlbnR8dm9sYXRpbGV8cmVzdHJpY3R8cmVhZG9ubHl8d3JpdGVvbmx5fGF0b21pY191aW50fGxheW91dHxjZW50cm9pZHxmbGF0fHNtb290aHxub3BlcnNwZWN0aXZlfHBhdGNofHNhbXBsZXxicmVha3xjb250aW51ZXxkb3xmb3J8d2hpbGV8c3dpdGNofGNhc2V8ZGVmYXVsdHxpZnxlbHNlfHN1YnJvdXRpbmV8aW58b3V0fGlub3V0fGZsb2F0fGRvdWJsZXxpbnR8dm9pZHxib29sfHRydWV8ZmFsc2V8aW52YXJpYW50fHByZWNpc2V8ZGlzY2FyZHxyZXR1cm58ZD9tYXRbMjM0XSg/OnhbMjM0XSk/fFtpYmR1XT92ZWNbMjM0XXx1aW50fGxvd3B8bWVkaXVtcHxoaWdocHxwcmVjaXNpb258W2l1XT9zYW1wbGVyWzEyM11EfFtpdV0/c2FtcGxlckN1YmV8c2FtcGxlclsxMl1EU2hhZG93fHNhbXBsZXJDdWJlU2hhZG93fFtpdV0/c2FtcGxlclsxMl1EQXJyYXl8c2FtcGxlclsxMl1EQXJyYXlTaGFkb3d8W2l1XT9zYW1wbGVyMkRSZWN0fHNhbXBsZXIyRFJlY3RTaGFkb3d8W2l1XT9zYW1wbGVyQnVmZmVyfFtpdV0/c2FtcGxlcjJETVMoPzpBcnJheSk/fFtpdV0/c2FtcGxlckN1YmVBcnJheXxzYW1wbGVyQ3ViZUFycmF5U2hhZG93fFtpdV0/aW1hZ2VbMTIzXUR8W2l1XT9pbWFnZTJEUmVjdHxbaXVdP2ltYWdlQ3ViZXxbaXVdP2ltYWdlQnVmZmVyfFtpdV0/aW1hZ2VbMTJdREFycmF5fFtpdV0/aW1hZ2VDdWJlQXJyYXl8W2l1XT9pbWFnZTJETVMoPzpBcnJheSk/fHN0cnVjdHxjb21tb258cGFydGl0aW9ufGFjdGl2ZXxhc218Y2xhc3N8dW5pb258ZW51bXx0eXBlZGVmfHRlbXBsYXRlfHRoaXN8cmVzb3VyY2V8Z290b3xpbmxpbmV8bm9pbmxpbmV8cHVibGljfHN0YXRpY3xleHRlcm58ZXh0ZXJuYWx8aW50ZXJmYWNlfGxvbmd8c2hvcnR8aGFsZnxmaXhlZHx1bnNpZ25lZHxzdXBlcnB8aW5wdXR8b3V0cHV0fGh2ZWNbMjM0XXxmdmVjWzIzNF18c2FtcGxlcjNEUmVjdHxmaWx0ZXJ8c2l6ZW9mfGNhc3R8bmFtZXNwYWNlfHVzaW5nKVxcYi9cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdnbHNsJywgJ2NvbW1lbnQnLCB7XG5cdCdwcmVwcm9jZXNzb3InOiB7XG5cdFx0cGF0dGVybjogLyheWyBcXHRdKikjKD86KD86ZGVmaW5lfHVuZGVmfGlmfGlmZGVmfGlmbmRlZnxlbHNlfGVsaWZ8ZW5kaWZ8ZXJyb3J8cHJhZ21hfGV4dGVuc2lvbnx2ZXJzaW9ufGxpbmUpXFxiKT8vbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnYnVpbHRpbidcblx0fVxufSk7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tZ2l0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5naXQgPSB7XG5cdC8qXG5cdCAqIEEgc2ltcGxlIG9uZSBsaW5lIGNvbW1lbnQgbGlrZSBpbiBhIGdpdCBzdGF0dXMgY29tbWFuZFxuXHQgKiBGb3IgaW5zdGFuY2U6XG5cdCAqICQgZ2l0IHN0YXR1c1xuXHQgKiAjIE9uIGJyYW5jaCBpbmZpbml0ZS1zY3JvbGxcblx0ICogIyBZb3VyIGJyYW5jaCBhbmQgJ29yaWdpbi9zaGFyZWRCcmFuY2hlcy9mcm9udGVuZFRlYW0vaW5maW5pdGUtc2Nyb2xsJyBoYXZlIGRpdmVyZ2VkLFxuXHQgKiAjIGFuZCBoYXZlIDEgYW5kIDIgZGlmZmVyZW50IGNvbW1pdHMgZWFjaCwgcmVzcGVjdGl2ZWx5LlxuXHQgKiBub3RoaW5nIHRvIGNvbW1pdCAod29ya2luZyBkaXJlY3RvcnkgY2xlYW4pXG5cdCAqL1xuXHQnY29tbWVudCc6IC9eIy4qL20sXG5cblx0Lypcblx0ICogUmVnZXhwIHRvIG1hdGNoIHRoZSBjaGFuZ2VkIGxpbmVzIGluIGEgZ2l0IGRpZmYgb3V0cHV0LiBDaGVjayB0aGUgZXhhbXBsZSBiZWxvdy5cblx0ICovXG5cdCdkZWxldGVkJzogL15bLeKAk10uKi9tLFxuXHQnaW5zZXJ0ZWQnOiAvXlxcKy4qL20sXG5cblx0Lypcblx0ICogYSBzdHJpbmcgKGRvdWJsZSBhbmQgc2ltcGxlIHF1b3RlKVxuXHQgKi9cblx0J3N0cmluZyc6IC8oXCJ8JykoXFxcXD8uKSo/XFwxL20sXG5cblx0Lypcblx0ICogYSBnaXQgY29tbWFuZC4gSXQgc3RhcnRzIHdpdGggYSByYW5kb20gcHJvbXB0IGZpbmlzaGluZyBieSBhICQsIHRoZW4gXCJnaXRcIiB0aGVuIHNvbWUgb3RoZXIgcGFyYW1ldGVyc1xuXHQgKiBGb3IgaW5zdGFuY2U6XG5cdCAqICQgZ2l0IGFkZCBmaWxlLnR4dFxuXHQgKi9cblx0J2NvbW1hbmQnOiB7XG5cdFx0cGF0dGVybjogL14uKlxcJCBnaXQgLiokL20sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQvKlxuXHRcdFx0ICogQSBnaXQgY29tbWFuZCBjYW4gY29udGFpbiBhIHBhcmFtZXRlciBzdGFydGluZyBieSBhIHNpbmdsZSBvciBhIGRvdWJsZSBkYXNoIGZvbGxvd2VkIGJ5IGEgc3RyaW5nXG5cdFx0XHQgKiBGb3IgaW5zdGFuY2U6XG5cdFx0XHQgKiAkIGdpdCBkaWZmIC0tY2FjaGVkXG5cdFx0XHQgKiAkIGdpdCBsb2cgLXBcblx0XHRcdCAqL1xuXHRcdFx0J3BhcmFtZXRlcic6IC9cXHMoLS18LSlcXHcrL21cblx0XHR9XG5cdH0sXG5cblx0Lypcblx0ICogQ29vcmRpbmF0ZXMgZGlzcGxheWVkIGluIGEgZ2l0IGRpZmYgY29tbWFuZFxuXHQgKiBGb3IgaW5zdGFuY2U6XG5cdCAqICQgZ2l0IGRpZmZcblx0ICogZGlmZiAtLWdpdCBmaWxlLnR4dCBmaWxlLnR4dFxuXHQgKiBpbmRleCA2MjE0OTUzLi4xZDU0YTUyIDEwMDY0NFxuXHQgKiAtLS0gZmlsZS50eHRcblx0ICogKysrIGZpbGUudHh0XG5cdCAqIEBAIC0xICsxLDIgQEBcblx0ICogLUhlcmUncyBteSB0ZXR4IGZpbGVcblx0ICogK0hlcmUncyBteSB0ZXh0IGZpbGVcblx0ICogK0FuZCB0aGlzIGlzIHRoZSBzZWNvbmQgbGluZVxuXHQgKi9cblx0J2Nvb3JkJzogL15AQC4qQEAkL20sXG5cblx0Lypcblx0ICogTWF0Y2ggYSBcImNvbW1pdCBbU0hBMV1cIiBsaW5lIGluIGEgZ2l0IGxvZyBvdXRwdXQuXG5cdCAqIEZvciBpbnN0YW5jZTpcblx0ICogJCBnaXQgbG9nXG5cdCAqIGNvbW1pdCBhMTFhMTRlZjdlMjZmMmNhNjJkNGIzNWVhYzQ1NWNlNjM2ZDBkYzA5XG5cdCAqIEF1dGhvcjogbGdpcmF1ZGVsXG5cdCAqIERhdGU6ICAgTW9uIEZlYiAxNyAxMToxODozNCAyMDE0ICswMTAwXG5cdCAqXG5cdCAqICAgICBBZGQgb2YgYSBuZXcgbGluZVxuXHQgKi9cblx0J2NvbW1pdF9zaGExJzogL15jb21taXQgXFx3ezQwfSQvbVxufTtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWdoZXJraW4uanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmdoZXJraW4gPSB7XG5cdCdweXN0cmluZyc6IHtcblx0XHRwYXR0ZXJuOiAvKFwiXCJcInwnJycpW1xcc1xcU10rP1xcMS8sXG5cdFx0YWxpYXM6ICdzdHJpbmcnXG5cdH0sXG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oKF58XFxyP1xcbnxcXHIpWyBcXHRdKikjLiovLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J3RhZyc6IHtcblx0XHRwYXR0ZXJuOiAvKChefFxccj9cXG58XFxyKVsgXFx0XSopQFxcUyovLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J2ZlYXR1cmUnOiB7XG5cdFx0cGF0dGVybjogLygoXnxcXHI/XFxufFxccilbIFxcdF0qKShBYmlsaXR5fEFob3kgbWF0ZXkhfEFyd2VkZHxBc3Bla3R8QmVzaWdoZWlkIEJlaG9lZnRlfEJ1c2luZXNzIE5lZWR8Q2FyYWN0ZXJpc3RpY2F8Q2FyYWN0ZXLDrXN0aWNhfEVnZW5za2FifEVnZW5za2FwfEVpZ2lubGVpa2l8RmVhdHVyZXxGxKvEjWF8Rml0dXJ8Rm9uY3Rpb25uYWxpdMOpfEZvbmtzeW9uYWxpdGV8RnVuY2lvbmFsaWRhZGV8RnVuY2lvbmFsaXRhdHxGdW5jdGlvbmFsaXRhdGV8RnVuY8WjaW9uYWxpdGF0ZXxGdW5jyJtpb25hbGl0YXRlfEZ1bmN0aW9uYWxpdGVpdHxGdW5nc2l8RnVua2NpYXxGdW5rY2lqYXxGdW5rY2lvbmFsaXTEgXRlfEZ1bmtjaW9uYWxub3N0fEZ1bmtjamF8RnVua3NpZXxGdW5rdGlvbmFsaXTDpHR8RnVua3Rpb25hbGl0w6lpdHxGdW56aW9uYWxpdMOgfEh3YWV0fEh3w6Z0fEplbGxlbXrFkXxLYXJha3RlcmlzdGlrfGxhSHxMYXN0bm9zdHxNYWt8TW9ndWNub3N0fE1vZ3XEh25vc3R8TW96bm9zdGl8TW/Fvm5vc3RpfE9IIEhBSXxPbWFkdXN8T21pbmFpc3V1c3xPc29iaW5hfMOWemVsbGlrfHBlcmJvZ2h8cG9RYm9naCBtYWxqYSd8UG90cnplYmEgYml6bmVzb3dhfFBvxb5hZGF2ZWt8UG/FvmlhZGF2a2F8UHJldHR5IG11Y2h8UWFwfFF1J21lSCAndXR8U2F2eWLEl3xUw61uaCBuxINuZ3xUcmFqdG98VmVybW/Dq3xWbGFzdG5vc8WlfFfFgmHFm2Npd2/Fm8SHfFpuYcSNaWxub3N0fM6Uz4XOvc6xz4TPjM+EzrfPhM6xfM6bzrXOuc+Ezr/Phc+BzrPOr86xfNCc0L7Qs9GD0ZvQvdC+0YHRgnzQnNOp0LzQutC40L3Qu9C10Lp80J7RgdC+0LHQuNC90LB80KHQstC+0LnRgdGC0LLQvnzSrtC30LXQvdGH05nQu9C10LrQu9C10LvQtdC6fNCk0YPQvdC60YbQuNC+0L3QsNC7fNCk0YPQvdC60YbQuNC+0L3QsNC70L3QvtGB0YJ80KTRg9C90LrRhtC40Y980KTRg9C90LrRhtGW0L7QvdCw0Lt816rXm9eV16DXlHzYrtin2LXZitipfNiu2LXZiNi124zYqnzYtdmE2KfYrduM2Kp82qnYp9ix2YjYqNin2LEg2qnbjCDYttix2YjYsdiqfNmI2ZDbjNqY2q/bjHzgpLDgpYLgpKog4KSy4KWH4KSWfOColuCovuCouOCpgOCoheCopHzgqKjgqJXgqLYg4Kio4KmB4Ki54Ki+4KiwfOCoruCpgeCoueCovuCoguCopuCosOCovnzgsJfgsYHgsKPgsK7gsYF84LK54LOG4LKa4LON4LKa4LKzfOC4hOC4p+C4suC4oeC4leC5ieC4reC4h+C4geC4suC4o+C4l+C4suC4h+C4mOC4uOC4o+C4geC4tOC4iHzguITguKfguLLguKHguKrguLLguKHguLLguKPguJZ84LmC4LiE4Lij4LiH4Lir4Lil4Lix4LiBfOq4sOuKpXzjg5XjgqPjg7zjg4Hjg6N85Yqf6IO9fOapn+iDvSk6KFteOl0rKD86XFxyP1xcbnxcXHJ8JCkpKi8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdpbXBvcnRhbnQnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC8oOilbXlxcclxcbl0rLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGtleXdvcmQ6IC9bXjpcXHJcXG5dKzovXG5cdFx0fVxuXHR9LFxuXHQnc2NlbmFyaW8nOiB7XG5cdFx0cGF0dGVybjogLygoXnxcXHI/XFxufFxccilbIFxcdF0qKShBYnN0cmFjdCBTY2VuYXJpb3xBYnN0cmFrdCBTY2VuYXJpb3xBY2h0ZXJncm9uZHxBZXJ8w4ZyfEFndGVyZ3JvbmR8QWxsIHknYWxsfEFudGVjZWRlbnRlc3xBbnRlY2VkZW50c3xBdGJ1csOwYXLDoXN8QXRidXLDsGFyw6FzaXJ8QXd3dywgbG9vayBtYXRlfEI0fEJhY2tncm91bmR8QmFnZ3J1bmR8QmFrZ3J1bmR8QmFrZ3J1bm58QmFrZ3J1bm51cnxCZWlzcGllbGV8QmVpc3BpbGxlcnxC4buRaSBj4bqjbmh8Q2VmbmRpcnxDZW5hcmlvfENlbsOhcmlvfENlbmFyaW8gZGUgRnVuZG98Q2Vuw6FyaW8gZGUgRnVuZG98Q2VuYXJpb3N8Q2Vuw6FyaW9zfENvbnRlc3RvfENvbnRleHR8Q29udGV4dGV8Q29udGV4dG98Q29udG98Q29udG9ofENvbnRvbmV8RMOmbWl8RGFzYXJ8RGVhZCBtZW4gdGVsbCBubyB0YWxlc3xEZWxpbmVhY2FvIGRvIENlbmFyaW98RGVsaW5lYcOnw6NvIGRvIENlbsOhcmlvfERpcyBpcyB3aGF0IHdlbnQgZG93bnxE4buvIGxp4buHdXxEeWFncmFtIHNlbmFyeW98RHlhZ3JhbSBTZW5hcnlvfEVnemFucHxFamVtcGxvc3xFa3NlbXBsZXJ8RWt6ZW1wbG9qfEVuZ2hyZWlmZnRpYXV8RXNib3pvIGRvIGVzY2VuYXJpb3xFc2NlbmFyaXxFc2NlbmFyaW98RXNlbXBpfEVzcXVlbWEgZGUgbCdlc2NlbmFyaXxFc3F1ZW1hIGRlbCBlc2NlbmFyaW98RXNxdWVtYSBkbyBDZW5hcmlvfEVzcXVlbWEgZG8gQ2Vuw6FyaW98RXhhbXBsZXN8RVhBTVBMWnxFeGVtcGVsfEV4ZW1wbGV8RXhlbXBsZXN8RXhlbXBsb3N8Rmlyc3Qgb2ZmfEZvbm98Rm9yZ2F0w7Nrw7ZueXZ8Rm9yZ2F0w7Nrw7ZueXYgdsOhemxhdHxGdW5kb3xHZcOnbWnFn3xnaGFudG9IfEdydW5kbGFnZXxIYW5uZXJncm9uZHxIw6F0dMOpcnxIZWF2ZSB0b3xJc3RvcmlrfEp1aHR1bWlkfEtlYWRhYW58S2h1bmcga+G7i2NoIGLhuqNufEtodW5nIHTDrG5oIGh14buRbmd8S+G7i2NoIGLhuqNufEtvbmNlcHR8S29uc2VwIHNrZW5hcmlvfEtvbnTDqGtzfEtvbnRla3N0fEtvbnRla3N0YXN8S29udGVrc3RzfEtvbnRleHR8S29udHVybyBkZSBsYSBzY2VuYXJvfExhdGFyIEJlbGFrYW5nfGx1dHxsdXQgY2hvdm5hdGxofGx1dG1leXxMw71zaW5nIEF0YnVyw7BhcsOhc2FyfEzDvXNpbmcgRMOmbWF8TWVuZ2dhcmlza2FuIFNlbmFyaW98TUlTSFVOfE1JU0hVTiBTUlNMWXxtbyd8TsOhxI1ydCBTY2Vuw6FyYXxOw6HEjXJ0IFNjw6luw6HFmWV8TsOhxI1ydCBTY2Vuw6FydXxPcmlzIHNjZW5hcmlqYXzDlnJuZWtsZXJ8T3Nub3ZhfE9zbm92YSBTY2Vuw6FyYXxPc25vdmEgc2PDqW7DocWZZXxPc251dGVrfE96YWRqZXxQYXJhdWdzfFBhdnl6ZMW+aWFpfFDDqWxkw6FrfFBpZW3Ek3JpfFBsYW4gZHUgc2PDqW5hcmlvfFBsYW4gZHUgU2PDqW5hcmlvfFBsYW4gc2VuYXJ5b3xQbGFuIFNlbmFyeW98UGxhbmcgdnVtIFN6ZW5hcmlvfFBvemFkw618UG96YWRpZXxQb3phZGluYXxQcsOta2xhZHl8UMWZw61rbGFkeXxQcmltZXJ8UHJpbWVyaXxQcmltamVyaXxQcnp5a8WCYWR5fFJhYW1zdHNlbmFhcml1bXxSZWNrb24gaXQncyBsaWtlfFJlcmVmb25zfFNjZW7DoXJ8U2PDqW7DocWZfFNjZW5hcmllfFNjZW5hcmlqfFNjZW5hcmlqYWl8U2NlbmFyaWphdXMgxaFhYmxvbmFzfFNjZW5hcmlqaXxTY2VuxIFyaWpzfFNjZW7EgXJpanMgcMSTYyBwYXJhdWdhfFNjZW5hcmlqdXN8U2NlbmFyaW98U2PDqW5hcmlvfFNjZW5hcmlvIEFtbGluZWxsb2x8U2NlbmFyaW8gT3V0bGluZXxTY2VuYXJpbyBUZW1wbGF0ZXxTY2VuYXJpb21hbHxTY2VuYXJpb21hbGx8U2NlbmFyaW9zfFNjZW5hcml1fFNjZW5hcml1c3p8U2NlbmFyb3xTY2hlbWEgZGVsbG8gc2NlbmFyaW98U2Ugw7BlfFNlIHRoZXxTZSDDvmV8U2VuYXJpb3xTZW5hcnlvfFNlbmFyeW8gZGVza3JpcHN5b258U2VuYXJ5byBEZXNrcmlwc3lvbnxTZW5hcnlvIHRhc2xhxJ/EsXxTaGl2ZXIgbWUgdGltYmVyc3xTaXR1xIFjaWphfFNpdHVhaXxTaXR1YXNpZXxTaXR1YXNpZSBVaXRlZW5zZXR0aW5nfFNrZW5hcmlvfFNrZW5hcmlvIGtvbnNlcHxTa2ljYXxTdHJ1Y3R1cmEgc2NlbmFyaXV8U3RydWN0dXLEgyBzY2VuYXJpdXxTdHJ1a3R1cmEgc2NlbmFyaWphfFN0c2VuYWFyaXVtfFN3YXxTd2EgaHdhZXIgc3dhfFN3YSBod8OmciBzd2F8U3phYmxvbiBzY2VuYXJpdXN6YXxTemVuYXJpb3xTemVuYXJpb2dydW5kcmlzc3xUYXBhdWtzZXR8VGFwYXVzfFRhcGF1c2FpaGlvfFRhdXN0fFRhdXN0YXxUZW1wbGF0ZSBLZWFkYWFufFRlbXBsYXRlIFNlbmFyaW98VGVtcGxhdGUgU2l0dWFpfFRoZSB0aGluZyBvZiBpdCBpc3xUw6xuaCBodeG7kW5nfFZhcmlhbnRhaXxWb29yYmVlbGRlfFZvb3JiZWVsZGVufFdoYXJyaW1lYW4gaXN8WW9cXC1ob1xcLWhvfFlvdSdsbCB3YW5uYXxaYcWCb8W8ZW5pYXzOoM6xz4HOsc60zrXOr86zzrzOsc+EzrF8zqDOtc+BzrnOs8+BzrHPhs6uIM6jzrXOvc6xz4HOr86/z4V8zqPOtc69zqzPgc65zrF8zqPOtc69zqzPgc65zr98zqXPgM+MzrLOsc64z4HOv3zQmtC10YDQtdGIfNCa0L7QvdGC0LXQutGB0YJ80JrQvtC90YbQtdC/0YJ80JzQuNGB0LDQu9C70LDRgHzQnNC40YHQvtC70LvQsNGAfNCe0YHQvdC+0LLQsHzQn9C10YDQtdC00YPQvNC+0LLQsHzQn9C+0LfQsNC00LjQvdCwfNCf0YDQtdC00LjRgdGC0L7RgNC40Y980J/RgNC10LTRi9GB0YLQvtGA0LjRj3zQn9GA0LjQutC70LDQtNC4fNCf0YDQuNC80LXRgHzQn9GA0LjQvNC10YDQuHzQn9GA0LjQvNC10YDRi3zQoNCw0LzQutCwINC90LAg0YHRhtC10L3QsNGA0LjQuXzQodC60LjRhtCwfNCh0YLRgNGD0LrRgtGD0YDQsCDRgdGG0LXQvdCw0YDQuNGY0LB80KHRgtGA0YPQutGC0YPRgNCwINGB0YbQtdC90LDRgNC40Y980KHRgtGA0YPQutGC0YPRgNCwINGB0YbQtdC90LDRgNGW0Y580KHRhtC10L3QsNGA0LjQuXzQodGG0LXQvdCw0YDQuNC5INGB0YLRgNGD0LrRgtGD0YDQsNGB0Lh80KHRhtC10L3QsNGA0LjQudC90YvSoyDRgtOp0LfQtdC70LXRiNC1fNCh0YbQtdC90LDRgNC40ZjQuHzQodGG0LXQvdCw0YDQuNC+fNCh0YbQtdC90LDRgNGW0Ll80KLQsNGA0LjRhXzSrtGA0L3TmdC60LvTmdGAfNeT15XXktee15DXldeqfNeo16fXonzXqteR16DXmdeqINeq16jXl9eZ16l816rXqNeX15nXqXzYp9mE2K7ZhNmB2YrYqXzYp9mE2q/ZiNuMINiz2YbYp9ix24zZiHzYp9mF2KvZhNipfNm+2LMg2YXZhti42LF82LLZhduM2YbZh3zYs9mG2KfYsduM2Yh82LPZitmG2KfYsdmK2Yh82LPZitmG2KfYsdmK2Ygg2YXYrti32Ld82YXYq9in2YTbjNq6fNmF2YbYuNixINmG2KfZhduSINqp2Kcg2K7Yp9qp24F82YXZhti42LHZhtin2YXbgXzZhtmF2YjZhtmHINmH2Kd84KSJ4KSm4KS+4KS54KSw4KSjfOCkquCksOCkv+CkpuClg+CktuCljeCkr3zgpKrgpLDgpL/gpKbgpYPgpLbgpY3gpK8g4KSw4KWC4KSq4KSw4KWH4KSW4KS+fOCkquClg+Ckt+CljeCkoOCkreClguCkruCkv3zgqIngqKbgqL7gqLngqLDgqKjgqL7gqIJ84Kiq4Kif4KiV4Kil4Ki+fOCoquCon+ColeCopeCoviDgqKLgqL7gqILgqJrgqL584Kiq4Kif4KiV4Kil4Ki+IOCosOCpguCoqiDgqLDgqYfgqJbgqL584Kiq4Ki/4Kib4KmL4KiV4KmcfOCwieCwpuCwvuCwueCwsOCwo+CwsuCxgXzgsJXgsKXgsKjgsIJ84LCo4LGH4LCq4LCl4LGN4LCv4LCCfOCwuOCwqOCxjeCwqOCwv+CwteCxh+CwtuCwgnzgsongsqbgsr7gsrngsrDgsqPgs4bgspfgsrPgs4F84LKV4LKl4LK+4LK44LK+4LKw4LK+4LKC4LK2fOCyteCyv+CyteCysOCyo+Czhnzgsrngsr/gsqjgs43gsqjgs4bgsrLgs4Z84LmC4LiE4Lij4LiH4Liq4Lij4LmJ4Liy4LiH4LiC4Lit4LiH4LmA4Lir4LiV4Li44LiB4Liy4Lij4LiT4LmMfOC4iuC4uOC4lOC4guC4reC4h+C4leC4seC4p+C4reC4ouC5iOC4suC4h3zguIrguLjguJTguILguK3guIfguYDguKvguJXguLjguIHguLLguKPguJPguYx84LmB4LiZ4Lin4LiE4Li04LiUfOC4quC4o+C4uOC4m+C5gOC4q+C4leC4uOC4geC4suC4o+C4k+C5jHzguYDguKvguJXguLjguIHguLLguKPguJPguYx867Cw6rK9fOyLnOuCmOumrOyYpHzsi5zrgpjrpqzsmKQg6rCc7JqUfOyYiHzjgrXjg7Pjg5fjg6t844K344OK44Oq44KqfOOCt+ODiuODquOCquOCouOCpuODiOODqeOCpOODs3zjgrfjg4rjg6rjgqrjg4bjg7Pjg5fjg6x844K344OK44Oq44Kq44OG44Oz44OX44Os44O844OIfOODhuODs+ODl+ODrHzkvot85L6L5a2QfOWJp+acrHzliafmnKzlpKfnurJ85YqH5pysfOWKh+acrOWkp+e2sXzlnLrmma985Zy65pmv5aSn57qyfOWgtOaZr3zloLTmma/lpKfntrF86IOM5pmvKTpbXjpcXHJcXG5dKi8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdpbXBvcnRhbnQnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC8oOilbXlxcclxcbl0qLyxcblx0XHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGtleXdvcmQ6IC9bXjpcXHJcXG5dKzovXG5cdFx0fVxuXHR9LFxuXHQndGFibGUtYm9keSc6IHtcblx0XHRwYXR0ZXJuOiAvKCg/Olxccj9cXG58XFxyKVsgXFx0XSpcXHwuK1xcfFteXFxyXFxuXSopKy8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdvdXRsaW5lJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvPFtePl0rPz4vLFxuXHRcdFx0XHRhbGlhczogJ3ZhcmlhYmxlJ1xuXHRcdFx0fSxcblx0XHRcdCd0ZCc6IHtcblx0XHRcdFx0cGF0dGVybjogL1xccypbXlxcc3xdW158XSovLFxuXHRcdFx0XHRhbGlhczogJ3N0cmluZydcblx0XHRcdH0sXG5cdFx0XHQncHVuY3R1YXRpb24nOiAvXFx8L1xuXHRcdH1cblx0fSxcblx0J3RhYmxlLWhlYWQnOiB7XG5cdFx0cGF0dGVybjogLygoPzpcXHI/XFxufFxccilbIFxcdF0qXFx8LitcXHxbXlxcclxcbl0qKS8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQndGgnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9cXHMqW15cXHN8XVtefF0qLyxcblx0XHRcdFx0YWxpYXM6ICd2YXJpYWJsZSdcblx0XHRcdH0sXG5cdFx0XHQncHVuY3R1YXRpb24nOiAvXFx8L1xuXHRcdH1cblx0fSxcblx0J2F0cnVsZSc6IHtcblx0XHRwYXR0ZXJuOiAvKCg/Olxccj9cXG58XFxyKVsgXFx0XSspKCdhY2h8J2F8J2VqfDd8YXxBIHRha8OpfEEgdGFrdGllxb58QSB0aWXFvnxBIHrDoXJvdmXFiHxBYmVyfEFjfEFkb3R0fEFra29yfEFrfEFsZXNob3Jlc3xBbGV8QWxpfEFsbG9yYXxBbG9yc3xBbHN8QW1hfEFtZW5ueWliZW58QW1pa29yfEFtcGFrfGFufEFOfEFuYW5naW5nfEFuZCB5J2FsbHxBbmR8QW5nZW5vbW1lbnxBbnJoZWdlZGlnIGF8QW58QXBhYmlsYXxBdMOoc3xBdGVzYXxBdHVuY2l8QXZhc3QhfEF5ZXxBfGF3ZXJ8QmFnaXxCYW5qdXJ8QmV0fEJp4bq/dHxCbGltZXkhfEJ1aHxCdXQgYXQgdGhlIGVuZCBvZiB0aGUgZGF5IEkgcmVja29ufEJ1dCB5J2FsbHxCdXR8QlVUfENhbHxDw6JuZHxDYW5kb3xDYW5kfENlfEN1YW5kb3zEjGV8w5BhIMOwZXzDkGF8RGFkYXN8RGFkYXxEYWRvc3xEYWRvfERhSCBnaHUnIGJlamx1J3xkYW5ufERhbm58RGFub3xEYW58RGFyfERhdCBmaWluZHxEYXRhfERhdGUgZmlpbmR8RGF0ZXxEYXRpIGZpaW5kfERhdGl8RGHFo2kgZmlpbmR8RGHIm2kgZmlpbmR8RGF0b3xERU58RGVuIHlvdXNlIGdvdHRhfERlbmdhbnxEZXxEaWJlcml8RGl5ZWxpbSBraXxEb25hZGF8RG9uYXR8RG9uaXRhxLVvfERvfER1bnxEdW90YXzDkHVyaHxFZWxkYWRlc3xFZnxFxJ9lciBraXxFbnRhb3xFbnTDo298RW50w7NufEVudG9uY2VzfEVufEVwaXxFfMOJc3xFdGFudCBkb25uw6llfEV0YW50IGRvbm7DqXxFdHzDiXRhbnQgZG9ubsOpZXN8w4l0YW50IGRvbm7DqWV8w4l0YW50IGRvbm7DqXxFdGFudCBkb25uw6llc3xFdGFudCBkb25uw6lzfMOJdGFudCBkb25uw6lzfEZha2F0fEdhbmd3YXkhfEdkeXxHZWdlYmVuIHNlaWVufEdlZ2ViZW4gc2VpfEdlZ2V2ZW58R2VnZXdlfGdodScgbm9ibHUnfEdpdHR8R2l2ZW4geSdhbGx8R2l2ZW58R2l2ZXR8R2l2dW58SGF8Q2hvfEkgQ0FOIEhBWnxJbnxJcnxJdCdzIGp1c3QgdW5iZWxpZXZhYmxlfEl8SmF8SmXFm2xpfEplxbxlbGl8S2FkYXJ8S2FkYXxLYWR8S2FpfEthanxLZHnFvnxLZcSPfEtlbXVkaWFufEtldGlrYXxLaGl8S2llZHl8S298S3VpZHxLdWl8S3VufExhbnxsYXRsaHxMZSBzYSBhfExldCBnbyBhbmQgaGF1bHxMZXxMw6ggc2EgYXxMw6h8TG9nb3xMb3JzcXUnPHxMb3JzcXVlfG3DpHxNYWFyfE1haXN8TWFqxIVjfE1hamR8TWFrYXxNYW5hd2F8TWFzfE1hfE1lbmF3YXxNZW58TXV0dGF8TmFsaWthbmluZ3xOYWxpa2F8TmFuZ2luZ3xOw6VyfE7DpHJ8TmF0b3xOaMawbmd8TmlpbnxOanVrfE8gemFtYW58T2d8T2NofE9sZXRldGFhbnxPbmRhfE9uZHxPcmF6fFBha3xQZXJvfFBlcsOyfFBvZGFub3xQb2tpYcS+fFBva3VkfFBvdGVtfFBvdG9tfFByaXZ6ZXRvfFByeWR8cWFTREknfFF1YW5kb3xRdWFuZHxRdWFufFPDpXxTZWR8U2V8U2lpc3xTaXBvemUga2V8U2lwb3plIEtlfFNpcG96ZXxTaXzFnml8yJhpfFNvaXR8U3RlbHxUYWRhfFRhZHxUYWtyYXR8VGFrfFRhcGl8VGVyfFRldGFwaXxUaGEgdGhlfFRoYXxUaGVuIHknYWxsfFRoZW58VGjDrHxUaHVyaHxUb2RhfFRvbyByaWdodHx1Z2Vob2xsfFVuZHxVbnxWw6B8dmFqfFZlbmRhcnxWZXx3YW5ufFdhbm5lZXJ8V0VOfFdlbm58V2hlbiB5J2FsbHxXaGVufFd0ZWR5fFd1bnxZJ2tub3d8WWVhaCBuYWh8WW5hfFlvdXNlIGtub3cgbGlrZSB3aGVufFlvdXNlIGtub3cgd2hlbiB5b3VzZSBnb3R8WXxaYSBwcmVkcG9rbGFkdXxaYSBwxZllZHBva2xhZHV8WmFkYW5pfFphZGFub3xaYWRhbnxaYWRhdGV8WmFkYXRvfFpha8WCYWRhasSFY3xaYXJhZGl8WmF0YXRpfMOeYSDDvmV8w55hfMOew6F8w55lZ2FyfMOedXJofM6RzrvOu86sfM6UzrXOtM6/zrzOrc69zr/PhXzOms6xzrl8zozPhM6xzr18zqTPjM+EzrV80JAg0YLQsNC60L7QtnzQkNCz0LDRgHzQkNC70LV80JDQu9C4fNCQ0LzQvNC+fNCQfNOY0LPTmdGAfNOY0LnRgtC40Lp805jQvNC80LB80JHQuNGA0L7QunzQktCwfNCS05l80JTQsNC00LXQvdC+fNCU0LDQvdC+fNCU0L7Qv9GD0YHRgtC40Lx80JXRgdC70Lh80JfQsNC00LDRgtC1fNCX0LDQtNCw0YLQuHzQl9Cw0LTQsNGC0L580Jh80IZ80Jog0YLQvtC80YMg0LbQtXzQmtCw0LTQsHzQmtCw0LR80JrQvtCz0LDRgtC+fNCa0L7Qs9C00LB80JrQvtC70Lh80JvTmdC60LjQvXzQm9C10LrQuNC9fNCd05nRgtC40pfTmdC005l80J3QtdGF0LDQuXzQndC+fNCe0L3QtNCwfNCf0YDQuNC/0YPRgdGC0LjQvNC+LCDRidC+fNCf0YDQuNC/0YPRgdGC0LjQvNC+fNCf0YPRgdGC0Yx80KLQsNC60LbQtXzQotCwfNCi0L7Qs9C00LB80KLQvtC00ZZ80KLQvnzQo9C90LTQsHzSutOZ0Lx80K/QutGJ0L5815DXkdecfNeQ15bXmXzXkNeWfNeR15TXmdeg16rXn3zXldeS151815vXkNep16h82KLZhtqv2KfZh3zYp9iw2KfZi3zYp9qv2LF82KfZhdinfNin2YjYsXzYqNinINmB2LHYtnzYqNin2YTZgdix2LZ82KjZgdix2LZ82b7avtixfNiq2Kh82KvZhXzYrNiofNi52YbYr9mF2Kd82YHYsdi2INqp24zYp3zZhNmD2YZ82YTbjNqp2YZ82YXYqtmJfNmH2Ybar9in2YXbjHzZiHzgpIXgpJfgpLB84KSU4KSwfOCkleCkpuCkvnzgpJXgpL/gpKjgpY3gpKTgpYF84KSa4KWC4KSC4KSV4KS/fOCknOCkrHzgpKTgpKXgpL584KSk4KSm4KS+fOCkpOCkrHzgpKrgpLDgpKjgpY3gpKTgpYF84KSq4KSwfOCkr+CkpuCkv3zgqIXgqKTgqYd84Kic4Kim4KmL4KiCfOConOCov+CoteCph+CogiDgqJXgqL984Kic4KmH4KiV4KiwfOCopOCopnzgqKrgqLB84LCF4LCq4LGN4LCq4LGB4LCh4LGBfOCwiCDgsKrgsLDgsL/gsLjgsY3gsKXgsL/gsKTgsL/gsLLgsYt84LCV4LC+4LCo4LC/fOCwmuCxhuCwquCxjeCwquCwrOCwoeCwv+CwqOCwpuCwv3zgsK7gsLDgsL/gsK/gsYF84LKG4LKm4LKw4LOGfOCyqOCyguCypOCysHzgsqjgsr/gs5XgsqHgsr/gsqZ84LKu4LKk4LON4LKk4LOBfOCyuOCzjeCypeCyv+CypOCyv+Cyr+CyqOCzjeCyqOCzgXzguIHguLPguKvguJnguJTguYPguKvguYl84LiU4Lix4LiH4LiZ4Lix4LmJ4LiZfOC5geC4leC5iHzguYDguKHguLfguYjguK184LmB4Lil4LiwfOq3uOufrOuptDx86re466as6rOgPHzri6g8fOunjOyVvTx866eM7J28PHzrqLzsoIA8fOyhsOqxtDx87ZWY7KeA66eMPHzjgYvjgaQ8fOOBl+OBi+OBlzx844Gf44Gg44GXPHzjgarjgonjgbA8fOOCguOBlzx85Lim5LiUPHzkvYbjgZc8fOS9huaYrzx85YGH5aaCPHzlgYflrpo8fOWBh+iorTx85YGH6K6+PHzliY3mj5A8fOWQjOaXtjx85ZCM5pmCPHzlubbkuJQ8fOW9kzx855W2PHzogIzkuJQ8fOmCo+S5iDx86YKj6bq8PCkoPz1bIFxcdF0rKS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC8oXCIoPzpcXFxcLnxbXlwiXFxcXF0pKlwifCcoPzpcXFxcLnxbXidcXFxcXSkqJykvLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J291dGxpbmUnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC88W14+XSs/Pi8sXG5cdFx0XHRcdGFsaWFzOiAndmFyaWFibGUnXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQnb3V0bGluZSc6IHtcblx0XHRwYXR0ZXJuOiAvPFtePl0rPz4vLFxuXHRcdGFsaWFzOiAndmFyaWFibGUnXG5cdH1cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1mb3J0cmFuLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5mb3J0cmFuID0ge1xuXHQncXVvdGVkLW51bWJlcic6IHtcblx0XHRwYXR0ZXJuOiAvW0JPWl0oWydcIl0pW0EtRjAtOV0rXFwxL2ksXG5cdFx0YWxpYXM6ICdudW1iZXInXG5cdH0sXG5cdCdzdHJpbmcnOiB7XG5cdFx0cGF0dGVybjogLyg/OlxcdytfKT8oWydcIl0pKD86XFwxXFwxfCYoPzpcXHJcXG4/fFxcbikoPzpcXHMqIS4rKD86XFxyXFxuP3xcXG4pKT98KD8hXFwxKS4pKig/OlxcMXwmKS8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnY29tbWVudCc6IHtcblx0XHRcdFx0cGF0dGVybjogLygmKD86XFxyXFxuP3xcXG4pXFxzKikhLiovLFxuXHRcdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQnY29tbWVudCc6IC8hLiovLFxuXHQnYm9vbGVhbic6IC9cXC4oPzpUUlVFfEZBTFNFKVxcLig/Ol9cXHcrKT8vaSxcblx0J251bWJlcic6IC8oPzpcXGJ8WystXSkoPzpcXGQrKD86XFwuXFxkKik/fFxcLlxcZCspKD86W0VEXVsrLV0/XFxkKyk/KD86X1xcdyspPy9pLFxuXHQna2V5d29yZCc6IFtcblx0XHQvLyBUeXBlc1xuXHRcdC9cXGIoPzpJTlRFR0VSfFJFQUx8RE9VQkxFID9QUkVDSVNJT058Q09NUExFWHxDSEFSQUNURVJ8TE9HSUNBTClcXGIvaSxcblx0XHQvLyBFTkQgc3RhdGVtZW50c1xuXHRcdC9cXGIoPzpFTkQgPyk/KD86QkxPQ0sgP0RBVEF8RE98RklMRXxGT1JBTEx8RlVOQ1RJT058SUZ8SU5URVJGQUNFfE1PRFVMRSg/ISBQUk9DRURVUkUpfFBST0dSQU18U0VMRUNUfFNVQlJPVVRJTkV8VFlQRXxXSEVSRSlcXGIvaSxcblx0XHQvLyBTdGF0ZW1lbnRzXG5cdFx0L1xcYig/OkFMTE9DQVRBQkxFfEFMTE9DQVRFfEJBQ0tTUEFDRXxDQUxMfENBU0V8Q0xPU0V8Q09NTU9OfENPTlRBSU5TfENPTlRJTlVFfENZQ0xFfERBVEF8REVBTExPQ0FURXxESU1FTlNJT058RE98RU5EfEVRVUlWQUxFTkNFfEVYSVR8RVhURVJOQUx8Rk9STUFUfEdPID9UT3xJTVBMSUNJVCg/OiBOT05FKT98SU5RVUlSRXxJTlRFTlR8SU5UUklOU0lDfE1PRFVMRSBQUk9DRURVUkV8TkFNRUxJU1R8TlVMTElGWXxPUEVOfE9QVElPTkFMfFBBUkFNRVRFUnxQT0lOVEVSfFBSSU5UfFBSSVZBVEV8UFVCTElDfFJFQUR8UkVUVVJOfFJFV0lORHxTQVZFfFNFTEVDVHxTVE9QfFRBUkdFVHxXSElMRXxXUklURSlcXGIvaSxcblx0XHQvLyBPdGhlcnNcblx0XHQvXFxiKD86QVNTSUdOTUVOVHxERUZBVUxUfEVMRU1FTlRBTHxFTFNFfEVMU0VXSEVSRXxFTFNFSUZ8RU5UUll8SU58SU5DTFVERXxJTk9VVHxLSU5EfE5VTEx8T05MWXxPUEVSQVRPUnxPVVR8UFVSRXxSRUNVUlNJVkV8UkVTVUxUfFNFUVVFTkNFfFNUQVR8VEhFTnxVU0UpXFxiL2lcblx0XSxcblx0J29wZXJhdG9yJzogW1xuXHRcdC9cXCpcXCp8XFwvXFwvfD0+fFs9XFwvXT18Wzw+XT0/fDo6fFsrXFwtKj0lXXxcXC4oPzpFUXxORXxMVHxMRXxHVHxHRXxOT1R8QU5EfE9SfEVRVnxORVFWKVxcLnxcXC5bQS1aXStcXC4vaSxcblx0XHR7XG5cdFx0XHQvLyBVc2UgbG9va2JlaGluZCB0byBwcmV2ZW50IGNvbmZ1c2lvbiB3aXRoICgvIC8pXG5cdFx0XHRwYXR0ZXJuOiAvKF58KD8hXFwoKS4pXFwvKD8hXFwpKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQncHVuY3R1YXRpb24nOiAvXFwoXFwvfFxcL1xcKXxbKCksOzomXS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tZnNoYXJwLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5mc2hhcnAgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjbGlrZScsIHtcblx0J2NvbW1lbnQnOiBbXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteXFxcXF0pXFwoXFwqW1xcd1xcV10qP1xcKlxcKS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcOl0pXFwvXFwvLiovLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0XSxcblx0J2tleXdvcmQnOiAvXFxiKD86bGV0fHJldHVybnx1c2V8eWllbGQpKD86IVxcQnxcXGIpfFxcYihhYnN0cmFjdHxhbmR8YXN8YXNzZXJ0fGJhc2V8YmVnaW58Y2xhc3N8ZGVmYXVsdHxkZWxlZ2F0ZXxkb3xkb25lfGRvd25jYXN0fGRvd250b3xlbGlmfGVsc2V8ZW5kfGV4Y2VwdGlvbnxleHRlcm58ZmFsc2V8ZmluYWxseXxmb3J8ZnVufGZ1bmN0aW9ufGdsb2JhbHxpZnxpbnxpbmhlcml0fGlubGluZXxpbnRlcmZhY2V8aW50ZXJuYWx8bGF6eXxtYXRjaHxtZW1iZXJ8bW9kdWxlfG11dGFibGV8bmFtZXNwYWNlfG5ld3xub3R8bnVsbHxvZnxvcGVufG9yfG92ZXJyaWRlfHByaXZhdGV8cHVibGljfHJlY3xzZWxlY3R8c3RhdGljfHN0cnVjdHx0aGVufHRvfHRydWV8dHJ5fHR5cGV8dXBjYXN0fHZhbHx2b2lkfHdoZW58d2hpbGV8d2l0aHxhc3J8bGFuZHxsb3J8bHNsfGxzcnxseG9yfG1vZHxzaWd8YXRvbWljfGJyZWFrfGNoZWNrZWR8Y29tcG9uZW50fGNvbnN0fGNvbnN0cmFpbnR8Y29uc3RydWN0b3J8Y29udGludWV8ZWFnZXJ8ZXZlbnR8ZXh0ZXJuYWx8Zml4ZWR8ZnVuY3RvcnxpbmNsdWRlfG1ldGhvZHxtaXhpbnxvYmplY3R8cGFyYWxsZWx8cHJvY2Vzc3xwcm90ZWN0ZWR8cHVyZXxzZWFsZWR8dGFpbGNhbGx8dHJhaXR8dmlydHVhbHx2b2xhdGlsZSlcXGIvLFxuXHQnc3RyaW5nJzogLyg/OlwiXCJcIltcXHNcXFNdKj9cIlwiXCJ8QFwiKD86XCJcInxbXlwiXSkqXCJ8KFwifCcpKD86XFxcXFxcMXxcXFxcPyg/IVxcMSlbXFxzXFxTXSkqXFwxKUI/Lyxcblx0J251bWJlcic6IFtcblx0XHQvXFxiLT8weFtcXGRhLWZBLUZdKyh1bnxsZnxMRik/XFxiLyxcblx0XHQvXFxiLT8wYlswMV0rKHl8dXkpP1xcYi8sXG5cdFx0L1xcYi0/KFxcZCpcXC4/XFxkK3xcXGQrXFwuKShbZkZtTV18W2VFXVsrLV0/XFxkKyk/XFxiLyxcblx0XHQvXFxiLT9cXGQrKHl8dXl8c3x1c3xsfHV8dWx8THxVTHxJKT9cXGIvXG5cdF1cbn0pO1xuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnZnNoYXJwJywgJ2tleXdvcmQnLCB7XG5cdCdwcmVwcm9jZXNzb3InOiAvXlteXFxyXFxuXFxTXSojLiovbVxufSk7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tZXJsYW5nLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5lcmxhbmcgPSB7XG5cdCdjb21tZW50JzogLyUuKy8sXG5cdCdzdHJpbmcnOiAvXCIoPzpcXFxcPy4pKj9cIi8sXG5cdCdxdW90ZWQtZnVuY3Rpb24nOiB7XG5cdFx0cGF0dGVybjogLycoPzpcXFxcLnxbXidcXFxcXSkrJyg/PVxcKCkvLFxuXHRcdGFsaWFzOiAnZnVuY3Rpb24nXG5cdH0sXG5cdCdxdW90ZWQtYXRvbSc6IHtcblx0XHRwYXR0ZXJuOiAvJyg/OlxcXFwufFteJ1xcXFxdKSsnLyxcblx0XHRhbGlhczogJ2F0b20nXG5cdH0sXG5cdCdib29sZWFuJzogL1xcYig/OnRydWV8ZmFsc2UpXFxiLyxcblx0J2tleXdvcmQnOiAvXFxiKD86ZnVufHdoZW58Y2FzZXxvZnxlbmR8aWZ8cmVjZWl2ZXxhZnRlcnx0cnl8Y2F0Y2gpXFxiLyxcblx0J251bWJlcic6IFtcblx0XHQvXFwkXFxcXD8uLyxcblx0XHQvXFxkKyNbYS16MC05XSsvaSxcblx0XHQvKD86XFxifC0pXFxkKlxcLj9cXGQrKFtFZV1bKy1dP1xcZCspP1xcYi9cblx0XSxcblx0J2Z1bmN0aW9uJzogL1xcYlthLXpdW1xcd0BdKig/PVxcKCkvLFxuXHQndmFyaWFibGUnOiB7XG5cdFx0Ly8gTG9vay1iZWhpbmQgaXMgdXNlZCB0byBwcmV2ZW50IHdyb25nIGhpZ2hsaWdodGluZyBvZiBhdG9tcyBjb250YWluaW5nIFwiQFwiXG5cdFx0cGF0dGVybjogLyhefFteQF0pKD86XFxifFxcPylbQS1aX11bXFx3QF0qLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdvcGVyYXRvcic6IFtcblx0XHQvWz1cXC88PjpdPXw9WzpcXC9dPXxcXCtcXCs/fC0tP3xbPSpcXC8hXXxcXGIoPzpibm90fGRpdnxyZW18YmFuZHxib3J8Ynhvcnxic2x8YnNyfG5vdHxhbmR8b3J8eG9yfG9yZWxzZXxhbmRhbHNvKVxcYi8sXG5cdFx0e1xuXHRcdFx0Ly8gV2UgZG9uJ3Qgd2FudCB0byBtYXRjaCA8PFxuXHRcdFx0cGF0dGVybjogLyhefFtePF0pPCg/ITwpLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdHtcblx0XHRcdC8vIFdlIGRvbid0IHdhbnQgdG8gbWF0Y2ggPj5cblx0XHRcdHBhdHRlcm46IC8oXnxbXj5dKT4oPyE+KS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQnYXRvbSc6IC9cXGJbYS16XVtcXHdAXSovLFxuXHQncHVuY3R1YXRpb24nOiAvWygpW1xcXXt9OjssLiN8XXw8PHw+Pi9cblxufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1lbGl4aXIuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmVsaXhpciA9IHtcblx0Ly8gTmVnYXRpdmUgbG9vay1haGVhZCBpcyBuZWVkZWQgZm9yIHN0cmluZyBpbnRlcnBvbGF0aW9uXG5cdCdjb21tZW50JzogLyMoPyFcXHspLiovLFxuXHQvLyB+clwiXCJcImZvb1wiXCJcIiwgfnInJydmb28nJycsIH5yL2Zvby8sIH5yfGZvb3wsIH5yXCJmb29cIiwgfnInZm9vJywgfnIoZm9vKSwgfnJbZm9vXSwgfnJ7Zm9vfSwgfnI8Zm9vPlxuXHQncmVnZXgnOiAvfltyUl0oPzooXCJcIlwifCcnJ3xbXFwvfFwiJ10pKD86XFxcXC58KD8hXFwxKVteXFxcXF0pK1xcMXxcXCgoPzpcXFxcXFwpfFteKV0pK1xcKXxcXFsoPzpcXFxcXFxdfFteXFxdXSkrXFxdfFxceyg/OlxcXFxcXH18W159XSkrXFx9fDwoPzpcXFxcPnxbXj5dKSs+KVt1aXNteGZyXSovLFxuXHQnc3RyaW5nJzogW1xuXHRcdHtcblx0XHRcdC8vIH5zXCJcIlwiZm9vXCJcIlwiLCB+cycnJ2ZvbycnJywgfnMvZm9vLywgfnN8Zm9vfCwgfnNcImZvb1wiLCB+cydmb28nLCB+cyhmb28pLCB+c1tmb29dLCB+c3tmb299LCB+czxmb28+XG5cdFx0XHRwYXR0ZXJuOiAvfltjQ3NTd1ddKD86KFwiXCJcInwnJyd8W1xcL3xcIiddKSg/OlxcXFwufCg/IVxcMSlbXlxcXFxdKStcXDF8XFwoKD86XFxcXFxcKXxbXildKStcXCl8XFxbKD86XFxcXFxcXXxbXlxcXV0pK1xcXXxcXHsoPzpcXFxcXFx9fCNcXHtbXn1dK1xcfXxbXn1dKStcXH18PCg/OlxcXFw+fFtePl0pKz4pW2NzYV0/Lyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQvLyBTZWUgaW50ZXJwb2xhdGlvbiBiZWxvd1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhcIlwiXCJ8JycnKVtcXHNcXFNdKj9cXDEvLFxuXHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdC8vIFNlZSBpbnRlcnBvbGF0aW9uIGJlbG93XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHQvLyBNdWx0aS1saW5lIHN0cmluZ3MgYXJlIGFsbG93ZWRcblx0XHRcdHBhdHRlcm46IC8oXCJ8JykoPzpcXFxcW1xcc1xcU118KD8hXFwxKVteXFxcXF0pKlxcMS8sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0Ly8gU2VlIGludGVycG9sYXRpb24gYmVsb3dcblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdCdhdG9tJzoge1xuXHRcdC8vIExvb2stYmVoaW5kIHByZXZlbnRzIGJhZCBoaWdobGlnaHRpbmcgb2YgdGhlIDo6IG9wZXJhdG9yXG5cdFx0cGF0dGVybjogLyhefFteOl0pOlxcdysvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICdzeW1ib2wnXG5cdH0sXG5cdC8vIExvb2stYWhlYWQgcHJldmVudHMgYmFkIGhpZ2hsaWdodGluZyBvZiB0aGUgOjogb3BlcmF0b3Jcblx0J2F0dHItbmFtZSc6IC9cXHcrOig/ITopLyxcblx0J2NhcHR1cmUnOiB7XG5cdFx0Ly8gTG9vay1iZWhpbmQgcHJldmVudHMgYmFkIGhpZ2hsaWdodGluZyBvZiB0aGUgJiYgb3BlcmF0b3Jcblx0XHRwYXR0ZXJuOiAvKF58W14mXSkmKD86W14mXFxzXFxkKCldW15cXHMoKV0qfCg/PVxcKCkpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAnZnVuY3Rpb24nXG5cdH0sXG5cdCdhcmd1bWVudCc6IHtcblx0XHQvLyBMb29rLWJlaGluZCBwcmV2ZW50cyBiYWQgaGlnaGxpZ2h0aW5nIG9mIHRoZSAmJiBvcGVyYXRvclxuXHRcdHBhdHRlcm46IC8oXnxbXiZdKSZcXGQrLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAndmFyaWFibGUnXG5cdH0sXG5cdCdhdHRyaWJ1dGUnOiB7XG5cdFx0cGF0dGVybjogL0BbXFxTXSsvLFxuXHRcdGFsaWFzOiAndmFyaWFibGUnXG5cdH0sXG5cdCdudW1iZXInOiAvXFxiKD86MFtib3hdW2EtZlxcZF9dK3xcXGRbXFxkX10qKSg/OlxcLltcXGRfXSspPyg/OmVbKy1dP1tcXGRfXSspP1xcYi9pLFxuXHQna2V5d29yZCc6IC9cXGIoPzphZnRlcnxhbGlhc3xhbmR8Y2FzZXxjYXRjaHxjb25kfGRlZig/OmNhbGxiYWNrfGV4Y2VwdGlvbnxpbXBsfG1vZHVsZXxwfHByb3RvY29sfHN0cnVjdCk/fGRvfGVsc2V8ZW5kfGZufGZvcnxpZnxpbXBvcnR8bm90fG9yfHJlcXVpcmV8cmVzY3VlfHRyeXx1bmxlc3N8dXNlfHdoZW4pXFxiLyxcblx0J2Jvb2xlYW4nOiAvXFxiKD86dHJ1ZXxmYWxzZXxuaWwpXFxiLyxcblx0J29wZXJhdG9yJzogW1xuXHRcdC9cXGJpblxcYnwmJj98XFx8W3w+XT98XFxcXFxcXFx8Ojp8XFwuXFwuXFwuP3xcXCtcXCs/fC1bLT5dP3w8Wy09Pl18Pj18IT09P3xcXEIhfD0oPzo9PT98Wz5+XSk/fFsqXFwvXl0vLFxuXHRcdHtcblx0XHRcdC8vIFdlIGRvbid0IHdhbnQgdG8gbWF0Y2ggPDxcblx0XHRcdHBhdHRlcm46IC8oW148XSk8KD8hPCkvLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0Ly8gV2UgZG9uJ3Qgd2FudCB0byBtYXRjaCA+PlxuXHRcdFx0cGF0dGVybjogLyhbXj5dKT4oPyE+KS8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQncHVuY3R1YXRpb24nOiAvPDx8Pj58Wy4sJVxcW1xcXXt9KCldL1xufTtcblxuUHJpc20ubGFuZ3VhZ2VzLmVsaXhpci5zdHJpbmcuZm9yRWFjaChmdW5jdGlvbihvKSB7XG5cdG8uaW5zaWRlID0ge1xuXHRcdCdpbnRlcnBvbGF0aW9uJzoge1xuXHRcdFx0cGF0dGVybjogLyNcXHtbXn1dK1xcfS8sXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2RlbGltaXRlcic6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXiNcXHt8XFx9JC8sXG5cdFx0XHRcdFx0YWxpYXM6ICdwdW5jdHVhdGlvbidcblx0XHRcdFx0fSxcblx0XHRcdFx0cmVzdDogUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMuZWxpeGlyKVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0pO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWVpZmZlbC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuZWlmZmVsID0ge1xuXHQnc3RyaW5nJzogW1xuXHRcdC8vIEFsaWduZWQtdmVyYmF0aW0tc3RyaW5nc1xuXHRcdC9cIihbXltdKilcXFtbXFxzXFxTXSs/XFxdXFwxXCIvLFxuXHRcdC8vIE5vbi1hbGlnbmVkLXZlcmJhdGltLXN0cmluZ3Ncblx0XHQvXCIoW157XSopXFx7W1xcc1xcU10rP1xcfVxcMVwiLyxcblx0XHQvLyBTaW5nbGUtbGluZSBzdHJpbmdcblx0XHQvXCIoPzolXFxzKyV8JVwifC4pKj9cIi9cblx0XSxcblx0Ly8gKGNvbW1lbnRzIGluY2x1ZGluZyBxdW90ZWQgc3RyaW5ncyBub3Qgc3VwcG9ydGVkKVxuXHQnY29tbWVudCc6IC8tLS4qLyxcblx0Ly8gbm9ybWFsIGNoYXIgfCBzcGVjaWFsIGNoYXIgfCBjaGFyIGNvZGVcblx0J2NoYXInOiAvJyg/OiUnfC4pKz8nLyxcblx0J2tleXdvcmQnOiAvXFxiKD86YWNyb3NzfGFnZW50fGFsaWFzfGFsbHxhbmR8YXR0YWNoZWR8YXN8YXNzaWdufGF0dHJpYnV0ZXxjaGVja3xjbGFzc3xjb252ZXJ0fGNyZWF0ZXxDdXJyZW50fGRlYnVnfGRlZmVycmVkfGRldGFjaGFibGV8ZG98ZWxzZXxlbHNlaWZ8ZW5kfGVuc3VyZXxleHBhbmRlZHxleHBvcnR8ZXh0ZXJuYWx8ZmVhdHVyZXxmcm9tfGZyb3plbnxpZnxpbXBsaWVzfGluaGVyaXR8aW5zcGVjdHxpbnZhcmlhbnR8bGlrZXxsb2NhbHxsb29wfG5vdHxub3RlfG9ic29sZXRlfG9sZHxvbmNlfG9yfFByZWN1cnNvcnxyZWRlZmluZXxyZW5hbWV8cmVxdWlyZXxyZXNjdWV8UmVzdWx0fHJldHJ5fHNlbGVjdHxzZXBhcmF0ZXxzb21lfHRoZW58dW5kZWZpbmV8dW50aWx8dmFyaWFudHxWb2lkfHdoZW58eG9yKVxcYi9pLFxuXHQnYm9vbGVhbic6IC9cXGIoPzpUcnVlfEZhbHNlKVxcYi9pLFxuXHQnbnVtYmVyJzogW1xuXHRcdC8vIGhleGEgfCBvY3RhbCB8IGJpblxuXHRcdC9cXGIwW3hjYl1bXFxkYS1mXSg/Ol8qW1xcZGEtZl0pKlxcYi9pLFxuXHRcdC8vIERlY2ltYWxcblx0XHQvKD86XFxkKD86XypcXGQpKik/XFwuKD86KD86XFxkKD86XypcXGQpKik/W2VFXVsrLV0/KT9cXGQoPzpfKlxcZCkqfFxcZCg/Ol8qXFxkKSpcXC4/L1xuXHRdLFxuXHQncHVuY3R1YXRpb24nOiAvOj18PDx8Pj58XFwoXFx8fFxcfFxcKXwtPnxcXC4oPz1cXHcpfFt7fVtcXF07KCksOj9dLyxcblx0J29wZXJhdG9yJzogL1xcXFxcXFxcfFxcfFxcLlxcLlxcfHxcXC5cXC58XFwvW35cXC89XT98Wz48XT0/fFstKypePX5dL1xufTtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWRvY2tlci5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuZG9ja2VyID0ge1xuXHQna2V5d29yZCc6IHtcblx0XHRwYXR0ZXJuOiAvKF5cXHMqKSg/Ok9OQlVJTER8RlJPTXxNQUlOVEFJTkVSfFJVTnxFWFBPU0V8RU5WfEFERHxDT1BZfFZPTFVNRXxVU0VSfFdPUktESVJ8Q01EfExBQkVMfEVOVFJZUE9JTlQpKD89XFxzKS9taSxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdzdHJpbmcnOiAvKFwifCcpKD86KD8hXFwxKVteXFxcXFxcclxcbl18XFxcXCg/OlxcclxcbnxbXFxzXFxTXSkpKj9cXDEvLFxuXHQnY29tbWVudCc6IC8jLiovLFxuXHQncHVuY3R1YXRpb24nOiAvLS0tfFxcLlxcLlxcLnxbOltcXF17fVxcLSx8Pj9dL1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1kaWZmLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5kaWZmID0ge1xuXHQnY29vcmQnOiBbXG5cdFx0Ly8gTWF0Y2ggYWxsIGtpbmRzIG9mIGNvb3JkIGxpbmVzIChwcmVmaXhlZCBieSBcIisrK1wiLCBcIi0tLVwiIG9yIFwiKioqXCIpLlxuXHRcdC9eKD86XFwqezN9fC17M318XFwrezN9KS4qJC9tLFxuXHRcdC8vIE1hdGNoIFwiQEAgLi4uIEBAXCIgY29vcmQgbGluZXMgaW4gdW5pZmllZCBkaWZmLlxuXHRcdC9eQEAuKkBAJC9tLFxuXHRcdC8vIE1hdGNoIGNvb3JkIGxpbmVzIGluIG5vcm1hbCBkaWZmIChzdGFydHMgd2l0aCBhIG51bWJlcikuXG5cdFx0L15cXGQrLiokL21cblx0XSxcblxuXHQvLyBNYXRjaCBpbnNlcnRlZCBhbmQgZGVsZXRlZCBsaW5lcy4gU3VwcG9ydCBib3RoICsvLSBhbmQgPi88IHN0eWxlcy5cblx0J2RlbGV0ZWQnOiAvXlstPF0uKyQvbSxcblx0J2luc2VydGVkJzogL15bKz5dLiskL20sXG5cblx0Ly8gTWF0Y2ggXCJkaWZmZXJlbnRcIiBsaW5lcyAocHJlZml4ZWQgd2l0aCBcIiFcIikgaW4gY29udGV4dCBkaWZmLlxuXHQnZGlmZic6IHtcblx0XHQncGF0dGVybic6IC9eISg/ISEpLiskL20sXG5cdFx0J2FsaWFzJzogJ2ltcG9ydGFudCdcblx0fVxufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1kYXJ0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5kYXJ0ID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdzdHJpbmcnOiBbXG5cdFx0L3I/KFwiXCJcInwnJycpW1xcc1xcU10qP1xcMS8sXG5cdFx0L3I/KFwifCcpKFxcXFw/LikqP1xcMS9cblx0XSxcblx0J2tleXdvcmQnOiBbXG5cdFx0L1xcYig/OmFzeW5jfHN5bmN8eWllbGQpXFwqLyxcblx0XHQvXFxiKD86YWJzdHJhY3R8YXNzZXJ0fGFzeW5jfGF3YWl0fGJyZWFrfGNhc2V8Y2F0Y2h8Y2xhc3N8Y29uc3R8Y29udGludWV8ZGVmYXVsdHxkZWZlcnJlZHxkb3xkeW5hbWljfGVsc2V8ZW51bXxleHBvcnR8ZXh0ZXJuYWx8ZXh0ZW5kc3xmYWN0b3J5fGZpbmFsfGZpbmFsbHl8Zm9yfGdldHxpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnxsaWJyYXJ5fG5ld3xudWxsfG9wZXJhdG9yfHBhcnR8cmV0aHJvd3xyZXR1cm58c2V0fHN0YXRpY3xzdXBlcnxzd2l0Y2h8dGhpc3x0aHJvd3x0cnl8dHlwZWRlZnx2YXJ8dm9pZHx3aGlsZXx3aXRofHlpZWxkKVxcYi9cblx0XSxcblx0J29wZXJhdG9yJzogL1xcYmlzIXxcXGIoPzphc3xpcylcXGJ8XFwrXFwrfC0tfCYmfFxcfFxcfHw8PD0/fD4+PT98fig/OlxcLz0/KT98WytcXC0qXFwvJSZefD0hPD5dPT98XFw/L1xufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2RhcnQnLCdmdW5jdGlvbicse1xuXHQnbWV0YWRhdGEnOiB7XG5cdFx0cGF0dGVybjogL0BcXHcrLyxcblx0XHRhbGlhczogJ3N5bWJvbCdcblx0fVxufSk7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tZC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuZCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQnc3RyaW5nJzogW1xuXHRcdC8vIHJcIlwiLCB4XCJcIlxuXHRcdC9cXGJbcnhdXCIoXFxcXC58W15cXFxcXCJdKSpcIltjd2RdPy8sXG5cdFx0Ly8gcVwiW11cIiwgcVwiKClcIiwgcVwiPD5cIiwgcVwie31cIlxuXHRcdC9cXGJxXCIoPzpcXFtbXFxzXFxTXSo/XFxdfFxcKFtcXHNcXFNdKj9cXCl8PFtcXHNcXFNdKj8+fFxce1tcXHNcXFNdKj9cXH0pXCIvLFxuXHRcdC8vIHFcIklERU5UXG5cdFx0Ly8gLi4uXG5cdFx0Ly8gSURFTlRcIlxuXHRcdC9cXGJxXCIoW19hLXpBLVpdW19hLXpBLVpcXGRdKikoPzpcXHI/XFxufFxccilbXFxzXFxTXSo/KD86XFxyP1xcbnxcXHIpXFwxXCIvLFxuXHRcdC8vIHFcIi8vXCIsIHFcInx8XCIsIGV0Yy5cblx0XHQvXFxicVwiKC4pW1xcc1xcU10qP1xcMVwiLyxcblx0XHQvLyBDaGFyYWN0ZXJzXG5cdFx0LycoPzpcXFxcJ3xcXFxcP1teJ10rKScvLFxuXG5cdFx0LyhbXCJgXSkoXFxcXC58KD8hXFwxKVteXFxcXF0pKlxcMVtjd2RdPy9cblx0XSxcblxuXHQnbnVtYmVyJzogW1xuXHRcdC8vIFRoZSBsb29rYmVoaW5kIGFuZCB0aGUgbmVnYXRpdmUgbG9vay1haGVhZCB0cnkgdG8gcHJldmVudCBiYWQgaGlnaGxpZ2h0aW5nIG9mIHRoZSAuLiBvcGVyYXRvclxuXHRcdC8vIEhleGFkZWNpbWFsIG51bWJlcnMgbXVzdCBiZSBoYW5kbGVkIHNlcGFyYXRlbHkgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBleHBvbmVudCBcImVcIlxuXHRcdC9cXGIweFxcLj9bYS1mXFxkX10rKD86KD8hXFwuXFwuKVxcLlthLWZcXGRfXSopPyg/OnBbKy1dP1thLWZcXGRfXSspP1t1bGZpXSovaSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKCg/OlxcLlxcLik/KSg/OlxcYjBiXFwuP3xcXGJ8XFwuKVxcZFtcXGRfXSooPzooPyFcXC5cXC4pXFwuW1xcZF9dKik/KD86ZVsrLV0/XFxkW1xcZF9dKik/W3VsZmldKi9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH1cblx0XSxcblxuXHQvLyBJbiBvcmRlcjogJCwga2V5d29yZHMgYW5kIHNwZWNpYWwgdG9rZW5zLCBnbG9iYWxseSBkZWZpbmVkIHN5bWJvbHNcblx0J2tleXdvcmQnOiAvXFwkfFxcYig/OmFic3RyYWN0fGFsaWFzfGFsaWdufGFzbXxhc3NlcnR8YXV0b3xib2R5fGJvb2x8YnJlYWt8Ynl0ZXxjYXNlfGNhc3R8Y2F0Y2h8Y2RvdWJsZXxjZW50fGNmbG9hdHxjaGFyfGNsYXNzfGNvbnN0fGNvbnRpbnVlfGNyZWFsfGRjaGFyfGRlYnVnfGRlZmF1bHR8ZGVsZWdhdGV8ZGVsZXRlfGRlcHJlY2F0ZWR8ZG98ZG91YmxlfGVsc2V8ZW51bXxleHBvcnR8ZXh0ZXJufGZhbHNlfGZpbmFsfGZpbmFsbHl8ZmxvYXR8Zm9yfGZvcmVhY2h8Zm9yZWFjaF9yZXZlcnNlfGZ1bmN0aW9ufGdvdG98aWRvdWJsZXxpZnxpZmxvYXR8aW1tdXRhYmxlfGltcG9ydHxpbm91dHxpbnR8aW50ZXJmYWNlfGludmFyaWFudHxpcmVhbHxsYXp5fGxvbmd8bWFjcm98bWl4aW58bW9kdWxlfG5ld3xub3Rocm93fG51bGx8b3V0fG92ZXJyaWRlfHBhY2thZ2V8cHJhZ21hfHByaXZhdGV8cHJvdGVjdGVkfHB1YmxpY3xwdXJlfHJlYWx8cmVmfHJldHVybnxzY29wZXxzaGFyZWR8c2hvcnR8c3RhdGljfHN0cnVjdHxzdXBlcnxzd2l0Y2h8c3luY2hyb25pemVkfHRlbXBsYXRlfHRoaXN8dGhyb3d8dHJ1ZXx0cnl8dHlwZWRlZnx0eXBlaWR8dHlwZW9mfHVieXRlfHVjZW50fHVpbnR8dWxvbmd8dW5pb258dW5pdHRlc3R8dXNob3J0fHZlcnNpb258dm9pZHx2b2xhdGlsZXx3Y2hhcnx3aGlsZXx3aXRofF9fKD86KD86RklMRXxNT0RVTEV8TElORXxGVU5DVElPTnxQUkVUVFlfRlVOQ1RJT058REFURXxFT0Z8VElNRXxUSU1FU1RBTVB8VkVORE9SfFZFUlNJT04pX198Z3NoYXJlZHx0cmFpdHN8dmVjdG9yfHBhcmFtZXRlcnMpfHN0cmluZ3x3c3RyaW5nfGRzdHJpbmd8c2l6ZV90fHB0cmRpZmZfdClcXGIvLFxuXHQnb3BlcmF0b3InOiAvXFx8W3w9XT98JlsmPV0/fFxcK1srPV0/fC1bLT1dP3xcXC4/XFwuXFwufD1bPj1dP3whKD86aVtuc11cXGJ8PD4/PT98Pj0/fD0pP3xcXGJpW25zXVxcYnwoPzo8Wzw+XT98Pj4/Pj98XFxeXFxefFsqXFwvJV5+XSk9Py9cbn0pO1xuXG5cblByaXNtLmxhbmd1YWdlcy5kLmNvbW1lbnQgPSBbXG5cdC8vIFNoZWJhbmdcblx0L15cXHMqIyEuKy8sXG5cdC8vIC8rICsvXG5cdHtcblx0XHQvLyBBbGxvdyBvbmUgbGV2ZWwgb2YgbmVzdGluZ1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKVxcL1xcKyg/OlxcL1xcK1tcXHdcXFddKj9cXCtcXC98W1xcd1xcV10pKj9cXCtcXC8vLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxuXS5jb25jYXQoUHJpc20ubGFuZ3VhZ2VzLmQuY29tbWVudCk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2QnLCAnY29tbWVudCcsIHtcblx0J3Rva2VuLXN0cmluZyc6IHtcblx0XHQvLyBBbGxvdyBvbmUgbGV2ZWwgb2YgbmVzdGluZ1xuXHRcdHBhdHRlcm46IC9cXGJxXFx7KD86fFxce1tefV0qXFx9fFtefV0pKlxcfS8sXG5cdFx0YWxpYXM6ICdzdHJpbmcnXG5cdH1cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdkJywgJ2tleXdvcmQnLCB7XG5cdCdwcm9wZXJ0eSc6IC9cXEJAXFx3Ki9cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdkJywgJ2Z1bmN0aW9uJywge1xuXHQncmVnaXN0ZXInOiB7XG5cdFx0Ly8gSWFzbSByZWdpc3RlcnNcblx0XHRwYXR0ZXJuOiAvXFxiKD86W0FCQ0RdW0xIWF18RVtBQkNEXVh8RT8oPzpCUHxTUHxESXxTSSl8W0VDU0RHRl1TfENSWzAyMzRdfERSWzAxMjM2N118VFJbMy03XXxYP01NWzAtN118UltBQkNEXVh8W0JTXVBMfFJbQlNdUHxbRFNdSUx8UltEU11JfFIoPzpbODldfDFbMC01XSlbQldEXT98WE1NKD86Wzg5XXwxWzAtNV0pfFlNTSg/OjFbMC01XXxcXGQpKVxcYnxcXGJTVCg/OlxcKFswLTddXFwpfFxcYikvLFxuXHRcdGFsaWFzOiAndmFyaWFibGUnXG5cdH1cbn0pO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWNzcy1leHRyYXMuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmNzcy5zZWxlY3RvciA9IHtcblx0cGF0dGVybjogL1teXFx7XFx9XFxzXVteXFx7XFx9XSooPz1cXHMqXFx7KS8sXG5cdGluc2lkZToge1xuXHRcdCdwc2V1ZG8tZWxlbWVudCc6IC86KD86YWZ0ZXJ8YmVmb3JlfGZpcnN0LWxldHRlcnxmaXJzdC1saW5lfHNlbGVjdGlvbil8OjpbLVxcd10rLyxcblx0XHQncHNldWRvLWNsYXNzJzogLzpbLVxcd10rKD86XFwoLipcXCkpPy8sXG5cdFx0J2NsYXNzJzogL1xcLlstOlxcLlxcd10rLyxcblx0XHQnaWQnOiAvI1stOlxcLlxcd10rL1xuXHR9XG59O1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdjc3MnLCAnZnVuY3Rpb24nLCB7XG5cdCdoZXhjb2RlJzogLyNbXFxkYS1mXXszLDZ9L2ksXG5cdCdlbnRpdHknOiAvXFxcXFtcXGRhLWZdezEsOH0vaSxcblx0J251bWJlcic6IC9bXFxkJVxcLl0rL1xufSk7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY29mZmVlc2NyaXB0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbihmdW5jdGlvbihQcmlzbSkge1xuXG4vLyBJZ25vcmUgY29tbWVudHMgc3RhcnRpbmcgd2l0aCB7IHRvIHByaXZpbGVnZSBzdHJpbmcgaW50ZXJwb2xhdGlvbiBoaWdobGlnaHRpbmdcbnZhciBjb21tZW50ID0gLyMoPyFcXHspLisvLFxuICAgIGludGVycG9sYXRpb24gPSB7XG4gICAgXHRwYXR0ZXJuOiAvI1xce1tefV0rXFx9LyxcbiAgICBcdGFsaWFzOiAndmFyaWFibGUnXG4gICAgfTtcblxuUHJpc20ubGFuZ3VhZ2VzLmNvZmZlZXNjcmlwdCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2phdmFzY3JpcHQnLCB7XG5cdCdjb21tZW50JzogY29tbWVudCxcblx0J3N0cmluZyc6IFtcblxuXHRcdC8vIFN0cmluZ3MgYXJlIG11bHRpbGluZVxuXHRcdC8nKD86XFxcXD9bXlxcXFxdKSo/Jy8sXG5cblx0XHR7XG5cdFx0XHQvLyBTdHJpbmdzIGFyZSBtdWx0aWxpbmVcblx0XHRcdHBhdHRlcm46IC9cIig/OlxcXFw/W15cXFxcXSkqP1wiLyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnaW50ZXJwb2xhdGlvbic6IGludGVycG9sYXRpb25cblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdCdrZXl3b3JkJzogL1xcYihhbmR8YnJlYWt8Ynl8Y2F0Y2h8Y2xhc3N8Y29udGludWV8ZGVidWdnZXJ8ZGVsZXRlfGRvfGVhY2h8ZWxzZXxleHRlbmR8ZXh0ZW5kc3xmYWxzZXxmaW5hbGx5fGZvcnxpZnxpbnxpbnN0YW5jZW9mfGlzfGlzbnR8bGV0fGxvb3B8bmFtZXNwYWNlfG5ld3xub3xub3R8bnVsbHxvZnxvZmZ8b258b3J8b3dufHJldHVybnxzdXBlcnxzd2l0Y2h8dGhlbnx0aGlzfHRocm93fHRydWV8dHJ5fHR5cGVvZnx1bmRlZmluZWR8dW5sZXNzfHVudGlsfHdoZW58d2hpbGV8d2luZG93fHdpdGh8eWVzfHlpZWxkKVxcYi8sXG5cdCdjbGFzcy1tZW1iZXInOiB7XG5cdFx0cGF0dGVybjogL0AoPyFcXGQpXFx3Ky8sXG5cdFx0YWxpYXM6ICd2YXJpYWJsZSdcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2NvZmZlZXNjcmlwdCcsICdjb21tZW50Jywge1xuXHQnbXVsdGlsaW5lLWNvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyMjI1tcXHNcXFNdKz8jIyMvLFxuXHRcdGFsaWFzOiAnY29tbWVudCdcblx0fSxcblxuXHQvLyBCbG9jayByZWdleHAgY2FuIGNvbnRhaW4gY29tbWVudHMgYW5kIGludGVycG9sYXRpb25cblx0J2Jsb2NrLXJlZ2V4Jzoge1xuXHRcdHBhdHRlcm46IC9cXC97M31bXFxzXFxTXSo/XFwvezN9Lyxcblx0XHRhbGlhczogJ3JlZ2V4Jyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdjb21tZW50JzogY29tbWVudCxcblx0XHRcdCdpbnRlcnBvbGF0aW9uJzogaW50ZXJwb2xhdGlvblxuXHRcdH1cblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2NvZmZlZXNjcmlwdCcsICdzdHJpbmcnLCB7XG5cdCdpbmxpbmUtamF2YXNjcmlwdCc6IHtcblx0XHRwYXR0ZXJuOiAvYCg/OlxcXFw/W1xcc1xcU10pKj9gLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdkZWxpbWl0ZXInOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9eYHxgJC8sXG5cdFx0XHRcdGFsaWFzOiAncHVuY3R1YXRpb24nXG5cdFx0XHR9LFxuXHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHR9XG5cdH0sXG5cblx0Ly8gQmxvY2sgc3RyaW5nc1xuXHQnbXVsdGlsaW5lLXN0cmluZyc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvJycnW1xcc1xcU10qPycnJy8sXG5cdFx0XHRhbGlhczogJ3N0cmluZydcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC9cIlwiXCJbXFxzXFxTXSo/XCJcIlwiLyxcblx0XHRcdGFsaWFzOiAnc3RyaW5nJyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRpbnRlcnBvbGF0aW9uOiBpbnRlcnBvbGF0aW9uXG5cdFx0XHR9XG5cdFx0fVxuXHRdXG5cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdjb2ZmZWVzY3JpcHQnLCAna2V5d29yZCcsIHtcblx0Ly8gT2JqZWN0IHByb3BlcnR5XG5cdCdwcm9wZXJ0eSc6IC8oPyFcXGQpXFx3Kyg/PVxccyo6KD8hOikpL1xufSk7XG5cbn0oUHJpc20pKTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1jcHAuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmNwcCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2MnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhbGlnbmFzfGFsaWdub2Z8YXNtfGF1dG98Ym9vbHxicmVha3xjYXNlfGNhdGNofGNoYXJ8Y2hhcjE2X3R8Y2hhcjMyX3R8Y2xhc3N8Y29tcGx8Y29uc3R8Y29uc3RleHByfGNvbnN0X2Nhc3R8Y29udGludWV8ZGVjbHR5cGV8ZGVmYXVsdHxkZWxldGV8ZG98ZG91YmxlfGR5bmFtaWNfY2FzdHxlbHNlfGVudW18ZXhwbGljaXR8ZXhwb3J0fGV4dGVybnxmbG9hdHxmb3J8ZnJpZW5kfGdvdG98aWZ8aW5saW5lfGludHxsb25nfG11dGFibGV8bmFtZXNwYWNlfG5ld3xub2V4Y2VwdHxudWxscHRyfG9wZXJhdG9yfHByaXZhdGV8cHJvdGVjdGVkfHB1YmxpY3xyZWdpc3RlcnxyZWludGVycHJldF9jYXN0fHJldHVybnxzaG9ydHxzaWduZWR8c2l6ZW9mfHN0YXRpY3xzdGF0aWNfYXNzZXJ0fHN0YXRpY19jYXN0fHN0cnVjdHxzd2l0Y2h8dGVtcGxhdGV8dGhpc3x0aHJlYWRfbG9jYWx8dGhyb3d8dHJ5fHR5cGVkZWZ8dHlwZWlkfHR5cGVuYW1lfHVuaW9ufHVuc2lnbmVkfHVzaW5nfHZpcnR1YWx8dm9pZHx2b2xhdGlsZXx3Y2hhcl90fHdoaWxlKVxcYi8sXG5cdCdib29sZWFuJzogL1xcYih0cnVlfGZhbHNlKVxcYi8sXG5cdCdvcGVyYXRvcic6IC9bLStdezEsMn18IT0/fDx7MSwyfT0/fD57MSwyfT0/fFxcLT58OnsxLDJ9fD17MSwyfXxcXF58fnwlfCZ7MSwyfXxcXHw/XFx8fFxcP3xcXCp8XFwvfFxcYihhbmR8YW5kX2VxfGJpdGFuZHxiaXRvcnxub3R8bm90X2VxfG9yfG9yX2VxfHhvcnx4b3JfZXEpXFxiL1xufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2NwcCcsICdrZXl3b3JkJywge1xuXHQnY2xhc3MtbmFtZSc6IHtcblx0XHRwYXR0ZXJuOiAvKGNsYXNzXFxzKylbYS16MC05X10rL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59KTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1jc2hhcnAuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmNzaGFycCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQna2V5d29yZCc6IC9cXGIoYWJzdHJhY3R8YXN8YXN5bmN8YXdhaXR8YmFzZXxib29sfGJyZWFrfGJ5dGV8Y2FzZXxjYXRjaHxjaGFyfGNoZWNrZWR8Y2xhc3N8Y29uc3R8Y29udGludWV8ZGVjaW1hbHxkZWZhdWx0fGRlbGVnYXRlfGRvfGRvdWJsZXxlbHNlfGVudW18ZXZlbnR8ZXhwbGljaXR8ZXh0ZXJufGZhbHNlfGZpbmFsbHl8Zml4ZWR8ZmxvYXR8Zm9yfGZvcmVhY2h8Z290b3xpZnxpbXBsaWNpdHxpbnxpbnR8aW50ZXJmYWNlfGludGVybmFsfGlzfGxvY2t8bG9uZ3xuYW1lc3BhY2V8bmV3fG51bGx8b2JqZWN0fG9wZXJhdG9yfG91dHxvdmVycmlkZXxwYXJhbXN8cHJpdmF0ZXxwcm90ZWN0ZWR8cHVibGljfHJlYWRvbmx5fHJlZnxyZXR1cm58c2J5dGV8c2VhbGVkfHNob3J0fHNpemVvZnxzdGFja2FsbG9jfHN0YXRpY3xzdHJpbmd8c3RydWN0fHN3aXRjaHx0aGlzfHRocm93fHRydWV8dHJ5fHR5cGVvZnx1aW50fHVsb25nfHVuY2hlY2tlZHx1bnNhZmV8dXNob3J0fHVzaW5nfHZpcnR1YWx8dm9pZHx2b2xhdGlsZXx3aGlsZXxhZGR8YWxpYXN8YXNjZW5kaW5nfGFzeW5jfGF3YWl0fGRlc2NlbmRpbmd8ZHluYW1pY3xmcm9tfGdldHxnbG9iYWx8Z3JvdXB8aW50b3xqb2lufGxldHxvcmRlcmJ5fHBhcnRpYWx8cmVtb3ZlfHNlbGVjdHxzZXR8dmFsdWV8dmFyfHdoZXJlfHlpZWxkKVxcYi8sXG5cdCdzdHJpbmcnOiBbXG5cdFx0L0AoXCJ8JykoXFwxXFwxfFxcXFxcXDF8XFxcXD8oPyFcXDEpW1xcc1xcU10pKlxcMS8sXG5cdFx0LyhcInwnKShcXFxcPy4pKj9cXDEvXG5cdF0sXG5cdCdudW1iZXInOiAvXFxiLT8oMHhbXFxkYS1mXSt8XFxkKlxcLj9cXGQrKVxcYi9pXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnY3NoYXJwJywgJ2tleXdvcmQnLCB7XG5cdCdwcmVwcm9jZXNzb3InOiB7XG5cdFx0cGF0dGVybjogLyheXFxzKikjLiovbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH1cbn0pO1xuXG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tYnJhaW5mdWNrLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5icmFpbmZ1Y2sgPSB7XG5cdCdwb2ludGVyJzoge1xuXHRcdHBhdHRlcm46IC88fD4vLFxuXHRcdGFsaWFzOiAna2V5d29yZCdcblx0fSxcblx0J2luY3JlbWVudCc6IHtcblx0XHRwYXR0ZXJuOiAvXFwrLyxcblx0XHRhbGlhczogJ2luc2VydGVkJ1xuXHR9LFxuXHQnZGVjcmVtZW50Jzoge1xuXHRcdHBhdHRlcm46IC8tLyxcblx0XHRhbGlhczogJ2RlbGV0ZWQnXG5cdH0sXG5cdCdicmFuY2hpbmcnOiB7XG5cdFx0cGF0dGVybjogL1xcW3xcXF0vLFxuXHRcdGFsaWFzOiAnaW1wb3J0YW50J1xuXHR9LFxuXHQnb3BlcmF0b3InOiAvWy4sXS8sXG5cdCdjb21tZW50JzogL1xcUysvXG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWJpc29uLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5iaXNvbiA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2MnLCB7fSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2Jpc29uJywgJ2NvbW1lbnQnLCB7XG5cdCdiaXNvbic6IHtcblx0XHQvLyBUaGlzIHNob3VsZCBtYXRjaCBhbGwgdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZVxuXHRcdC8vIGluY2x1ZGluZyB0aGUgcHJvbG9ndWUocyksIHRoZSBiaXNvbiBkZWNsYXJhdGlvbnMgYW5kXG5cdFx0Ly8gdGhlIGdyYW1tYXIgcnVsZXMuXG5cdFx0cGF0dGVybjogL15bXFxzXFxTXSo/JSVbXFxzXFxTXSo/JSUvLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2MnOiB7XG5cdFx0XHRcdC8vIEFsbG93IGZvciBvbmUgbGV2ZWwgb2YgbmVzdGVkIGJyYWNlc1xuXHRcdFx0XHRwYXR0ZXJuOiAvJVxce1tcXHNcXFNdKj8lXFx9fFxceyg/Olxce1tefV0qXFx9fFtee31dKSpcXH0vLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnZGVsaW1pdGVyJzoge1xuXHRcdFx0XHRcdFx0cGF0dGVybjogL14lP1xce3wlP1xcfSQvLFxuXHRcdFx0XHRcdFx0YWxpYXM6ICdwdW5jdHVhdGlvbidcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdCdiaXNvbi12YXJpYWJsZSc6IHtcblx0XHRcdFx0XHRcdHBhdHRlcm46IC9bJEBdKD86PFteXFxzPl0rPik/W1xcdyRdKy8sXG5cdFx0XHRcdFx0XHRhbGlhczogJ3ZhcmlhYmxlJyxcblx0XHRcdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvPHw+L1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmNcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdjb21tZW50JzogUHJpc20ubGFuZ3VhZ2VzLmMuY29tbWVudCxcblx0XHRcdCdzdHJpbmcnOiBQcmlzbS5sYW5ndWFnZXMuYy5zdHJpbmcsXG5cdFx0XHQncHJvcGVydHknOiAvXFxTKyg/PTopLyxcblx0XHRcdCdrZXl3b3JkJzogLyVcXHcrLyxcblx0XHRcdCdudW1iZXInOiB7XG5cdFx0XHRcdHBhdHRlcm46IC8oXnxbXkBdKVxcYig/OjB4W1xcZGEtZl0rfFxcZCspL2ksXG5cdFx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQncHVuY3R1YXRpb24nOiAvJVslP118W3w6O1xcW1xcXTw+XS9cblx0XHR9XG5cdH1cbn0pO1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWJhc2ljLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5iYXNpYyA9IHtcblx0J3N0cmluZyc6IC9cIig/OlwiXCJ8WyEjJCUmJygpKixcXC86Ozw9Pj9eXyArXFwtLkEtWlxcZF0pKlwiL2ksXG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oPzohfFJFTVxcYikuKy9pLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2tleXdvcmQnOiAvXlJFTS9pXG5cdFx0fVxuXHR9LFxuXHQnbnVtYmVyJzogLyg/OlxcYnxcXEJbLi1dKSg/OlxcZCtcXC4/XFxkKikoPzpFWystXT9cXGQrKT8vaSxcblx0J2tleXdvcmQnOiAvXFxiKD86QVN8QkVFUHxCTE9BRHxCU0FWRXxDQUxMKD86IEFCU09MVVRFKT98Q0FTRXxDSEFJTnxDSERJUnxDTEVBUnxDTE9TRXxDTFN8Q09NfENPTU1PTnxDT05TVHxEQVRBfERFQ0xBUkV8REVGKD86IEZOfCBTRUd8REJMfElOVHxMTkd8U05HfFNUUil8RElNfERPfERPVUJMRXxFTFNFfEVMU0VJRnxFTkR8RU5WSVJPTnxFUkFTRXxFUlJPUnxFWElUfEZJRUxEfEZJTEVTfEZPUnxGVU5DVElPTnxHRVR8R09TVUJ8R09UT3xJRnxJTlBVVHxJTlRFR0VSfElPQ1RMfEtFWXxLSUxMfExJTkUgSU5QVVR8TE9DQVRFfExPQ0t8TE9OR3xMT09QfExTRVR8TUtESVJ8TkFNRXxORVhUfE9GRnxPTig/OiBDT018IEVSUk9SfCBLRVl8IFRJTUVSKT98T1BFTnxPUFRJT04gQkFTRXxPVVR8UE9LRXxQVVR8UkVBRHxSRURJTXxSRU18UkVTVE9SRXxSRVNVTUV8UkVUVVJOfFJNRElSfFJTRVR8UlVOfFNIQVJFRHxTSU5HTEV8U0VMRUNUIENBU0V8U0hFTEx8U0xFRVB8U1RBVElDfFNURVB8U1RPUHxTVFJJTkd8U1VCfFNXQVB8U1lTVEVNfFRIRU58VElNRVJ8VE98VFJPRkZ8VFJPTnxUWVBFfFVOTE9DS3xVTlRJTHxVU0lOR3xWSUVXIFBSSU5UfFdBSVR8V0VORHxXSElMRXxXUklURSkoPzpcXCR8XFxiKS9pLFxuXHQnZnVuY3Rpb24nOiAvXFxiKD86QUJTfEFDQ0VTU3xBQ09TfEFOR0xFfEFSRUF8QVJJVEhNRVRJQ3xBUlJBWXxBU0lOfEFTS3xBVHxBVE58QkFTRXxCRUdJTnxCUkVBS3xDQVVTRXxDRUlMfENIUnxDTElQfENPTExBVEV8Q09MT1J8Q09OfENPU3xDT1NIfENPVHxDU0N8REFURXxEQVRVTXxERUJVR3xERUNJTUFMfERFRnxERUd8REVHUkVFU3xERUxFVEV8REVUfERFVklDRXxESVNQTEFZfERPVHxFTEFQU0VEfEVQU3xFUkFTQUJMRXxFWExJTkV8RVhQfEVYVEVSTkFMfEVYVFlQRXxGSUxFVFlQRXxGSVhFRHxGUHxHT3xHUkFQSHxIQU5ETEVSfElETnxJTUFHRXxJTnxJTlR8SU5URVJOQUx8SVB8SVN8S0VZRUR8TEJPVU5EfExDQVNFfExFRlR8TEVOfExFTkdUSHxMRVR8TElORXxMSU5FU3xMT0d8TE9HMTB8TE9HMnxMVFJJTXxNQVJHSU58TUFUfE1BWHxNQVhOVU18TUlEfE1JTnxNSVNTSU5HfE1PRHxOQVRJVkV8TlVMfE5VTUVSSUN8T0Z8T1BUSU9OfE9SRHxPUkdBTklaQVRJT058T1VUSU58T1VUUFVUfFBJfFBPSU5UfFBPSU5URVJ8UE9JTlRTfFBPU3xQUklOVHxQUk9HUkFNfFBST01QVHxSQUR8UkFESUFOU3xSQU5ET01JWkV8UkVDT1JEfFJFQ1NJWkV8UkVDVFlQRXxSRUxBVElWRXxSRU1BSU5ERVJ8UkVQRUFUfFJFU1R8UkVUUll8UkVXUklURXxSSUdIVHxSTkR8Uk9VTkR8UlRSSU18U0FNRXxTRUN8U0VMRUNUfFNFUVVFTlRJQUx8U0VUfFNFVFRFUnxTR058U0lOfFNJTkh8U0laRXxTS0lQfFNRUnxTVEFOREFSRHxTVEFUVVN8U1RSfFNUUkVBTXxTVFlMRXxUQUJ8VEFOfFRBTkh8VEVNUExBVEV8VEVYVHxUSEVSRXxUSU1FfFRJTUVPVVR8VFJBQ0V8VFJBTlNGT1JNfFRSVU5DQVRFfFVCT1VORHxVQ0FTRXxVU0V8VkFMfFZBUklBQkxFfFZJRVdQT1JUfFdIRU58V0lORE9XfFdJVEh8WkVSfFpPTkVXSURUSCkoPzpcXCR8XFxiKS9pLFxuXHQnb3BlcmF0b3InOiAvPFs9Pl0/fD49P3xbK1xcLSpcXC9ePSZdfFxcYig/OkFORHxFUVZ8SU1QfE5PVHxPUnxYT1IpXFxiL2ksXG5cdCdwdW5jdHVhdGlvbic6IC9bLDs6KCldL1xufTtcblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1iYXNoLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5iYXNoID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlwie1xcXFxdKSMuKi8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnc3RyaW5nJzoge1xuXHRcdC8vYWxsb3cgbXVsdGlsaW5lIHN0cmluZ1xuXHRcdHBhdHRlcm46IC8oXCJ8JykoXFxcXD9bXFxzXFxTXSkqP1xcMS8sXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQvLydwcm9wZXJ0eScgY2xhc3MgcmV1c2VkIGZvciBiYXNoIHZhcmlhYmxlc1xuXHRcdFx0J3Byb3BlcnR5JzogL1xcJChbYS16QS1aMC05XyNcXD9cXC1cXCohQF0rfFxce1teXFx9XStcXH0pL1xuXHRcdH1cblx0fSxcblx0Ly8gUmVkZWZpbmVkIHRvIHByZXZlbnQgaGlnaGxpZ2h0aW5nIG9mIG51bWJlcnMgaW4gZmlsZW5hbWVzXG5cdCdudW1iZXInOiB7XG5cdFx0cGF0dGVybjogLyhbXlxcd1xcLl0pLT8oMHhbXFxkQS1GYS1mXSt8XFxkKlxcLj9cXGQrKFtFZV0tP1xcZCspPylcXGIvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0Ly8gT3JpZ2luYWxseSBiYXNlZCBvbiBodHRwOi8vc3M2NC5jb20vYmFzaC9cblx0J2Z1bmN0aW9uJzogL1xcYig/OmFsaWFzfGFwcm9wb3N8YXB0LWdldHxhcHRpdHVkZXxhc3BlbGx8YXdrfGJhc2VuYW1lfGJhc2h8YmN8Ymd8YnVpbHRpbnxiemlwMnxjYWx8Y2F0fGNkfGNmZGlza3xjaGdycHxjaG1vZHxjaG93bnxjaHJvb3R8Y2hrY29uZmlnfGNrc3VtfGNsZWFyfGNtcHxjb21tfGNvbW1hbmR8Y3B8Y3Jvbnxjcm9udGFifGNzcGxpdHxjdXR8ZGF0ZXxkY3xkZHxkZHJlc2N1ZXxkZnxkaWZmfGRpZmYzfGRpZ3xkaXJ8ZGlyY29sb3JzfGRpcm5hbWV8ZGlyc3xkbWVzZ3xkdXxlZ3JlcHxlamVjdHxlbmFibGV8ZW52fGV0aHRvb2x8ZXZhbHxleGVjfGV4cGFuZHxleHBlY3R8ZXhwb3J0fGV4cHJ8ZmRmb3JtYXR8ZmRpc2t8Zmd8ZmdyZXB8ZmlsZXxmaW5kfGZtdHxmb2xkfGZvcm1hdHxmcmVlfGZzY2t8ZnRwfGZ1c2VyfGdhd2t8Z2V0b3B0c3xnaXR8Z3JlcHxncm91cGFkZHxncm91cGRlbHxncm91cG1vZHxncm91cHN8Z3ppcHxoYXNofGhlYWR8aGVscHxoZ3xoaXN0b3J5fGhvc3RuYW1lfGh0b3B8aWNvbnZ8aWR8aWZjb25maWd8aWZkb3dufGlmdXB8aW1wb3J0fGluc3RhbGx8am9ic3xqb2lufGtpbGx8a2lsbGFsbHxsZXNzfGxpbmt8bG58bG9jYXRlfGxvZ25hbWV8bG9nb3V0fGxvb2t8bHBjfGxwcnxscHJpbnR8bHByaW50ZHxscHJpbnRxfGxwcm18bHN8bHNvZnxtYWtlfG1hbnxta2Rpcnxta2ZpZm98bWtpc29mc3xta25vZHxtb3JlfG1vc3R8bW91bnR8bXRvb2xzfG10cnxtdnxtbXZ8bmFub3xuZXRzdGF0fG5pY2V8bmx8bm9odXB8bm90aWZ5LXNlbmR8bnNsb29rdXB8b3BlbnxvcHxwYXNzd2R8cGFzdGV8cGF0aGNoa3xwaW5nfHBraWxsfHBvcGR8cHJ8cHJpbnRjYXB8cHJpbnRlbnZ8cHJpbnRmfHBzfHB1c2hkfHB2fHB3ZHxxdW90YXxxdW90YWNoZWNrfHF1b3RhY3RsfHJhbXxyYXJ8cmNwfHJlYWR8cmVhZGFycmF5fHJlYWRvbmx5fHJlYm9vdHxyZW5hbWV8cmVuaWNlfHJlbXN5bmN8cmV2fHJtfHJtZGlyfHJzeW5jfHNjcmVlbnxzY3B8c2RpZmZ8c2VkfHNlcXxzZXJ2aWNlfHNmdHB8c2hpZnR8c2hvcHR8c2h1dGRvd258c2xlZXB8c2xvY2F0ZXxzb3J0fHNvdXJjZXxzcGxpdHxzc2h8c3RhdHxzdHJhY2V8c3V8c3Vkb3xzdW18c3VzcGVuZHxzeW5jfHRhaWx8dGFyfHRlZXx0ZXN0fHRpbWV8dGltZW91dHx0aW1lc3x0b3VjaHx0b3B8dHJhY2Vyb3V0ZXx0cmFwfHRyfHRzb3J0fHR0eXx0eXBlfHVsaW1pdHx1bWFza3x1bW91bnR8dW5hbGlhc3x1bmFtZXx1bmV4cGFuZHx1bmlxfHVuaXRzfHVucmFyfHVuc2hhcnx1cHRpbWV8dXNlcmFkZHx1c2VyZGVsfHVzZXJtb2R8dXNlcnN8dXVlbmNvZGV8dXVkZWNvZGV8dnx2ZGlyfHZpfHZtc3RhdHx3YWl0fHdhdGNofHdjfHdnZXR8d2hlcmVpc3x3aGljaHx3aG98d2hvYW1pfHdyaXRlfHhhcmdzfHhkZy1vcGVufHllc3x6aXApXFxiLyxcblx0J2tleXdvcmQnOiAvXFxiKGlmfHRoZW58ZWxzZXxlbGlmfGZpfGZvcnxicmVha3xjb250aW51ZXx3aGlsZXxpbnxjYXNlfGZ1bmN0aW9ufHNlbGVjdHxkb3xkb25lfHVudGlsfGVjaG98ZXhpdHxyZXR1cm58c2V0fGRlY2xhcmUpXFxiL1xufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2Jhc2gnLCAna2V5d29yZCcsIHtcblx0Ly8ncHJvcGVydHknIGNsYXNzIHJldXNlZCBmb3IgYmFzaCB2YXJpYWJsZXNcblx0J3Byb3BlcnR5JzogL1xcJChbYS16QS1aMC05XyNcXD9cXC1cXCohQF0rfFxce1tefV0rXFx9KS9cbn0pO1xuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnYmFzaCcsICdjb21tZW50Jywge1xuXHQvL3NoZWJhbmcgbXVzdCBiZSBiZWZvcmUgY29tbWVudCwgJ2ltcG9ydGFudCcgY2xhc3MgZnJvbSBjc3MgcmV1c2VkXG5cdCdpbXBvcnRhbnQnOiAvXiMhXFxzKlxcL2JpblxcL2Jhc2h8XiMhXFxzKlxcL2JpblxcL3NoL1xufSk7XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1hdXRvaG90a2V5LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbi8vIE5PVEVTIC0gZm9sbG93cyBmaXJzdC1maXJzdCBoaWdobGlnaHQgbWV0aG9kLCBibG9jayBpcyBsb2NrZWQgYWZ0ZXIgaGlnaGxpZ2h0LCBkaWZmZXJlbnQgZnJvbSBTeW50YXhIbFxuUHJpc20ubGFuZ3VhZ2VzLmF1dG9ob3RrZXk9IHtcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyheW15cIjtcXG5dKihcIlteXCJcXG5dKj9cIlteXCJcXG5dKj8pKikoOy4qJHxeXFxzKlxcL1xcKltcXHNcXFNdKlxcblxcKlxcLykvbSxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdzdHJpbmcnOiAvXCIoKFteXCJcXG5cXHJdfFwiXCIpKilcIi9tLFxuXHQnZnVuY3Rpb24nOiAvW15cXChcXCk7IFxcdCxcXG5cXCtcXCpcXC09XFw/PjpcXFxcXFwvPCYlXFxbXFxdXSs/KD89XFwoKS9tLCAgLy9mdW5jdGlvbiAtIGRvbid0IHVzZSAuKlxcKSBpbiB0aGUgZW5kIGJjb3ogc3RyaW5nIGxvY2tzIGl0XG5cdCd0YWcnOiAvXlsgXFx0XSpbXlxcczpdKz8oPz06KD86W146XXwkKSkvbSwgIC8vbGFiZWxzXG5cdCd2YXJpYWJsZSc6IC8lXFx3KyUvLFxuXHQnbnVtYmVyJzogL1xcYi0/KDB4W1xcZEEtRmEtZl0rfFxcZCpcXC4/XFxkKyhbRWVdLT9cXGQrKT8pXFxiLyxcblx0J29wZXJhdG9yJzogL1xcP3xcXC9cXC8/PT98Oj18XFx8Wz18XT98Jls9Jl0/fFxcK1s9K10/fC1bPS1dP3xcXCpbPSpdP3w8KD86PD0/fD58PSk/fD4+Pz0/fFsuXiE9fl09P3xcXGIoPzpBTkR8Tk9UfE9SKVxcYi8sXG5cdCdwdW5jdHVhdGlvbic6IC9bXFx7fVtcXF1cXChcXCk6LF0vLFxuXHQnYm9vbGVhbic6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvLFxuXG5cdCdzZWxlY3Rvcic6IC9cXGIoQXV0b1RyaW18QmxvY2tJbnB1dHxCcmVha3xDbGlja3xDbGlwV2FpdHxDb250aW51ZXxDb250cm9sfENvbnRyb2xDbGlja3xDb250cm9sRm9jdXN8Q29udHJvbEdldHxDb250cm9sR2V0Rm9jdXN8Q29udHJvbEdldFBvc3xDb250cm9sR2V0VGV4dHxDb250cm9sTW92ZXxDb250cm9sU2VuZHxDb250cm9sU2VuZFJhd3xDb250cm9sU2V0VGV4dHxDb29yZE1vZGV8Q3JpdGljYWx8RGV0ZWN0SGlkZGVuVGV4dHxEZXRlY3RIaWRkZW5XaW5kb3dzfERyaXZlfERyaXZlR2V0fERyaXZlU3BhY2VGcmVlfEVudkFkZHxFbnZEaXZ8RW52R2V0fEVudk11bHR8RW52U2V0fEVudlN1YnxFbnZVcGRhdGV8RXhpdHxFeGl0QXBwfEZpbGVBcHBlbmR8RmlsZUNvcHl8RmlsZUNvcHlEaXJ8RmlsZUNyZWF0ZURpcnxGaWxlQ3JlYXRlU2hvcnRjdXR8RmlsZURlbGV0ZXxGaWxlRW5jb2Rpbmd8RmlsZUdldEF0dHJpYnxGaWxlR2V0U2hvcnRjdXR8RmlsZUdldFNpemV8RmlsZUdldFRpbWV8RmlsZUdldFZlcnNpb258RmlsZUluc3RhbGx8RmlsZU1vdmV8RmlsZU1vdmVEaXJ8RmlsZVJlYWR8RmlsZVJlYWRMaW5lfEZpbGVSZWN5Y2xlfEZpbGVSZWN5Y2xlRW1wdHl8RmlsZVJlbW92ZURpcnxGaWxlU2VsZWN0RmlsZXxGaWxlU2VsZWN0Rm9sZGVyfEZpbGVTZXRBdHRyaWJ8RmlsZVNldFRpbWV8Rm9ybWF0VGltZXxHZXRLZXlTdGF0ZXxHb3N1YnxHb3RvfEdyb3VwQWN0aXZhdGV8R3JvdXBBZGR8R3JvdXBDbG9zZXxHcm91cERlYWN0aXZhdGV8R3VpfEd1aUNvbnRyb2x8R3VpQ29udHJvbEdldHxIb3RrZXl8SW1hZ2VTZWFyY2h8SW5pRGVsZXRlfEluaVJlYWR8SW5pV3JpdGV8SW5wdXR8SW5wdXRCb3h8S2V5V2FpdHxMaXN0SG90a2V5c3xMaXN0TGluZXN8TGlzdFZhcnN8TG9vcHxNZW51fE1vdXNlQ2xpY2t8TW91c2VDbGlja0RyYWd8TW91c2VHZXRQb3N8TW91c2VNb3ZlfE1zZ0JveHxPbkV4aXR8T3V0cHV0RGVidWd8UGF1c2V8UGl4ZWxHZXRDb2xvcnxQaXhlbFNlYXJjaHxQb3N0TWVzc2FnZXxQcm9jZXNzfFByb2dyZXNzfFJhbmRvbXxSZWdEZWxldGV8UmVnUmVhZHxSZWdXcml0ZXxSZWxvYWR8UmVwZWF0fFJldHVybnxSdW58UnVuQXN8UnVuV2FpdHxTZW5kfFNlbmRFdmVudHxTZW5kSW5wdXR8U2VuZE1lc3NhZ2V8U2VuZE1vZGV8U2VuZFBsYXl8U2VuZFJhd3xTZXRCYXRjaExpbmVzfFNldENhcHNsb2NrU3RhdGV8U2V0Q29udHJvbERlbGF5fFNldERlZmF1bHRNb3VzZVNwZWVkfFNldEVudnxTZXRGb3JtYXR8U2V0S2V5RGVsYXl8U2V0TW91c2VEZWxheXxTZXROdW1sb2NrU3RhdGV8U2V0U2Nyb2xsTG9ja1N0YXRlfFNldFN0b3JlQ2Fwc2xvY2tNb2RlfFNldFRpbWVyfFNldFRpdGxlTWF0Y2hNb2RlfFNldFdpbkRlbGF5fFNldFdvcmtpbmdEaXJ8U2h1dGRvd258U2xlZXB8U29ydHxTb3VuZEJlZXB8U291bmRHZXR8U291bmRHZXRXYXZlVm9sdW1lfFNvdW5kUGxheXxTb3VuZFNldHxTb3VuZFNldFdhdmVWb2x1bWV8U3BsYXNoSW1hZ2V8U3BsYXNoVGV4dE9mZnxTcGxhc2hUZXh0T258U3BsaXRQYXRofFN0YXR1c0JhckdldFRleHR8U3RhdHVzQmFyV2FpdHxTdHJpbmdDYXNlU2Vuc2V8U3RyaW5nR2V0UG9zfFN0cmluZ0xlZnR8U3RyaW5nTGVufFN0cmluZ0xvd2VyfFN0cmluZ01pZHxTdHJpbmdSZXBsYWNlfFN0cmluZ1JpZ2h0fFN0cmluZ1NwbGl0fFN0cmluZ1RyaW1MZWZ0fFN0cmluZ1RyaW1SaWdodHxTdHJpbmdVcHBlcnxTdXNwZW5kfFN5c0dldHxUaHJlYWR8VG9vbFRpcHxUcmFuc2Zvcm18VHJheVRpcHxVUkxEb3dubG9hZFRvRmlsZXxXaW5BY3RpdmF0ZXxXaW5BY3RpdmF0ZUJvdHRvbXxXaW5DbG9zZXxXaW5HZXR8V2luR2V0QWN0aXZlU3RhdHN8V2luR2V0QWN0aXZlVGl0bGV8V2luR2V0Q2xhc3N8V2luR2V0UG9zfFdpbkdldFRleHR8V2luR2V0VGl0bGV8V2luSGlkZXxXaW5LaWxsfFdpbk1heGltaXplfFdpbk1lbnVTZWxlY3RJdGVtfFdpbk1pbmltaXplfFdpbk1pbmltaXplQWxsfFdpbk1pbmltaXplQWxsVW5kb3xXaW5Nb3ZlfFdpblJlc3RvcmV8V2luU2V0fFdpblNldFRpdGxlfFdpblNob3d8V2luV2FpdHxXaW5XYWl0QWN0aXZlfFdpbldhaXRDbG9zZXxXaW5XYWl0Tm90QWN0aXZlKVxcYi9pLFxuXG5cdCdjb25zdGFudCc6IC9cXGIoYV9haGtwYXRofGFfYWhrdmVyc2lvbnxhX2FwcGRhdGF8YV9hcHBkYXRhY29tbW9ufGFfYXV0b3RyaW18YV9iYXRjaGxpbmVzfGFfY2FyZXR4fGFfY2FyZXR5fGFfY29tcHV0ZXJuYW1lfGFfY29udHJvbGRlbGF5fGFfY3Vyc29yfGFfZGR8YV9kZGR8YV9kZGRkfGFfZGVmYXVsdG1vdXNlc3BlZWR8YV9kZXNrdG9wfGFfZGVza3RvcGNvbW1vbnxhX2RldGVjdGhpZGRlbnRleHR8YV9kZXRlY3RoaWRkZW53aW5kb3dzfGFfZW5kY2hhcnxhX2V2ZW50aW5mb3xhX2V4aXRyZWFzb258YV9mb3JtYXRmbG9hdHxhX2Zvcm1hdGludGVnZXJ8YV9ndWl8YV9ndWlldmVudHxhX2d1aWNvbnRyb2x8YV9ndWljb250cm9sZXZlbnR8YV9ndWloZWlnaHR8YV9ndWl3aWR0aHxhX2d1aXh8YV9ndWl5fGFfaG91cnxhX2ljb25maWxlfGFfaWNvbmhpZGRlbnxhX2ljb25udW1iZXJ8YV9pY29udGlwfGFfaW5kZXh8YV9pcGFkZHJlc3MxfGFfaXBhZGRyZXNzMnxhX2lwYWRkcmVzczN8YV9pcGFkZHJlc3M0fGFfaXNhZG1pbnxhX2lzY29tcGlsZWR8YV9pc2NyaXRpY2FsfGFfaXNwYXVzZWR8YV9pc3N1c3BlbmRlZHxhX2lzdW5pY29kZXxhX2tleWRlbGF5fGFfbGFuZ3VhZ2V8YV9sYXN0ZXJyb3J8YV9saW5lZmlsZXxhX2xpbmVudW1iZXJ8YV9sb29wZmllbGR8YV9sb29wZmlsZWF0dHJpYnxhX2xvb3BmaWxlZGlyfGFfbG9vcGZpbGVleHR8YV9sb29wZmlsZWZ1bGxwYXRofGFfbG9vcGZpbGVsb25ncGF0aHxhX2xvb3BmaWxlbmFtZXxhX2xvb3BmaWxlc2hvcnRuYW1lfGFfbG9vcGZpbGVzaG9ydHBhdGh8YV9sb29wZmlsZXNpemV8YV9sb29wZmlsZXNpemVrYnxhX2xvb3BmaWxlc2l6ZW1ifGFfbG9vcGZpbGV0aW1lYWNjZXNzZWR8YV9sb29wZmlsZXRpbWVjcmVhdGVkfGFfbG9vcGZpbGV0aW1lbW9kaWZpZWR8YV9sb29wcmVhZGxpbmV8YV9sb29wcmVna2V5fGFfbG9vcHJlZ25hbWV8YV9sb29wcmVnc3Via2V5fGFfbG9vcHJlZ3RpbWVtb2RpZmllZHxhX2xvb3ByZWd0eXBlfGFfbWRheXxhX21pbnxhX21tfGFfbW1tfGFfbW1tbXxhX21vbnxhX21vdXNlZGVsYXl8YV9tc2VjfGFfbXlkb2N1bWVudHN8YV9ub3d8YV9ub3d1dGN8YV9udW1iYXRjaGxpbmVzfGFfb3N0eXBlfGFfb3N2ZXJzaW9ufGFfcHJpb3Job3RrZXl8cHJvZ3JhbWZpbGVzfGFfcHJvZ3JhbWZpbGVzfGFfcHJvZ3JhbXN8YV9wcm9ncmFtc2NvbW1vbnxhX3NjcmVlbmhlaWdodHxhX3NjcmVlbndpZHRofGFfc2NyaXB0ZGlyfGFfc2NyaXB0ZnVsbHBhdGh8YV9zY3JpcHRuYW1lfGFfc2VjfGFfc3BhY2V8YV9zdGFydG1lbnV8YV9zdGFydG1lbnVjb21tb258YV9zdGFydHVwfGFfc3RhcnR1cGNvbW1vbnxhX3N0cmluZ2Nhc2VzZW5zZXxhX3RhYnxhX3RlbXB8YV90aGlzZnVuY3xhX3RoaXNob3RrZXl8YV90aGlzbGFiZWx8YV90aGlzbWVudXxhX3RoaXNtZW51aXRlbXxhX3RoaXNtZW51aXRlbXBvc3xhX3RpY2tjb3VudHxhX3RpbWVpZGxlfGFfdGltZWlkbGVwaHlzaWNhbHxhX3RpbWVzaW5jZXByaW9yaG90a2V5fGFfdGltZXNpbmNldGhpc2hvdGtleXxhX3RpdGxlbWF0Y2htb2RlfGFfdGl0bGVtYXRjaG1vZGVzcGVlZHxhX3VzZXJuYW1lfGFfd2RheXxhX3dpbmRlbGF5fGFfd2luZGlyfGFfd29ya2luZ2RpcnxhX3lkYXl8YV95ZWFyfGFfeXdlZWt8YV95eXl5fGNsaXBib2FyZHxjbGlwYm9hcmRhbGx8Y29tc3BlY3xlcnJvcmxldmVsKVxcYi9pLFxuXG5cdCdidWlsdGluJzogL1xcYihhYnN8YWNvc3xhc2N8YXNpbnxhdGFufGNlaWx8Y2hyfGNsYXNzfGNvc3xkbGxjYWxsfGV4cHxmaWxlZXhpc3R8RmlsZW9wZW58Zmxvb3J8aWxfYWRkfGlsX2NyZWF0ZXxpbF9kZXN0cm95fGluc3RyfHN1YnN0cnxpc2Z1bmN8aXNsYWJlbHxJc09iamVjdHxsbnxsb2d8bHZfYWRkfGx2X2RlbGV0ZXxsdl9kZWxldGVjb2x8bHZfZ2V0Y291bnR8bHZfZ2V0bmV4dHxsdl9nZXR0ZXh0fGx2X2luc2VydHxsdl9pbnNlcnRjb2x8bHZfbW9kaWZ5fGx2X21vZGlmeWNvbHxsdl9zZXRpbWFnZWxpc3R8bW9kfG9ubWVzc2FnZXxudW1nZXR8bnVtcHV0fHJlZ2lzdGVyY2FsbGJhY2t8cmVnZXhtYXRjaHxyZWdleHJlcGxhY2V8cm91bmR8c2lufHRhbnxzcXJ0fHN0cmxlbnxzYl9zZXRpY29ufHNiX3NldHBhcnRzfHNiX3NldHRleHR8c3Ryc3BsaXR8dHZfYWRkfHR2X2RlbGV0ZXx0dl9nZXRjaGlsZHx0dl9nZXRjb3VudHx0dl9nZXRuZXh0fHR2X2dldHx0dl9nZXRwYXJlbnR8dHZfZ2V0cHJldnx0dl9nZXRzZWxlY3Rpb258dHZfZ2V0dGV4dHx0dl9tb2RpZnl8dmFyc2V0Y2FwYWNpdHl8d2luYWN0aXZlfHdpbmV4aXN0fF9fTmV3fF9fQ2FsbHxfX0dldHxfX1NldClcXGIvaSxcblxuXHQnc3ltYm9sJzogL1xcYihhbHR8YWx0ZG93bnxhbHR1cHxhcHBza2V5fGJhY2tzcGFjZXxicm93c2VyX2JhY2t8YnJvd3Nlcl9mYXZvcml0ZXN8YnJvd3Nlcl9mb3J3YXJkfGJyb3dzZXJfaG9tZXxicm93c2VyX3JlZnJlc2h8YnJvd3Nlcl9zZWFyY2h8YnJvd3Nlcl9zdG9wfGJzfGNhcHNsb2NrfGN0cmx8Y3RybGJyZWFrfGN0cmxkb3dufGN0cmx1cHxkZWx8ZGVsZXRlfGRvd258ZW5kfGVudGVyfGVzY3xlc2NhcGV8ZjF8ZjEwfGYxMXxmMTJ8ZjEzfGYxNHxmMTV8ZjE2fGYxN3xmMTh8ZjE5fGYyfGYyMHxmMjF8ZjIyfGYyM3xmMjR8ZjN8ZjR8ZjV8ZjZ8Zjd8Zjh8Zjl8aG9tZXxpbnN8aW5zZXJ0fGpveTF8am95MTB8am95MTF8am95MTJ8am95MTN8am95MTR8am95MTV8am95MTZ8am95MTd8am95MTh8am95MTl8am95Mnxqb3kyMHxqb3kyMXxqb3kyMnxqb3kyM3xqb3kyNHxqb3kyNXxqb3kyNnxqb3kyN3xqb3kyOHxqb3kyOXxqb3kzfGpveTMwfGpveTMxfGpveTMyfGpveTR8am95NXxqb3k2fGpveTd8am95OHxqb3k5fGpveWF4ZXN8am95YnV0dG9uc3xqb3lpbmZvfGpveW5hbWV8am95cG92fGpveXJ8am95dXxqb3l2fGpveXh8am95eXxqb3l6fGxhbHR8bGF1bmNoX2FwcDF8bGF1bmNoX2FwcDJ8bGF1bmNoX21haWx8bGF1bmNoX21lZGlhfGxidXR0b258bGNvbnRyb2x8bGN0cmx8bGVmdHxsc2hpZnR8bHdpbnxsd2luZG93bnxsd2ludXB8bWJ1dHRvbnxtZWRpYV9uZXh0fG1lZGlhX3BsYXlfcGF1c2V8bWVkaWFfcHJldnxtZWRpYV9zdG9wfG51bWxvY2t8bnVtcGFkMHxudW1wYWQxfG51bXBhZDJ8bnVtcGFkM3xudW1wYWQ0fG51bXBhZDV8bnVtcGFkNnxudW1wYWQ3fG51bXBhZDh8bnVtcGFkOXxudW1wYWRhZGR8bnVtcGFkY2xlYXJ8bnVtcGFkZGVsfG51bXBhZGRpdnxudW1wYWRkb3R8bnVtcGFkZG93bnxudW1wYWRlbmR8bnVtcGFkZW50ZXJ8bnVtcGFkaG9tZXxudW1wYWRpbnN8bnVtcGFkbGVmdHxudW1wYWRtdWx0fG51bXBhZHBnZG58bnVtcGFkcGd1cHxudW1wYWRyaWdodHxudW1wYWRzdWJ8bnVtcGFkdXB8cGdkbnxwZ3VwfHByaW50c2NyZWVufHJhbHR8cmJ1dHRvbnxyY29udHJvbHxyY3RybHxyaWdodHxyc2hpZnR8cndpbnxyd2luZG93bnxyd2ludXB8c2Nyb2xsbG9ja3xzaGlmdHxzaGlmdGRvd258c2hpZnR1cHxzcGFjZXx0YWJ8dXB8dm9sdW1lX2Rvd258dm9sdW1lX211dGV8dm9sdW1lX3VwfHdoZWVsZG93bnx3aGVlbGxlZnR8d2hlZWxyaWdodHx3aGVlbHVwfHhidXR0b24xfHhidXR0b24yKVxcYi9pLFxuXG5cdCdpbXBvcnRhbnQnOiAvI1xcYihBbGxvd1NhbWVMaW5lQ29tbWVudHN8Q2xpcGJvYXJkVGltZW91dHxDb21tZW50RmxhZ3xFcnJvclN0ZE91dHxFc2NhcGVDaGFyfEhvdGtleUludGVydmFsfEhvdGtleU1vZGlmaWVyVGltZW91dHxIb3RzdHJpbmd8SWZXaW5BY3RpdmV8SWZXaW5FeGlzdHxJZldpbk5vdEFjdGl2ZXxJZldpbk5vdEV4aXN0fEluY2x1ZGV8SW5jbHVkZUFnYWlufEluc3RhbGxLZXliZEhvb2t8SW5zdGFsbE1vdXNlSG9va3xLZXlIaXN0b3J5fExUcmltfE1heEhvdGtleXNQZXJJbnRlcnZhbHxNYXhNZW18TWF4VGhyZWFkc3xNYXhUaHJlYWRzQnVmZmVyfE1heFRocmVhZHNQZXJIb3RrZXl8Tm9FbnZ8Tm9UcmF5SWNvbnxQZXJzaXN0ZW50fFNpbmdsZUluc3RhbmNlfFVzZUhvb2t8V2luQWN0aXZhdGVGb3JjZSlcXGIvaSxcblxuXHQna2V5d29yZCc6IC9cXGIoQWJvcnR8QWJvdmVOb3JtYWx8QWRkfGFoa19jbGFzc3xhaGtfZ3JvdXB8YWhrX2lkfGFoa19waWR8QWxsfEFsbnVtfEFscGhhfEFsdFN1Ym1pdHxBbHRUYWJ8QWx0VGFiQW5kTWVudXxBbHRUYWJNZW51fEFsdFRhYk1lbnVEaXNtaXNzfEFsd2F5c09uVG9wfEF1dG9TaXplfEJhY2tncm91bmR8QmFja2dyb3VuZFRyYW5zfEJlbG93Tm9ybWFsfGJldHdlZW58Qml0QW5kfEJpdE5vdHxCaXRPcnxCaXRTaGlmdExlZnR8Qml0U2hpZnRSaWdodHxCaXRYT3J8Qm9sZHxCb3JkZXJ8QnV0dG9ufEJ5UmVmfENoZWNrYm94fENoZWNrZWR8Q2hlY2tlZEdyYXl8Q2hvb3NlfENob29zZVN0cmluZ3xDbG9zZXxDb2xvcnxDb21ib0JveHxDb250YWluc3xDb250cm9sTGlzdHxDb3VudHxEYXRlfERhdGVUaW1lfERheXN8RERMfERlZmF1bHR8RGVsZXRlQWxsfERlbGltaXRlcnxEZXJlZnxEZXN0cm95fERpZ2l0fERpc2FibGV8RGlzYWJsZWR8RHJvcERvd25MaXN0fEVkaXR8RWplY3R8RWxzZXxFbmFibGV8RW5hYmxlZHxFcnJvcnxFeGlzdHxFeHBhbmR8RXhTdHlsZXxGaWxlU3lzdGVtfEZpcnN0fEZsYXNofEZsb2F0fEZsb2F0RmFzdHxGb2N1c3xGb250fGZvcnxnbG9iYWx8R3JpZHxHcm91cHxHcm91cEJveHxHdWlDbG9zZXxHdWlDb250ZXh0TWVudXxHdWlEcm9wRmlsZXN8R3VpRXNjYXBlfEd1aVNpemV8SGRyfEhpZGRlbnxIaWRlfEhpZ2h8SEtDQ3xIS0NSfEhLQ1V8SEtFWV9DTEFTU0VTX1JPT1R8SEtFWV9DVVJSRU5UX0NPTkZJR3xIS0VZX0NVUlJFTlRfVVNFUnxIS0VZX0xPQ0FMX01BQ0hJTkV8SEtFWV9VU0VSU3xIS0xNfEhLVXxIb3Vyc3xIU2Nyb2xsfEljb258SWNvblNtYWxsfElEfElETGFzdHxJZnxJZkVxdWFsfElmRXhpc3R8SWZHcmVhdGVyfElmR3JlYXRlck9yRXF1YWx8SWZJblN0cmluZ3xJZkxlc3N8SWZMZXNzT3JFcXVhbHxJZk1zZ0JveHxJZk5vdEVxdWFsfElmTm90RXhpc3R8SWZOb3RJblN0cmluZ3xJZldpbkFjdGl2ZXxJZldpbkV4aXN0fElmV2luTm90QWN0aXZlfElmV2luTm90RXhpc3R8SWdub3JlfEltYWdlTGlzdHxpbnxJbnRlZ2VyfEludGVnZXJGYXN0fEludGVycnVwdHxpc3xpdGFsaWN8Sm9pbnxMYWJlbHxMYXN0Rm91bmR8TGFzdEZvdW5kRXhpc3R8TGltaXR8TGluZXN8TGlzdHxMaXN0Qm94fExpc3RWaWV3fGxvY2FsfExvY2t8TG9nb2ZmfExvd3xMb3dlcnxMb3dlcmNhc2V8TWFpbldpbmRvd3xNYXJnaW58TWF4aW1pemV8TWF4aW1pemVCb3h8TWF4U2l6ZXxNaW5pbWl6ZXxNaW5pbWl6ZUJveHxNaW5NYXh8TWluU2l6ZXxNaW51dGVzfE1vbnRoQ2FsfE1vdXNlfE1vdmV8TXVsdGl8TkF8Tm98Tm9BY3RpdmF0ZXxOb0RlZmF1bHR8Tm9IaWRlfE5vSWNvbnxOb01haW5XaW5kb3d8bm9ybXxOb3JtYWx8Tm9Tb3J0fE5vU29ydEhkcnxOb1N0YW5kYXJkfE5vdHxOb1RhYnxOb1RpbWVyc3xOdW1iZXJ8T2ZmfE9rfE9ufE93bkRpYWxvZ3N8T3duZXJ8UGFyc2V8UGFzc3dvcmR8UGljdHVyZXxQaXhlbHxQb3N8UG93fFByaW9yaXR5fFByb2Nlc3NOYW1lfFJhZGlvfFJhbmdlfFJlYWR8UmVhZE9ubHl8UmVhbHRpbWV8UmVkcmF3fFJFR19CSU5BUll8UkVHX0RXT1JEfFJFR19FWFBBTkRfU1p8UkVHX01VTFRJX1NafFJFR19TWnxSZWdpb258UmVsYXRpdmV8UmVuYW1lfFJlcG9ydHxSZXNpemV8UmVzdG9yZXxSZXRyeXxSR0J8U2NyZWVufFNlY29uZHN8U2VjdGlvbnxTZXJpYWx8U2V0TGFiZWx8U2hpZnRBbHRUYWJ8U2hvd3xTaW5nbGV8U2xpZGVyfFNvcnREZXNjfFN0YW5kYXJkfHN0YXRpY3xTdGF0dXN8U3RhdHVzQmFyfFN0YXR1c0NEfHN0cmlrZXxTdHlsZXxTdWJtaXR8U3lzTWVudXxUYWIyfFRhYlN0b3B8VGV4dHxUaGVtZXxUaWxlfFRvZ2dsZUNoZWNrfFRvZ2dsZUVuYWJsZXxUb29sV2luZG93fFRvcHxUb3Btb3N0fFRyYW5zQ29sb3J8VHJhbnNwYXJlbnR8VHJheXxUcmVlVmlld3xUcnlBZ2FpbnxUeXBlfFVuQ2hlY2t8dW5kZXJsaW5lfFVuaWNvZGV8VW5sb2NrfFVwRG93bnxVcHBlcnxVcHBlcmNhc2V8VXNlRXJyb3JMZXZlbHxWaXN8VmlzRmlyc3R8VmlzaWJsZXxWU2Nyb2xsfFdhaXR8V2FpdENsb3NlfFdhbnRDdHJsQXxXYW50RjJ8V2FudFJldHVybnxXaGlsZXxXcmFwfFhkaWdpdHx4bXx4cHx4c3xZZXN8eW18eXB8eXMpXFxiL2lcbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tYXNwbmV0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5hc3BuZXQgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdtYXJrdXAnLCB7XG5cdCdwYWdlLWRpcmVjdGl2ZSB0YWcnOiB7XG5cdFx0cGF0dGVybjogLzwlXFxzKkAuKiU+L2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQncGFnZS1kaXJlY3RpdmUgdGFnJzogLzwlXFxzKkBcXHMqKD86QXNzZW1ibHl8Q29udHJvbHxJbXBsZW1lbnRzfEltcG9ydHxNYXN0ZXIoPzpUeXBlKT98T3V0cHV0Q2FjaGV8UGFnZXxQcmV2aW91c1BhZ2VUeXBlfFJlZmVyZW5jZXxSZWdpc3Rlcik/fCU+L2ksXG5cdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMubWFya3VwLnRhZy5pbnNpZGVcblx0XHR9XG5cdH0sXG5cdCdkaXJlY3RpdmUgdGFnJzoge1xuXHRcdHBhdHRlcm46IC88JS4qJT4vaSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdkaXJlY3RpdmUgdGFnJzogLzwlXFxzKj9bJD0lIzpdezAsMn18JT4vaSxcblx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5jc2hhcnBcblx0XHR9XG5cdH1cbn0pO1xuLy8gUmVnZXhwIGNvcGllZCBmcm9tIHByaXNtLW1hcmt1cCwgd2l0aCBhIG5lZ2F0aXZlIGxvb2stYWhlYWQgYWRkZWRcblByaXNtLmxhbmd1YWdlcy5hc3BuZXQudGFnLnBhdHRlcm4gPSAvPCg/ISUpXFwvP1teXFxzPlxcL10rKD86XFxzK1teXFxzPlxcLz1dKyg/Oj0oPzooXCJ8JykoPzpcXFxcXFwxfFxcXFw/KD8hXFwxKVtcXHdcXFddKSpcXDF8W15cXHMnXCI+PV0rKSk/KSpcXHMqXFwvPz4vaTtcblxuLy8gbWF0Y2ggZGlyZWN0aXZlcyBvZiBhdHRyaWJ1dGUgdmFsdWUgZm9vPVwiPCUgQmFyICU+XCJcblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2luc2lkZScsICdwdW5jdHVhdGlvbicsIHtcblx0J2RpcmVjdGl2ZSB0YWcnOiBQcmlzbS5sYW5ndWFnZXMuYXNwbmV0WydkaXJlY3RpdmUgdGFnJ11cbn0sIFByaXNtLmxhbmd1YWdlcy5hc3BuZXQudGFnLmluc2lkZVtcImF0dHItdmFsdWVcIl0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdhc3BuZXQnLCAnY29tbWVudCcsIHtcblx0J2FzcCBjb21tZW50JzogLzwlLS1bXFx3XFxXXSo/LS0lPi9cbn0pO1xuXG4vLyBzY3JpcHQgcnVuYXQ9XCJzZXJ2ZXJcIiBjb250YWlucyBjc2hhcnAsIG5vdCBqYXZhc2NyaXB0XG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdhc3BuZXQnLCBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdCA/ICdzY3JpcHQnIDogJ3RhZycsIHtcblx0J2FzcCBzY3JpcHQnOiB7XG5cdFx0cGF0dGVybjogLzxzY3JpcHQoPz0uKnJ1bmF0PVsnXCJdP3NlcnZlclsnXCJdPylbXFx3XFxXXSo/PltcXHdcXFddKj88XFwvc2NyaXB0Pi9pLFxuXHRcdGluc2lkZToge1xuXHRcdFx0dGFnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC88XFwvP3NjcmlwdFxccyooPzpcXHMrW1xcdzotXSsoPzo9KD86KFwifCcpKFxcXFw/W1xcd1xcV10pKj9cXDF8XFx3KykpP1xccyopKlxcLz8+L2ksXG5cdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmFzcG5ldC50YWcuaW5zaWRlXG5cdFx0XHR9LFxuXHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmNzaGFycCB8fCB7fVxuXHRcdH1cblx0fVxufSk7XG5cbi8vIEhhY2tzIHRvIGZpeCBlYWdlciB0YWcgbWF0Y2hpbmcgZmluaXNoaW5nIHRvbyBlYXJseTogPHNjcmlwdCBzcmM9XCI8JSBGb28uQmFyICU+XCI+ID0+IDxzY3JpcHQgc3JjPVwiPCUgRm9vLkJhciAlPlxuaWYgKCBQcmlzbS5sYW5ndWFnZXMuYXNwbmV0LnN0eWxlICkge1xuXHRQcmlzbS5sYW5ndWFnZXMuYXNwbmV0LnN0eWxlLmluc2lkZS50YWcucGF0dGVybiA9IC88XFwvP3N0eWxlXFxzKig/OlxccytbXFx3Oi1dKyg/Oj0oPzooXCJ8JykoXFxcXD9bXFx3XFxXXSkqP1xcMXxcXHcrKSk/XFxzKikqXFwvPz4vaTtcblx0UHJpc20ubGFuZ3VhZ2VzLmFzcG5ldC5zdHlsZS5pbnNpZGUudGFnLmluc2lkZSA9IFByaXNtLmxhbmd1YWdlcy5hc3BuZXQudGFnLmluc2lkZTtcbn1cbmlmICggUHJpc20ubGFuZ3VhZ2VzLmFzcG5ldC5zY3JpcHQgKSB7XG5cdFByaXNtLmxhbmd1YWdlcy5hc3BuZXQuc2NyaXB0Lmluc2lkZS50YWcucGF0dGVybiA9IFByaXNtLmxhbmd1YWdlcy5hc3BuZXRbJ2FzcCBzY3JpcHQnXS5pbnNpZGUudGFnLnBhdHRlcm47XG5cdFByaXNtLmxhbmd1YWdlcy5hc3BuZXQuc2NyaXB0Lmluc2lkZS50YWcuaW5zaWRlID0gUHJpc20ubGFuZ3VhZ2VzLmFzcG5ldC50YWcuaW5zaWRlO1xufVxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWFwcGxlc2NyaXB0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5hcHBsZXNjcmlwdCA9IHtcblx0J2NvbW1lbnQnOiBbXG5cdFx0Ly8gQWxsb3cgb25lIGxldmVsIG9mIG5lc3Rpbmdcblx0XHQvXFwoXFwqKD86XFwoXFwqW1xcd1xcV10qP1xcKlxcKXxbXFx3XFxXXSkqP1xcKlxcKS8sXG5cdFx0Ly0tLisvLFxuXHRcdC8jLisvXG5cdF0sXG5cdCdzdHJpbmcnOiAvXCIoPzpcXFxcPy4pKj9cIi8sXG5cdCdudW1iZXInOiAvXFxiLT9cXGQqXFwuP1xcZCsoW0VlXS0/XFxkKyk/XFxiLyxcblx0J29wZXJhdG9yJzogW1xuXHRcdC9bJj3iiaDiiaTiiaUqK1xcLVxcL8O3Xl18Wzw+XT0/Lyxcblx0XHQvXFxiKD86KD86c3RhcnR8YmVnaW58ZW5kKXM/IHdpdGh8KD86KD86ZG9lcyBub3R8ZG9lc24ndCkgY29udGFpbnxjb250YWlucz8pfCg/OmlzfGlzbid0fGlzIG5vdCkgKD86aW58Y29udGFpbmVkIGJ5KXwoPzooPzppc3xpc24ndHxpcyBub3QpICk/KD86Z3JlYXRlcnxsZXNzKSB0aGFuKD86IG9yIGVxdWFsKT8oPzogdG8pP3woPzooPzpkb2VzIG5vdHxkb2Vzbid0KSBjb21lfGNvbWVzKSAoPzpiZWZvcmV8YWZ0ZXIpfCg/OmlzfGlzbid0fGlzIG5vdCkgZXF1YWwoPzogdG8pP3woPzooPzpkb2VzIG5vdHxkb2Vzbid0KSBlcXVhbHxlcXVhbHN8ZXF1YWwgdG98aXNuJ3R8aXMgbm90KXwoPzphICk/KD86cmVmKD86IHRvKT98cmVmZXJlbmNlIHRvKXwoPzphbmR8b3J8ZGl2fG1vZHxhc3xub3QpKVxcYi9cblx0XSxcblx0J2tleXdvcmQnOiAvXFxiKD86YWJvdXR8YWJvdmV8YWZ0ZXJ8YWdhaW5zdHxhcGFydCBmcm9tfGFyb3VuZHxhc2lkZSBmcm9tfGF0fGJhY2t8YmVmb3JlfGJlZ2lubmluZ3xiZWhpbmR8YmVsb3d8YmVuZWF0aHxiZXNpZGV8YmV0d2VlbnxidXR8Ynl8Y29uc2lkZXJpbmd8Y29udGludWV8Y29weXxkb2VzfGVpZ2h0aHxlbHNlfGVuZHxlcXVhbHxlcnJvcnxldmVyeXxleGl0fGZhbHNlfGZpZnRofGZpcnN0fGZvcnxmb3VydGh8ZnJvbXxmcm9udHxnZXR8Z2l2ZW58Z2xvYmFsfGlmfGlnbm9yaW5nfGlufGluc3RlYWQgb2Z8aW50b3xpc3xpdHxpdHN8bGFzdHxsb2NhbHxtZXxtaWRkbGV8bXl8bmludGh8b2Z8b258b250b3xvdXQgb2Z8b3Zlcnxwcm9wfHByb3BlcnR5fHB1dHxyZXBlYXR8cmV0dXJufHJldHVybmluZ3xzZWNvbmR8c2V0fHNldmVudGh8c2luY2V8c2l4dGh8c29tZXx0ZWxsfHRlbnRofHRoYXR8dGhlfHRoZW58dGhpcmR8dGhyb3VnaHx0aHJ1fHRpbWVvdXR8dGltZXN8dG98dHJhbnNhY3Rpb258dHJ1ZXx0cnl8dW50aWx8d2hlcmV8d2hpbGV8d2hvc2V8d2l0aHx3aXRob3V0KVxcYi8sXG5cdCdjbGFzcyc6IHtcblx0XHRwYXR0ZXJuOiAvXFxiKD86YWxpYXN8YXBwbGljYXRpb258Ym9vbGVhbnxjbGFzc3xjb25zdGFudHxkYXRlfGZpbGV8aW50ZWdlcnxsaXN0fG51bWJlcnxQT1NJWCBmaWxlfHJlYWx8cmVjb3JkfHJlZmVyZW5jZXxSR0IgY29sb3J8c2NyaXB0fHRleHR8Y2VudGltZXRyZXN8Y2VudGltZXRlcnN8ZmVldHxpbmNoZXN8a2lsb21ldHJlc3xraWxvbWV0ZXJzfG1ldHJlc3xtZXRlcnN8bWlsZXN8eWFyZHN8c3F1YXJlIGZlZXR8c3F1YXJlIGtpbG9tZXRyZXN8c3F1YXJlIGtpbG9tZXRlcnN8c3F1YXJlIG1ldHJlc3xzcXVhcmUgbWV0ZXJzfHNxdWFyZSBtaWxlc3xzcXVhcmUgeWFyZHN8Y3ViaWMgY2VudGltZXRyZXN8Y3ViaWMgY2VudGltZXRlcnN8Y3ViaWMgZmVldHxjdWJpYyBpbmNoZXN8Y3ViaWMgbWV0cmVzfGN1YmljIG1ldGVyc3xjdWJpYyB5YXJkc3xnYWxsb25zfGxpdHJlc3xsaXRlcnN8cXVhcnRzfGdyYW1zfGtpbG9ncmFtc3xvdW5jZXN8cG91bmRzfGRlZ3JlZXMgQ2Vsc2l1c3xkZWdyZWVzIEZhaHJlbmhlaXR8ZGVncmVlcyBLZWx2aW4pXFxiLyxcblx0XHRhbGlhczogJ2J1aWx0aW4nXG5cdH0sXG5cdCdwdW5jdHVhdGlvbic6IC9be30oKToswqzCq8K744CK44CLXS9cbn07XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tYXBsLmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5hcGwgPSB7XG5cdCdjb21tZW50JzogLyg/OuKNnXwjWyEgXSkuKiQvbSxcblx0J3N0cmluZyc6IC8nKD86W14nXFxyXFxuXXwnJykqJy8sXG5cdCdudW1iZXInOiAvwq8/KD86XFxkKlxcLj9cXGQrKD86ZVsrwq9dP1xcZCspP3zCr3ziiJ4pKD86asKvPyg/OlxcZCpcXC4/XFxkKyg/OmVbXFwrwq9dP1xcZCspP3zCr3ziiJ4pKT8vaSxcblx0J3N0YXRlbWVudCc6IC86W0EtWl1bYS16XVtBLVphLXpdKlxcYi8sXG5cdCdzeXN0ZW0tZnVuY3Rpb24nOiB7XG5cdFx0cGF0dGVybjogL+KOlVtBLVpdKy9pLFxuXHRcdGFsaWFzOiAnZnVuY3Rpb24nXG5cdH0sXG5cdCdjb25zdGFudCc6IC9b4o2s4oy+I+KOleKNnl0vLFxuXHQnZnVuY3Rpb24nOiAvWy0rw5fDt+KMiOKMiuKIo3zijbM/KuKNn+KXiyHijLk84omkPT7iiaXiiaDiiaHiiaLiiIrijbfiiKriiKl+4oio4oin4o2x4o2y4o20LOKNquKMveKKluKNieKGkeKGk+KKguKKg+KMt+KNi+KNkuKKpOKKpeKNleKNjuKKo+KKouKNgeKNguKJiOKNr+KGl8Kk4oaSXS8sXG5cdCdtb25hZGljLW9wZXJhdG9yJzoge1xuXHRcdHBhdHRlcm46IC9bXFxcXFxcL+KMv+KNgMKo4o2o4oy2JuKIpV0vLFxuXHRcdGFsaWFzOiAnb3BlcmF0b3InXG5cdH0sXG5cdCdkeWFkaWMtb3BlcmF0b3InOiB7XG5cdFx0cGF0dGVybjogL1su4o2j4o2g4o2k4oiY4oy4XS8sXG5cdFx0YWxpYXM6ICdvcGVyYXRvcidcblx0fSxcblx0J2Fzc2lnbm1lbnQnOiB7XG5cdFx0cGF0dGVybjogL+KGkC8sXG5cdFx0YWxpYXM6ICdrZXl3b3JkJ1xuXHR9LFxuXHQncHVuY3R1YXRpb24nOiAvW1xcWztcXF0oKeKXh+KLhF0vLFxuXHQnZGZuJzoge1xuXHRcdHBhdHRlcm46IC9be33ijbrijbXijbbijbniiIfijas6XS8sXG5cdFx0YWxpYXM6ICdidWlsdGluJ1xuXHR9XG59O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWFwYWNoZWNvbmYuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmFwYWNoZWNvbmYgPSB7XG5cdCdjb21tZW50JzogLyMuKi8sXG5cdCdkaXJlY3RpdmUtaW5saW5lJzoge1xuXHRcdHBhdHRlcm46IC9eKFxccyopXFxiKEFjY2VwdEZpbHRlcnxBY2NlcHRQYXRoSW5mb3xBY2Nlc3NGaWxlTmFtZXxBY3Rpb258QWRkQWx0fEFkZEFsdEJ5RW5jb2Rpbmd8QWRkQWx0QnlUeXBlfEFkZENoYXJzZXR8QWRkRGVmYXVsdENoYXJzZXR8QWRkRGVzY3JpcHRpb258QWRkRW5jb2Rpbmd8QWRkSGFuZGxlcnxBZGRJY29ufEFkZEljb25CeUVuY29kaW5nfEFkZEljb25CeVR5cGV8QWRkSW5wdXRGaWx0ZXJ8QWRkTGFuZ3VhZ2V8QWRkTW9kdWxlSW5mb3xBZGRPdXRwdXRGaWx0ZXJ8QWRkT3V0cHV0RmlsdGVyQnlUeXBlfEFkZFR5cGV8QWxpYXN8QWxpYXNNYXRjaHxBbGxvd3xBbGxvd0NPTk5FQ1R8QWxsb3dFbmNvZGVkU2xhc2hlc3xBbGxvd01ldGhvZHN8QWxsb3dPdmVycmlkZXxBbGxvd092ZXJyaWRlTGlzdHxBbm9ueW1vdXN8QW5vbnltb3VzX0xvZ0VtYWlsfEFub255bW91c19NdXN0R2l2ZUVtYWlsfEFub255bW91c19Ob1VzZXJJRHxBbm9ueW1vdXNfVmVyaWZ5RW1haWx8QXN5bmNSZXF1ZXN0V29ya2VyRmFjdG9yfEF1dGhCYXNpY0F1dGhvcml0YXRpdmV8QXV0aEJhc2ljRmFrZXxBdXRoQmFzaWNQcm92aWRlcnxBdXRoQmFzaWNVc2VEaWdlc3RBbGdvcml0aG18QXV0aERCRFVzZXJQV1F1ZXJ5fEF1dGhEQkRVc2VyUmVhbG1RdWVyeXxBdXRoREJNR3JvdXBGaWxlfEF1dGhEQk1UeXBlfEF1dGhEQk1Vc2VyRmlsZXxBdXRoRGlnZXN0QWxnb3JpdGhtfEF1dGhEaWdlc3REb21haW58QXV0aERpZ2VzdE5vbmNlTGlmZXRpbWV8QXV0aERpZ2VzdFByb3ZpZGVyfEF1dGhEaWdlc3RRb3B8QXV0aERpZ2VzdFNobWVtU2l6ZXxBdXRoRm9ybUF1dGhvcml0YXRpdmV8QXV0aEZvcm1Cb2R5fEF1dGhGb3JtRGlzYWJsZU5vU3RvcmV8QXV0aEZvcm1GYWtlQmFzaWNBdXRofEF1dGhGb3JtTG9jYXRpb258QXV0aEZvcm1Mb2dpblJlcXVpcmVkTG9jYXRpb258QXV0aEZvcm1Mb2dpblN1Y2Nlc3NMb2NhdGlvbnxBdXRoRm9ybUxvZ291dExvY2F0aW9ufEF1dGhGb3JtTWV0aG9kfEF1dGhGb3JtTWltZXR5cGV8QXV0aEZvcm1QYXNzd29yZHxBdXRoRm9ybVByb3ZpZGVyfEF1dGhGb3JtU2l0ZVBhc3NwaHJhc2V8QXV0aEZvcm1TaXplfEF1dGhGb3JtVXNlcm5hbWV8QXV0aEdyb3VwRmlsZXxBdXRoTERBUEF1dGhvcml6ZVByZWZpeHxBdXRoTERBUEJpbmRBdXRob3JpdGF0aXZlfEF1dGhMREFQQmluZEROfEF1dGhMREFQQmluZFBhc3N3b3JkfEF1dGhMREFQQ2hhcnNldENvbmZpZ3xBdXRoTERBUENvbXBhcmVBc1VzZXJ8QXV0aExEQVBDb21wYXJlRE5PblNlcnZlcnxBdXRoTERBUERlcmVmZXJlbmNlQWxpYXNlc3xBdXRoTERBUEdyb3VwQXR0cmlidXRlfEF1dGhMREFQR3JvdXBBdHRyaWJ1dGVJc0ROfEF1dGhMREFQSW5pdGlhbEJpbmRBc1VzZXJ8QXV0aExEQVBJbml0aWFsQmluZFBhdHRlcm58QXV0aExEQVBNYXhTdWJHcm91cERlcHRofEF1dGhMREFQUmVtb3RlVXNlckF0dHJpYnV0ZXxBdXRoTERBUFJlbW90ZVVzZXJJc0ROfEF1dGhMREFQU2VhcmNoQXNVc2VyfEF1dGhMREFQU3ViR3JvdXBBdHRyaWJ1dGV8QXV0aExEQVBTdWJHcm91cENsYXNzfEF1dGhMREFQVXJsfEF1dGhNZXJnaW5nfEF1dGhOYW1lfEF1dGhuQ2FjaGVDb250ZXh0fEF1dGhuQ2FjaGVFbmFibGV8QXV0aG5DYWNoZVByb3ZpZGVGb3J8QXV0aG5DYWNoZVNPQ2FjaGV8QXV0aG5DYWNoZVRpbWVvdXR8QXV0aG56RmNnaUNoZWNrQXV0aG5Qcm92aWRlcnxBdXRobnpGY2dpRGVmaW5lUHJvdmlkZXJ8QXV0aFR5cGV8QXV0aFVzZXJGaWxlfEF1dGh6REJETG9naW5Ub1JlZmVyZXJ8QXV0aHpEQkRRdWVyeXxBdXRoekRCRFJlZGlyZWN0UXVlcnl8QXV0aHpEQk1UeXBlfEF1dGh6U2VuZEZvcmJpZGRlbk9uRmFpbHVyZXxCYWxhbmNlckdyb3d0aHxCYWxhbmNlckluaGVyaXR8QmFsYW5jZXJNZW1iZXJ8QmFsYW5jZXJQZXJzaXN0fEJyb3dzZXJNYXRjaHxCcm93c2VyTWF0Y2hOb0Nhc2V8QnVmZmVyZWRMb2dzfEJ1ZmZlclNpemV8Q2FjaGVEZWZhdWx0RXhwaXJlfENhY2hlRGV0YWlsSGVhZGVyfENhY2hlRGlyTGVuZ3RofENhY2hlRGlyTGV2ZWxzfENhY2hlRGlzYWJsZXxDYWNoZUVuYWJsZXxDYWNoZUZpbGV8Q2FjaGVIZWFkZXJ8Q2FjaGVJZ25vcmVDYWNoZUNvbnRyb2x8Q2FjaGVJZ25vcmVIZWFkZXJzfENhY2hlSWdub3JlTm9MYXN0TW9kfENhY2hlSWdub3JlUXVlcnlTdHJpbmd8Q2FjaGVJZ25vcmVVUkxTZXNzaW9uSWRlbnRpZmllcnN8Q2FjaGVLZXlCYXNlVVJMfENhY2hlTGFzdE1vZGlmaWVkRmFjdG9yfENhY2hlTG9ja3xDYWNoZUxvY2tNYXhBZ2V8Q2FjaGVMb2NrUGF0aHxDYWNoZU1heEV4cGlyZXxDYWNoZU1heEZpbGVTaXplfENhY2hlTWluRXhwaXJlfENhY2hlTWluRmlsZVNpemV8Q2FjaGVOZWdvdGlhdGVkRG9jc3xDYWNoZVF1aWNrSGFuZGxlcnxDYWNoZVJlYWRTaXplfENhY2hlUmVhZFRpbWV8Q2FjaGVSb290fENhY2hlU29jYWNoZXxDYWNoZVNvY2FjaGVNYXhTaXplfENhY2hlU29jYWNoZU1heFRpbWV8Q2FjaGVTb2NhY2hlTWluVGltZXxDYWNoZVNvY2FjaGVSZWFkU2l6ZXxDYWNoZVNvY2FjaGVSZWFkVGltZXxDYWNoZVN0YWxlT25FcnJvcnxDYWNoZVN0b3JlRXhwaXJlZHxDYWNoZVN0b3JlTm9TdG9yZXxDYWNoZVN0b3JlUHJpdmF0ZXxDR0lEU2NyaXB0VGltZW91dHxDR0lNYXBFeHRlbnNpb258Q2hhcnNldERlZmF1bHR8Q2hhcnNldE9wdGlvbnN8Q2hhcnNldFNvdXJjZUVuY3xDaGVja0Nhc2VPbmx5fENoZWNrU3BlbGxpbmd8Q2hyb290RGlyfENvbnRlbnREaWdlc3R8Q29va2llRG9tYWlufENvb2tpZUV4cGlyZXN8Q29va2llTmFtZXxDb29raWVTdHlsZXxDb29raWVUcmFja2luZ3xDb3JlRHVtcERpcmVjdG9yeXxDdXN0b21Mb2d8RGF2fERhdkRlcHRoSW5maW5pdHl8RGF2R2VuZXJpY0xvY2tEQnxEYXZMb2NrREJ8RGF2TWluVGltZW91dHxEQkRFeHB0aW1lfERCREluaXRTUUx8REJES2VlcHxEQkRNYXh8REJETWlufERCRFBhcmFtc3xEQkRQZXJzaXN0fERCRFByZXBhcmVTUUx8REJEcml2ZXJ8RGVmYXVsdEljb258RGVmYXVsdExhbmd1YWdlfERlZmF1bHRSdW50aW1lRGlyfERlZmF1bHRUeXBlfERlZmluZXxEZWZsYXRlQnVmZmVyU2l6ZXxEZWZsYXRlQ29tcHJlc3Npb25MZXZlbHxEZWZsYXRlRmlsdGVyTm90ZXxEZWZsYXRlSW5mbGF0ZUxpbWl0UmVxdWVzdEJvZHl8RGVmbGF0ZUluZmxhdGVSYXRpb0J1cnN0fERlZmxhdGVJbmZsYXRlUmF0aW9MaW1pdHxEZWZsYXRlTWVtTGV2ZWx8RGVmbGF0ZVdpbmRvd1NpemV8RGVueXxEaXJlY3RvcnlDaGVja0hhbmRsZXJ8RGlyZWN0b3J5SW5kZXh8RGlyZWN0b3J5SW5kZXhSZWRpcmVjdHxEaXJlY3RvcnlTbGFzaHxEb2N1bWVudFJvb3R8RFRyYWNlUHJpdmlsZWdlc3xEdW1wSU9JbnB1dHxEdW1wSU9PdXRwdXR8RW5hYmxlRXhjZXB0aW9uSG9va3xFbmFibGVNTUFQfEVuYWJsZVNlbmRmaWxlfEVycm9yfEVycm9yRG9jdW1lbnR8RXJyb3JMb2d8RXJyb3JMb2dGb3JtYXR8RXhhbXBsZXxFeHBpcmVzQWN0aXZlfEV4cGlyZXNCeVR5cGV8RXhwaXJlc0RlZmF1bHR8RXh0ZW5kZWRTdGF0dXN8RXh0RmlsdGVyRGVmaW5lfEV4dEZpbHRlck9wdGlvbnN8RmFsbGJhY2tSZXNvdXJjZXxGaWxlRVRhZ3xGaWx0ZXJDaGFpbnxGaWx0ZXJEZWNsYXJlfEZpbHRlclByb3RvY29sfEZpbHRlclByb3ZpZGVyfEZpbHRlclRyYWNlfEZvcmNlTGFuZ3VhZ2VQcmlvcml0eXxGb3JjZVR5cGV8Rm9yZW5zaWNMb2d8R3Byb2ZEaXJ8R3JhY2VmdWxTaHV0ZG93blRpbWVvdXR8R3JvdXB8SGVhZGVyfEhlYWRlck5hbWV8SGVhcnRiZWF0QWRkcmVzc3xIZWFydGJlYXRMaXN0ZW58SGVhcnRiZWF0TWF4U2VydmVyc3xIZWFydGJlYXRTdG9yYWdlfEhlYXJ0YmVhdFN0b3JhZ2V8SG9zdG5hbWVMb29rdXBzfElkZW50aXR5Q2hlY2t8SWRlbnRpdHlDaGVja1RpbWVvdXR8SW1hcEJhc2V8SW1hcERlZmF1bHR8SW1hcE1lbnV8SW5jbHVkZXxJbmNsdWRlT3B0aW9uYWx8SW5kZXhIZWFkSW5zZXJ0fEluZGV4SWdub3JlfEluZGV4SWdub3JlUmVzZXR8SW5kZXhPcHRpb25zfEluZGV4T3JkZXJEZWZhdWx0fEluZGV4U3R5bGVTaGVldHxJbnB1dFNlZHxJU0FQSUFwcGVuZExvZ1RvRXJyb3JzfElTQVBJQXBwZW5kTG9nVG9RdWVyeXxJU0FQSUNhY2hlRmlsZXxJU0FQSUZha2VBc3luY3xJU0FQSUxvZ05vdFN1cHBvcnRlZHxJU0FQSVJlYWRBaGVhZEJ1ZmZlcnxLZWVwQWxpdmV8S2VlcEFsaXZlVGltZW91dHxLZXB0Qm9keVNpemV8TGFuZ3VhZ2VQcmlvcml0eXxMREFQQ2FjaGVFbnRyaWVzfExEQVBDYWNoZVRUTHxMREFQQ29ubmVjdGlvblBvb2xUVEx8TERBUENvbm5lY3Rpb25UaW1lb3V0fExEQVBMaWJyYXJ5RGVidWd8TERBUE9wQ2FjaGVFbnRyaWVzfExEQVBPcENhY2hlVFRMfExEQVBSZWZlcnJhbEhvcExpbWl0fExEQVBSZWZlcnJhbHN8TERBUFJldHJpZXN8TERBUFJldHJ5RGVsYXl8TERBUFNoYXJlZENhY2hlRmlsZXxMREFQU2hhcmVkQ2FjaGVTaXplfExEQVBUaW1lb3V0fExEQVBUcnVzdGVkQ2xpZW50Q2VydHxMREFQVHJ1c3RlZEdsb2JhbENlcnR8TERBUFRydXN0ZWRNb2RlfExEQVBWZXJpZnlTZXJ2ZXJDZXJ0fExpbWl0SW50ZXJuYWxSZWN1cnNpb258TGltaXRSZXF1ZXN0Qm9keXxMaW1pdFJlcXVlc3RGaWVsZHN8TGltaXRSZXF1ZXN0RmllbGRTaXplfExpbWl0UmVxdWVzdExpbmV8TGltaXRYTUxSZXF1ZXN0Qm9keXxMaXN0ZW58TGlzdGVuQmFja0xvZ3xMb2FkRmlsZXxMb2FkTW9kdWxlfExvZ0Zvcm1hdHxMb2dMZXZlbHxMb2dNZXNzYWdlfEx1YUF1dGh6UHJvdmlkZXJ8THVhQ29kZUNhY2hlfEx1YUhvb2tBY2Nlc3NDaGVja2VyfEx1YUhvb2tBdXRoQ2hlY2tlcnxMdWFIb29rQ2hlY2tVc2VySUR8THVhSG9va0ZpeHVwc3xMdWFIb29rSW5zZXJ0RmlsdGVyfEx1YUhvb2tMb2d8THVhSG9va01hcFRvU3RvcmFnZXxMdWFIb29rVHJhbnNsYXRlTmFtZXxMdWFIb29rVHlwZUNoZWNrZXJ8THVhSW5oZXJpdHxMdWFJbnB1dEZpbHRlcnxMdWFNYXBIYW5kbGVyfEx1YU91dHB1dEZpbHRlcnxMdWFQYWNrYWdlQ1BhdGh8THVhUGFja2FnZVBhdGh8THVhUXVpY2tIYW5kbGVyfEx1YVJvb3R8THVhU2NvcGV8TWF4Q29ubmVjdGlvbnNQZXJDaGlsZHxNYXhLZWVwQWxpdmVSZXF1ZXN0c3xNYXhNZW1GcmVlfE1heFJhbmdlT3ZlcmxhcHN8TWF4UmFuZ2VSZXZlcnNhbHN8TWF4UmFuZ2VzfE1heFJlcXVlc3RXb3JrZXJzfE1heFNwYXJlU2VydmVyc3xNYXhTcGFyZVRocmVhZHN8TWF4VGhyZWFkc3xNZXJnZVRyYWlsZXJzfE1ldGFEaXJ8TWV0YUZpbGVzfE1ldGFTdWZmaXh8TWltZU1hZ2ljRmlsZXxNaW5TcGFyZVNlcnZlcnN8TWluU3BhcmVUaHJlYWRzfE1NYXBGaWxlfE1vZGVtU3RhbmRhcmR8TW9kTWltZVVzZVBhdGhJbmZvfE11bHRpdmlld3NNYXRjaHxNdXRleHxOYW1lVmlydHVhbEhvc3R8Tm9Qcm94eXxOV1NTTFRydXN0ZWRDZXJ0c3xOV1NTTFVwZ3JhZGVhYmxlfE9wdGlvbnN8T3JkZXJ8T3V0cHV0U2VkfFBhc3NFbnZ8UGlkRmlsZXxQcml2aWxlZ2VzTW9kZXxQcm90b2NvbHxQcm90b2NvbEVjaG98UHJveHlBZGRIZWFkZXJzfFByb3h5QmFkSGVhZGVyfFByb3h5QmxvY2t8UHJveHlEb21haW58UHJveHlFcnJvck92ZXJyaWRlfFByb3h5RXhwcmVzc0RCTUZpbGV8UHJveHlFeHByZXNzREJNVHlwZXxQcm94eUV4cHJlc3NFbmFibGV8UHJveHlGdHBEaXJDaGFyc2V0fFByb3h5RnRwRXNjYXBlV2lsZGNhcmRzfFByb3h5RnRwTGlzdE9uV2lsZGNhcmR8UHJveHlIVE1MQnVmU2l6ZXxQcm94eUhUTUxDaGFyc2V0T3V0fFByb3h5SFRNTERvY1R5cGV8UHJveHlIVE1MRW5hYmxlfFByb3h5SFRNTEV2ZW50c3xQcm94eUhUTUxFeHRlbmRlZHxQcm94eUhUTUxGaXh1cHN8UHJveHlIVE1MSW50ZXJwfFByb3h5SFRNTExpbmtzfFByb3h5SFRNTE1ldGF8UHJveHlIVE1MU3RyaXBDb21tZW50c3xQcm94eUhUTUxVUkxNYXB8UHJveHlJT0J1ZmZlclNpemV8UHJveHlNYXhGb3J3YXJkc3xQcm94eVBhc3N8UHJveHlQYXNzSW5oZXJpdHxQcm94eVBhc3NJbnRlcnBvbGF0ZUVudnxQcm94eVBhc3NNYXRjaHxQcm94eVBhc3NSZXZlcnNlfFByb3h5UGFzc1JldmVyc2VDb29raWVEb21haW58UHJveHlQYXNzUmV2ZXJzZUNvb2tpZVBhdGh8UHJveHlQcmVzZXJ2ZUhvc3R8UHJveHlSZWNlaXZlQnVmZmVyU2l6ZXxQcm94eVJlbW90ZXxQcm94eVJlbW90ZU1hdGNofFByb3h5UmVxdWVzdHN8UHJveHlTQ0dJSW50ZXJuYWxSZWRpcmVjdHxQcm94eVNDR0lTZW5kZmlsZXxQcm94eVNldHxQcm94eVNvdXJjZUFkZHJlc3N8UHJveHlTdGF0dXN8UHJveHlUaW1lb3V0fFByb3h5VmlhfFJlYWRtZU5hbWV8UmVjZWl2ZUJ1ZmZlclNpemV8UmVkaXJlY3R8UmVkaXJlY3RNYXRjaHxSZWRpcmVjdFBlcm1hbmVudHxSZWRpcmVjdFRlbXB8UmVmbGVjdG9ySGVhZGVyfFJlbW90ZUlQSGVhZGVyfFJlbW90ZUlQSW50ZXJuYWxQcm94eXxSZW1vdGVJUEludGVybmFsUHJveHlMaXN0fFJlbW90ZUlQUHJveGllc0hlYWRlcnxSZW1vdGVJUFRydXN0ZWRQcm94eXxSZW1vdGVJUFRydXN0ZWRQcm94eUxpc3R8UmVtb3ZlQ2hhcnNldHxSZW1vdmVFbmNvZGluZ3xSZW1vdmVIYW5kbGVyfFJlbW92ZUlucHV0RmlsdGVyfFJlbW92ZUxhbmd1YWdlfFJlbW92ZU91dHB1dEZpbHRlcnxSZW1vdmVUeXBlfFJlcXVlc3RIZWFkZXJ8UmVxdWVzdFJlYWRUaW1lb3V0fFJlcXVpcmV8UmV3cml0ZUJhc2V8UmV3cml0ZUNvbmR8UmV3cml0ZUVuZ2luZXxSZXdyaXRlTWFwfFJld3JpdGVPcHRpb25zfFJld3JpdGVSdWxlfFJMaW1pdENQVXxSTGltaXRNRU18UkxpbWl0TlBST0N8U2F0aXNmeXxTY29yZUJvYXJkRmlsZXxTY3JpcHR8U2NyaXB0QWxpYXN8U2NyaXB0QWxpYXNNYXRjaHxTY3JpcHRJbnRlcnByZXRlclNvdXJjZXxTY3JpcHRMb2d8U2NyaXB0TG9nQnVmZmVyfFNjcmlwdExvZ0xlbmd0aHxTY3JpcHRTb2NrfFNlY3VyZUxpc3RlbnxTZWVSZXF1ZXN0VGFpbHxTZW5kQnVmZmVyU2l6ZXxTZXJ2ZXJBZG1pbnxTZXJ2ZXJBbGlhc3xTZXJ2ZXJMaW1pdHxTZXJ2ZXJOYW1lfFNlcnZlclBhdGh8U2VydmVyUm9vdHxTZXJ2ZXJTaWduYXR1cmV8U2VydmVyVG9rZW5zfFNlc3Npb258U2Vzc2lvbkNvb2tpZU5hbWV8U2Vzc2lvbkNvb2tpZU5hbWUyfFNlc3Npb25Db29raWVSZW1vdmV8U2Vzc2lvbkNyeXB0b0NpcGhlcnxTZXNzaW9uQ3J5cHRvRHJpdmVyfFNlc3Npb25DcnlwdG9QYXNzcGhyYXNlfFNlc3Npb25DcnlwdG9QYXNzcGhyYXNlRmlsZXxTZXNzaW9uREJEQ29va2llTmFtZXxTZXNzaW9uREJEQ29va2llTmFtZTJ8U2Vzc2lvbkRCRENvb2tpZVJlbW92ZXxTZXNzaW9uREJERGVsZXRlTGFiZWx8U2Vzc2lvbkRCREluc2VydExhYmVsfFNlc3Npb25EQkRQZXJVc2VyfFNlc3Npb25EQkRTZWxlY3RMYWJlbHxTZXNzaW9uREJEVXBkYXRlTGFiZWx8U2Vzc2lvbkVudnxTZXNzaW9uRXhjbHVkZXxTZXNzaW9uSGVhZGVyfFNlc3Npb25JbmNsdWRlfFNlc3Npb25NYXhBZ2V8U2V0RW52fFNldEVudklmfFNldEVudklmRXhwcnxTZXRFbnZJZk5vQ2FzZXxTZXRIYW5kbGVyfFNldElucHV0RmlsdGVyfFNldE91dHB1dEZpbHRlcnxTU0lFbmRUYWd8U1NJRXJyb3JNc2d8U1NJRVRhZ3xTU0lMYXN0TW9kaWZpZWR8U1NJTGVnYWN5RXhwclBhcnNlcnxTU0lTdGFydFRhZ3xTU0lUaW1lRm9ybWF0fFNTSVVuZGVmaW5lZEVjaG98U1NMQ0FDZXJ0aWZpY2F0ZUZpbGV8U1NMQ0FDZXJ0aWZpY2F0ZVBhdGh8U1NMQ0FETlJlcXVlc3RGaWxlfFNTTENBRE5SZXF1ZXN0UGF0aHxTU0xDQVJldm9jYXRpb25DaGVja3xTU0xDQVJldm9jYXRpb25GaWxlfFNTTENBUmV2b2NhdGlvblBhdGh8U1NMQ2VydGlmaWNhdGVDaGFpbkZpbGV8U1NMQ2VydGlmaWNhdGVGaWxlfFNTTENlcnRpZmljYXRlS2V5RmlsZXxTU0xDaXBoZXJTdWl0ZXxTU0xDb21wcmVzc2lvbnxTU0xDcnlwdG9EZXZpY2V8U1NMRW5naW5lfFNTTEZJUFN8U1NMSG9ub3JDaXBoZXJPcmRlcnxTU0xJbnNlY3VyZVJlbmVnb3RpYXRpb258U1NMT0NTUERlZmF1bHRSZXNwb25kZXJ8U1NMT0NTUEVuYWJsZXxTU0xPQ1NQT3ZlcnJpZGVSZXNwb25kZXJ8U1NMT0NTUFJlc3BvbmRlclRpbWVvdXR8U1NMT0NTUFJlc3BvbnNlTWF4QWdlfFNTTE9DU1BSZXNwb25zZVRpbWVTa2V3fFNTTE9DU1BVc2VSZXF1ZXN0Tm9uY2V8U1NMT3BlblNTTENvbmZDbWR8U1NMT3B0aW9uc3xTU0xQYXNzUGhyYXNlRGlhbG9nfFNTTFByb3RvY29sfFNTTFByb3h5Q0FDZXJ0aWZpY2F0ZUZpbGV8U1NMUHJveHlDQUNlcnRpZmljYXRlUGF0aHxTU0xQcm94eUNBUmV2b2NhdGlvbkNoZWNrfFNTTFByb3h5Q0FSZXZvY2F0aW9uRmlsZXxTU0xQcm94eUNBUmV2b2NhdGlvblBhdGh8U1NMUHJveHlDaGVja1BlZXJDTnxTU0xQcm94eUNoZWNrUGVlckV4cGlyZXxTU0xQcm94eUNoZWNrUGVlck5hbWV8U1NMUHJveHlDaXBoZXJTdWl0ZXxTU0xQcm94eUVuZ2luZXxTU0xQcm94eU1hY2hpbmVDZXJ0aWZpY2F0ZUNoYWluRmlsZXxTU0xQcm94eU1hY2hpbmVDZXJ0aWZpY2F0ZUZpbGV8U1NMUHJveHlNYWNoaW5lQ2VydGlmaWNhdGVQYXRofFNTTFByb3h5UHJvdG9jb2x8U1NMUHJveHlWZXJpZnl8U1NMUHJveHlWZXJpZnlEZXB0aHxTU0xSYW5kb21TZWVkfFNTTFJlbmVnQnVmZmVyU2l6ZXxTU0xSZXF1aXJlfFNTTFJlcXVpcmVTU0x8U1NMU2Vzc2lvbkNhY2hlfFNTTFNlc3Npb25DYWNoZVRpbWVvdXR8U1NMU2Vzc2lvblRpY2tldEtleUZpbGV8U1NMU1JQVW5rbm93blVzZXJTZWVkfFNTTFNSUFZlcmlmaWVyRmlsZXxTU0xTdGFwbGluZ0NhY2hlfFNTTFN0YXBsaW5nRXJyb3JDYWNoZVRpbWVvdXR8U1NMU3RhcGxpbmdGYWtlVHJ5TGF0ZXJ8U1NMU3RhcGxpbmdGb3JjZVVSTHxTU0xTdGFwbGluZ1Jlc3BvbmRlclRpbWVvdXR8U1NMU3RhcGxpbmdSZXNwb25zZU1heEFnZXxTU0xTdGFwbGluZ1Jlc3BvbnNlVGltZVNrZXd8U1NMU3RhcGxpbmdSZXR1cm5SZXNwb25kZXJFcnJvcnN8U1NMU3RhcGxpbmdTdGFuZGFyZENhY2hlVGltZW91dHxTU0xTdHJpY3RTTklWSG9zdENoZWNrfFNTTFVzZXJOYW1lfFNTTFVzZVN0YXBsaW5nfFNTTFZlcmlmeUNsaWVudHxTU0xWZXJpZnlEZXB0aHxTdGFydFNlcnZlcnN8U3RhcnRUaHJlYWRzfFN1YnN0aXR1dGV8U3VleGVjfFN1ZXhlY1VzZXJHcm91cHxUaHJlYWRMaW1pdHxUaHJlYWRzUGVyQ2hpbGR8VGhyZWFkU3RhY2tTaXplfFRpbWVPdXR8VHJhY2VFbmFibGV8VHJhbnNmZXJMb2d8VHlwZXNDb25maWd8VW5EZWZpbmV8VW5kZWZNYWNyb3xVbnNldEVudnxVc2V8VXNlQ2Fub25pY2FsTmFtZXxVc2VDYW5vbmljYWxQaHlzaWNhbFBvcnR8VXNlcnxVc2VyRGlyfFZIb3N0Q0dJTW9kZXxWSG9zdENHSVByaXZzfFZIb3N0R3JvdXB8Vkhvc3RQcml2c3xWSG9zdFNlY3VyZXxWSG9zdFVzZXJ8VmlydHVhbERvY3VtZW50Um9vdHxWaXJ0dWFsRG9jdW1lbnRSb290SVB8VmlydHVhbFNjcmlwdEFsaWFzfFZpcnR1YWxTY3JpcHRBbGlhc0lQfFdhdGNoZG9nSW50ZXJ2YWx8WEJpdEhhY2t8eG1sMkVuY0FsaWFzfHhtbDJFbmNEZWZhdWx0fHhtbDJTdGFydFBhcnNlKVxcYi9taSxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiAncHJvcGVydHknXG5cdH0sXG5cdCdkaXJlY3RpdmUtYmxvY2snOiB7XG5cdFx0cGF0dGVybjogLzxcXC8/XFxiKEF1dGhuUHJvdmlkZXJBbGlhc3xBdXRoelByb3ZpZGVyQWxpYXN8RGlyZWN0b3J5fERpcmVjdG9yeU1hdGNofEVsc2V8RWxzZUlmfEZpbGVzfEZpbGVzTWF0Y2h8SWZ8SWZEZWZpbmV8SWZNb2R1bGV8SWZWZXJzaW9ufExpbWl0fExpbWl0RXhjZXB0fExvY2F0aW9ufExvY2F0aW9uTWF0Y2h8TWFjcm98UHJveHl8UmVxdWlyZUFsbHxSZXF1aXJlQW55fFJlcXVpcmVOb25lfFZpcnR1YWxIb3N0KVxcYiAqLio+L2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnZGlyZWN0aXZlLWJsb2NrJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvXjxcXC8/XFx3Ky8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9ePFxcLz8vXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFsaWFzOiAndGFnJ1xuXHRcdFx0fSxcblx0XHRcdCdkaXJlY3RpdmUtYmxvY2stcGFyYW1ldGVyJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvLipbXj5dLyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogLzovLFxuXHRcdFx0XHRcdCdzdHJpbmcnOiB7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvKFwifCcpLipcXDEvLFxuXHRcdFx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0XHRcdCd2YXJpYWJsZSc6IC8oXFwkfCUpXFx7PyhcXHdcXC4/KFxcK3xcXC18Oik/KStcXH0/L1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0YWxpYXM6ICdhdHRyLXZhbHVlJ1xuXHRcdFx0fSxcblx0XHRcdCdwdW5jdHVhdGlvbic6IC8+L1xuXHRcdH0sXG5cdFx0YWxpYXM6ICd0YWcnXG5cdH0sXG5cdCdkaXJlY3RpdmUtZmxhZ3MnOiB7XG5cdFx0cGF0dGVybjogL1xcWyhcXHcsPykrXFxdLyxcblx0XHRhbGlhczogJ2tleXdvcmQnXG5cdH0sXG5cdCdzdHJpbmcnOiB7XG5cdFx0cGF0dGVybjogLyhcInwnKS4qXFwxLyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCd2YXJpYWJsZSc6IC8oXFwkfCUpXFx7PyhcXHdcXC4/KFxcK3xcXC18Oik/KStcXH0/L1xuXHRcdH1cblx0fSxcblx0J3ZhcmlhYmxlJzogLyhcXCR8JSlcXHs/KFxcd1xcLj8oXFwrfFxcLXw6KT8pK1xcfT8vLFxuXHQncmVnZXgnOiAvXFxePy4qXFwkfFxcXi4qXFwkPy9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1hY3Rpb25zY3JpcHQuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmFjdGlvbnNjcmlwdCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2phdmFzY3JpcHQnLCAge1xuXHQna2V5d29yZCc6IC9cXGIoPzphc3xicmVha3xjYXNlfGNhdGNofGNsYXNzfGNvbnN0fGRlZmF1bHR8ZGVsZXRlfGRvfGVsc2V8ZXh0ZW5kc3xmaW5hbGx5fGZvcnxmdW5jdGlvbnxpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnxpbnN0YW5jZW9mfGludGVyZmFjZXxpbnRlcm5hbHxpc3xuYXRpdmV8bmV3fG51bGx8cGFja2FnZXxwcml2YXRlfHByb3RlY3RlZHxwdWJsaWN8cmV0dXJufHN1cGVyfHN3aXRjaHx0aGlzfHRocm93fHRyeXx0eXBlb2Z8dXNlfHZhcnx2b2lkfHdoaWxlfHdpdGh8ZHluYW1pY3xlYWNofGZpbmFsfGdldHxpbmNsdWRlfG5hbWVzcGFjZXxuYXRpdmV8b3ZlcnJpZGV8c2V0fHN0YXRpYylcXGIvLFxuXHQnb3BlcmF0b3InOiAvXFwrXFwrfC0tfCg/OlsrXFwtKlxcLyVeXXwmJj98XFx8XFx8P3w8PD98Pj4/Pj98WyE9XT0/KT0/fFt+P0BdL1xufSk7XG5QcmlzbS5sYW5ndWFnZXMuYWN0aW9uc2NyaXB0WydjbGFzcy1uYW1lJ10uYWxpYXMgPSAnZnVuY3Rpb24nO1xuXG5pZiAoUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cCkge1xuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdhY3Rpb25zY3JpcHQnLCAnc3RyaW5nJywge1xuXHRcdCd4bWwnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W14uXSk8XFwvP1xcdysoPzpcXHMrW15cXHM+XFwvPV0rPShcInwnKSg/OlxcXFxcXDF8XFxcXD8oPyFcXDEpW1xcd1xcV10pKlxcMikqXFxzKlxcLz8+Lyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cFxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tYWJhcC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuYWJhcCA9IHtcblx0J2NvbW1lbnQnOiAvXlxcKi4qL20sXG5cdCdzdHJpbmcnIDogLyhgfCcpKFxcXFw/LikqP1xcMS9tLFxuXHQnc3RyaW5nLXRlbXBsYXRlJzoge1xuXHRcdHBhdHRlcm46IC8oXFx8fFxcfSkoXFxcXD8uKSo/KD89XFx8fFxceykvLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0YWxpYXM6ICdzdHJpbmcnXG5cdH0sXG5cdC8qIEVuZCBPZiBMaW5lIGNvbW1lbnRzIHNob3VsZCBub3QgaW50ZXJmZXJlIHdpdGggc3RyaW5ncyB3aGVuIHRoZSAgXG5cdHF1b3RlIGNoYXJhY3RlciBvY2N1cnMgd2l0aGluIHRoZW0uIFdlIGFzc3VtZSBhIHN0cmluZyBiZWluZyBoaWdobGlnaHRlZFxuXHRpbnNpZGUgYW4gRU9MIGNvbW1lbnQgaXMgbW9yZSBhY2NlcHRhYmxlIHRoYW4gdGhlIG9wcG9zaXRlLlxuXHQqL1xuXHQnZW9sLWNvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFxccylcIi4qL20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRhbGlhczogJ2NvbW1lbnQnXG5cdH0sXG5cdCdrZXl3b3JkJyA6IHtcblx0XHRwYXR0ZXJuOiAvKFxcc3xcXC58XikoPzpTQ0lFTlRJRklDX1dJVEhfTEVBRElOR19aRVJPfFNDQUxFX1BSRVNFUlZJTkdfU0NJRU5USUZJQ3xSTUNfQ09NTVVOSUNBVElPTl9GQUlMVVJFfEVORC1FTkhBTkNFTUVOVC1TRUNUSU9OfE1VTFRJUExZLUNPUlJFU1BPTkRJTkd8U1VCVFJBQ1QtQ09SUkVTUE9ORElOR3xWRVJJRklDQVRJT04tTUVTU0FHRXxESVZJREUtQ09SUkVTUE9ORElOR3xFTkhBTkNFTUVOVC1TRUNUSU9OfENVUlJFTkNZX0NPTlZFUlNJT058Uk1DX1NZU1RFTV9GQUlMVVJFfFNUQVJULU9GLVNFTEVDVElPTnxNT1ZFLUNPUlJFU1BPTkRJTkd8Uk1DX0lOVkFMSURfU1RBVFVTfENVU1RPTUVSLUZVTkNUSU9OfEVORC1PRi1ERUZJTklUSU9OfEVOSEFOQ0VNRU5ULVBPSU5UfFNZU1RFTS1FWENFUFRJT05TfEFERC1DT1JSRVNQT05ESU5HfFNDQUxFX1BSRVNFUlZJTkd8U0VMRUNUSU9OLVNDUkVFTnxDVVJTT1ItU0VMRUNUSU9OfEVORC1PRi1TRUxFQ1RJT058TE9BRC1PRi1QUk9HUkFNfFNDUk9MTC1CT1VOREFSWXxTRUxFQ1RJT04tVEFCTEV8RVhDRVBUSU9OLVRBQkxFfElNUExFTUVOVEFUSU9OU3xQQVJBTUVURVItVEFCTEV8UklHSFQtSlVTVElGSUVEfFVOSVRfQ09OVkVSU0lPTnxBVVRIT1JJVFktQ0hFQ0t8TElTVC1QUk9DRVNTSU5HfFNJR05fQVNfUE9TVEZJWHxDT0xfQkFDS0dST1VORHxJTVBMRU1FTlRBVElPTnxJTlRFUkZBQ0UtUE9PTHxUUkFOU0ZPUk1BVElPTnxJREVOVElGSUNBVElPTnxFTkRFTkhBTkNFTUVOVHxMSU5FLVNFTEVDVElPTnxJTklUSUFMSVpBVElPTnxMRUZULUpVU1RJRklFRHxTRUxFQ1QtT1BUSU9OU3xTRUxFQ1RJT04tU0VUU3xDT01NVU5JQ0FUSU9OfENPUlJFU1BPTkRJTkd8REVDSU1BTF9TSElGVHxQUklOVC1DT05UUk9MfFZBTFVFLVJFUVVFU1R8Q0hBSU4tUkVRVUVTVHxGVU5DVElPTi1QT09MfEZJRUxELVNZTUJPTFN8RlVOQ1RJT05BTElUWXxJTlZFUlRFRC1EQVRFfFNFTEVDVElPTi1TRVR8Q0xBU1MtTUVUSE9EU3xPVVRQVVQtTEVOR1RIfENMQVNTLUNPRElOR3xDT0xfTkVHQVRJVkV8RVJST1JNRVNTQUdFfEZJRUxELUdST1VQU3xIRUxQLVJFUVVFU1R8Tk8tRVhURU5TSU9OfE5PLVRPUE9GUEFHRXxSRURFRklOSVRJT058RElTUExBWS1NT0RFfEVORElOVEVSRkFDRXxFWElULUNPTU1BTkR8RklFTEQtU1lNQk9MfE5PLVNDUk9MTElOR3xTSE9SVERVTVAtSUR8QUNDRVNTUE9MSUNZfENMQVNTLUVWRU5UU3xDT0xfUE9TSVRJVkV8REVDTEFSQVRJT05TfEVOSEFOQ0VNRU5UU3xGSUxURVItVEFCTEV8U1dJVENIU1RBVEVTfFNZTlRBWC1DSEVDS3xUUkFOU1BPUlRJTkd8QVNZTkNIUk9OT1VTfFNZTlRBWC1UUkFDRXxUT0tFTklaQVRJT058VVNFUi1DT01NQU5EfFdJVEgtSEVBRElOR3xBQkFQLVNPVVJDRXxCUkVBSy1QT0lOVHxDSEFJTi1JTlBVVHxDT01QUkVTU0lPTnxGSVhFRC1QT0lOVHxORVctU0VDVElPTnxOT04tVU5JQ09ERXxPQ0NVUlJFTkNFU3xSRVNQT05TSUJMRXxTWVNURU0tQ0FMTHxUUkFDRS1UQUJMRXxBQkJSRVZJQVRFRHxDSEFSLVRPLUhFWHxFTkQtT0YtRklMRXxFTkRGVU5DVElPTnxFTlZJUk9OTUVOVHxBU1NPQ0lBVElPTnxDT0xfSEVBRElOR3xFRElUT1ItQ0FMTHxFTkQtT0YtUEFHRXxFTkdJTkVFUklOR3xJTVBMRU1FTlRFRHxJTlRFTlNJRklFRHxSQURJT0JVVFRPTnxTWVNURU0tRVhJVHxUT1AtT0YtUEFHRXxUUkFOU0FDVElPTnxBUFBMSUNBVElPTnxDT05DQVRFTkFURXxERVNUSU5BVElPTnxFTkhBTkNFTUVOVHxJTU1FRElBVEVMWXxOTy1HUk9VUElOR3xQUkVDT01QSUxFRHxSRVBMQUNFTUVOVHxUSVRMRS1MSU5FU3xBQ1RJVkFUSU9OfEJZVEUtT1JERVJ8Q0xBU1MtUE9PTHxDT05ORUNUSU9OfENPTlZFUlNJT058REVGSU5JVElPTnxERVBBUlRNRU5UfEVYUElSQVRJT058SU5IRVJJVElOR3xNRVNTQUdFLUlEfE5PLUhFQURJTkd8UEVSRk9STUlOR3xRVUVVRS1PTkxZfFJJR0hUU1BBQ0V8U0NJRU5USUZJQ3xTVEFUVVNJTkZPfFNUUlVDVFVSRVN8U1lOQ1BPSU5UU3xXSVRILVRJVExFfEFUVFJJQlVURVN8Qk9VTkRBUklFU3xDTEFTUy1EQVRBfENPTF9OT1JNQUx8RERcXC9NTVxcL1lZWVl8REVTQ0VORElOR3xJTlRFUkZBQ0VTfExJTkUtQ09VTlR8TU1cXC9ERFxcL1lZWVl8Tk9OLVVOSVFVRXxQUkVTRVJWSU5HfFNFTEVDVElPTlN8U1RBVEVNRU5UU3xTVUJST1VUSU5FfFRSVU5DQVRJT058VFlQRS1QT09MU3xBUklUSE1FVElDfEJBQ0tHUk9VTkR8RU5EUFJPVklERXxFWENFUFRJT05TfElERU5USUZJRVJ8SU5ERVgtTElORXxPQkxJR0FUT1JZfFBBUkFNRVRFUlN8UEVSQ0VOVEFHRXxQVVNIQlVUVE9OfFJFU09MVVRJT058Q09NUE9ORU5UU3xERUFMTE9DQVRFfERJU0NPTk5FQ1R8RFVQTElDQVRFU3xGSVJTVC1MSU5FfEhFQUQtTElORVN8Tk8tRElTUExBWXxPQ0NVUlJFTkNFfFJFU1BFQ1RJTkd8UkVUVVJOQ09ERXxTVUJNQVRDSEVTfFRSQUNFLUZJTEV8QVNDRU5ESU5HfEJZUEFTU0lOR3xFTkRNT0RVTEV8RVhDRVBUSU9OfEVYQ0xVRElOR3xFWFBPUlRJTkd8SU5DUkVNRU5UfE1BVENIQ09ERXxQQVJBTUVURVJ8UEFSVElBTExZfFBSRUZFUlJFRHxSRUZFUkVOQ0V8UkVQTEFDSU5HfFJFVFVSTklOR3xTRUxFQ1RJT058U0VQQVJBVEVEfFNQRUNJRklFRHxTVEFURU1FTlR8VElNRVNUQU1QfFRZUEUtUE9PTHxBQ0NFUFRJTkd8QVBQRU5EQUdFfEFTU0lHTklOR3xDT0xfR1JPVVB8Q09NUEFSSU5HfENPTlNUQU5UU3xEQU5HRVJPVVN8SU1QT1JUSU5HfElOU1RBTkNFU3xMRUZUU1BBQ0V8TE9HLVBPSU5UfFFVSUNLSU5GT3xSRUFELU9OTFl8U0NST0xMSU5HfFNRTFNDUklQVHxTVEVQLUxPT1B8VE9QLUxJTkVTfFRSQU5TTEFURXxBUFBFTkRJTkd8QVVUSE9SSVRZfENIQVJBQ1RFUnxDT01QT05FTlR8Q09ORElUSU9OfERJUkVDVE9SWXxEVVBMSUNBVEV8TUVTU0FHSU5HfFJFQ0VJVklOR3xTVUJTQ1JFRU58QUNDT1JESU5HfENPTF9UT1RBTHxFTkQtTElORVN8RU5ETUVUSE9EfEVORFNFTEVDVHxFWFBBTkRJTkd8RVhURU5TSU9OfElOQ0xVRElOR3xJTkZPVFlQRVN8SU5URVJGQUNFfElOVEVSVkFMU3xMSU5FLVNJWkV8UEYtU1RBVFVTfFBST0NFRFVSRXxQUk9URUNURUR8UkVRVUVTVEVEfFJFU1VNQUJMRXxSSUdIVFBMVVN8U0FQLVNQT09MfFNFQ09OREFSWXxTVFJVQ1RVUkV8U1VCU1RSSU5HfFRBQkxFVklFV3xOVU1PRkNIQVJ8QURKQUNFTlR8QU5BTFlTSVN8QVNTSUdORUR8QkFDS1dBUkR8Q0hBTk5FTFN8Q0hFQ0tCT1h8Q09OVElOVUV8Q1JJVElDQUx8REFUQUlORk98RERcXC9NTVxcL1lZfERVUkFUSU9OfEVOQ09ESU5HfEVORENMQVNTfEZVTkNUSU9OfExFRlRQTFVTfExJTkVGRUVEfE1NXFwvRERcXC9ZWXxPVkVSRkxPV3xSRUNFSVZFRHxTS0lQUElOR3xTT1JUQUJMRXxTVEFOREFSRHxTVUJUUkFDVHxTVVBQUkVTU3xUQUJTVFJJUHxUSVRMRUJBUnxUUlVOQ0FURXxVTkFTU0lHTnxXSEVORVZFUnxBTkFMWVpFUnxDT0FMRVNDRXxDT01NRU5UU3xDT05ERU5TRXxERUNJTUFMU3xERUZFUlJFRHxFTkRXSElMRXxFWFBMSUNJVHxLRVlXT1JEU3xNRVNTQUdFU3xQT1NJVElPTnxQUklPUklUWXxSRUNFSVZFUnxSRU5BTUlOR3xUSU1FWk9ORXxUUkFJTElOR3xBTExPQ0FURXxDRU5URVJFRHxDSVJDVUxBUnxDT05UUk9MU3xDVVJSRU5DWXxERUxFVElOR3xERVNDUklCRXxESVNUQU5DRXxFTkRDQVRDSHxFWFBPTkVOVHxFWFRFTkRFRHxHRU5FUkFURXxJR05PUklOR3xJTkNMVURFU3xJTlRFUk5BTHxNQUpPUi1JRHxNT0RJRklFUnxORVctTElORXxPUFRJT05BTHxQUk9QRVJUWXxST0xMQkFDS3xTVEFSVElOR3xTVVBQTElFRHxBQlNUUkFDVHxDSEFOR0lOR3xDT05URVhUU3xDUkVBVElOR3xDVVNUT01FUnxEQVRBQkFTRXxEQVlMSUdIVHxERUZJTklOR3xESVNUSU5DVHxESVZJU0lPTnxFTkFCTElOR3xFTkRDSEFJTnxFU0NBUElOR3xIQVJNTEVTU3xJTVBMSUNJVHxJTkFDVElWRXxMQU5HVUFHRXxNSU5PUi1JRHxNVUxUSVBMWXxORVctUEFHRXxOTy1USVRMRXxQT1NfSElHSHxTRVBBUkFURXxURVhUUE9PTHxUUkFOU0ZFUnxTRUxFQ1RPUnxEQk1BWExFTnxJVEVSQVRPUnxTRUxFQ1RPUnxBUkNISVZFfEJJVC1YT1J8QllURS1DT3xDT0xMRUNUfENPTU1FTlR8Q1VSUkVOVHxERUZBVUxUfERJU1BMQVl8RU5ERk9STXxFWFRSQUNUfExFQURJTkd8TElTVEJPWHxMT0NBVE9SfE1FTUJFUlN8TUVUSE9EU3xORVNUSU5HfFBPU19MT1d8UFJPQ0VTU3xQUk9WSURFfFJBSVNJTkd8UkVTRVJWRXxTRUNPTkRTfFNVTU1BUll8VklTSUJMRXxCRVRXRUVOfEJJVC1BTkR8QllURS1DU3xDTEVBTlVQfENPTVBVVEV8Q09OVFJPTHxDT05WRVJUfERBVEFTRVR8RU5EQ0FTRXxGT1JXQVJEfEhFQURFUlN8SE9UU1BPVHxJTkNMVURFfElOVkVSU0V8S0VFUElOR3xOTy1aRVJPfE9CSkVDVFN8T1ZFUkxBWXxQQURESU5HfFBBVFRFUk58UFJPR1JBTXxSRUZSRVNIfFNFQ1RJT058U1VNTUlOR3xURVNUSU5HfFZFUlNJT058V0lORE9XU3xXSVRIT1VUfEJJVC1OT1R8QllURS1DQXxCWVRFLU5BfENBU1RJTkd8Q09OVEVYVHxDT1VOVFJZfERZTkFNSUN8RU5BQkxFRHxFTkRMT09QfEVYRUNVVEV8RlJJRU5EU3xIQU5ETEVSfEhFQURJTkd8SU5JVElBTHxcXCotSU5QVVR8TE9HRklMRXxNQVhJTVVNfE1JTklNVU18Tk8tR0FQU3xOTy1TSUdOfFBSQUdNQVN8UFJJTUFSWXxQUklWQVRFfFJFRFVDRUR8UkVQTEFDRXxSRVFVRVNUfFJFU1VMVFN8VU5JQ09ERXxXQVJOSU5HfEFMSUFTRVN8QllURS1DTnxCWVRFLU5TfENBTExJTkd8Q09MX0tFWXxDT0xVTU5TfENPTk5FQ1R8RU5ERVhFQ3xFTlRSSUVTfEVYQ0xVREV8RklMVEVSU3xGVVJUSEVSfEhFTFAtSUR8TE9HSUNBTHxNQVBQSU5HfE1FU1NBR0V8TkFNRVRBQnxPUFRJT05TfFBBQ0tBR0V8UEVSRk9STXxSRUNFSVZFfFNUQVRJQ1N8VkFSWUlOR3xCSU5ESU5HfENIQVJMRU58R1JFQVRFUnxYU1RSTEVOfEFDQ0VQVHxBUFBFTkR8REVUQUlMfEVMU0VJRnxFTkRJTkd8RU5EVFJZfEZPUk1BVHxGUkFNRVN8R0lWSU5HfEhBU0hFRHxIRUFERVJ8SU1QT1JUfElOU0VSVHxNQVJHSU58TU9EVUxFfE5BVElWRXxPQkpFQ1R8T0ZGU0VUfFJFTU9URXxSRVNVTUV8U0FWSU5HfFNJTVBMRXxTVUJNSVR8VEFCQkVEfFRPS0VOU3xVTklRVUV8VU5QQUNLfFVQREFURXxXSU5ET1d8WUVMTE9XfEFDVFVBTHxBU1BFQ1R8Q0VOVEVSfENVUlNPUnxERUxFVEV8RElBTE9HfERJVklERXxEVVJJTkd8RVJST1JTfEVWRU5UU3xFWFRFTkR8RklMVEVSfEhBTkRMRXxIQVZJTkd8SUdOT1JFfExJVFRMRXxNRU1PUll8Tk8tR0FQfE9DQ1VSU3xPUFRJT058UEVSU09OfFBMQUNFU3xQVUJMSUN8UkVEVUNFfFJFUE9SVHxSRVNVTFR8U0lOR0xFfFNPUlRFRHxTV0lUQ0h8U1lOVEFYfFRBUkdFVHxWQUxVRVN8V1JJVEVSfEFTU0VSVHxCTE9DS1N8Qk9VTkRTfEJVRkZFUnxDSEFOR0V8Q09MVU1OfENPTU1JVHxDT05DQVR8Q09QSUVTfENSRUFURXxERE1NWVl8REVGSU5FfEVORElBTnxFU0NBUEV8RVhQQU5EfEtFUk5FTHxMQVlPVVR8TEVHQUNZfExFVkVMU3xNTUREWVl8TlVNQkVSfE9VVFBVVHxSQU5HRVN8UkVBREVSfFJFVFVSTnxTQ1JFRU58U0VBUkNIfFNFTEVDVHxTSEFSRUR8U09VUkNFfFNUQUJMRXxTVEFUSUN8U1VCS0VZfFNVRkZJWHxUQUJMRVN8VU5XSU5EfFlZTU1ERHxBU1NJR058QkFDS1VQfEJFRk9SRXxCSU5BUll8QklULU9SfEJMQU5LU3xDTElFTlR8Q09ESU5HfENPTU1PTnxERU1BTkR8RFlOUFJPfEVYQ0VQVHxFWElTVFN8RVhQT1JUfEZJRUxEU3xHTE9CQUx8R1JPVVBTfExFTkdUSHxMT0NBTEV8TUVESVVNfE1FVEhPRHxNT0RJRll8TkVTVEVEfE9USEVSU3xSRUpFQ1R8U0NST0xMfFNVUFBMWXxTWU1CT0x8RU5ERk9SfFNUUkxFTnxBTElHTnxCRUdJTnxCT1VORHxFTkRBVHxFTlRSWXxFVkVOVHxGSU5BTHxGTFVTSHxHUkFOVHxJTk5FUnxTSE9SVHxVU0lOR3xXUklURXxBRlRFUnxCTEFDS3xCTE9DS3xDTE9DS3xDT0xPUnxDT1VOVHxEVU1NWXxFTVBUWXxFTkRET3xFTkRPTnxHUkVFTnxJTkRFWHxJTk9VVHxMRUFWRXxMRVZFTHxMSU5FU3xNT0RJRnxPUkRFUnxPVVRFUnxSQU5HRXxSRVNFVHxSRVRSWXxSSUdIVHxTTUFSVHxTUExJVHxTVFlMRXxUQUJMRXxUSFJPV3xVTkRFUnxVTlRJTHxVUFBFUnxVVEYtOHxXSEVSRXxBTElBU3xCTEFOS3xDTEVBUnxDTE9TRXxFWEFDVHxGRVRDSHxGSVJTVHxGT1VORHxHUk9VUHxMTEFOR3xMT0NBTHxPVEhFUnxSRUdFWHxTUE9PTHxUSVRMRXxUWVBFU3xWQUxJRHxXSElMRXxBTFBIQXxCT1hFRHxDQVRDSHxDSEFJTnxDSEVDS3xDTEFTU3xDT1ZFUnxFTkRJRnxFUVVJVnxGSUVMRHxGTE9PUnxGUkFNRXxJTlBVVHxMT1dFUnxNQVRDSHxOT0RFU3xQQUdFU3xQUklOVHxSQUlTRXxST1VORHxTSElGVHxTUEFDRXxTUE9UU3xTVEFNUHxTVEFURXxUQVNLU3xUSU1FU3xUUk1BQ3xVTElORXxVTklPTnxWQUxVRXxXSURUSHxFUVVBTHxMT0cxMHxUUlVOQ3xCTE9CfENBU0V8Q0VJTHxDTE9CfENPTkR8RVhJVHxGSUxFfEdBUFN8SE9MRHxJTkNMfElOVE98S0VFUHxLRVlTfExBU1R8TElORXxMT05HfExQQUR8TUFJTHxNT0RFfE9QRU58UElOS3xSRUFEfFJPV1N8VEVTVHxUSEVOfFpFUk98QVJFQXxCQUNLfEJBREl8QllURXxDQVNUfEVESVR8RVhFQ3xGQUlMfEZJTkR8RktFUXxGT05UfEZSRUV8R0tFUXxISURFfElOSVR8SVROT3xMQVRFfExPT1B8TUFJTnxNQVJLfE1PVkV8TkVYVHxOVUxMfFJJU0t8Uk9MRXxVTklUfFdBSVR8Wk9ORXxCQVNFfENBTEx8Q09ERXxEQVRBfERBVEV8RktHRXxHS0dFfEhJR0h8S0lORHxMRUZUfExJU1R8TUFTS3xNRVNIfE5BTUV8Tk9ERXxQQUNLfFBBR0V8UE9PTHxTRU5EfFNJR058U0laRXxTT01FfFNUT1B8VEFTS3xURVhUfFRJTUV8VVNFUnxWQVJZfFdJVEh8V09SRHxCTFVFfENPTlZ8Q09QWXxERUVQfEVMU0V8Rk9STXxGUk9NfEhJTlR8SUNPTnxKT0lOfExJS0V8TE9BRHxPTkxZfFBBUlR8U0NBTnxTS0lQfFNPUlR8VFlQRXxVTklYfFZJRVd8V0hFTnxXT1JLfEFDT1N8QVNJTnxBVEFOfENPU0h8RUFDSHxGUkFDfExFU1N8UlRUSXxTSU5IfFNRUlR8VEFOSHxBVkd8QklUfERJVnxJU098TEVUfE9VVHxQQUR8U1FMfEFMTHxDSV98Q1BJfEVORHxMT0J8TFBJfE1BWHxNSU58TkVXfE9MRXxSVU58U0VUfFxcP1RPfFlFU3xBQlN8QUREfEFORHxCSUd8Rk9SfEhEQnxKT0J8TE9XfE5PVHxTQVB8VFJZfFZJQXxYTUx8QU5ZfEdFVHxJRFN8S0VZfE1PRHxPRkZ8UFVUfFJBV3xSRUR8UkVGfFNVTXxUQUJ8WFNEfENOVHxDT1N8RVhQfExPR3xTSU58VEFOfFhPUnxBVHxDT3xDUHxET3xHVHxJRHxJRnxOU3xPUnxCVHxDQXxDU3xHRXxOQXxOQnxFUXxJTnxMVHxORXxOT3xPRnxPTnxQRnxUT3xBU3xCWXxDTnxJU3xMRXxOUHxVUHxFfEl8TXxPfFp8Q3xYKVxcYi9pLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0LyogTnVtYmVycyBjYW4gYmUgb25seSBpbnRlZ2Vycy4gRGVjaW1hbCBvciBIZXggYXBwZWFyIG9ubHkgYXMgc3RyaW5ncyAqL1xuXHQnbnVtYmVyJyA6IC9cXGJcXGQrXFxiLyxcblx0LyogT3BlcmF0b3JzIG11c3QgYWx3YXlzIGJlIHN1cnJvdW5kZWQgYnkgd2hpdGVzcGFjZSwgdGhleSBjYW5ub3QgYmUgcHV0IFxuXHRhZGphY2VudCB0byBvcGVyYW5kcy4gXG5cdCovXG5cdCdvcGVyYXRvcicgOiB7XG5cdFx0cGF0dGVybjogLyhcXHMpKD86XFwqXFwqP3w8Wz0+XT98Pj0/fFxcPz18Wy0rXFwvPV0pKD89XFxzKS8sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnc3RyaW5nLW9wZXJhdG9yJyA6IHtcblx0XHRwYXR0ZXJuOiAvKFxccykmJj8oPz1cXHMpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdC8qIFRoZSBvZmZpY2lhbCBlZGl0b3IgaGlnaGxpZ2h0cyAqL1xuXHRcdGFsaWFzOiBcImtleXdvcmRcIlxuXHR9LFxuXHQndG9rZW4tb3BlcmF0b3InIDogW3tcblx0XHQvKiBTcGVjaWFsIG9wZXJhdG9ycyB1c2VkIHRvIGFjY2VzcyBzdHJ1Y3R1cmUgY29tcG9uZW50cywgY2xhc3MgbWV0aG9kcy9hdHRyaWJ1dGVzLCBldGMuICovXG5cdFx0cGF0dGVybjogLyhcXHcpKD86LT4/fD0+fFt+fHt9XSkoPz1cXHcpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGFsaWFzOiBcInB1bmN0dWF0aW9uXCJcblx0fSwge1xuXHQgICAgLyogU3BlY2lhbCB0b2tlbnMgdXNlZCBkbyBkZWxpbWl0IHN0cmluZyB0ZW1wbGF0ZXMgKi9cblx0ICAgIHBhdHRlcm46IC9bfHt9XS8sXG5cdFx0YWxpYXM6IFwicHVuY3R1YXRpb25cIlxuXHR9XSxcblx0J3B1bmN0dWF0aW9uJyA6IC9bLC46KCldL1xufTtcbnJldHVybiBQcmlzbTtcbn07XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gcHJpc20oe30sIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTsgfSk7XG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gcHJpc20oe30sIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTtcbn0gZWxzZSB7XG5cdHZhciB3ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWw7XG5cdHByaXNtKHRoaXMgfHwgdywgdyk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlKHBhcmFtcyl7XHJcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IFwiYXR0cmlidXRlIHZlYzQgYV9wb3NpdGlvbjsgXFxuXCIgK1xuXCIgXFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tYXRyaXg7IFxcblwiICtcblwiIFxcblwiICtcblwidm9pZCBtYWluKCkgeyBcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSB1X21hdHJpeCAqIGFfcG9zaXRpb247IFxcblwiICtcblwifSBcXG5cIiArXG5cIiBcXG5cIiBcclxuICAgICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9XHJcbiAgICAgIGZvcih2YXIga2V5IGluIHBhcmFtcykge1xyXG4gICAgICAgIHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChcInt7XCIra2V5K1wifX1cIixcImdcIilcclxuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UobWF0Y2hlciwgcGFyYW1zW2tleV0pXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRlbXBsYXRlXHJcbiAgICB9O1xuIiwidmFyIG1hdDQgPSByZXF1aXJlKCdnbC1tYXQ0Jyk7XG5cbi8vIEFkZHMgYSBjYW52YXMgdG8gdGhlIHBhcmVudCBlbGVtZW50IGFuZCBzdGFydCByZW5kZXJpbmcgdGhlIHNjZW5lXG4vLyB1c2luZyB0aGUgZ2l2ZW4gdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXJzLlxuZnVuY3Rpb24gYWRkKHBhcmVudEVMLCB2ZXJ0LCBmcmFnKSB7XG5cbiAgICB2YXIgZ2xDYW52YXMgPSBnZXRDYW52YXMocGFyZW50RUwpO1xuXG4gICAgLy9DcmVhdGUgYSBtYXRyaXggdG8gdHJhbnNmb3JtIHRoZSB0cmlhbmdsZVxuICAgIHZhciBtYXRyaXggPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIC8vTW92ZSBpdCBiYWNrIDQgdW5pdHNcbiAgICBtYXQ0LnRyYW5zbGF0ZShtYXRyaXgsIG1hdHJpeCwgWzAuMCwgMC4wLCAtNC4wXSk7XG4gICAgXG4gICAgYXR0YWNoZU1vdXNlTGlzdGVuZXJzKGdsQ2FudmFzLCBtYXRyaXgpO1xuICAgIFxuICAgIGdsQ2FudmFzLmdsLmVuYWJsZShnbENhbnZhcy5nbC5ERVBUSF9URVNUKTtcbiAgICBcbiAgICAvL2NyZWF0ZSBhIHNpbXBsZSByZW5kZXJlciBmb3IgYSBzaW1wbGUgdHJpYW5nbGVcbiAgICB2YXIgcmVuZGVyZXIgPSBzaW1wbGVSZW5kZXJlcihnbENhbnZhcy5nbCwgMSwgdmVydCwgZnJhZywgbmV3IEZsb2F0MzJBcnJheShbLTAuNSwtMC41LC0xLjAsMC4wLDAuNSwtMS4wLDAuNSwtMC41LC0xLjBdKSk7XG5cblxuICAgIC8vQ2FsbGVkIHdoZW4gYSBmcmFtZSBpcyBzY2hlZHVsZWQuICBBIHJhcGlkIHNlcXVlbmNlIG9mIHNjZW5lIGRyYXdzIGNyZWF0ZXMgdGhlIGFuaW1hdGlvbiBlZmZlY3QuXG4gICAgdmFyIHJlbmRlckZuID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG5cbiAgICAgICAgbWF0NC5yb3RhdGVZKG1hdHJpeCwgbWF0cml4LCBNYXRoLlBJLzUxMik7XG4gICAgICAgIHJlbmRlcmVyKG1hdHJpeCwgWzEsIDAsIDBdKTtcbiAgICAgICAgdmFyIHNlY29uZCA9IG1hdDQuY3JlYXRlKCk7XG4gICAgICAgIG1hdDQucm90YXRlWShzZWNvbmQsIG1hdHJpeCwgMipNYXRoLlBJLzMpO1xuICAgICAgICByZW5kZXJlcihzZWNvbmQsIFswLCAxLCAwXSk7XG4gICAgICAgIHZhciB0aGlyZCA9IG1hdDQuY3JlYXRlKCk7XG4gICAgICAgIG1hdDQucm90YXRlWSh0aGlyZCwgc2Vjb25kLCAyKk1hdGguUEkvMyk7XG4gICAgICAgIHJlbmRlcmVyKHRoaXJkLCBbMCwgMCwgMV0pO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckZuKTtcbiAgICB9XG5cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckZuKTtcblxufVxuXG4vLyBHZXQgQSBXZWJHTCBjb250ZXh0XG5mdW5jdGlvbiBnZXRDYW52YXMocGFyZW50KSB7XG4gICAgLy9DcmVhdGUgYSBjYW52YXMgd2l0aCBzcGVjaWZpZWQgYXR0cmlidXRlcyBhbmQgYXBwZW5kIGl0IHRvIHRoZSBwYXJlbnQuXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy53aWR0aCA9IDk2MDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gMTAyNDtcbiAgICBcbiAgICB2YXIgZGl2ICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXljYW52YXMnKTtcbiAgICBkaXYuc2V0QXR0cmlidXRlKCdpZCcsICdnbGNhbnZhcycpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgIFxuICAgIHZhciBnbCAgICAgPSBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnKTtcbiAgICByZXR1cm4ge2NhbnZhczogY2FudmFzLCBnbCA6IGdsfVxufVxuXG5mdW5jdGlvbiBhdHRhY2hlTW91c2VMaXN0ZW5lcnMoY2FudmFzLCBtYXRyaXgpIHtcbiAgICBcbiAgICBkb2N1bWVudC5vbm1vdXNlbW92ZSA9IGhhbmRsZU1vdXNlTW92ZShtYXRyaXgpO1xuICAgIFxufVxuXG5mdW5jdGlvbiBoYW5kbGVNb3VzZU1vdmUobWF0cml4KSB7XG5cbiAgICB2YXIgbGFzdFggPSAwO1xuICAgIHZhciBsYXN0WSA9IDA7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCBldmVudCApIHtcblxuICAgICAgICB2YXIgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIHZhciB5ID0gZXZlbnQuY2xpZW50WTtcblxuICAgICAgICB2YXIgZGlmZlggPSB4IC0gbGFzdFg7XG4gICAgICAgIHZhciBkaWZmWSA9IHkgLSBsYXN0WTtcbiAgICAgICAgXG4gICAgICAgIG1hdDQucm90YXRlWShtYXRyaXgsIG1hdHJpeCwgKGRpZmZYLzk2MCkgKiBNYXRoLlBJKTtcbiAgICAgICAgbWF0NC5yb3RhdGVYKG1hdHJpeCwgbWF0cml4LCAoZGlmZlkvMTAyNCkgKiBNYXRoLlBJKTtcblxuICAgICAgICBsYXN0WCA9IHg7XG4gICAgICAgIGxhc3RZID0geTtcbiAgICB9XG59XG5cbi8vUmV0dXJucyBhIHNpbXBsZSByZW5kZXJpbmcgZnVuY3Rpb24gdGhhdCBkcmF3cyB0aGUgcGFzc2VkIGluIHZlcnRpY2VzLlxuZnVuY3Rpb24gc2ltcGxlUmVuZGVyZXIoZ2wsIGFzcGVjdCwgdmVydCwgZnJhZywgdmVydGljZXMpIHtcblxuICAgIHZhciB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydCgpKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRleFNoYWRlcik7XG4gICAgXG4gICAgdmFyIGZyYWdtZW50U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgZ2wuc2hhZGVyU291cmNlKGZyYWdtZW50U2hhZGVyLCBmcmFnKCkpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xuICAgIFxuICAgIHZhciBzaGFkZXJzID0gW3ZlcnRleFNoYWRlciwgZnJhZ21lbnRTaGFkZXJdO1xuICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIHNoYWRlcnMuZm9yRWFjaChmdW5jdGlvbihzaGFkZXIpIHtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHNoYWRlcik7XG4gICAgfSlcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcbiAgICBcbiAgICByZXR1cm4gZnVuY3Rpb24ocGFyZW50Tm9kZSwgY29sb3IpIHtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuR0xfQ09MT1JfQlVGRkVSX0JJVCk7XG5cbiAgICAgICAgLy9GaWVsZCBvZiB2aWV3IGlzIHZlcnkgc2ltaWxhciB0byBhIGNhbWVyYXMgZmllbGQgb2Ygdmlldy5cbiAgICAgICAgdmFyIGZpZWxkT2ZWaWV3ID0gTWF0aC5QSS8yO1xuICAgICAgICAvL0ZhciBlZGdlIG9mIHNjZW5lIGRlZmluZXMgaG93IGZhciBhd2F5IGFuIG9iamVjdCBjYW4gYmUgZnJvbSB0aGUgY2FtZXJhIGJlZm9yZSBpdCBkaXNhcHBlYXJzLlxuICAgICAgICB2YXIgZmFyRWRnZU9mU2NlbmUgPSAxMDA7XG4gICAgICAgIC8vTmVhciBlZGdlIG9mIHNjZW5lIGRlZmluZXMgaG93IGNsb3NlIGFuIG9iamVjdCBjYW4gYmUgZnJvbSB0aGUgY2FtZXJhIGJlZm9yZSBpdCBkaXNhcHBlYXJzLlxuICAgICAgICB2YXIgbmVhckVkZ2VPZlNjZW5lID0gMTtcblxuICAgICAgICAvL0NyZWF0ZXMgYSBwZXJzcGVjdGl2ZSB0cmFuc2Zvcm1hdGlvbiBmcm9tIHRoZSBhYm92ZSBwYXJhbWV0ZXJzLlxuICAgICAgICB2YXIgcGVyc3BlY3RpdmUgPSBtYXQ0LnBlcnNwZWN0aXZlKG1hdDQuY3JlYXRlKCksIGZpZWxkT2ZWaWV3LCBhc3BlY3QsIG5lYXJFZGdlT2ZTY2VuZSwgZmFyRWRnZU9mU2NlbmUpO1xuICAgICAgICAvL0FwcGx5IHBlcnNwZWN0aXZlIHRvIHRoZSBwYXJlbnQgdHJhbnNmb3JtYXRpb24gKHRyYW5zbGF0ZSArIHJvdGF0aW9uKVxuICAgICAgICB2YXIgcHJvamVjdGlvbiA9IG1hdDQubXVsdGlwbHkobWF0NC5jcmVhdGUoKSwgcGVyc3BlY3RpdmUsIHBhcmVudE5vZGUpO1xuICAgICAgICBcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBtYXRyaXhMb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcInVfbWF0cml4XCIpO1xuICAgIFxuICAgICAgICAvLyBTZXQgdGhlIG1hdHJpeC5cbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRyaXhMb2NhdGlvbiwgZmFsc2UsIHByb2plY3Rpb24pO1xuXG4gICAgICAgIC8vIHNldCB0aGUgY29sb3JcbiAgICAgICAgdmFyIGNvbG9yTG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJ1X2NvbG9yXCIpO1xuICAgICAgICBnbC51bmlmb3JtNGYoY29sb3JMb2NhdGlvbiwgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXSwgMS4wKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIGJ1ZmZlciBmb3IgdGhlIHBvc2l0aW9uc1xuICAgICAgICB2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gbG9vayB1cCB3aGVyZSB0aGUgdmVydGV4IGRhdGEgbmVlZHMgdG8gZ28uXG4gICAgICAgIHZhciBwb3NpdGlvbkxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX3Bvc2l0aW9uXCIpO1xuICAgIFxuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NpdGlvbkxvY2F0aW9uKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NpdGlvbkxvY2F0aW9uLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0aWNlcywgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFUywgMCwgdmVydGljZXMubGVuZ3RoLzMpO1xuICAgIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZDtcbiIsIm1vZHVsZS5leHBvcnRzID0gYWRqb2ludDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG5cbiAgICBvdXRbMF0gID0gIChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikpO1xuICAgIG91dFsxXSAgPSAtKGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gICAgb3V0WzJdICA9ICAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbM10gID0gLShhMDEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtIGExMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICsgYTIxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFs0XSAgPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzVdICA9ICAoYTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbNl0gID0gLShhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFs3XSAgPSAgKGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzhdICA9ICAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpKTtcbiAgICBvdXRbOV0gID0gLShhMDAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkpO1xuICAgIG91dFsxMF0gPSAgKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gICAgb3V0WzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTJdID0gLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpO1xuICAgIG91dFsxM10gPSAgKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSk7XG4gICAgb3V0WzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcbiAgICBvdXRbMTVdID0gIChhMDAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gY2xvbmU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xuZnVuY3Rpb24gY2xvbmUoYSkge1xuICAgIHZhciBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICBvdXRbOV0gPSBhWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gY29weTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBjcmVhdGU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XG4gKlxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xuZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHZhciBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMTtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAxO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZGV0ZXJtaW5hbnQ7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XSxcblxuICAgICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG4gICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcbiAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG4gICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcbiAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnJvbVF1YXQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gZnJvbVF1YXQob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB5eCA9IHkgKiB4MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHp4ID0geiAqIHgyLFxuICAgICAgICB6eSA9IHogKiB5MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFsyXSA9IHp4IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcblxuICAgIG91dFs0XSA9IHl4IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtIHh4IC0geno7XG4gICAgb3V0WzZdID0genkgKyB3eDtcbiAgICBvdXRbN10gPSAwO1xuXG4gICAgb3V0WzhdID0genggKyB3eTtcbiAgICBvdXRbOV0gPSB6eSAtIHd4O1xuICAgIG91dFsxMF0gPSAxIC0geHggLSB5eTtcbiAgICBvdXRbMTFdID0gMDtcblxuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmcm9tUm90YXRpb25UcmFuc2xhdGlvbjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uIGFuZCB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XG4gKiAgICAgdmFyIHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHYpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHh5ID0geCAqIHkyLFxuICAgICAgICB4eiA9IHggKiB6MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHl6ID0geSAqIHoyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgb3V0WzFdID0geHkgKyB3ejtcbiAgICBvdXRbMl0gPSB4eiAtIHd5O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geHkgLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0gKHh4ICsgenopO1xuICAgIG91dFs2XSA9IHl6ICsgd3g7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmcnVzdHVtO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBmcnVzdHVtKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCksXG4gICAgICAgIHRiID0gMSAvICh0b3AgLSBib3R0b20pLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gKG5lYXIgKiAyKSAqIHJsO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gKG5lYXIgKiAyKSAqIHRiO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAocmlnaHQgKyBsZWZ0KSAqIHJsO1xuICAgIG91dFs5XSA9ICh0b3AgKyBib3R0b20pICogdGI7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gKGZhciAqIG5lYXIgKiAyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gaWRlbnRpdHk7XG5cbi8qKlxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiByZXF1aXJlKCcuL2NyZWF0ZScpXG4gICwgY2xvbmU6IHJlcXVpcmUoJy4vY2xvbmUnKVxuICAsIGNvcHk6IHJlcXVpcmUoJy4vY29weScpXG4gICwgaWRlbnRpdHk6IHJlcXVpcmUoJy4vaWRlbnRpdHknKVxuICAsIHRyYW5zcG9zZTogcmVxdWlyZSgnLi90cmFuc3Bvc2UnKVxuICAsIGludmVydDogcmVxdWlyZSgnLi9pbnZlcnQnKVxuICAsIGFkam9pbnQ6IHJlcXVpcmUoJy4vYWRqb2ludCcpXG4gICwgZGV0ZXJtaW5hbnQ6IHJlcXVpcmUoJy4vZGV0ZXJtaW5hbnQnKVxuICAsIG11bHRpcGx5OiByZXF1aXJlKCcuL211bHRpcGx5JylcbiAgLCB0cmFuc2xhdGU6IHJlcXVpcmUoJy4vdHJhbnNsYXRlJylcbiAgLCBzY2FsZTogcmVxdWlyZSgnLi9zY2FsZScpXG4gICwgcm90YXRlOiByZXF1aXJlKCcuL3JvdGF0ZScpXG4gICwgcm90YXRlWDogcmVxdWlyZSgnLi9yb3RhdGVYJylcbiAgLCByb3RhdGVZOiByZXF1aXJlKCcuL3JvdGF0ZVknKVxuICAsIHJvdGF0ZVo6IHJlcXVpcmUoJy4vcm90YXRlWicpXG4gICwgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb246IHJlcXVpcmUoJy4vZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24nKVxuICAsIGZyb21RdWF0OiByZXF1aXJlKCcuL2Zyb21RdWF0JylcbiAgLCBmcnVzdHVtOiByZXF1aXJlKCcuL2ZydXN0dW0nKVxuICAsIHBlcnNwZWN0aXZlOiByZXF1aXJlKCcuL3BlcnNwZWN0aXZlJylcbiAgLCBwZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldzogcmVxdWlyZSgnLi9wZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldycpXG4gICwgb3J0aG86IHJlcXVpcmUoJy4vb3J0aG8nKVxuICAsIGxvb2tBdDogcmVxdWlyZSgnLi9sb29rQXQnKVxuICAsIHN0cjogcmVxdWlyZSgnLi9zdHInKVxufSIsIm1vZHVsZS5leHBvcnRzID0gaW52ZXJ0O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07IiwidmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvb2tBdDtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIGxvb2tBdChvdXQsIGV5ZSwgY2VudGVyLCB1cCkge1xuICAgIHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW4sXG4gICAgICAgIGV5ZXggPSBleWVbMF0sXG4gICAgICAgIGV5ZXkgPSBleWVbMV0sXG4gICAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICAgIHVweCA9IHVwWzBdLFxuICAgICAgICB1cHkgPSB1cFsxXSxcbiAgICAgICAgdXB6ID0gdXBbMl0sXG4gICAgICAgIGNlbnRlcnggPSBjZW50ZXJbMF0sXG4gICAgICAgIGNlbnRlcnkgPSBjZW50ZXJbMV0sXG4gICAgICAgIGNlbnRlcnogPSBjZW50ZXJbMl07XG5cbiAgICBpZiAoTWF0aC5hYnMoZXlleCAtIGNlbnRlcngpIDwgMC4wMDAwMDEgJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgMC4wMDAwMDEgJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgMC4wMDAwMDEpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5KG91dCk7XG4gICAgfVxuXG4gICAgejAgPSBleWV4IC0gY2VudGVyeDtcbiAgICB6MSA9IGV5ZXkgLSBjZW50ZXJ5O1xuICAgIHoyID0gZXlleiAtIGNlbnRlcno7XG5cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XG4gICAgejAgKj0gbGVuO1xuICAgIHoxICo9IGxlbjtcbiAgICB6MiAqPSBsZW47XG5cbiAgICB4MCA9IHVweSAqIHoyIC0gdXB6ICogejE7XG4gICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyO1xuICAgIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgICBsZW4gPSBNYXRoLnNxcnQoeDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyKTtcbiAgICBpZiAoIWxlbikge1xuICAgICAgICB4MCA9IDA7XG4gICAgICAgIHgxID0gMDtcbiAgICAgICAgeDIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICAgIHgwICo9IGxlbjtcbiAgICAgICAgeDEgKj0gbGVuO1xuICAgICAgICB4MiAqPSBsZW47XG4gICAgfVxuXG4gICAgeTAgPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgICB5MSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICAgIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG5cbiAgICBsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKTtcbiAgICBpZiAoIWxlbikge1xuICAgICAgICB5MCA9IDA7XG4gICAgICAgIHkxID0gMDtcbiAgICAgICAgeTIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICAgIHkwICo9IGxlbjtcbiAgICAgICAgeTEgKj0gbGVuO1xuICAgICAgICB5MiAqPSBsZW47XG4gICAgfVxuXG4gICAgb3V0WzBdID0geDA7XG4gICAgb3V0WzFdID0geTA7XG4gICAgb3V0WzJdID0gejA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSB4MTtcbiAgICBvdXRbNV0gPSB5MTtcbiAgICBvdXRbNl0gPSB6MTtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IHgyO1xuICAgIG91dFs5XSA9IHkyO1xuICAgIG91dFsxMF0gPSB6MjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopO1xuICAgIG91dFsxM10gPSAtKHkwICogZXlleCArIHkxICogZXlleSArIHkyICogZXlleik7XG4gICAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gbXVsdGlwbHk7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuICAgIHZhciBiMCAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdOyAgXG4gICAgb3V0WzBdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFsxXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzNdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzRdOyBiMSA9IGJbNV07IGIyID0gYls2XTsgYjMgPSBiWzddO1xuICAgIG91dFs0XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbNV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzZdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFs3XSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcblxuICAgIGIwID0gYls4XTsgYjEgPSBiWzldOyBiMiA9IGJbMTBdOyBiMyA9IGJbMTFdO1xuICAgIG91dFs4XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbOV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzEwXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbMTFdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzEyXTsgYjEgPSBiWzEzXTsgYjIgPSBiWzE0XTsgYjMgPSBiWzE1XTtcbiAgICBvdXRbMTJdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFsxM10gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzE0XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbMTVdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gb3J0aG87XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gb3J0aG8ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KSxcbiAgICAgICAgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAtMiAqIGxyO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gLTIgKiBidDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAyICogbmY7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHI7XG4gICAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gICAgb3V0WzE0XSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcGVyc3BlY3RpdmU7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gcGVyc3BlY3RpdmUob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xuICAgIHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IGY7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoMiAqIGZhciAqIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBwZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBmaWVsZCBvZiB2aWV3LlxuICogVGhpcyBpcyBwcmltYXJpbHkgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHByb2plY3Rpb24gbWF0cmljZXMgdG8gYmUgdXNlZFxuICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcob3V0LCBmb3YsIG5lYXIsIGZhcikge1xuICAgIHZhciB1cFRhbiA9IE1hdGgudGFuKGZvdi51cERlZ3JlZXMgKiBNYXRoLlBJLzE4MC4wKSxcbiAgICAgICAgZG93blRhbiA9IE1hdGgudGFuKGZvdi5kb3duRGVncmVlcyAqIE1hdGguUEkvMTgwLjApLFxuICAgICAgICBsZWZ0VGFuID0gTWF0aC50YW4oZm92LmxlZnREZWdyZWVzICogTWF0aC5QSS8xODAuMCksXG4gICAgICAgIHJpZ2h0VGFuID0gTWF0aC50YW4oZm92LnJpZ2h0RGVncmVlcyAqIE1hdGguUEkvMTgwLjApLFxuICAgICAgICB4U2NhbGUgPSAyLjAgLyAobGVmdFRhbiArIHJpZ2h0VGFuKSxcbiAgICAgICAgeVNjYWxlID0gMi4wIC8gKHVwVGFuICsgZG93blRhbik7XG5cbiAgICBvdXRbMF0gPSB4U2NhbGU7XG4gICAgb3V0WzFdID0gMC4wO1xuICAgIG91dFsyXSA9IDAuMDtcbiAgICBvdXRbM10gPSAwLjA7XG4gICAgb3V0WzRdID0gMC4wO1xuICAgIG91dFs1XSA9IHlTY2FsZTtcbiAgICBvdXRbNl0gPSAwLjA7XG4gICAgb3V0WzddID0gMC4wO1xuICAgIG91dFs4XSA9IC0oKGxlZnRUYW4gLSByaWdodFRhbikgKiB4U2NhbGUgKiAwLjUpO1xuICAgIG91dFs5XSA9ICgodXBUYW4gLSBkb3duVGFuKSAqIHlTY2FsZSAqIDAuNSk7XG4gICAgb3V0WzEwXSA9IGZhciAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMTFdID0gLTEuMDtcbiAgICBvdXRbMTJdID0gMC4wO1xuICAgIG91dFsxM10gPSAwLjA7XG4gICAgb3V0WzE0XSA9IChmYXIgKiBuZWFyKSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMTVdID0gMC4wO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcm90YXRlO1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICB2YXIgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXSxcbiAgICAgICAgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiksXG4gICAgICAgIHMsIGMsIHQsXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjMsXG4gICAgICAgIGIwMCwgYjAxLCBiMDIsXG4gICAgICAgIGIxMCwgYjExLCBiMTIsXG4gICAgICAgIGIyMCwgYjIxLCBiMjI7XG5cbiAgICBpZiAoTWF0aC5hYnMobGVuKSA8IDAuMDAwMDAxKSB7IHJldHVybiBudWxsOyB9XG4gICAgXG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB4ICo9IGxlbjtcbiAgICB5ICo9IGxlbjtcbiAgICB6ICo9IGxlbjtcblxuICAgIHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICAgIHQgPSAxIC0gYztcblxuICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XG4gICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICBhMjAgPSBhWzhdOyBhMjEgPSBhWzldOyBhMjIgPSBhWzEwXTsgYTIzID0gYVsxMV07XG5cbiAgICAvLyBDb25zdHJ1Y3QgdGhlIGVsZW1lbnRzIG9mIHRoZSByb3RhdGlvbiBtYXRyaXhcbiAgICBiMDAgPSB4ICogeCAqIHQgKyBjOyBiMDEgPSB5ICogeCAqIHQgKyB6ICogczsgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7IGIxMSA9IHkgKiB5ICogdCArIGM7IGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICAgIGIyMCA9IHggKiB6ICogdCArIHkgKiBzOyBiMjEgPSB5ICogeiAqIHQgLSB4ICogczsgYjIyID0geiAqIHogKiB0ICsgYztcblxuICAgIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICAgIG91dFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMjtcbiAgICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gICAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICAgIG91dFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMjtcbiAgICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gICAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICAgIG91dFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMjtcbiAgICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gICAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICAgIG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjI7XG4gICAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJvdGF0ZVg7XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFswXSAgPSBhWzBdO1xuICAgICAgICBvdXRbMV0gID0gYVsxXTtcbiAgICAgICAgb3V0WzJdICA9IGFbMl07XG4gICAgICAgIG91dFszXSAgPSBhWzNdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzO1xuICAgIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICAgIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByb3RhdGVZO1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xuICAgICAgICBvdXRbNF0gID0gYVs0XTtcbiAgICAgICAgb3V0WzVdICA9IGFbNV07XG4gICAgICAgIG91dFs2XSAgPSBhWzZdO1xuICAgICAgICBvdXRbN10gID0gYVs3XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogcztcbiAgICBvdXRbMV0gPSBhMDEgKiBjIC0gYTIxICogcztcbiAgICBvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogcztcbiAgICBvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogcztcbiAgICBvdXRbOF0gPSBhMDAgKiBzICsgYTIwICogYztcbiAgICBvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogYztcbiAgICBvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGM7XG4gICAgb3V0WzExXSA9IGEwMyAqIHMgKyBhMjMgKiBjO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcm90YXRlWjtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbOF0gID0gYVs4XTtcbiAgICAgICAgb3V0WzldICA9IGFbOV07XG4gICAgICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICAgICAgb3V0WzExXSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGMgKyBhMTAgKiBzO1xuICAgIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzO1xuICAgIG91dFsyXSA9IGEwMiAqIGMgKyBhMTIgKiBzO1xuICAgIG91dFszXSA9IGEwMyAqIGMgKyBhMTMgKiBzO1xuICAgIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgLSBhMDEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgLSBhMDIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gc2NhbGU7XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xuZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gICAgdmFyIHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl07XG5cbiAgICBvdXRbMF0gPSBhWzBdICogeDtcbiAgICBvdXRbMV0gPSBhWzFdICogeDtcbiAgICBvdXRbMl0gPSBhWzJdICogeDtcbiAgICBvdXRbM10gPSBhWzNdICogeDtcbiAgICBvdXRbNF0gPSBhWzRdICogeTtcbiAgICBvdXRbNV0gPSBhWzVdICogeTtcbiAgICBvdXRbNl0gPSBhWzZdICogeTtcbiAgICBvdXRbN10gPSBhWzddICogeTtcbiAgICBvdXRbOF0gPSBhWzhdICogejtcbiAgICBvdXRbOV0gPSBhWzldICogejtcbiAgICBvdXRbMTBdID0gYVsxMF0gKiB6O1xuICAgIG91dFsxMV0gPSBhWzExXSAqIHo7XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gc3RyO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBtYXQgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuZnVuY3Rpb24gc3RyKGEpIHtcbiAgICByZXR1cm4gJ21hdDQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICtcbiAgICAgICAgICAgICAgICAgICAgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHRyYW5zbGF0ZTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gICAgdmFyIHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl0sXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgICBpZiAoYSA9PT0gb3V0KSB7XG4gICAgICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XG4gICAgICAgIGExMCA9IGFbNF07IGExMSA9IGFbNV07IGExMiA9IGFbNl07IGExMyA9IGFbN107XG4gICAgICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMF0gPSBhMDA7IG91dFsxXSA9IGEwMTsgb3V0WzJdID0gYTAyOyBvdXRbM10gPSBhMDM7XG4gICAgICAgIG91dFs0XSA9IGExMDsgb3V0WzVdID0gYTExOyBvdXRbNl0gPSBhMTI7IG91dFs3XSA9IGExMztcbiAgICAgICAgb3V0WzhdID0gYTIwOyBvdXRbOV0gPSBhMjE7IG91dFsxMF0gPSBhMjI7IG91dFsxMV0gPSBhMjM7XG5cbiAgICAgICAgb3V0WzEyXSA9IGEwMCAqIHggKyBhMTAgKiB5ICsgYTIwICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGEwMyAqIHggKyBhMTMgKiB5ICsgYTIzICogeiArIGFbMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gdHJhbnNwb3NlO1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICAgICAgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhMDE7XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhMDI7XG4gICAgICAgIG91dFs5XSA9IGExMjtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYTAzO1xuICAgICAgICBvdXRbMTNdID0gYTEzO1xuICAgICAgICBvdXRbMTRdID0gYTIzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhWzFdO1xuICAgICAgICBvdXRbNV0gPSBhWzVdO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYVsyXTtcbiAgICAgICAgb3V0WzldID0gYVs2XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhWzNdO1xuICAgICAgICBvdXRbMTNdID0gYVs3XTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59OyJdfQ==
