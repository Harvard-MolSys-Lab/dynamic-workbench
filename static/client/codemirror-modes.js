// CodeMirror.defineMode("nupack", function(config) {
	// var sequenceMode = CodeMirror.getMode(config,'sequence');
	// return {
		// startState: function() {
			// return {value:''};
		// },
		// token: function(stream,state) {
			// stream.eatSpace();
			// if(state.value=='') {
				// if(stream.eat('%')) {
					// stream.skipToEnd();
					// return 'nupack-comment';
				// } else 	if(stream.match('structure',true,true)) {
					// state.value = 'structure-definition-left';
					// return 'nupack-keyword';
				// } else if(stream.match('sequence',true,true)) {
					// state.value = 'sequence-definition-left';
					// return 'nupack-keyword';
				// } else {
					// state.value='structure-name';
				// }
			// } else if(state.value=='structure-definition') {
				// if(stream.eat('[')) {
					// state.value = 'structure-definition-param';
					// return 'pepper-param';
				// } else {
					// state.value = 'structure-definition-left';
					// return '';
				// }
			// } else if(state.value=='structure-definition-param') {
			// stream.eatWhile(function(c) {return (c!=']')});
			// return 'pepper-param';
			// } else if(state.value=='structure-definition-left') {
				// stream.eatWhile(/\S/);
				// state.value = 'structure-definition-assign';
				// return 'nupack-structure';
			// } else if(state.value=='structure-definition-assign') {
				// stream.eatWhile(/[\S=]/);
				// state.value = 'structure-definition-right';
				// return '';
			// } else if(state.value=='structure-definition-right') {
				// //stream.eatWhile(/[HhUu\d]/);
				// // if(stream.eol()) {
					// // state.value='';
					// // return 'nupack-huplus'
				// // }
				// stream.skipToEnd();
				// state.value='';
				// return 'nupack-huplus';
			// } else if(state.value=='sequence-definition-left') {
				// stream.eatWhile(/\S/);
				// state.value = 'sequence-definition-assign';
				// return 'nupack-sequence';
			// } else if(state.value=='sequence-definition-assign') {
				// stream.eatWhile(/[\S=]/);
				// state.value = 'sequence-definition-right';
				// return '';
			// } else if(state.value=='sequence-definition-right') {
				// var token;
				// if(stream.eat(':')) {
					// token = 'param'
				// } else {
					// token = sequenceMode.token(stream);
				// }
				// if(stream.eol()) {
					// state.value='';
				// }
				// return token;
			// } else if(state.value=='structure-name') {
				// stream.eatWhile(/\S/);
				// state.value = 'structure-assign';
				// return 'nupack-structure';
			// } else if(state.value=='structure-assign') {
				// if(stream.eat(':')) {
					// state.value = 'structure-thread'
					// return '';
				// } else if(stream.eat('<')) {
					// state.value = 'structure-objection';
					// return '';
				// } else {
					// stream.skipToEnd();
					// state.value = '';
					// return 'nupack-error';
				// }
			// } else if(state.value=='structure-thread') {
				// stream.skipToEnd();
				// state.value='';
				// return 'nupack-sequence';
			// } else if(state.value=='param') {
				// stream.skipToEnd();
				// state.value='';
				// return 'nupack-param';
			// }
		// }
	// };
// });
CodeMirror.defineMode("pepper", function(config, parserConfig) {
	var indentUnit = config.indentUnit, keywords = (function() {
		function makeKeywords(str) {
			var obj = {}, words = str.split(" ");
			for (var i = 0; i < words.length; ++i)
				obj[words[i]] = true;
			return obj;
		}

		var pilKeywords = "declare import component system sequence strand structure kinetic equal noninteracting";
		return makeKeywords(pilKeywords);
	})(),
	cpp = parserConfig.useCPP, multiLineStrings = parserConfig.multiLineStrings, $vars = parserConfig.$vars;
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
		if (ch == '"' || ch == "'")
			return chain(stream, state, tokenString(ch));
		// else if (/[\[\]{}\(\),;\:\.]/.test(ch))
			// return ret(ch);
		else if (ch == "#") {
			stream.skipToEnd();
			return ret("comment", "comment");
		} else if (/\d/.test(ch)) {
			stream.eatWhile(/[\w\.]/)
			return ret("number", "number");
		} else if (ch == "/") {
			if (stream.eat("*")) {
				return chain(stream, state, tokenComment);
			} else if (stream.eat("/")) {
				stream.skipToEnd();
				return ret("comment", "comment");
			} else {
				stream.eatWhile(isOperatorChar);
				return ret("operator","operator");
			}
		} else if (isOperatorChar.test(ch)) {
			stream.eatWhile(isOperatorChar);
			return ret("operator");
		} else if (dotParen.test(ch)) {
			stream.eatWhile(dotParen);
			return ret("word","pepper-dotParen");
		} else if ($vars && ch == "$") {
			stream.eatWhile(/[\w\$_]/);
			return ret("word", "variable");
		} else {
			stream.eatWhile(/[\w\$_]/);
			if (keywords && keywords[stream.current()])
				return ret("keyword", "keyword");
			return ret("word", "word");
		}
	}

	function tokenString(quote) {
		return function(stream, state) {
			var escaped = false, next, end = false;
			while ((next = stream.next()) != null) {
				if (next == quote && !escaped) {
					end = true;
					break;
				}
				escaped = !escaped && next == "\\";
			}
			if (end || !(escaped || multiLineStrings))
				state.tokenize = tokenBase;
			return ret("string", "string");
		};
	}

	function tokenComment(stream, state) {
		var maybeEnd = false, ch;
		while (ch = stream.next()) {
			if (ch == "/" && maybeEnd) {
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
			if (stream.sol()) {
				if (ctx.align == null)
					ctx.align = false;
				state.indented = stream.indentation();
				state.startOfLine = true;
			}
			if (stream.eatSpace())
				return null;
			var style = state.tokenize(stream, state);
			if (type == "comment")
				return style;
			if (ctx.align == null)
				ctx.align = true;

			if ((type == ";" || type == ":") && ctx.type == "statement")
				popContext(state);
			else if (type == "{")
				pushContext(state, stream.column(), "}");
			else if (type == "[")
				pushContext(state, stream.column(), "]");
			else if (type == "(")
				pushContext(state, stream.column(), ")");
			else if (type == "}") {
				if (ctx.type == "statement")
					ctx = popContext(state);
				if (ctx.type == "}")
					ctx = popContext(state);
				if (ctx.type == "statement")
					ctx = popContext(state);
			} else if (type == ctx.type)
				popContext(state);
			else if (ctx.type == "}")
				pushContext(state, stream.column(), "statement");
			state.startOfLine = false;
			return style;
		},
		indent: function(state, textAfter) {
			if (state.tokenize != tokenBase)
				return 0;
			var firstChar = textAfter && textAfter.charAt(0), ctx = state.context, closing = firstChar == ctx.type;
			if (ctx.type == "statement")
				return ctx.indented + (firstChar == "{" ? 0 : indentUnit);
			else if (ctx.align)
				return ctx.column + (closing ? 0 : 1);
			else
				return ctx.indented + (closing ? 0 : indentUnit);
		},
		electricChars: "{}[]()"
	};
});

