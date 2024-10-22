module('DNA Utils');
test('DUtoDotParen', function() {
	equal(DNA.DUtoDotParen('U4'), '....', 'Single-stranded');
	equal(DNA.DUtoDotParen('D4(U4)'), '((((....))))', 'Hairpin');
	equal(DNA.DUtoDotParen('U3 D4(U4)'), '...((((....))))', 'Left-toehold hairpin');
	equal(DNA.DUtoDotParen('D4(U4) U5'), '((((....)))).....', 'Right-overhang hairpin');
	equal(DNA.DUtoDotParen('U3 D4(U4) U5'), '...((((....)))).....', 'Left/right overhand hairpin');
	equal(DNA.DUtoDotParen('D4(+)'), '((((+))))', 'Helix with strand break');

	equal(DNA.DUtoDotParen('U3 H4(U4) D3(U5)'), DNA.DUtoDotParen('U3 D4(U4) D3(U5)'), 'HU+ allowed too')

	equal(DNA.DUtoDotParen('D3(U3 D2(U2))'), '(((...((..)))))', 'Left bulge')
	equal(DNA.DUtoDotParen('D3(D2(U2) U3)'), '(((((..))...)))', 'Right bulge')

	equal(DNA.DUtoDotParen('U2 D3(+) U3 D4(+)'), '..(((+)))...((((+))))', 'Sequential helicies')

	equal(DNA.DUtoDotParen('U4 D3(D2(U2 + U2) U2 D2(+)) U3'), '....(((((..+..))..((+)))))...', "Complex example");
})

test('dotParenToDU', function() {
	equal('U4', DNA.dotParenToDU('....'), 'Single-stranded');
	equal(DNA.dotParenToDU('((((....))))'), 'D4(U4)', 'Hairpin');
	equal(DNA.dotParenToDU('...((((....))))'), 'U3 D4(U4)', 'Left-toehold hairpin');
	equal(DNA.dotParenToDU('((((....)))).....'), 'D4(U4) U5', 'Right-overhang hairpin');
	equal(DNA.dotParenToDU('...((((....)))).....'), 'U3 D4(U4) U5', 'Left/right overhand hairpin');
	equal(DNA.dotParenToDU('((((+))))'), 'D4(+)', 'Helix with strand break');

	equal(DNA.dotParenToDU('(((...((..)))))'), 'D3(U3 D2(U2))', 'Left bulge')
	equal(DNA.dotParenToDU('(((((..))...)))'), 'D3(D2(U2) U3)', 'Right bulge')

	equal(DNA.dotParenToDU('..(((+)))...((((+))))'), 'U2 D3(+) U3 D4(+)', 'Sequential helicies')


	equal(DNA.dotParenToDU('....(((((..+..))..((+)))))...'), 'U4 D3(D2(U2 + U2) U2 D2(+)) U3', "Complex example");
})

test('dotParenToBaseMap', function () {
	deepEqual(DNA.dotParenToBaseMap('.(.)'), {"map":{"1":3,"3":1},"breaks":{}}, 'Simple');
	deepEqual(DNA.dotParenToBaseMap('.((.).)'), {"map":{"1":6,"2":4,"4":2,"6":1},"breaks":{}}, 'Complex nesting');

	deepEqual(DNA.dotParenToBaseMap('.(+.)'), {"map":{"1":3,"3":1},"breaks":{"2":true}}, 'Simple with breaks');
	deepEqual(DNA.dotParenToBaseMap('.+((.+)+.)'), {"map":{"1":6,"2":4,"4":2,"6":1},"breaks":{"1":true,"4":true,"5":true}}, 'Complex nesting with breaks');


})

