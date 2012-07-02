module('DNA Utils');
test('DUtoDotParen',function() {
	equal(DNA.DUtoDotParen('U4'),'....','Single-stranded');
	equal(DNA.DUtoDotParen('D4(U4)'),'((((....))))','Hairpin');
	equal(DNA.DUtoDotParen('U3 D4(U4)'),'...((((....))))','Left-toehold hairpin');
	equal(DNA.DUtoDotParen('D4(U4) U5'),'((((....)))).....','Right-overhang hairpin');
	equal(DNA.DUtoDotParen('U3 D4(U4) U5'),'...((((....)))).....','Left/right overhand hairpin');
	equal(DNA.DUtoDotParen('D4(+)'),'((((+))))','Helix with strand break');
	
	equal(DNA.DUtoDotParen('U3 H4(U4) D3(U5)'),DNA.DUtoDotParen('U3 D4(U4) D3(U5)'),'HU+ allowed too')
	
	equal(DNA.DUtoDotParen('D3(U3 D2(U2))'),'(((...((..)))))','Left bulge')
	equal(DNA.DUtoDotParen('D3(D2(U2) U3)'),'(((((..))...)))','Right bulge')
	
	equal(DNA.DUtoDotParen('U2 D3(+) U3 D4(+)'),'..(((+)))...((((+))))', 'Sequential helicies')
	
	equal(DNA.DUtoDotParen('U4 D3(D2(U2 + U2) U2 D2(+)) U3'),'....(((((..+..))..((+)))))...',"Complex example");
})

test('dotParenToDU',function() {
	equal('U4',DNA.dotParenToDU('....'),'Single-stranded');
	equal(DNA.dotParenToDU('((((....))))'),'D4(U4)','Hairpin');
	equal(DNA.dotParenToDU('...((((....))))'),'U3 D4(U4)','Left-toehold hairpin');
	equal(DNA.dotParenToDU('((((....)))).....'),'D4(U4) U5','Right-overhang hairpin');
	equal(DNA.dotParenToDU('...((((....)))).....'),'U3 D4(U4) U5','Left/right overhand hairpin');
	equal(DNA.dotParenToDU('((((+))))'),'D4(+)','Helix with strand break');
	
	equal(DNA.dotParenToDU('(((...((..)))))'),'D3(U3 D2(U2))','Left bulge')
	equal(DNA.dotParenToDU('(((((..))...)))'),'D3(D2(U2) U3)','Right bulge')
	
	equal(DNA.dotParenToDU('..(((+)))...((((+))))'),'U2 D3(+) U3 D4(+)','Sequential helicies')
	
	
	equal(DNA.dotParenToDU('....(((((..+..))..((+)))))...'),'U4 D3(D2(U2 + U2) U2 D2(+)) U3',"Complex example");
})

test('parseIdentifier',function() {
	deepEqual(DNA.parseIdentifier("1"),{ identity: '1',polarity:1},'No complement');
	deepEqual(DNA.parseIdentifier("a1"),{ identity: 'a1',polarity:1},'Alphanum, no complement');

	deepEqual(DNA.parseIdentifier("1*"),{ identity: '1',polarity:-1},'Numeric, * complement');
	deepEqual(DNA.parseIdentifier("1'"),{ identity: '1',polarity:-1},"Numeric, ' complement");
	deepEqual(DNA.parseIdentifier("a1*"),{ identity: 'a1',polarity:-1},"Alphanum, * complement");
	deepEqual(DNA.parseIdentifier("a1'"),{ identity: 'a1',polarity:-1},"Alphanum, ' complement");
	
	
	deepEqual(DNA.parseIdentifier("a1' "),{ identity: 'a1',polarity:-1},"Alphanum, ' complement, trailing space");
	deepEqual(DNA.parseIdentifier("a1* "),{ identity: 'a1',polarity:-1},"Alphanum, * complement, trailing space");
	deepEqual(DNA.parseIdentifier("a1 "),{ identity: 'a1',polarity:1},"Alphanum, no complement, trailing space");
});

test('parseStrandSpec',function() {
	deepEqual(DNA.parseStrandSpec(" "),[ ],'Empty');
	deepEqual(DNA.parseStrandSpec(" 1*"),[ {identity: '1',polarity:-1}],'Single complement');
	deepEqual(DNA.parseStrandSpec(" 1* "),[ {identity: '1',polarity:-1}],'Single complement, trailing space');
	deepEqual(DNA.parseStrandSpec(" 1* 2 3' 4"),[ {identity: '1',polarity:-1},{identity:'2',polarity:1},{identity:'3',polarity:-1},{identity:'4',polarity:1}],'Numeric, mixed complement');
	deepEqual(DNA.parseStrandSpec(" a1* 2b c3' d4"),[ {identity: 'a1',polarity:-1},{identity:'2b',polarity:1},{identity:'c3',polarity:-1},{identity:'d4',polarity:1}],'Alphanum, mixed complement');
});

test('threadSegments',function() {
	var segments = {
		'd1':'A',
		'd2':'TT',
		'd3':'CCC',
		'd4':'GGGG'
	};
	deepEqual(DNA.threadSegments(segments,'d1 d2 d3 d4'),'ATTCCCGGGG','Simple spec');
	deepEqual(DNA.threadSegments(segments,'d1 d2* d3 d4'),'AAACCCGGGG','Mixed complement spec');
	
	deepEqual(DNA.threadSegments(segments,['d1', 'd2', 'd3', 'd4']),'ATTCCCGGGG','Array spec');
	deepEqual(DNA.threadSegments(segments,['d1', {identity: 'd2', polarity: 1}, 'd3', 'd4']),'ATTCCCGGGG','Mixed array spec');
	
	var segmentArray = ['A','TT','CCC','GGGG'];
	deepEqual(DNA.threadSegments(segmentArray,'1 2 3 4'),'ATTCCCGGGG','Simple spec with segments array');
	
	
})
