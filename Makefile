.PHONY : js
.PHONY : vm
.PHONY : docs
.PHONY : clean

productName = "DyNAMiC Workbench Server (0.3.0)"
vmName = "DyNAMiC Workbench Server"
vmShare = "/Users/caseygrun/vmshare/"

all : vm js docs

docs :
	jsduck static/client --external 'Ext' --title='InfoMachine2 Documentation' --output static/docs	
	
vm : 
	# VBoxManage guestcontrol exec "DyNAMiC Workbench Server" "/usr/bin/make" --username "webserver-user" --password " " --arguments "--directory='/home/webserver-user' src"
	mkdir -p build/vm
	VBoxManage export "DyNAMiC Workbench Server" -o build/vm/workbench.ova --vsys 0 --product $(productName)

unshare :
	VBoxManage sharedfolder remove $(vmName) --name 'vmshare'

share :
	VBoxManage sharedfolder add $(vmName) --name 'vmshare' --hostpath $(vmShare) --automount
	
js app-all.js :
	sencha create jsb -a http://192.168.56.10:3000/build -p build/app.jsb3
	sencha build -p build/app.jsb3 -d .

clean :
	rm build/*.js
	rm build/*.jsb3
	rm -rf build/vm
