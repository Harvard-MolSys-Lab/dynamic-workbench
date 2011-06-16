/**
 * @class Workspace.objects.dna.Strand
 * @extends Workspace.objects.IdeaObject
 */

/**
 * @class Workspace.objects.dna.Domain
 * @extends Workspace.objects.Line
 */
Ext.define('Workspace.objects.dna.Domain',{
	extend: 'Workspace.objects.Path',
	buildPath: function(x1,y1,length,arc) {
		return [['M',x1,x2],['L',x1+Math.cos(arc)*v,y1+Math.sin(arc)*v]];
	},
	constructor: function() {
		this.callParent(arguments);
		
		this.expose('hybridize',true,true,true,false);
		this.expose('length',true,function(v) {
			this.length = v;
			var p = this.get('leftPoint')
			this.set('path',this.buildPath(p[0],p[1],v,this.get('arc')));
		},true,false);
		this.expose('complement',function() {
			return Workspace.objects.dna.Domain.getComplement(this);
		},function(value) {
			return Workspace.objects.dna.Domain.setComplement(this,value);
		},true,false);
		this.expose('arc',function() {
			return Math.atan2(this.getHeight(),this.getWidth());
		});
		this.expose('leftPoint',function() {
			return this.path[0].slice(1);
		},function(v) {
			
		});
		this.expose('rightPoint',function() {
			return this.path[1].slice(1);
		},function(v) {
			var p = this.get('path');
			p[1] = ['L'].concat(v);
			this.set('path',p);
		});
	},
	statics: {
		getComplement: function(x) {return x.complement;},
		setComplement: function(x,v) {x.complement=v;},
		ntLength: 5,
	}
})

/**
 * @class Workspace.objects.dna.StrandLayout
 * @extends Workspace.idea.BaseLayout
 */
Ext.define('Workspace.objects.dna.StrandLayout', {
	extend:'Workspace.idea.BaseLayout',
	doLayout: function() {
		if(!this.ignore) {
			this.ignore = true;
			this.idea.children.each( function(child) {
				// bit of a hack;
				// TODO: Make sure doLayout isn't applied before children are rendered
				if(child.is('rendered')) {
					child.setPosition(
					parseInt(cx + Math.cos(theta) * rx - child.getWidth()) + this.paddingTop, // HACK
					parseInt(cy + Math.sin(theta) * ry - child.getHeight()) + this.paddingLeft
					);
					theta = (theta + dtheta) % (2 * Math.PI);
				}
			},this);
			this.ignore = false;
		}
	},
	childrenMovable: false,
	paddingTop: 5,
	paddingLeft: 5,
}, function() {
	Workspace.Layouts.register('Workspace.objects.dna.StrandLayout',Workspace.objects.dna.StrandLayout);
});

/**
 * @class Workspace.tools.Strand
 * @extends Workspace.tools.PolyLine
 */