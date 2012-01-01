/**
 * Domain-based sequence design
 * v. 0.3
 * by Dave Zhang
 *
 * Ported to Javascript by Casey Grun
 */

/**
 * @class DD
 * Domain-based sequence designer
 */
var DD = function() {

	// include <stdlib.h>
	// include <math.h>
	// include <string.h>
	// include <stdio.h>
	// include <sys/timeb.h>
	// include <ctype.h>
	// include <termios.h>
	// include <unistd.h>
	// include <stdarg.h>
	// include <sys/select.h>

	var SCREENWIDTH = 90
	var FILENAME_LIMIT = 80
	var MAX_DOMAIN_LENGTH = 60
	var NB_ENABLE = 1
	var NB_DISABLE = 0

	function log2(x) {
		return Math.log(x) / Math.LN2
	}

	/**
	 * Generates a random number between <var>from</var> and <var>to</var>
	 */
	function int_urn(from, to) {
		// var temp;
		// var temp2;
		// temp = from + rand() / (RAND_MAX / (to - from + 1));
		// temp2 = temp;
		var temp = from + Math.random() * (to - from);
		return Math.round(temp);
	}

	/**
	 * Converts DD's internal numerical representation of bases to a string, using capitalization to indicate lock state.
	 * @param {Number} base Base to convert
	 * @return {String} baseFormatted
	 */
	function displayBaseFormatted(base) {
		switch(base) {
			case 1:
				return 'g'
			case 11:
				return 'G'
			case 2:
				return 'a'
			case 12:
				return 'A'
			case 3:
				return 't'
			case 13:
				return 'T'
			case 4:
				return 'c'
			case 14:
				return 'C'
		}
	}

	/**
	 * Converts DD's internal numerical representation of bases to a string
	 * @param {Number} base Base to convert
	 * @return {String} baseFormatted
	 */
	function displayBase(base) {
		switch(base) {
			case 1:
			case 11:
				return 'G'
			case 2:
			case 12:
				return 'A'
			case 3:
			case 13:
				return 'T'
			case 4:
			case 14:
				return 'C'
		}
	}

	/**
	 * Computes the interaction between two domains
	 * @param {Number[]} seq1
	 * @param {Number} len1
	 * @param {Number[]} seq2
	 * @param {Number} len2
	 */
	// double pairscore(int* seq1, int len1, int* seq2, int len2)
	function pairscore(seq1, len1, seq2, len2) {
		// Gives the score of the two sequences's crosstalk
		var score, temp;
		var i, j, k;
		var Cmatrix;
		// complementarity matrix
		var Smatrix;
		// score matrix
		var SDmatrix;
		// running total of helix size, 0 if current base didn't contribute.

		// Memory allocations
		if(( Cmatrix = new Array(len1  /* double* */
		)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if(( Smatrix = new Array(len1  /* double* */
		)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if(( SDmatrix = new Array(len1  /* int* */
		)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}

		for( i = 0; i < len1; i++) {
			if((Cmatrix[i] = new Array(len2  /* double */
			)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if((Smatrix[i] = new Array(len2  /* double */
			)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if((SDmatrix[i] = new Array(len2  /* int */
			)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
		}

		// Seed complementarity matrix
		for( i = 0; i < len1; i++) {
			for( j = 0; j < len2; j++) {
				if(((seq1[i] + seq2[len2 - 1 - j]) % 10 == 5) && ((seq1[i] * seq2[len2 - 1 - j]) % 10 == 4))// G/C Match
					Cmatrix[i][j] = GCstr;
				else if(((seq1[i] + seq2[len2 - 1 - j]) % 10 == 5) && ((seq1[i] * seq2[len2 - 1 - j]) % 10 == 6))// A/T Match
					Cmatrix[i][j] = ATstr;
				else if(((seq1[i] + seq2[len2 - 1 - j]) % 10 == 4) && ((seq1[i] * seq2[len2 - 1 - j]) % 10 == 3))// G/T Wobble
					Cmatrix[i][j] = GTstr;
				else
					Cmatrix[i][j] = MBstr;
				// mismatch
			}
		}

		// Calculate score matrix
		score = 0;

		Smatrix[0][0] = Cmatrix[0][0];
		if(Smatrix[0][0] < 0) {
			Smatrix[0][0] = 0;
			SDmatrix[0][0] = 0;
		} else {
			Smatrix[0][0] = Smatrix[0][0] + DHstr;
			SDmatrix[0][0] = 1;
		}

		if(Smatrix[0][0] > score)
			score = Smatrix[0][0];

		for( j = 1; j < len2; j++) {
			Smatrix[0][j] = Cmatrix[0][j];
			if(Smatrix[0][j] < 0) {
				Smatrix[0][j] = 0;
				SDmatrix[0][j] = 0;
			} else {
				Smatrix[0][j] = Smatrix[0][j] + DHstr;
				SDmatrix[0][j] = 1;
			}
			if(Smatrix[0][j] > score)
				score = Smatrix[0][j];
		}

		for( i = 1; i < len1; i++) {
			Smatrix[i][0] = Cmatrix[i][0];
			if(Smatrix[i][0] < 0) {
				Smatrix[i][0] = 0;
				SDmatrix[i][0] = 0;
			} else {
				Smatrix[i][0] = Smatrix[i][0] + DHstr;
				SDmatrix[i][0] = 1;
			}
			if(Smatrix[i][0] > score)
				score = Smatrix[i][0];

			for( j = 1; j < len2; j++) {

				if(Cmatrix[i][j] < 0) {// destabilizing base
					SDmatrix[i][j] = 0;
					Smatrix[i][j] = 0;

					if((SDmatrix[i-1][j - 1] > 0) && (Smatrix[i-1][j - 1] + MBstr > 0))// starting a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j - 1] + MBstr;
					if((SDmatrix[i-1][j - 1] == 0) && (Smatrix[i-1][j - 1] + LLstr > 0))// expanding a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j - 1] + LLstr;

					if((SDmatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] + MBstr > 0) && (Smatrix[i][j - 1] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j - 1] + MBstr;
					if((SDmatrix[i][j - 1] == 0) && (Smatrix[i][j - 1] + LLstr > 0) && (Smatrix[i][j - 1] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j - 1] + LLstr;

					if((SDmatrix[i-1][j] > 0) && (Smatrix[i-1][j] + MBstr > 0) && (Smatrix[i-1][j] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + MBstr;
					if((SDmatrix[i-1][j] == 0) && (Smatrix[i-1][j] + LLstr > 0) && (Smatrix[i-1][j] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + LLstr;

					if(Smatrix[i][j] < 0)
						Smatrix[i][j] = 0;

				} else {// stabilizing base
					Smatrix[i][j] = Cmatrix[i][j];
					SDmatrix[i][j] = 1;

					if((SDmatrix[i-1][j - 1] > 0) && (Smatrix[i-1][j - 1] > 0)) {// continuing a helix
						Smatrix[i][j] = Smatrix[i-1][j - 1] + Cmatrix[i][j];
						SDmatrix[i][j] = SDmatrix[i-1][j - 1] + 1;
					} else if((SDmatrix[i-1][j - 1] == 0) && (Smatrix[i-1][j - 1] > 0)) {// starting a new helix
						Smatrix[i][j] = Smatrix[i-1][j - 1] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if((SDmatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] + Cmatrix[i][j] - Cmatrix[i][j - 1] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j - 1] + Cmatrix[i][j] - Cmatrix[i][j - 1] + MBstr;
						// introducing a 1-bulge, destroying previous bond
						SDmatrix[i][j] = 1;
					} else if((SDmatrix[i][j - 1] == 0) && (Smatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j - 1] + Cmatrix[i][j];
						// closing a bulge
						SDmatrix[i][j] = 1;
					}

					if((SDmatrix[i-1][j] > 0) && (Smatrix[i-1][j] > 0) && (Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr;
						SDmatrix[i][j] = 1;
					} else if((SDmatrix[i-1][j] == 0) && (Smatrix[i-1][j] > 0) && (Smatrix[i-1][j] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if(SDmatrix[i][j] > LHbases) {
						// Extra points for long helices
						temp = LHstart;
						for( k = LHbases; k < SDmatrix[i][j]; k++)
						temp = temp * LHpower;
						Smatrix[i][j] = Smatrix[i][j] + temp;
					}
				}

				if((SDmatrix[i][j] > 0) && ((i == (len1 - 1)) || (j == (len2 - 1))))
					Smatrix[i][j] = Smatrix[i][j] + DHstr;

				if(Smatrix[i][j] > score)
					score = Smatrix[i][j];

			}
		}

		// Memory deallocation
		// for (i = 0; i < len1; i++) {
		// free(Cmatrix[i]);
		// free(Smatrix[i]);
		// free(SDmatrix[i]);
		// }
		// free(Cmatrix);
		// free(Smatrix);
		// free(SDmatrix);

		return score;
	}

	/**
	 * selfcrosstalk
	 * Scores the interaction of a domain with itself
	 * @param {Number[]} seq1 Numerical representation of domain in question
	 * @param {Number} len1 Length of domain
	 */
	// double selfcrosstalk(int* seq1, int len1)
	function selfcrosstalk(seq1, len1) {
		// Gives the score of the two sequences's crosstalk
		var score, temp;
		var i, j, k;
		var Cmatrix;
		// complementarity matrix
		var Smatrix;
		// score matrix
		var SDmatrix;
		// running total of helix size, 0 if current base didn't contribute.

		// Memory allocations
		if(( Cmatrix = new Array(len1  /* double* */
		)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if(( Smatrix = new Array(len1  /* doublevar */
		)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if(( SDmatrix = new Array(len1  /* int* */
		)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}

		for( i = 0; i < len1; i++) {
			if((Cmatrix[i] = new Array(len1  /* double */
			)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if((Smatrix[i] = new Array(len1  /* double */
			)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if((SDmatrix[i] = new Array(len1  /* int */
			)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
		}

		// Seed complementarity matrix
		for( i = 0; i < len1; i++) {
			for( j = 0; j < len1; j++) {
				if(((seq1[i] + (15 - seq1[len1 - 1 - j])) % 10 == 5) && ((seq1[i] * (15 - seq1[len1 - 1 - j])) % 10 == 4))// G/C Match
					Cmatrix[i][j] = GCstr;
				else if(((seq1[i] + (15 - seq1[len1 - 1 - j])) % 10 == 5) && ((seq1[i] * (15 - seq1[len1 - 1 - j])) % 10 == 6))// A/T Match
					Cmatrix[i][j] = ATstr;
				else if(((seq1[i] + (15 - seq1[len1 - 1 - j])) % 10 == 4) && ((seq1[i] * (15 - seq1[len1 - 1 - j])) % 10 == 3))// G/T Wobble
					Cmatrix[i][j] = GTstr;
				else
					Cmatrix[i][j] = MBstr;
				// mismatch
			}
		}

		// Calculate score matrix
		score = 0;

		Smatrix[0][0] = 0;

		for( j = 1; j < len1; j++) {
			Smatrix[0][j] = Cmatrix[0][j];
			if(Smatrix[0][j] < 0) {
				Smatrix[0][j] = 0;
				SDmatrix[0][j] = 0;
			} else {
				Smatrix[0][j] = Smatrix[0][j] + DHstr;
				SDmatrix[0][j] = 1;
			}
			if(Smatrix[0][j] > score)
				score = Smatrix[0][j];
		}

		for( i = 1; i < len1; i++) {
			Smatrix[i][0] = Cmatrix[i][0];
			if(Smatrix[i][0] < 0) {
				Smatrix[i][0] = 0;
				SDmatrix[i][0] = 0;
			} else {
				Smatrix[i][0] = Smatrix[i][0] + DHstr;
				SDmatrix[i][0] = 1;
			}
			if(Smatrix[i][0] > score)
				score = Smatrix[i][0];

			for( j = 1; j < len1; j++) {

				if(i == j) {
					// "Main line" match, do not score
					SDmatrix[i][j] = 0;
					Smatrix[i][j] = 0;
				} else if(Cmatrix[i][j] < 0) {// destabilizing base
					SDmatrix[i][j] = 0;
					Smatrix[i][j] = 0;

					if((SDmatrix[i-1][j - 1] > 0) && (Smatrix[i-1][j - 1] + MBstr > 0))// starting a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j - 1] + MBstr;
					if((SDmatrix[i-1][j - 1] == 0) && (Smatrix[i-1][j - 1] + LLstr > 0))// expanding a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j - 1] + LLstr;

					if((SDmatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] + MBstr > 0) && (Smatrix[i][j - 1] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j - 1] + MBstr;
					if((SDmatrix[i][j - 1] == 0) && (Smatrix[i][j - 1] + LLstr > 0) && (Smatrix[i][j - 1] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j - 1] + LLstr;

					if((SDmatrix[i-1][j] > 0) && (Smatrix[i-1][j] + MBstr > 0) && (Smatrix[i-1][j] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + MBstr;
					if((SDmatrix[i-1][j] == 0) && (Smatrix[i-1][j] + LLstr > 0) && (Smatrix[i-1][j] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + LLstr;

					if(Smatrix[i][j] < 0)
						Smatrix[i][j] = 0;

				} else {// stabilizing base
					Smatrix[i][j] = Cmatrix[i][j];
					SDmatrix[i][j] = 1;

					if((SDmatrix[i-1][j - 1] > 0) && (Smatrix[i-1][j - 1] > 0)) {// continuing a helix
						Smatrix[i][j] = Smatrix[i-1][j - 1] + Cmatrix[i][j];
						SDmatrix[i][j] = SDmatrix[i-1][j - 1] + 1;
					} else if((SDmatrix[i-1][j - 1] == 0) && (Smatrix[i-1][j - 1] > 0)) {// starting a new helix
						Smatrix[i][j] = Smatrix[i-1][j - 1] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if((SDmatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] + Cmatrix[i][j] - Cmatrix[i][j - 1] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j - 1] + Cmatrix[i][j] - Cmatrix[i][j - 1] + MBstr;
						// introducing a 1-bulge, destroying previous bond
						SDmatrix[i][j] = 1;
					} else if((SDmatrix[i][j - 1] == 0) && (Smatrix[i][j - 1] > 0) && (Smatrix[i][j - 1] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j - 1] + Cmatrix[i][j];
						// closing a bulge
						SDmatrix[i][j] = 1;
					}

					if((SDmatrix[i-1][j] > 0) && (Smatrix[i-1][j] > 0) && (Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr;
						SDmatrix[i][j] = 1;
					} else if((SDmatrix[i-1][j] == 0) && (Smatrix[i-1][j] > 0) && (Smatrix[i-1][j] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if(SDmatrix[i][j] > LHbases) {
						// Extra points for long helices
						temp = LHstart;
						for( k = LHbases; k < SDmatrix[i][j]; k++)
						temp = temp * LHpower;
						Smatrix[i][j] = Smatrix[i][j] + temp;
					}
				}

				if((SDmatrix[i][j] > 0) && ((i == (len1 - 1)) || (j == (len1 - 1))))
					Smatrix[i][j] = Smatrix[i][j] + DHstr;

				if(Smatrix[i][j] > score)
					score = Smatrix[i][j];

			}
		}

		// Memory deallocation
		// for (i = 0; i < len1; i++) {
		// free(Cmatrix[i]);
		// free(Smatrix[i]);
		// free(SDmatrix[i]);
		// }
		// free(Cmatrix);
		// free(Smatrix);
		// free(SDmatrix);

		return score;
	}

	/* *******************
	 * Main
	 * *******************/

	var i, j, k, x;
	var score, old_score, old_d_intrinsic;
	// Score of system
	var domain_score;
	// domain score
	var worst_domain;
	// domain that causes the worst score
	var num_mut;
	var mut_domain;
	// Domain, base, old, and new values
	var mut_base;
	var mut_new;
	var mut_old;

	var crosstalk;
	// Crosstalk is for domain similarity
	var interaction;
	// Interaction is for domain complementarity
	var domain_intrinsic;
	// intrinsic score to domains from various rules

	var p_g = 0;
	var p_a = 0;
	var p_t = 0;
	var p_c = 0;
	var base = 0;
	var available = 0;

	var doneflag, pausemode;
	var tempchar, tempchar2;
	var tempdouble;
	var num_domain, num_new_domain;
	//char buffer[120];
	var buffer = ''
	var temp_domain = new Array(MAX_DOMAIN_LENGTH);
	var domain_length;
	var domain_importance;
	var domain_gatc_avail;
	var domain;
	// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

	var num_mut_attempts, total_mutations;
	var rule_4g, rule_6at, rule_ccend, rule_ming, rule_init, rule_lockold, rule_targetworst, rule_gatc_avail, rule_targetdomain, rule_shannon;

	var dom1 = new Array(30);
	var dom2 = new Array(30);
	var len1, len2;

	// Set default parameters
	var rules = {
		rule_4g : 1, // cannot have 4 G's or 4 C's in a row
		rule_6at : 1, // cannot have 6 A/T or G/C bases in a row
		rule_ccend : 1, // domains MUST start and end with C
		rule_ming : 1, // design tries to minimize usage of G
		rule_init : 7, // 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T
		rule_targetworst : 1, // target worst domain
		rule_gatc_avail : 15, // all bases available
		rule_lockold : 0, // lock all old bases (NO)
		rule_targetdomain : [], // array of domain indicies to target
		rule_shannon : 1,		// true to reward domains with a low shannon entropy
	}

	function copyRules() { rule_4g = rules.rule_4g, rule_6at = rules.rule_6at, rule_ccend = rules.rule_ccend, rule_ming = rules.rule_ming, rule_init = rules.rule_init, rule_lockold = rules.rule_lockold, rule_targetworst = rules.rule_targetworst, rule_gatc_avail = rules.rule_gatc_avail;
		rule_targetdomain = rules.rule_targetdomain;
		rule_shannon = rules.rule_shannon;
	}

	copyRules();

	var params = {
		// maximum number of simultaneous mutations
		MAX_MUTATIONS : 10,
		GCstr : 2,
		ATstr : 1,
		GTstr : 0,
		// mismatch, bulge
		MBstr : -3,
		// large loop
		LLstr : -0.5,
		// score for domain ending in a base pair
		DHstr : 3,
		MAX_IMPORTANCE : 100,
		LHbases : 4,
		LHstart : 2,
		LHpower : 2,
		// score bonus for intrastrand/dimerization interactions
		INTRA_SCORE : 5,
		// score bonus for crosstalk (as compared to interaction)
		CROSSTALK_SCORE : -5,
		// crosstalk score is divided by this much (and then score is subtracted)
		CROSSTALK_DIV : 2,
		GGGG_PENALTY : 50,
		ATATAT_PENALTY : 20,
		// the adjusted shannon entropy is multiplied by this ammount and subtracted from the score
		SHANNON_BONUS : 3,
		// values with less than SHANNON_ADJUST * (maximum expected entropy given alphabet size k)
		SHANNON_ADJUST : 0.7,
	};

	var GCstr, ATstr, GTstr, MBstr, LLstr, DHstr, MAX_IMPORTANCE, LHbases, LHstart, LHpower, INTRA_SCORE, CROSSTALK_SCORE, CROSSTALK_DIV, GGGG_PENALTY, ATATAT_PENALTY, MAX_MUTATIONS, SHANNON_BONUS, SHANNON_ADJUST;

	/**
	 * Copies values of {@link params} hash to local variables
	 * @private
	 */
	function copyParams() {
		// maximum number of simultaneous mutations
		MAX_MUTATIONS = params.MAX_MUTATIONS;
		GCstr = params.GCstr;
		ATstr = params.ATstr;
		GTstr = params.GTstr;

		// mismatch, bulge
		MBstr = params.MBstr;

		// large loop
		LLstr = params.LLstr;

		// score for domain ending in a base pair
		DHstr = params.DHstr;
		MAX_IMPORTANCE = params.MAX_IMPORTANCE;
		LHbases = params.LHbases;
		LHstart = params.LHstart;
		LHpower = params.LHpower;

		// score bonus for intrastrand/dimerization interactions
		INTRA_SCORE = params.INTRA_SCORE;

		// score bonus for crosstalk (as compared to interaction)
		CROSSTALK_SCORE = params.CROSSTALK_SCORE;

		// crosstalk score is divided by this much (and then score is subtracted)
		CROSSTALK_DIV = params.CROSSTALK_DIV;
		GGGG_PENALTY = params.GGGG_PENALTY;
		ATATAT_PENALTY = params.ATATAT_PENALTY;
		SHANNON_BONUS = params.SHANNON_BONUS;
		SHANNON_ADJUST = params.SHANNON_ADJUST;
	}

	copyParams();

	// Set up memory for mutation computations
	if(( mut_base = new Array(MAX_MUTATIONS  /* int */
	)) == null) {
		console.error("Insufficient memory for declaring mutation memories!\n");
		throw 'Error';
	}
	if(( mut_old = new Array(MAX_MUTATIONS  /* int */
	)) == null) {
		console.error("Insufficient memory for declaring mutation memories!\n");
		throw 'Error';
	}
	if(( mut_new = new Array(MAX_MUTATIONS  /* int */
	)) == null) {
		console.error("Insufficient memory for declaring mutation memories!\n");
		throw 'Error';
	}

	/**
	 * add new domains to the system
	 * @param {String[]} domains The sequences of the new domains to add
	 * @param {Number[]/Number} importance Array of floats containing the relative importance of each domain, or a single float to set as the importance of each domain (defaults to 1 for all domains)
	 * @param {Number[]} composition Array of integral bitmasks indicating the base composition of each domain, or a single float to set as the composition of all domains (defaults to 15 for all domains)
	 * @param {Boolean} clobber false to preserve existing domains, true to delete them (defaults to true)
	 */
	function addDomains(domains, importance, composition, clobber) {
		clobber = clobber || !domain;
		var nd, start;
		if(!clobber) {
			nd = num_domain + domains.length;
			start = num_domain;
			domain.length = nd;
			domain_length.length = nd;
			domain_gatc_avail.length = nd;
			domain_importance.length = nd;
		} else {
			nd = domains.length;
			start = 0;
			if(( domain = new Array(nd  /* int* */
			)) == null) {
				console.error("Insufficient memory for declaring domain pointers!\n");
				throw 'Error';
			}

			if(( domain_length = new Array(nd  /* int */
			)) == null) {
				console.error("Insufficient memory for declaring domain lengths!\n");
				throw 'Error';
			}

			if(( domain_gatc_avail = new Array(nd  /* int */
			)) == null) {
				console.error("Insufficient memory for declaring domain base availability!\n");
				throw 'Error';
			}

			if(( domain_importance = new Array(nd  /* int */
			)) == null) {
				console.error("Insufficient memory for declaring domain importances!\n");
				throw 'Error';
			}

		}
		num_domain = nd;

		for( j = start; j < num_domain; j++) {
			buffer = domains[j - start].trim();
			i = domains[j - start].length;
			domain_length[j] = i;
			domain[j] = parseDomain(buffer);

			domain_importance[j] = _.isArray(importance) ? importance[j - start] : (_.isNumber(importance) ? importance : 1 );
			domain_gatc_avail[j] = _.isArray(composition) ? composition[j - start] : (_.isNumber(composition) ? composition : 15 );

		}

		setupScoreMatricies();

	}

	/**
	 * popDomain
	 * Removes the last domain in the ensemble and returns its score
	 * @return {Number} score Score of the domain removed
	 */
	function popDomain() {
		domain.pop();
		domain_length.pop();
		domain_gatc_avail.pop();
		domain_importance.pop();
		var ds = domain_score.pop();
		num_domain--;
		setupScoreMatricies();
		return ds;
	}

	/**
	 * removeDomain
	 * Removes the given domain from the ensemble
	 * @param {Number} id The index of the domain to be removed
	 */
	function removeDomain(id) {
		domain.splice(id, 1);
		domain_length.splice(id, 1);
		domain_gatc_avail.splice(id, 1);
		domain_importance.splice(id, 1);
		var ds = domain_score.splice(id, 1);
		num_domain--;
		setupScoreMatricies();
		return ds;

	}

	/**
	 * parseDomain
	 * Builds a numerical representation of a textual domain specification (e.g. ATAG -> [12,13,12,11])
	 * @param {String} buffer String representation of the domain in question; can contain A,T,C,G. Uppercase
	 * (ATCG) bases are assumed to be locked, while lowercase (atcg) bases will be mutated by DD.
	 * @return {Number[]} domain Numerical representation of the domain in question.
	 * 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), 12 = A (locked), ... etc
	 */
	function parseDomain(buffer) {
		var out = new Array(buffer.length  /* int */
		);
		for( i = 0; i < buffer.length; i++) {
			if(buffer[i] == 'g')
				out[i] = 1;
			else if(buffer[i] == 'a')
				out[i] = 2;
			else if(buffer[i] == 't')
				out[i] = 3;
			else if(buffer[i] == 'c')
				out[i] = 4;
			else if(buffer[i] == 'G')
				out[i] = 11;
			else if(buffer[i] == 'A')
				out[i] = 12;
			else if(buffer[i] == 'T')
				out[i] = 13;
			else if(buffer[i] == 'C')
				out[i] = 14;
			else if(buffer[i] == 'N' || buffer[i] == 'n')
				out[i] = randomBase();
		}
		return out;
	}

	/**
	 * loadFile
	 * Loads file contents into the designer
	 * @param {String} fileContents File contents, in the following format:
	 * 		[domain count]
	 * 		[domain] [importance ][composition]
	 * 		...
	 * @param {Number} newDomains How many new domains to construct
	 */
	function loadFile(fileContents, newDomains) {
		var f = _.compact(fileContents.split('\n'));

		// remove leading number added by old versions of DD
		if(f[0].trim().match(/^\d+$/g)) {
			f.unshift();
		}
		// ditch parameter for number of domains
		num_domain = f.length;
		num_new_domain = (newDomains || 0);

		if(( domain = new Array((num_domain + num_new_domain)  /* int* */
		)) == null) {
			console.error("Insufficient memory for declaring domain pointers!\n");
			throw 'Error';
		}

		if(( domain_length = new Array((num_domain + num_new_domain)  /* int */
		)) == null) {
			console.error("Insufficient memory for declaring domain lengths!\n");
			throw 'Error';
		}

		if(( domain_gatc_avail = new Array((num_domain + num_new_domain)  /* int */
		)) == null) {
			console.error("Insufficient memory for declaring domain base availability!\n");
			throw 'Error';
		}

		if(( domain_importance = new Array((num_domain + num_new_domain)  /* int */
		)) == null) {
			console.error("Insufficient memory for declaring domain importances!\n");
			throw 'Error';
		}

		for( j = 0; j < num_domain; j++) {
			buffer = f[j];
			i = 0;
			while(buffer[i] != ' ') {
				if((buffer[i] != 'G') && (buffer[i] != 'A') && (buffer[i] != 'T') && (buffer[i] != 'C') && (buffer[i] != 'g') && (buffer[i] != 'a') && (buffer[i] != 't') && (buffer[i] != 'c')) {
					printf("Input file corrupted.  Sequence for domain %d contains a non-base (%c) at position %d.\n", (j + 1), buffer[i], (i + 1));
					throw 'Error';
				}
				i++;
			}

			domain_length[j] = i;
			domain[j] = parseDomain(buffer.substr(0, i));
			//domain[j] = new Array(i  /* int */
			//);
			/*
			 for( i = 0; i < domain_length[j]; i++) {
			 if(buffer[i] == 'g')
			 domain[j][i] = 1;
			 if(buffer[i] == 'a')
			 domain[j][i] = 2;
			 if(buffer[i] == 't')
			 domain[j][i] = 3;
			 if(buffer[i] == 'c')
			 domain[j][i] = 4;
			 if(buffer[i] == 'G')
			 domain[j][i] = 11;
			 if(buffer[i] == 'A')
			 domain[j][i] = 12;
			 if(buffer[i] == 'T')
			 domain[j][i] = 13;
			 if(buffer[i] == 'C')
			 domain[j][i] = 14;
			 }
			 */
			i = domain_length[j] + 1;
			domain_importance[j] = 0;
			while(buffer[i] != ' ') {
				if((buffer[i] < '0') || (buffer[i] > '9')) {
					printf("Input file corrupted.  Non-numeric parameter for importance of domain %d.\n", (j + 1));
					throw 'Error';
				} else {
					domain_importance[j] = domain_importance[j] * 10 + ((buffer[i]) - '0');
				}
				i++;
			}
			i++;
			domain_gatc_avail[j] = 0;
			while(buffer[i] != '\n') {
				if((buffer[i] < '0') || (buffer[i] > '9')) {
					printf("Input file corrupted.  Non-numeric parameter for base composition of domain %d.\n", (j + 1));
					throw 'Error';
				} else {
					domain_gatc_avail[j] = domain_gatc_avail[j] * 10 + ((buffer[i]) - '0');
				}
				i++;
			}
			if((domain_gatc_avail[j] > 15) || (domain_gatc_avail[j] < 1)) {
				printf("Input file corrupted at domain %d.  Domain base composition must be between 1 and 15.\n", (j + 1));
				throw 'Error';
			}
		}

		setupScoreMatricies();
	}

	/**
	 * newDesign
	 * Generates a given number of new domains
	 * @param {Number} domainCount How many domains to construct
	 * @param {Number/Number[]} Scalar length for all new domains, or array of lengths for new domains.
	 */
	function newDesign(domainCount, domainLengths) {
		num_domain = domainCount;

		// Starting new design
		// Initialize arrays
		if(( domain = new Array(num_domain  /* int* */
		)) == null) {
			console.error("Insufficient memory for declaring domain pointers!\n");
			throw 'Error';
		}

		if(( domain_length = new Array(num_domain  /* int */
		)) == null) {
			console.error("Insufficient memory for declaring domain lengths!\n");
			throw 'Error';
		}

		if(( domain_gatc_avail = new Array(num_domain  /* int */
		)) == null) {
			console.error("Insufficient memory for declaring domain base availability!\n");
			throw 'Error';
		}

		if(( domain_importance = new Array(num_domain  /* int */
		)) == null) {
			console.error("Insufficient memory for declaring domain importances!\n");
			throw 'Error';
		}

		// Generate lengths array
		if(_.isArray(domainLengths)) {
			domain_length = domainLengths;
		} else {
			domainLengths || ( domainLengths = 7);
			for( i = 0; i < num_domain; i++) {
				domain_length[i] = domainLengths;
			}
		}

		for( i = 0; i < num_domain; i++) {
			if((domain[i] = new Array(domain_length[i]  /* int */
			)) == null) {
				console.error("Insufficient memory for declaring domain bases!\n");
				throw 'Error';
			}
			domain_importance[i] = 1;
		}
		rule_4g = 1;
		// cannot have 4 G's or 4 C's in a row
		rule_6at = 1;
		// cannot have 6 A/T bases in a row
		rule_ccend = 1;
		// domains MUST start and end with C
		rule_ming = 1;
		// design tries to minimize usage of G
		rule_init = 7;
		// 1 = polyN, 2 = poly-H, 3 = poly-Y, 4 = poly-T
		rule_targetworst = 1;
		// target worst domains for mutation
		rule_gatc_avail = 15;
		// all flags set (bases available)
		doneflag = 0;

		setupScoreMatricies();
		startingDomainSequences();
	}

	/**
	 * Builds domain_score, domain_intrinsic, crosstalk, and interaction Arrays
	 * TODO: Only mutate existing arrays when adding domains
	 */
	function setupScoreMatricies() {
		// Set up domain score matrix
		if(( domain_score = new Array(num_domain  /* double */
		)) == null) {
			console.error("Insufficient memory for declaring domain score matrix!\n");
			throw 'Error';
		}

		if(( domain_intrinsic = new Array(num_domain  /* double */
		)) == null) {
			console.error("Insufficient memory for declaring domain score matrix!\n");
			throw 'Error';
		}

		// Set up crosstalk and interaction matrices
		if(( crosstalk = new Array(num_domain  /* double* */
		)) == null) {
			console.error("Insufficient memory for declaring crosstalk matrices!\n");
			throw 'Error';
		}

		for( i = 0; i < num_domain; i++) {
			if((crosstalk[i] = new Array(num_domain  /* double */
			)) == null) {
				console.error("Insufficient memory for declaring crosstalk matrices!\n");
				throw 'Error';
			}
		}

		if(( interaction = new Array(num_domain  /* double* */
		)) == null) {
			console.error("Insufficient memory for declaring interaction matrices!\n");
			throw 'Error';
		}

		for( i = 0; i < num_domain; i++) {
			if((interaction[i] = new Array(num_domain  /* double */
			)) == null) {
				console.error("Insufficient memory for declaring interaction matrices!\n");
				throw 'Error';
			}
		}
	}

	function randomBase() {
		var b = 0;
		while(b == 0) {
			k = int_urn(1, 4);
			if((k == 4) && (Math.floor(rule_init / 8) == 1))
				b = 1;
			if((k == 3) && (Math.floor(rule_init / 4) % 2 == 1))
				b = 2;
			if((k == 2) && (Math.floor(rule_init / 2) % 2 == 1))
				b = 3;
			if((k == 1) && (Math.floor(rule_init % 2) == 1))
				b = 4;
		}
		return b;
	}

	/**
	 * Seed domains with new sequences according to base composition rules
	 */
	function startingDomainSequences() {

		// Generate starting domain sequences
		// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

		for( i = 0; i < num_domain; i++) {
			reseedDomain(i)
		}
	}

	function reseedDomain(i) {
		domain_gatc_avail[i] = rule_gatc_avail;
		for( j = 0; j < domain_length[i]; j++) {
			domain[i][j] = randomBase();
		}

		if(rule_ccend == 1) {
			if(Math.floor(rule_gatc_avail % 2) == 1)
				domain[i][0] = 14;
			else if(Math.floor(rule_gatc_avail / 8) == 1)
				domain[i][0] = 11;
			else if(Math.floor(rule_gatc_avail / 2) % 2 == 1)
				domain[i][0] = 13;
			else
				domain[i][0] = 12;

			if(rule_gatc_avail % 2 == 1)
				domain[i][domain_length[i] - 1] = 14;
			else if(Math.floor(rule_gatc_avail / 8) == 1)
				domain[i][domain_length[i] - 1] = 11;
			else if(Math.floor(rule_gatc_avail / 4) % 2 == 1)
				domain[i][domain_length[i] - 1] = 12;
			else
				domain[i][domain_length[i] - 1] = 13;
		}
	}

	/**
	 * randomSequence
	 * Generates <var>doms</var> random sequences, subject to configured base composition rules.
	 * @param {Number} doms How many sequences to construct
	 * @param {Number/Number[]} len Scalar length for all new domains, or array of lengths for new domains.
	 */
	function randomSequence(doms, len) {
		var out = new Array(doms);

		// Generate starting domain sequences
		// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

		for( i = 0; i < doms; i++) {
			out[i] = new Array(len);
			for( j = 0; j < len; j++) {
				out[i][j] = 0;
				while(out[i][j] == 0) {
					k = int_urn(1, 4);
					if((k == 4) && (Math.floor(rule_init / 8) == 1))
						out[i][j] = 1;
					if((k == 3) && (Math.floor(rule_init / 4) % 2 == 1))
						out[i][j] = 2;
					if((k == 2) && (Math.floor(rule_init / 2) % 2 == 1))
						out[i][j] = 3;
					if((k == 1) && (Math.floor(rule_init % 2) == 1))
						out[i][j] = 4;
				}
			}

			if(rule_ccend == 1) {
				if(Math.floor(rule_gatc_avail % 2) == 1)
					out[i][0] = 14;
				else if(Math.floor(rule_gatc_avail / 8) == 1)
					out[i][0] = 11;
				else if(Math.floor(rule_gatc_avail / 2) % 2 == 1)
					out[i][0] = 13;
				else
					out[i][0] = 12;

				if(rule_gatc_avail % 2 == 1)
					out[i][len - 1] = 14;
				else if(Math.floor(rule_gatc_avail / 8) == 1)
					out[i][len - 1] = 11;
				else if(Math.floor(rule_gatc_avail / 4) % 2 == 1)
					out[i][len - 1] = 12;
				else
					out[i][len - 1] = 13;
			}
		}
		return out;
	}

	/**
	 * resetSequences
	 * Resets all sequences
	 */
	function resetSequences() {
		for( i = 0; i < num_domain; i++) {
			for( j = 0; j < domain_length[i]; j++) {
				if(domain[i][j] < 10) {
					domain[i][j] = 0;
					while(domain[i][j] == 0) {
						k = int_urn(1, 4);
						if((k == 4) && (rule_init / 8 == 1))
							domain[i][j] = 1;
						if((k == 3) && ((rule_init / 4) % 2 == 1))
							domain[i][j] = 2;
						if((k == 2) && ((rule_init / 2) % 2 == 1))
							domain[i][j] = 3;
						if((k == 1) && (rule_init % 2 == 1))
							domain[i][j] = 4;
					}
				}
			}

			if(rule_ccend == 1) {
				if(domain_gatc_avail[i] % 2 == 1)
					domain[i][0] = 14;
				else if(domain_gatc_avail[i] / 8 == 1)
					domain[i][0] = 11;
				else if((domain_gatc_avail[i] / 2) % 2 == 1)
					domain[i][0] = 13;
				else
					domain[i][0] = 12;

				if(domain_gatc_avail[i] % 2 == 1)
					domain[i][domain_length[i] - 1] = 14;
				else if(domain_gatc_avail[i] / 8 == 1)
					domain[i][domain_length[i] - 1] = 11;
				else if((domain_gatc_avail[i] / 4) % 2 == 1)
					domain[i][domain_length[i] - 1] = 12;
				else
					domain[i][domain_length[i] - 1] = 13;
			}

		}
	}

	pausemode = 1;
	doneflag = 0;
	num_mut_attempts = 0;
	total_mutations = 0;
	num_mut = 0;

	// Pause mode, starts here
	function pause() {
		gotoxy(1, 7 + num_domain);
		printf("Modify (D)omains, modify (B)ases, (S)ave current sequences,\n");
		printf("(E)valuate scores, e(X)it, (!) Reseed all domains, or press space to continue:   \n");
		movexy(0, -1);
		printf("(E)valuate scores, e(X)it, (!) Reseed all domains, or press space to continue:   \n");
		tempchar = myhotinput(6, 'D', 'B', 'S', 'E', '!', ' ');

		if(tempchar == ' ')
			pausemode = 0;

		function modifyBases() {
			printf("Modify which domain? ");
			i = myintinput();
			if((i < 1) || (i > num_domain)) {
				printf("Please select a domain listed, between 1 and %d.\n", num_domain);
				movexy(0, -2);
				printf("Modify which domain?                  \n");
				movexy(0, -1);
				printf("Modify which domain? ");
				i = myintinput();
				printf("                                             \n");
				movexy(0, -1);
			}
			printf("Modify which base? ");
			j = myintinput();
			if((j < 1) || (j > domain_length[i - 1])) {
				printf("Please select a base index on domain %d between 1 and %d.\n", i, domain_length[i - 1]);
				movexy(0, -2);
				printf("Modify which base?          \n");
				movexy(1, -1);
				printf("Modify which base? ");
				j = myintinput();
				printf("                                                                     \n");
				movexy(0, -1);
			}
			i = i - 1;
			// mod to yield correct index
			j = j - 1;
			//

			printf("Currently, the base is ");
			displayBase(domain[i][j]);
			if(domain[i][j] > 10)
				printf(", and the base is locked.\n");
			else
				printf(".\n");
			printf("Change the base to (G/A/T/C), (L)ock/unlock the base, or press space to cancel: ");
			tempchar = myhotinput(6, 'G', 'A', 'T', 'C', 'L', ' ');
			if(tempchar == 'G') {
				if(domain[i][j] > 10)
					domain[i][j] = 11;
				else
					domain[i][j] = 1;
			} else if(tempchar == 'A') {
				if(domain[i][j] > 10)
					domain[i][j] = 12;
				else
					domain[i][j] = 2;
			} else if(tempchar == 'T') {
				if(domain[i][j] > 10)
					domain[i][j] = 13;
				else
					domain[i][j] = 3;
			} else if(tempchar == 'C') {
				if(domain[i][j] > 10)
					domain[i][j] = 14;
				else
					domain[i][j] = 4;
			} else if(tempchar == 'L') {
				if(domain[i][j] > 10)
					domain[i][j] = domain[i][j] - 10;
				else
					domain[i][j] = domain[i][j] + 10;
			}

			gotoxy(6 + j, 5 + i);
			displayBase(domain[i][j]);

			gotoxy(1, 8 + num_domain);
			for( i = 0; i < 10; i++) {
				for( j = 0; j < SCREENWIDTH; j++)printf(" ");
				printf("\n");
			}
		}

		function modifyDomains() {
			printf("Modify which domain? ");
			i = myintinput();
			if((i < 1) || (i > num_domain)) {
				printf("Please select a domain listed, between 1 and %d.\n", num_domain);
				movexy(0, -2);
				printf("Modify which domain?          \n");
				movexy(0, -1);
				printf("Modify which domain? ");
				i = myintinput();
				printf("                                                          \n");
				movexy(0, -1);
			}

			printf("Domain %d: ", i);
			i = i - 1;
			// mod to yield correct index
			for( j = 0; j < domain_length[i]; j++)displayBase(domain[i][j]);
			printf("\n(L)ock or (U)nlock all bases in domain, change (I)mportance, (C)hange base comp of domain,\n");
			printf("(!) Reseed domain with random sequence, or press space to cancel: ");
			tempchar = myhotinput(6, 'L', 'U', 'I', 'C', '!', ' ');

			if(tempchar == 'L') {
				for( j = 0; j < domain_length[i]; j++) {
					if(domain[i][j] < 10)
						domain[i][j] = domain[i][j] + 10;
				}
				gotoxy(6, 5 + i);
				for( j = 0; j < domain_length[i]; j++)displayBase(domain[i][j]);
			} else if(tempchar == 'U') {
				for( j = 0; j < domain_length[i]; j++) {
					if(domain[i][j] > 10)
						domain[i][j] = domain[i][j] - 10;
				}
				gotoxy(6, 5 + i);
				for( j = 0; j < domain_length[i]; j++)displayBase(domain[i][j]);
			} else if(tempchar == 'I') {

				printf("Enter new importance (must be integer, higher means more important): ");
				j = myintinput();
				if((j < 1) || (j > MAX_IMPORTANCE)) {
					printf("Importance must be between 1 and %d.\n", MAX_IMPORTANCE);
					movexy(0, -2);
					printf("Enter new importance (must be integer, higher means more important):       \n");
					movexy(0, -1);
					printf("Enter new importance (must be integer, higher means more important): ");
					j = myintinput();
					printf("                                                          \n");
					movexy(0, -1);
				}
				domain_importance[i] = j;
				gotoxy(67, 5 + i);
				printf("%d", domain_importance[i]);
			} else if(tempchar == 'C') {
				// Change base composition
				printf("Currently, domain %d has base composition ", (i + 1));
				if(domain_gatc_avail[i] == 15)
					printf("N");
				else {
					if(domain_gatc_avail[i] / 8 == 1)
						printf("G");
					if((domain_gatc_avail[i] / 4) % 2 == 1)
						printf("A");
					if((domain_gatc_avail[i] / 2) % 2 == 1)
						printf("T");
					if(domain_gatc_avail[i] % 2 == 1)
						printf("C");
				}
				printf(".\n");

				domain_gatc_avail[i] = 0;
				while(domain_gatc_avail[i] == 0) {
					printf("Allow G? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if(tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 8;
					printf("Allow A? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if(tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 4;
					printf("Allow T? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if(tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 2;
					printf("Allow C? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if(tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 1;
					if(domain_gatc_avail[i] == 0) {
						printf("Some bases must be allowed!  Press space to start over.");
						tempchar = myhotinput(1, ' ');
						movexy(0, -6);
						for( j = 0; j < 6; j++) {
							for( k = 0; k < SCREENWIDTH; k++)printf(" ");
							printf("\n");
						}
						movexy(0, -6);
					}
				}

				gotoxy(71, 5 + i);
				printf("   ");
				gotoxy(71, 5 + i);
				if(domain_gatc_avail[i] == 15)
					printf("N");
				else {
					if(domain_gatc_avail[i] / 8 == 1)
						printf("G");
					if((domain_gatc_avail[i] / 4) % 2 == 1)
						printf("A");
					if((domain_gatc_avail[i] / 2) % 2 == 1)
						printf("T");
					if(domain_gatc_avail[i] % 2 == 1)
						printf("C");
				}
			} else if(tempchar == '!') {
				// Reseed domain with entirely new sequence
				printf("Warning!  Current sequence for domain %d will be lost, except for locked bases!\n", (i + 1));
				printf("Really reseed domain with entirely new sequence? ");
				tempchar = myhotinput(2, 'Y', 'N');
				if(tempchar == 'Y') {
					for( j = 0; j < domain_length[i]; j++) {
						if(domain[i][j] < 10) {
							domain[i][j] = 0;
							while(domain[i][j] == 0) {
								k = int_urn(1, 4);
								if((k == 4) && (rule_init / 8 == 1))
									domain[i][j] = 1;
								if((k == 3) && ((rule_init / 4) % 2 == 1))
									domain[i][j] = 2;
								if((k == 2) && ((rule_init / 2) % 2 == 1))
									domain[i][j] = 3;
								if((k == 1) && (rule_init % 2 == 1))
									domain[i][j] = 4;
							}
						}
					}

					if(rule_ccend == 1) {
						if(domain_gatc_avail[i] % 2 == 1)
							domain[i][0] = 14;
						else if(domain_gatc_avail[i] / 8 == 1)
							domain[i][0] = 11;
						else if((domain_gatc_avail[i] / 2) % 2 == 1)
							domain[i][0] = 13;
						else
							domain[i][0] = 12;

						if(domain_gatc_avail[i] % 2 == 1)
							domain[i][domain_length[i] - 1] = 14;
						else if(domain_gatc_avail[i] / 8 == 1)
							domain[i][domain_length[i] - 1] = 11;
						else if((domain_gatc_avail[i] / 4) % 2 == 1)
							domain[i][domain_length[i] - 1] = 12;
						else
							domain[i][domain_length[i] - 1] = 13;
					}
					gotoxy(6, 5 + i);
					for( j = 0; j < domain_length[i]; j++)displayBase(domain[i][j]);
				}
			}

			gotoxy(1, 8 + num_domain);
			for( i = 0; i < 10; i++) {
				for( j = 0; j < SCREENWIDTH; j++)printf(" ");
				printf("\n");
			}
		}

	}

	function saveFile() {

		var out = ''
		out += num_domain + '\n';

		for( i = 0; i < num_domain; i++) {
			for( j = 0; j < domain_length[i]; j++) {
				if(domain[i][j] == 1)
					out += "g";
				if(domain[i][j] == 11)
					out += "G";
				if(domain[i][j] == 2)
					out += "a";
				if(domain[i][j] == 12)
					out += "A";
				if(domain[i][j] == 3)
					out += "t";
				if(domain[i][j] == 13)
					out += "T";
				if(domain[i][j] == 4)
					out += "c";
				if(domain[i][j] == 14)
					out += "C";
			}
			out += " " + domain_importance[i] + " " + domain_gatc_avail[i] + "\n";
		}
		return out;
	}

	/**
	 * evaluateAllScores
	 * Evaluate current scores for all domains in the ensemble. This function can take a long time for large ensembles, so when you're only changing
	 * one domain, it's better to call {@link #evaluateScores}
	 */
	function evaluateAllScores() {

		// Calculate interaction (pairscore) and crosstalk (selfcrosstalk) of each domain
		for( i = 0; i < num_domain; i++) {
			for( j = 0; j < num_domain; j++) {
				if(i == j) {
					interaction[i][j] = pairscore(domain[i], domain_length[i], domain[j], domain_length[j]) + INTRA_SCORE;
					crosstalk[i][j] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
				} else {
					interaction[i][j] = pairscore(domain[i], domain_length[i], domain[j], domain_length[j]);
					for( k = 0; k < domain_length[j]; k++)
					temp_domain[k] = 15 - domain[j][(domain_length[j]) - 1 - k];
					crosstalk[i][j] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[j]) / CROSSTALK_DIV;
				}
			}
		}

		evaluateIntrinsicScores();
		tallyScores();
	}

	/**
	 * evaluateIntrinsicScores
	 * Evaluates intrinsic (heuristic) scores for all domains in the ensemble
	 */
	function evaluateIntrinsicScores() {
		for( i = 0; i < num_domain; i++) {
			evaluateIntrinsicScore(i);
		}
	}

	/**
	 * tallyScores
	 * Populates domain_score for each domain i = 0...num_domain, as follows:
	 * domain_score[i] = max(weighted interaction score , weighted crosstalk score) + intrinsic score
	 */
	function tallyScores() {
		// Domain score is max of interaction and crosstalk scores
		score = 0;
		for( i = 0; i < num_domain; i++) {
			domain_score[i] = 0;
			for( j = 0; j < num_domain; j++) {
				if(interaction[i][j] + domain_importance[i] + domain_importance[j] > domain_score[i])
					domain_score[i] = interaction[i][j] + domain_importance[i] + domain_importance[j];
				if(crosstalk[i][j] + domain_importance[i] + domain_importance[j] + CROSSTALK_SCORE > domain_score[i])
					domain_score[i] = crosstalk[i][j] + domain_importance[i] + domain_importance[j] + CROSSTALK_SCORE;
			}
			//  domain_score[i] = domain_score[i] + domain_intrinsic[i] + (double) (i+1) * 0.000001;
			domain_score[i] = domain_score[i] + domain_intrinsic[i];
			//+ (i+1) * 0.000001;
			if(domain_score[i] > score) {
				score = domain_score[i];
				worst_domain = i;
			}
		}
		if(rule_targetdomain && rule_targetdomain.length > 0) {
			score = 0;
			for( i = 0; i < rule_targetdomain.length; i++) {
				if(domain_score[rule_targetdomain[i]] > score) {
					score = domain_score[rule_targetdomain[i]];
					worst_domain = rule_targetdomain[i];
				}
			}
		}
	}

	/**
	 * evaluateScores
	 * Evaluates {@link #evaluateIntrinsicScore intrinsic} score of the given domain, as well as {@link #pairscore interaction} and
	 * {@link #selfcrosstalk crosstalk} scores between the given domain and all other domains in the ensemble. Use this to evaluate scores
	 * after a single domain has been mutated.
	 * @param {Number} dom Index of the mutated domain
	 */
	function evaluateScores(dom) {
		old_score = score;
		old_d_intrinsic = domain_intrinsic[dom];

		// Calculate interaction (pairscore) and crosstalk (selfcrosstalk) scores between the mutated domain and each old domain
		// Update only relevant interactions and crosstalks
		for( i = 0; i < num_domain; i++) {
			if(i == dom) {
				interaction[i][i] = pairscore(domain[i], domain_length[i], domain[i], domain_length[i]) + INTRA_SCORE;
				crosstalk[i][i] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
			} else {
				interaction[i][dom] = pairscore(domain[i], domain_length[i], domain[dom], domain_length[dom]);
				interaction[dom][i] = pairscore(domain[dom], domain_length[dom], domain[i], domain_length[i]);
				for( k = 0; k < domain_length[dom]; k++)
				temp_domain[k] = 15 - domain[dom][(domain_length[dom]) - 1 - k];
				crosstalk[i][dom] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[dom]) / CROSSTALK_DIV;
				for( k = 0; k < domain_length[i]; k++)
				temp_domain[k] = 15 - domain[i][(domain_length[i]) - 1 - k];
				crosstalk[dom][i] = pairscore(domain[dom], domain_length[dom], temp_domain, domain_length[i]) / CROSSTALK_DIV;
			}
		}

		evaluateIntrinsicScore(dom);
		tallyScores();
	}

	/**
	 * evaluateIntrinsicScore
	 * Evaluates the intrinsic (heuristic) score of a given domain
	 * @param {Number} dom Index of the domain in question.
	 */
	function evaluateIntrinsicScore(dom) {
		domain_intrinsic[dom] = 0;

		// Search for 4g, if rule applied
		if(rule_4g == 1) {
			doRule_4g(dom);
		}

		// Search for 6at, if rule applied
		if(rule_6at == 1) {
			doRule_6at(dom);
		}

		if(rule_shannon == 1) {
			doRule_shannon(dom)
		}
	}

	/**
	 * doRule_4g
	 * Applies a penalty to domain <var>dom</var> if it contains >= 4 G nucleotides in a row
	 * @param {Number} dom Index of the domain in question
	 */
	function doRule_4g(dom) {
		k = 0;
		// G-C counter
		for( j = 0; j < domain_length[dom]; j++) {

			if((domain[dom][j] % 10 == 1) && (k < 100))
				k++;
			else if(domain[dom][j] % 10 == 1)
				k = 1;

			if((domain[dom][j] % 10 == 4) && (k > 100))
				k++;
			else if(domain[dom][j] % 10 == 4)
				k = 101;

			if((k < 100) && (k > 3))
				domain_intrinsic[dom] = domain_intrinsic[dom] + GGGG_PENALTY;
			else if(k > 103)
				domain_intrinsic[dom] = domain_intrinsic[dom] + GGGG_PENALTY;
		}
	}

	/**
	 * doRule_6at
	 * Applies a penalty to domain <var>dom</var> if it contains >= 6 A or T nucleotides in a row
	 * @param {Number} dom Index of the domain in question
	 */
	function doRule_6at(dom) {
		k = 0;
		// AT counter
		for( j = 0; j < domain_length[dom]; j++) {
			if((domain[dom][j] % 10 == 2) || (domain[dom][j] % 10 == 3))
				k++;
			else
				k = 0;
			if(k > 5)
				domain_intrinsic[dom] = domain_intrinsic[dom] + ATATAT_PENALTY;
		}
		k = 0;
		// GC counter
		for( j = 0; j < domain_length[dom]; j++) {
			if((domain[dom][j] % 10 == 1) || (domain[dom][j] % 10 == 4))
				k++;
			else
				k = 0;
			if(k > 5)
				domain_intrinsic[dom] = domain_intrinsic[dom] + ATATAT_PENALTY;

		}
	}

	function doRule_shannon(i) {
		if(rule_shannon == 1) {
			p_g = 0;
			p_a = 0;
			p_t = 0;
			p_c = 0;
			base = 0;
			available = 0;

			// determine base frequencies
			for( j = 0; j < domain_length[i]; j++) {

				// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc
				base = domain[i][j] % 10;
				if(base == 1) {
					p_g++;
				} else if(base == 2) {
					p_a++;
				} else if(base == 3) {
					p_t++;
				} else if(base == 4) {
					p_c++;
				}
			}

			// convert to distributions
			p_g = p_g / domain_length[i];
			p_a = p_a / domain_length[i];
			p_t = p_t / domain_length[i];
			p_c = p_c / domain_length[i];
			shannon = -(p_g * (p_g > 0 ? log2(p_g) : 0) + p_a * (p_a > 0 ? log2(p_a) : 0) + p_t * (p_t > 0 ? log2(p_t) : 0) + p_c * (p_c > 0 ? log2(p_c) : 0));

			// compute the number of available bases in the alphabet
			available = domain_gatc_avail[i];
			available = (available & 1) + ((available & 2) >> 1) + ((available & 4) >> 2) + ((available & 8) >> 3);

			domain_intrinsic[i] -= (shannon - SHANNON_ADJUST * log2(available)) * SHANNON_BONUS;
			//(shannon-domain_length[i]*SHANNON_ADJUST)*SHANNON_BONUS;
		}
	}

	/**
	 * mutate
	 * Perform a single round of mutations. The designer will stochastically determine a number between <var>0</var> and {@link #MAX_MUTATIONS}
	 * to apply to a domain, <var>mut_domain</var>. <var>mut_domain</var> is chosen depending on the value of several rules, applied in the
	 * following order:
	 * 	* If {#rule_targetworst}, the domain with the worst score is selected for mutation
	 * 	* If {#rule_targetdomain}, <var>mut_domain</var> is selected from among {#rule_targetdomain}
	 * 	* Otherwise, <var>mut_domain</var> is chosen randomly from among all domains in the ensemble.
	 */
	function mutate() {
		if(domain.length==0) return;
		
		num_mut_attempts++;

		// gotoxy(1, 11+num_domain);
		// printf("Attempts: %d", num_mut_attempts);
		// gotoxy(30, 11+num_domain);
		// printf("Mutations: %d", total_mutations);

		/* *****************************
		* Perform mutations
		* *****************************/

		// Stochastically determine how many mutations to apply
		num_mut = 0;
		while((num_mut < MAX_MUTATIONS - 1) && (int_urn(0, 1) == 1))
		num_mut++;
		num_mut++;

		// Select target domain for mutations
		// One third of all mutations are in "worst" domain if rule_targetworst active
		if(rule_targetworst) {
			if(int_urn(1, 3) == 1) {
				mut_domain = worst_domain ? worst_domain : int_urn(0, num_domain - 1);
			} else {
				mut_domain = int_urn(0, num_domain - 1);
				// select a domain to mutate
			}
		} else if(rule_targetdomain && rule_targetdomain.length != 0) {
			mut_domain = rule_targetdomain[rule_targetdomain.length == 1 ? 0 : int_urn(0, rule_targetdomain.length - 1)];
		} else {
			mut_domain = int_urn(0, num_domain - 1);
			// select a domain to mutate
		}

		// Perform num_mut mutations on domain mut_domain
		for( k = 0; k < num_mut; k++) {

			// Attempt a mutation
			j = int_urn(0, (domain_length[mut_domain]) - 1);
			// select a base to mutate

			if(domain[mut_domain][j] > 10) {

				// Base immutable
				mut_base[k] = j;
				mut_old[k] = domain[mut_domain][j];
				mut_new[k] = mut_old[k];
			} else {

				// Base is mutable
				mut_base[k] = j;
				mut_old[k] = domain[mut_domain][j];

				// hack to not mutate bases constrained to only 1 base
				if((domain_gatc_avail[mut_domain] & 1) + (domain_gatc_avail[mut_domain] & 2) / 2 + (domain_gatc_avail[mut_domain] & 4) / 4 + (domain_gatc_avail[mut_domain] & 8) / 8 > 1) {
					if(rule_ming) {
						// Minimize G rule active
						do {
							mut_new[k] = int_urn(1, 100);
							if(mut_new[k] < 5)
								mut_new[k] = 1;
							else if(mut_new[k] < 37)
								mut_new[k] = 2;
							else if(mut_new[k] < 69)
								mut_new[k] = 3;
							else
								mut_new[k] = 4;
							// Undo mutation if new base is not allowed
							if((mut_new[k] == 1) && (domain_gatc_avail[mut_domain] / 8 == 0))
								mut_new[k] = mut_old[k];
							if((mut_new[k] == 2) && ((domain_gatc_avail[mut_domain] / 4) % 2 == 0))
								mut_new[k] = mut_old[k];
							if((mut_new[k] == 3) && ((domain_gatc_avail[mut_domain] / 2) % 2 == 0))
								mut_new[k] = mut_old[k];
							if((mut_new[k] == 4) && (domain_gatc_avail[mut_domain] % 2 == 0))
								mut_new[k] = mut_old[k];

						} while (mut_new[k] == mut_old[k]);
					} else {
						// Uniform GATC mix
						do {
							mut_new[k] = int_urn(1, 100);
							if(mut_new[k] < 26)
								mut_new[k] = 1;
							else if(mut_new[k] < 51)
								mut_new[k] = 2;
							else if(mut_new[k] < 76)
								mut_new[k] = 3;
							else
								mut_new[k] = 4;
							// Undo mutation if new base is not allowed
							if((mut_new[k] == 1) && (domain_gatc_avail[mut_domain] / 8 == 0))
								mut_new[k] = mut_old[k];
							if((mut_new[k] == 2) && ((domain_gatc_avail[mut_domain] / 4) % 2 == 0))
								mut_new[k] = mut_old[k];
							if((mut_new[k] == 3) && ((domain_gatc_avail[mut_domain] / 2) % 2 == 0))
								mut_new[k] = mut_old[k];
							if((mut_new[k] == 4) && (domain_gatc_avail[mut_domain] % 2 == 0))
								mut_new[k] = mut_old[k];
						} while (mut_new[k] == mut_old[k]);
					}
				}
			}
		}

		// Apply mutations, calculate score after mutations
		for( k = 0; k < num_mut; k++)
		domain[mut_domain][mut_base[k]] = mut_new[k];

		/* *****************************
		 * Calculate new scores
		 * *****************************/
		old_score = score;
		evaluateScores(mut_domain);

		// Domain score is max of interaction and crosstalk scores
		score = 0;
		tallyScores();

		// Keep mutations if score improved; 0.2 chance of keeping mutations if score is same, otherwise revert
		if(score < old_score) {
			total_mutations = total_mutations + num_mut;

		} else if(score == old_score) {

			// reset mutations 80% of time when score == old_score
			if(int_urn(1, 100) <= 80) {
				for( k = num_mut - 1; k >= 0; k--)
				domain[mut_domain][mut_base[k]] = mut_old[k];
				domain_intrinsic[mut_domain] = old_d_intrinsic;

				for( i = 0; i < num_domain; i++) {
					if(i == mut_domain) {
						interaction[i][i] = pairscore(domain[i], domain_length[i], domain[i], domain_length[i]) + INTRA_SCORE;
						crosstalk[i][i] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
					} else {
						interaction[i][mut_domain] = pairscore(domain[i], domain_length[i], domain[mut_domain], domain_length[mut_domain]);
						interaction[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], domain[i], domain_length[i]);

						for( k = 0; k < domain_length[mut_domain]; k++)
						temp_domain[k] = 15 - domain[mut_domain][(domain_length[mut_domain]) - 1 - k];
						crosstalk[i][mut_domain] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[mut_domain]) / CROSSTALK_DIV;
						for( k = 0; k < domain_length[i]; k++)
						temp_domain[k] = 15 - domain[i][(domain_length[i]) - 1 - k];
						crosstalk[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], temp_domain, domain_length[i]) / CROSSTALK_DIV;
					}
				}

				// keep mutations 20% of time when score = old_score
			} else {
				total_mutations = total_mutations + num_mut

			}

		} else if(score > old_score) {
			score = old_score;
			for( k = num_mut - 1; k >= 0; k--)
			domain[mut_domain][mut_base[k]] = mut_old[k];

			domain_intrinsic[mut_domain] = old_d_intrinsic;

			for( i = 0; i < num_domain; i++) {
				if(i == mut_domain) {
					interaction[i][i] = pairscore(domain[i], domain_length[i], domain[i], domain_length[i]) + INTRA_SCORE;
					crosstalk[i][i] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
				} else {
					interaction[i][mut_domain] = pairscore(domain[i], domain_length[i], domain[mut_domain], domain_length[mut_domain]);
					interaction[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], domain[i], domain_length[i]);

					for( k = 0; k < domain_length[mut_domain]; k++)
					temp_domain[k] = 15 - domain[mut_domain][(domain_length[mut_domain]) - 1 - k];
					crosstalk[i][mut_domain] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[mut_domain]) / CROSSTALK_DIV;
					for( k = 0; k < domain_length[i]; k++)
					temp_domain[k] = 15 - domain[i][(domain_length[i]) - 1 - k];
					crosstalk[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], temp_domain, domain_length[i]) / CROSSTALK_DIV;
				}
			}

		}

	}


	_.extend(this, {
		version : "0.3.1",
		loadFile : loadFile,
		saveFile : saveFile,
		newDesign : newDesign,
		randomSequence : randomSequence,
		reseed : startingDomainSequences,
		reseedDomain : reseedDomain,
		addDomains : addDomains,
		removeDomain : removeDomain,
		mutate : mutate,
		evaluateAllScores : evaluateAllScores,
		evaluateScores : evaluateScores,
		evaluateIntrinsicScores : evaluateIntrinsicScores,
		popDomain : popDomain,

		saveState : function() {
			state = {};
			state.domain_length = domain_length;
			state.domain_importance = domain_importance;
			state.domain_gatc_avail = domain_gatc_avail;
			state.domain = domain;
			state.num_domain = num_domain;
			// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

			state.num_mut_attempts = num_mut_attempts, total_mutations = total_mutations;
			state.score = score;
			// Score of system
			state.domain_score = domain_score;
			// domain score
			state.worst_domain = worst_domain;
			// domain that causes the worst score
			state.num_mut = num_mut;
			//state.mut_domain = mut_domain;

			
			state.rules = _.clone(rules);
			state.params = _.clone(params);
			state.verson = this.version;
			
			return state;
		},
		loadState : function(state) {
			domain_length = state.domain_length || domain_length;
			domain_importance = state.domain_importance || domain_importance;
			domain_gatc_avail = state.domain_gatc_avail || domain_gatc_avail;
			domain = state.domain || domain; 
			
			
			num_mut_attempts = (state.num_mut_attempts && _.isNumber(state.num_mut_attempts)) ? state.num_mut_attempts : 0;
			total_mutations = (state.total_mutations && _.isNumber(state.total_mutations)) ? state.total_mutations : 0;
			num_domain = (state.num_domain && _.isNumber(state.num_domain)) ? state.num_domain : domain.length;
			// Score of system
			score = state.score || score;
			// domain score
			domain_score = state.domain_score || domain_score;
			// domain that causes the worst score
			worst_domain = state.worst_domain || worst_domain;
			num_mut = state.num_mut || num_mut;
			// Domain, base, old, and new values
			//mut_domain = state.mut_domain || mut_domain;
			
			_.extend(rules,state.rules);
			_.extend(params,state.params);
			
			setupScoreMatricies();
		},
		serialize : function() {
			this.saveState.apply(this, arguments);
		},
		deserialize : function() {
			this.loadState.apply(this, arguments);
		},
		/**
		 * Returns a hash containing all design rules
		 */
		getRules : function() {
			return _.clone(rules);
		},
		/**
		 * Accepts a hash describing a new set of design rules, and updates them within the designer
		 */
		updateRules : function(newRules) {
			_.extend(rules, newRules);
			copyRules();
		},
		/**
		 * Returns a hash containing all score parameters
		 */
		getParams : function() {
			return _.clone(params);
		},
		/**
		 * Accepts a hash describing a new set of score parameters, and updates them within the designer
		 */
		updateParams : function(newParams) {
			_.extend(params, _.reduce(newParams, function(m, x, key) {
				m[key] = +x;
				return m;
			}, {}));
			copyParams();
		},
		/**
		 * Updates parameters for a given domain
		 * @param {Number} domainId Index of the domain in question
		 * @param {String} seq String representation of the domain's sequence; capitalization indicates lock status
		 * @param {Number} imp New bscore for the domain (1...{#MAX_IMPORTANCE})
		 * @param {Number} comp New base composition rules, as bitmask: sum of: 8 (G) + 4 (A) + 2 (T) + 1 (C)
		 */
		updateDomain : function(domainId, seq, imp, comp) {
			seq = seq.trim();
			domain[domainId] = parseDomain(seq);
			domain_length[domainId] = seq.length;
			if(imp && imp != 0) {
				domain_importance[domainId] = imp;
			}
			if(comp && comp != 0) {
				domain_gatc_avail[domainId] = comp;
			}
		},
		/**
		 * Add <var>dom</var> to the list of domains to be targeted for mutation
		 * @param {Number} dom Index
		 */
		targetDomain : function(dom) {
			if(rule_targetdomain.indexOf(dom) == -1) {
				rule_targetdomain.push(dom);
				rules.rule_targetdomain = rule_targetdomain;
				rules.rule_targetworst = rule_targetworst = 0;
			}
		},
		/**
		 * Remove <var>dom</var> from the list of domains to be targeted for mutation
		 * @param {Number} dom Index
		 */
		untargetDomain : function(dom) {
			var i = rule_targetdomain.indexOf(dom)
			if(i != -1) {
				rule_targetdomain.splice(i);
				rules.rule_targetdomain = rule_targetdomain;
				if(rule_targetdomain.length == 0) {
					rules.rule_targetworst = rule_targetworst = 1;
				}
			}
		},
		getMutationAttempts : function() {
			return num_mut_attempts;
		},
		getMutationCount : function() {
			return total_mutations;
		},
		getWorstDomain : function() {
			return worst_domain;
		},
		getWorstScore : function() {
			return score;
		},
		getScore : function(domainId, forceRecalc) {
			if(forceRecalc || false) {
				this.evaluthis.domain_length
			}
			return domain_score[domainId];
		},
		getScores : function(forceRetally) {
			forceRetally = forceRetally || false;
			if(forceRetally) {
				tallyScores();
			}
			return domain_score;
		},
		getMutatedDomain : function() {
			return mut_domain;
		},
		getDomainCount : function() {
			return num_domain || 0;
		},
		getDomains : function() {
			return domain;
		},
		printfDomain : function(dom) {
			return _.reduce(dom, function(out, b) {
				return out += displayBaseFormatted(b);
			}, '');
		},
		printDomain : function(dom) {
			return _.reduce(dom, function(out, b) {
				return out += displayBase(b);
			}, '');
		},
		printDomainById : function(id) {
			var dom = domain[id];
			return this.printDomain(dom);
		},
		printfDomainById : function(id) {
			var dom = domain[id];
			return this.printfDomain(dom);
		},
		getImportance : function() {
			return domain_gatc_avail;
		},
		getCompositions : function() {
			return domain_gatc_avail;
		},
		getImportances : function() {
			return domain_importance;
		},
		printComposition : function(comp) {
			var out = '';
			if((comp & 8) >> 3)
				out += "G";
			if((comp & 4) >> 2)
				out += "A";
			if((comp & 2) >> 1)
				out += "T";
			if(comp & 1)
				out += "C";
			return out;
		},
		printCompositionById : function(id) {
			return this.printComposition(domain_gatc_avail[id]);
		},
		printDomains : function() {
			return _.map(domain, this.printDomain(dom), this);
		},
		printfDomains : function() {
			return _.map(domain, this.printfDomain, this);
		},
	})
};
