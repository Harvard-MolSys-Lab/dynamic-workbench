.PHONY : js
.PHONY : vm
.PHONY : docs
.PHONY : clean

all : vm js docs

docs :
	jsduck static/client --external 'Ext' --title='InfoMachine2 Documentation' --output static/docs

vm : 
	sh ./build/export-vm.sh

js app-all.js :
	sencha create jsb -a http://192.168.56.10:3000/build -p build/app.jsb3
	sencha build -p build/app.jsb3 -d .

clean :
	rm build/*.js
	rm build/*.jsb3