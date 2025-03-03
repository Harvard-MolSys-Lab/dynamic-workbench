if ( typeof _ === 'undefined') {
	_ = require('underscore')
}
if(typeof module == 'undefined') {
	module = {};
}
if(typeof module.exports == 'undefined') {
	module.exports = {};
}
/**
 * @class DNA
 * Provides a wealth of utility methods of dealing with all kinds of things DNA
 * This class is available client-side as `DNA` or server-side as
 * `require('static/lib/dna-utils').DNA`.
 */
var DNA = module.exports.DNA = (function(_) {
	// ------------------------------------------------------------------------
	// Geometry

	function sum(list) {
		return _.reduce(list,function(x,y) { return x+y; },0);
	}
	
	function deg(theta) {
		return ((theta * 180/Math.PI) % 360).toFixed(2);
	}
	
	function coords(pair) {
		return pair.x.toFixed(2)+','+pair.y.toFixed(2);
	}
	
	function arc2angle(arc,radius) {
		var c = radius * pi2;
		return arc/c * pi2;
	}
		
	function Point(cfg) {
		this.x = cfg.x;
		this.y = cfg.y;
	}
	
	_.extend(Point.prototype,{
		toArray: function() {
			return [this.x,this.y];
		},
		toPos: function() {
			return {x: this.x, y: this.y};
		},
		add : function(cfg) {
			var pt = Point.fromMixed(cfg);
			return new Point({x :this.x + pt.x, y: this.y + pt.y});
		},
		subtract : function(cfg) {
			var pt = Point.fromMixed(cfg);
			return new Point({x :this.x - pt.x, y: this.y - pt.y}); 
		},
		distance :  function(cfg) {
			var pt = Point.fromMixed(cfg);
			return Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2));
		},
		angle : function(cfg) {
			if(cfg) {
				var pt = Point.fromMixed(cfg);
				return Math.atan2(pt.y - this.y, pt.x - this.x);
			} else {
				return Math.atan2(this.y,this.x);
			}
		},
		addPolar : function(theta, radius) {
			
			return new Point({
				x : this.x + Math.cos(theta)*radius, 
				y : this.y + Math.sin(theta)*radius,
			});
			return this;
		},
		midpoint : function(cfg) {
			var pt = Point.fromMixed(cfg);
			return new Point({
				x : this.x+(pt.x - this.x) / 2,
				y : this.y+(pt.y - this.y) / 2,
			});
		}
	});
	
	_.extend(Point,{
		create: function(x,y) {
			return new Point({
				x:x, y:y
			});
		},
		fromArray: function(cfg) {
			return new Point({
				x: cfg[0],
				y: cfg[1],
			});
		},
		fromPos: function(cfg) {
			return new Point(cfg);
		},
		fromMixed: function(cfg) {
			if(cfg instanceof Point) {
				return cfg;
			}
			if(_.isArray(cfg)) {
				return Point.fromArray(cfg);
			} else if (_.isObject(cfg) && cfg.x && cfg.y) {
				return Point.fromPos(cfg);
			}
		}
	});
	
			
	
	
	//-------------------------------------------------------------------------
	// Sequences and Alignment
	
	//Written by Paul Stothard, University of Alberta, Canada

	//This class performs alignments in linear space, by recursively dividing
	//the alignment. Once subalignments of acceptable size are obtained, they
	//are solved using the quadratic space implementation in align_pair_quad.js.

	//To use this class: (see pairwise_dna.js for example)
	//var alignment = new AlignPairLinear();
	//alignment.initializeMatrix(sequenceArrayM, sequenceArrayN, scoreSet);
	//alignment.fillMatrix();
	//alignment.align();
	//var alignedSequenceStringM = alignment.getAlignedM();
	//var alignedSequenceStringN = alignment.getAlignedN();

	//------------------------------------ AlignPairLinear class
	var AlignPairLinear = (function() {
		//AlignPairLinear class align() method
		function align() {
			if (this.M.length == 0) {

				for (var j = 1; j <= this.N.length; j++) {
					this.alignedM.push("-");
					this.alignedN.push(this.N[j - 1]);
					this.score = this.score + this.scoreSet.gap;
				}
			} else if (this.N.length == 0) {
				for (var j = 1; j <= this.M.length; j++) {
					this.alignedN.push("-");
					this.alignedM.push(this.M[j - 1]);
					this.score = this.score + this.scoreSet.gap;
				}

			} else if ((this.M.length == 0) && (this.N.length == 0)) {
				//do nothing
			} else {
				this.path(0, 0, this.M.length, this.N.length);
			}
		}

		//AlignPairLinear class recursive method path()
		function path(i1, j1, i2, j2) {

			//alert ("i1, j1, : i2, j2 " + i1 +", " + j1 + ", " + i2 + ", " + j2);

			if ((i1 + 1 == i2) || (j1 == j2)) {
				//align using quadratic space alignment
				var subM = new Array();
				var subN = new Array();

				for (var i = i1 + 1; i <= i2; i++) {
					subM.push(this.M[i - 1]);
				}

				for (var j = j1 + 1; j <= j2; j++) {
					subN.push(this.N[j - 1]);
				}

				var alignment = new AlignPairQuad();
				subScoreSet = new ScoreSet();
				if (j1 == j2) {

					if (j1 == 0) {
						subScoreSet.setScoreSetParam(this.scoreSet.scoringMatrix, this.scoreSet.beginGap, this.scoreSet.beginGap, this.scoreSet.beginGap);
					} else if (j1 == this.N.length) {
						subScoreSet.setScoreSetParam(this.scoreSet.scoringMatrix, this.scoreSet.endGap, this.scoreSet.endGap, this.scoreSet.endGap);
					} else {
						subScoreSet.setScoreSetParam(this.scoreSet.scoringMatrix, this.scoreSet.gap, this.scoreSet.gap, this.scoreSet.gap);
					}
				} else {

					subScoreSet.setScoreSetParam(this.scoreSet.scoringMatrix, this.scoreSet.gap, this.scoreSet.beginGap, this.scoreSet.endGap);
					subScoreSet.useBeginGapTop = false;
					subScoreSet.useBeginGapLeft = false;
					subScoreSet.useEndGapBottom = false;
					subScoreSet.useEndGapRight = false;

					if (i1 == 0) {
						subScoreSet.useBeginGapTop = true;
					}

					if (j1 == 0) {
						subScoreSet.useBeginGapLeft = true;
					}

					if (j2 == this.N.length) {
						subScoreSet.useEndGapRight = true;
					}

					if (i2 == this.M.length) {
						subScoreSet.useEndGapBottom = true;
					}
				}

				alignment.initializeMatrix(subM, subN, subScoreSet);
				alignment.fillMatrix();
				alignment.align();
				//alignment.dumpMatrix();
				this.alignedM.push(alignment.getAlignedM());
				this.alignedN.push(alignment.getAlignedN());

				this.score = this.score + alignment.score;
			} else {
				var middle = Math.floor((i1 + i2) / 2);

				//linear-space computation of alignment score to middle row
				//forward pass

				//gaps along top

				this.Sn[j1] = 0;

				if (i1 == 0) {
					for (var j = j1 + 1; j <= j2; j++) {
						this.Sn[j] = this.Sn[j - 1] - this.scoreSet.beginGap;
					}
				} else {
					for (var j = j1 + 1; j <= j2; j++) {
						this.Sn[j] = this.Sn[j - 1] - this.scoreSet.gap;
					}
				}

				//now continue down rows to middle row
				var diag;
				var left;
				//for (var i = i1 + 1; i <= i2; i++) {
				for (var i = i1 + 1; i <= middle; i++) {
					diag = this.Sn[j1];
					left;
					if (j1 == 0) {
						left = this.Sn[j1] - this.scoreSet.beginGap;
					} else {
						left = this.Sn[j1] - this.scoreSet.gap;
					}

					this.Sn[j1] = left;

					//we need three values to set the score: diag, left, and above to fill in the row
					for (var j = j1 + 1; j <= j2; j++) {
						//above will be in the this.Sn array, which is holding a mixture of the previous row and the new row
						//var above = this.Sn[j];

						//pick max of three and store in next left
						if ((j == this.N.length) && (i == this.M.length)) {
							left = Math.max(this.Sn[j] - this.scoreSet.endGap, Math.max((left - this.scoreSet.endGap), diag + this.scoreSet.getScore(this.M[i - 1], this.N[j - 1])));
						} else if (i == this.M.length) {
							left = Math.max(this.Sn[j] - this.scoreSet.gap, Math.max((left - this.scoreSet.endGap), diag + this.scoreSet.getScore(this.M[i - 1], this.N[j - 1])));
						} else if (j == this.N.length) {
							left = Math.max(this.Sn[j] - this.scoreSet.endGap, Math.max((left - this.scoreSet.gap), diag + this.scoreSet.getScore(this.M[i - 1], this.N[j - 1])));
						} else {
							left = Math.max(this.Sn[j] - this.scoreSet.gap, Math.max((left - this.scoreSet.gap), diag + this.scoreSet.getScore(this.M[i - 1], this.N[j - 1])));
						}
						diag = this.Sn[j];

						//prepares this.Sn for use in next iteration of i loop
						this.Sn[j] = left;

					}
				}

				//linear-space computation of alignment score to middle row
				//reverse pass

				//gaps along bottom

				this.Sp[j2] = 0;

				if (i2 == this.M.length) {
					for (var j = j2 - 1; j >= j1; j--) {
						this.Sp[j] = this.Sp[j + 1] - this.scoreSet.endGap;
					}
				} else {
					for (var j = j2 - 1; j >= j1; j--) {
						this.Sp[j] = this.Sp[j + 1] - this.scoreSet.gap;
					}
				}

				//now continue up rows to middle row
				var right;
				//for (var i = i2 - 1; i >= i1; i--) {
				for (var i = i2 - 1; i >= middle; i--) {
					diag = this.Sp[j2];
					if (j2 == this.N.length) {
						right = this.Sp[j2] - this.scoreSet.endGap;
					} else {
						right = this.Sp[j2] - this.scoreSet.gap;
					}

					this.Sp[j2] = right;

					//we need three values to set the score: diag, right, and below to fill in the row
					for (var j = j2 - 1; j >= j1; j--) {
						//below will be in the this.Sp array, which is holding a mixture of the previous row and the new row
						//var below = this.Sp[j];

						//pick max of three and store in next right
						if ((j == 0) && (i == 0)) {
							right = Math.max(this.Sp[j] - this.scoreSet.beginGap, Math.max((right - this.scoreSet.beginGap), diag + this.scoreSet.getScore(this.M[i + 1 - 1], this.N[j + 1 - 1])));
						} else if (j == 0) {
							right = Math.max(this.Sp[j] - this.scoreSet.beginGap, Math.max((right - this.scoreSet.gap), diag + this.scoreSet.getScore(this.M[i + 1 - 1], this.N[j + 1 - 1])));
						} else if (i == 0) {
							right = Math.max(this.Sp[j] - this.scoreSet.gap, Math.max((right - this.scoreSet.beginGap), diag + this.scoreSet.getScore(this.M[i + 1 - 1], this.N[j + 1 - 1])));
						} else {
							right = Math.max(this.Sp[j] - this.scoreSet.gap, Math.max((right - this.scoreSet.gap), diag + this.scoreSet.getScore(this.M[i + 1 - 1], this.N[j + 1 - 1])));
						}
						diag = this.Sp[j];
						this.Sp[j] = right;
					}

				}

				//now find the value of j that maximizes this.Sn[j] + this.Sp[j]
				//this point will be in the maximum scoring path in the final alignment.
				//once we have this point we can divide the problem into two new problems,

				var maxValue = this.Sn[j1] + this.Sp[j1];
				var maxJ = j1;

				for (var j = j1 + 1; j <= j2; j++) {
					if (this.Sn[j] + this.Sp[j] >= maxValue) {
						maxValue = this.Sn[j] + this.Sp[j];
						maxJ = j;
					}
				}

				this.path(i1, j1, middle, maxJ);
				this.path(middle, maxJ, i2, j2);

			}
		}

		//AlignPairLinear class getAlignedM() method
		function getAlignedM() {
			return this.alignedM.join("");
		}

		//AlignPairLinear class getAlignedN() method
		function getAlignedN() {
			return this.alignedN.join("");
		}

		//AlignPairLinear class setAlignParam method
		function setAlignParam(M, N, scoreSet) {
			this.M = M;
			this.N = N;
			this.alignedM = new Array();
			this.alignedN = new Array();
			this.scoreSet = scoreSet;
			this.Sn = new Array(this.N.length);
			this.Sp = new Array(this.N.length);
			this.score = 0;
		}

		//AlignPairLinear class
		function AlignPairLinear() {
			this.M
			this.N
			this.alignedM
			this.alignedN
			this.scoreSet
			this.Sn
			this.Sp
			this.score
		}

		//create and throw away a prototype object
		new AlignPairLinear();

		//define object methods
		AlignPairLinear.prototype.align = align;
		AlignPairLinear.prototype.path = path;
		AlignPairLinear.prototype.setAlignParam = setAlignParam;
		AlignPairLinear.prototype.getAlignedM = getAlignedM;
		AlignPairLinear.prototype.getAlignedN = getAlignedN;
		return AlignPairLinear;
	})();
	//Written by Paul Stothard, University of Alberta, Canada

	//This class should be used for small alignments,
	//since it uses O(nm) memory, where n and m are the sequence lengths.
	//For larger alignments use the linear space algorithm implemented
	//in align_pair_linear.js

	//To use this class: (see pairwise_dna.js for example)
	//var alignment = new AlignPairQuad();
	//alignment.initializeMatrix(sequenceArrayM, sequenceArrayN, scoreSet);
	//alignment.fillMatrix();
	//alignment.align();
	//var alignedSequenceStringM = alignment.getAlignedM();
	//var alignedSequenceStringN = alignment.getAlignedN();

	//------------------------------------ Node class
	//Node class
	function Node() {
		this.value
		this.tracebackI
		this.tracebackJ
	}

	//------------------------------------

	//------------------------------------ AlignPairQuad class
	var AlignPairQuad = (function() {
		//AlignPairQuad class initializeMatrix method
		function initializeMatrix(sequenceOne, sequenceTwo, scoreSet) {

			this.scoreSet = scoreSet;

			this.M = sequenceOne;
			this.N = sequenceTwo;
			this.score = 0;

			//create an two-dimensional array of nodes
			this.nodes = new Array(this.M.length + 1);

			//row i
			for (var i = 0; i < this.nodes.length; i++) {
				this.nodes[i] = new Array(this.N.length + 1);
				//column j
				for (var j = 0; j < this.nodes[i].length; j++) {
					this.nodes[i][j] = new Node();
				}
			}

			this.nodes[0][0].value = 0;

			//i rows
			for (var i = 1; i < this.nodes.length; i++) {
				if (this.scoreSet.useBeginGapLeft) {
					this.nodes[i][0].value = this.nodes[i - 1][0].value - this.scoreSet.beginGap;
				} else {
					this.nodes[i][0].value = this.nodes[i - 1][0].value - this.scoreSet.gap;
				}
				this.nodes[i][0].tracebackI = i - 1;
				this.nodes[i][0].tracebackJ = 0;
			}

			//j columns
			for (var j = 1; j < this.nodes[0].length; j++) {
				if (this.scoreSet.useBeginGapTop) {
					this.nodes[0][j].value = this.nodes[0][j - 1].value - this.scoreSet.beginGap;
				} else {
					this.nodes[0][j].value = this.nodes[0][j - 1].value - this.scoreSet.gap;
				}
				this.nodes[0][j].tracebackI = 0;
				this.nodes[0][j].tracebackJ = j - 1;
			}

		}

		//AlignPairQuad class dumpMatrix method
		function dumpMatrix() {
			outputWindow.document.write("Dynamic programming matrix i=" + this.nodes.length + " and j=" + this.nodes[0].length);
			outputWindow.document.write("\n");
			for (var i = 0; i < this.nodes.length; i++) {
				for (var j = 0; j < this.nodes[i].length; j++) {
					var traceI = this.nodes[i][j].tracebackI;
					var traceJ = this.nodes[i][j].tracebackJ;

					if (traceI == undefined) {
						traceI = "u";
					}
					if (traceJ == undefined) {
						traceJ = "u";
					}
					var output = "(" + i + "," + j + ")[" + traceI + "," + traceJ + "]=" + this.nodes[i][j].value;
					outputWindow.document.write(rightNum(output, "", 20, " "));
				}
				outputWindow.document.write("\n");
			}
			outputWindow.document.write("\n");

		}

		//AlignPairQuad class fillMatrix method
		function fillMatrix() {

			//i rows
			for (var i = 1; i < this.nodes.length; i++) {
				//j columns
				for (var j = 1; j < this.nodes[0].length; j++) {

					var a;
					var b;
					var c;

					//handle end gaps here

					if ((i == this.nodes.length - 1) && (j == this.nodes[0].length - 1)) {
						if (this.scoreSet.useEndGapRight) {
							a = this.nodes[i - 1][j].value - this.scoreSet.endGap;
						} else {
							a = this.nodes[i - 1][j].value - this.scoreSet.gap;
						}

						if (this.scoreSet.useEndGapBottom) {
							b = this.nodes[i][j - 1].value - this.scoreSet.endGap;
						} else {
							b = this.nodes[i][j - 1].value - this.scoreSet.gap;
						}
					} else if (i == this.nodes.length - 1) {
						a = this.nodes[i - 1][j].value - this.scoreSet.gap;
						if (this.scoreSet.useEndGapBottom) {
							b = this.nodes[i][j - 1].value - this.scoreSet.endGap;
						} else {
							b = this.nodes[i][j - 1].value - this.scoreSet.gap;
						}
					} else if (j == this.nodes[0].length - 1) {
						if (this.scoreSet.useEndGapRight) {
							a = this.nodes[i - 1][j].value - this.scoreSet.endGap;
						} else {
							a = this.nodes[i - 1][j].value - this.scoreSet.gap;
						}
						b = this.nodes[i][j - 1].value - this.scoreSet.gap;
					} else {
						a = this.nodes[i - 1][j].value - this.scoreSet.gap;
						b = this.nodes[i][j - 1].value - this.scoreSet.gap;
					}
					c = this.nodes[i - 1][j - 1].value + this.scoreSet.getScore(this.M[i - 1], this.N[j - 1]);

					if ((a >= b) && (a >= c)) {
						this.nodes[i][j].value = a;
						this.nodes[i][j].tracebackI = i - 1;
						this.nodes[i][j].tracebackJ = j;
					} else if ((b >= c) && (b >= a)) {
						this.nodes[i][j].value = b;
						this.nodes[i][j].tracebackI = i;
						this.nodes[i][j].tracebackJ = j - 1;
					} else {
						this.nodes[i][j].value = c;
						this.nodes[i][j].tracebackI = i - 1;
						this.nodes[i][j].tracebackJ = j - 1;
					}
				}
			}
			this.score = this.nodes[this.nodes.length - 1][this.nodes[0].length - 1].value;

		}

		//AlignPairQuad class align() method
		function align() {
			this.alignedM = new Array();
			this.alignedN = new Array();

			var currentI = this.nodes.length - 1;
			var currentJ = this.nodes[0].length - 1;

			var currentNode = this.nodes[this.nodes.length - 1][this.nodes[0].length - 1];

			while ((currentNode.tracebackI != undefined) && (currentNode.tracebackJ != undefined)) {

				if ((currentNode.tracebackI == currentI - 1) && (currentNode.tracebackJ == currentJ - 1)) {
					this.alignedM.push(this.M.pop());
					this.alignedN.push(this.N.pop());
				} else if (currentNode.tracebackJ == currentJ - 1) {
					this.alignedM.push("-");
					this.alignedN.push(this.N.pop());
				} else {
					this.alignedM.push(this.M.pop());
					this.alignedN.push("-");
				}
				currentI = currentNode.tracebackI;
				currentJ = currentNode.tracebackJ;
				currentNode = this.nodes[currentNode.tracebackI][currentNode.tracebackJ];

			}

			this.alignedM = this.alignedM.reverse();
			this.alignedN = this.alignedN.reverse();
		}

		//AlignPairQuad class getAlignedM() method
		function getAlignedM() {
			return this.alignedM.join("");
		}

		//AlignPairQuad class getAlignedN() method
		function getAlignedN() {
			return this.alignedN.join("");
		}

		//AlignPairQuad class
		function AlignPairQuad() {
			this.M
			this.N
			this.scoreSet
			this.nodes
			this.alignedM
			this.alignedN
			this.score
		}

		//create and throw away a prototype object
		new AlignPairQuad();

		//define object methods
		AlignPairQuad.prototype.initializeMatrix = initializeMatrix;
		AlignPairQuad.prototype.fillMatrix = fillMatrix;
		AlignPairQuad.prototype.align = align;
		AlignPairQuad.prototype.getAlignedM = getAlignedM;
		AlignPairQuad.prototype.getAlignedN = getAlignedN;
		AlignPairQuad.prototype.dumpMatrix = dumpMatrix;

		return AlignPairQuad;
	})();
	//------------------------------------ ScoreSet class
	var ScoreSet = (function() {
		//ScoreSet getScore
		function getScore(r1, r2) {
			return this.scoringMatrix.scoringMatrix_getScore(r1, r2);
		}

		//ScoreSet setScoreSetParam
		function setScoreSetParam(scoringMatrix, gapPenalty, beginGapPenalty, endGapPenalty) {
			this.scoringMatrix = scoringMatrix;
			this.gap = gapPenalty;
			this.beginGap = beginGapPenalty;
			this.endGap = endGapPenalty;
		}

		//ScoreSet class
		function ScoreSet() {
			this.scoringMatrix
			this.gap
			this.beginGap
			this.endGap
			this.useBeginGapTop = true;
			this.useBeginGapLeft = true;
			this.useEndGapBottom = true;
			this.useEndGapRight = true;
		}

		//create and throw away a prototype object
		new ScoreSet();

		//define object methods
		ScoreSet.prototype.getScore = getScore;
		ScoreSet.prototype.setScoreSetParam = setScoreSetParam;

		return ScoreSet;
	})();
	//------------------------------------

	//------------------------------------ ScoringMatrix abstract class
	//ScoringMatrix getScore method
	function scoringMatrix_getScore(r1, r2) {
		r1 = r1.toLowerCase();
		r2 = r2.toLowerCase();
		if (r1 == r2) {
			return this.match;
		} else {
			return this.mismatch;
		}
	}

	//ScoringMatrix class
	function ScoringMatrix() {
		this.mismatch
		this.match
	}

	//create and throw away a prototype object
	new ScoringMatrix();

	//define object methods
	ScoringMatrix.prototype.scoringMatrix_getScore = scoringMatrix_getScore;

	//------------------------------------ Identity class extends ScoringMatrix Class
	//Identity class setMismatch method
	function setMismatch(mismatchScore) {
		this.mismatch = mismatchScore;
	}

	//Identity class setMatch method
	function setMatch(matchScore) {
		this.match = matchScore;
	}

	//Identity class
	function Identity() {
	}


	Identity.prototype = new ScoringMatrix();
	Identity.prototype.setMismatch = setMismatch;
	Identity.prototype.setMatch = setMatch;

	function addReturns(sequence) {
		sequence = sequence.replace(/(.{60})/g, function(str, p1, offset, s) {
			return p1 + "\n";
		});
		return sequence;
	}

	function pairwiseAlign(newDnaOne, newDnaTwo, matchScore, mismatchScore, gapPenalty, beginGapPenalty, endGapPenalty) {
		matchScore || ( matchScore = 2);
		mismatchScore || ( mismatchScore = -1);
		gapPenalty || ( gapPenalty = -2);
		beginGapPenalty || ( beginGapPenalty = 0);
		endGapPenalty || ( endGapPenalty = 0);

		//can use one or both.
		//can compare scores (should be identical)
		var useLinearSpace = true;
		var useQuadraticSpace = false;

		var matrix = new Identity();
		matrix.setMatch(matchScore);
		matrix.setMismatch(mismatchScore);

		var scoreSet = new ScoreSet();
		scoreSet.setScoreSetParam(matrix, gapPenalty, beginGapPenalty, endGapPenalty);

		var alignment;

		if (useLinearSpace) {
			alignment = new AlignPairLinear();
			alignment.setAlignParam(newDnaOne, newDnaTwo, scoreSet);
			alignment.align();

			return {
				sequences : [alignment.getAlignedM(), alignment.getAlignedN()],
				score : alignment.score
			};
		}

		if (useQuadraticSpace) {
			alignment = new AlignPairQuad();
			alignment.initializeMatrix(newDnaOne, newDnaTwo, scoreSet);
			alignment.fillMatrix();
			//alignment.dumpMatrix();
			alignment.align();

			return {
				sequences : [alignment.getAlignedM(), alignment.getAlignedN()],
				score : alignment.score
			};
		}
	}


	/**
	 * Returns the Watson-Crick complement of a sequence of DNA
	 * @param {String} sequence
	 * @returns {String} complement
	 * @author Paul Stothard, University of Alberta, Canada
	 */
	function complement(dnaSequence) {
		//there is no tr operator
		//should write a tr method to replace this
		dnaSequence = dnaSequence.replace(/g/g, "1");
		dnaSequence = dnaSequence.replace(/c/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "c");
		dnaSequence = dnaSequence.replace(/2/g, "g");
		dnaSequence = dnaSequence.replace(/G/g, "1");
		dnaSequence = dnaSequence.replace(/C/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "C");
		dnaSequence = dnaSequence.replace(/2/g, "G");
		dnaSequence = dnaSequence.replace(/a/g, "1");
		dnaSequence = dnaSequence.replace(/t/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "t");
		dnaSequence = dnaSequence.replace(/2/g, "a");
		dnaSequence = dnaSequence.replace(/A/g, "1");
		dnaSequence = dnaSequence.replace(/T/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "T");
		dnaSequence = dnaSequence.replace(/2/g, "A");
		dnaSequence = dnaSequence.replace(/u/g, "a");
		dnaSequence = dnaSequence.replace(/U/g, "A");
		dnaSequence = dnaSequence.replace(/r/g, "1");
		dnaSequence = dnaSequence.replace(/y/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "y");
		dnaSequence = dnaSequence.replace(/2/g, "r");
		dnaSequence = dnaSequence.replace(/R/g, "1");
		dnaSequence = dnaSequence.replace(/Y/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "Y");
		dnaSequence = dnaSequence.replace(/2/g, "R");
		dnaSequence = dnaSequence.replace(/k/g, "1");
		dnaSequence = dnaSequence.replace(/m/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "m");
		dnaSequence = dnaSequence.replace(/2/g, "k");
		dnaSequence = dnaSequence.replace(/K/g, "1");
		dnaSequence = dnaSequence.replace(/M/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "M");
		dnaSequence = dnaSequence.replace(/2/g, "K");
		dnaSequence = dnaSequence.replace(/b/g, "1");
		dnaSequence = dnaSequence.replace(/v/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "v");
		dnaSequence = dnaSequence.replace(/2/g, "b");
		dnaSequence = dnaSequence.replace(/B/g, "1");
		dnaSequence = dnaSequence.replace(/V/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "V");
		dnaSequence = dnaSequence.replace(/2/g, "B");
		dnaSequence = dnaSequence.replace(/d/g, "1");
		dnaSequence = dnaSequence.replace(/h/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "h");
		dnaSequence = dnaSequence.replace(/2/g, "d");
		dnaSequence = dnaSequence.replace(/D/g, "1");
		dnaSequence = dnaSequence.replace(/H/g, "2");
		dnaSequence = dnaSequence.replace(/1/g, "H");
		dnaSequence = dnaSequence.replace(/2/g, "D");

		return dnaSequence;
	}

	/**
	 * Reverses the linear order of a sequence of DNA
	 * @param {String} sequence
	 * @returns {String} complement
	 * @author Paul Stothard, University of Alberta, Canada
	 */
	function reverse(dnaSequence) {
		var tempDnaArray = new Array();
		if (dnaSequence.search(/./) != -1) {
			tempDnaArray = dnaSequence.match(/./g);
			tempDnaArray = tempDnaArray.reverse();
			dnaSequence = tempDnaArray.join("");
		}
		return dnaSequence;
	}

	/**
	 * Returns the #reverse #complement of a sequence of DNA
	 * @param {String} sequence
	 * @returns {String} complement
	 */
	function reverseComplement(dna) {
		return reverse(complement(dna));
	}

	/**
	 * Parses a string containing a numerical identifier and an optional
	 * polarity specifier into an integer segment label reflecting both
	 * identity and polarity
	 *
	 *     parseComplement("5*") // => -5
	 *     parseComplement("2'")  // => -2
	 *     parseComplement("2")  // => 2
	 *
	 * @param {String} identifier
	 * @return {Number} label
	 */
	function parseComplement(identifier) {
		identifier = identifier.trim();
		if (identifier.length > 1) {
			if (identifier[identifier.length - 1] == '*' || identifier[identifier.length - 1] == "'") {
				return -1 * parseInt(identifier.substr(0, identifier.length - 1));
			}
		}
		return parseInt(identifier);
	}

	/**
	 * Parses a string strand specification. A strand specification should be
	 * a list of {@link #parseComplement numerical identifiers}, separated by
	 * a delimiter. Returns an array of integer segment labels
	 *
	 *    parseStrandSpec("1 2 3* 4 5*"," ") // => [1, 2, -3, 4, -5]
	 *
	 * @param {String} spec
	 * @param {String} [delimiter=' ']
	 * @return {Number[]} segments
	 */
	function parseStrandSpec(spec, delimiter) {
		delimiter || ( delimiter = ' ');
		var list = spec.split(delimiter), out = [];
		for (var i = 0; i < list.length; i++) {
			var x = list[i];
			x.trim();
			if(!!x) {				
				out.push(DNA.parseIdentifier(list[i]));
			}
		}
		return out;
	}

	/**
	 * Returns the number of greatest magnitude in a list, regardless of sign (ie: max(abs(list)))
	 * @param {Number[]} list
	 */
	function amax(list) {
		return Math.abs(_.max(list, Math.abs));
	}

	/**
	 * Produces a mapping of a sparse, ordered list of keys to a contiguous ordered list of numbers
	 * e.g. ['a', 'c', 'd'] -> {'a': 0, 'c':1, 'd':2}
	 * @param {Array} list
	 * @param {Number} [offset=0] Amount to add to each element in the new list. (e.g. set to 1 to produce a 1-indexed mapping.)
	 */
	function mapUnique(list, offset) {
		offset || ( offset = 0);
		var out = {};
		list = _.uniq(list, true);
		_.each(list, function(el, i) {
			out[el] = i + offset;
		});
		return out;
	}

	/**
	 * Returns the unique elements of the list of integers, by absolute value
	 */
	function absUnique(list) {
		return _.uniq(_.map(list, Math.abs));
	}

	/**
	 * Alias for #signum
	 */
	function sign(i) {
		return ((i > 0) ? 1 : ((i < 0) ? -1 : 0));
	}

	function tablify(table) {
		var list = table.split('\n'), out = [];
		_.each(list, function(row) {
			out.push(row.split('\t'));
		});
		return out;
	}

	function indexTable(table) {
		var out = {};
		_.each(table, function(row) {
			if (row.length > 1) {
				out[row[0]] || (out[row[0]] = {});
				out[row[0]][row[1]] = (row.length > 3 ? row.slice(2) : row[2]);
			}
		});
		return out;
	}

	function indexBy(field1, field2, table) {
		var out = {};
		_.each(table, function(row) {
			out[row[field1]] || (out[row[field1]] = {});
			out[row[field1]][row[field2]] = row;
		});
		return out;
	}
	
	/*
	 * Secondary structure layout
	 */
	
	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



	//-------------------------------------------------------------------------
	// Sequence Generation

	/*
	 * Degenerate bases
	 */
	
	var degenerate = {
		'A':['A'], // Adenine
		'C':['C'], // Cytosine
		'G':['G'], // Guanine
		'T':['T'], // Thymine
		'U':['U'], // Uracil
		'R':['A', 'G'], // puRine
		'Y':['C', 'T', 'U'], // pYrimidines
		'K':['G', 'T','U'], // bases which are Ketones
		'M':['A','C'], // bases with aMino groups
		'S':['C','G'], // Strong interaction
		'W':['A', 'T', 'U'], // Weak interaction
		'B':['C', 'G', 'T', 'U'], // not A (B comes after A)
		'D':['A', 'G', 'T', 'U'], // not C (D comes after C)
		'H':['A', 'C', 'T', 'U'], // not G (H comes after G)
		'V':['C', 'G'], // not U or T (comes after U)
		'N':['A', 'C', 'G', 'T', 'U'], // aNy
		'X':[], //masked
	};
	var degenerateDna = {};
	for(var b in degenerate) {
		if(b!='U') degenerateDna[b] = _.filter(degenerate[b], function(x) { return x != 'U'; });
	}

	var degenerateRna = {};
	for(var b in degenerate) {
		if(b!='T') degenerateRna[b] = _.filter(degenerateRna[b], function(x) { return x != 'T'; });
	}

	var degenerateRegexes = _.reduce(_.keys(degenerate),function(memo,key) {
		memo[key] = new RegExp('/['+degenerate[key].join('')+']/i');
		return memo;
	},{})

	var sequenceRegex = new RegExp(_.reduce(_.keys(degenerate),function(memo,key) {
		memo += key + key.toLowerCase();
		return memo;
	},''));

	function matchDegenerate(deg,base) {
		return degenerateRegexes[deg].test(base)
	}

	function populateDegenerate(spec,options) {
		var degenerateMap; options || (options = {}); 
		if(options.rna) { 
			degenerateMap = degenerateRna;
		} else {
			degenerateMap = degenerateDna
		}
		return _.map(spec.split(''),function (x) {
			return chooseDegenerate(x,degenerateMap);
		}).join('');
	}

	function chooseDegenerate(base,degenerateMap)  {
		var x = degenerateMap[base];
		return x[Math.floor(Math.random() * x.length)];
	}

	//-------------------------------------------------------------------------
	// Parsing and Export
	
	/*
	 * NUPACK
	 */

	function stripNupackHeaders(string) {
		var arr = string.split('\n');
		while (arr[0] && arr[0][0] == '%') {
			arr.shift();
		}
		return arr.join('\n');
		//return string.substr(string.indexOf('\n\n% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %\n'));
	};

	function nupackBlocks(string) {
		return _.each(string.split('% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %'), function(i) {
		});
	};

	function parseNamedSequences(string) {
		var lines = string.split('\n'), name, seq, pair, out = {};

		for(var i=0; i<lines.length; i++) {
			// FASTA-style
			// >name
			// ATCG
			if(/^>[\w\s]+$/.test(lines[i])) {
				name = lines[i].match(/^>([\w\s]+)$/)[1];
				i++;
				if((/([acgturykmswbdhvnx]+)/i).test(lines[i])) {
					seq = lines[i].match(/([acgturykmswbdhvnx]+)/i)[1];
				} else {
					seq = '';
				}
			}

			// Keyword-style
			// domain name = ATCG
			// domain name : ATCG
			// sequence name : ATCG
			// segment name : ATCG
			// ... 
			else if(/^(?:domain|sequence|segment)\s*(\w+)\s*[:=]\s*([acgturykmswbdhvnx]+)\s*$/i.test(lines[i])) {
				pair = lines[i].match(/^(?:domain|sequence|segment)\s*(\w+)\s*[:=]\s*([acgturykmswbdhvnx]+)\s*$/i);
				name = pair[1]; seq = pair[2];
			}

			// NUPACK-style:
			// name : ATCG
			// name = ATCG
			else if(/^(\w+)\s*[:=]\s*([acgturykmswbdhvnx]+)\s*$/i.test(lines[i])) {
				pair = lines[i].match(/^(\w+)\s*[:=]\s*([acgturykmswbdhvnx]+)\s*$/i);
				name = pair[1]; seq = pair[2];
			}

			// TSV or CSV:
			// name,ATCG
			// name		ATCG
			else if(/^(\w+)\s*[,\t]\s*([acgturykmswbdhvnx]+)\s*$/i.test(lines[i])) {
				pair = lines[i].match(/^(\w+)\s*[,\t]\s*([acgturykmswbdhvnx]+)\s*$/i);
				name = pair[1]; seq = pair[2];

			}

			// No name
			else {
				name = (i+1).toString();
				seq = lines[i];
			}
			out[name] = seq;
		}
		return out;
	};

	/**
	 * Prints a set of sequences using the specified format
	 * @param  {Object} strands Hash mapping sequence name to sequence
	 * @param  {String} mode 
	 * One of several possible modes:
	 * 		- `nupack`
	 * 		- `dd`
	 * 		- `colon` (`:`)
	 * 		- `equals` (`=`)
	 * 		- `csv` (`,`)
	 * 		- `tsv` (`\t`)
	 * @return {[type]} [description]
	 */
	function printSequences (sequences, mode, options) {
		var out = '', seq, count = 0;


		// sequences
		for(var name in sequences) {
			seq = sequences[name];
			switch(mode) {
				case 'nupack':
					out += 'domain ' + name + ' = ' + seq + '\n'; break;
				case 'dd':
					out += seq + ' 1 15' + '\n'; break;
				case 'colon':
				case ':':
					out += name + ' : ' + seq + '\n'; break;
				case 'equals':
				case '=':
					out += name + ' = ' + seq + '\n'; break;	
				case 'fasta':
					out += '>'+name + '\n' + seq + '\n'; break;
				case 'tsv':
				case '\t':
					out += name + '\t' + seq + '\n'; break;
				case 'csv':
				case ',':
					out += name + ',' + seq + '\n'; break;
				default:
				case '':
					out += seq + '\n';
			}
			count++;
		}

		// header
		switch(mode) {
			case 'dd':
				out = count + '\n' + out; break;
		}

		// footer
		switch(mode) {
			default:
				break;
		}

		return out;
	}

	function namedStrandsToNupack(strands) {
		
	}

	//--------------------------------------------------------------------
	// Sequence group handling

	/**
	 * Accepts a set of domains and a strand specification, and produces a sequence to represent the strand
	 * 
	 * @param {Object} segments
	 * Hash mapping segment names to sequences, e.g. `{ 'd1': 'ATACG', 'd2':'GCTTA', ... }`
	 * 
	 * @param {String/Array} strand
	 * String strand spec (e.g. `d1 d2* d3 d4*`, `d1 d2' d3' d4`, etc.), or array of 
	 * {@link #getIdentifier identifier} objects (e.g. `[{identity: 'd1', polarity: -1}, ...]`)
	 * 
	 * @param {Boolean} [concat=true]
	 * True to return a concatenated string, false to return an array of sequences in order
	 * 
	 * @returns {String} The complete sequence
	 */
	function threadSegments(segments, strand, concat) {
		concat = (concat == undefined) ? true : concat;
		var strandList = _.isArray(strand) ? _.map(strand,function(x) {
			if(_.isObject(x)) {
				return x;
			} else if(_.isNumber(x)) {
				return { identity: Math.abs(x), polarity: sign(x) }
			} else {
				return DNA.parseIdentifier(x);
			}
		}) : parseStrandSpec(strand, ' '), sequence = [], id;
		if (_.isArray(segments)) {
			for (var i = 0; i < strandList.length; i++) {
				id = strandList[i];
				if (segments[parseInt(id.identity) - 1]) {
					if (id.polarity > 0) {
						sequence.push( segments[parseInt(id.identity) - 1] );
					} else {
						sequence.push( reverseComplement(segments[parseInt(id.identity) - 1]) );
					}
				} else {
					throw Error('Threading error: Undefined segment '+id);
				}
			}
		} else {
			for (var i = 0; i < strandList.length; i++) {
				id = strandList[i];
				
				if (segments[id.identity]) {
					if (id.polarity == 1) {
						sequence.push( segments[id.identity] );
					} else {
						sequence.push( reverseComplement(segments[id.identity]) );
					}
				}
			}
		}
		if (concat)
			return sequence.join('');
		else
			return sequence;
	}
	function unthreadSegments(sequence, strand) {

	}

	/**
	 * Given a hash mapping names to sequences, e.g.:
	 * 
	 *     {
	 * 	       'a': 'AAATACG',
	 *         'b': 'TTAAAGAAC',
	 *         ...
	 *     }
	 * 
	 * Returns an augmented hash which also includes the sequences of the
	 * reverse complements; e.g.:
	 * 
	 *     {
	 * 	       'a': 'AAATACG',
	 *         'a*': 'CGTATTT',
	 *         'b': 'TTAAAGAAC',
	 *         'b*': 'GTTCTTTAA',
	 *         ...
	 *     }
	 * 
	 * @param {Object} sequences
	 * @return {Object} sequencesWithComplement
	 */
	function hashComplements(sequences) {
		sequences = _.clone(sequences);
		for(var key in sequences) {
			if(_.has(sequences,key)) {
				var id = DNA.makeIdentifier(key,-1);
				if(!sequences[id]) {
					sequences[id] = DNA.reverseComplement(sequences[key]);
				}
			}
		}
		return sequences;
	}

	// Layout
	
	var layout = (function() {
		var debug = true;
		var baseLength = breakWidth = 20, 
			stemWidth = 1.5 * baseLength, 
			duplexWidth = stemWidth + baseLength,
			pi2 = 2*Math.PI,
			piHalf = Math.PI/2;
		var phi = Math.PI/4;
								
		function getBounds(list) {
			var xmin = list[0][0], xmax = list[0][0], ymin = list[0][1], ymax = list[0][1];
			
			for(var i=0;i<list.length;i++) {
				if(list[i][0] < xmin) { xmin = list[i][0] }
				if(list[i][0] > xmax) { xmax = list[i][0] }
				
				if(list[i][1] < ymin) { ymin = list[i][1] }
				if(list[i][1] > ymax) { ymax = list[i][1] }
			}
			return [[xmin,xmax],[ymin,ymax]]
		}
		
		function getScale(bounds,scale,maintainAspect) {
			var xscale = 1, yscale = 1, 
				width = bounds[0][1]-bounds[0][0], height = bounds[1][1] - bounds[1][0];
			if(maintainAspect) {
				xscale = yscale = Math.min(scale[0]/width,scale[1]/height);
				// if(scale[0] < scale[1]) {
				// 	xscale = yscale = scale[0]/width;
				// } else if (scale[0] >= scale[1]) {
				// 	xscale = yscale = scale[1]/height; 
				// }
			
			} else {						
				xscale = scale[0]/width;
				yscale = scale[1]/height;
			}
			return [xscale, yscale];
		}

		function getOffset(bounds,scale,zoom) {
			zoom || (zoom = 1);
			var width = (bounds[0][1]-bounds[0][0])*zoom, height = (bounds[1][1] - bounds[1][0])*zoom,
				cWidth = scale[0], cHeight = scale[1];
			return [cWidth/2-width/2, cHeight/2-height/2];
		}
		
		function arrangeLayout(list,options) {
			options || (options = {});
			_.defaults(options,{
				center: true,
				alignCenter: true,
				scale: false,
				offsets: false,
				maintainAspect: true,
			});
			
			var bounds = getBounds(list),
				dx, dy,	
				width = bounds[0][1]-bounds[0][0],
				height= bounds[1][1]-bounds[1][0],
				scale, xscale = 1, yscale = 1;
			if(options.scale) {			
				scale = getScale(bounds,options.scale,options.maintainAspect);
				xscale = scale[0], yscale = scale[1];
			}
			
			if(options.center) {
				dx = bounds[0][0];
				dy = bounds[1][0];
			}
			if(options.alignCenter && options.scale) {
				dx += options.scale[0]/2-width/2;
				dy += options.scale[1]/2-height/2;
			}
			if(options.offsets) {
				dx -= options.offsets[0]
				dy -= options.offsets[1]
			}
			
			return {
				scale: [xscale,yscale],
				offsets: [dx,dy],
				bounds: bounds,
				pairs: _.map(list,function(pair) {
					pair[0] -= dx; pair[1] -= dy;
					pair[0] *= xscale; pair[1] *= yscale; 
					
					return pair;
				})
			}
		}
		
			
		function drawLoop(struct,start,theta,space,mode) {
			
			// Specifies how loops are drawn---either in a simple circle (for bulges, multiloops, hairpins, etc.)
			// or with linear tails sticking out (e.g. for gate motifs, etc.)
			mode || (mode = 'circular');

			// We draw certain special patterns differently in "linear" or "first" mode;
			// otherwise, default to circular mode
			if (mode == 'linear' && (struct.length < 2 || struct.length > 3)) {
				mode = 'circular'
			} 
			else if (mode == 'first'  && (struct.length < 1 || struct.length > 3)) {
				mode = 'circular';
				struct.push(['+',1])
			}
			
			if(debug) {
				console.group('Loop : ('+mode+') '+coords(start)+' '+deg(theta)+'° = '+DNA.printDUPlus(struct));
			}
			
			var out = [];
			
			// Diagrams show each different case; vertical pipes (|) separate 
			// the section of interest from the rest of the structure, shown 
			// for context. The asterisk (*) indicates the section of interest.
			// If drawing an opening "loop" on the outside of a duplex
			if(mode == 'first') {
				if (struct.length == 1) {
					var theta_line, len, firstBase;
					switch(struct[0][0]) {

						// ______
						// 
						case '.':
						case 'U':
							len = struct[0][1];
							out = out.concat(drawLine(len,start,theta));

							break;

						default:
							if(debug) {
								console.groupEnd();
							}
							return drawLoop(struct.concat([['+', 1]]),start,theta,space,'circular');
					}
				} else 	
				if (struct.length == 2) {
					var theta_line, len, firstBase;
					switch(struct[0][0] + struct[1][0]) {

						//  \__|
						//   __| 
						//     |
						//  *   
						case '.D':
						case 'UD':
						case '.H':
						case 'UH':
							theta_line = theta + phi; 
							len = struct[0][1];
							firstBase = start.addPolar(theta_line+Math.PI,baseLength*len);

							out = out.concat(drawLine(len,firstBase,theta_line));
							out = out.concat(drawDuplex(struct[1],theta,start,'linear'));
							break;

						//   __|
						//   __|
						//  /  |
						//   *
						case 'D.':
						case 'DU':
						case 'H.':
						case 'HU':
							out = out.concat(drawDuplex(struct[0],theta,start,'linear'));//start.addPolar(theta+piHalf,stemWidth/2)));

							theta_line = theta-phi+Math.PI; len = struct[1][1];
							firstBase = start.addPolar(theta+piHalf,stemWidth);
							out = out.concat(drawLine(len,firstBase,theta_line));
							break;


						default:
							if(debug) {
								console.groupEnd();
							}
							return drawLoop(struct.concat([['+', 1]]),start,theta,space,'circular');
					}
				} else if(struct.length == 3) {
					switch(struct[0][0] + struct[1][0] + struct[2][0]) {
						
						//  ??
						//  \__|
						//   __| 
						//  /  |
						//  
						case '.D.':
						case 'UDU':
						case '.H.':
						case 'UHU':
							// Draw unpaired (line)
							var theta_line = theta + phi + Math.PI, len = struct[0][1],
							// firstBase = start.addPolar(theta_line+Math.PI,baseLength*len);
							firstBase = start.addPolar(theta_line,baseLength);
							out = out.concat(drawLine(-len,firstBase,theta_line));

							out = out.concat(drawDuplex(struct[1],theta,start,'linear'));

							theta_line = theta-phi+Math.PI; len = struct[2][1];
							firstBase = start.addPolar(theta+piHalf,stemWidth).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(len,firstBase,theta_line));
							break;
						default:
							if(debug) {
								console.groupEnd();
							}
							return drawLoop(struct.concat([['+', 1]]),start,theta,space,'circular');
					}
				}
			} 
			// If drawing a linear loop within an existing duplex
			else if(mode == 'linear') {
				var theta_line, len, firstBase;
				if (struct.length == 2) {
					switch(struct[0][0] + struct[1][0]) {

						//  __|/
						//  __|
						//    |
						//      *
						case '.+':
						case 'U+':
							theta_line = theta-phi; 
							len = struct[0][1];
							firstBase = start.addPolar(theta-piHalf,stemWidth/2).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(len,firstBase,theta_line));
							break;
						
						//  __|
						//  __|
						//    |\
						//       *
						case '+.':
						case '+U':
							theta_line = theta+phi; 
							len = struct[1][1];
							firstBase = start.addPolar(theta+piHalf,stemWidth/2).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(-len,firstBase,theta_line));
							break;

						default:
							if(debug) {
								console.groupEnd();
							}
							return drawLoop(struct,start,theta,space,'circular');
					}
				} else if(struct.length == 3) {
					switch(struct[0][0] + struct[1][0] + struct[2][0]) {
						
						//  __|/
						//  __|
						//    |\
						//       *
						case '.+.':
						case 'U+U':
						case '.+U':
						case 'U+.':
							// Draw first unpaired (line)
							theta_line = theta-phi;
							len = struct[0][1];
							firstBase = start.addPolar(theta-piHalf,stemWidth/2).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(len,firstBase,theta_line));

							// Draw second unpaired (line)
							theta_line = theta+phi;
							len = struct[2][1];
							firstBase = start.addPolar(theta+piHalf,stemWidth/2).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(-len,firstBase,theta_line));
							break;

						//  _|/ _
						//  _|___
						//   |
						//     *
						case '.+D':
						case 'U+D':
						case '.+H':
						case 'U+H':
							// Draw unpaired (line)
							theta_line = theta-phi; 
							len = struct[0][1];
							firstBase = start.addPolar(theta-piHalf,stemWidth/2).addPolar(theta_line,baseLength); //start.addPolar(theta-piHalf,stemWidth/2).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(len,firstBase,theta_line));

							// Skip strand break
							start = start.addPolar(theta,breakWidth).addPolar(theta-piHalf,stemWidth/2);

							// Draw duplex
							out = out.concat(drawDuplex(struct[2],theta,start,'linear'));
							break;

						//  _|___
						//  _|_ _
						//   | /
						//     *
						case 'D.+':
						case 'DU+':
						case 'H.+':
						case 'HU+':
							// Skip strand break
							start = start.addPolar(theta,breakWidth).addPolar(theta-piHalf,stemWidth/2);

							// Draw duplex
							out = out.concat(drawDuplex(struct[0],theta,start,'linear'));
							
							// Draw unpaired (line)
							theta_line = theta+Math.PI-phi; 
							len = struct[1][1];
							firstBase = start.addPolar(theta+piHalf,stemWidth).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(len,firstBase,theta_line));

							break;

						//  _| \_
						//  _|___
						//   |
						//     *
						case '+.D':
						case '+UD':
						case '+.H':
						case '+UH':
							// Skip strand break
							start = start.addPolar(theta,breakWidth).addPolar(theta-piHalf,stemWidth/2);


							// Draw unpaired (line)
							theta_line = theta-piHalf-phi; 
							firstBase = start.addPolar(theta_line,baseLength);

							len = struct[1][1];
							out = out.concat(drawLine(-len,firstBase,theta_line));

							// Draw duplex
							out = out.concat(drawDuplex(struct[2],theta,start,'linear'));
							break;


						//  _|___
						//  _|_ _
						//   | \
						//     *
						case 'D+.':
						case 'D+U':
						case 'H+.':
						case 'H+U':
							// Skip strand break
							start = start.addPolar(theta,breakWidth).addPolar(theta-piHalf,stemWidth/2);

							// Draw duplex
							out = out.concat(drawDuplex(struct[0],theta,start,'linear'));
							
							// Draw unpaired (line)
							theta_line = theta+piHalf-phi; 
							len = struct[2][1];
							firstBase = start.addPolar(theta+piHalf,stemWidth).addPolar(theta+Math.PI,breakWidth).addPolar(theta_line,baseLength);
							out = out.concat(drawLine(len,firstBase,theta_line));

							break;


						default:
							if(debug) {
								console.groupEnd();
							}
							return drawLoop(struct,start,theta,space,'circular');
					}
				}
			} else if(mode == 'circular') {

				function mod(x, m) {
				    return (x % m + m) % m;
				}
				
				var umode = null;
				for (var i = struct.length - 1; i >= 0; i--) {
					if(struct[i][0] == 'U' || struct[i][0] == '.') {
						if (i > 0 && struct[i-1][0] == '+' && (umode == null || umode == '-line')) {
							umode = '-line'
						} else if ((i+1) < struct.length && struct[i+1][0] == '+' && (umode == null || umode == '+line')) {
							umode = '+line';
						} else {
							umode = 'arc'
							break
						}
					}
				}


				// Contribution of each chunk to the circumference
				var dcirc = _.map(struct,function(chunk) {
					switch(chunk[0]) {
						case 'H': case 'D': return duplexWidth;
						case '.': case 'U': 
							if (umode == '+line' || umode == '-line') return duplexWidth;
							else return baseLength * chunk[1];
						case '+': return breakWidth;
					}
				});
				
				// Total loop circumference
				var loopCirc = sum(dcirc) + space;
				
				// Loop radius
				var loopRadius = loopCirc / pi2;
				
				// Center, starting point
				var center = start.addPolar(theta,loopRadius),
					cx = center.x, cy = center.y,
					x, y;
					
				theta += Math.PI;
				theta += (.5 * space / loopCirc) * pi2;
				
				x = Math.cos(theta) * loopRadius + cx;
				y = Math.sin(theta) * loopRadius + cy;
				
				for(var i = 0; i<struct.length; i++) {
					var chunk = struct[i],
						dtheta = dcirc[i] / loopCirc * pi2; 
					
					switch(chunk[0]) {
						case 'H':
						case 'D':
							// center of duplex should be at theta + dtheta/2
							var theta_duplexCenter = theta + dtheta/2, 
								duplexCenter = center.addPolar(theta_duplexCenter,loopRadius),
								theta_firstBase = theta_duplexCenter - (dtheta * 0.5 * stemWidth/duplexWidth), 
								firstBase = center.addPolar(theta_firstBase,loopRadius),
								
							out = out.concat(drawDuplex(chunk,theta_duplexCenter,firstBase,'linear'))
							break;
						case '.':							
						case 'U':
							if (umode == '+line' || umode == '-line') {
								var theta_duplexCenter = theta + dtheta/2, 
									duplexCenter = center.addPolar(theta_duplexCenter,loopRadius),
									theta_firstBase = theta_duplexCenter - (dtheta * 0.5 * stemWidth/duplexWidth), 
									firstBase = center.addPolar(theta_firstBase,loopRadius);

								if (umode == '-line')
									out = out.concat(drawLine(-chunk[1],firstBase,theta_duplexCenter));
								else
									out = out.concat(drawLine(chunk[1],firstBase,theta_duplexCenter));
							}
							else out = out.concat(drawArc(chunk[1],Point.create(cx,cy),theta,dtheta,loopRadius));
							break;
						case '+':
							break;
					}
					theta += dtheta;
					x = Math.cos(theta) * loopRadius + cx;
					y = Math.sin(theta) * loopRadius + cy;
				}

				// // Contribution of each chunk to the circumference
				// var dcirc = _.map(struct,function(chunk) {
				// 	switch(chunk[0]) {
				// 		case 'H': case 'D': return duplexWidth;
				// 		case '.': case 'U': return baseLength * chunk[1];
				// 		case '+': return breakWidth;
				// 	}
				// });
				
				// // Total loop circumference
				// var loopCirc = sum(dcirc) + space;
				
				// // Loop radius
				// var loopRadius = loopCirc / pi2;
				
				// // Center, starting point
				// var center = start.addPolar(theta,loopRadius),
				// 	cx = center.x, cy = center.y,
				// 	x, y;
					
				// theta += Math.PI;
				// theta += (.5 * space / loopCirc) * pi2;
				
				// x = Math.cos(theta) * loopRadius + cx;
				// y = Math.sin(theta) * loopRadius + cy;
				
				// for(var i = 0; i<struct.length; i++) {
				// 	var chunk = struct[i],
				// 		dtheta = dcirc[i] / loopCirc * pi2; 
					
				// 	switch(chunk[0]) {
				// 		case 'H':
				// 		case 'D':
				// 			// center of duplex should be at theta + dtheta/2
				// 			var theta_duplexCenter = theta + dtheta/2, 
				// 				duplexCenter = center.addPolar(theta_duplexCenter,loopRadius);
								
				// 			// 
				// 			var theta_firstBase = theta_duplexCenter - (dtheta * 0.5 * stemWidth/duplexWidth), 
				// 				//theta_lastBase = theta + dtheta - (dtheta * baseLength/(duplexWidth)),
								
				// 				firstBase = center.addPolar(theta_firstBase,loopRadius),
				// 				//lastBase = center.addPolar(theta_lastBase,loopRadius);
								
				// 			out = out.concat(drawDuplex(chunk,theta_duplexCenter,firstBase,'linear'))
				// 			break;
				// 		case '.':							
				// 		case 'U':
				// 			out = out.concat(drawArc(chunk[1],Point.create(cx,cy),theta,dtheta,loopRadius));
				// 			break;
				// 		case '+':
				// 			break;
				// 	}
				// 	theta += dtheta;
				// 	x = Math.cos(theta) * loopRadius + cx;
				// 	y = Math.sin(theta) * loopRadius + cy;
				// }

			}
			
			if(debug) {
				console.groupEnd();
			}
			
			return out;
			
		}

		function drawLine(len,start,theta) {
			var x = start.x, y = start.y, 
				dx = Math.cos(theta)*baseLength,
				dy = Math.sin(theta)*baseLength,
				out = [],
				flip = (len < 0),
				theta_normal = theta + Math.PI/2 + (flip ? 0 : Math.PI); //(piHalf * flip ? 1 : -1);

			if(debug) {						
				console.log('Line : '+coords(start)+' '+deg(theta)+'° = U'+len);					
			}
			
			if(flip) len = -len;

			for(var i = 0; i<len; i++) {
				out.push([x,y,theta_normal]);
				x += dx; y += dy;
			}

			if(flip) { out = out.reverse() }

			return out;
		}

		function drawArc(len,center,theta,sweep,radius) {
			var dtheta = sweep / len,
				cx = center.x, cy = center.y, x, y, out = [];
				
			if(debug) {						
				console.log('Arc : '+coords(center)+' '+deg(theta)+'° + '+deg(sweep)+' (dΘ='+dtheta+'°), r: '+radius+' = U'+len);					
			}
			
			theta += dtheta/2;
			for(var i = 0; i<len; i++) {
				x = Math.cos(theta) * radius + cx,
				y = Math.sin(theta) * radius + cy;
				out.push([x,y,theta]);
				theta += dtheta;						
			}
			return out;
		}
		
		function drawDuplex(chunk,theta,firstBase,loopMode) {

			if(debug) {
				console.group('Duplex : '+coords(firstBase)+' '+deg(theta)+'° = '+DNA.printDUPlus([chunk]));
			}
			
			//theta -= (Math.PI / 2)
			
			var len = chunk[1],
				// cx = center.x,
				// cy = center.y,
				x0 = x = firstBase.x, 
				y0 = y = firstBase.y,
				x1, y1,
				dx = Math.cos(theta) * baseLength,
				dy = Math.sin(theta) * baseLength,
				theta_normal = theta - (Math.PI/2),
				out;
			
			// Draw first side of duplex
			out = [[firstBase.x,firstBase.y,theta_normal]];
			for(var i = 1; i<len; i++) {					
				x += dx
				y += dy;
				out.push([x,y,theta_normal]);
			}
			
			x1 = x;
			y1 = y;

			// Draw loop
			theta_normal = theta + (Math.PI/2);
			x = x1 + Math.cos(theta_normal) * (stemWidth/2);
			y = y1 + Math.sin(theta_normal) * (stemWidth/2);
			out = out.concat(drawLoop(chunk[2],Point.create(x,y),theta,duplexWidth,loopMode))
										
			// Draw second side of duplex				
			x = x1 + Math.cos(theta_normal) * stemWidth;
			y = y1 + Math.sin(theta_normal) * stemWidth;

			out.push([x,y,theta_normal]);
			
			for(var i = 1; i<len; i++) {					
				x -= dx
				y -= dy;
				out.push([x,y,theta_normal]);
			}
											
			if(debug) {
				console.groupEnd();
			}
			
			return out;			
		}
		
		function layoutStructure(structure,options) {
			var theta = 0, //Math.PI/2,
				x = 0, y = 0;
			if(options && options.arrangeLayout!==false) {
				options.arrangeLayout = true;
			}

			if(structure.length==0) { return []; }
			
			var loopMode = options ? options.loopMode : null;
			if(loopMode && loopMode == 'linear') { loopMode = 'first'; } 
			var points = drawLoop(structure,Point.create(x,y),theta,breakWidth,loopMode);
			if(points.length > 0 && options && !options.arrangeLayout) {
				return arrangeLayout(points,options).pairs;
			} else {
				return points;
			}	
		}

		return {
			getScale: getScale,
			getOffset: getOffset,
			getBounds: getBounds,
			arrangeLayout: arrangeLayout,
			layoutStructure: layoutStructure
		};

	})();

	//--------------------------------------------------------------------
	// Specification parsing and printing

	/**
	 * Converts a CodeMirror-parsed NUPACK file into a structure specification.
	 * @param {Array} lines Result of running CodeMirror#tokenize(string, 'nupack') on a structure specification
	 * @return {Object} spec
	 * @return {Object} spec.domains Hash mapping the names of each segment to their sequence (or proto-sequence; may contain degenerate bases like N)
	 * @return {Object} spec.strands Hash mapping strand names to strings specifying their contents
	 * @return {Object} spec.complexes 
	 * Hash mapping complex names to strings specifying their constituents. These strings use the NUPACK convention, such that they may be either be
	 * lists of strands or lists of domains. It's up to the consumer of this data to figure out which.
	 *
	 * @return {String[]} spec.other
	 * Array of other parsed lines not consumed by this code; useful for passing through e.g. multisubjective commands
	 */
	function structureSpec(lines) {
		var sequences = {}, strands = {}, structures = {}, complexes = {}, others = [];
		_.each(lines, function(line) {
			if (line.length > 0) {
				
				/* Handle structures
				 * e.g.:
				 * 		0         1  2 3
				 * 		structure A1 = U16 D18(U19) U8
				 * 		structure A2 = ...(((..+..)))
				 */
				if (line[0][1] == 'structure') {
					var name = line[1][1], spec = _.select(line.slice(3), function(x) {
						return x[0] == 'nupack-huplus';
					});
					spec = _.pluck(spec, 1);
					spec = spec.join('');

					structures[name] = spec;
				} 

				/* Handle segment/sequences 
				 * e.g.:
				 *     0        1 2 3...
				 *     sequence a = 7N
				 *     sequence a = ATCGNA
				 *     domain   a = GYRBA
				 */
				else if (line[0][1] == 'sequence' || line[0][1] == 'domain' || line[0][1] == 'segment') {
					/*
					 *	e.g:
					 *	
					 *	line = [
					 *		["keyword", "sequence"],
					 *		["string", "1"],
					 *		["operator", ":"],
					 *		["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], 
					 *		["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"], ["sequence-n", "N"]
					 *	]
					 */
					var name = line[1][1], spec = _.select(line.slice(3), function(x) {
						return (x[0] == 'number' || (x[0].indexOf('sequence') != -1));
					});

					// e.g. `6N`
					if (spec[0][0] == 'number') {
						var base = spec[1][1], times = parseInt(spec[0][1]), spec = '';
						spec = Array(times+1).join(base);
					}
					// e.g. `N65`
					// note that each subsequent digit is a separate token 
					else if (spec.length>1 && spec[1][0] == 'number') {
						var base = spec[0][1], 

						// select all subsequent tokens, combine together to make an integer
						times = parseInt(_.pluck(spec.slice(1),1).join('')), spec = '';

						// create string of repeated base
						spec = Array(times+1).join(base);
					}
					// e.g. `GATCANY` ... 
					else {
						spec = _.pluck(spec, 1).join('');
					}
					sequences[name] = spec;

					
				} 
				/* Handle Pepper-style threading assignments
				 * e.g.:
				 *     0      1  2 3...
				 *     strand m1 = a b c*
				 */
				else if (line[0][1] == 'strand') {
					var name = line[1][1], spec = _.select(line.slice(3), function(x) {
						return x[0] == 'string';
					});
					spec = _.pluck(spec, 1);
					spec = spec.join(' ');

					strands[name] = spec;
				}

				/* Handle NUPACK-style threading assignments for strands
				 * e.g.:
				 *     0      1 2...
				 *     M1     : 1 2* 3 4
				 *
				 * And complexes
				 * e.g.:
				 *     M2.seq = 1 2* 3 4
				 */
				else if (line[0][0] == 'variable' && line[1] && (line[1][1] == ':' || line[1][1] == '=')) {
					var name = line[0][1], spec = _.select(line.slice(2), function(x) {
						return x[0] == 'string';
					});
					spec = _.pluck(spec, 1);

					// Handle complex-threading, e.g. `M2.seq`  
					if(name.indexOf('.seq') != -1) { 
						name = name.replace('.seq','')
						spec = _.compact(spec) 
						complexes[name] = spec;
					} 
					// Handle strand-threading
					else {
						spec = spec.join(' ');
						strands[name] = spec;							
					}
				}

				else {
					others.push(line);
				}
			}
		});
		return {
			domains : sequences,
			strands : strands,
			structures: structures,
			complexes: complexes,
			others: others,
		};
	}

	function expandStrands(strands) {
		/*
		 * strands = [{
		 * 		name: 'S1',
		 * 		domains: [{
		 * 			name: 'd1',
		 * 			segments: ['1*', '2', '2*']
		 * 		}, ... ]
		 * }, ...]
		 * 
		 * or
		 * 
		 * strands = [[
		 *		{
		 * 			name: 'd1',
		 * 			segments: ['1*', '2', ... ]
		 * 		}, ...
		 * ], ...]
		 * 
		 * or 
		 * 
		 * strands = [[['1*', '2', ...], ... ], ... ]
		 */
		return _.map(strands,function(s,i) {
			if(_.isArray(s)) {
				s = { name: 'S'+i, domains: s }
			} else {
				s = _.clone(s);
			}
			s.domains = _.map(s.domains,function(d,j) {
				if(_.isArray(d)) {
					d = { name: 'd'+j, segments: d, role: null }
				} else {
					d = _.clone(d);
				}
				d.segments = _.map(d.segments,function(g,k) {
					if(_.isString(g)) {
						g = { name: g, role: null };
					} else if(_.isNumber(g)) {
						g = { name: ''+g, role: null };
					} else {
						g = _.clone(g);
					}
						if(g.name && !g.identity) {
						var id = DNA.parseIdentifier(g.name);
						g.identity = id.identity; g.polarity = id.polarity;						
						} else if(g.identity && g.polarity && !g.name) {
							g.name = DNA.makeIdentifier(g.identity, g.polarity);
						}
					
					return g;
				})
				return d;
			});
			return s;
		});
	}

	function normalizeSystem(strands) {
		// var list = [];
		// _.each(strands, function(strand) {
		// list.push(parseStrandSpec(strand));
		// });
		var list = _.map(strands, parseStrandSpec);

		var uniq = absUnique(_.flatten(list)).sort(function(a, b) {
			return a - b;
		}), mapping = mapUnique(uniq, 1), out = [];
		_.each(list, function(strand) {
			var s = [];
			_.each(strand, function(el) {
				s.push(sign(el) * mapping[Math.abs(el)]);
			});
			out.push(s);
		});
		return out;
	}
	function encodeStrand(strand) {
		return _.map(strand, function(el) {
			return Math.abs(el) + (sign(el) < 0 ? '*' : '');
		}).join(' ');
	}

	/**
	 * Forms an identifier string consisting of a name and an optional
	 * polarity specifier
	 * @param {String} name,
	 * @param {Number} polarity
	 * @return {String} identifier
	 */
	function makeIdentifier(name, polarity) {
		return name + ((polarity == -1) ? this.defaultPolaritySpecifier : '');
	}

	function printIdentifier(id) {
		return DNA.makeIdentifier(id.identity || id.name, id.polarity);
	}
	/**
	 * Parses a string polarity identifier or number and produces a numerical
	 * polarity
	 *
	 *     parsePolarity("+") // => 1
	 *     parsePolarity("-") // => -1
	 *     parsePolarity(1) // => 1
	 *     parsePolarity(-5) // => -1
	 *
	 * @param {String/Number} polarityString Polarity representation
	 * @returns {Number} polarity Numerical polarity (1 for 5' -> 3', -1 for 3' -> 5')
	 */
	function parsePolarity(polarityString) {
		if (_.isNumber(polarityString)) {
			return this.signum(polarityString);
		}

		if (polarityString == "-") {
			return -1;
		} else if (polarityString == "+") {
			return 1;
		}
		return 0;
	}
	/**
	 * Gets the polarity of a given identifier string. Strings ending with `*` or
	 * `'` are assumed to have negative (3' to 5') polarity; other strings are 
	 * assumed to have positive (5' to 3' polarity)
	 * @param {String} identifier
	 * @return {Number} polarity 1 for 5' -> 3', -1 for 3' -> 5'
	 */
	function getPolarity(identifier) {
		return identifier ? ((identifier[identifier.length - 1] == '*' || identifier[identifier.length - 1] == "'") ? -1 : 1) : 0;
	}
	/**
	 * Parses an identifier (a segment identity + an optional polarity specifier)
	 * to an object containing the `identity` and `polarity`. Examples:
	 *
	 * 		DNA.parseIdentifier('5*') // -> { identity: '5', polarity: -1 }
	 * 		DNA.parseIdentifier('hi') // -> { identity: 'hi', polarity: 1 }
	 * 		DNA.parseIdentifier('17') // -> { identity: '17', polarity: 1 }
	 * 		DNA.parseIdentifier("a'") // -> { identity: 'a', polarity: -1 }
	 * 		
	 * @return {Object} spec
	 * @return {Object} spec.identity
	 * @return {Object} spec.polarity
	 */
	function parseIdentifier(identifier) {
		identifier = identifier.trim();
		return {
			identity : this.normalizeIdentity(identifier),
			polarity : this.getPolarity(identifier),
			// identifier : identifier,
		}
	}
	/**
	 * Strips the polarity indicator (* or ') from an identifier. In
	 * other words, gets the identity portion of an identifier.
	 * @param {String} identifier
	 * @returns {String} identity
	 */
	function normalizeIdentity(identifier) {
		if (this.getPolarity(identifier) == -1) {
			return identifier.substring(0, identifier.length - 1);
		}
		return identifier;
	}

	//-------------------------------------------------------------------------	
	// Exports
	// 

	/**
	 * @param {String} structure 
	 * Structure, in dot-paren
	 * 
	 * @param {Array} strands
	 * A parsed {@link #expandStrands strand spec}
	 * 
	 * @param {Object} segments
	 * A name to sequence mapping
	 */
	function expandStructure(structure,strands,sequences,uneven) {
		uneven || (uneven = false);

		strands = _.map(strands,function(strand) {
			return _.comprehend(strand.domains, function(dom) {
				return dom.segments;
			});
		});
		
		var structure = _.map(structure.split('+'),function(strandStructure) {
			return _.filter(strandStructure.split(''),function(ch) { return !!ch && (ch != ' '); });
		}), 
		newStructure = [];

		if(uneven) {
			
			var adjacency = {}, stack = [];

			for(var i=0; i<structure.length; i++) {
				var struct = structure[i];
				for(var j=0; j<struct.length; j++) {
					if(struct[j] == '(') {
						stack.push([i,j]);
					}
					if(struct[j] == ')') {
						var pos = stack.pop();
						if(!adjacency[pos[0]]) adjacency[pos[0]] = {};
						adjacency[pos[0]][pos[1]] = [i,j];
						if(!adjacency[i]) adjacency[i] = {};
						adjacency[i][j] = pos;
					}
				}
			}

			// for each strand
			for(var i = 0; i<strands.length; i++) {
				var strandStruct = structure[i], strand = strands[i], newStrandStruct = [];
								
				for(var j=0; j<strand.length; j++) {
					var segmentId = (strand[j].identity ? strand[j].identity : DNA.parseIdentifier(strand[j].name).identity),
						segmentSeq = sequences[segmentId],
						complementPos = adjacency[i] ? adjacency[i][j] : null,
						complement, complementId, complementSeq;

					if(complementPos && strands[complementPos[0]] && strands[complementPos[0]][complementPos[1]]) {
						complement = strands[complementPos[0]][complementPos[1]];
						complementId = (complement.identity ? complement.identity : DNA.parseIdentifier(complement.name).identity),
						complementSeq = sequences[complementId];
					}

					ch = strandStruct[j];
					if(complementSeq) {
						if(ch == '(' && segmentSeq.length > complementSeq.length) {
							newStrandStruct.push(Array(segmentSeq.length-complementSeq.length+1).join('.') +
								Array(complementSeq.length+1).join(ch)
							);	
						} else if(ch == ')' && segmentSeq.length > complementSeq.length) {
							newStrandStruct.push(Array(complementSeq.length+1).join(ch) + 
								Array(segmentSeq.length-complementSeq.length+1).join('.')
							);
						} else {
							newStrandStruct.push(Array(segmentSeq.length+1).join(ch));
						}
					} else {
						newStrandStruct.push(Array(segmentSeq.length+1).join(ch));
					}
				}
				newStructure.push(newStrandStruct.join(''));
			}

		} else {
		
			// for each strand
			for(var i = 0; i<strands.length; i++) {
				var strandStruct = structure[i], strand = strands[i], newStrandStruct = [];
								
				for(var j=0; j<strand.length; j++) {
					var segmentId = (strand[j].identity ? strand[j].identity : DNA.parseIdentifier(strand[j].name).identity),
						segmentSeq = sequences[segmentId],
						ch = strandStruct[j];
					
					newStrandStruct.push(Array(segmentSeq.length+1).join(ch));
				}
				
				newStructure.push(newStrandStruct.join(''));
			}
		
		}
		return newStructure.join('+');			
	}

	function DUtoDotParen(struct) {
		var regex = /([+HhDdUu])(\d*)s?(.*)/;
		//			 (1) ch    (2) d  (3) rest

		function resolve(struct, stack) {
			if (!stack) {
				stack = [];
			}

			struct = struct.trim();

			var lst = struct.match(regex);
			if (!lst || lst.length != 4) {
				return {
					rest: '',
					stack: stack,
				};
			}
			var ch = lst[1], d = parseInt(lst[2]), rest = lst[3];

			// e.g. struct = "H6( U5 + H2 (U3) )", "H", "6", "( U5 + H2 (U3) )"]
			// => ["H6( U5 + H2 (U3) )", "H", "6", "( U5 + H2 (U3) )"]
			//		0					  1	   2	3
			//							  ch   d  rest

			switch(ch) {
				case 'D':
				case 'H':
					rest = rest.trim();
					if (rest[0] == '(') {
						stack.push(d);
						var o = parse(rest, stack);
						o.dp = Array(d + 1).join('(') + o.dp + Array(d + 1).join(')');
						return o;
					} else {
						var o = resolve(rest, stack);
						o.dp = Array(d + 1).join('(') + o.dp + Array(d + 1).join(')');
						return o;
					}

				case 'U':
					return {
						rest : rest,
						dp : Array(d + 1).join('.'),
						stack : stack
					};
				case '+':
					return {
						rest : rest,
						dp : '+',
						stack : stack
					};
			}
		}

		function parse(struct, stack) {
			var rest = struct, out = [];
			do {
				rest = rest.trim();
				if (rest[0] == ')') {
					var d = stack.pop(), rest = rest.substr(1);

					return {
						rest : rest,
						dp : out.join(''),
						stack : stack
					}
				}
				var o = resolve(rest, stack);
				stack = o.stack;
				rest = o.rest;
				out.push(o.dp);
			} while(rest != '')

			return {
				rest : rest,
				dp : out.join(''),
				stack : stack
			};
		}

		var o = parse(struct, []);
		return o.dp;
	}

	function validateDotParen(struct,str,strict) {
		str || (str = false);
		strict || (strict = false);
		var open_paren_count = 0, close_paren_count = 0, //
		last = '', count = 0, list = [];
		struct += '\n';
		for(var i=0; i<struct.length;i++) {
			var ch = struct[i];
			if (ch === ' ') {
				continue;
			}
			if(strict && !(/[\.\(\)\+\s]/).test(ch)) {
				if(str) {
					return "Unrecognized character '" +ch+ "' at position "+i;
				} else {
					return false;
				}
			}
			if (ch == last) {
				count++;
			} else {
				if (count != 0) {
					if(last == '(') open_paren_count+=count;
					if(last == ')') close_paren_count+=count;
					if(close_paren_count > open_paren_count) {
						if(str) {
							return "Unopened parenthesis: number of closing parentheses exceeds number of open parentheses at position "+i+" by "+(close_paren_count - open_paren_count)+".";
						}
						return false;
					}
				}
				last = ch;
				count = 1;
			}
		}
		
		if(str && (open_paren_count != close_paren_count)) {
			return "Unclosed parenthesis: "+(open_paren_count-close_paren_count)+" parentheses left unclosed at end of structure.";
		}
		return (open_paren_count == close_paren_count);
	}

	function parseDotParen(struct) {
		var open_paren_count = 0, close_paren_count = 0, //
		last = '', count = 0, list = [];

		// Concatenate a null element so the loop will run one extra time to push the last item on the stack
		_.each(struct.split('').concat(null), function(ch) {
			if (ch === ' ') {
				return;
			}
			if (ch == last) {
				count++;
			} else {
				if (count != 0) {
					list.push([last, count]);
					if(last == '(') open_paren_count+=count
					if(last == ')') close_paren_count+=count
				}
				last = ch;
				count = 1;
			}
		});
		
		if(open_paren_count != close_paren_count) {
			throw Error("Structure parsing error: In dot-paren structure '" +struct+ "', unmatched parentheses: "+open_paren_count+" open, "+close_paren_count+" close parenthesis");
		}
		

		function resolve(list) {
			var out = [];
			while(list.length > 0) {
				out = out.concat(resolve_loop(list,0));					
			}
			return out;
		}

		function resolve_loop(struct_list, stack) {
			var inner = [], hd;
			do {
				hd = struct_list.shift();
				while(struct_list.length > 0 && hd[0] !='(' && hd[0] !=')') {
					inner.push(hd)
					hd = struct_list.shift()
				} 
				if(hd) {	
					if (hd[0] == ')') {
						var left = stack, right = hd;
						if (left > right[1]) {
							/*
							There's a bulge to the right, so consume (right) paired bases
							for this duplex, return (left - right) paired bases to the
							left-side stack.
							*/
							stack = left - right[1];
							//stack = left = right[1];
							inner = [['D', right[1], inner]];
						} else if (right[1] > left) {
							/* There's a bulge to the left, so consume (left) paired bases
							for this duplex, return (right - left) paired bases to the
							structure for the outer resolve_loop to handle
							*/
							struct_list.unshift([')', right[1] - left]);
							// right[1] = left;
							
							
							// we'll be done with this loop, and the remaining (right-left) 
							// bases will be dealt with by 
							stack = 0; // right[1] - left;
							
							
							inner = [['D', left, inner]];
						} else {
							stack = 0;
							inner = [['D', right[1], inner]];
							
						}
	
					} else if (hd[0] == '(') {
						inner = inner.concat(resolve_loop(struct_list, hd[1]));
					} else {
						inner = inner.concat([hd]);
					}
				}
			} while (stack > 0 && struct_list.length > 0)
			if((stack > 0) && (struct_list.length == 0)) {
				throw Error();
			}
			return inner
		}
		return resolve(list, []);
	}

	function dotParenToDU(struct) {
		var o = DNA.parseDotParen(struct);
		return DNA.printDUPlus(o);
	}

	function dotParenToBaseMap(struct) {
		var map = {}, breaks = {}, stack = [], base = 0, complement;

		for(var i=0; i<struct.length; i++) {
			if(struct[i]=='(') {
				stack.push(base);
				base++;
			} else if(struct[i]==')') {
				complement = stack.pop();
				map[base] = complement;
				map[complement] = base;
				base++;
			} else if(struct[i]=='.') {
				base++;
			} else if(struct[i] =='+') {
				breaks[base] = true;
			}
		}
		return {map: map, breaks: breaks};
	}

	/**
	 * Prints a parsed DU+ structure
	 *
	 * ex: 
	 * ['D',3, [['U',4],['+'],['U',8],['D',6,[['+']]]] ]
	 * -> 'D3(U4 + U8 D6(+))'
	 * 
	 * @param  {Array} loop Parsed DU+ structure
	 * @return {String} Printed structure
	 */		
	function printDUPlus (loop) {
		return _.map(loop, function(item) {
			switch(item[0]) {
				case 'U':
				case '.':
					return 'U' + item[1];
				case '+':
					return '+';
				case 'H':
				case 'D':
					if (item[2] && item[2].length > 0) {
						return 'D' + item[1] + '(' + DNA.printDUPlus(item[2]) + ')'
					}
			}
		}).join(' ');
	}

	//-------------------------------------------------------------------------	
	// Exports
	// 
	return {
		mapUnique : mapUnique,
		absUnique : absUnique,
		amax : amax,

		parseComplement : function() { console.warn("DNA.parseComplement is deprecated; please use parseIdentifier"); parseComplement.apply(DNA,arguments) },
		parseStrandSpec : parseStrandSpec,
		
		parseNamedSequences: parseNamedSequences,
		printSequences: printSequences,

		matchDegenerate : matchDegenerate,
		populateDegenerate : populateDegenerate,

		stripNupackHeaders : stripNupackHeaders,
		indexTable : indexTable,
		indexBy : indexBy,
		tablify : tablify,
		addReturns : addReturns,
		reverse : reverse,
		complement : complement,
		reverseComplement : reverseComplement,

		//Written by Paul Stothard, University of Alberta, Canada
		// good defaults for last few args: 2, -1, -2, 0, 0
		pairwiseAlign : pairwiseAlign,
		sequenceStats : function(sequence) {
			/* arrayOFItems are regular expressions. A number included with each regular expression serves
			 * as an adjustment for the percentage calculation. Any additional text will appear next to the
			 *  pattern when the results are given.
			 */
			var list = {
				"g" : ["/g/", 1, 1],
				"a" : ["/a/", 1, 1],
				"t" : ["/t/", 1, 1],
				"c" : ["/c/", 1, 1],
				"n" : ["/n/", 1],
				"u" : ["/u/", 1, 1],
				"r" : ["/r/", 1],
				"y" : ["/y/", 1],
				"s" : ["/s/", 1],
				"w" : ["/w/", 1],
				"k" : ["/k/", 1],
				"m" : ["/m/", 1],
				"b" : ["/b/", 1],
				"d" : ["/d/", 1],
				"h" : ["/h/", 1],
				"v" : ["/v/", 1],
				"gg" : ["/g(?=g)/", 2],
				"ga" : ["/g(?=a)/", 2],
				"gt" : ["/g(?=t)/", 2],
				"gc" : ["/g(?=c)/", 2],
				"gn" : ["/g(?=n)/", 2],
				"ag" : ["/a(?=g)/", 2],
				"aa" : ["/a(?=a)/", 2],
				"at" : ["/a(?=t)/", 2],
				"ac" : ["/a(?=c)/", 2],
				"an" : ["/a(?=n)/", 2],
				"tg" : ["/t(?=g)/", 2],
				"ta" : ["/t(?=a)/", 2],
				"tt" : ["/t(?=t)/", 2],
				"tc" : ["/t(?=c)/", 2],
				"tn" : ["/t(?=n)/", 2],
				"cg" : ["/c(?=g)/", 2],
				"ca" : ["/c(?=a)/", 2],
				"ct" : ["/c(?=t)/", 2],
				"cc" : ["/c(?=c)/", 2],
				"cn" : ["/c(?=n)/", 2],
				"ng" : ["/n(?=g)/", 2],
				"na" : ["/n(?=a)/", 2],
				"nt" : ["/n(?=t)/", 2],
				"nc" : ["/n(?=c)/", 2],
				"nn" : ["/n(?=n)/", 2],
				"g,c" : ["/g|c/", 1],
				"a,t" : ["/a|t/", 1],
				"r,y,s,w,k" : ["/r|y|s|w|k/", 1],
				"b,h,d,v,n" : ["/b|h|d|v|n/", 1],
				"r,y,s,w,k,m,b,d,h,v,n" : ["/r|y|s|w|k|m|b|d|h|v|n/", 1]
			};
			var originalLength = sequence.length, full = [], abbr = [];
			for (var name in list) {
				var tempNumber = 0;
				var matchExp = list[name][0]
				matchExp = eval(matchExp + 'gi');
				if (sequence.search(matchExp) != -1) {
					tempNumber = ((sequence.match(matchExp)).length);
				}
				var percentage = 0, atcguPercent = 0;
				if ((originalLength + 1 - parseFloat(list[name][1])) > 0) {
					percentage = (tempNumber / (originalLength + 1 - list[name][1]));
				}
				full.push({
					name : name,
					count : tempNumber,
					percent : percentage.toFixed(2),
				});
				if ('a c g t u'.indexOf(name) != -1 && tempNumber > 0) {
					abbr.push({
						name : name,
						count : tempNumber,
						percent : percentage.toFixed(2),
					});
				}
			}
			return {
				full : full,
				abbr : abbr
			};
		},
		/**
		 * Calculates the Levenshtein distance between two strings
		 * @param {String} s1
		 * @param {String} s2
		 * @return {Number} distance
		 * @author http://kevin.vanzonneveld.net
		 */
		levenshtein : function(s1, s2) {
			// http://kevin.vanzonneveld.net
			// +            original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
			// +            bugfixed by: Onno Marsman
			// +             revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
			// + reimplemented by: Brett Zamir (http://brett-zamir.me)
			// + reimplemented by: Alexander M Beedie
			// *                example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
			// *                returns 1: 3
			if (s1 == s2) {
				return 0;
			}

			var s1_len = s1.length;
			var s2_len = s2.length;
			if (s1_len === 0) {
				return s2_len;
			}
			if (s2_len === 0) {
				return s1_len;
			}

			// BEGIN STATIC
			var split = false;
			try {
				split = !('0')[0];
			} catch (e) {
				split = true;
				// Earlier IE may not support access by string index
			}
			// END STATIC
			if (split) {
				s1 = s1.split('');
				s2 = s2.split('');
			}

			var v0 = new Array(s1_len + 1);
			var v1 = new Array(s1_len + 1);

			var s1_idx = 0, s2_idx = 0, cost = 0;
			for ( s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {
				v0[s1_idx] = s1_idx;
			}
			var char_s1 = '', char_s2 = '';
			for ( s2_idx = 1; s2_idx <= s2_len; s2_idx++) {
				v1[0] = s2_idx;
				char_s2 = s2[s2_idx - 1];

				for ( s1_idx = 0; s1_idx < s1_len; s1_idx++) {
					char_s1 = s1[s1_idx];
					cost = (char_s1 == char_s2) ? 0 : 1;
					var m_min = v0[s1_idx + 1] + 1;
					var b = v1[s1_idx] + 1;
					var c = v0[s1_idx] + cost;
					if (b < m_min) {
						m_min = b;
					}
					if (c < m_min) {
						m_min = c;
					}
					v1[s1_idx + 1] = m_min;
				}
				var v_tmp = v0;
				v0 = v1;
				v1 = v_tmp;
			}
			return v0[s1_len];
		},
		/**
		 * Returns the Hamming distance between two strings
		 * @param {String} s1
		 * @param {String} s2
		 * @return {Number} distance
		 */
		hamming : function(s1, s2) {
			//sum(ch1 != ch2 for ch1, ch2 in zip(s1, s2))
			return _.reduce(_.map(_.zip(s1.split(''), s2.split('')), function(ch1, ch2) {
				return ch1 != ch2;
			}), function(memo, num) {
				return memo + num;
			});
		},
		/**
		 * Generates an adjacency network for use with Protovis network visualizations
		 * @param {String} struct The target structure in dot-paren notation
		 * @param {String[]} strands Array of sequences depicted in the structure
		 * @param {Boolean} linkStrands true to generate strong links between adjacent bases in the same strand (e.g. for force-directed visualizations),
		 * false to only link hybridized bases (defaults to false)
		 */
		generateAdjacency : function(struct, strands, linkStrands, params) {
			// var struct = "....(((...)))....";
			linkStrands = linkStrands || false;
			params || ( params = {});
			_.defaults(params, {
				strandValue : 9,
				hybridizationValue : 2,
				persistenceValue : 18,
				radius : 300,
				segments : {},
				segmentLabels : false,
				persistenceLength: 2,
			});

			var nodes = [], links = [], hybridization = [], strandIndex = 0, node, n = 0, base = 0, theta = 0, dtheta = Math.PI / struct.length, currentSegment = null;

			if (params.segmentLabels) {
				var segmentIndicies = _.keys(params.segments);
				var labels = {};
				for (var i = 0; i < (segmentIndicies.length - 1); i++) {
					labels[Math.round((segmentIndicies[i] + segmentIndicies[i + 1]) / 2)] = params.segments[segmentIndicies[i]];
				}
			}

			for (var i = 0; i < struct.length; i++) {

				if (struct[i] == '+') {
					strandIndex++;
					n--;
					base = 0;
				} else {
					if (params.segments[i]) {
						currentSegment = params.segments[i];
					}
					node = {
						strand : strandIndex,
						nodeName : (strands && strands[strandIndex]) ? strands[strandIndex][base] : false,
						base : (strands && strands[strandIndex]) ? strands[strandIndex][base] : false,
						segment : currentSegment,
						//x: Math.sin(theta)*params.radius,
						//y: Math.cos(theta)*params.radius,
					};

					if (struct[i] == '(') {
						hybridization.push(n);
					} else if (struct[i] == ')') {
						var link = {
							source : hybridization.pop(),
							target : n,
							value : params.hybridizationValue,
							type : 'wc'
						};
						if (params.ppairs) {
							if (params.ppairs[link.source + 1] && params.ppairs[link.source+1][link.target + 1]) {
								link.probability = parseFloat(params.ppairs[link.source+1][link.target + 1]);
								node.probability = link.probability;
								if (nodes[link.source]) {
									nodes[link.source].probability = link.probability;
								}
							} else if (params.ppairs[link.target + 1] && params.ppairs[link.target+1][link.source + 1]) {
								link.probability = parseFloat(params.ppairs[link.target+1][link.source + 1]);
								node.probability = link.probability;
								if (nodes[link.target]) {
									nodes[link.target].probability = link.probability;
								}
							}
							if (link.probability) {

							}
						}
						links.push(link);
					}

					nodes.push(node);
					if (linkStrands) {
						if (n > 0 && (struct[i - 1] != '+')) {
							links.push({
								source : n,
								target : n - 1,
								value : params.strandValue,
								type : 'strand',
							});
						}
						
						if(!!params.persistenceLength && n > params.persistenceLength && struct[i - params.persistenceLength] != '+') {
							links.push({
								source : n,
								target : n - params.persistenceLength,
								value : params.persistenceValue,
								type : 'persistence',
							});
						}
					}
					theta += dtheta;
				}
				n++;
				base++;
			}

			return {
				nodes : nodes,
				links : links
			};
		},
		/**
		 * Generates an adjacency network for use with Protovis network visualizations
		 */
		generateAdjacency2 : function(strands, params) {
			// var struct = "....(((...)))....";

			params || ( params = {});
			_.defaults(params, {
				strandValue : 9,
				hybridizationValue : 2,
				radius : 300,
				segments : {},
				segmentLabels : false,
				linkStrands : false,
			});
			var linkStrands = params.linkStrands;

			var nodes = [], links = [], hybridization = [], strandIndex = 0, node, n = 0, base = 0, theta = 0,
			//dtheta = Math.PI / struct.length,
			currentSegment = null;

			// if(params.segmentLabels) {
			// var segmentIndicies = _.keys(params.segments);
			// var labels = {};
			// for(var i = 0; i<(segmentIndicies.length-1); i++) {
			// labels[Math.round((segmentIndicies[i]+segmentIndicies[i+1])/2)] = params.segments[segmentIndicies[i]];
			// }
			// }

			var n = 0;

			// for each strand
			for (var strandIndex = 0; strandIndex < strands.length; strandIndex++) {
				var strandSpec = strands[strandIndex], strand = strandSpec.strand;

				if (strandSpec.structure) {

					// for each segment
					for (var i = 0; i < strandSpec.structure.length; i++) {
						var segmentSpec = strandSpec.structure[i];
						var segment = segmentSpec.segment;
						var ch = segmentSpec.type;
						var sequence = segment.getSequence();

						// for each base
						for (var j = 0; j < segmentSpec.length; j++) {
							node = {
								strand : strand,
								segment : segment.getIdentifier(),
								base : sequence[j],
								domain : segment.getDomain().getName(),
								role : segment.getDomain().role,
								segment_index : j,
								segment_length : segmentSpec.length,

								//nodeName : (strands && strands[strandIndex]) ? strands[strandIndex][base] : false,
								//base: (strands && strands[strandIndex]) ? strands[strandIndex][base] : false,
								//segment: currentSegment,
								//x: Math.sin(theta)*params.radius,
								//y: Math.cos(theta)*params.radius,
							};

							if (ch == '(') {
								hybridization.push(n);
							} else if (ch == ')') {
								var link = {
									source : hybridization.pop(),
									target : n,
									value : params.hybridizationValue,
									type : 'wc'
								};
								// if(params.ppairs) {
								// if(params.ppairs[link.source + 1] && params.ppairs[link.source+1][link.target + 1]) {
								// link.probability = parseFloat(params.ppairs[link.source+1][link.target + 1]);
								// node.probability = link.probability;
								// if(nodes[link.source]) {
								// nodes[link.source].probability = link.probability;
								// }
								// } else if(params.ppairs[link.target + 1] && params.ppairs[link.target+1][link.source + 1]) {
								// link.probability = parseFloat(params.ppairs[link.target+1][link.source + 1]);
								// node.probability = link.probability;
								// if(nodes[link.target]) {
								// nodes[link.target].probability = link.probability;
								// }
								// }
								// if(link.probability) {
								//
								// }
								// }
								links.push(link);
							}

							nodes.push(node);
							if (linkStrands) {
								if (i + j > 0) {
									links.push({
										source : n,
										target : n - 1,
										value : params.strandValue,
										type : 'strand',
									});
								}
							}
							n++;

						}
					}

				}
			}

			return {
				nodes : nodes,
				links : links
			};
		},
		
		generateAdjacency3 : function(struct, strands, params) {
			// var struct = "....(((...)))....";
			params || ( params = {});
			_.defaults(params, {
				sequences : {},
				strandValue : 9,
				hybridizationValue : 2,
				persistenceValue : 18,
				radius : 300,
				segments : {},
				segmentLabels : false,
				persistenceLength: 2,
				linkStrands: true,
			});

			var nodes = [],

			// Separate arrays for different link types so we ensure proper z-order when the structure is rendered
			wc_links = [], strand_links = [], persistence_links = [],
			hybridization = [], sequences = DNA.hashComplements(params.sequences) || {},
			strandIndex = 0, node, n = 0, base = 0;
			
			// Remove spaces from structure
			struct = _.filter(struct.split(''),function(ch) {
				return !!(ch.trim())
			});			
			
			var i = 0, // segment-wise counter (tracks position along structure)
				j = 0; // base-wise counter (tracks position along structure)
				
			// for each strand
			for (var s = 0; s < strands.length; s++) {
				
				var strand = strands[s], 
				n = 0; // base-wise, per-strand counter
				
				// for each domain
				for(var d = 0; d < strand.domains.length; d++) {
					
					var dom = strand.domains[d],
					m = 0; // base-wise, per-domain counter
					
					// for each segment
					for(var g = 0; g < dom.segments.length; g++) {
						
						var seg = dom.segments[g], 
						name = seg.getIdentifier ? seg.getIdentifier() : (seg.identifier ? seg.identifier : seg.name),
						id = DNA.parseIdentifier(name), 
						seq = seg.sequence ? seg.sequence : sequences[name];
						
						// for each base
						for(var k = 0; k < seq.length; k++) {
							node = {
								strand : strand.name,
								domain : dom.name,
								domain_role: dom.role,
								segment : name,
								segment_role : seg.role,
								segment_identity : id.identity,
								segment_polarity : id.polarity,
								segment_length : seq.length,
								base : seq[k],
								
								segment_index: k,
								domain_index: m,
								strand_index: n,
							};
							
							if (struct[i] == '(') {
								hybridization.push(j);
							} else if (struct[i] == ')') {
								var link = {
									source : hybridization.pop(),
									target : j,
									value : params.hybridizationValue,
									type : 'wc'
								};
								wc_links.push(link);
							}
		
							nodes.push(node);
							
							if (params.linkStrands) {
								if (n > 0 ) {
									strand_links.push({
										source : j,
										target : j - 1,
										type : 'strand',
										value : params.strandValue,
										
										// segment: g > 0 ? seg.name : null,
										// segment_identity : g > 0 ? id.identity : null,
										// domain:  m > 0 ? dom.name : null,
										// domain_role : m > 0 ? dom.role : null,
										base: seq ? seq[k] : null,

										segment: seg ? seg.name : null,
										segment_identity : id ? id.identity : null,
										domain:  dom ? dom.name : null,
										domain_role : dom ? dom.role : null,
										strand: strand ? strand.name : null,
									});
								}
								
								if(!!params.persistenceLength && n > params.persistenceLength) {
									persistence_links.push({
										source : j,
										target : j - params.persistenceLength,
										value : params.persistenceValue,
										type : 'persistence',
									});
								}
							}
							n++;
							m++;
							j++;
							
						} // next base
						i++;
					} // next segment
				} // next domain
				if(!!struct[i] && struct[i] != '+') {
					throw Error('Structure specification does not match strand specification. ');
				}
				i++;
				
			} // next strand

			return {
				nodes : nodes,
				links : wc_links.concat(persistence_links).concat(strand_links),
				strands : strands,
			};
		},

		/**
		 * Generates an object containing `nodes` and `links`, suitable for use with a D3 or Dagre layout. 
		 * `generateAdjacency4` is best suited to cases where you can provide:
		 *
		 * 	-	A base-wise (expanded) dot-paren structure
		 * 	-	A specification for the strands comprising the system
		 * 	-	Identities of each segment comprising the system
		 * 
		 * @param  {String} struct 
		 * Expanded (basewise) structure in dot-parenthesis notation. Each character of the string 
		 * should correspond to a base in the structure or a strand break (+)
		 * 
		 * @param  {Array} strands 
		 * Array of strand objects
		 * 
		 * @param  {Object} params  
		 * Sets various parameters associated with the design
		 * 
		 * @param {Object} params.sequences  
		 * Hash mapping segment names to their sequences
		 * 
		 * @param {Object} params.extraData  
		 * Hash mapping strand names to additional data to be associated with bases in those strands. 
		 * Each member may have the following values: 
		 *
		 * @param {Object[]} params.extraData.links 
		 * An array of additional "link" objects to be created between bases in the strand
		 * @param {Number} params.extraData.links.source
		 * @param {Number} params.extraData.links.target
		 * @param {String} params.extraData.links.type
		 *
		 * @param {Object} params.extraData.bases 
		 * Hash mapping base indices to blocks of additional data. This can be used to attach additional 
		 * attributes (e.g. immutable, conjugated, etc.) to certain bases in a strand. These attributes may
		 * then be recognized by an implementation of {@link App.ui.StrandPreview} which consumes this
		 * adjacency object.
		 */
		generateAdjacency4 : function(struct, strands, params) {
			// var struct = "....(((...)))....";
			params || ( params = {});
			_.defaults(params, {
				sequences : {},
				extraData: {},

				strandValue : 9,
				hybridizationValue : 2,
				persistenceValue : 18,
				radius : 300,

				persistenceLength: 2,
				linkStrands: true,
			});

			struct = DNA.dotParenToBaseMap(struct);
			struct = struct.map;

			var nodes = [],

			// Separate arrays for different link types so we ensure proper z-order when the structure is rendered
			wc_links = [], strand_links = [], persistence_links = [], other_links = [],
			
			// Ensure we can look up complement sequences
			sequences = DNA.hashComplements(params.sequences) || {},
			extraData = params.extraData,
			strandIndex = 0, node, n = 0, base = 0;
			
			// add extra links (e.g. for undesired interactions)
			other_links = other_links.concat(extraData.links || []);

			
			var i = 0, // segment-wise counter (tracks position along structure)
				j = 0; // base-wise counter (tracks position along structure)
			
			var strand_positions = [];

			// for each strand
			for (var s = 0; s < strands.length; s++) {
				
				var strand = strands[s], 
				n = 0; // base-wise, per-strand counter
				
				// // grab extra links and per-base metadata
				// strandData = extraData[strand.name] || {};

				// // add extra links for this strand, adjusting the indices to be globally consistent
				// other_links = other_links.concat(_.map(strandData.links || [], function(link) {
				// 	link[0]+=j;
				// 	link[1]+=j;
				// 	return link;
				// }))

				// for each domain
				for(var d = 0; d < strand.domains.length; d++) {
					
					var dom = strand.domains[d],
					m = 0; // base-wise, per-domain counter
					
					// for each segment
					for(var g = 0; g < dom.segments.length; g++) {
						
						var seg = dom.segments[g], 
						name = seg.getIdentifier ? seg.getIdentifier() : (seg.identifier ? seg.identifier : seg.name),
						id = DNA.parseIdentifier(name), 
						seq = seg.sequence ? seg.sequence : sequences[name];
						
						// for each base
						for(var k = 0; k < seq.length; k++) {
							node = {
								strand : strand.name,
								domain : dom.name,
								domain_role: dom.role,
								segment : name,
								segment_role : seg.role,
								segment_identity : id.identity,
								segment_polarity : id.polarity,
								segment_length : seq.length,
								base : seq[k],
								
								segment_index: k,
								domain_index: m,
								strand_index: n,
							};
							
							// copy additional data onto the base
							// if(strandData.bases && strandData.bases[n]) {
							// 	_.extend(node,strandData.bases[n])
							// }
							if(extraData.bases && extraData.bases[j])  {
								_.extend(node,extraData.bases[j]);
							}

							if(struct[j] && j > struct[j]) {
								var link = {
									source : struct[j],
									target : j,
									value : params.hybridizationValue,
									type : 'wc'
								};
								wc_links.push(link);
							}

							nodes.push(node);
							
							if (params.linkStrands) {
								if (n > 0 ) {
									strand_links.push({
										source : j,
										target : j - 1,
										type : 'strand',
										value : params.strandValue,
										
										// segment: g > 0 ? seg.name : null,
										// segment_identity : g > 0 ? id.identity : null,
										// domain:  m > 0 ? dom.name : null,
										// domain_role : m > 0 ? dom.role : null,

										segment: seg ? seg.name : null,
										segment_identity : id ? id.identity : null,
										domain:  dom ? dom.name : null,
										domain_role : dom ? dom.role : null,
										strand: strand ? strand.name : null,
									});
								}
								
								if(!!params.persistenceLength && n > params.persistenceLength) {
									persistence_links.push({
										source : j,
										target : j - params.persistenceLength,
										value : params.persistenceValue,
										type : 'persistence',
									});
								}
							}
							n++;
							m++;
							j++;
							
						} // next base
						i++;
					} // next segment
				} // next domain
				i++;
				
				strand_positions.push(j);

			} // next strand

			return {
				nodes : nodes,
				links : wc_links.concat(persistence_links).concat(strand_links).concat(other_links),
				strands : strands,
				strand_positions : strand_positions,
			};
		},
		
		// Structure
		expandStructure: expandStructure ,
		expandStrands: expandStrands ,
		DUtoDotParen : DUtoDotParen,
		validateDotParen : validateDotParen ,
		parseDotParen : parseDotParen ,
		dotParenToDU : dotParenToDU ,
		dotParenToBaseMap: dotParenToBaseMap ,
		printDUPlus: printDUPlus, 
		
		// Layout
		layout: layout,
		getScale: layout.getScale,
		getOffset: layout.getOffset,
		getBounds: layout.getBounds,
		arrangeLayout: layout.arrangeLayout,
		layoutStructure: layout.layoutStructure,
		

		normalizeSystem : normalizeSystem,
		encodeStrand : encodeStrand,
		
		// Sequence Group Handling
		threadSegments : threadSegments,
		unthreadSegments : unthreadSegments, 
		hashComplements: hashComplements ,
		
		structureSpec : structureSpec,
		defaultPolaritySpecifier : '*',

		makeIdentifier : makeIdentifier ,
		printIdentifier: printIdentifier ,
		parsePolarity : parsePolarity,
		getPolarity : getPolarity ,
		parseIdentifier : parseIdentifier ,
		normalizeIdentity : normalizeIdentity ,
		/**
		 * Converts an array of objects to an Object keyed by the provided
		 * `property` of the objects.
		 *
		 *     hashBy([{id: 'a'},{id: 'b'},{id: 'c'}],'id'); // -> { a : {id: 'a'}, b: {id: 'b'}, c: {id: 'c'} }
		 *
		 * @param {Object[]} array Array of objects
		 * @param {String} property Property of the `array` of objects which should be
		 */
		hashBy : function(array, property) {
			return _.reduce(array, function(memo, obj) {
				memo[obj[property]] = obj;
			}, {});
		},
		/**
		 * Returns the sign (signum) of a number
		 *
		 *     input > 0 // -> 1
		 *     input < 0 // -> -1
		 *     input == 0 // -> 0
		 *
		 * @param {Number} input
		 * @returns {Number} output
		 */
		signum : function(number) {
			return sign(number)
		},
		sign : sign,
	};
})(_);
