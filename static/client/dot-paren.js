var strandValue = 5,
	hybridizationValue = 2,
	radius=100;

function generateLayout(struct,strands,linkStrands) {
// var struct = "....(((...)))....";
linkStrands = linkStrands || false;

var nodes = [], links = [], hybridization = [], strandIndex = 0, node, n=0, base=0,theta = 0, dtheta = Math.PI/struct.length;

for(var i=0;i<struct.length;i++) {
	
	if(struct[i] == '+') {
		strandIndex++;
		n--;
		base = 0;
	} else {
		if(struct[i] == '(') {
			hybridization.push(n);
		} else if(struct[i] == ')') {
			links.push({
				source: hybridization.pop(),
				target: n,
				value: hybridizationValue,
				
			});
		}
		node = { strand: strandIndex, nodeName: strands[strandIndex][base],
		top: Math.sin(theta)*radius,
				left: Math.cos(theta)*radius,  };
		nodes.push(node);	
		if(linkStrands) {
		if(n>0 && (struct[i-1]!='+')) {
			links.push({source: n, target: n-1, value: strandValue,});
		}
		}
		theta += dtheta;
	}
	n++;
	base++;
}

return {nodes: nodes, links: links};
}