CodeMirror.defineMode("pepper", function(config, parserConfig) {
	var indentUnit = config.indentUnit,
		keywords = (function() {
			function makeKeywords(str) {
				var obj = {},
					words = str.split(" ");
				for(var i = 0; i < words.length; ++i)
				obj[words[i]] = true;
				return obj;
			}

			var pilKeywords = "declare import component system sequence strand structure kinetic equal noninteracting";
			return makeKeywords(pilKeywords);
		})(),
		cpp = parserConfig.useCPP,
		multiLineStrings = parserConfig.multiLineStrings,
		$vars = parserConfig.$vars;
	var isOperatorChar = /[+\-*&%=<>!?|]/,
		dotParen = /[\.\(\)+]/;

	function chain(stream, state, f) {
		state.tokenize = f;
		return f(stream, state);
	}

	var type;

	function ret(tp, style) {
		type = tp;
		return style;
	}

	function tokenBase(stream, state) {
		var ch = stream.next();
		if(ch == '"' || ch == "'") return chain(stream, state, tokenString(ch));
		// else if (/[\[\]{}\(\),;\:\.]/.test(ch))
		// return ret(ch);
		else if(ch == "#") {
			stream.skipToEnd();
			return ret("comment", "comment");
		} else if(/\d/.test(ch)) {
			stream.eatWhile(/[\w\.]/)
			return ret("number", "number");
		} else if(ch == "/") {
			if(stream.eat("*")) {
				return chain(stream, state, tokenComment);
			} else if(stream.eat("/")) {
				stream.skipToEnd();
				return ret("comment", "comment");
			} else {
				stream.eatWhile(isOperatorChar);
				return ret("operator", "operator");
			}
		} else if(isOperatorChar.test(ch)) {
			stream.eatWhile(isOperatorChar);
			return ret("operator");
		} else if(dotParen.test(ch)) {
			stream.eatWhile(dotParen);
			return ret("word", "pepper-dotParen");
		} else if($vars && ch == "$") {
			stream.eatWhile(/[\w\$_]/);
			return ret("word", "variable");
		} else {
			stream.eatWhile(/[\w\$_]/);
			if(keywords && keywords[stream.current()]) return ret("keyword", "keyword");
			return ret("word", "word");
		}
	}

	function tokenString(quote) {
		return function(stream, state) {
			var escaped = false,
				next, end = false;
			while((next = stream.next()) != null) {
				if(next == quote && !escaped) {
					end = true;
					break;
				}
				escaped = !escaped && next == "\\";
			}
			if(end || !(escaped || multiLineStrings)) state.tokenize = tokenBase;
			return ret("string", "string");
		};
	}

	function tokenComment(stream, state) {
		var maybeEnd = false,
			ch;
		while(ch = stream.next()) {
			if(ch == "/" && maybeEnd) {
				state.tokenize = tokenBase;
				break;
			}
			maybeEnd = (ch == "*");
		}
		return ret("comment", "comment");
	}

	function Context(indented, column, type, align, prev) {
		this.indented = indented;
		this.column = column;
		this.type = type;
		this.align = align;
		this.prev = prev;
	}

	function pushContext(state, col, type) {
		return state.context = new Context(state.indented, col, type, null, state.context);
	}

	function popContext(state) {
		return state.context = state.context.prev;
	}

	// Interface
	return {
		startState: function(basecolumn) {
			return {
				tokenize: tokenBase,
				context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
				indented: 0,
				startOfLine: true
			};
		},
		token: function(stream, state) {
			var ctx = state.context;
			if(stream.sol()) {
				if(ctx.align == null) ctx.align = false;
				state.indented = stream.indentation();
				state.startOfLine = true;
			}
			if(stream.eatSpace()) return null;
			var style = state.tokenize(stream, state);
			if(type == "comment") return style;
			if(ctx.align == null) ctx.align = true;

			if((type == ";" || type == ":") && ctx.type == "statement") popContext(state);
			else if(type == "{") pushContext(state, stream.column(), "}");
			else if(type == "[") pushContext(state, stream.column(), "]");
			else if(type == "(") pushContext(state, stream.column(), ")");
			else if(type == "}") {
				if(ctx.type == "statement") ctx = popContext(state);
				if(ctx.type == "}") ctx = popContext(state);
				if(ctx.type == "statement") ctx = popContext(state);
			} else if(type == ctx.type) popContext(state);
			else if(ctx.type == "}") pushContext(state, stream.column(), "statement");
			state.startOfLine = false;
			return style;
		},
		indent: function(state, textAfter) {
			if(state.tokenize != tokenBase) return 0;
			var firstChar = textAfter && textAfter.charAt(0),
				ctx = state.context,
				closing = firstChar == ctx.type;
			if(ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : indentUnit);
			else if(ctx.align) return ctx.column + (closing ? 0 : 1);
			else return ctx.indented + (closing ? 0 : indentUnit);
		},
		electricChars: "{}[]()"
	};
});

