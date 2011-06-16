


Ext.BLANK_IMAGE_URL = '/scripts/ext-3.0.0/resources/images/default/s.gif';
Ext.onReady(function(){
	
	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'side';
	
	loginWindow = new Ext.Window({
		width: 300,
		height: 200,
		modal: true,
		layout: 'border',
		title: "Login to InfoMachine",
		iconCls: 'lock',
		items: [{
			html: 'Welcome to InfoMachine. Please login below. <a href="javascript:createAccount()">Don\'t have an account?</a>',
			frame: true,
			region: 'north',
			split: true,
			margins: '5 5 0 5'
		},{
			region: 'center',
			frame: true,
			margins: '0 5 5 5',
			xtype: 'form',
			ref: 'form',
			defaults: { xtype: 'textfield', anchor: '100%' },
			items: [{
				name: 'email',
				fieldLabel: 'E-mail',
				allowBlank: false,
				blankText: "Uh... we need your email address to log you in."
			},{
				name: 'password',
				fieldLabel: 'Password',
				inputType: 'password',
				allowBlank: false,
				blankText: "Uh... we need your password too."
			}],
			buttons: [{
				text: "Login",
				iconCls: 'key',
				formBind:true,
				handler: function(){
		            loginWindow.form.getForm().submit({
		            	url: App.getEndpoint('login'), 
		            	waitMsg:'Logging in...',
		            	success: function(form, action) {
		            		var result = action.result; //.result[0];
		            		if(result.error) {
								Ext.Msg.alert('Login Failed.','Check your email and password');
							} else {
								location.reload(true);
							}
		            	},
		            	failure: function(form, action) {
		            		var result = action.result; //.result[0];
		            		if(result.error) {
								Ext.Msg.alert('Login Failed.','Check your email and password');
							} else {
								location.reload(true);
							}
		            	}
		            });
		        }
			}]
		}]
	});
	
	loginWindow.show();
	
});

function createAccount() {
	loginWindow.hide();
	
	regWindow = new Ext.Window({
		width: 300,
		height: 400,
		modal: true,
		layout: 'border',
		title: "Register for an InfoMachine Account",
		iconCls: 'lock',
		items: [{
			html: 'Welcome to InfoMachine. Want to create an account? You\'ll need an '+
				'invite code. <a href="javascript:showLogin()">Already have an account?</a>',
			frame: true,
			region: 'north',
			split: true,
			margins: '5 5 0 5'
		},{
			ref:'form',
			region: 'center',
			frame: true,
			margins: '0 5 5 5',
			xtype: 'form',
			defaults: { xtype: 'textfield', anchor: '100%' },
			items: [{
				name: 'email',
				fieldLabel: 'E-mail',
				allowBlank: false,
				blankText: "We need your email address to identify you to other members of your team"
			},{
				name: 'password',
				fieldLabel: 'Password',
				inputType: 'password',
				allowBlank: false,
				blankText: "Uh... we need your password too."
			},{
				name: 'password2',
				fieldLabel: 'Re-type your Password',
				inputType: 'password',
				allowBlank: false,
				blankText: "Whoops; your password here doesn't match the one you typed above"
			},{
				name: 'firstname',
				fieldLabel: 'First Name',
				allowBlank: false,
				blankText: "We need your name to identify you."
			},{
				name: 'lastname',
				fieldLabel: 'Last Name',
				allowBlank: false,
				blankText: "We need your name to identify you."
			},{
				name: 'invite',
				fieldLabel: 'Invite Code',
				allowBlank: false,
				blankText: "Enter the invitation code."
			}],
			buttons: [{
				text: "Sign Up",
				iconCls: 'key',
				formBind:true,
				handler: function(){
		            regWindow.form.getForm().submit({
		            	url: '/canvas/index.php/login/register', 
		            	waitMsg:'Creating your account...',
		            	success: function(form, action) {
		            		var result = action.result;//.result[0];
		            		if(result.error) {
								Ext.Msg.alert('Account Creation Failed.','Check your invite code.');
							} else {
								location.reload(true);	
							}
		            	},
		            	failure: function(form, action) {
		            		var result = action.result;//.result[0];
		            		if(result.error) {
								Ext.Msg.alert('Account Creation Failed.','Check your invite code.');
							} else {
								location.reload(true);	
							}
		            	}
		            });
		        }
			}]
		}]
	});
	
	regWindow.show();
	
}

function showLogin() {
	regWindow.hide();
	loginWindow.show();
}

