
##############################################
# ~/vmshare/infomachine2/Makefile
# TO BE RUN ON HOST
##############################################


.PHONY : js
.PHONY : vm
.PHONY : docs
.PHONY : clean

productName = "DyNAMiC Workbench Server (0.3.1)"
vmName = "DyNAMiC Workbench Server"
vmShare = "/Users/caseygrun/vmshare/"

all : vm js docs

docs :
	jsduck static/client --external 'Ext' --title='InfoMachine2 Documentation' --output static/docs	--categories categories.json
	
vm : #unshare
#	VBoxManage guestcontrol "DyNAMiC Workbench Server" exec '/usr/bin/make' --username "webserver-user" --password " " --verbose --wait-stdout --wait-exit -- --directory='/home/webserver-user' deploy 2>&1
	mkdir -p build/vm
	rm -f build/vm/workbench.ova
	VBoxManage export "DyNAMiC Workbench Server" -o build/vm/workbench.ova --vsys 0 --product $(productName)

unshare :
	VBoxManage sharedfolder remove $(vmName) --name 'vmshare'

share :
	VBoxManage sharedfolder add $(vmName) --name 'vmshare' --hostpath $(vmShare) --automount
	
js :
	sencha create jsb -a http://192.168.56.10:3000/build.html -p build/app.jsb3 
	VBoxManage guestcontrol "DyNAMiC Workbench Server" exec '/usr/bin/make' --username "webserver-user" --password " " --verbose --wait-stdout --wait-exit -- --directory='/home/webserver-user' jake 2>&1
	# VBoxManage guestcontrol exec "DyNAMiC Workbench Server" '/home/webserver-user/local/node/bin/jake' --username "webserver-user" --password " " --arguments "-C '/home/webserver-user/app' -f 'Jakefile' --trace" --verbose --wait-for stdout --environment 'HOME=/home/webserver-user PATH=$HOME/local/node/bin:$PATH'
	# sencha build -p build/app.jsb3 -d .


clean :
	rm build/*.js
	rm build/*.jsb3
	rm -rf build/vm
