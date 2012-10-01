/**
 * @class App.ui.DD
 * Provides an interface allowing the user to performs domain-based sequence design using Web {@link DD}.
 */
Ext.define('App.ui.DD', {
	extend : 'Ext.panel.Panel',
	mixins : {
		app : 'App.ui.Application',
		tip : 'App.ui.TipHelper',
	},
	requires : ['App.ui.SequenceEditor', 'App.ui.dd.RulesWindow', 'App.ui.dd.ScoreParametersWindow', 'App.ui.dd.SequenceWindow', 'App.ui.SequenceThreader',],
	constructor : function() {
		this.mixins.app.constructor.apply(this, arguments);
		this.callParent(arguments);
	},
	title : 'Domain Design',
	iconCls: 'dd',
	editorType : 'WebDD',
	border : false,
	bodyBorder : false,
	/**
	 * @property
	 * Reports whether the designer is currently mutating
	 */
	mutating : false,
	scoreFormat : '0.00',

	dockedItems : [{
		xtype : 'cite',
		cite : 'zhang_2011',
	}],

	initComponent : function() {
		/**
		 * @property {DD} designer
		 * The domain-based sequence designer
		 */
		var designer = this.designer = new DD();

		this.store = Ext.create('Ext.data.ArrayStore', {
			ref : 'store',
			fields : [{
				name : 'domain',
				type : 'int'
			}, {
				name : 'name',
				type : 'string',
			}, {
				name : 'sequence',
			}, {
				name : 'importance',
				type : 'float',
			}, {
				name : 'composition',
				type : 'int',
			}, {
				name : 'score',
				type : 'float',
			}, {
				name : 'target',
				type : 'bool',
				defaultValue : false,
			}],
			data : []
		});

		this.designStore = Ext.create('Ext.data.ArrayStore', {
			fields : [{
				name : 'sequence',
			}, {
				name : 'spec',
			}, {
				name : 'name',
			}]
		});

		/**
		 * @property {Ext.grid.plugin.CellEditing} cellEditor
		 */
		var cellEditor = this.cellEditor = Ext.create('Ext.grid.plugin.CellEditing2', {
			clicksToEdit : 2,
			autoCancel : false
		});
		this.cellEditor.on('edit', function(editor, e) {
			this.designer.updateDomain(this.store.indexOf(e.record), e.record.get('sequence'), e.record.get('importance'), e.record.get('composition'));
			this.grid.focus();
		}, this);
		this.targetColumn = Ext.create('Ext.ux.CheckColumn', {
			header : 'Target',
			dataIndex : 'target',
			width : 60,
			xtype : 'checkcolumn'
		});

		this.targetColumn.on('checkchange', function(col, i, checked) {
			var rec = this.store.getAt(i);
			if (rec.get('target')) {
				this.designer.targetDomain(i)
			} else {
				this.designer.untargetDomain(i)
			}
		}, this);
		Ext.apply(this, {
			layout : 'border',
			// items: {
			// xtype: 'panel',
			// ref: 'output',
			// },
			items : [{
				/**
				 * @property {Ext.grid.Panel} grid
				 */
				xtype : 'gridpanel',
				ref : 'grid',
				region : 'center',
				selModel : {
					mode : 'multi',
				},
				// title : 'Domains',
				columns : [Ext.create('Ext.grid.RowNumberer', {
					width : 30,
					header : '#',
					hideable : true,
					hidden : true,
				}), {
					header : 'Name',
					dataIndex : 'name',
					width : 50,
					editor : {
						allowBlank : true,
						tooltip : {
							title : "Name domain",
							text : "You can manually specify a name for each domain, to be used in the Structure panel. " + "Leave this blank to automatically number the domains. Domain names/numbers are preserved when " + "the columns of this grid are sorted by clicking the headers.",
							anchor : "top",
						},
					},
					renderer : function(v, metaData, record, rowIdx, colIdx, store) {
						metaData.tdCls = Ext.baseCSSPrefix + 'grid-cell-special';
						return (!v || v == "false") ? (store.indexOfTotal(record) + 1) : v;
					},
				}, {
					header : 'Sequence',
					dataIndex : 'sequence',
					renderer: CodeMirror.modeRenderer('dd-sequence','dd-sequence'),
					// renderer : function(v) {
						// var x = {
							// innerHTML : '',
							// nodeType : 1
						// };
						// CodeMirror.runMode(v, 'dd-sequence', x);
						// return '<span class="dd-sequence">' + x.innerHTML + '</span>';
					// },
					editor : {
						allowBlank : false,
						selectOnFocus: true,	
						tooltip : {
							title : "Edit sequence of domain",
							text : 'Manually set the sequence of this domain by entering a sequence of bases. ' + 'Capitalized bases will be "locked", so the designer will not mutate them. ',
							anchor : 'top',
							anchorOffset : 10,
						},
						listeners : {
							afterrender : {
								scope : this,
								fn : function(field) {
									this.mixins.tip.buildTip(field);
								}
							}
						}
					},
					flex : 1,
				}, {
					header : 'Importance',
					dataIndex : 'importance',
					width : 100,
					editor : {
						xtype : 'numberfield',
						allowBlank : false,
						tooltip : {
							title : "Domain importance",
							text : 'Importance is a multiplicative factor which causes the designer to weigh defects ' + 'involving this domain more heavily. This allows you to (for instance) ensure that toehold ' + 'domains have minimal interactions with other domains.',
							anchor : 'top',
							anchorOffset : 10,
						},
						listeners : {
							afterrender : {
								scope : this,
								fn : function(field) {
									this.mixins.tip.buildTip(field);
								}
							}
						},
					}
				}, {
					header : 'Composition',
					dataIndex : 'composition',
					renderer : Ext.bind(function(v) {
						v = this.designer.printComposition(v);
						return CodeMirror.renderMode('sequence',v.toUpperCase());
						// var x = {
							// innerHTML : '',
							// nodeType : 1
						// };
						// CodeMirror.runMode(v.toUpperCase(), 'sequence', x);
						// return x.innerHTML;
					}, this),
					width : 100,
					editor : {
						//xtype: 'numberfield'
						xtype : 'combobox',
						typeAhead : true,
						triggerAction : 'all',
						allowBlank : false,
						forceSelection : true,
						selectOnTab : true,
						store : [[15, "GATC"], [7, "ATC"], [11, "GTC"], [14, "GAT"], [13, "GAC"], [12, "GA"], [6, "AT"], [9, "GC"], [10, "GT"], [5, "AC"], [3, "TC"], [8, "G"], [4, "A"], [2, "T"], [1, "C"]],
						lazyRender : true,
						listClass : 'x-combo-list-small',
						tooltip : {
							title : "Domain base composition",
							text : 'Specify which bases (ATCG) may be included in this domain; the designer will ' + 'only accept mutations which contain only the specified bases.',
							anchor : 'top',
							anchorOffset : 10,
						},
						listeners : {
							afterrender : {
								scope : this,
								fn : function(field) {
									this.mixins.tip.buildTip(field);
								}
							}
						},
					},
				}, {
					header : 'Score',
					dataIndex : 'score',
					xtype : 'numbercolumn',
					format : this.scoreFormat,
					width : 100,
					editable : false,
				}, this.targetColumn],
				store : this.store,
				plugins : [this.cellEditor],

				tbar : {
					// cls: 'noborder-top noborder-left noborder-right',
					items : [{
						/**
						 * @property {Ext.button.Button} mutateButton
						 * Starts and stops mutation
						 */
						text : 'Mutate',
						iconCls : 'play',
						ref : 'mutateButton',
						handler : this.toggleMutation,
						disabled : true,
						scope : this,
						tooltip : 'Click to start/pause mutations. Must add domains first.',

					}, '-', {
						/**
						 * @property {Ext.button.Button} addDomainButton
						 * Shows a menu allowing the user to add domains to the designer
						 */
						text : 'Add',
						ref : 'addDomainButton',
						handler : this.doAddDomain,
						scope : this,
						iconCls : 'plus',
						xtype : 'splitbutton',
						tooltip : 'Click the button to add a new domain of the default length. Click the arrow to choose the default length, ' + 'or add domains with specific sequences to the design. ',
						menu : [{
							text : 'New domain length: ',
							canActivate : false,
						}, {
							/**
							 * @property {Ext.form.field.Number} addDomLen
							 * Control allowing the user to select the number of bases in the domain to be added
							 */
							xtype : 'numberfield',
							ref : 'addDomLen',
							value : 8,
							min : 2,
							indent : true,
						}, {
							/**
							 * @property {Ext.menu.Item} addDomainItem
							 * Menu item which triggers a domain of length specified in {@link #addDomLen} to be added to the designer.
							 */
							text : 'Add Domain',
							iconCls : 'tick',
							ref : 'addDomainItem',
							handler : this.doAddDomain,
							scope : this,
						}, '-', {
							text : 'Add specific domains...',
							handler : function() {
								this.addManyDomains('');
							},
							scope : this,
							tooltip : 'Open a window to add domains with specific sequences to the design.'
						}, {
							text : 'Add domains from DD file...',
							handler : function() {
								this.loadFromDDFile('');
							},
							scope : this,
							tooltip : 'Open a window to add domains using a file created by a legacy version of DD. ' + 'This also allows you to specify the importance and composition of each of the added domains.'

						}]
					}, {
						/**
						 * @property {Ext.button.Button} modDomainButton
						 */
						text : 'Modify',
						ref : 'modDomainButton',
						iconCls : 'edit',
						xtype : 'splitbutton',
						handler : function() {
							var rec = this.grid.getSelectionModel().getLastSelected()
							if (rec) {
								this.cellEditor.startEdit(rec, this.grid.headerCt.getHeaderAtIndex(1));
							}
						},
						scope : this,
						tooltip : 'Click the button to edit the sequence of the selected domain. Click the arrow to see options to lock/unlock and reseed existing domains.',
						menu : [{
							text: 'Unlock all bases in domain',
							iconCls: 'unlock',
							handler: this.unlock,
							scope: this,
						},{
							text: 'Lock all bases in domain',
							iconCls: 'lock',
							handler: this.lock,
							scope: this,
						},'-',{
							text : 'Reseed Domain',
							iconCls: 'reseed',
							handler : this.reseed,
							scope : this,
						}, {
							text : 'Reseed All Domains',
							iconCls: 'reseed-all',
							handler : this.reseedAll,
							scope : this,
						}]
					}, {
						/**
						 * @property {Ext.button.Button} delDomainButton
						 */
						text : 'Delete',
						ref : 'delDomainButton',
						handler : this.doDeleteDomains,
						scope : this,
						iconCls : 'cross',
						tooltip : 'Delete the selected domain(s)',
					}, '-', {
						text : 'Advanced',
						iconCls : 'tools',
						menu : [{
							text : 'Design options',
							iconCls : 'wrench',
							handler : this.designOptions,
							scope : this,
							tooltip : 'Change options about how DD picks sequences, such as which bases are permitted and particular motifs to penalize. ',
						}, {
							text : 'Tweak score parameters',
							iconCls : 'tweak-score-params',
							handler : this.scoreParams,
							scope : this,
							tooltip : 'Change DD\'s objective (scoring) function.'
						},'-',{
							text: 'Thread sequences',
							iconCls: 'thread-sequence',
							handler: this.threadStrands,
							scope: this,
						},'-',{
							text: 'View DD file',
							iconCls: 'dd',
							handler: this.showDDFile,
							scope: this,
							tooltip: 'Show the raw DD file containing each of the sequences, their importances and compositions as plain text.'
						},{
							text: 'View Sequences',
							iconCls: 'seq',
							handler: this.showDomainsPlaintext,
							scope: this,
							tooltip: 'Show the sequences sequence of each domain as plain text suitable for copying and pasting into other programs.'
						}]
					}, '->', Ext.create('App.ui.SaveButton', {
						text : 'Save Domains',
						iconCls : 'save',
						app : this,
						defaultExtension : 'ddjs',
						forceDefaultExtension : false,
					}), {
						text : 'Help',
						iconCls : 'help',
						handler : App.ui.Launcher.makeLauncher('help:web-dd'),
					}]
				},
				bbar : {
					/**
					 * @property {Ext.ux.statusbar.Statusbar}
					 */
					ref : 'statusBar',
					items : [{
						baseText : 'Attempts: ',
						text : 'Attempts: ',
						ref : 'attemptCount',
					}, {
						baseText : 'Mutations: ',
						text : 'Mutations: ',
						ref : 'mutCount',
					}, {
						baseText : 'Flux: ',
						text : 'Flux: ',
						ref : 'mutFlux',
					}, {
						baseText : 'Bored: ',
						text : 'Bored: ',
						ref : 'boredField',
					}, {
						baseText : '∆: ',
						text : '∆: ',
						ref : 'deltaField',
					}, '->', '->', {
						baseText : 'Score: ',
						text : 'Score: ',
						ref : 'scoreField',
					}]
				},
				margin : 0, //'2 0 0 2',
				bodyBorder : false,
				border : true, //'0 1 1 0',
				split : true,
			}, Ext.create('App.ui.NupackEditor', {
				region : 'east',
				title : 'Structure',
				editorType : 'Structure',
				saveButtonText : 'Save Strands',
				iconCls: 'domains',
				ref : 'structPane',
				collapsible : true,
				collapsed : true,
				width : 200,
				split : true,
				margin : 0, //'2 2 0 0',
				border : true, //'0 0 1 1',
				bodyBorder : true,
				showCite: false,
				showNupackButton : false,
				showEditButton : false,
				extraTbarItems : [{
					text : 'Update',
					iconCls : 'refresh',
					xtype : 'splitbutton',
					menu : [{
						text : 'Reseed existing domains',
						ref : 'clobberOnUpdate',
						checked : false,
					}],
					handler : this.updateDomainsFromSpec,
					scope : this,
				}],
				listeners : {
					'afterrender' : {
						scope : this,
						fn : function(structPane) {
							structPane.header.tooltip = {
								title : 'Structure',
								text : 'Use this pane to thread your domains onto strands. You can use a NUPACK-like syntax to describe ' + //
								'your strands. For example, to describe strand "M1" containing domains 1, 2, and 3*, simply enter "M1 : 1 2 3*" ' + //
								'then click "Update." Your changes will be reflected in the "Strands" pane below'
							};
							this.mixins.tip.buildTip(structPane.header);
						}
					}
				}
			}), Ext.create('App.ui.SequenceEditor', {
				region : 'south',
				title : 'Strands',
				editorType : 'Strands',
				saveButtonText : 'Save Sequences',
				ref : 'strandsPane',
				collapsible : true,
				collapsed : true,
				height : 200,
				split : true,
				border : true, //'1 0 0 0',
				bodyBorder : true,
				margin : 0, //'0 2 2 2',
				listeners : {
					'afterrender' : {
						scope : this,
						fn : function(strandsPane) {
							strandsPane.header.tooltip = {
								title : 'Strands',
								text : 'This pane shows the sequences of the strands described in the "Structure" pane on the right. '
							};
							this.mixins.tip.buildTip(strandsPane.header);
						}
					}
				}
			})]

		});

		this.on('afterrender', this.loadFile, this);
		this.on('afterrender', function() {
			this.targetColumnTip = Ext.create('Ext.tip.ToolTip', {
				target : this.grid.getEl(),
				delegate : ".x-grid-checkheader", //'.x-grid-checkheader',
				title : 'Target Domain',
				html : "Select one or more domains to specifically target them for mutations. " + "If you check multiple domains, the worst among them will be selected for mutation " + "If you don\'t target any specific domains, the worst domain among the entire ensemble " + "will be targeted by default.",
				anchor : "top",
				renderTo : Ext.getBody(),
			});
		}, this);
		this.callParent(arguments);
		this.mixins.tip.init.apply(this, arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		}, this);
	},
	updateDomainsFromSpec : function() {
		var structPaneValue = this.structPane.getValue();
		var spec = DNA.structureSpec(CodeMirror.tokenize(structPaneValue, 'nupack'));
		this.syncDomains(spec.domains, this.clobberOnUpdate.checked);
		this.setStrands(spec.strands);
		var me = this;
		_.defer(function() {
			me.structPane.on('expand', function() {
				me.structPane.setValue(structPaneValue)
				me.strandsPane.expand();
				me.strandsPane.on('expand',function() {				
					me.updateStrandsPane();
				})
			})
			me.structPane.expand();

		})
	},
	setStrands : function(strands) {
		this.strands = strands;
	},
	getSaveData : function(ext) {
		ext || ( ext = this.document.getExt());
		if (ext == 'ddjs') {
			return {
				structure : this.structPane.getValue() || '',
				state : this.designer.saveState(),
			};
		} else if (ext == 'nupack' || ext == 'domains') {
			return this.structPane.getValue();
		} else if (ext == 'seq') {
			this.designer.printDomains().join('\n');
		} else if (ext == 'dd') {
			return this.designer.saveFile();
			//this.designer.printfDomains().join('\n');
		}
	},
	/**
	 * Loads the given design from a *.nupack or *.domains file
	 */
	onLoad : function() {
		if (!!this.data) {
			var ext = this.document.getExt();
			if (ext == 'ddjs') {
				this.data = Ext.decode(this.data);
				this.structPane.setValue(this.data.structure || '');
				this.designer.loadState(this.data.state || {});
				this.addDomains(this.designer.printfDomains(), [], this.designer.getImportances(), this.designer.getCompositions(), true);
				this.updateDomainsFromSpec();
			} else if (ext == 'nupack' || ext == 'domains') {
				this.structPane.setValue(this.data);
				this.updateDomainsFromSpec();
				this.structPane.bindDocument(this.document);
				this.unbindDocument();
			} else if (ext == 'seq') {
				this.addManyDomains(this.data);
			} else if (ext == 'dd') {
				this.designer.loadFile(this.data);
				this.addDomains(this.designer.printfDomains(), [], this.designer.getImportances(), this.designer.getCompositions(), true);
			}
		}
	},
	/**
	 * Applies the passed function to each selected record
	 * 
	 * @param {Function} f
	 * @param {Ext.data.Model} f.rec
	 * The selected record
	 * 
	 * @param {Number} f.index 
	 * The index of the selected record
	 * 
	 * @returns {Boolean} result True if any records were selected, false otherwise.
	 */
	eachSelected: function(f) {
		var me = this;
		f = f.bind(me);
		var recs = this.grid.getSelectionModel().getSelection();
		if (recs) {
			_.each(recs,function(rec,i) {
				var j = me.store.indexOf(rec)
				f(rec,j);
			});
			return true;
		} 
		return false;
	},
	
	/**
	 * Reseeds the last-selected domain
	 */
	reseed : function() {
		var rec = this.grid.getSelectionModel().getLastSelected(), dom = this.store.indexOf(rec);
		if (rec) {
			this.designer.reseedDomain(dom);
			rec.set('sequence', this.designer.printfDomainById(dom));
		}
	},
	/**
	 * Reseeds all domains
	 */
	reseedAll : function() {
		this.designer.reseed();
		this.updateInterface(true);
	},
	lock: function() {
		//var rec = this.grid.getSelectionModel().getLastSelected(), dom = this.store.indexOf(rec);
		
		this.eachSelected(function(rec,dom) {
			if (rec) {
				var seq = rec.get('sequence').toUpperCase();
				this.designer.updateDomain(dom, seq, rec.get('importance'), rec.get('composition'));
				rec.set('sequence', seq);
			}
		})
	},
	unlock: function() {
		//var rec = this.grid.getSelectionModel().getLastSelected(), dom = this.store.indexOf(rec);
		
		this.eachSelected(function(rec,dom) {
			if (rec) {
				var seq = rec.get('sequence').toLowerCase();
				this.designer.updateDomain(dom, seq, rec.get('importance'), rec.get('composition'));
				rec.set('sequence', seq);
			}
		});
	},
	/**
	 * Syncs UI for a particular domain with the {@link #designer}
	 * @param {Ext.data.Model} domain Record for a particular domain to sync
	 */
	updateDomain : function(rec) {
		this.designer.updateDomain(this.store.indexOf(rec), rec.get('sequence'), rec.get('importance'), rec.get('composition'));
	},
	/**
	 * Updates the score parameters in the designer
	 */
	updateParams : function(v) {
		this.designer.updateParams(v);
	},
	/**
	 * Updates the design rules in the designer
	 */
	updateRules : function() {
		this.designer.updateRules(v);
	},
	/**
	 * Shows the design rules window
	 */
	designOptions : function() {
		if (!this.designOptionsWindow) {
			this.designOptionsWindow = Ext.create('App.ui.dd.RulesWindow', {
				designer : this.designer,
				closeAction : 'hide'
			});
		}
		this.designOptionsWindow.setValues(this.designer.getRules());
		this.designOptionsWindow.show();
	},
	/**
	 * Shows the score parameters window
	 */
	scoreParams : function() {
		if (!this.scoreParamsWindow) {
			this.scoreParamsWindow = Ext.create('App.ui.dd.ScoreParametersWindow', {
				designer : this.designer,
				closeAction : 'hide'
			});
		}
		this.scoreParamsWindow.setValues(this.designer.getParams());
		this.scoreParamsWindow.show();
	},
	/**
	 * Updates the status bar to reflect the number of attempts and successful mutations
	 */
	updateStatusBar : function() {
		var attempts = this.designer.getMutationAttempts(), //
		muts = this.designer.getMutationCount(), //
		score = this.designer.getWorstScore(), //
		flux = this.designer.getMutationFlux(), delta = this.designer.getMutationDelta(), bored = this.designer.getBoredMutations();
		this.attemptCount.setText(this.attemptCount.baseText + attempts);
		this.mutCount.setText(this.mutCount.baseText + muts);
		this.scoreField.setText(this.scoreField.baseText + Ext.util.Format.number(score, this.scoreFormat));
		this.mutFlux.setText(this.mutFlux.baseText + Ext.util.Format.number(flux, this.scoreFormat));
		this.deltaField.setText(this.deltaField.baseText + Ext.util.Format.number(delta, this.scoreFormat));
		this.boredField.setText(this.boredField.baseText + bored);
	},
	/**
	 * Deletes the selected domain(s)
	 */
	doDeleteDomains : function() {
		this.eachSelected(function(rec,dom) {
			this.designer.removeDomain(this.store.indexOf(rec));
			this.store.remove(rec);
		});
		
		// var recs = this.grid.getSelectionModel().getSelection();
		// if (recs) {
			// _.each(recs, function(rec) {
				// this.designer.removeDomain(this.store.indexOf(rec));
				// this.store.remove(rec);
			// }, this);
		// }
	},
	/**
	 * Synchronizes domains in the view and the designer with domains in the
	 * {@link #strands strand threading spec}
	 *
	 * @param {Object} domains Hash mapping names (or numbers) of domains
	 * described in the spec to domain sequences (which could be Ns).
	 * @param {Boolean} [clobber=false] True to set existing domains with the
	 * given names/indicies to the sequences given, false to leave existing
	 * domains as they are.
	 */
	syncDomains : function(domains, clobber) {
		clobber = clobber || false;
		_.each(domains, function(spec, name) {
			var rec = this.store.findRecord('name', name);
			if (!rec) {// && _.isNumber(name)) {
				rec = this.store.getAt(parseInt(name) - 1);
			}
			if (!rec) {
				this.addDomains([spec], [name]);
			} else {
				if (clobber) {
					rec.set('sequence', spec);
					this.updateDomain(rec);
				}
			}
		}, this);
	},
	/**
	 * Shows the {@link #addDomainsWindow}
	 */
	addManyDomains : function(data) {
		/**
		 * @property {App.ui.dd.SequenceWindow} addDomainsWindow
		 * Sequence-editing window which allows the user to add many domains by
		 * typing or copying and pasting.
		 */
		if (!this.addDomainsWindow) {
			this.addDomainsWindow = Ext.create('App.ui.dd.SequenceWindow', {
				designer : this,
				value : data || '',
			});
		}
		this.addDomainsWindow.show();
	},
	/**
	 * Shows the #loadDDFileWindow
	 * @param {String} [data] If provided, seeds the
	 */
	loadFromDDFile : function(data) {
		if (!this.loadDDFileWindow) {
			/**
			 * @property {App.ui.dd.SequenceWindow} loadDDFileWindow
			 * Allows the user to add domains by pasting from an old DD text
			 * format file. Also the best way to add many domains with
			 * different importances/compositions.
			 */
			this.loadDDFileWindow = Ext.create('App.ui.dd.SequenceWindow', {
				designer : this,
				value : data || '',
				handler : function(data) {
					this.designer.loadFile(data);
					this.addDomains(this.designer.printfDomains(), [], this.designer.getCompositions(), this.designer.getImportances());
				},
				scope : this,
			});
		}
		this.loadDDFileWindow.show();

	},
	showDDFile: function() {
		var data = this.designer.saveFile();
		if (!this.showDDFileWindow) {
			/**
			 * @property {App.ui.dd.SequenceWindow} showDDFileWindow
			 * Allows the user to copy sequences out of the editor
			 */
			this.showDDFileWindow = Ext.create('App.ui.dd.SequenceWindow', {
				designer : this,
				title: 'Raw DD file',
				buttonText: 'Close',
				buttonIconCls: 'cross',
				value : data || '',
				handler : function(data) {
					this.close();
				}
			});
		} else {
			this.showDDFileWindow.setValue(data);
		}
		this.showDDFileWindow.show();
	},
	showDomainsPlaintext: function() {
		var data = this.designer.printfDomains().join('\n');
		if (!this.showDomainsWindow) {
			/**
			 * @property {App.ui.dd.SequenceWindow} showDomainsWindow
			 * Allows the user to copy sequences out of the editor
			 */
			this.showDomainsWindow = Ext.create('App.ui.dd.SequenceWindow', {
				designer : this,
				title: 'Raw domain sequences',
				buttonText: 'Close',
				buttonIconCls: 'cross',
				value : data || '',
				handler : function(data) {
					this.close();
				}
			});
		} else {
			this.showDomainsWindow.setValue(data);
		}
		this.showDomainsWindow.show();
	},
	/**
	 * Adds the passed domains to the designer
	 * @param {String[]} seqs Array of sequences to add
	 */
	addDomains : function(seqs, names, imp, comp, dummy) {
		imp || ( imp = 1);
		comp || ( comp = 15);
		dummy = dummy || false;
		//, start = this.designer.getDomainCount(), end;

		if (!dummy) {
			this.designer.addDomains(seqs, imp, comp);
		}
		// end =   this.designer.getDomainCount() - 1;
		// var newSeqs = [];
		// for(var i = start; i < end; i++) {
		// newSeqs.push(this.designer.printfDomainById(i));
		// }

		this.addDomainsToStore(seqs, names, imp, comp);

		this.scoresDirty = true;
		this.designer.evaluateIntrinsicScores();
		this.mutateButton.enable();
	},
	addDomainsToStore : function(seqs, names, imp, comp) {
		this.store.add(_.map(seqs, function(seq, i) {
			return {
				sequence : seq,
				importance : _.isArray(imp) ? imp[i] : imp,
				composition : _.isArray(comp) ? comp[i] : comp,
				name : (names && names[i]) ? names[i] : '',
			};
		}, this));
	},
	/**
	 * Add a domain from the {@link #addDomainButton}
	 */
	doAddDomain : function() {
		var rec = this.grid.getSelectionModel().getLastSelected()
		if (rec) {
			var comp = rec.get('composition')
		} else {
			comp = 15
		}
		var len = this.addDomLen.getValue();
		var seq = this.designer.randomSequence(1,len)[0];
		this.addDomain(this.designer.printfDomain(seq), 1, comp);
	},
	/**
	 * Adds a domain to the {@link #designer}
	 */
	addDomain : function(seq, imp, comp, name) {

		// false to not clobber
		name || ( name = '');
		this.designer.addDomains([seq], imp, comp, false);
		var seq = this.designer.printfDomainById(this.designer.getDomainCount() - 1);
		this.store.add({
			sequence : seq,
			importance : imp,
			composition : comp,
			name : name,
		});
		this.designer.evaluateIntrinsicScores();
		this.scoresDirty = true;
		this.mutateButton.enable();
	},
	/**
	 * Starts or stops mutations
	 */
	toggleMutation : function() {
		if (this.mutating) {
			this.pauseMutation();
		} else {
			this.startMutation();
		}
	},
	/**
	 * @cfg {Number}
	 * Number of mutations to perform before updating the UI
	 */
	mutationStep : 50,
	/**
	 * @property {Number}
	 * Number of mutations performed since the UI was last updated
	 */
	mutationCount : 0,
	/**
	 * Method run on a loop; to perform mutations and occasionally updating the UI with {@link #updateInterface}
	 * started by {@link #startMutation}, paused by {@link #pauseMutation}
	 */
	mutationLoop : function() {
		if (this.mutationCount > this.mutationStep) {
			this.updateInterface();
			this.mutationCount = 0;
		}
		this.mutationCount++;
		this.doMutation();
	},
	doMutation : function() {
		this.designer.mutate();
	},
	/**
	 * Updates the UI after {@link #mutationStep} mutations
	 */
	updateInterface : function(refreshSequences, refreshScores) {
		refreshSequences || ( refreshSequences = false);
		refreshScores || ( refreshScores = true);
		this.updateStatusBar();

		// true to force a re-tally (since domain_score[] isn't automatically updated when a
		// mutation is rejected; we risk showing an increased score that was actually rejected)
		var scores = this.designer.getScores(true), //
		mut_dom = this.designer.getMutatedDomain(), //
		mut_dom_seq = this.designer.printfDomainById(mut_dom), allSequences = ( refreshSequences ? this.designer.printfDomains() : null), rec;
		for (var i = 0; i < scores.length; i++) {
			rec = this.store.getAt(i);
			if (refreshScores) {
				if (rec.get('score') != 0 && rec.get('score') < scores[i]) {
					//throw "Score increase";
				}
				rec.set('score', scores[i]);
			}
			if (refreshSequences) {
				rec.set('sequence', allSequences[i]);
			}
		}
		rec = this.store.getAt(mut_dom);
		rec.set('sequence', mut_dom_seq);
		this.store.sync();
		if (this.strands) {
			var segments = _.reduce(this.store.getRange(), function(memo, rec) {
				var name = rec.get('name'), i = this.store.indexOf(rec);
				memo[ name ? name : i + 1] = this.designer.printDomainById(i);
				return memo;
			}, {}, this);
			this.strandsPane.setValue(_.map(this.strands, function(spec, name) {
				return name + ' : ' + DNA.threadSegments(segments, spec);
			}).join('\n'));
		}
	},
	updateStrandsPane : function() {
		var segments = _.reduce(this.store.getRange(), function(memo, rec) {
			var name = rec.get('name'), i = this.store.indexOf(rec);
			memo[ name ? name : i + 1] = this.designer.printDomainById(i);
			return memo;
		}, {}, this);
		this.strandsPane.setValue(_.map(this.strands, function(spec, name) {
			return name + ' : ' + DNA.threadSegments(segments, spec);
		}).join('\n'));
	},
	/**
	 * Opens a {@link App.ui.SequenceThreader sequence threader}, allowing the 
	 * user to thread together sequences based on a sequence specification into
	 * full strands.
	 */
	threadStrands: function() {
		var win = Ext.create('App.ui.SequenceThreader');
		win.show();
		// var segments = _.reduce(this.store.getRange(), function(memo, rec) {
			// var name = rec.get('name'), i = this.store.indexOf(rec);
			// memo[ name ? name : i + 1] = this.designer.printDomainById(i);
			// return memo;
		// }, {}, this);
// 		
		var segments = _.map(this.store.getRange(), function(rec) {
			var name = rec.get('name'), i = this.store.indexOf(rec);
			name = !!name ? name : i + 1;
			return name + ' : ' + this.designer.printDomainById(i);
		}, this);
		
		var strands = _.map(this.strands,function(sepc,name) {
			return name + ' : ' + spec;
		});
				
		win.setSequences(segments.join('\n'));
		win.setStrands(strands.join('\n'));
	},
	/**
	 * Begins mutating on a timer
	 */
	startMutation : function() {
		this.mutateButton.setIconCls('pause');
		_.invoke([this.modDomainButton, this.addDomainButton, this.delDomainButton], 'disable');
		// update dirty scores in designer
		if (!this.mutationTask || this.scoresDirty) {
			this.designer.evaluateAllScores();
			this.scoresDirty = false;
		}

		// update all sequences in grid (since some might have been Ns, and DD will have picked new sequences by now)
		var doms = this.designer.printfDomains();
		_.each(doms, function(seq, dom) {
			this.store.getAt(dom).set('sequence', seq);
		}, this);
		if (!this.mutationTask) {
			this.mutationTask = Ext.TaskManager.start({
				run : this.mutationLoop,
				interval : 0.1,
				scope : this,
			});
		} else {
			this.mutationTask = Ext.TaskManager.start(this.mutationTask);
		}
		this.mutating = true;
	},
	/**
	 * Stops the mutation timer task
	 */
	pauseMutation : function() {
		this.mutateButton.setIconCls('play');
		_.invoke([this.modDomainButton, this.addDomainButton, this.delDomainButton], 'enable');
		if (this.mutationTask) {
			Ext.TaskManager.stop(this.mutationTask);
		}
		this.mutating = false;
	}
});

