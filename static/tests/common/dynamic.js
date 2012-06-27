function names(list) {
	return _.map(list,function(x) {return x.getName()});
}
function ids(list) {
	return _.map(list,function(x) {return x.getIdentifier()});
}

module("App.dynamic.Node");
test("getOrderedSegments",function() {
	var s1 = new App.dynamic.Node({
		name: 'n1',
		polarity: -1,
		domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s1.getOrderedSegments()),['s6','s5','s4','s3','s2','s1'],'(-) Node with auto-created (+) strand');
	
	var s2 = new App.dynamic.Node({
		name: 'n1',
		polarity: 1,
		domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s2.getOrderedSegments()),'s1 s2 s3 s4 s5 s6'.split(' '),'(+) Node with auto-created (+) strand');
	
	
	var s3 = new App.dynamic.Node({
		name: 'n1',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity :1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s3.getOrderedSegments()),['s6','s5','s4','s3','s2','s1'],'(-) Node with manually-created (+) strand');
	
	var s4 = new App.dynamic.Node({
		name: 'n1',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity :-1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s4.getOrderedSegments()),'s1 s2 s3 s4 s5 s6'.split(' '),'(-) Node with manually-created (-) strand');
	
	var s5 = new App.dynamic.Node({
		name: 'n1',
		polarity: 1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity :-1
		},{
			name: 'S2',
			domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
			polarity :1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s5.getOrderedSegments()),'s6 s5 s4 s3 s2 s1 s7 s8 s9 s10 s11 s12'.split(' '),'(+) Node with manually-created (-) strand and (+) strand');
	
	var s6 = new App.dynamic.Node({
		name: 'n1',
		polarity: -1,
		strands: [{
			name: 'S1',
			domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
			polarity :-1
		},{
			name: 'S2',
			domains: 'd3[s7 s8 s9]- d4[s10 s11 s12]+',
			polarity :1
		}],
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s6.getOrderedSegments()),'s12 s11 s10 s9 s8 s7 s1 s2 s3 s4 s5 s6'.split(' '),'(-) Node with manually-created (-) strand and (+) strand');

})

module("App.dynamic.Strand");
test("getOrderedSegments",function() {
	var s1 = new App.dynamic.Strand({
		name: 'S1',
		polarity: -1,
		domains: 'd1[s1 s2 s3]- d2[s4 s5 s6]+',
		library: App.dynamic.Library.dummy()
	});
	deepEqual(ids(s1.getOrderedSegments()),['s6','s5','s4','s3','s2','s1']);
	
	var s2 = new App.dynamic.Strand({
		name:'D2',
		polarity: -1,
		domains: 'A[a x:c b c]i+ s[s(1)]x B[d e y:c c*]o- C[b* x*:c f g]o+',
		library: App.dynamic.Library.dummy()
	});	
	deepEqual(ids(s2.getOrderedSegments()),'g f x* b* c* y e d s c b x a'.split(' '));
	
	var s3 = new App.dynamic.Strand({
		name:'D2',
		polarity: 1,
		domains: 'A[a x:c b c]i+ s[s(1)]x B[d e y:c c*]o- C[b* x*:c f g]o+',
		library: App.dynamic.Library.dummy()
	});	
	deepEqual(ids(s3.getOrderedSegments()),'a x b c s d e y c* b* x* f g'.split(' '));
})

module("App.dynamic.Strand");
test("segmentLength",function() {
	var segmentLength = 7, clampLength = 2, toeholdLength = 6;
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
	}), s2 = new App.dynamic.Segment({
		name: 's2',
		library: lib,
		role: 'clamp'
	}), s3 = new App.dynamic.Segment({
		name: 's3',
		library: lib,
	})
	equal(s1.getLength(),toeholdLength)
	equal(s2.getLength(),clampLength)
	equal(s3.getLength(),segmentLength)
})

module("App.dynamic.Compiler");
test("parseSegmentString", function() {
	var input1 = "a b:t c(4) d(5)c", output1 = [{
		name : 'a'
	}, {
		name : 'b',
		role: 'toehold',
	}, {
		name : 'c',
		length: 4,
	}, {
		name : 'd',
		length: 5,
		role: 'clamp'
	}], input2 = "a* b*:t b*t c*(4) d*(5)c", output2 = [{
		name : 'a*'
	}, {
		name : 'b*',
		role: 'toehold',
	},{
		name : 'b*',
		role: 'toehold',
	}, {
		name : 'c*',
		length: 4,
	}, {
		name : 'd*',
		length: 5,
		role: 'clamp'
	}],
	input3 = 's(1)',output3 = [{
		name:'s',
		length: 1
	}]
	
	deepEqual(App.dynamic.Compiler.parseSegmentString(input1),output1,"Segment string");
	deepEqual(App.dynamic.Compiler.parseSegmentString(input2),output2,"Segment string with complements");
	deepEqual(App.dynamic.Compiler.parseSegmentString(input3),output3,"Single segment");

});
test("parseDomainString", function() {
	var input1 = "d1[a(5):t]i- d2[b*]+", output1 = [{
		name : 'd1',
		segments : [{
			name : 'a',
			length: 5,
			role: 'toehold',
		}],
		polarity: '-',
		role: 'input'
	},{
		name : 'd2',
		segments : [{
			name : 'b*'
		}],
		polarity: '+',
	}],
	input2 = 's[s(1)]x', output2 = [{
		'name':'s',
		'role':'structural',
		'segments':[{
			name:'s',
			length: 1
		}]
	}],
	input3 = 'A[a x:c b c]i+ s[s*(1)]x B[d e y:c c*]o-', output3 = [{
		'name':'A',
		'role': 'input',
		'polarity':'+',
		'segments':[{name: 'a'},{name: 'x', role:'clamp'},{name: 'b'},{name: 'c'}]
	},{
		'name':'s',
		'role': 'structural',
		'segments':[{name: 's*',length: 1}]
	},{
		'name':'B',
		'role': 'output',
		'polarity':'-',
		'segments':[{name: 'd'},{name: 'e'}, {name: 'y',role:'clamp'},{name: 'c*'}]
	}]
	
	deepEqual(App.dynamic.Compiler.parseDomainString(input1),output1,"Domain String");
	deepEqual(App.dynamic.Compiler.parseDomainString(input2),output2,"Single-segment Domain String");
	deepEqual(App.dynamic.Compiler.parseDomainString(input3),output3,"Domain String");
});