test('parseIdentifier', function() {
	deepEqual(DNA.parseIdentifier("1"), {
		identity: '1',
		polarity: 1
	}, 'No complement');
	deepEqual(DNA.parseIdentifier("a1"), {
		identity: 'a1',
		polarity: 1
	}, 'Alphanum, no complement');

	deepEqual(DNA.parseIdentifier("1*"), {
		identity: '1',
		polarity: -1
	}, 'Numeric, * complement');
	deepEqual(DNA.parseIdentifier("1'"), {
		identity: '1',
		polarity: -1
	}, "Numeric, ' complement");
	deepEqual(DNA.parseIdentifier("a1*"), {
		identity: 'a1',
		polarity: -1
	}, "Alphanum, * complement");
	deepEqual(DNA.parseIdentifier("a1'"), {
		identity: 'a1',
		polarity: -1
	}, "Alphanum, ' complement");


	deepEqual(DNA.parseIdentifier("a1' "), {
		identity: 'a1',
		polarity: -1
	}, "Alphanum, ' complement, trailing space");
	deepEqual(DNA.parseIdentifier("a1* "), {
		identity: 'a1',
		polarity: -1
	}, "Alphanum, * complement, trailing space");
	deepEqual(DNA.parseIdentifier("a1 "), {
		identity: 'a1',
		polarity: 1
	}, "Alphanum, no complement, trailing space");
});

test('parseStrandSpec', function() {
	deepEqual(DNA.parseStrandSpec(" "), [], 'Empty');
	deepEqual(DNA.parseStrandSpec(" 1*"), [{
		identity: '1',
		polarity: -1
	}], 'Single complement');
	deepEqual(DNA.parseStrandSpec(" 1* "), [{
		identity: '1',
		polarity: -1
	}], 'Single complement, trailing space');
	deepEqual(DNA.parseStrandSpec(" 1* 2 3' 4"), [{
		identity: '1',
		polarity: -1
	}, {
		identity: '2',
		polarity: 1
	}, {
		identity: '3',
		polarity: -1
	}, {
		identity: '4',
		polarity: 1
	}], 'Numeric, mixed complement');
	deepEqual(DNA.parseStrandSpec(" a1* 2b c3' d4"), [{
		identity: 'a1',
		polarity: -1
	}, {
		identity: '2b',
		polarity: 1
	}, {
		identity: 'c3',
		polarity: -1
	}, {
		identity: 'd4',
		polarity: 1
	}], 'Alphanum, mixed complement');
});

test('threadSegments', function() {
	var segments = {
		'd1': 'A',
		'd2': 'TT',
		'd3': 'CCC',
		'd4': 'GGGG'
	};
	deepEqual(DNA.threadSegments(segments, 'd1 d2 d3 d4'), 'ATTCCCGGGG', 'Simple spec');
	deepEqual(DNA.threadSegments(segments, 'd1 d2* d3 d4'), 'AAACCCGGGG', 'Mixed complement spec');

	deepEqual(DNA.threadSegments(segments, ['d1', 'd2', 'd3', 'd4']), 'ATTCCCGGGG', 'Array spec');
	deepEqual(DNA.threadSegments(segments, ['d1', {
		identity: 'd2',
		polarity: 1
	}, 'd3', 'd4']), 'ATTCCCGGGG', 'Mixed array spec');

	var segmentArray = ['A', 'TT', 'CCC', 'GGGG'];
	deepEqual(DNA.threadSegments(segmentArray, '1 2 3 4'), 'ATTCCCGGGG', 'Simple spec with segments array');
});

