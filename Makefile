##############################################
# Makefile
# TO BE RUN ON HOST
##############################################

.PHONY : js
.PHONY : docs
.PHONY : clean

all : js docs

docs :
	# jsduck --config ./docs.json
	vagrant ssh --command "sudo -H -u webserver-user sh -c 'cd /home/webserver-user/app && jsduck --config ./docs.json'"

js :
	# sencha create jsb -a http://192.168.56.10:3000/build.html -p build/app.jsb3 
	vagrant ssh --command "sudo -H -u webserver-user sh -c 'cd /home/webserver-user/app/ && ./meta/build/phantomjs ./meta/build/appbuilder/ext-app-builder.js --app-entry http://localhost:3000/build.html --project build/app.jsb3 --verbose'"
	vagrant ssh --command "sudo -H -u webserver-user sh -c 'cd /home/webserver-user/app && ./node_modules/.bin/jake'"  	

clean :
	rm build/*.js
	rm build/*.jsb3
	rm -rf build/vm
