DNA = function() {
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
		function align () {
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
		function path (i1, j1, i2, j2) {

			//alert ("i1, j1, : i2, j2 " + i1 +", " + j1 + ", " + i2 + ", " + j2);

			if ((i1 + 1 == i2) || (j1 == j2)) {
				//align using quadratic space alignment
				var subM = new Array();
				var subN = new Array();

				for (var i = i1 + 1; i <= i2; i++) {
					subM.push(this.M[i-1]);
				}

				for (var j = j1 + 1; j <= j2; j++) {
					subN.push(this.N[j-1]);
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
				var middle = Math.floor((i1 + i2)/2);

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
							left = Math.max(this.Sn[j] - this.scoreSet.endGap, Math.max((left - this.scoreSet.endGap), diag + this.scoreSet.getScore(this.M[i-1], this.N[j-1])));
						} else if (i == this.M.length) {
							left = Math.max(this.Sn[j] - this.scoreSet.gap, Math.max((left - this.scoreSet.endGap), diag + this.scoreSet.getScore(this.M[i-1], this.N[j-1])));
						} else if (j == this.N.length) {
							left = Math.max(this.Sn[j] - this.scoreSet.endGap, Math.max((left - this.scoreSet.gap), diag + this.scoreSet.getScore(this.M[i-1], this.N[j-1])));
						} else {
							left = Math.max(this.Sn[j] - this.scoreSet.gap, Math.max((left - this.scoreSet.gap), diag + this.scoreSet.getScore(this.M[i-1], this.N[j-1])));
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
		function setAlignParam (M, N, scoreSet) {
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
		function AlignPairLinear () {
			this.M;
			this.N;
			this.alignedM;
			this.alignedN;
			this.scoreSet;
			this.Sn;
			this.Sp;
			this.score;
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
		this.value;
		this.tracebackI;
		this.tracebackJ;
	}

	//------------------------------------

	//------------------------------------ AlignPairQuad class
	//AlignPairQuad class initializeMatrix method
	function initializeMatrix (sequenceOne, sequenceTwo, scoreSet) {

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
	function dumpMatrix () {
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
	function fillMatrix () {

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
	function AlignPairQuad () {
		this.M;
		this.N;
		this.scoreSet;
		this.nodes;
		this.alignedM;
		this.alignedN;
		this.score;
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

	//------------------------------------ ScoreSet class

	//ScoreSet getScore
	function getScore (r1, r2) {
		return this.scoringMatrix.scoringMatrix_getScore(r1, r2);
	}

	//ScoreSet setScoreSetParam
	function setScoreSetParam (scoringMatrix, gapPenalty, beginGapPenalty, endGapPenalty) {
		this.scoringMatrix = scoringMatrix;
		this.gap = gapPenalty;
		this.beginGap = beginGapPenalty;
		this.endGap = endGapPenalty;
	}

	//ScoreSet class
	function ScoreSet () {
		this.scoringMatrix;
		this.gap;
		this.beginGap;
		this.endGap;
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
		this.mismatch;
		this.match;
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
	function Identity () {
	}

	Identity.prototype = new ScoringMatrix();
	Identity.prototype.setMismatch = setMismatch;
	Identity.prototype.setMatch = setMatch;

	function addReturns(sequence) {
		sequence = sequence.replace(/(.{60})/g, function (str, p1, offset, s) {
			return p1 + "\n";
		});
		return sequence;
	}

	// Exports
	return {
		addReturns: addReturns,
		reverseComplement: function(dna) {
			return DNA.reverse(DNA.complement(dna));
		},
		//Written by Paul Stothard, University of Alberta, Canada
		// good defaults for last few args: 2, -1, -2, 0, 0
		pairwiseAlign: function(newDnaOne, newDnaTwo, matchScore, mismatchScore, gapPenalty, beginGapPenalty, endGapPenalty) {

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
					sequences: [alignment.getAlignedM(),alignment.getAlignedN()],
					score: alignment.score
				};
			}

			if (useQuadraticSpace) {

				alignment = new AlignPairQuad();
				alignment.initializeMatrix(newDnaOne, newDnaTwo, scoreSet);
				alignment.fillMatrix();
				//alignment.dumpMatrix();
				alignment.align();

				return {
					sequences: [alignment.getAlignedM(),alignment.getAlignedN()],
					score: alignment.score
				};
			}
		},
		//Written by Paul Stothard, University of Alberta, Canada
		complement: function (dnaSequence) {
			//there is no tr operator
			//should write a tr method to replace this
			dnaSequence = dnaSequence.replace(/g/g,"1");
			dnaSequence = dnaSequence.replace(/c/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"c");
			dnaSequence = dnaSequence.replace(/2/g,"g");
			dnaSequence = dnaSequence.replace(/G/g,"1");
			dnaSequence = dnaSequence.replace(/C/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"C");
			dnaSequence = dnaSequence.replace(/2/g,"G");

			dnaSequence = dnaSequence.replace(/a/g,"1");
			dnaSequence = dnaSequence.replace(/t/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"t");
			dnaSequence = dnaSequence.replace(/2/g,"a");
			dnaSequence = dnaSequence.replace(/A/g,"1");
			dnaSequence = dnaSequence.replace(/T/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"T");
			dnaSequence = dnaSequence.replace(/2/g,"A");

			dnaSequence = dnaSequence.replace(/u/g,"a");
			dnaSequence = dnaSequence.replace(/U/g,"A");

			dnaSequence = dnaSequence.replace(/r/g,"1");
			dnaSequence = dnaSequence.replace(/y/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"y");
			dnaSequence = dnaSequence.replace(/2/g,"r");
			dnaSequence = dnaSequence.replace(/R/g,"1");
			dnaSequence = dnaSequence.replace(/Y/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"Y");
			dnaSequence = dnaSequence.replace(/2/g,"R");

			dnaSequence = dnaSequence.replace(/k/g,"1");
			dnaSequence = dnaSequence.replace(/m/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"m");
			dnaSequence = dnaSequence.replace(/2/g,"k");
			dnaSequence = dnaSequence.replace(/K/g,"1");
			dnaSequence = dnaSequence.replace(/M/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"M");
			dnaSequence = dnaSequence.replace(/2/g,"K");

			dnaSequence = dnaSequence.replace(/b/g,"1");
			dnaSequence = dnaSequence.replace(/v/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"v");
			dnaSequence = dnaSequence.replace(/2/g,"b");
			dnaSequence = dnaSequence.replace(/B/g,"1");
			dnaSequence = dnaSequence.replace(/V/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"V");
			dnaSequence = dnaSequence.replace(/2/g,"B");

			dnaSequence = dnaSequence.replace(/d/g,"1");
			dnaSequence = dnaSequence.replace(/h/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"h");
			dnaSequence = dnaSequence.replace(/2/g,"d");
			dnaSequence = dnaSequence.replace(/D/g,"1");
			dnaSequence = dnaSequence.replace(/H/g,"2");
			dnaSequence = dnaSequence.replace(/1/g,"H");
			dnaSequence = dnaSequence.replace(/2/g,"D");

			return dnaSequence;
		},
		//Written by Paul Stothard, University of Alberta, Canada

		reverse: function(dnaSequence) {
			var tempDnaArray = new Array();
			if (dnaSequence.search(/./) != -1) {
				tempDnaArray = dnaSequence.match(/./g);
				tempDnaArray = tempDnaArray.reverse();
				dnaSequence = tempDnaArray.join("");
			}
			return dnaSequence;
		},
		sequenceStats: function(sequence) {	//arrayOFItems are regular expressions. A number included with each regular expression serves as an adjustment for the percentage calculation. Any additional text will appear next to the pattern when the results are given.
			var list = {
				"g":["/g/",1,1],
				"a":["/a/",1,1],
				"t":["/t/",1,1],
				"c":["/c/",1,1],
				"n":["/n/",1],
				"u":["/u/",1,1],
				"r":["/r/",1],
				"y":["/y/",1],
				"s":["/s/",1],
				"w":["/w/",1],
				"k":["/k/",1],
				"m":["/m/",1],
				"b":["/b/",1],
				"d":["/d/",1],
				"h":["/h/",1],
				"v":["/v/",1],
				"gg":["/g(?=g)/",2],
				"ga":["/g(?=a)/",2],
				"gt":["/g(?=t)/",2],
				"gc":["/g(?=c)/",2],
				"gn":["/g(?=n)/",2],
				"ag":["/a(?=g)/",2],
				"aa":["/a(?=a)/",2],
				"at":["/a(?=t)/",2],
				"ac":["/a(?=c)/",2],
				"an":["/a(?=n)/",2],
				"tg":["/t(?=g)/",2],
				"ta":["/t(?=a)/",2],
				"tt":["/t(?=t)/",2],
				"tc":["/t(?=c)/",2],
				"tn":["/t(?=n)/",2],
				"cg":["/c(?=g)/",2],
				"ca":["/c(?=a)/",2],
				"ct":["/c(?=t)/",2],
				"cc":["/c(?=c)/",2],
				"cn":["/c(?=n)/",2],
				"ng":["/n(?=g)/",2],
				"na":["/n(?=a)/",2],
				"nt":["/n(?=t)/",2],
				"nc":["/n(?=c)/",2],
				"nn":["/n(?=n)/",2],
				"g,c":["/g|c/",1],
				"a,t":["/a|t/",1],
				"r,y,s,w,k":["/r|y|s|w|k/",1],
				"b,h,d,v,n":["/b|h|d|v|n/",1],
				"r,y,s,w,k,m,b,d,h,v,n":["/r|y|s|w|k|m|b|d|h|v|n/",1]
			};
			var originalLength = sequence.length,
			full = [], abbr = [];
			for (var name in list) {
				var tempNumber = 0;
				var matchExp = list[name][0]
				matchExp = eval(matchExp+'gi');
				if (sequence.search(matchExp) != -1) {
					tempNumber = ((sequence.match(matchExp)).length);
				}
				var percentage = 0, atcguPercent=0;
				if ((originalLength + 1 - parseFloat(list[name][1])) > 0) {
					percentage = (tempNumber/(originalLength + 1 - list[name][1]));
				}
				full.push({
					name: name,
					count: tempNumber,
					percent: percentage.toFixed(2),
				});
				if('a c g t u'.indexOf(name)!=-1 && tempNumber>0) {
					abbr.push({
					name: name,
					count: tempNumber,
					percent: percentage.toFixed(2),
				});
				}
			}
			return {full:full, abbr: abbr};
		},
		levenshtein: function (s1, s2) {
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
				split = true; // Earlier IE may not support access by string index
			}
			// END STATIC
			if (split) {
				s1 = s1.split('');
				s2 = s2.split('');
			}

			var v0 = new Array(s1_len + 1);
			var v1 = new Array(s1_len + 1);

			var s1_idx = 0,
			s2_idx = 0,
			cost = 0;
			for (s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {
				v0[s1_idx] = s1_idx;
			}
			var char_s1 = '',
			char_s2 = '';
			for (s2_idx = 1; s2_idx <= s2_len; s2_idx++) {
				v1[0] = s2_idx;
				char_s2 = s2[s2_idx - 1];

				for (s1_idx = 0; s1_idx < s1_len; s1_idx++) {
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
		hamming: function(s1, s2) {
			//sum(ch1 != ch2 for ch1, ch2 in zip(s1, s2))
			return _.reduce(_.map(_.zip(s1.split(''),s2.split('')), function(ch1,ch2) {
				return ch1 != ch2;
			}), function(memo,num) {
				return memo+num;
			});
		},
		mapUnique: function(list) {
			var out = {};
			list = _.uniq(list,true);
			_.each(list,function(el,i) {
				out[el] = i;
			});
			return out;
		
		}
	};

}();