if(!App)
	var App = {
		name : 'InfoMachine2'
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
		if(!result.success) {
			Ext.Msg.alert('Login Failed.', 'Check your email and password');
		} else if(result.message) {
			Ext.Msg.alert('Login Message', result.message);
		} else {
			location.reload(true);
		}
	};
	loginWindow = new Ext.Window({
		closable : false,
		width : 300,
		height : 200,
		modal : true,
		layout : 'border',
		title : "Login to " + App.name,
		iconCls : 'lock',
		items : [{
			html : 'Welcome to ' + App.name + '. Please login below. <a href="javascript:createAccount()">Don\'t have an account?</a>',
			frame : true,
			region : 'north',
			split : true,
			margins : '5 5 0 5'
		}, {
			region : 'center',
			layout: 'anchor',
			frame : true,
			margins : '0 5 5 5',
			xtype : 'form',
			ref : 'form',
			defaults : {
				xtype : 'textfield',
			},
			items : [{
				anchor : '100%',
				name : 'email',
				fieldLabel : 'E-mail',
				allowBlank : false,
				blankText : "We need your email address to log you in.",
				value : Ext.util.Cookies.get('infomachine-email') || '',
			}, {
				anchor : '100%',
				name : 'password',
				fieldLabel : 'Password',
				inputType : 'password',
				allowBlank : false,
				blankText : "We need your password too.",
				value : Ext.util.Cookies.get('infomachine-password') || '',
			},{
				anchor: '-5',
				name: 'remember',
				xtype: 'checkbox',
				checked: Ext.util.Cookies.get('infomachine-remember') || false,
                boxLabel: 'Remember Me',
                tooltip: 'Check to remember your username and password.'
			}],
			buttons : [{
				text : "Login",
				iconCls : 'key',
				formBind : true,
				handler : function() {
					var remember = loginWindow.down('[name=remember]');
					if(remember.checked) {
						Ext.util.Cookies.set('infomachine-email',loginWindow.down('[name=email]').getValue());
						Ext.util.Cookies.set('infomachine-password',loginWindow.down('[name=password]').getValue());
						Ext.util.Cookies.set('infomachine-remember',true);
					}
					loginWindow.down('form').submit({
						url : '/login',
						method : 'POST',
						waitMsg : 'Logging in...',
						success : success,
						failure : success,
					});
				}
			}]
		}]
	});
	regWindow = new Ext.Window({
		width : 300,
		height : 330,
		modal : true,
		layout : 'border',
		title : "Register for an Account",
		iconCls : 'lock',
		items : [{
			html : 'Welcome to ' + App.name + '. Want to create an account? You\'ll need an ' + 'invite code. <a href="javascript:showLogin()">Already have an account?</a>',
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
				name : 'name',
				fieldLabel : 'Name',
				allowBlank : false,
				blankText : "We need your name to identify you."
			}, {
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
				blankText : "Uh... we need your password too."
			}, {
				name : 'password2',
				fieldLabel : 'Re-type',
				inputType : 'password',
				allowBlank : false,
				vtype : 'password',
				initialPassField : 'pass1',
				blankText : "Whoops; your password here doesn't match the one you typed above"
			}, {
				style : 'margin-top:15px;',
				name : 'invite',
				fieldLabel : 'Invite Code',
				allowBlank : false,
				blankText : "Enter the invitation code."
			}],
			buttons : [{
				text : "Sign Up",
				iconCls : 'key',
				formBind : true,
				handler : function() {
					regWindow.down('form').submit({
						url : '/register',
						waitMsg : 'Creating your account...',
						success : function(form, action) {
							var result = action.result;
							//.result[0];
							if(!result.success) {
								Ext.Msg.alert('Account Creation Failed.', result.message);
							} else {
								location.reload(true);
							}
						},
						failure : function(form, action) {
							var result = action.result;
							//.result[0];
							if(!result.success) {
								Ext.Msg.alert('Account Creation Failed.', result.message);
							} else {
								location.reload(true);
							}
						}
					});
				}
			}],
			closable : false,
		}]
	});
	loginWindow.show();

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