CodeMirror.defineMode("sequence", function() {
	return {
		token: function(stream) {
			if(stream.sol()) {
				if(stream.match(/^[\w\s\-_]+[:=\t]\s?/)) {
					return 'sequence-name';
				}
			}

			// var urlRegex = new RegExp("\b(https?|ftp|file)://[-A-Z0-9+&@#/%?=~_|!:,.;]*[A-Z0-9+&@#/%=~_|]");
			// if(stream.match(urlRegex)) {
			// return 'sequence-link';
			// }
			var ch = stream.next();
			switch(ch) {
			case '%':
			case '#':
				stream.skipToEnd();
				return "sequence-comment";
			case '>':
				stream.skipToEnd();
				return 'sequence-name';
			case 'a':
			case 'A':
				return 'sequence-a';
			case 'u':
			case 'U':
				return 'sequence-u';
			case 't':
			case 'T':
				return 'sequence-t';
			case 'c':
			case 'C':
				return 'sequence-c';
			case 'g':
			case 'G':
				return 'sequence-g';

				// Degenerate bases
			case 'n':
			case 'N':
				return 'sequence-n';
			case 'r':
			case 'R':
				return 'sequence-r';
			case 'y':
			case 'Y':
				return 'sequence-y';
			case 'k':
			case 'K':
				return 'sequence-k';
			case 'm':
			case 'M':
				return 'sequence-m';
			case 's':
			case 'S':
				return 'sequence-s';
			case 'w':
			case 'W':
				return 'sequence-w';
			case 'b':
			case 'B':
				return 'sequence-b';
			case 'd':
			case 'D':
				return 'sequence-d';
			case 'h':
			case 'H':
				return 'sequence-h';
			case 'v':
			case 'V':
				return 'sequence-v';

			}
			if(ch.match(/\d/)) {
				return 'number';
			}

		}
	};
});


CodeMirror.defineMode("dd-sequence", function() {
	return {
		token: function(stream) {
			var ch = stream.next();
			switch(ch) {
			case '%':
			case '#':
				stream.skipToEnd();
				return "sequence-comment";
			case '>':
				stream.skipToEnd();
				return 'sequence-name';
			case 'a':
				return 'sequence-a';
			case 'A':
				return 'sequence-a-lock';
			case 'u':
				return 'sequence-u';
			case 'U':
				return 'sequence-u-lock';
			case 't':
				return 'sequence-t';
			case 'T':
				return 'sequence-t-lock';
			case 'c':
				return 'sequence-c';
			case 'C':
				return 'sequence-c-lock';
			case 'g':
				return 'sequence-g';
			case 'G':
				return 'sequence-g-lock';
			case 'n':
			case 'N':
				return 'sequence-n';

			}
			if(ch.match(/\d/)) {
				return 'number';
			}

		}
	};
});

