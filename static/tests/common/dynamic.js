function names(list) {
	return _.map(list, function(x) {
		return x.getName()
	});
}

function ids(list) {
	return _.map(list, function(x) {
		return x.getIdentifier()
	});
}

// ---------------------------------------------------------------------------

module("App.dynamic.Node");

test("getOrderedSegmentwiseStructure",function () {
	var s1 = new App.dynamic.Node({
		name: 'n1',
		polarity: -1,
		domains: 'd1[s1 s2 s3]- d2[s2* s1* s4]+',
		structure: '((.)).',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(s1.getOrderedSegmentwiseStructure().toDotParen(),'.((.))','One strand, created from `domains`');

	var s3 = new App.dynamic.Node({
		name: 'n3',
		polarity: 1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s3* s2*]+',
			polarity: 1,
			structure: '.((.))'
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(s3.getOrderedSegmentwiseStructure().toDotParen(),'.((.))','One strand, created from strands[]');

	var s5 = new App.dynamic.Node({
		name: 'n5',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity: 1
		}, {
			name: 'S2',
			domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
			polarity: 1
		}],
		structure: '.(((..+...)))',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(s5.getOrderedSegmentwiseStructure().toDotParen(),'(((...+..))).','Two strands, (-) node polarity');

	var s6 = new App.dynamic.Node({
		name: 'n5',
		polarity: 1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity: 1,
			structure: '.(((..',
		}, {
			name: 'S2',
			domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
			polarity: -1,
			structure: '(((...'
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(s6.getOrderedSegmentwiseStructure().toDotParen(),'.(((..+...)))','Two strands, (-) opposite polarities');

	var s7 = new App.dynamic.Node({
		name: 'n5',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity: 1,
			structure: '.(((..',
		}, {
			name: 'S2',
			domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
			polarity: -1,
			structure: '(((...'
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(s7.getOrderedSegmentwiseStructure().toDotParen(),'(((...+..))).','Two strands');

})

test("getOrderedSegments", function() {
	var s1 = new App.dynamic.Node({
		name: 'n1',
		polarity: -1,
		domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s1.getOrderedSegments()), ['s6', 's5', 's4', 's3', 's2', 's1'], '(-) Node with auto-created (+) strand');

	var s2 = new App.dynamic.Node({
		name: 'n2',
		polarity: 1,
		domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s2.getOrderedSegments()), 's1 s2 s3 s4 s5 s6'.split(' '), '(+) Node with auto-created (+) strand');

	var s3 = new App.dynamic.Node({
		name: 'n3',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity: 1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s3.getOrderedSegments()), ['s6', 's5', 's4', 's3', 's2', 's1'], '(-) Node with manually-created (+) strand');

	var s4 = new App.dynamic.Node({
		name: 'n4',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity: -1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s4.getOrderedSegments()), 's1 s2 s3 s4 s5 s6'.split(' '), '(-) Node with manually-created (-) strand');

	var s5 = new App.dynamic.Node({
		name: 'n5',
		polarity: 1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity: -1
		}, {
			name: 'S2',
			domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
			polarity: 1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s5.getOrderedSegments()), 's6 s5 s4 s3 s2 s1 s7 s8 s9 s10 s11 s12'.split(' '), '(+) Node with manually-created (-) strand and (+) strand');

	var s6 = new App.dynamic.Node({
		name: 'n6',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity: -1
		}, {
			name: 'S2',
			domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
			polarity: 1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s6.getOrderedSegments()), 's12 s11 s10 s9 s8 s7 s1 s2 s3 s4 s5 s6'.split(' '), '(-) Node with manually-created (-) strand and (+) strand');

})
module("App.dynamic.Strand");
test("getOrderedSegments", function() {
	var s1 = new App.dynamic.Strand({
		name: 'S1',
		polarity: -1,
		domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s1.getOrderedSegments()), ['s6', 's5', 's4', 's3', 's2', 's1']);

	var s2 = new App.dynamic.Strand({
		name: 'D2',
		polarity: -1,
		domains: 'A[a x:c b c]i+ s[s(1)]x B[d e y:c c*]o- C[b* x*:c f g]o+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s2.getOrderedSegments()), 'g f x* b* c* y e d s c b x a'.split(' '));

	var s3 = new App.dynamic.Strand({
		name: 'D2',
		polarity: 1,
		domains: 'A[a x:c b c]i+ s[s(1)]x B[d e y:c c*]o- C[b* x*:c f g]o+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s3.getOrderedSegments()), 'a x b c s d e y c* b* x* f g'.split(' '));
})
module("App.dynamic.Strand");
test("segmentLength", function() {
	var segmentLength = 7,
		clampLength = 2,
		toeholdLength = 6;
	var lib = new App.dynamic.Library({
		parameters: {
			segmentLength: segmentLength,
			clampLength: clampLength,
			toeholdLength: toeholdLength
		}
	})
	var s1 = new App.dynamic.Segment({
		name: 's1',
		library: lib,
		role: 'toehold'
	}),
		s2 = new App.dynamic.Segment({
			name: 's2',
			library: lib,
			role: 'clamp'
		}),
		s3 = new App.dynamic.Segment({
			name: 's3',
			library: lib,
		})
		equal(s1.getLength(), toeholdLength)
		equal(s2.getLength(), clampLength)
		equal(s3.getLength(), segmentLength)
})

// ---------------------------------------------------------------------------

module("App.dynamic.Library");
test("DIL output", function() {
	var originalLib = new App.dynamic.Library({
		nodes: [{
			name: 'n1',
			polarity: -1,
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			structure: '......',
		}, {
			name: 'n2',
			polarity: 1,
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			structure: '......',
		}, {
			name: 'n3',
			polarity: -1,
			strands: [{
				name: 'S1',
				domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
				polarity: 1,
				structure: '......',
			}],
		}, {
			name: 'n4',
			polarity: -1,
			strands: [{
				name: 'S1',
				domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
				polarity: -1,
				structure: '......',
			}],
		}, {
			name: 'n5',
			polarity: 1,
			strands: [{
				name: 'S1',
				domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
				polarity: -1,
				structure: '......',
			}, {
				name: 'S2',
				domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
				polarity: 1,
				structure: '......',
			}],
		}, {
			name: 'n6',
			polarity: -1,
			structure: '......+......',
			strands: [{
				name: 'S1',
				domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
				polarity: -1,
			}, {
				name: 'S2',
				domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
				polarity: 1,
			}],
		}],
	}),
		dilOutput = originalLib.toDilOutput(),
		parsedDil = JSON.parse(dilOutput),
		dilLib = App.dynamic.Library.fromDil(parsedDil);

	//deepEqual(originalLib,dilLib)
	expect(0)
})

// ---------------------------------------------------------------------------

module("App.dynamic.Compiler");
test("parseSegmentString", function() {
	var input1 = "a b:t c(4) d(5)c",
		output1 = [{
			name: 'a'
		}, {
			name: 'b',
			role: 'toehold',
		}, {
			name: 'c',
			length: 4,
		}, {
			name: 'd',
			length: 5,
			role: 'clamp'
		}],
		input2 = "a* b*:t b*t c*(4) d*(5)c",
		output2 = [{
			name: 'a*'
		}, {
			name: 'b*',
			role: 'toehold',
		}, {
			name: 'b*',
			role: 'toehold',
		}, {
			name: 'c*',
			length: 4,
		}, {
			name: 'd*',
			length: 5,
			role: 'clamp'
		}],
		input3 = 's(1)',
		output3 = [{
			name: 's',
			length: 1
		}]

	deepEqual(App.dynamic.Compiler.parseSegmentString(input1), output1, "Segment string");
	deepEqual(App.dynamic.Compiler.parseSegmentString(input2), output2, "Segment string with complements");
	deepEqual(App.dynamic.Compiler.parseSegmentString(input3), output3, "Single segment");

});
test("parseDomainString", function() {
	var input1 = "d1[a(5):t]i- d2[b*]+",
		output1 = [{
			name: 'd1',
			segments: [{
				name: 'a',
				length: 5,
				role: 'toehold',
			}],
			polarity: '-',
			role: 'input'
		}, {
			name: 'd2',
			segments: [{
				name: 'b*'
			}],
			polarity: '+',
		}],
		input2 = 's[s(1)]x',
		output2 = [{
			'name': 's',
			'role': 'structural',
			'segments': [{
				name: 's',
				length: 1
			}]
		}],
		input3 = 'A[a x:c b c]i+ s[s*(1)]x B[d e y:c c*]o-',
		output3 = [{
			'name': 'A',
			'role': 'input',
			'polarity': '+',
			'segments': [{
				name: 'a'
			}, {
				name: 'x',
				role: 'clamp'
			}, {
				name: 'b'
			}, {
				name: 'c'
			}]
		}, {
			'name': 's',
			'role': 'structural',
			'segments': [{
				name: 's*',
				length: 1
			}]
		}, {
			'name': 'B',
			'role': 'output',
			'polarity': '-',
			'segments': [{
				name: 'd'
			}, {
				name: 'e'
			}, {
				name: 'y',
				role: 'clamp'
			}, {
				name: 'c*'
			}]
		}]

		deepEqual(App.dynamic.Compiler.parseDomainString(input1), output1, "Domain String");
	deepEqual(App.dynamic.Compiler.parseDomainString(input2), output2, "Single-segment Domain String");
	deepEqual(App.dynamic.Compiler.parseDomainString(input3), output3, "Domain String");
});
test("parseDomainOrSegmentString", function() {

	// Test domain inputs
	var input1 = "d1[a(5):t]i- d2[b*]+",
		output1 = [{
			name: 'd1',
			segments: [{
				name: 'a',
				length: 5,
				role: 'toehold',
			}],
			polarity: '-',
			role: 'input'
		}, {
			name: 'd2',
			segments: [{
				name: 'b*'
			}],
			polarity: '+',
		}],
		input2 = 's[s(1)]x',
		output2 = [{
			'name': 's',
			'role': 'structural',
			'segments': [{
				name: 's',
				length: 1
			}]
		}],
		input3 = 'A[a x:c b c]i+ s[s*(1)]x B[d e y:c c*]o-',
		output3 = [{
			'name': 'A',
			'role': 'input',
			'polarity': '+',
			'segments': [{
				name: 'a'
			}, {
				name: 'x',
				role: 'clamp'
			}, {
				name: 'b'
			}, {
				name: 'c'
			}]
		}, {
			'name': 's',
			'role': 'structural',
			'segments': [{
				name: 's*',
				length: 1
			}]
		}, {
			'name': 'B',
			'role': 'output',
			'polarity': '-',
			'segments': [{
				name: 'd'
			}, {
				name: 'e'
			}, {
				name: 'y',
				role: 'clamp'
			}, {
				name: 'c*'
			}]
		}]

	deepEqual(App.dynamic.Compiler.parseDomainOrSegmentString(input1), output1, "Domain String");
	deepEqual(App.dynamic.Compiler.parseDomainOrSegmentString(input2), output2, "Single-segment Domain String");
	deepEqual(App.dynamic.Compiler.parseDomainOrSegmentString(input3), output3, "Domain String");

	// Test segment inputs
	var input1 = "a b:t c(4) d(5)c",
		output1 = [{
			name: 'A',
			polarity: 1,
			role: '',
			segments: [{
				name: 'a'
			}, {
				name: 'b',
				role: 'toehold',
			}, {
				name: 'c',
				length: 4,
			}, {
				name: 'd',
				length: 5,
				role: 'clamp'
			}]
		}],
		input2 = "a* b*:t b*t c*(4) d*(5)c",
		output2 = [{
			name: 'A',
			polarity: 1,
			role: '',
			segments: [{
				name: 'a*'
			}, {
				name: 'b*',
				role: 'toehold',
			}, {
				name: 'b*',
				role: 'toehold',
			}, {
				name: 'c*',
				length: 4,
			}, {
				name: 'd*',
				length: 5,
				role: 'clamp'
			}]
		}],
		input3 = 's(1)',
		output3 = [{
			name: 'A',
			polarity: 1,
			role: '',
			segments: [{
				name: 's',
				length: 1
			}]
		}];

	deepEqual(App.dynamic.Compiler.parseDomainOrSegmentString(input1), output1, "Segment string");
	deepEqual(App.dynamic.Compiler.parseDomainOrSegmentString(input2), output2, "Segment string with complements");
	deepEqual(App.dynamic.Compiler.parseDomainOrSegmentString(input3), output3, "Single segment");

});
test("printDomainString", function() {
	function makeDomains(doms) {
		var lib = App.dynamic.Library.dummy();
		return _.map(doms, function(dom) {
			dom.library = lib;
			return new App.dynamic.Domain(dom);
		})
	}

	// Omitting lengths
	var input1 = 'A[a(8) x(2)c b(7) c(4)]i+ s[s(1)]x B[d(3) e(15) y(3)c c*(2)]o- C[b* x*:c f g]o+',
		output1 = 'A[a x:c b c]i+ s[s]x0 B[d e y:c c*]o- C[b* x*:c f g]o+',
		doms1 = makeDomains(App.dynamic.Compiler.parseDomainString(input1)),
		input2 = 's[s(1)]x',
		output2 = 's[s]x0',
		doms2 = makeDomains(App.dynamic.Compiler.parseDomainString(input2)),
		input3 = 'A[a x:c b c]i+ s[s*(1)]x0 B[d e y:c c*]o-',
		output3 = 'A[a x:c b c]i+ s[s*]x0 B[d e y:c c*]o-',
		doms3 = makeDomains(App.dynamic.Compiler.parseDomainString(input3));

	deepEqual(App.dynamic.Compiler.printDomainString(doms1, 1, true), output1, "Omitting lengths");
	deepEqual(App.dynamic.Compiler.printDomainString(doms2, 1, true), output2, "Omitting lengths");
	deepEqual(App.dynamic.Compiler.printDomainString(doms3, 1, true), output3, "Omitting lengths");

	// Including lengths
	var input1 = 'A[a(8) x(2)c b(7) c(4)]i+ s[s(1)]x0 B[d(3) e(15) y(3)c c*(2)]o- C[b*(3) x*(14)c f(8) g(12)]o+',
		output1 = input1,
		doms1 = makeDomains(App.dynamic.Compiler.parseDomainString(input1)),
		input2 = 's[s(1)]x0',
		output2 = input2,
		doms2 = makeDomains(App.dynamic.Compiler.parseDomainString(input2)),
		input3 = 'A[a x:c b c]i+ s[s*(1)]x B[d e y:c c*]o-',
		output3 = 'A[a(8) x(2)c b(8) c(8)]i+ s[s*(1)]x0 B[d(8) e(8) y(2)c c*(8)]o-';
	doms3 = makeDomains(App.dynamic.Compiler.parseDomainString(input3));

	deepEqual(App.dynamic.Compiler.printDomainString(doms1, 1, false), output1, "Including lengths");
	deepEqual(App.dynamic.Compiler.printDomainString(doms2, 1, false), output2, "Including lengths");
	deepEqual(App.dynamic.Compiler.printDomainString(doms3, 1, false), output3, "Including lengths");

	// Flipping polarity
	var input1 = 'A[a(8) x(2)c b(7) c(4)]i+ s[s(1)]x0 B[d(3) e(15) y(3)c c*(2)]o- C[b*(3) x*(14)c f(8) g(12)]o+',
		output1 = 'C[g(12) f(8) x*(14)c b*(3)]o+ B[c*(2) y(3)c e(15) d(3)]o- s[s(1)]x0 A[c(4) b(7) x(2)c a(8)]i+',
		doms1 = makeDomains(App.dynamic.Compiler.parseDomainString(input1)),
		input2 = 's[s(1)]x0',
		output2 = 's[s(1)]x0',
		doms2 = makeDomains(App.dynamic.Compiler.parseDomainString(input2)),
		input3 = 'A[a x:c b c]i+ s[s*(1)]x B[d e y:c c*]o-',
		output3 = 'B[c*(8) y(2)c e(8) d(8)]o- s[s*(1)]x0 A[c(8) b(8) x(2)c a(8)]i+';
	doms3 = makeDomains(App.dynamic.Compiler.parseDomainString(input3));

	deepEqual(App.dynamic.Compiler.printDomainString(doms1, -1, false), output1, "Flipping polarity");
	deepEqual(App.dynamic.Compiler.printDomainString(doms2, -1, false), output2, "Flipping polarity");
	deepEqual(App.dynamic.Compiler.printDomainString(doms3, -1, false), output3, "Flipping polarity");

})