/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.ux.PreviewPlugin
 * @extends Ext.AbstractPlugin
 *
 * The Preview enables you to show a configurable preview of a record.
 *
 * This plugin assumes that it has control over the features used for this
 * particular grid section and may conflict with other plugins.
 *
 * @alias plugin.preview
 * @ptype preview
 */
Ext.define('Ext.ux.PreviewPlugin', {
	extend : 'Ext.AbstractPlugin',
	alias : 'plugin.preview',
	requires : ['Ext.grid.feature.RowBody', 'Ext.grid.feature.RowWrap'],

	// private, css class to use to hide the body
	hideBodyCls : 'x-grid-row-body-hidden',

	/**
	 * @cfg {String} bodyField
	 * Field to display in the preview. Must me a field within the Model definition
	 * that the store is using.
	 */
	bodyField : '',

	/**
	 * @cfg {Boolean} previewExpanded
	 */
	previewExpanded : true,

	constructor : function(config) {
		this.callParent(arguments);
		var bodyField = this.bodyField, hideBodyCls = this.hideBodyCls, section = this.getCmp(), features = [{
			ftype : 'rowbody',
			getAdditionalData : function(data, idx, record, orig, view) {
				var o = Ext.grid.feature.RowBody.prototype.getAdditionalData.apply(this, arguments);
				Ext.apply(o, {
					rowBody : data[bodyField],
					rowBodyCls : section.previewExpanded ? '' : hideBodyCls
				});
				return o;
			}
		}, {
			ftype : 'rowwrap'
		}];

		section.previewExpanded = this.previewExpanded;
		if (!section.features) {
			section.features = [];
		}
		section.features = features.concat(section.features);
	},
	/**
	 * Toggle between the preview being expanded/hidden
	 * @param {Boolean} expanded Pass true to expand the record and false to not show the preview.
	 */
	toggleExpanded : function(expanded) {
		var view = this.getCmp();
		this.previewExpanded = view.previewExpanded = expanded;
		view.refresh();
	}
});