CodeMirror.defineMode("nupack", function(options,config) {
	var sequenceMode = CodeMirror.getMode(config, 'sequence');
	var ms = !! config && (config.multisubjective || config.ms);
	return {
		startState: function() {
			return {
				value: ''
			};
		},
		token: function(stream, state) {
			if(stream.eatSpace()) {
				return '';
			}

			// Beginning of line
			if(state.value == '') {
				if(stream.match('#`', true, true) || stream.match('#``', true, true)) {
					stream.skipToEnd();
					return 'builtin';
				} 
				else if (stream.match(/^(material|temperature|trials|sodium|magnesium|dangles|prevent)/,true)) {
					state.value = 'parameter';
					return 'keyword';
				} 
				else if(stream.eat('%') || stream.eat('#')) {
					stream.skipToEnd();
					return 'comment';
				} else if(stream.match('structure', true, true)) {
					state.value = 'structure-definition-left';
					return 'keyword';
				} else if(stream.match('sequence', true, true) || stream.match('domain', true, true)) {
					state.value = 'sequence-definition-left';
					return 'keyword';
				} else if(stream.match('strand', true, true)) {
					state.value = 'structure-name';
					return 'keyword';
				} else {
					if( !! ms) {
						if(stream.match('!hairpin', true, true)) {
							state.value = 'ms-definition-left';
							return 'keyword';
						} else if(stream.match('!coop', true, true)) {
							state.value = 'ms-definition-left';
							return 'keyword';
						} else if(stream.match('!bridge', true, true)) {
							state.value = 'ms-definition-left';
							return 'keyword';
						} else if(stream.match('!static', true, true)) {
							state.value = 'ms-definition-key';
							return 'keyword';
						} else if(stream.match('!length', true, true)) {
							state.value = 'sequence-definition-left';
							return 'keyword';
						} else if(stream.match('!',true,true)) {
							stream.skipToEnd();
							state.value = '';
							return 'string';
						}
					}
					state.value = 'structure-name';
				}

				
			} 

			
			else {
				switch (state.value) {
					case 'parameter':
						stream.skipToEnd();
						state.value = '';
						return 'string';

					// multisubjective
					case 'ms-definition-left': 
						stream.eatWhile(/\S/);
						state.value = 'ms-definition-assign';
						return 'string';
					case 'ms-definition-assign':
						stream.eatSpace();

						// stream.eatWhile(/[\S:]/);
						if(stream.match(':',true,true))
							state.value = 'ms-definition-right'
						else if(stream.match("=",true,true))
							state.value = 'ms-definition-right'
						else {
							stream.skipToEnd();
							state.value = '';
							return 'nupack-error'
						}
						
						// state.value = 'sequence-definition-right';
						return 'operator';
					
					case 'ms-definition-right':
						state.value = '';
						return '';
					case 'ms-definition-key':
						stream.eatWhile(/\S/);
						state.value = '';
						return 'string';
						
					

					// structure (name) = (spec in HU+)
					case 'structure-definition-left': 
						stream.eatWhile(/\S/);
						state.value = 'structure-definition-assign';
						return 'nupack-structure';
					case 'structure-definition-assign':
						stream.eatWhile(/[\S=]/);
						state.value = 'structure-definition-right';
						return 'operator';
					case 'structure-definition-right':
						stream.skipToEnd();
						state.value = '';
						return 'nupack-huplus';


					// sequence (name) = (spec)
					// sequence (name) : (spec)
					// domain (name) = (spec)
					// domain (name) : (spec)
					case 'sequence-definition-left':
						stream.eatWhile(/\S/);
						state.value = 'sequence-definition-assign';
						return 'string';
					case 'sequence-definition-assign':
						stream.eatWhile(/[\S=]/);
						state.value = 'sequence-definition-right';
						return 'operator';
					case 'sequence-definition-right':
						var token = sequenceMode.token(stream);
						if(stream.eol()) {
							state.value = '';
						}
						return token;
					case 'structure-name':
						stream.eatWhile(/\S/);
						state.value = 'structure-assign';
						return 'variable';
					case 'structure-assign':
						if(stream.eat('=') || stream.eat(':')) {
							state.value = 'structure-thread'
							return 'operator';
						} else if(stream.eat('<')) {
							state.value = 'structure-objection';
							return 'operator';
						} else {
							stream.skipToEnd();
							state.value = '';
							return 'nupack-error';
						}
					case 'structure-thread':
						stream.skipToEnd();
						state.value = '';
						return 'string';
					case 'structure-objection':
						stream.skipToEnd();
						state.value = '';
						return 'qualifier';
				}
			}
		}
	};
});

