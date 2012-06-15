Ext.define('App.ui.Attribution', {
	'statics' : {
		getCite : function(cite) {
			return _.copy(this.cites[cite]);
		},
		cites : {
			'zhang_2011' : {
				authors : ['Zhang, David Y.'],
				title : 'Towards Domain-Based Sequence Design for DNA Strand Displacement Reactions',
				publication : 'Lecture Notes in Computer Science',
				volume : '6518',
				pages : '162-175',
				year : 2011,
			},
			'zadeh_etal_2011': {		
				authors: ['J.N. Zadeh', 'C.D. Steenberg', 'J.S. Bois', 'B.R. Wolfe', 'M.B. Pierce', 'A.R. Khan', 'R.M. Dirks', 'N.A. Pierce'],
				title: 'NUPACK: analysis and design of nucleic acid systems', 
				publication: 'J Comput Chem', 
				volume: 32, 
				pages: '170–173', 
				year: 2011,
				url: 'http://nupack.org/downloads/serve_public_file/jcc11a.pdf?type=pdf',
			},
			'markham_zuker_2005':{
				authors: ['Markham, N. R.', 'Zuker, M.',],
				year: 2005, 
				title: 'DINAMelt web server for nucleic acid melting prediction',
				publication: 'Nucleic Acids Res.', 
				volume: 33, 
				pages: 'W577-W581',
				url: 'http://nar.oxfordjournals.org/cgi/content/full/33/suppl_2/W577',	
			},
			'gruber_etal_2008':{
				authors: ['Andreas R. Gruber', 'Ronny Lorenz', 'Stephan H. Bernhart', 'Richard Neuböck','Ivo L. Hofacker'],
				title: 'The Vienna RNA Websuite',
				year: 2008,
				publication: 'Nucleic Acids Res.', 
				volume: 36,
				pages: 'W70-W74',
				url: 'http://nar.oxfordjournals.org/content/36/suppl_2/W70.full',
			},
			'sbml_2003':{
				authors: ['Hucka, M., Finney, A., Sauro, H. M., Bolouri, H., Doyle, J. C., Kitano, H., Arkin, A. P., Bornstein, B. J., Bray, D., Cornish-Bowden, A. , Cuellar, A. A., Dronov, S., Gilles, E. D., Ginkel, M., Gor, V., Goryanin, I. I., Hedley, W. J., Hodgman, T. C., Hofmeyr, J.-H., Hunter, P. J., Juty, N. S., Kasberger, J. L., Kremling, A., Kummer, U., Le Novère, N., Loew, L. M., Lucio, D., Mendes, P., Minch, E., Mjolsness, E. D., Nakayama, Y., Nelson, M. R., Nielsen, P. F., Sakurada, T., Schaff, J. C., Shapiro, B. E., Shimizu, T. S., Spence, H. D., Stelling, J., Takahashi, K., Tomita, M., Wagner, J., Wang, J.'],
				year:2003,
				title: 'The Systems Biology Markup Language (SBML): A medium for representation and exchange of biochemical network models.',
				publication: 'Bioinformatics',
				volume: 19, 
				number: 4,
				pages: '524–531'
			}
		},
		printAllCitations: function() {
			this.tpl = new Ext.XTemplate(this.tpl);
			return "<ul>"+_.map(this.cites,function(cite,key) {
				return this.tpl.apply(cite)
			},this).join('\n')+"</ul>";
		},
		tpl: '<li><b>{[values.authors.join(", ")]}</b>. "{title}". <tpl if="!!publication"><i>{publication}</i> </tpl>{volume}<tpl if="!!volume && !!pages">:</tpl>{pages}<tpl if="!!year"> ({year})</tpl>. <tpl if="!!url"><a href="{url}">URL</a></tpl></li>',
	},
	extend : 'Ext.window.Window',
	width : 500,
	height : 500,
	bodyStyle : 'padding:10px; background-color: white;',
	autoScroll : true,
	closeAction : 'hide',
	title : 'About',
	initComponent : function() {
		Ext.apply(this, {
			autoLoad : {
				url : '/attribution',
				callback : this.initAttribution,
				scope : this
			},
		});
		this.callParent(arguments);
	},
	initAttribution : function() {

	},
	
})
