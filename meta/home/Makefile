.PHONY : src
.PHONY : src-share

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

meta-backup:
	cp -f -r /etc/init/workbench.conf ~/app/meta/etc/init/workbench.conf
	cp -f -r ~/Makefile ~/app/meta/home/Makefile
	cp -f -r ~/startup ~/app/meta/home/startup
	cp -f -r ~/repair ~/app/meta/home/repair

meta:
	cp ~/app/meta/etc/init/workbench.conf /etc/init/workbench.conf
	cp ~/app/meta/home/Makefile ~/Makefile
	cp ~/app/meta/home/startup ~/startup
	cp ~/app/meta/home/repair ~/repair