CodeMirror.defineMode("sequence", function() {
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
					return 'sequence-a';
				case 'u':
					return 'sequence-u';
				case 'U':
					return 'sequence-u';
				case 't':
					return 'sequence-t';
				case 'T':
					return 'sequence-t';
				case 'c':
					return 'sequence-c';
				case 'C':
					return 'sequence-c';
				case 'g':
					return 'sequence-g';
				case 'G':
					return 'sequence-g';
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

CodeMirror.defineMode("nupack", function(config) {
	var sequenceMode = CodeMirror.getMode(config,'sequence');
	return {
		startState: function() {
			return {value:''};
		},
		token: function(stream,state) {
			if(stream.eatSpace()) {
				return '';
			}
			if(state.value=='') {
				if(stream.eat('%')) {
					stream.skipToEnd();
					return 'comment';
				} else 	if(stream.match('structure',true,true)) {
					state.value = 'structure-definition-left';
					return 'keyword';
				} else if(stream.match('sequence',true,true)) {
					state.value = 'sequence-definition-left';
					return 'keyword';
				} else {
					state.value='structure-name';
				}
			} else if(state.value=='structure-definition-left') {
				stream.eatWhile(/\S/);
				state.value = 'structure-definition-assign';
				return 'nupack-structure';
			} else if(state.value=='structure-definition-assign') {
				stream.eatWhile(/[\S=]/);
				state.value = 'structure-definition-right';
				return 'operator';
			} else if(state.value=='structure-definition-right') {
				//stream.eatWhile(/[HhUu\d]/);
				// if(stream.eol()) {
					// state.value='';
					// return 'nupack-huplus'
				// }
				stream.skipToEnd();
				state.value='';
				return 'nupack-huplus';
			} else if(state.value=='sequence-definition-left') {
				stream.eatWhile(/\S/);
				state.value = 'sequence-definition-assign';
				return 'string';
			} else if(state.value=='sequence-definition-assign') {
				stream.eatWhile(/[\S=]/);
				state.value = 'sequence-definition-right';
				return 'operator';
			} else if(state.value=='sequence-definition-right') {
				var token = sequenceMode.token(stream);
				if(stream.eol()) {
					state.value='';
				}
				return token;
			} else if(state.value=='structure-name') {
				stream.eatWhile(/\S/);
				state.value = 'structure-assign';
				return 'variable';
			} else if(state.value=='structure-assign') {
				if(stream.eat(':')) {
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
			} else if(state.value=='structure-thread') {
				stream.skipToEnd();
				state.value='';
				return 'string';
			} else if(state.value=='structure-objection') {
				stream.skipToEnd();
				state.value='';
				return 'qualifier';
			}
		}
	};
});

	
CodeMirror.tokenize = function(string,modespec,callback) {
	var mode = CodeMirror.getMode({indentUnit: 2}, modespec);
	var lines = CodeMirror.splitLines(string), state = CodeMirror.startState(mode), stream, out = [];
	for (var i = 0, e = lines.length; i < e; ++i) {
		out[i] = [];
		stream = new CodeMirror.StringStream(lines[i]);
		while (!stream.eol()) {
			var style = mode.token(stream, state);
			if(!!style) {
				out[i].push([style,stream.current()]);
			}
			stream.start = stream.pos;
		}
	}
	return out;
}
