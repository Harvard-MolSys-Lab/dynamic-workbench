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

	var  SCREENWIDTH = 90
	var  FILENAME_LIMIT = 80
	var  MAX_DOMAIN_LENGTH = 60
	var  NB_ENABLE = 1
	var  NB_DISABLE = 0

	var options = {
		MAX_MUTATIONS: 10, // maximum number of simultaneous mutations
		GCstr:2,
		ATstr:1,
		GTstr:0,
		MBstr:-3, // mismatch, bulge
		LLstr:-0.5, // large loop
		DHstr:3, // score for domain ending in a base pair
		MAX_IMPORTANCE:100,
		LHbases:4,
		LHstart:2,
		LHpower:2,
		INTRA_SCORE:5, // score bonus for intrastrand/dimerization interactions
		CROSSTALK_SCORE:-5, // score bonus for crosstalk (as compared to interaction)
		CROSSTALK_DIV:2, // crosstalk score is divided by this much (and then score is subtracted)
		GGGG_PENALTY:50,
		ATATAT_PENALTY:20,
	};

	var MAX_MUTATIONS = options.MAX_MUTATIONS; // maximum number of simultaneous mutations

	var GCstr = options.GCstr;
	var ATstr = options.ATstr;
	var GTstr = options.GTstr;
	var MBstr = options.MBstr; // mismatch, bulge
	var LLstr = options.LLstr; // large loop
	var DHstr = options.DHstr; // score for domain ending in a base pair
	var MAX_IMPORTANCE = options.MAX_IMPORTANCE;
	var LHbases = options.LHbases;
	var LHstart = options.LHstart;
	var LHpower = options.LHpower;
	var INTRA_SCORE = options.INTRA_SCORE; // score bonus for intrastrand/dimerization interactions
	var CROSSTALK_SCORE = options.CROSSTALK_SCORE; // score bonus for crosstalk (as compared to interaction)
	var CROSSTALK_DIV = options.CROSSTALK_DIV; // crosstalk score is divided by this much (and then score is subtracted)
	var GGGG_PENALTY = options.GGGG_PENALTY;
	var ATATAT_PENALTY = options.ATATAT_PENALTY;

	function int_urn(from, to) {
		// var temp;
		// var temp2;
		// temp = from + rand() / (RAND_MAX / (to - from + 1));
		// temp2 = temp;
		var temp = from + Math.random() * (to-from);
		return Math.round(temp);
	}

	function out(base) {
		// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc
		if (base == 1)
			return "G";
		else if (base == 2)
			return "A";
		else if (base == 3)
			return "T";
		else if (base == 4)
			return "C";
		else if (base == 11)
			return "G"; //printf("\033[1;31;47mG\033[0;30;47m");
		else if (base == 12)
			return "A"; //printf("\033[1;31;47mA\033[0;30;47m");
		else if (base == 13)
			return "T"; //printf("\033[1;31;47mT\033[0;30;47m");
		else if (base == 14)
			return "C"; //printf("\033[1;31;47mC\033[0;30;47m");
		else {
			console.error("Unknown base! %d \n", base);
			throw "Unknown base "+base;
			//throw 'Error';
		}
		// ESC[Ps;...;Psm
		// 0;31;40m sets conditions (check ANSI code)
	}

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

	// double pairscore(int* seq1, int len1, int* seq2, int len2)
	function pairscore(seq1, len1, seq2, len2) {
		// Gives the score of the two sequences's crosstalk
		var score, temp;
		var i, j, k;
		var Cmatrix; // complementarity matrix
		var Smatrix; // score matrix
		var SDmatrix; // running total of helix size, 0 if current base didn't contribute.

		// Memory allocations
		if ((Cmatrix = new Array(len1  /* double* */)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if ((Smatrix = new Array(len1  /* double* */)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if ((SDmatrix = new Array(len1  /* int* */)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}

		for (i = 0; i < len1; i++) {
			if ((Cmatrix[i] = new Array(len2  /* double */)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if ((Smatrix[i] = new Array(len2  /* double */)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if ((SDmatrix[i] = new Array(len2  /* int */)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
		}

		// Seed complementarity matrix
		for (i = 0; i < len1; i++) {
			for (j = 0; j < len2; j++) {
				if (((seq1[i] + seq2[len2-1-j])%10 == 5)&&((seq1[i] * seq2[len2-1-j])%10 == 4)) // G/C Match
					Cmatrix[i][j] = GCstr;
				else if (((seq1[i] + seq2[len2-1-j])%10 == 5)&&((seq1[i] * seq2[len2-1-j])%10 == 6)) // A/T Match
					Cmatrix[i][j] = ATstr;
				else if (((seq1[i] + seq2[len2-1-j])%10 == 4)&&((seq1[i] * seq2[len2-1-j])%10 == 3)) // G/T Wobble
					Cmatrix[i][j] = GTstr;
				else
					Cmatrix[i][j] = MBstr;
				// mismatch
			}
		}

		// Calculate score matrix
		score = 0;

		Smatrix[0][0] = Cmatrix[0][0];
		if (Smatrix[0][0] < 0) {
			Smatrix[0][0] = 0;
			SDmatrix[0][0] = 0;
		} else {
			Smatrix[0][0] = Smatrix[0][0] + DHstr;
			SDmatrix[0][0] = 1;
		}

		if (Smatrix[0][0] > score)
			score = Smatrix[0][0];

		for (j = 1; j < len2; j++) {
			Smatrix[0][j] = Cmatrix[0][j];
			if (Smatrix[0][j] < 0) {
				Smatrix[0][j] = 0;
				SDmatrix[0][j] = 0;
			} else {
				Smatrix[0][j] = Smatrix[0][j] + DHstr;
				SDmatrix[0][j] = 1;
			}
			if (Smatrix[0][j] > score)
				score = Smatrix[0][j];
		}

		for (i = 1; i < len1; i++) {
			Smatrix[i][0] = Cmatrix[i][0];
			if (Smatrix[i][0] < 0) {
				Smatrix[i][0] = 0;
				SDmatrix[i][0] = 0;
			} else {
				Smatrix[i][0] = Smatrix[i][0] + DHstr;
				SDmatrix[i][0] = 1;
			}
			if (Smatrix[i][0] > score)
				score = Smatrix[i][0];

			for (j = 1; j < len2; j++) {

				if (Cmatrix[i][j] < 0) { // destabilizing base
					SDmatrix[i][j] = 0;
					Smatrix[i][j] = 0;

					if ((SDmatrix[i-1][j-1] > 0)&&(Smatrix[i-1][j-1] + MBstr > 0)) // starting a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j-1] + MBstr;
					if ((SDmatrix[i-1][j-1] == 0)&&(Smatrix[i-1][j-1] + LLstr > 0)) // expanding a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j-1] + LLstr;

					if ((SDmatrix[i][j-1] > 0)&&(Smatrix[i][j-1] + MBstr > 0)&&(Smatrix[i][j-1] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j-1] + MBstr;
					if ((SDmatrix[i][j-1] == 0)&&(Smatrix[i][j-1] + LLstr > 0)&&(Smatrix[i][j-1] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j-1] + LLstr;

					if ((SDmatrix[i-1][j] > 0)&&(Smatrix[i-1][j] + MBstr > 0)&&(Smatrix[i-1][j] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + MBstr;
					if ((SDmatrix[i-1][j] == 0)&&(Smatrix[i-1][j] + LLstr > 0)&&(Smatrix[i-1][j] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + LLstr;

					if (Smatrix[i][j] < 0)
						Smatrix[i][j] = 0;

				} else { // stabilizing base
					Smatrix[i][j] = Cmatrix[i][j];
					SDmatrix[i][j] = 1;

					if ((SDmatrix[i-1][j-1] > 0)&&(Smatrix[i-1][j-1] > 0)) { // continuing a helix
						Smatrix[i][j] = Smatrix[i-1][j-1] + Cmatrix[i][j];
						SDmatrix[i][j] = SDmatrix[i-1][j-1] + 1;
					} else if ((SDmatrix[i-1][j-1] == 0)&&(Smatrix[i-1][j-1] > 0)) { // starting a new helix
						Smatrix[i][j] = Smatrix[i-1][j-1] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if ((SDmatrix[i][j-1] > 0)&&(Smatrix[i][j-1] > 0)&&(Smatrix[i][j-1] + Cmatrix[i][j] - Cmatrix[i][j-1] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j-1] + Cmatrix[i][j] - Cmatrix[i][j-1] + MBstr; // introducing a 1-bulge, destroying previous bond
						SDmatrix[i][j] = 1;
					} else if ((SDmatrix[i][j-1] == 0)&&(Smatrix[i][j-1] > 0)&&(Smatrix[i][j-1] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j-1] + Cmatrix[i][j]; // closing a bulge
						SDmatrix[i][j] = 1;
					}

					if ((SDmatrix[i-1][j] > 0)&&(Smatrix[i-1][j] > 0)&&(Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr;
						SDmatrix[i][j] = 1;
					} else if ((SDmatrix[i-1][j] == 0)&&(Smatrix[i-1][j] > 0)&&(Smatrix[i-1][j] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if (SDmatrix[i][j] > LHbases) {
						// Extra points for long helices
						temp = LHstart;
						for (k = LHbases; k < SDmatrix[i][j]; k++)
							temp = temp * LHpower;
						Smatrix[i][j] = Smatrix[i][j] + temp;
					}
				}

				if ((SDmatrix[i][j] > 0)&&((i == (len1-1))||(j == (len2-1))))
					Smatrix[i][j] = Smatrix[i][j] + DHstr;

				if (Smatrix[i][j] > score)
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

	// double selfcrosstalk(int* seq1, int len1)
	function selfcrosstalk(seq1, len1) {
		// Gives the score of the two sequences's crosstalk
		var score, temp;
		var i, j, k;
		var Cmatrix; // complementarity matrix
		var Smatrix; // score matrix
		var SDmatrix;// running total of helix size, 0 if current base didn't contribute.

		// Memory allocations
		if ((Cmatrix = new Array(len1  /* double* */)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if ((Smatrix = new Array(len1  /* doublevar */)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}
		if ((SDmatrix = new Array(len1  /* int* */)) == null) {
			console.error("Insufficient memory for score calculations!\n");
			throw 'Error';
		}

		for (i = 0; i < len1; i++) {
			if ((Cmatrix[i] = new Array(len1  /* double */)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if ((Smatrix[i] = new Array(len1  /* double */)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
			if ((SDmatrix[i] = new Array(len1  /* int */)) == null) {
				console.error("Insufficient memory for score calculations!\n");
				throw 'Error';
			}
		}

		// Seed complementarity matrix
		for (i = 0; i < len1; i++) {
			for (j = 0; j < len1; j++) {
				if (((seq1[i] + (15-seq1[len1-1-j]))%10 == 5)&&((seq1[i] * (15-seq1[len1-1-j]))%10 == 4)) // G/C Match
					Cmatrix[i][j] = GCstr;
				else if (((seq1[i] + (15-seq1[len1-1-j]))%10 == 5)&&((seq1[i] * (15-seq1[len1-1-j]))%10 == 6)) // A/T Match
					Cmatrix[i][j] = ATstr;
				else if (((seq1[i] + (15-seq1[len1-1-j]))%10 == 4)&&((seq1[i] * (15-seq1[len1-1-j]))%10 == 3)) // G/T Wobble
					Cmatrix[i][j] = GTstr;
				else
					Cmatrix[i][j] = MBstr;
				// mismatch
			}
		}

		// Calculate score matrix
		score = 0;

		Smatrix[0][0] = 0;

		for (j = 1; j < len1; j++) {
			Smatrix[0][j] = Cmatrix[0][j];
			if (Smatrix[0][j] < 0) {
				Smatrix[0][j] = 0;
				SDmatrix[0][j] = 0;
			} else {
				Smatrix[0][j] = Smatrix[0][j] + DHstr;
				SDmatrix[0][j] = 1;
			}
			if (Smatrix[0][j] > score)
				score = Smatrix[0][j];
		}

		for (i = 1; i < len1; i++) {
			Smatrix[i][0] = Cmatrix[i][0];
			if (Smatrix[i][0] < 0) {
				Smatrix[i][0] = 0;
				SDmatrix[i][0] = 0;
			} else {
				Smatrix[i][0] = Smatrix[i][0] + DHstr;
				SDmatrix[i][0] = 1;
			}
			if (Smatrix[i][0] > score)
				score = Smatrix[i][0];

			for (j = 1; j < len1; j++) {

				if (i == j) {
					// "Main line" match, do not score
					SDmatrix[i][j] = 0;
					Smatrix[i][j] = 0;
				} else if (Cmatrix[i][j] < 0) { // destabilizing base
					SDmatrix[i][j] = 0;
					Smatrix[i][j] = 0;

					if ((SDmatrix[i-1][j-1] > 0)&&(Smatrix[i-1][j-1] + MBstr > 0)) // starting a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j-1] + MBstr;
					if ((SDmatrix[i-1][j-1] == 0)&&(Smatrix[i-1][j-1] + LLstr > 0)) // expanding a mismatch loop
						Smatrix[i][j] = Smatrix[i-1][j-1] + LLstr;

					if ((SDmatrix[i][j-1] > 0)&&(Smatrix[i][j-1] + MBstr > 0)&&(Smatrix[i][j-1] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j-1] + MBstr;
					if ((SDmatrix[i][j-1] == 0)&&(Smatrix[i][j-1] + LLstr > 0)&&(Smatrix[i][j-1] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i][j-1] + LLstr;

					if ((SDmatrix[i-1][j] > 0)&&(Smatrix[i-1][j] + MBstr > 0)&&(Smatrix[i-1][j] + MBstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + MBstr;
					if ((SDmatrix[i-1][j] == 0)&&(Smatrix[i-1][j] + LLstr > 0)&&(Smatrix[i-1][j] + LLstr > Smatrix[i][j]))
						Smatrix[i][j] = Smatrix[i-1][j] + LLstr;

					if (Smatrix[i][j] < 0)
						Smatrix[i][j] = 0;

				} else { // stabilizing base
					Smatrix[i][j] = Cmatrix[i][j];
					SDmatrix[i][j] = 1;

					if ((SDmatrix[i-1][j-1] > 0)&&(Smatrix[i-1][j-1] > 0)) { // continuing a helix
						Smatrix[i][j] = Smatrix[i-1][j-1] + Cmatrix[i][j];
						SDmatrix[i][j] = SDmatrix[i-1][j-1] + 1;
					} else if ((SDmatrix[i-1][j-1] == 0)&&(Smatrix[i-1][j-1] > 0)) { // starting a new helix
						Smatrix[i][j] = Smatrix[i-1][j-1] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if ((SDmatrix[i][j-1] > 0)&&(Smatrix[i][j-1] > 0)&&(Smatrix[i][j-1] + Cmatrix[i][j] - Cmatrix[i][j-1] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j-1] + Cmatrix[i][j] - Cmatrix[i][j-1] + MBstr; // introducing a 1-bulge, destroying previous bond
						SDmatrix[i][j] = 1;
					} else if ((SDmatrix[i][j-1] == 0)&&(Smatrix[i][j-1] > 0)&&(Smatrix[i][j-1] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i][j-1] + Cmatrix[i][j]; // closing a bulge
						SDmatrix[i][j] = 1;
					}

					if ((SDmatrix[i-1][j] > 0)&&(Smatrix[i-1][j] > 0)&&(Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j] - Cmatrix[i-1][j] + MBstr;
						SDmatrix[i][j] = 1;
					} else if ((SDmatrix[i-1][j] == 0)&&(Smatrix[i-1][j] > 0)&&(Smatrix[i-1][j] + Cmatrix[i][j] > Smatrix[i][j])) {
						Smatrix[i][j] = Smatrix[i-1][j] + Cmatrix[i][j];
						SDmatrix[i][j] = 1;
					}

					if (SDmatrix[i][j] > LHbases) {
						// Extra points for long helices
						temp = LHstart;
						for (k = LHbases; k < SDmatrix[i][j]; k++)
							temp = temp * LHpower;
						Smatrix[i][j] = Smatrix[i][j] + temp;
					}
				}

				if ((SDmatrix[i][j] > 0)&&((i == (len1-1))||(j == (len1-1))))
					Smatrix[i][j] = Smatrix[i][j] + DHstr;

				if (Smatrix[i][j] > score)
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

	/********************
	 * Main
	 ********************/
	var i, j, k, x;
	var score, old_score, old_d_intrinsic; // Score of system
	var domain_score; // domain score
	var worst_domain; // domain that causes the worst score
	var num_mut;
	var mut_domain; // Domain, base, old, and new values
	var mut_base;
	var mut_new;
	var mut_old;

	var crosstalk; // Crosstalk is for domain similarity
	var interaction; // Interaction is for domain complementarity
	var domain_intrinsic; // intrinsic score to domains from various rules

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
	var domain; // 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

	var num_mut_attempts, total_mutations;
	var rule_4g, rule_6at, rule_ccend, rule_ming, rule_init, rule_lockold, rule_targetworst, rule_gatc_avail;

	var dom1 = new Array(30);
	var dom2 = new Array(30);
	var len1, len2;

	// Set default parameters
	rule_4g = 1; // cannot have 4 G's or 4 C's in a row
	rule_6at = 1; // cannot have 6 A/T or G/C bases in a row
	rule_ccend = 1; // domains MUST start and end with C
	rule_ming = 1; // design tries to minimize usage of G
	rule_init = 7; // 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T
	rule_targetworst = 1; // target worst domain
	rule_gatc_avail = 15; // all bases available
	rule_lockold = 0; // lock all old bases (NO)

	/*
	// struct timeb* curtime;
	//
	// // Randomize seed
	// curtime = new Array(sizeof(struct timeb));
	// ftime(curtime);
	// srand(curtime->millitm);
	*/

	// Set up memory for mutation computations
	if ((mut_base = new Array(MAX_MUTATIONS  /* int */)) == null) {
		console.error("Insufficient memory for declaring mutation memories!\n");
		throw 'Error';
	}
	if ((mut_old = new Array(MAX_MUTATIONS  /* int */)) == null) {
		console.error("Insufficient memory for declaring mutation memories!\n");
		throw 'Error';
	}
	if ((mut_new = new Array(MAX_MUTATIONS  /* int */)) == null) {
		console.error("Insufficient memory for declaring mutation memories!\n");
		throw 'Error';
	}

	// Start selfcrosstalk debug
	/*
	printf("Enter sequence for Domain 1: ");
	fgets(buffer, 80, stdin);

	i = 0;
	while (buffer[i] != '\n') {
	if (buffer[i] == 'g')
	dom1[i] = 1;
	if (buffer[i] == 'a')
	dom1[i] = 2;
	if (buffer[i] == 't')
	dom1[i] = 3;
	if (buffer[i] == 'c')
	dom1[i] = 4;
	if (buffer[i] == 'G')
	dom1[i] = 11;
	if (buffer[i] == 'A')
	dom1[i] = 12;
	if (buffer[i] == 'T')
	dom1[i] = 13;
	if (buffer[i] == 'C')
	dom1[i] = 14;
	i++;
	}
	len1 = i;

	printf("len1 = %d\n", len1);
	printf("\nSelfcrosstalk: %f\n", selfcrosstalk(dom1, len1));

	printf("Domain 1: ");
	for (i = 0; i < len1; i++)
	printf("%d ", dom1[i]);
	printf("\n");

	exit(0);
	*/
	// End pairscore debug

	// printf("\n           Domain-based sequence design\n");
	// printf("                     v. 0.2\n");
	// printf("                 by Dave Zhang\n\n");
	// printf("(S)tart new sequence design from scratch or (L)oad existing design?  (e(X)it at any time)");
	//
	// tempchar = myhotinput(2, 'S', 'L');

	/**
	 * add new domains to the system
	 * @param {String[]} domains The sequences of the new domains to add
	 * @param {Number[]/Number} importance Array of floats containing the relative importance of each domain, or a single float to set as the importance of each domain (defaults to 1 for all domains)
	 * @param {Number[]} composition Array of integral bitmasks indicating the base composition of each domain, or a single float to set as the composition of all domains (defaults to 15 for all domains)
	 * @param {Boolean} clobber false to preserve existing domains, true to delete them (defaults to true)
	 */
	function addDomains(domains,importance,composition,clobber) {
		clobber = clobber || !domain;
		var nd,start;
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
			if ((domain = new Array(nd  /* int* */)) == null) {
				console.error("Insufficient memory for declaring domain pointers!\n");
				throw 'Error';
			}

			if ((domain_length = new Array(nd  /* int */)) == null) {
				console.error("Insufficient memory for declaring domain lengths!\n");
				throw 'Error';
			}

			if ((domain_gatc_avail = new Array(nd  /* int */)) == null) {
				console.error("Insufficient memory for declaring domain base availability!\n");
				throw 'Error';
			}

			if ((domain_importance = new Array(nd  /* int */)) == null) {
				console.error("Insufficient memory for declaring domain importances!\n");
				throw 'Error';
			}

		}
		num_domain = nd;

		for (j = start; j < num_domain; j++) {
			buffer = domains[j-start].trim();
			i = domains[j-start].length;
			domain_length[j] = i;
			domain[j] = new Array(i  /* int */);
			for (i = 0; i < domain_length[j]; i++) {
				if (buffer[i] == 'g')
					domain[j][i] = 1;
				if (buffer[i] == 'a')
					domain[j][i] = 2;
				if (buffer[i] == 't')
					domain[j][i] = 3;
				if (buffer[i] == 'c')
					domain[j][i] = 4;
				if (buffer[i] == 'G')
					domain[j][i] = 11;
				if (buffer[i] == 'A')
					domain[j][i] = 12;
				if (buffer[i] == 'T')
					domain[j][i] = 13;
				if (buffer[i] == 'C')
					domain[j][i] = 14;
			}

			domain_importance[j] = _.isArray(importance) ? importance[j-start] : (_.isNumber(importance) ? importance : 1 );
			domain_gatc_avail[j] = _.isArray(composition) ? composition[j-start] : (_.isNumber(composition) ? composition : 15 );

		}

		setupScoreMatricies();

	}

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

	function parseDomain(buffer) {
		var out = new Array(buffer.length  /* int */);
		for (i = 0; i < buffer.length; i++) {
			if (buffer[i] == 'g')
				out[i] = 1;
			if (buffer[i] == 'a')
				out[i] = 2;
			if (buffer[i] == 't')
				out[i] = 3;
			if (buffer[i] == 'c')
				out[i] = 4;
			if (buffer[i] == 'G')
				out[i] = 11;
			if (buffer[i] == 'A')
				out[i] = 12;
			if (buffer[i] == 'T')
				out[i] = 13;
			if (buffer[i] == 'C')
				out[i] = 14;
		}
		return out;
	}

	function loadFile(fileContents,newDomains) {
		var f = _.compact(fileContents.split('\n'));

		f.unshift(); // ditch parameter for number of domains
		num_domain = f.length;
		num_new_domain = newDomains;

		if ((domain = new Array((num_domain + num_new_domain)  /* int* */)) == null) {
			console.error("Insufficient memory for declaring domain pointers!\n");
			throw 'Error';
		}

		if ((domain_length = new Array((num_domain + num_new_domain)  /* int */)) == null) {
			console.error("Insufficient memory for declaring domain lengths!\n");
			throw 'Error';
		}

		if ((domain_gatc_avail = new Array((num_domain + num_new_domain)  /* int */)) == null) {
			console.error("Insufficient memory for declaring domain base availability!\n");
			throw 'Error';
		}

		if ((domain_importance = new Array((num_domain + num_new_domain)  /* int */)) == null) {
			console.error("Insufficient memory for declaring domain importances!\n");
			throw 'Error';
		}

		for (j = 0; j < num_domain; j++) {
			buffer = f[j];
			i = 0;
			while (buffer[i] != ' ') {
				if ((buffer[i] != 'G')&&(buffer[i] != 'A')&&(buffer[i] != 'T')&&(buffer[i] != 'C')&&(buffer[i] != 'g')&&(buffer[i] != 'a')&&(buffer[i] != 't')&&(buffer[i] != 'c')) {
					printf("Input file corrupted.  Sequence for domain %d contains a non-base (%c) at position %d.\n", (j+1), buffer[i], (i+1));
					throw 'Error';
				}
				i++;
			}

			domain_length[j] = i;
			domain[j] = new Array(i  /* int */);
			for (i = 0; i < domain_length[j]; i++) {
				if (buffer[i] == 'g')
					domain[j][i] = 1;
				if (buffer[i] == 'a')
					domain[j][i] = 2;
				if (buffer[i] == 't')
					domain[j][i] = 3;
				if (buffer[i] == 'c')
					domain[j][i] = 4;
				if (buffer[i] == 'G')
					domain[j][i] = 11;
				if (buffer[i] == 'A')
					domain[j][i] = 12;
				if (buffer[i] == 'T')
					domain[j][i] = 13;
				if (buffer[i] == 'C')
					domain[j][i] = 14;
			}

			i = domain_length[j]+1;
			domain_importance[j] = 0;
			while(buffer[i] != ' ') {
				if ((buffer[i] < '0')||(buffer[i] > '9')) {
					printf("Input file corrupted.  Non-numeric parameter for importance of domain %d.\n", (j+1));
					throw 'Error';
				} else {
					domain_importance[j] = domain_importance[j] * 10 + ((buffer[i])-'0');
				}
				i++;
			}

			i++;
			domain_gatc_avail[j] = 0;
			while(buffer[i] != '\n') {
				if ((buffer[i] < '0')||(buffer[i] > '9')) {
					printf("Input file corrupted.  Non-numeric parameter for base composition of domain %d.\n", (j+1));
					throw 'Error';
				} else {
					domain_gatc_avail[j] = domain_gatc_avail[j] * 10 + ((buffer[i])-'0');
				}
				i++;
			}
			if ((domain_gatc_avail[j] > 15)||(domain_gatc_avail[j] < 1)) {
				printf("Input file corrupted at domain %d.  Domain base composition must be between 1 and 15.\n", (j+1));
				throw 'Error';
			}
		}

		setupScoreMatricies();

	}

	// Dave's old load files routine
	/*
	 // Load files
	 function loadFile() {
	 printf("\nPlease enter the file to open: ");

	 fgets(buffer, 80, stdin);
	 i = 0;
	 while (buffer[i] != '\n')
	 i++;
	 buffer[i] = '\0';

	 // Open parameters file
	 // Format:
	 // --
	 // (Number of domains)
	 //   (Domain 1) (Domain 1 importance (1 is default)) (Domain 1 composition)
	 //   (Domain 2) (Domain 2 importance) (Domain 1 composition)
	 //   ...

	 if ( (f = fopen(buffer, "r")) == null) {
	 console.error("\nCan't read from input file: %s\n", buffer);
	 throw 'Error';
	 }

	 fgets(buffer, 80, f);
	 num_domain = 0;
	 i = 0;
	 while(buffer[i] != '\n') {
	 if ((buffer[i] < '0')||(buffer[i] > '9')) {
	 printf("Input file corrupted.  Non-numeric parameter for num_domain.\n");
	 throw 'Error';
	 } else {
	 num_domain = num_domain * 10 + ((buffer[i])-'0');
	 }
	 i++;
	 }

	 printf("%d domains in input file; construct how many new domains? ", num_domain);
	 num_new_domain = myintinput();

	 // int*
	 if ((domain = new Array((num_domain + num_new_domain)  )) == null) {
	 console.error("Insufficient memory for declaring domain pointers!\n");
	 throw 'Error';
	 }

	 // int*
	 if ((domain_length = new Array((num_domain + num_new_domain)  )) == null) {
	 console.error("Insufficient memory for declaring domain lengths!\n");
	 throw 'Error';
	 }
	 // int
	 if ((domain_gatc_avail = new Array((num_domain + num_new_domain) )) == null) {
	 console.error("Insufficient memory for declaring domain base availability!\n");
	 throw 'Error';
	 }
	 // int
	 if ((domain_importance = new Array((num_domain + num_new_domain) )) == null) {
	 console.error("Insufficient memory for declaring domain importances!\n");
	 throw 'Error';
	 }

	 for (j = 0; j < num_domain; j++) {
	 fgets(buffer, 120, f);
	 i = 0;
	 while (buffer[i] != ' ') {
	 if ((buffer[i] != 'G')&&(buffer[i] != 'A')&&(buffer[i] != 'T')&&(buffer[i] != 'C')&&(buffer[i] != 'g')&&(buffer[i] != 'a')&&(buffer[i] != 't')&&(buffer[i] != 'c')) {
	 printf("Input file corrupted.  Sequence for domain %d contains a non-base (%c) at position %d.\n", (j+1), buffer[i], (i+1));
	 throw 'Error';
	 }
	 i++;
	 }

	 domain_length[j] = i;
	 // int
	 domain[j] = new Array(i  );
	 for (i = 0; i < domain_length[j]; i++) {
	 if (buffer[i] == 'g')
	 domain[j][i] = 1;
	 if (buffer[i] == 'a')
	 domain[j][i] = 2;
	 if (buffer[i] == 't')
	 domain[j][i] = 3;
	 if (buffer[i] == 'c')
	 domain[j][i] = 4;
	 if (buffer[i] == 'G')
	 domain[j][i] = 11;
	 if (buffer[i] == 'A')
	 domain[j][i] = 12;
	 if (buffer[i] == 'T')
	 domain[j][i] = 13;
	 if (buffer[i] == 'C')
	 domain[j][i] = 14;
	 }

	 i = domain_length[j]+1;
	 domain_importance[j] = 0;
	 while(buffer[i] != ' ') {
	 if ((buffer[i] < '0')||(buffer[i] > '9')) {
	 printf("Input file corrupted.  Non-numeric parameter for importance of domain %d.\n", (j+1));
	 throw 'Error';
	 } else {
	 domain_importance[j] = domain_importance[j] * 10 + ((buffer[i])-'0');
	 }
	 i++;
	 }

	 i++;
	 domain_gatc_avail[j] = 0;
	 while(buffer[i] != '\n') {
	 if ((buffer[i] < '0')||(buffer[i] > '9')) {
	 printf("Input file corrupted.  Non-numeric parameter for base composition of domain %d.\n", (j+1));
	 throw 'Error';
	 } else {
	 domain_gatc_avail[j] = domain_gatc_avail[j] * 10 + ((buffer[i])-'0');
	 }
	 i++;
	 }
	 if ((domain_gatc_avail[j] > 15)||(domain_gatc_avail[j] < 1)) {
	 printf("Input file corrupted at domain %d.  Domain base composition must be between 1 and 15.\n", (j+1));
	 throw 'Error';
	 }
	 }
	 fclose(f);
	 printf("%d domains loaded from input file.\n", num_domain);
	 // New domains input
	 if (num_new_domain > 0) {
	 printf("Are the new domains all the same length (y/n)? ");

	 tempchar = myhotinput(2, 'Y', 'N');

	 if (tempchar == 'Y') {
	 printf("What is the length of each domain? ");
	 domain_length[num_domain] = myintinput();

	 while ((domain_length[num_domain] == 0)||(domain_length[num_domain] > MAX_DOMAIN_LENGTH)) {
	 printf("Domain lengths must be between 1 and %d!\n", MAX_DOMAIN_LENGTH);
	 movexy(0,-2);
	 printf("What is the length of each domain?            \n");
	 movexy(0, -1);
	 printf("What is the length of each domain? ");
	 domain_length[num_domain] = myintinput();
	 printf("                                                 \n");
	 movexy(0, -1);
	 }

	 for (i = 1; i < num_new_domain; i++)
	 domain_length[num_domain+i] = domain_length[num_domain];

	 for (i = 0; i < num_new_domain; i++) {
	 // int
	 if ((domain[num_domain+i] = new Array(domain_length[num_domain+i]  )) == null) {
	 console.error("Insufficient memory for declaring domain bases!\n");
	 throw 'Error';
	 }
	 domain_importance[num_domain+i] = 1;
	 }

	 } else {

	 printf("\n");
	 for (i = 0; i < num_new_domain; i++) {
	 printf("What is the length of domain %d? ", (i+1));
	 domain_length[num_domain+i] = myintinput();

	 while ((domain_length[num_domain+i] == 0)||(domain_length[num_domain+i] > MAX_DOMAIN_LENGTH)) {
	 printf("Domain lengths must be between 1 and %d!\n", MAX_DOMAIN_LENGTH);
	 movexy(0,-2);
	 printf("What is the length of domain %d?            \n", (i+1));
	 movexy(0, -1);
	 printf("What is the length of domain %d? ", (i+1));
	 domain_length[num_domain+i] = myintinput();
	 printf("                                                    \n");
	 movexy(0, -1);
	 }
	 // int
	 if ((domain[num_domain+i] = new Array(domain_length[num_domain+i]  )) == null) {
	 console.error("Insufficient memory for declaring domain bases!\n");
	 throw 'Error';
	 }
	 domain_importance[num_domain+i] = 1;
	 }
	 }
	 }

	 rule_4g = 1; // cannot have 4 G's or 4 C's in a row
	 rule_6at = 1; // cannot have 6 A/T or G/C bases in a row
	 rule_ccend = 1; // domains MUST start and end with C
	 rule_ming = 1; // design tries to minimize usage of G
	 rule_init = 7; // 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T
	 rule_targetworst = 1; // target worst domain
	 rule_gatc_avail = 15; // all bases available
	 rule_lockold = 0; // lock all old bases (NO)
	 doneflag = 0;

	 while (doneflag == 0) {
	 clrscr();
	 printf("Design Options:\n");

	 printf("\n1. Prevent 4 G's and 4 C's in a row: ");
	 if (rule_4g)
	 printf("Y");
	 else
	 printf("N");

	 printf("\n2. Prevent 6 A/T bases in a row and 6 G/C bases in a row: ");
	 if (rule_6at)
	 printf("Y");
	 else
	 printf("N");

	 printf("\n3. Domains must start and end with C: ");
	 if (rule_ccend)
	 printf("Y");
	 else
	 printf("N");

	 printf("\n4. Minimize G's in domain design: ");
	 if (rule_ming)
	 printf("Y");
	 else
	 printf("N");

	 printf("\n5. Target worst domain for mutations: ");
	 if (rule_targetworst)
	 printf("Y");
	 else
	 printf("N");

	 printf("\n6. Constrain bases in domains: ");
	 if (rule_gatc_avail == 15)
	 printf("N");
	 else {
	 if (rule_gatc_avail / 8 == 1)
	 printf("G");
	 if ((rule_gatc_avail / 4) % 2 == 1)
	 printf("A");
	 if ((rule_gatc_avail / 2) % 2 == 1)
	 printf("T");
	 if (rule_gatc_avail % 2 == 1)
	 printf("C");

	 printf(" only");
	 }

	 printf("\n7. Constrain initial domain sequences: ");
	 if (rule_init == 15)
	 printf("N");
	 else {
	 if (rule_init / 8 == 1)
	 printf("G");
	 if ((rule_init / 4) % 2 == 1)
	 printf("A");
	 if ((rule_init / 2) % 2 == 1)
	 printf("T");
	 if (rule_init % 2 == 1)
	 printf("C");

	 printf(" only");
	 }

	 printf("\n8. Lock all bases in strands loaded from file: ");
	 if (rule_lockold)
	 printf("Y");
	 else
	 printf("N");

	 printf("\n\n\033[1;31;47m0.\033[0;30;47m Tweak score parameters");

	 printf("\n\n\nChange which option?  Press space when done.");

	 tempchar = myhotinput(10, '1', '2', '3', '4', '5', '6', '7', '8', '0', ' ');

	 if (tempchar == '1') {
	 if (rule_4g == 1)
	 rule_4g = 0;
	 else
	 rule_4g = 1;
	 }

	 if (tempchar == '2') {
	 if (rule_6at == 1)
	 rule_6at = 0;
	 else
	 rule_6at = 1;
	 }

	 if (tempchar == '3') {
	 if (rule_ccend == 1)
	 rule_ccend = 0;
	 else
	 rule_ccend = 1;
	 }

	 if (tempchar == '4') {
	 if (rule_ming == 1)
	 rule_ming = 0;
	 else
	 rule_ming = 1;
	 }

	 if (tempchar == '5') {
	 if (rule_targetworst == 1)
	 rule_targetworst = 0;
	 else
	 rule_targetworst = 1;
	 }

	 if (tempchar == '6') {
	 rule_gatc_avail = 0;
	 while (rule_gatc_avail == 0) {
	 printf("Allow G? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_gatc_avail = rule_gatc_avail + 8;
	 printf("Allow A? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_gatc_avail = rule_gatc_avail + 4;
	 printf("Allow T? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_gatc_avail = rule_gatc_avail + 2;
	 printf("Allow C? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_gatc_avail = rule_gatc_avail + 1;
	 if (rule_gatc_avail == 0) {
	 printf("Some bases must be allowed!  Press space to start over.");
	 tempchar = myhotinput(1, ' ');
	 }
	 }
	 rule_init = (rule_init & rule_gatc_avail);
	 if (rule_init == 0)
	 rule_init = rule_gatc_avail;
	 }

	 if (tempchar == '7') {
	 rule_init = 0;
	 while (rule_init == 0) {
	 if (rule_gatc_avail / 8 == 1) {
	 printf("Allow G? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_init = rule_init + 8;
	 }
	 if ((rule_gatc_avail / 4) % 2 == 1) {
	 printf("Allow A? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_init = rule_init + 4;
	 }
	 if ((rule_gatc_avail / 2) % 2 == 1) {
	 printf("Allow T? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_init = rule_init + 2;
	 }
	 if (rule_gatc_avail %2 == 1) {
	 printf("Allow C? ");
	 tempchar = myhotinput(2, 'Y', 'N');
	 if (tempchar == 'Y')
	 rule_init = rule_init + 1;
	 }
	 if (rule_init == 0) {
	 printf("Some bases must be allowed!  Press space to start over.");
	 tempchar = myhotinput(1, ' ');
	 }
	 }
	 }

	 if (tempchar == '8') {
	 if (rule_lockold == 1)
	 rule_lockold = 0;
	 else
	 rule_lockold = 1;
	 }

	 if (tempchar == '0') {
	 // Adjust score parameters
	 printf("Only do this if you're sure you know what you're doing!\n");
	 printf("Press (@) to continue editing or space to return to previous menu\n");
	 tempchar2 = myhotinput(2, '@', ' ');
	 if (tempchar2 == '@') {
	 clrscr();
	 printf("Old GC score: %f\n", GCstr);
	 printf("Enter new GC score: ");
	 GCstr = mydoubleinput();
	 printf("Old AT score: %f\n", ATstr);
	 printf("Enter new AT score: ");
	 ATstr = mydoubleinput();
	 printf("GT score: %f\n", GTstr);
	 printf("Enter new GT score: ");
	 GTstr = mydoubleinput();
	 printf("Mismatch/bulge score: %f\n", MBstr);
	 printf("Enter new MB score: ");
	 MBstr = mydoubleinput();
	 printf("Larger loop score (per extra base): %f\n", LLstr);
	 printf("Enter new LL score: ");
	 LLstr = mydoubleinput();
	 printf("Penalty for pairing at ends of domains: %f\n", DHstr);
	 printf("Enter new EP score: ");
	 DHstr = mydoubleinput();
	 printf("Max importance: %d\n", MAX_IMPORTANCE);
	 printf("Enter new Max Importance: ");
	 MAX_IMPORTANCE = myintinput();
	 printf("Number of bases before exponential score kicks in: %d\n", LHbases);
	 printf("Enter new LH bases: ");
	 LHbases = myintinput();
	 printf("Exponential score initial: %f\n", LHstart);
	 printf("Enter new LH initial score: ");
	 LHstart = mydoubleinput();
	 printf("Exponential score power: %f\n", LHpower);
	 printf("Enter new LH power: ");
	 LHpower = mydoubleinput();
	 printf("Intra-domain bonus score: %f\n", INTRA_SCORE);
	 printf("Enter new Intra-domain score: ");
	 INTRA_SCORE = mydoubleinput();
	 printf("Crosstalk bonus score: %f\n", CROSSTALK_SCORE);
	 printf("Enter new Crosstalk score: ");
	 CROSSTALK_SCORE = mydoubleinput();
	 printf("Crosstalk score divide factor: %f\n", CROSSTALK_DIV);
	 printf("Enter new crosstalk divisor: ");
	 CROSSTALK_DIV = mydoubleinput();
	 printf("GGGG score: %f\n", GGGG_PENALTY);
	 printf("Enter new GGGG score: ");
	 GGGG_PENALTY = mydoubleinput();
	 printf("6 consecutive A/T or G/C score: %f\n", ATATAT_PENALTY);
	 printf("Enter new 6 consecutive type score: ");
	 ATATAT_PENALTY = mydoubleinput();
	 }
	 }

	 if (tempchar == ' ')
	 doneflag = 1;
	 }

	 // Lock old domains, if option selected

	 if (rule_lockold == 1) {
	 for (i = 0; i < num_domain; i++) {
	 for (j = 0; j < domain_length[i]; j++) {
	 if (domain[i][j] < 10)
	 domain[i][j] = domain[i][j] + 10;
	 }
	 }
	 }

	 // Generate starting domain sequences for new domains
	 // 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

	 for (i = num_domain; i < num_domain+num_new_domain; i++) {
	 domain_gatc_avail[i] = rule_gatc_avail;
	 for (j = 0; j < domain_length[i]; j++) {
	 domain[i][j] = 0;
	 while (domain[i][j] == 0) {
	 k = int_urn(1,4);
	 if ((k == 4)&&(rule_init/8 == 1))
	 domain[i][j] = 1;
	 if ((k == 3)&&((rule_init / 4) % 2 == 1))
	 domain[i][j] = 2;
	 if ((k == 2)&&((rule_init / 2) % 2 == 1))
	 domain[i][j] = 3;
	 if ((k == 1)&&(rule_init % 2 == 1))
	 domain[i][j] = 4;
	 }
	 }

	 if (rule_ccend == 1) {
	 if (rule_gatc_avail % 2 == 1)
	 domain[i][0] = 14;
	 else if (rule_gatc_avail / 8 == 1)
	 domain[i][0] = 11;
	 else if ((rule_gatc_avail / 2) % 2 == 1)
	 domain[i][0] = 13;
	 else
	 domain[i][0] = 12;

	 if (rule_gatc_avail % 2  == 1)
	 domain[i][domain_length[i]-1] = 14;
	 else if (rule_gatc_avail / 8 == 1)
	 domain[i][domain_length[i]-1] = 11;
	 else if ((rule_gatc_avail / 4) % 2 == 1)
	 domain[i][domain_length[i]-1] = 12;
	 else
	 domain[i][domain_length[i]-1] = 13;
	 }
	 }

	 // Adjust num_domain to be total domains
	 num_domain = num_domain + num_new_domain;

	 }
	 //*/

	function newDesign(domainCount,domainLengths) {
		num_domain = domainCount;

		// Starting new design
		// Initialize arrays
		if ((domain = new Array(num_domain  /* int* */)) == null) {
			console.error("Insufficient memory for declaring domain pointers!\n");
			throw 'Error';
		}

		if ((domain_length = new Array(num_domain  /* int */)) == null) {
			console.error("Insufficient memory for declaring domain lengths!\n");
			throw 'Error';
		}

		if ((domain_gatc_avail = new Array(num_domain  /* int */)) == null) {
			console.error("Insufficient memory for declaring domain base availability!\n");
			throw 'Error';
		}

		if ((domain_importance = new Array(num_domain  /* int */)) == null) {
			console.error("Insufficient memory for declaring domain importances!\n");
			throw 'Error';
		}

		// Generate lengths array
		if(_.isArray(domainLengths)) {
			domain_length = domainLengths;
		} else {
			domainLengths || (domainLengths = 7);
			for(i=0;i<num_domain;i++) {
				domain_length[i] = domainLengths;
			}
		}

		for (i = 0; i < num_domain; i++) {
			if ((domain[i] = new Array(domain_length[i]  /* int */)) == null) {
				console.error("Insufficient memory for declaring domain bases!\n");
				throw 'Error';
			}
			domain_importance[i] = 1;
		}

		rule_4g = 1; // cannot have 4 G's or 4 C's in a row
		rule_6at = 1; // cannot have 6 A/T bases in a row
		rule_ccend = 1; // domains MUST start and end with C
		rule_ming = 1; // design tries to minimize usage of G
		rule_init = 7; // 1 = polyN, 2 = poly-H, 3 = poly-Y, 4 = poly-T
		rule_targetworst = 1; // target worst domains for mutation
		rule_gatc_avail = 15; // all flags set (bases available)
		doneflag = 0;

		// old parameters routine
		/*
		 while (doneflag == 0) {
		 clrscr();
		 printf("Design Options:\n");

		 printf("\n1. Prevent 4 G's and 4 C's in a row: ");
		 if (rule_4g)
		 printf("Y");
		 else
		 printf("N");

		 printf("\n2. Prevent 6 A/T bases in a row and 6 G/C bases in a row: ");
		 if (rule_6at)
		 printf("Y");
		 else
		 printf("N");

		 printf("\n3. Domains must start and end with C: ");
		 if (rule_ccend)
		 printf("Y");
		 else
		 printf("N");

		 printf("\n4. Minimize G's in domain design: ");
		 if (rule_ming)
		 printf("Y");
		 else
		 printf("N");

		 printf("\n5. Target worst domain for mutations: ");
		 if (rule_targetworst)
		 printf("Y");
		 else
		 printf("N");

		 printf("\n6. Constrain bases in domains: ");
		 if (rule_gatc_avail == 15)
		 printf("N");
		 else {
		 if (rule_gatc_avail / 8 == 1)
		 printf("G");
		 if ((rule_gatc_avail / 4) % 2 == 1)
		 printf("A");
		 if ((rule_gatc_avail / 2) % 2 == 1)
		 printf("T");
		 if (rule_gatc_avail % 2 == 1)
		 printf("C");

		 printf(" only");
		 }

		 printf("\n7. Constrain initial domain sequences: ");
		 if (rule_init == 15)
		 printf("N");
		 else {
		 if (rule_init / 8 == 1)
		 printf("G");
		 if ((rule_init / 4) % 2 == 1)
		 printf("A");
		 if ((rule_init / 2) % 2 == 1)
		 printf("T");
		 if (rule_init % 2 == 1)
		 printf("C");

		 printf(" only");
		 }

		 printf("\n\n\033[1;31;47m0.\033[0;30;47m Tweak score parameters");

		 printf("\n\n\nChange which option?  Press space when done.");

		 tempchar = myhotinput(9, '1', '2', '3', '4', '5', '6', '7', '0', ' ');

		 if (tempchar == '1') {
		 if (rule_4g == 1)
		 rule_4g = 0;
		 else
		 rule_4g = 1;
		 }

		 if (tempchar == '2') {
		 if (rule_6at == 1)
		 rule_6at = 0;
		 else
		 rule_6at = 1;
		 }

		 if (tempchar == '3') {
		 if (rule_ccend == 1)
		 rule_ccend = 0;
		 else
		 rule_ccend = 1;
		 }

		 if (tempchar == '4') {
		 if (rule_ming == 1)
		 rule_ming = 0;
		 else
		 rule_ming = 1;
		 }

		 if (tempchar == '5') {
		 if (rule_targetworst == 1)
		 rule_targetworst = 0;
		 else
		 rule_targetworst = 1;
		 }

		 if (tempchar == '6') {
		 rule_gatc_avail = 0;
		 while (rule_gatc_avail == 0) {
		 printf("Allow G? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_gatc_avail = rule_gatc_avail + 8;
		 printf("Allow A? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_gatc_avail = rule_gatc_avail + 4;
		 printf("Allow T? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_gatc_avail = rule_gatc_avail + 2;
		 printf("Allow C? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_gatc_avail = rule_gatc_avail + 1;
		 if (rule_gatc_avail == 0) {
		 printf("Some bases must be allowed!  Press space to start over.");
		 tempchar = myhotinput(1, ' ');
		 }
		 }
		 rule_init = (rule_init & rule_gatc_avail);
		 if (rule_init == 0)
		 rule_init = rule_gatc_avail;
		 }

		 if (tempchar == '7') {
		 rule_init = 0;
		 while (rule_init == 0) {
		 if (rule_gatc_avail / 8 == 1) {
		 printf("Allow G? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_init = rule_init + 8;
		 }
		 if ((rule_gatc_avail / 4) % 2 == 1) {
		 printf("Allow A? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_init = rule_init + 4;
		 }
		 if ((rule_gatc_avail / 2) % 2 == 1) {
		 printf("Allow T? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_init = rule_init + 2;
		 }
		 if (rule_gatc_avail %2 == 1) {
		 printf("Allow C? ");
		 tempchar = myhotinput(2, 'Y', 'N');
		 if (tempchar == 'Y')
		 rule_init = rule_init + 1;
		 }
		 if (rule_init == 0) {
		 printf("Some bases must be allowed!  Press space to start over.");
		 tempchar = myhotinput(1, ' ');
		 }
		 }
		 }

		 function scoreParameters() {
		 // Adjust score parameters
		 printf("Only do this if you're sure you know what you're doing!\n");
		 printf("Press (@) to continue editing or space to return to previous menu\n");
		 tempchar2 = myhotinput(2, '@', ' ');
		 if (tempchar2 == '@') {
		 clrscr();
		 printf("Old GC score: %f\n", GCstr);
		 printf("Enter new GC score: ");
		 GCstr = mydoubleinput();
		 printf("Old AT score: %f\n", ATstr);
		 printf("Enter new AT score: ");
		 ATstr = mydoubleinput();
		 printf("GT score: %f\n", GTstr);
		 printf("Enter new GT score: ");
		 GTstr = mydoubleinput();
		 printf("Mismatch/bulge score: %f\n", MBstr);
		 printf("Enter new MB score: ");
		 MBstr = mydoubleinput();
		 printf("Larger loop score (per extra base): %f\n", LLstr);
		 printf("Enter new LL score: ");
		 LLstr = mydoubleinput();
		 printf("Penalty for pairing at ends of domains: %f\n", DHstr);
		 printf("Enter new EP score: ");
		 DHstr = mydoubleinput();
		 printf("Max importance: %d\n", MAX_IMPORTANCE);
		 printf("Enter new Max Importance: ");
		 MAX_IMPORTANCE = myintinput();
		 printf("Number of bases before exponential score kicks in: %d\n", LHbases);
		 printf("Enter new LH bases: ");
		 LHbases = myintinput();
		 printf("Exponential score initial: %f\n", LHstart);
		 printf("Enter new LH initial score: ");
		 LHstart = mydoubleinput();
		 printf("Exponential score power: %f\n", LHpower);
		 printf("Enter new LH power: ");
		 LHpower = mydoubleinput();
		 printf("Intra-domain bonus score: %f\n", INTRA_SCORE);
		 printf("Enter new Intra-domain score: ");
		 INTRA_SCORE = mydoubleinput();
		 printf("Crosstalk bonus score: %f\n", CROSSTALK_SCORE);
		 printf("Enter new Crosstalk score: ");
		 CROSSTALK_SCORE = mydoubleinput();
		 printf("Crosstalk score divide factor: %f\n", CROSSTALK_DIV);
		 printf("Enter new crosstalk divisor: ");
		 CROSSTALK_DIV = mydoubleinput();
		 printf("GGGG score: %f\n", GGGG_PENALTY);
		 printf("Enter new GGGG score: ");
		 GGGG_PENALTY = mydoubleinput();
		 printf("6 consecutive A/T or G/C score: %f\n", ATATAT_PENALTY);
		 printf("Enter new 6 consecutive type score: ");
		 ATATAT_PENALTY = mydoubleinput();
		 }
		 }

		 if (tempchar == ' ')
		 doneflag = 1;
		 }
		 // */

		setupScoreMatricies();

		startingDomainSequences();
	}

	function setupScoreMatricies() {
		// Set up domain score matrix
		if ((domain_score = new Array(num_domain  /* double */)) == null) {
			console.error("Insufficient memory for declaring domain score matrix!\n");
			throw 'Error';
		}

		if ((domain_intrinsic = new Array(num_domain  /* double */)) == null) {
			console.error("Insufficient memory for declaring domain score matrix!\n");
			throw 'Error';
		}

		// Set up crosstalk and interaction matrices
		if ((crosstalk = new Array(num_domain  /* double* */)) == null) {
			console.error("Insufficient memory for declaring crosstalk matrices!\n");
			throw 'Error';
		}

		for (i = 0; i < num_domain; i++) {
			if ((crosstalk[i] = new Array(num_domain  /* double */)) == null) {
				console.error("Insufficient memory for declaring crosstalk matrices!\n");
				throw 'Error';
			}
		}

		if ((interaction = new Array(num_domain  /* double* */)) == null) {
			console.error("Insufficient memory for declaring interaction matrices!\n");
			throw 'Error';
		}

		for (i = 0; i < num_domain; i++) {
			if ((interaction[i] = new Array(num_domain  /* double */)) == null) {
				console.error("Insufficient memory for declaring interaction matrices!\n");
				throw 'Error';
			}
		}
	}

	/**
	 * Seed domains with new sequences according to base composition rules
	 */
	function startingDomainSequences() {

		// Generate starting domain sequences
		// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

		for (i = 0; i < num_domain; i++) {
			domain_gatc_avail[i] = rule_gatc_avail;
			for (j = 0; j < domain_length[i]; j++) {
				domain[i][j] = 0;
				while (domain[i][j] == 0) {
					k = int_urn(1,4);
					if ((k == 4)&&(Math.floor(rule_init/8) == 1))
						domain[i][j] = 1;
					if ((k == 3)&&(Math.floor(rule_init / 4) % 2 == 1))
						domain[i][j] = 2;
					if ((k == 2)&&(Math.floor(rule_init / 2) % 2 == 1))
						domain[i][j] = 3;
					if ((k == 1)&&(Math.floor(rule_init % 2) == 1))
						domain[i][j] = 4;
				}
			}

			if (rule_ccend == 1) {
				if (Math.floor(rule_gatc_avail % 2) == 1)
					domain[i][0] = 14;
				else if (Math.floor(rule_gatc_avail / 8) == 1)
					domain[i][0] = 11;
				else if (Math.floor(rule_gatc_avail / 2) % 2 == 1)
					domain[i][0] = 13;
				else
					domain[i][0] = 12;

				if (rule_gatc_avail % 2  == 1)
					domain[i][domain_length[i]-1] = 14;
				else if (Math.floor(rule_gatc_avail / 8) == 1)
					domain[i][domain_length[i]-1] = 11;
				else if (Math.floor(rule_gatc_avail / 4) % 2 == 1)
					domain[i][domain_length[i]-1] = 12;
				else
					domain[i][domain_length[i]-1] = 13;
			}
		}
	}

	function randomSequence(doms,len) {
		var out = new Array(doms);

		// Generate starting domain sequences
		// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc

		for (i = 0; i < doms; i++) {
			out[i] = new Array(len);
			for (j = 0; j < len; j++) {
				out[i][j] = 0;
				while (out[i][j] == 0) {
					k = int_urn(1,4);
					if ((k == 4)&&(Math.floor(rule_init/8) == 1))
						out[i][j] = 1;
					if ((k == 3)&&(Math.floor(rule_init / 4) % 2 == 1))
						out[i][j] = 2;
					if ((k == 2)&&(Math.floor(rule_init / 2) % 2 == 1))
						out[i][j] = 3;
					if ((k == 1)&&(Math.floor(rule_init % 2) == 1))
						out[i][j] = 4;
				}
			}

			if (rule_ccend == 1) {
				if (Math.floor(rule_gatc_avail % 2) == 1)
					out[i][0] = 14;
				else if (Math.floor(rule_gatc_avail / 8) == 1)
					out[i][0] = 11;
				else if (Math.floor(rule_gatc_avail / 2) % 2 == 1)
					out[i][0] = 13;
				else
					out[i][0] = 12;

				if (rule_gatc_avail % 2  == 1)
					out[i][len-1] = 14;
				else if (Math.floor(rule_gatc_avail / 8) == 1)
					out[i][len-1] = 11;
				else if (Math.floor(rule_gatc_avail / 4) % 2 == 1)
					out[i][len-1] = 12;
				else
					out[i][len-1] = 13;
			}
		}
		return out;
	}

	/*
	 // // Initial display
	 // clrscr();
	 //
	 // printf("Domain");
	 // fflush(stdout);
	 // gotoxy(30, 1);
	 // printf("Sequence");
	 // fflush(stdout);
	 // gotoxy(65, 1);
	 // printf("Imp.");
	 // fflush(stdout);
	 // gotoxy(70, 1);
	 // printf("Comp.");
	 // fflush(stdout);
	 // gotoxy(76, 1);
	 // printf("Score");
	 // fflush(stdout);
	 //
	 // gotoxy(5, 2);
	 // printf("0         1         2         3         4         5         6\n");
	 // gotoxy(6, 3);
	 // printf("123456789012345678901234567890123456789012345678901234567890\n");
	 //fflush(stdout);

	 // for (i = 0; i < num_domain; i++) {
	 // gotoxy(1, 5+i);
	 // printf("%d", (i+1));
	 // fflush(stdout);
	 // gotoxy(6, 5+i);
	 // for (j = 0; j < domain_length[i]; j++)
	 // displayBase(domain[i][j]);
	 // gotoxy(67, 5+i);
	 // printf("%d", domain_importance[i]);
	 // }
	 //
	 // // Display compositions
	 // for (i = 0; i < num_domain; i++) {
	 // gotoxy(71, 5+i);
	 // if (domain_gatc_avail[i] == 15)
	 // printf("N");
	 // else {
	 // if (domain_gatc_avail[i] / 8 == 1)
	 // printf("G");
	 // if ((domain_gatc_avail[i] / 4) % 2 == 1)
	 // printf("A");
	 // if ((domain_gatc_avail[i] / 2) % 2 == 1)
	 // printf("T");
	 // if (domain_gatc_avail[i] % 2 == 1)
	 // printf("C");
	 // }
	 // }
	 */

	pausemode = 1;
	doneflag = 0;
	num_mut_attempts = 0;
	total_mutations = 0;
	num_mut = 0;

	// Main loop

	// while (1) {
	// mutate();
	// }

	// Pause mode, starts here
	function pause() {
		gotoxy(1, 7+num_domain);
		printf("Modify (D)omains, modify (B)ases, (S)ave current sequences,\n");
		printf("(E)valuate scores, e(X)it, (!) Reseed all domains, or press space to continue:   \n");
		movexy(0, -1);
		printf("(E)valuate scores, e(X)it, (!) Reseed all domains, or press space to continue:   \n");
		tempchar = myhotinput(6, 'D', 'B', 'S', 'E', '!', ' ');

		if (tempchar == ' ')
			pausemode = 0;

		function modifyBases() {
			printf("Modify which domain? ");
			i = myintinput();
			if ((i < 1)||(i > num_domain)) {
				printf("Please select a domain listed, between 1 and %d.\n", num_domain);
				movexy(0, -2);
				printf("Modify which domain?                  \n");
				movexy(0, -1);
				printf("Modify which domain? ");
				i = myintinput();
				printf("                                             \n");
				movexy(0,-1);
			}
			printf("Modify which base? ");
			j = myintinput();
			if ((j < 1)||(j > domain_length[i-1])) {
				printf("Please select a base index on domain %d between 1 and %d.\n", i, domain_length[i-1]);
				movexy(0, -2);
				printf("Modify which base?          \n");
				movexy(1, -1);
				printf("Modify which base? ");
				j = myintinput();
				printf("                                                                     \n");
				movexy(0,-1);
			}

			i = i - 1; // mod to yield correct index
			j = j - 1; //

			printf("Currently, the base is ");
			displayBase(domain[i][j]);
			if (domain[i][j] > 10)
				printf(", and the base is locked.\n");
			else
				printf(".\n");
			printf("Change the base to (G/A/T/C), (L)ock/unlock the base, or press space to cancel: ");
			tempchar = myhotinput(6, 'G', 'A', 'T', 'C', 'L', ' ');
			if (tempchar == 'G') {
				if (domain[i][j] > 10)
					domain[i][j] = 11;
				else
					domain[i][j] = 1;
			} else if (tempchar == 'A') {
				if (domain[i][j] > 10)
					domain[i][j] = 12;
				else
					domain[i][j] = 2;
			} else if (tempchar == 'T') {
				if (domain[i][j] > 10)
					domain[i][j] = 13;
				else
					domain[i][j] = 3;
			} else if (tempchar == 'C') {
				if (domain[i][j] > 10)
					domain[i][j] = 14;
				else
					domain[i][j] = 4;
			} else if (tempchar == 'L') {
				if (domain[i][j] > 10)
					domain[i][j] = domain[i][j] - 10;
				else
					domain[i][j] = domain[i][j] + 10;
			}

			gotoxy(6+j, 5+i);
			displayBase(domain[i][j]);

			gotoxy(1, 8+num_domain);
			for (i = 0; i < 10; i ++) {
				for (j = 0; j < SCREENWIDTH; j++)
					printf(" ");
				printf("\n");
			}
		}

		function resetSequences() {
			printf("Doing this will reset ALL sequences (other than locked bases)!\n");
			printf("Press (@) to continue editing or space to return to previous menu\n");
			tempchar2 = myhotinput(2, '@', ' ');
			if (tempchar2 == '@') {
				for (i = 0; i < num_domain; i++) {
					for (j = 0; j < domain_length[i]; j++) {
						if (domain[i][j] < 10) {
							domain[i][j] = 0;
							while (domain[i][j] == 0) {
								k = int_urn(1,4);
								if ((k == 4)&&(rule_init/8 == 1))
									domain[i][j] = 1;
								if ((k == 3)&&((rule_init / 4) % 2 == 1))
									domain[i][j] = 2;
								if ((k == 2)&&((rule_init / 2) % 2 == 1))
									domain[i][j] = 3;
								if ((k == 1)&&(rule_init % 2 == 1))
									domain[i][j] = 4;
							}
						}
					}

					if (rule_ccend == 1) {
						if (domain_gatc_avail[i] % 2 == 1)
							domain[i][0] = 14;
						else if (domain_gatc_avail[i] / 8 == 1)
							domain[i][0] = 11;
						else if ((domain_gatc_avail[i] / 2) % 2 == 1)
							domain[i][0] = 13;
						else
							domain[i][0] = 12;

						if (domain_gatc_avail[i] % 2  == 1)
							domain[i][domain_length[i]-1] = 14;
						else if (domain_gatc_avail[i] / 8 == 1)
							domain[i][domain_length[i]-1] = 11;
						else if ((domain_gatc_avail[i] / 4) % 2 == 1)
							domain[i][domain_length[i]-1] = 12;
						else
							domain[i][domain_length[i]-1] = 13;
					}
					gotoxy(6, 5+i);
					for (j = 0; j < domain_length[i]; j++)
						displayBase(domain[i][j]);
				}
			}
			gotoxy(1, 8+num_domain);
			printf("                                                                      \n");
			printf("                                                                      \n");
			printf("                                                                      \n");
			printf("                                                                      \n");
			printf("                                                                      \n");
			gotoxy(1, 8+num_domain);
		}

		function modifyDomains() {
			printf("Modify which domain? ");
			i = myintinput();
			if ((i < 1)||(i > num_domain)) {
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
			i = i - 1; // mod to yield correct index
			for (j = 0; j < domain_length[i]; j++)
				displayBase(domain[i][j]);
			printf("\n(L)ock or (U)nlock all bases in domain, change (I)mportance, (C)hange base composition of domain,\n");
			printf("(!) Reseed domain with random sequence, or press space to cancel: ");

			tempchar = myhotinput(6, 'L', 'U', 'I', 'C', '!', ' ');

			if (tempchar == 'L') {
				for (j = 0; j < domain_length[i]; j++) {
					if (domain[i][j] < 10)
						domain[i][j] = domain[i][j] + 10;
				}
				gotoxy(6, 5+i);
				for (j = 0; j < domain_length[i]; j++)
					displayBase(domain[i][j]);
			} else if (tempchar == 'U') {
				for (j = 0; j < domain_length[i]; j++) {
					if (domain[i][j] > 10)
						domain[i][j] = domain[i][j] - 10;
				}
				gotoxy(6, 5+i);
				for (j = 0; j < domain_length[i]; j++)
					displayBase(domain[i][j]);
			} else if (tempchar == 'I') {

				printf("Enter new importance (must be integer, higher means more important): ");
				j = myintinput();
				if ((j < 1)||(j > MAX_IMPORTANCE)) {
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
				gotoxy(67, 5+i);
				printf("%d", domain_importance[i]);
			} else if (tempchar == 'C') {
				// Change base composition
				printf("Currently, domain %d has base composition ", (i+1));
				if (domain_gatc_avail[i] == 15)
					printf("N");
				else {
					if (domain_gatc_avail[i] / 8 == 1)
						printf("G");
					if ((domain_gatc_avail[i] / 4) % 2 == 1)
						printf("A");
					if ((domain_gatc_avail[i] / 2) % 2 == 1)
						printf("T");
					if (domain_gatc_avail[i] % 2 == 1)
						printf("C");
				}
				printf(".\n");

				domain_gatc_avail[i] = 0;
				while (domain_gatc_avail[i] == 0) {
					printf("Allow G? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if (tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 8;
					printf("Allow A? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if (tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 4;
					printf("Allow T? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if (tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 2;
					printf("Allow C? ");
					tempchar = myhotinput(2, 'Y', 'N');
					if (tempchar == 'Y')
						domain_gatc_avail[i] = domain_gatc_avail[i] + 1;
					if (domain_gatc_avail[i] == 0) {
						printf("Some bases must be allowed!  Press space to start over.");
						tempchar = myhotinput(1, ' ');
						movexy(0, -6);
						for (j = 0; j < 6; j++) {
							for (k = 0; k < SCREENWIDTH; k++)
								printf(" ");
							printf("\n");
						}
						movexy(0, -6);
					}
				}

				gotoxy(71, 5+i);
				printf("   ");
				gotoxy(71, 5+i);
				if (domain_gatc_avail[i] == 15)
					printf("N");
				else {
					if (domain_gatc_avail[i] / 8 == 1)
						printf("G");
					if ((domain_gatc_avail[i] / 4) % 2 == 1)
						printf("A");
					if ((domain_gatc_avail[i] / 2) % 2 == 1)
						printf("T");
					if (domain_gatc_avail[i] % 2 == 1)
						printf("C");
				}
			} else if (tempchar == '!') {
				// Reseed domain with entirely new sequence
				printf("Warning!  Current sequence for domain %d will be lost, except for locked bases!\n", (i+1));
				printf("Really reseed domain with entirely new sequence? ");
				tempchar = myhotinput(2, 'Y', 'N');
				if (tempchar == 'Y') {
					for (j = 0; j < domain_length[i]; j++) {
						if (domain[i][j] < 10) {
							domain[i][j] = 0;
							while (domain[i][j] == 0) {
								k = int_urn(1,4);
								if ((k == 4)&&(rule_init/8 == 1))
									domain[i][j] = 1;
								if ((k == 3)&&((rule_init / 4) % 2 == 1))
									domain[i][j] = 2;
								if ((k == 2)&&((rule_init / 2) % 2 == 1))
									domain[i][j] = 3;
								if ((k == 1)&&(rule_init % 2 == 1))
									domain[i][j] = 4;
							}
						}
					}

					if (rule_ccend == 1) {
						if (domain_gatc_avail[i] % 2 == 1)
							domain[i][0] = 14;
						else if (domain_gatc_avail[i] / 8 == 1)
							domain[i][0] = 11;
						else if ((domain_gatc_avail[i] / 2) % 2 == 1)
							domain[i][0] = 13;
						else
							domain[i][0] = 12;

						if (domain_gatc_avail[i] % 2  == 1)
							domain[i][domain_length[i]-1] = 14;
						else if (domain_gatc_avail[i] / 8 == 1)
							domain[i][domain_length[i]-1] = 11;
						else if ((domain_gatc_avail[i] / 4) % 2 == 1)
							domain[i][domain_length[i]-1] = 12;
						else
							domain[i][domain_length[i]-1] = 13;
					}
					gotoxy(6, 5+i);
					for (j = 0; j < domain_length[i]; j++)
						displayBase(domain[i][j]);
				}
			}

			gotoxy(1, 8+num_domain);
			for (i = 0; i < 10; i ++) {
				for (j = 0; j < SCREENWIDTH; j++)
					printf(" ");
				printf("\n");
			}
		}

	}

	function save() {

		var out = ''
		out+=sprintf( "%d\n", num_domain);

		for (i = 0; i < num_domain; i++) {
			for (j = 0; j < domain_length[i]; j++) {
				if (domain[i][j] == 1)
					out+=sprintf( "g");
				if (domain[i][j] == 11)
					out+=sprintf( "G");
				if (domain[i][j] == 2)
					out+=sprintf( "a");
				if (domain[i][j] == 12)
					out+=sprintf( "A");
				if (domain[i][j] == 3)
					out+=sprintf( "t");
				if (domain[i][j] == 13)
					out+=sprintf( "T");
				if (domain[i][j] == 4)
					out+=sprintf( "c");
				if (domain[i][j] == 14)
					out+=sprintf( "C");
			}
			out+=sprintf( " %d %d\n", domain_importance[i], domain_gatc_avail[i]);
		}
	}

	// Evaluate current scores
	function evaluateAllScores() {

		// Calculate interaction (pairscore) and crosstalk (selfcrosstalk) of each domain
		for (i = 0; i < num_domain; i++) {
			for (j = 0; j < num_domain; j++) {
				if (i == j) {
					interaction[i][j] = pairscore(domain[i], domain_length[i], domain[j], domain_length[j]) + INTRA_SCORE;
					crosstalk[i][j] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
				} else {
					interaction[i][j] = pairscore(domain[i], domain_length[i], domain[j], domain_length[j]);
					for (k = 0; k < domain_length[j]; k++)
						temp_domain[k] = 15 - domain[j][(domain_length[j])-1-k];
					crosstalk[i][j] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[j]) / CROSSTALK_DIV;
				}
			}
		}

		for (i = 0; i < num_domain; i++)
			domain_intrinsic[i] = 0;

		// Search for 4g, if rule applied
		if (rule_4g == 1) {

			for (i = 0; i < num_domain; i++) {
				k = 0; // G-C counter
				for (j = 0; j < domain_length[i]; j++) {

					if ((domain[i][j] % 10 == 1)&&(k < 100))
						k++;
					else if (domain[i][j] % 10 == 1)
						k = 1;

					if ((domain[i][j] % 10 == 4)&&(k > 100))
						k++;
					else if (domain[i][j] % 10 == 4)
						k = 101;

					if ((k < 100)&&(k > 3))
						domain_intrinsic[i] = domain_intrinsic[i] + GGGG_PENALTY;
					if (k > 103)
						domain_intrinsic[i] = domain_intrinsic[i] + GGGG_PENALTY;
				}
			}
		}

		// Search for 6at, if rule applied
		if (rule_6at == 1) {
			for (i = 0; i < num_domain; i++) {
				k = 0; // AT counter
				for (j = 0; j < domain_length[i]; j++) {
					if ((domain[i][j] % 10 == 2)||(domain[i][j] % 10 == 3))
						k++;
					else
						k = 0;
					if (k > 5)
						domain_intrinsic[i] = domain_intrinsic[i] + ATATAT_PENALTY;
				}

				k = 0; // GC counter
				for (j = 0; j < domain_length[i]; j++) {
					if ((domain[i][j] % 10 == 1)||(domain[i][j] % 10 == 4))
						k++;
					else
						k = 0;
					if (k > 5)
						domain_intrinsic[i] = domain_intrinsic[i] + ATATAT_PENALTY;
				}
			}
		}

		// Domain score is max of interaction and crosstalk scores
		score = 0;
		for (i = 0; i < num_domain; i++) {
			domain_score[i] = 0;
			for (j = 0; j < num_domain; j++) {
				if (interaction[i][j] + domain_importance[i] + domain_importance[j] > domain_score[i])
					domain_score[i] = interaction[i][j] + domain_importance[i] + domain_importance[j];
				if (crosstalk[i][j] + domain_importance[i] + domain_importance[j] + CROSSTALK_SCORE > domain_score[i])
					domain_score[i] = crosstalk[i][j] + domain_importance[i] + domain_importance[j] + CROSSTALK_SCORE;
			}
			//	  domain_score[i] = domain_score[i] + domain_intrinsic[i] + (double) (i+1) * 0.000001;
			domain_score[i] = domain_score[i] + domain_intrinsic[i] + (i+1); // * 0.000001;
			if (domain_score[i] > score) {
				score = domain_score[i];
				worst_domain = i;
			}
		}

		// TODO: Display domain scores:
		// for (i = 0; i < num_domain; i++) {
		// gotoxy(75, 5+i);
		// printf("                   ");
		// fflush(stdout);
		// gotoxy(75, 5+i);
		// printf("%f", domain_score[i]);
		// fflush(stdout);
		// }
		// gotoxy(75, 7+num_domain);
		// printf("                           ");
		// gotoxy(75, 7+num_domain);
		// printf("%f", score);
	}

	// Process mode
	/*
	gotoxy(1, 7+num_domain);
	for (i = 0; i < 3; i++) {
	for (j = 0; j < SCREENWIDTH; j++)
	printf(" ");
	printf("\n");
	}
	gotoxy(1, 7+num_domain);
	printf("Optimizing domains.. Press space for user intervention.\n");

	nonblock(NB_ENABLE);
	*/

	/**
	 * Populates domain_score for each domain 0...num_domain
	 * domain_score[i] = max(weighted interaction score , weighted crosstalk score) + intrinsic score
	 */
	function tallyScores() {
		for (i = 0; i < num_domain; i++) {
			domain_score[i] = 0;
			for (j = 0; j < num_domain; j++) {
				if (interaction[i][j] + domain_importance[i] + domain_importance[j] > domain_score[i])
					domain_score[i] = interaction[i][j] + domain_importance[i] + domain_importance[j];
				if (crosstalk[i][j] + domain_importance[i] + domain_importance[j] + CROSSTALK_SCORE > domain_score[i])
					domain_score[i] = crosstalk[i][j] + domain_importance[i] + domain_importance[j] + CROSSTALK_SCORE;
			}
			//  domain_score[i] = domain_score[i] + domain_intrinsic[i] + (double) (i+1) * 0.000001;
			domain_score[i] = domain_score[i] + domain_intrinsic[i]; //+ (i+1) * 0.000001;
			if (domain_score[i] > score) {
				score = domain_score[i];
				worst_domain = i;
			}
		}
	}

	function mutate() {
		num_mut_attempts++;

		// gotoxy(1, 11+num_domain);
		// printf("Attempts: %d", num_mut_attempts);
		// gotoxy(30, 11+num_domain);
		// printf("Mutations: %d", total_mutations);

		/******************************
		 * Perform mutations
		 ******************************/

		// Stochastically determine how many mutations to apply
		num_mut = 0;
		while ((num_mut < MAX_MUTATIONS-1)&&(int_urn(0,1) == 1))
			num_mut++;

		num_mut++;

		// Select target domain for mutations
		// One third of all mutations are in "worst" domain if rule_targetworst active
		if (rule_targetworst) {
			if (int_urn(1,3) == 1) {
				mut_domain = worst_domain ? worst_domain : int_urn(0, num_domain-1);
			} else {
				mut_domain = int_urn(0, num_domain-1); // select a domain to mutate
			}
		} else {
			mut_domain = int_urn(0, num_domain-1); // select a domain to mutate
		}

		// Perform num_mut mutations on domain mut_domain
		for (k = 0; k < num_mut; k++) {

			// Attempt a mutation
			j = int_urn(0, (domain_length[mut_domain])-1); // select a base to mutate

			if (domain[mut_domain][j] > 10) {

				// Base immutable
				mut_base[k] = j;
				mut_old[k] = domain[mut_domain][j];
				mut_new[k] = mut_old[k];
			} else {

				// Base is mutable
				mut_base[k] = j;
				mut_old[k] = domain[mut_domain][j];

				// hack to not mutate bases constrained to only 1 base
				if ((domain_gatc_avail[mut_domain] & 1)+(domain_gatc_avail[mut_domain] & 2)/2+(domain_gatc_avail[mut_domain] & 4)/4+(domain_gatc_avail[mut_domain] & 8)/8 > 1) {
					if (rule_ming) {
						// Minimize G rule active
						do {
							mut_new[k] = int_urn(1,100);
							if (mut_new[k] < 5)
								mut_new[k] = 1;
							else if (mut_new[k] < 37)
								mut_new[k] = 2;
							else if (mut_new[k] < 69)
								mut_new[k] = 3;
							else
								mut_new[k] = 4;
							// Undo mutation if new base is not allowed
							if ((mut_new[k] == 1)&&(domain_gatc_avail[mut_domain] / 8 == 0))
								mut_new[k] = mut_old[k];
							if ((mut_new[k] == 2)&&((domain_gatc_avail[mut_domain] / 4)%2 == 0))
								mut_new[k] = mut_old[k];
							if ((mut_new[k] == 3)&&((domain_gatc_avail[mut_domain] / 2)%2 == 0))
								mut_new[k] = mut_old[k];
							if ((mut_new[k] == 4)&&(domain_gatc_avail[mut_domain] % 2== 0))
								mut_new[k] = mut_old[k];

						} while (mut_new[k] == mut_old[k]);
					} else {
						// Uniform GATC mix
						do {
							mut_new[k] = int_urn(1,100);
							if (mut_new[k] < 26)
								mut_new[k] = 1;
							else if (mut_new[k] < 51)
								mut_new[k] = 2;
							else if (mut_new[k] < 76)
								mut_new[k] = 3;
							else
								mut_new[k] = 4;
							// Undo mutation if new base is not allowed
							if ((mut_new[k] == 1)&&(domain_gatc_avail[mut_domain] / 8 == 0))
								mut_new[k] = mut_old[k];
							if ((mut_new[k] == 2)&&((domain_gatc_avail[mut_domain] / 4)%2 == 0))
								mut_new[k] = mut_old[k];
							if ((mut_new[k] == 3)&&((domain_gatc_avail[mut_domain] / 2)%2 == 0))
								mut_new[k] = mut_old[k];
							if ((mut_new[k] == 4)&&(domain_gatc_avail[mut_domain] % 2== 0))
								mut_new[k] = mut_old[k];
						} while (mut_new[k] == mut_old[k]);
					}
				}
			}
		}

		// Apply mutations, calculate score after mutations
		for (k = 0; k < num_mut; k++)
			domain[mut_domain][mut_base[k]] = mut_new[k];

		/******************************
		 * Calculate new scores
		 ******************************/

		old_score = score;
		old_d_intrinsic = domain_intrinsic[mut_domain];

		// Calculate interaction (pairscore) and crosstalk (selfcrosstalk) scores between the mutated domain and each old domain
		// Update only relevant interactions and crosstalks
		for (i = 0; i < num_domain; i++) {
			if (i == mut_domain) {
				interaction[i][i] = pairscore(domain[i], domain_length[i], domain[i], domain_length[i]) + INTRA_SCORE;
				crosstalk[i][i] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
			} else {
				interaction[i][mut_domain] = pairscore(domain[i], domain_length[i], domain[mut_domain], domain_length[mut_domain]);
				interaction[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], domain[i], domain_length[i]);
				for (k = 0; k < domain_length[mut_domain]; k++)
					temp_domain[k] = 15 - domain[mut_domain][(domain_length[mut_domain])-1-k];
				crosstalk[i][mut_domain] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[mut_domain]) / CROSSTALK_DIV;
				for (k = 0; k < domain_length[i]; k++)
					temp_domain[k] = 15 - domain[i][(domain_length[i])-1-k];
				crosstalk[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], temp_domain, domain_length[i]) / CROSSTALK_DIV;
			}
		}

		domain_intrinsic[mut_domain] = 0;

		// Search for 4g, if rule applied
		if (rule_4g == 1) {
			k = 0; // G-C counter
			for (j = 0; j < domain_length[mut_domain]; j++) {

				if ((domain[mut_domain][j] % 10 == 1)&&(k < 100))
					k++;
				else if (domain[mut_domain][j] % 10 == 1)
					k = 1;

				if ((domain[mut_domain][j] % 10 == 4)&&(k > 100))
					k++;
				else if (domain[mut_domain][j] % 10 == 4)
					k = 101;

				if ((k < 100)&&(k > 3))
					domain_intrinsic[mut_domain] = domain_intrinsic[mut_domain] + GGGG_PENALTY;
				else if (k > 103)
					domain_intrinsic[mut_domain] = domain_intrinsic[mut_domain] + GGGG_PENALTY;
			}
		}

		// Search for 6at, if rule applied
		if (rule_6at == 1) {
			k = 0; // AT counter
			for (j = 0; j < domain_length[mut_domain]; j++) {
				if ((domain[mut_domain][j] % 10 == 2)||(domain[mut_domain][j] % 10 == 3))
					k++;
				else
					k = 0;
				if (k > 5)
					domain_intrinsic[mut_domain] = domain_intrinsic[mut_domain] + ATATAT_PENALTY;
			}

			k = 0; // GC counter
			for (j = 0; j < domain_length[mut_domain]; j++) {
				if ((domain[mut_domain][j] % 10 == 1)||(domain[mut_domain][j] % 10 == 4))
					k++;
				else
					k = 0;
				if (k > 5)
					domain_intrinsic[mut_domain] = domain_intrinsic[mut_domain] + ATATAT_PENALTY;

			}
		}

		// Domain score is max of interaction and crosstalk scores
		score = 0;
		tallyScores();

		// Keep mutations if score improved; 0.2 chance of keeping mutations if score is same, otherwise revert
		if (score < old_score) {

			total_mutations = total_mutations + num_mut;
			// TODO: Display new bases
			// for (k = 0; k < num_mut; k++) {
			// gotoxy(6 + mut_base[k], 5 + mut_domain);
			// displayBase(domain[mut_domain][mut_base[k]]);
			// }
			// TODO: Display domain scores:
			// for (i = 0; i < num_domain; i++) {
			// gotoxy(75, 5+i);
			// printf("                   ");
			// fflush(stdout);
			// gotoxy(75, 5+i);
			// printf("%f", domain_score[i]);
			// fflush(stdout);
			// }
			// gotoxy(75, 7+num_domain);
			// printf("                           ");
			// gotoxy(75, 7+num_domain);
			// printf("%f", score);

		} else if (score == old_score) {

			// reset mutations 80% of time when score == old_score
			if (int_urn(1,100) <= 80) {
				for (k = num_mut - 1; k >= 0; k--)
					domain[mut_domain][mut_base[k]] = mut_old[k];
				domain_intrinsic[mut_domain] = old_d_intrinsic;

				for (i = 0; i < num_domain; i++) {
					if (i == mut_domain) {
						interaction[i][i] = pairscore(domain[i], domain_length[i], domain[i], domain_length[i]) + INTRA_SCORE;
						crosstalk[i][i] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
					} else {
						interaction[i][mut_domain] = pairscore(domain[i], domain_length[i], domain[mut_domain], domain_length[mut_domain]);
						interaction[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], domain[i], domain_length[i]);

						for (k = 0; k < domain_length[mut_domain]; k++)
							temp_domain[k] = 15 - domain[mut_domain][(domain_length[mut_domain])-1-k];
						crosstalk[i][mut_domain] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[mut_domain]) / CROSSTALK_DIV;
						for (k = 0; k < domain_length[i]; k++)
							temp_domain[k] = 15 - domain[i][(domain_length[i])-1-k];
						crosstalk[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], temp_domain, domain_length[i]) / CROSSTALK_DIV;
					}
				}

				// keep mutations 20% of time when score = old_score
			} else {

				total_mutations = total_mutations + num_mut
				// TODO: Display new bases
				// for (k = 0; k < num_mut; k++) {
				// gotoxy(6 + mut_base[k], 5 + mut_domain);
				// displayBase(domain[mut_domain][mut_base[k]]);
				// }
				// TODO: Display domain scores:
				// for (i = 0; i < num_domain; i++) {
				// gotoxy(75, 5+i);
				// printf("                   ");
				// fflush(stdout);
				// gotoxy(75, 5+i);
				// printf("%f", domain_score[i]);
				// fflush(stdout);
				// }
				// gotoxy(75, 7+num_domain);
				// printf("%f", score);
			}

			//
		} else if (score > old_score) {
			score = old_score;
			for (k = num_mut-1; k >= 0; k--)
				domain[mut_domain][mut_base[k]] = mut_old[k];

			domain_intrinsic[mut_domain] = old_d_intrinsic;

			for (i = 0; i < num_domain; i++) {
				if (i == mut_domain) {
					interaction[i][i] = pairscore(domain[i], domain_length[i], domain[i], domain_length[i]) + INTRA_SCORE;
					crosstalk[i][i] = selfcrosstalk(domain[i], domain_length[i]) / CROSSTALK_DIV + INTRA_SCORE;
				} else {
					interaction[i][mut_domain] = pairscore(domain[i], domain_length[i], domain[mut_domain], domain_length[mut_domain]);
					interaction[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], domain[i], domain_length[i]);

					for (k = 0; k < domain_length[mut_domain]; k++)
						temp_domain[k] = 15 - domain[mut_domain][(domain_length[mut_domain])-1-k];
					crosstalk[i][mut_domain] = pairscore(domain[i], domain_length[i], temp_domain, domain_length[mut_domain]) / CROSSTALK_DIV;
					for (k = 0; k < domain_length[i]; k++)
						temp_domain[k] = 15 - domain[i][(domain_length[i])-1-k];
					crosstalk[mut_domain][i] = pairscore(domain[mut_domain], domain_length[mut_domain], temp_domain, domain_length[i]) / CROSSTALK_DIV;
				}
			}
		}

		// Check for keyboard hit

		// fflush(stdout);
		// if (kbhit() != 0) {
		// tempchar = fgetc(stdin);
		// if (tempchar == ' ')
		// pausemode = 1;
		// }
	}

	_.extend(this, {
		loadFile: loadFile,
		newDesign: newDesign,
		randomSequence: randomSequence,
		reseed: startingDomainSequences,
		addDomains:addDomains,
		mutate: mutate,
		evaluateAllScores: evaluateAllScores,
		popDomain: popDomain,
		updateDomain: function(domainId,seq,imp,comp) {
			seq = seq.trim();
			domain[domainId] = parseDomain(seq);
			domain_length[domainId] = seq.length;
			if(imp && imp !=0 ) {
				domain_importance[domainId] = imp;
			}
			if(comp && comp !=0 ) {
				domain_gatc_avail[domainId] = comp;
			}
		},
		getMutationAttempts: function() {
			return num_mut_attempts;
		},
		getMutationCount: function() {
			return total_mutations;
		},
		getScore: function(domainId,forceRecalc) {
			if(forceRecalc || false) {
				this.evaluateAllScores();
			}
			return domain_score[domainId];
		},
		getScores: function() {
			return domain_score;
		},
		getMutatedDomain: function () {
			return mut_domain;
		},
		getDomainCount: function() {
			return num_domain || 0;
		},
		getDomains: function() {
			return domain;
		},
		printfDomain: function(dom) {
			return _.reduce(dom, function(out,b) {
				return out+=displayBaseFormatted(b);
			},'');
		},
		printDomain: function(dom) {
			return _.reduce(dom, function(out,b) {
				return out+=displayBase(b);
			},'');
		},
		printDomainById: function(id) {
			var dom = domain[id];
			return this.printDomain(dom);
		},
		printfDomainById: function(id) {
			var dom = domain[id];
			return this.printfDomain(dom);
		},
		printDomains: function() {
			return _.map(domain, function(dom) {
				return this.printDomain(dom);
			},this);
		},
	})
};