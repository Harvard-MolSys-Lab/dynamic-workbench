if(!App)
	var App = {
		name : 'DyNAMiC Workbench'
	};

function msg(message) {
	return function() {
		if(!!message)
			Ext.Msg.show({
				title : 'Login',
				msg : message,
				buttons : Ext.Msg.OK,
				iconCls : 'lock'
			});
	};
}

Ext.onReady(function() {

	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'side';
	var success = function(form, action) {
		var result = action.result;
		//.result[0];
		// if(!result.success) {
			// Ext.Msg.alert('Login Failed.', 'Check your email and password');
		// } else if(result.message) {
			// Ext.Msg.alert('Login Message', result.message);
		// } else {
			// location.reload(true);
		// }
		
		if(result.message) {
			Ext.Msg.alert('Login Message', result.message);
		} else if(!result.success) {
			Ext.Msg.alert('Login Failed.', 'Check your email and password');
		} else {
			location.reload(true);
		}
	};

	Ext.define('App.ResetWindow', {
		extend : 'Ext.Window',
		constructor : function() {
			Ext.apply(this, {
				items : [{
					html : 'Welcome to ' + App.name + '. From this page you can reset your password',
					frame : true,
					region : 'north',
					split : true,
					margins : '5 5 0 5'
				}, {
					ref : 'form',
					region : 'center',
					frame : true,
					margins : '0 5 5 5',
					xtype : 'form',
					defaults : {
						xtype : 'textfield',
						anchor : '100%'
					},
					items : [{
						xtype: 'displayfield'
						name : 'name',
						fieldLabel : 'Name',
						allowBlank : false,
					}, {
						xtype: 'displayfield',
						style : 'margin-top:15px;',
						name : 'email',
						fieldLabel : 'E-mail',
						allowBlank : false,
						blankText : "We need your email address to identify you to other members of your team"
					}, {
						name : 'password',
						id : 'pass1',
						fieldLabel : 'Password',
						inputType : 'password',
						allowBlank : false,
						tooltip : {
							anchor: 'left',
							text:  "Please enter a password to use when you log in."
						}
					}, {
						name : 'password2',
						fieldLabel : 'Re-type',
						inputType : 'password',
						allowBlank : false,
						vtype : 'password',
						initialPassField : 'pass1',
						blankText : "Whoops; your password here doesn't match the one you typed above"
					}],
					buttons : [{
						text : "Reset",
						iconCls : 'key',
						formBind : true,
						handler : function() {
							regWindow.down('form').submit({
								url : window.location.href,
								waitMsg : 'Resetting your password...',
								success : function(form, action) {
									var result = action.result;
									//.result[0];
									
									if(result.message) {
										Ext.Msg.alert('Password reset', result.message);
									} else if(!result.success) {
										Ext.Msg.alert('Password reset Failed.', result.message);
									} else {
										alert('hello!'); // location.reload(true);
									}
								},
								failure : function(form, action) {
									var result = action.result;
									//.result[0];
									if(!result.success) {
										Ext.Msg.alert('Password reset Failed.', result.message);
									} else {
										location.reload(true);
									}
								}
							});
						}
					}],
				}]
			})

			this.callParent(arguments);
			this.tips || (this.tips = []);
			Ext.each(this.query('*[tooltip]'), function(field) {
				field.on('afterrender', this.buildTip, this);
			}, this);
			this.on('destroy', this.destroyTips, this);
		},
		/**
		 * Constructs a tooltip for the given field using the field's tooltip configuration parameter.
		 */
		buildTip : function(field) {
			var t = field.tooltip;

			/* Don't try to make tooltips for fields without them, don't make a tooltip for a
			 * field which already has one, and don't try to make one for components like
			 * buttons which support them natively.
			 */
			if(!field.tooltip || field.tip || field.setTooltip) {
				return;
			}
			if(Ext.isString(t)) {
				t = {
					text : t
				};
			}
			if(t.text && !t.html) {
				t.html = t.text;
			}
			t.target = field.getEl();
			var tip = new Ext.ToolTip(t);
			this.tips || (this.tips = []);
			this.tips.push(tip);
			field.tip = tip;
		},
		/**
		 * Destroys all tooltips for this components' children.
		 */
		destroyTips : function() {
			Ext.each(this.tips, function(tip) {
				if(tip && tip.destroy) {
					tip.destroy();
				}
			})
		},
		closable : false,
		width : 350,
		height : 450,
		modal : true,
		layout : 'border',
		title : "Register for an Account",
		iconCls : 'lock',

	});
	regWindow = new App.RegWindow();
	loginWindow.show();
	
	var query = document.location.href.split('?'); 
	if(query.length > 1) {
		query = Ext.Object.fromQueryString(query[1]);
		if(query.action=='register') {
			createAccount()
		}
	}
});
// Add the additional 'advanced' VTypes
Ext.apply(Ext.form.field.VTypes, {

	password : function(val, field) {
		if(field.initialPassField) {
			var pwd = field.up('form').down('#' + field.initialPassField);
			return (val == pwd.getValue());
		}
		return true;
	},
	passwordText : 'Passwords do not match'
});

function createAccount() {
	loginWindow.hide();
	regWindow.show();
}

function showLogin() {
	regWindow.hide();
	loginWindow.show();
}