test('parseNamedSequences', function() {
	var input1 = 'domain 1 = AAAA\ndomain 2 = TTTT\ndomain 3 = GGGG',
		output1 = {
			'1': 'AAAA',
			'2': 'TTTT',
			'3': 'GGGG'
		},
		input2 = 'segment 1 = AAAA\nsegment 2 = TTTT\nsegment 3 = GGGG',
		output2 = {
			'1': 'AAAA',
			'2': 'TTTT',
			'3': 'GGGG'
		},
		input3 = 'sequence 1 = AAAA\nsequence 2 = TTTT\nsequence 3 = GGGG',
		output3 = {
			'1': 'AAAA',
			'2': 'TTTT',
			'3': 'GGGG'
		},
		input4 = 'domain 1 = NNNNNNN\nsegment 2 = NN\nsequence 5 = NNNN\ndomain 7 : AAAA\nsegment a : GG\nsequence 8 = TTTT',
		output4 = {
			'1': 'NNNNNNN',
			'2': 'NN',
			'5': 'NNNN',
			'7': 'AAAA',
			'a': 'GG',
			'8': 'TTTT'
		},
		input5 = 'x : AAAA\ny : TTT\nz = GGGGG',
		output5 = {
			'x': 'AAAA',
			'y': 'TTT',
			'z': 'GGGGG'
		},
		input6 = '>s1\nAAAAA\n>s2\nGGGGGG',
		output6 = {
			's1': 'AAAAA',
			's2': 'GGGGGG'
		},
		input7 = 'AATACAG\nCCAGATN\nAYANNCATTGA',
		output7 = {
			'1': 'AATACAG',
			'2': 'CCAGATN',
			'3': 'AYANNCATTGA'
		};
		input8 = 'a\tAATACAG\nb\tCCAGATN\nc\tAYANNCATTGA',
		output8 = {
			'a': 'AATACAG',
			'b': 'CCAGATN',
			'c': 'AYANNCATTGA'
		};
		input9 = 'a,AATACAG\nb,CCAGATN\nc,AYANNCATTGA',
		output9 = {
			'a': 'AATACAG',
			'b': 'CCAGATN',
			'c': 'AYANNCATTGA'
		};
	deepEqual(DNA.parseNamedSequences(input1), output1, 'domain x = NNNN');
	deepEqual(DNA.parseNamedSequences(input2), output2, 'segment x = NNNN');
	deepEqual(DNA.parseNamedSequences(input3), output3, 'sequence x = NNNN');
	deepEqual(DNA.parseNamedSequences(input4), output4, 'Mixed (domain, segment, sequence');
	deepEqual(DNA.parseNamedSequences(input5), output5, 'Colon/Equals');
	deepEqual(DNA.parseNamedSequences(input6), output6, 'FASTA');
	deepEqual(DNA.parseNamedSequences(input7), output7, 'Newline-delimited');
	deepEqual(DNA.parseNamedSequences(input8), output8, 'TSV');
	deepEqual(DNA.parseNamedSequences(input9), output9, 'CSV');
});

test('printSequences', function() {
	var input1 = 'domain 1 = AAAA\ndomain 2 = TTTT\ndomain 3 = GGGG',
		output1 = {
			'1': 'AAAA',
			'2': 'TTTT',
			'3': 'GGGG'
		},
		input2 = 'segment 1 = AAAA\nsegment 2 = TTTT\nsegment 3 = GGGG',
		output2 = {
			'1': 'AAAA',
			'2': 'TTTT',
			'3': 'GGGG'
		},
		input3 = 'sequence 1 = AAAA\nsequence 2 = TTTT\nsequence 3 = GGGG',
		output3 = {
			'1': 'AAAA',
			'2': 'TTTT',
			'3': 'GGGG'
		},
		input4 = 'domain 1 = NNNNNNN\nsegment 2 = NN\nsequence 5 = NNNN\ndomain 7 : AAAA\nsegment a : GG\nsequence 8 = TTTT',
		output4 = {
			'1': 'NNNNNNN',
			'2': 'NN',
			'5': 'NNNN',
			'7': 'AAAA',
			'a': 'GG',
			'8': 'TTTT'
		},
		input5 = 'x : AAAA\ny : TTT\nz = GGGGG',
		output5 = {
			'x': 'AAAA',
			'y': 'TTT',
			'z': 'GGGGG'
		},
		input6 = '>s1\nAAAAA\n>s2\nGGGGGG',
		output6 = {
			's1': 'AAAAA',
			's2': 'GGGGGG'
		},
		input7 = 'AATACAG\nCCAGATN\nAYANNCATTGA',
		output7 = {
			'1': 'AATACAG',
			'2': 'CCAGATN',
			'3': 'AYANNCATTGA'
		};
		input8 = 'a\tAATACAG\nb\tCCAGATN\nc\tAYANNCATTGA',
		output8 = {
			'a': 'AATACAG',
			'b': 'CCAGATN',
			'c': 'AYANNCATTGA'
		};
		input9 = 'a,AATACAG\nb,CCAGATN\nc,AYANNCATTGA',
		output9 = {
			'a': 'AATACAG',
			'b': 'CCAGATN',
			'c': 'AYANNCATTGA'
		};
	deepEqual(DNA.printSequences(output1,'nupack'),input1+'\n', 'domain x = NNNN');
	// deepEqual(DNA.printSequences(output2,''),input2, 'segment x = NNNN');
	// deepEqual(DNA.printSequences(output3,''),input3, 'sequence x = NNNN');
	// deepEqual(DNA.printSequences(output4,''),input4, 'Mixed (domain, segment, sequence');
	// deepEqual(DNA.printSequences(output5,''),input5, 'Colon/Equals');
	deepEqual(DNA.printSequences(output6,'fasta'),input6+'\n', 'FASTA');
	// deepEqual(DNA.printSequences(output7,''),input7, 'Newline-delimited');
	deepEqual(DNA.printSequences(output8,'\t'),input8+'\n', 'TSV');
	deepEqual(DNA.printSequences(output9,','),input9+'\n', 'CSV');
});

