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