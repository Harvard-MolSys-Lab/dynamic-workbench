.PHONY : src
.PHONY : src-share
.PHONY : build
.PHONY : meta-backup
.PHONY : meta

deploy : build
	rm -rf ~/src

src:
	rsync -avz ~/share/infomachine2/ ~/src/ --exclude '.git' --exclude 'old' --exclude '*.zip' --exclude '*.dmg' --exclude '*.ova'
	rm ~/app
	ln -s ~/src ~/app
	rm ~/logs
	ln -s ~/app/logs ~/logs

src-share:
	rm ~/app
	ln -s ~/share/infomachine2 ~/app
	rm ~/logs
	ln -s ~/app/logs ~/logs
	
build:
	mkdir -p ~/out/static/client
	cp -R ~/share/infomachine2/static/client/login.js ~/out/static/client/login.js
	cp -R ~/share/infomachine2/static/client/bootstrap.js ~/out/static/client/bootstrap.js
	
	rsync -avz ~/share/infomachine2/ ~/out/ --exclude 'static/client/*' --exclude '.git' --exclude 'old' --exclude '*.zip' --exclude '*.dmg' --exclude '*.ova'
	rm ~/out/static/client/lib
	ln -s ~/out/static/lib ~/out/static/client/lib 
	
	rm ~/app
	ln -s ~/out ~/app
	rm ~/logs
	ln -s ~/out/logs ~/logs
	
meta-backup:
	cp -f -r /etc/init/workbench.conf ~/app/meta/etc/init/workbench.conf
	cp -f -r ~/Makefile ~/app/meta/home/Makefile
	cp -f -r ~/startup ~/app/meta/home/startup
	cp -f -r ~/repair ~/app/meta/home/repair

meta: src-share
	cp ~/app/meta/etc/init/workbench.conf /etc/init/workbench.conf
	cp ~/app/meta/home/Makefile ~/Makefile
	cp ~/app/meta/home/startup ~/startup
	cp ~/app/meta/home/repair ~/repair

