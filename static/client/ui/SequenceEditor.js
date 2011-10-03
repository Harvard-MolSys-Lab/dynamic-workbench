Ext.define('App.ui.SequenceEditor', {
	extend: 'App.ui.TextEditor',
	mode: 'sequence',
	mixins : {
		tips : 'App.ui.TipHelper',
	},
	iconCls : 'sequence',
	editorType : 'Sequence',
	requires: ['App.ui.SequenceStats','App.ui.CompareMenu','App.ui.StatMenu','App.ui.SaveButton'],
	initComponent: function() {
		Ext.applyIf(this, {
			tbar: [{
				text: 'Metrics',
				iconCls: 'ruler',
				menu: {
					items: [{
						text:  'Stats',
						menu: Ext.create('App.ui.SequenceStats',{
							ref: 'statsPanel'
						}),
						tooltip: {
							anchor: 'bottom',
							title: 'Sequence Statistics',
							html: 'Displays various statistics about the base composition of the sequence.'
						},
						ref: 'stats'
					},{
						text: 'Levenshtein distance',
						tooltip: {
							anchor: 'bottom',
							title: 'Levenshtein distance',
							html: 'The <a href="http://en.wikipedia.org/wiki/Levenshtein_distance">Levenshtein Distance</a> '+ 									'between two strings measures the minimum number of changes, or "edits" (insertions,  '+ 											'deletions, and substitutions) necessary two make the two strings equal.',
						},
						menu: Ext.create('App.ui.CompareMenu',{
							algorithm:DNA.levenshtein,
						}),
						ref: 'lev',
					},{
						text: 'Hamming distance',
						tooltip: {
							anchor: 'bottom',
							title: 'Hamming Distance',
							html: 'The <a href="http://en.wikipedia.org/wiki/Hamming_distance">Hamming Distance</a> '+ 											'between two strings of equal length measures the number of positions at which they are different; '+ 								'(i.e. it considers substitutions, but not insertions, deletions, or truncations.).'
						},
						menu: Ext.create('App.ui.CompareMenu',{
							algorithm:DNA.hamming,
							validate: function(v1,v2) {
								return (v1.length == v2.length);
							}
						}),
						ref: 'hamming',
					},{
						text: 'Shannon Entropy',
						tooltip: {
							anchor: 'bottom',
							title: 'Shannon Entropy',
							html: 'The <a href="http://en.wikipedia.org/wiki/Entropy_(information_theory)">Shannon Entropy</a> '+ 								'of a string measures the information complexity of that string. This can be used to approximate the '+
							'base diversity in a sequence (higher is better).'
						},
						menu: Ext.create('App.ui.StatMenu',{
							labelText: 'Calculate Shannon Entropy (∆S°)',
							baseText: 'Shannon: ',
							algorithm: function(sel) {
								var p_g = 0,
								p_a = 0,
								p_t = 0,
								p_c = 0,
								base = 0,
								shannon = 0;

								sel = sel.trim();

								// determine base frequencies
								for (j = 0; j < sel.length; j++) {

									// 1 = G, 2 = A, 3 = T, 4 = C; 11 = G (locked), etc
									base = sel[j];// % 10;
									if(base=='G') {
										p_g++;
									} else if (base=='A') {
										p_a++;
									} else if (base=='T') {
										p_t++;
									} else if (base=='C') {
										p_c++;
									}
								}

								// convert to distributions
								p_g = p_g / sel.length;
								p_a = p_a / sel.length;
								p_t = p_t / sel.length;
								p_c = p_c / sel.length;

								shannon = -(p_g * (p_g > 0 ? Math.log(p_g)/Math.LN2 : 0) +
									p_a * (p_a > 0 ? Math.log(p_a)/Math.LN2 : 0) +
									p_t * (p_t > 0 ? Math.log(p_t)/Math.LN2 : 0) +
									p_c * (p_c > 0 ? Math.log(p_c/Math.LN2) : 0));

								return shannon;
							},
						}),
						ref: 'shannon',
					}],
				},
				scope: this,
			},{
				text: 'Transform',
				iconCls: 'transform',
				tooltip: '',
				menu: [{
						text: 'Reverse',
						iconCls: 'arrow-reverse',
						handler: this.reverse,
						scope: this,
						tooltip: 'Reverse the order of bases in each strand in the selection. If "Replace Selection" '+
						'is unchecked, the reverse strands will be inserted below the originals.',
					},{
						text: 'Complement',
						iconCls: 'arrow-complement',
						handler: this.complement,
						scope: this,
						tooltip: 'Insert the Watson-Crick complement of each base in each strand in the selection.'+ 
						'If "Replace Selection" is unchecked, the complement strands will be inserted below the originals. '+
						'<b>Note:</b> this will not reverse the order of the bases; to present the complement in the 5\'$rarr;3\' '+
						'direction, use "Reverse Complement."'
					},{
						text: 'Reverse Complement',
						iconCls: 'arrow-reverse-complement',
						handler: this.reverseComplement,
						scope: this,
						tooltip: 'Insert the Watson-Crick complement of each base in each strand in the selection, in the '+
						'5\'$rarr;3\' direction. '+ 
						'If "Replace Selection" is unchecked, the complement strands will be inserted below the originals. ',
					},{
						text: 'Duplicate',
						handler: this.duplicate,
						scope: this,
						tooltip: 'Duplicate strands in the selection. If "Replace Selection" is unchecked, '+
						'each duplicate strand will be inserted below the original. '
					},{
						text: 'Truncate',
						iconCls: 'cutter',
						tooltip: 'Remove bases from the beginning or end of strands in the selection',
						menu: [{
							text: 'Bases to truncate: ',
							tooltip: "Use a positive number for 5' truncations, negative number for 3' truncations.",
							canActivate: false,
						},{
							xtype: 'numberfield',
							ref: 'truncationCount',
							indent: true,
						},{
							text: 'Truncate',
							iconCls: 'tick',
							handler: this.truncate,
							scope: this,
						}]
					},{
						text: 'Pairwise Align',
						iconCls: 'pairwise-align',
						ref: 'align',
						handler: this.pairwiseAlign,
						scope:this,
					},{
						text: 'Replace Selection',
						checked: true,
						ref: 'replaceSelection',
					},]
			},{
				text: 'Format',
				iconCls: 'pencil',
				tooltip: "Apply various formatting options to the selection.",
				menu: {
					items: [{
						text: 'Strip extra characters',
						handler: this.stripExtra,
						scope: this,
						tooltip: 'Removes characters other than A, T, C, G, U, and whitespace from the selection',
					},{
						text: 'Strip whitespace',
						handler: this.stripWhitespace,
						scope: this,
						tooltip: 'Removes whitespace characters (spaces, tabs, line returns) from the selection'
					},{
						text: 'Strip newlines',
						handler: this.stripNewlines,
						scope: this,
						tooltip: 'Removes line return characters from the selection'
					},{
						text: 'Insert line breaks',
						handler: this.autoLineBreaks,
						scope: this,
						tooltip: 'Replaces spaces in the selection with line returns'
					},{
						text: 'Uppercase',
						handler: this.uppercase,
						scope: this,
						iconCls: 'edit-uppercase',
						tooltip: 'Converts the selection to uppercase',
					},{
						text: 'Lowercase',
						handler: this.lowercase,
						scope: this,
						iconCls: 'edit-lowercase',
						tooltip: 'Converts the selection to lowercase',
					},{
						text: 'Comment/Uncomment',
						handler: this.toggleComment,
						scope: this,
						iconCls: 'comment', 
						tooltip: 'Adds/removes comment characters (# or %)'
					},]
				}
			},{
				text: 'Export',
				iconCls: 'document-export',
				tooltip: 'Generate various input and output formats, or transform the strands for output',
				menu: {
					items:[{
						text: 'To DNA',
						handler: this.convertToDNA,
						scope: this,
						iconCls: 'document-d',
						tooltip: 'Convert the selection to DNA',
					},{
						text: 'To RNA',
						handler: this.convertToRNA,
						scope: this,
						iconCls: 'document-r',
						tooltip: 'Convert the selection to RNA',
					},'-',{
						iconCls: 'seq',
						text: 'Make DD input file',
						handler: this.insertDD,
						scope: this,
						tooltip: 'Generates an input file for DD or WebDD which can be used to mutate the selected domains.'
					},{
						text: 'NUPACK out to FASTA',
						handler: this.nupackToFasta,
						scope: this,
						tooltip: 'Convert NUPACK "M1 : ATCG..."-style labels to FASTA "M1> ATCG..."-style labels'
					},'-',{
						text: 'Thread sequences to strand',
						handler: this.threadStrands,
						scope: this,
						tooltip: 'Assemble the selected sequences into a set of strands using NUPACK strand-builder notation',
					},{
						text: 'Name Strands',
						tooltip :'Automatically prepend a name to each of the strands in the selection',
						menu: [{
							text: 'Strand name prefix: ',
							canActivate: false,
						},{
							xtype: 'textfield',
							ref: 'strandNamePrefix',
							indent: true,
						},{
							text: 'Name Strands',
							iconCls: 'tick',
							handler: this.nameStrands,
							scope: this,
						}]
					},{
						iconCls: 'prepend',
						text: 'Prepend strands',
						tooltip: 'Add a string to the beginning of each of the strands in the selection',
						menu: [{
							text: 'Strand Prefix: ',
							canActivate: false,
						},{
							xtype: 'textfield',
							ref: 'strandPrefix',
							indent: true,
						},{
							text: 'Prepend',
							iconCls: 'tick',
							handler: this.prepend,
							scope: this,
						}]
					},]
				}
			},{
				text: 'Compute',
				iconCls: 'calculator',
				tooltip: 'Perform various thermodynamic calculations on the selection',
				menu: {
					items:[{
						text: 'MFE Complexes',
						iconCls: 'nupack-icon',
						menu: Ext.create('App.ui.CreateMenu',{
							ref: 'mfeMenu',
							labelText: 'Save results to:',
							createText: 'Run',
							extraMenuItems: ['-',{
								xtype: 'numberfield',
								minValue: 1,
								allowBlank: true,
								emptyText: 'Max Complex Size',
								ref: 'mfeMaxComplexSize',
								indent: true,
							},'-'],
							onCreateButton: Ext.bind(this.mfeComplexes,this),
							autoCreateMenu: false,
						}),
						// handler: this.mfeComplexes,
						// scope: this,
					},{
						text: 'Pairwise MFE Complexes',
						iconCls: 'nupack-icon',
						menu: Ext.create('App.ui.CreateMenu',{
							ref: 'mfeMenu',
							labelText: 'Save results to:',
							createText: 'Run',
							// extraMenuItems: ['-',{
							// text: 'Temperature (°C):',
							// canActivate: false,
							// },{
							// xtype: 'numberfield',
							// emptyText: 'Temperature (°)',
							// tip: 'Temperature in °C',
							// value: 20,
							// allowBlank: false,
							// indent: true,
							// },'-',{
							// text: 'Mg<sup>2+</sup> (M): ',
							// canActivate: false,
							// },{
							// emptyText: 'Magnesium (M)',
							// tip: 'Magnesium concentration in mol/L (M)',
							// xtype: 'numberfield',
							// value: 1,
							// allowBlank: false,
							// indent: true,
							// },'-',{
							// text: 'Na<sup>+</sup> (M): ',
							// canActivate: false,
							// },{
							// emptyText: 'Sodium (M)',
							// tip: 'Magnesium concentration in mol/L (M)',
							// xtype: 'numberfield',
							// allowBlank: false,
							// value: 0,
							// indent: true,
							// },'-'],
							onCreateButton: Ext.bind(this.pairwiseMfeComplexes,this),
							autoCreateMenu: false,
						}),
					},{
						text: 'Subsets MFE Complexes',
						iconCls: 'nupack-icon',
						menu: Ext.create('App.ui.CreateMenu',{
							ref: 'subsetsMenu',
							labelText: 'Save results to:',
							createText: 'Run',
							extraMenuItems: ['-',{
								xtype: 'numberfield',
								minValue: 1,
								allowBlank: true,
								emptyText: 'Max Complex Size',
								ref: 'subsetsMaxComplexSize',
								indent: true,
							},{
								checked: true,
								text: 'Compare against WC complements',
								ref: 'subsetsWC',
							},'-'],
							onCreateButton: Ext.bind(this.subsetsMfe,this),
							autoCreateMenu: false,
						}),
						// handler: this.mfeComplexes,
						// scope: this,
					},'-',{
						text: 'Brute Force',
						menu: [{
							text: 'Target length: ',
							canActivate: false,
						},{
							xtype: 'numberfield',
							ref: 'brutePermCount',
							minValue:2,
							maxValue:6,
							indent: true,
						},{
							text: 'Concatenations: ',
							canActivate: false,
						},{
							xtype: 'numberfield',
							ref: 'concatCount',
							minValue:0,
							indent: true,
						},{
							text: 'Brute',
							iconCls: 'tick',
							handler: this.bruteForce,
							scope: this,
						}]
					}]
				}
			},'->',Ext.create('App.ui.SaveButton',{
				text: 'Save',
				iconCls: 'save',
				app: this,
			})],
			bbar: Ext.create('Ext.ux.statusbar.StatusBar',{
				ref: 'statusBar',
				items: [{
					baseText: 'Strands: ',
					text: 'Strands: ',
					ref: 'strandCount',
				},{
					baseText: 'Bases: ',
					text: 'Bases: ',
					ref: 'baseCount',
				}]
			})
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		
		this.mixins.tips.init.apply(this,arguments);
		
		this.shannon.on('activate',this.populateShannon,this);
		this.hamming.on('activate',this.populateHamming,this);
		this.lev.on('activate',this.populateLev,this);
		this.stats.on('activate',this.populateStats,this);
		this.editor.on('cursorchange',this.updateStatusBar,this);
	},
	updateStatusBar: function() {
		var sel = this.editor.getSelection();
		strandCount = _.reduce(sel.split('\n')).length;
		baseCount = sel.replace(/[^atcgu\s]/gmi,'').length;
		this.strandCount.setText(this.strandCount.baseText + strandCount);
		this.baseCount.setText(this.baseCount.baseText + baseCount);
	},
	bruteForce: function() {
		var strands = this.smartSelect(), count = this.brutePermCount.getValue(), concat = this.concatCount.getValue();
		function permute(prev,alphabet) {
			var o = [];
			_.each(prev, function(item) {
				_.each(alphabet, function(ch) {
					o.push(item+ch);
				});
			});
			return o;
		}

		function permutations(length,out,alph) {
			alph || (alph = ['A','T','C','G']);
			out || (out = ['A','T','C','G']);
			for(var i=1;i<length;i++) {
				out = permute(out,alph);
			}
			return out;
		}

		function brute(strands,length) {

			var nMers = permutations(length),
			wc = '',
			out = {};
			for(var i=0;i<nMers.length;i++) {
				wc = DNA.reverseComplement(nMers[i]);
				out[nMers[i]] = 0;
				for(var j=0;j<strands.length;j++) {
					if(strands[j].indexOf(wc)!=-1) {
						out[nMers[i]]++;
					}
				}
			}

			var minInteractions = 1000, sortedNmers = _.sortBy(_.map(out, function(value,key) {
				if(value < minInteractions) {
					minInteractions = value;
				}
				return {
					sequence: key,
					interactions: value
				};
			}), function(value) {
				return value.interactions;
			}),
			topNmers = _.compact(_.map(sortedNmers, function(nMer) {
				return (nMer.interactions == minInteractions) ? nMer.sequence : false;
			})),
			perms = (concat!=0) ? permutations(concat,topNmers,topNmers) : sortedNmers, //,
			des = new DD(), permScores;
			des.addDomains(strands);
			des.evaluateAllScores();
			permScores = _.map(perms,function(perm) {
				des.addDomains([perm]);
				des.evaluateScores(des.getDomainCount()-1);
				return {perm: perm, score: des.popDomain()};
			});
			permScores = _.sortBy(permScores,function(block) {
				return block.score;
			});
			console.log(permScores);
			// permAligns = _.sortBy(_.map(perms, function(perm) {
				// var score = 0;
				// return {
					// perm: perm,
					// alignments: _.map(strands, function(strand) {
						// var align = DNA.pairwiseAlign(strand,perm);
						// score += align.score;
						// return {
							// strand: strand,
							// alignment: align.sequences,
							// score: align.score,
// 
						// };
					// }),
					// score: score
				// };
			// }), function(a) {
				// return a.score
			// }),
			// permOut = _.map(permAligns, function(a) {
				// return 'Perm: '+a.perm+'\n'+'Score: '+a.score+'\n'+_.map(a.alignments, function(block) {
					// return block.alignment.join('\n');
				// }).join('\n\n');
			// }).join('\n\n%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n\n');
			// console.log(permOut);

			var win = Ext.create('Ext.window.Window',{
				width: 650,
				height: 400,
				maximizable: true,
				items: [{
					xtype: 'textareafield',
					region: 'north',
					height: 200,
					value: _.map(permScores,function(block) {
						return block.perm + ' : '+block.score;
					}).join('\n'),
					split: true,
				},Ext.create('App.ui.ProtovisPanel',{
					length: length,
					strands: strands,
					autoRender: true,
					autoSize: false,
					autoScroll: true,
					region: 'center',
					buildVis: function() {

						this.vis = this.getCanvas();
						var data = this.data;
						w = 600,
						h = 15*data.length,
						xScale = pv.Scale.linear(0, this.strands.length).nice().range(0, w),
						yScale = pv.Scale.ordinal(pv.range(0,data.length)).splitBanded(0, 15*data.length, 4/5);
						this.vis
						.width(w)
						.height(h)
						.top(10)
						.bottom(20)
						.left(50)
						.right(10);

						var bar = this.vis.add(pv.Bar)
						.data(data)
						.top( function() {
							return yScale(this.index)
						})
						.height(yScale.range().band)
						.left(0)
						.width( function(d) {
							return xScale(d.interactions)
						});
						/* The value label. */
						bar.anchor("right").add(pv.Label)
						.textStyle("white")
						.text( function(d) {
							return d.interactions
						});
						/* The variable label. */
						bar.anchor("left").add(pv.Label)
						.textMargin(5)
						.textAlign("right")
						.text( function(d) {
							return d.sequence
						});
						/* X-axis ticks. */
						// this.vis.add(pv.Rule)
						// .data(xScale.ticks(5))
						// .left(xScale)
						// .strokeStyle( function(d) {
						// return d ? "rgba(255,255,255,.3)" : "#000"
						// } )
						// .add(pv.Rule)
						// .bottom(0)
						// .height(5)
						// .strokeStyle("#000")
						// .anchor("bottom").add(pv.Label)
						// .text(xScale.tickFormat);
					},
					data: sortedNmers,
				}),],
				layout: 'border',
				title: 'Brute force '+count+'-mer search',
			});
			win.show();
			console.log(sortedNmers);
		}

		brute(strands,count);

		// var brute = new Worker('client/brute.js');
		// brute.onmessage = function(e) {console.log(e) };
		// brute.postMessage({strands: strands, length: count});
		// console.log('Worker started.');
	},
	/**
	 * Opens a window where the user can combine sequences into NUPACk-style strands
	 */
	threadStrands: function() {
		var win = Ext.create('App.ui.SequenceThreader',{});
		win.show();
		win.setSequences(this.getSelection());
	},
	subsetsMfe: function(fullName) {
		var strands = this.smartSelect(),
		maxComplexes = strands.length;
		maxComplexes = this.subsetsMaxComplexSize.getValue();
		maxComplexes = Ext.isNumber(maxComplexes) ? maxComplexes : 2;
		wc = this.subsetsWC.checked;
		App.runTask('nupack.Subsets', {
			node: App.Path.sameDirectory(this.getPath(),fullName),
			strands: strands,
			maxComplex: maxComplexes,
			wc: wc,
		});
	},
	pairwiseMfeComplexes: function(fullName) {
		var strands = this.smartSelect(),
		maxComplexes = strands.length;
		App.runTask('nupack.Pairwise', {
			node: App.Path.sameDirectory(this.getPath(),fullName),
			strands: strands,
		});
	},
	mfeComplexes: function(fullName) {
		var strands = this.smartSelect(),
		maxComplexes = this.mfeMaxComplexSize.getValue();
		maxComplexes = Ext.isNumber(maxComplexes) ? maxComplexes : strands.length;
		App.runTask('nupack.Analysis', {
			node: App.Path.sameDirectory(this.getPath(),fullName),
			strands: strands,
			max: maxComplexes,
		});
	},
	populateStats: function() {
		this.statsPanel.loadSequence(this.getSelectionOrValue().replace(/[^atcgu]/gi,''));
		//this.statsPanel.show();
	},
	getSelectionOrValue: function() {
		var sel = this.editor.codemirror.getSelection();
		if(sel=='') {
			sel = this.editor.getValue();
		}
		return sel;
	},
	toggleComment: function() {
		var strands = this.smartSelect();
		strands = _.map(strands, function(strand) {
			if(strand.trim()[0]=='#' || strand.trim()[0]=='%') {
				strand = strand.trim().substr(1);
			} else {
				strand = '#' + strand;
			}
			return strand;
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);
	},
	truncate: function() {
		var strands = this.smartSelect(), len = this.truncationCount.getValue();
		strands = _.map(strands, function(strand) {
			if(len > 0) {
				return strand.substr(len)
			} else {
				return strand.substr(0,strand.length+len)
			}
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);
	},
	nameStrands: function() {
		var strands = this.smartSelect(), prefix = this.strandNamePrefix.getValue(), i=0;
		!!prefix || (prefix = '');

		strands = _.map(strands, function(strand) {
			i++;
			return prefix+i+' : '+strand;
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);
	},
	prepend: function() {
		var strands = this.smartSelect(), prefix = this.strandPrefix.getValue(), i=0;
		!!prefix || (prefix = '');

		strands = _.map(strands, function(strand) {
			return prefix+strand;
		});
		strands = strands.join('\n');
		this.editor.codemirror.replaceSelection(strands);

	},
	nupackToFasta: function() {
		this.replace(new RegExp("\\t\\n",'gm'),'\n>');
		this.replace(new RegExp("\\t",'g'),'\n');
	},
	insertDD: function() {
		// var sel = this.editor.codemirror.getSelection(), v;
		// if(sel=='') {
		// sel = this.editor.getValue();
		// v = this.makeDD(sel);
		// this.editor.setValue(sel+'\n'+v);
		// } else {
		// v = this.makeDD(sel)
		// this.editor.codemirror.replaceSelection(sel+'\n'+v);
		// }
		this.replace(Ext.bind(this.makeDD,this));
	},
	makeDD: function(val) {
		val = val.replace(/[^atcgu\s]/gi,'');
		var list = _.map(val.split('\n'), function(v) {
			return v.trim()
		}),
		out=list.length.toString()+'\n';
		_.each(list, function(row) {
			out+=row+' 1 15\n';
		});
		return '# Save the following as an input file for DD:\n'+out;
	},
	replace: function(regex,value) {
		var sel = this.editor.codemirror.getSelection(), v;
		if(sel=='') {
			sel = this.editor.getValue();
			if(regex.test) {
				v = sel.replace(regex,value);
			} else if(Ext.isFunction(regex)) {
				v = regex(sel);
			}
			this.editor.setValue(v);
		} else {
			if(regex.test) {
				v = sel.replace(regex,value);
			} else if(Ext.isFunction(regex)) {
				v = regex(sel);
			}
			this.editor.codemirror.replaceSelection(v);
		}
	},
	uppercase: function() {
		this.replace( function(sel) {
			return sel.toUpperCase();
		});
	},
	lowercase: function() {
		this.replace( function(sel) {
			return sel.toLowerCase();
		});
	},
	convertToDNA: function() {
		this.replace(/u/g,'t');
		this.replace(/U/g,'T');
	},
	convertToRNA: function() {
		this.replace(/t/g,'u');
		this.replace(/T/g,'U');
	},
	autoLineBreaks: function() {
		this.replace(/s/gm,'\n');
	},
	stripExtra: function() {
		this.strip(/[^atcgu\s]/gi);
	},
	stripWhitespace: function() {
		this.strip(/\s/gm);
	},
	stripNewlines: function() {
		this.strip(new RegExp("\\n",'gm'));
	},
	strip: function(regex) {
		this.replace(regex,'');
	},
	pairwiseAlign: function() {
		var seqs = this.smartSelect(),
		align = DNA.pairwiseAlign(seqs[0],seqs[1],2, -1, 2, 0, 0);
		this.editor.codemirror.replaceSelection(align.sequences.join('\n'));
	},
	transformByLine: function(map) {
		var sel = this.editor.codemirror.getSelection(), replaceSel = this.replaceSelection.checked,newVal;
		sel = sel.split('\n');
		newVal = _.map(sel,function(el) {
			return map(el.trim());
		});			
		if(!replaceSel) {
			newVal = _.map(_.zip(sel,newVal),function(list) { return list.join('\n'); });
			//newVal = sel + '\n'+newVal;
		}
		this.editor.codemirror.replaceSelection(newVal.join('\n'));
	},
	duplicate: function() {
		this.transformByLine(function(s) { return s+s; });
	},
	reverse: function() {
		this.transformByLine(DNA.reverse);
		// var sel = this.editor.codemirror.getSelection(), replaceSel = !this.replaceSelection.checked,
		// newVal = DNA.reverse(sel);
		// if(replaceSel) {
			// newVal = sel + '\n'+newVal;
		// }
		// this.editor.codemirror.replaceSelection(newVal);
	},
	complement: function() {
		this.transformByLine(DNA.complement);
		// var sel = this.editor.codemirror.getSelection(), replaceSel = !this.replaceSelection.checked,
		// newVal = DNA.complement(sel);
// 
		// if(replaceSel) {
			// newVal = sel + '\n'+newVal;
		// }
		// this.editor.codemirror.replaceSelection(newVal);
	},
	reverseComplement: function() {
		this.transformByLine(DNA.reverseComplement);
		// var sel = this.editor.codemirror.getSelection(), replaceSel = !this.replaceSelection.checked,newVal;
		// sel = sel.split('\n');
		// newVal = _.map(sel,DNA.reverseComplement).join('\n');
		// if(replaceSel) {
			// newVal = sel + '\n'+newVal;
		// }
		// this.editor.codemirror.replaceSelection(newVal);
	},
	populateShannon: function() {
		var menu = this.shannon.menu;
		sel = this.editor.codemirror.getSelection();
		if(sel!='') {
			menu.populate(sel);
		}
	},
	populateHamming: function() {
		this.populateComparison(this.hamming);
	},
	populateLev: function() {
		this.populateComparison(this.lev);
	},
	getSelection: function() {
		return this.editor.codemirror.getSelection();
	},
	smartSelect: function() {
		return this.smartSplit(this.editor.codemirror.getSelection());
	},
	smartSplit: function(sel) {
		if(sel.indexOf('\n')!=-1) {
			sel.replace(/(\r\n)/g,'\n');
			sel = sel.split('\n');

		} else if(sel.indexOf('\t')!=-1) {
			sel = sel.split('\t');
		} else if(sel.indexOf(' ')!=-1) {
			sel = sel.split(' ');
		} else {
			sel = [sel,''];
		}
		return _.map(sel, function(x) {
			return x.trim()
		});
	},
	populateComparison: function(item) {
		var menu = item.menu,
		sel = this.editor.codemirror.getSelection();
		if(sel!='') {
			sel = this.smartSplit(sel);
			menu.populate(sel[0],sel[1]);
		}
	}
});