CodeMirror.defineMode("dil-domains", function(config) {
	var sequenceMode = CodeMirror.getMode(config, 'sequence');
	return {
		startState: function() {
			return {
				expects: ''
			};
		},
		token: function(stream, state) {


			switch(state.expects) {
				// Beginning of line
			case '':
				if(stream.match(/^[^\[\]]+$/,false)) {
					state.expects = 'segment-block';
					return '';
				}

				if(stream.eatSpace()) {
					return '';
				} else if(stream.eatWhile(/^\w+/)) {
					state.expects = 'domain-block-open';
					return 'variable'
				}
				return '';
			case 'domain-block-open':
				if(stream.eat('[')) {
					state.expects = 'domain-block'
					return 'bracket';
				}

				stream.skipToEnd();
				state.expects = '';
				return 'error';

			case 'domain-block':
				if(stream.eatSpace()) {
					return '';
				}

				if(stream.eat(']')) {
					state.expects = 'domain-block-specifier'
					return 'bracket'
				} else if(stream.match(/^[\w\*']+/)) {
					state.expects = 'segment-block'
					return 'variable-2'
				}

				stream.skipToEnd();
				state.expects = '';
				return 'error';

			case 'segment-block':
				if(stream.match(/^\(\d+\)/)) {
					state.expects = 'segment-block-specifier'
					return 'number'
				} else if(stream.eat(':')) {
					state.expects = 'segment-block-specifier'
					return 'operator'
				}
				stream.eatSpace();
				state.expects = 'domain-block';
				return '';
			case 'segment-block-specifier':
				if(stream.match(/^\w+/)) {
					state.expects = 'domain-block';
					return 'keyword'
				}
				stream.eatSpace()
				state.expects = 'domain-block';
				return '';
			case 'domain-block-specifier':
				if(stream.match(/^\w+/)) {
					state.expects = 'domain-block-polarity'
					return 'keyword'
				}
				state.expects = 'domain-block-polarity';
				return '';
			case 'domain-block-polarity':
				if(stream.eat(/[\+-0]/)) {
					state.expects = '';
					return 'atom'
				}
				state.expects = '';
				return '';

			}

		}
	};
});



CodeMirror.tokenize = function(string, modespec, callback) {
	var mode = CodeMirror.getMode({
		indentUnit: 2
	}, modespec);
	var lines = CodeMirror.splitLines(string),
		state = CodeMirror.startState(mode),
		stream, out = [];
	for(var i = 0, e = lines.length; i < e; ++i) {
		out[i] = [];
		stream = new CodeMirror.StringStream(lines[i]);
		while(!stream.eol()) {
			var style = mode.token(stream, state);
			if( !! style) {
				out[i].push([style, stream.current()]);
			}
			stream.start = stream.pos;
		}
	}
	return out;
}

CodeMirror.modeRenderer = function(mode, wrapperCls) {
	wrapperCls || (wrapperCls = '');
	return function(v) {
		var x = {
			innerHTML: '',
			nodeType: 1
		};
		CodeMirror.runMode(v, mode, x);
		if( !! wrapperCls) {
			return '<span class="' + wrapperCls + '">' + x.innerHTML + '</span>';
		} else {
			return x.innerHTML;
		}
	}
}

CodeMirror.renderMode = function(mode, v) {
	var x = {
		innerHTML: '',
		nodeType: 1
	};
	CodeMirror.runMode(v, mode, x);
	return x.innerHTML;
}

CodeMirror.getModeRenderer = function(modespec, options) {
	function esc(str) {
		return !!str ? str.replace(/[<&]/g, function(ch) {
			return ch == "<" ? "&lt;" : "&amp;";
		}) : '';
	}

	var mode = CodeMirror.getMode(CodeMirror.defaults, modespec);
	var tabSize = (options && options.tabSize) || CodeMirror.defaults.tabSize;
	var renderer = options.renderer || function(text,style,col) {
		if(style) 
			return "<span class=\"cm-" + style + "\">" + text + "</span>"
		else 
			return text;
	}
	return function(string) {
		string = string || '';

		var accum = [],
			col = 0;
		callback = function(text, style) {
			if(text == "\n") {
				accum.push("<br>");
				col = 0;
				return;
			}
			var escaped = "";
			// HTML-escape and replace tabs
			for(var pos = 0;;) {
				var idx = text.indexOf("\t", pos);
				if(idx == -1) {
					escaped += esc(text.slice(pos));
					col += text.length - pos;
					break;
				} else {
					col += idx - pos;
					escaped += esc(text.slice(pos, idx));
					var size = tabSize - col % tabSize;
					col += size;
					for(var i = 0; i < size; ++i) escaped += " ";
					pos = idx + 1;
				}
			}

			accum.push(renderer(escaped,esc(style),col))
		};

		var lines = CodeMirror.splitLines(string),
			state = CodeMirror.startState(mode);
		for(var i = 0, e = lines.length; i < e; ++i) {
			if(i) callback("\n");
			var stream = new CodeMirror.StringStream(lines[i]);
			while(!stream.eol()) {
				var style = mode.token(stream, state);
				callback(stream.current(), style, i, stream.start);
				stream.start = stream.pos;
			}
		}
		return accum.join("");
	}


};