test('validateDotParen', function() {

	ok(DNA.validateDotParen('..(((.)))...'));
	ok(!DNA.validateDotParen('..(((.))...'));
	ok(!DNA.validateDotParen('..((.)))...'));

	ok(DNA.validateDotParen('(((.)))...'));
	ok(!DNA.validateDotParen('((.)))...'));
	ok(!DNA.validateDotParen('(((.))...'));

	ok(DNA.validateDotParen('....(((.)))'));
	ok(!DNA.validateDotParen('....((.)))'));
	ok(!DNA.validateDotParen('....(((.))'));

});

test('structureSpec', function() {

	// sequence 1 : NNNNNNNN
	// sequence 2 : NNNNNNNN
	// sequence 3 : NNNNNNNN
	// sequence 4 : NNNNNNNN

	// n1_n1 : 1* 2* 3*   4* 5* 3   2 6* 7* 
	// n2_n2 : 3* 5 4   1 8* 4*   5* 9* 10* 
	// n3_n3 : 4 8 1*   3 2 1   8* 11* 12* 
	
	var lines1 = [
		[
			["keyword", "sequence"],
			["string", "1"],
			["operator", ":"],
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], 
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"]
		],
		[
			["keyword", "domain"],
			["string", "2"],
			["operator", ":"],
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], 
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"]
		],
		[
			["keyword", "segment"],
			["string", "3"],
			["operator", ":"],
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], 
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"]
		],
		[
			["keyword", "sequence"],
			["string", "4"],
			["operator", "="],
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], 
			["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"]
		],
		[
			["variable", "n1_n1"],
			["operator", ":"],
			["string", "1* 2* 3*   4 "]
		],
	]
	var expect1 = {"others":[],"complexes":{}, "structures":{}, "domains":{"1":"NNNNNNNN","2":"NNNNNNNN","3":"NNNNNNNN","4":"NNNNNNNN"},"strands":{"n1_n1":"1* 2* 3*   4 "}} ;

	var spec1 = DNA.structureSpec(lines1);
	deepEqual(spec1,expect1,'Simple example')
	console.log(JSON.stringify(spec1))


	// ------------------------------------------------------------------------
	
	var lines2 = [
		[
			["keyword", "sequence"],
			["string", "s1"],
			["operator", "="],
			["sequence-a", "A"], ["sequence-t", "T"], ["sequence-c", "C"], ["sequence-g", "G"], ["sequence-a", "A"]
		],
		[
			["keyword", "sequence"],
			["string", "s2"],
			["operator", "="],
			["number", "6"], ["sequence-n", "N"]
		],
		[
			["keyword", "domain"],
			["string", "s3"],
			["operator", ":"],
			["sequence-n", "N"], ["sequence-y", "Y"], ["sequence-r", "R"], ["sequence-t", "T"], ["sequence-b", "B"]
		],
		[],
		[
			["variable", "m1"],
			["operator", ":"],
			["string", "s1 s2* s3"]
		],
		[
			["keyword", "strand"],
			["variable", "m2"],
			["operator", "="],
			["string", "s2 s3*"]
		],
		[
			["variable", "m3"],
			["operator", "="],
			["string", "s3 s1' s2"]
		]
	];

	var expect2 = {"others":[],"complexes":{}, "structures":{}, "domains":{"s1":"ATCGA","s2":"NNNNNN","s3":"NYRTB"},"strands":{"m1":"s1 s2* s3", "m2":"s2 s3*", "m3":"s3 s1' s2"}} ;

	var spec2 = DNA.structureSpec(lines2);
	deepEqual(spec2,expect2,'More complex example')

	console.log(JSON.stringify(spec2))

})