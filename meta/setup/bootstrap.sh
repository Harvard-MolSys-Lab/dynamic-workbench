
# Add MongoDB Package
echo 'Add MongoDB Package...'
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
echo 'MongoDB Package added.'

# Update System
echo 'Update system packages...'
apt-get -y update
echo 'Update completed.'

# Install other helper apps
echo 'Install system dependencies...'
apt-get -y install libssl-dev git-core pkg-config build-essential curl gcc g++
echo 'Install completed.'

# Install JSDuck
echo 'Installing JSDuck...'
sudo gem install jsduck
echo "Installed JSDuck: `jsduck --version`"

# Install Pandoc
echo 'Installing Pandoc...'
sudo apt-get -y install pandoc texlive
echo "Installed Pandoc: `which pandoc`"
echo "Installed xelatex: `which xelatex`"


# Install NodeJS
echo 'Installing NodeJS...'
# To install the current version, you'd want to use these commands instead.
# curl -sL https://deb.nodesource.com/setup | sudo bash -
# sudo apt-get install -y nodejs
echo 'Building from source...'
NODE_VERSION="0.6.19"
wget "http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}.tar.gz"
tar -xvf node-v${NODE_VERSION}.tar.gz
cd node-v${NODE_VERSION}
./configure
make
sudo make install
echo "NodeJS install completed. Installed version: `node -v`"
echo "NodeJS installed to: `which node`"
echo "npm installed to: `which npm`"

# Install MongoDB
echo 'Install MongoDB...'
sudo apt-get install -y mongodb-org
echo "MongoDB install completed. Installed: `mongo --version`"

# Create and link relevant directories
echo 'Creating and linking user directories...'
sudo mkdir -p /mnt/dynamic-logs/logs
sudo mkdir -p /mnt/dynamic-user-data/files
sudo mkdir -p /home/webserver-user/share
sudo mkdir -p /home/webserver-user/fileshare/
sudo ln -s /mnt/dynamic-logs/logs /home/webserver-user/logs
sudo ln -s /mnt/dynamic-user-data/files /home/webserver-user/fileshare/files
sudo ln -s /mnt/infomachine2 /home/webserver-user/share/infomachine2
sudo ln -s /home/webserver-user/share/infomachine2 /home/webserver-user/app
sudo ln -s /home/webserver-user/logs /home/webserver-user/app/logs

# Change ownership
sudo chown -R webserver-user /mnt/infomachine2
sudo chown -R webserver-user /mnt/infomachine2/*
sudo chown -R webserver-user /mnt/dynamic-user-data
sudo chown -R webserver-user /mnt/dynamic-user-data/*
sudo chown -R webserver-user /mnt/dynamic-logs 
sudo chown -R webserver-user /home/webserver-user/app/
sudo chown -R webserver-user /home/webserver-user/app/*
sudo chown -R webserver-user /home/webserver-user/logs/
sudo chown -R webserver-user /home/webserver-user/fileshare/
echo 'User setup completed.'


echo 'Setting up home directory for webserver-user...'
sudo cp -r /home/webserver-user/app/meta/home/* /home/webserver-user
sudo chown -R webserver-user /home/webserver-user
sudo chmod a+x /home/webserver-user/{repair,startup}
echo 'Home directory setup completed.'

echo 'Setting up Mongo data directory...'
sudo mkdir -p /data/db
sudo chmod 0755 /data/db
sudo chown mongodb:mongodb /data/db

# Install dependencies with npm
echo 'Installing dependencies with npm'
# tell npm to use known registrars, avoiding SSL errors
# https://github.com/npm/npm/wiki/Troubleshooting#ssl-error
sudo -H -u webserver-user sh -c 'cd /home/webserver-user/app && npm config set ca=""'
# force installation of latest dependencies from package.json
# use sudo so we can execute in context of webserver-user
# use -H to export home directory to subshell
# http://askubuntu.com/questions/338447/why-doesnt-home-change-if-i-use-sudo
sudo -H -u webserver-user sh -c 'cd /home/webserver-user/app && npm install && npm update'
echo 'Dependency installation completed.'

# Build bundled tools
echo 'Building tools...'
sudo -H -u webserver-user sh /home/webserver-user/app/meta/setup/tools.sh 
echo 'Building tools completed.'


# Setup auto-start
echo 'Setting up Workbench to auto-start...'
sudo cp /home/webserver-user/app/meta/etc/init/workbench.conf /etc/init/workbench.conf
echo 'Completed.'


echo 'Starting workbench...'
sudo start workbench
echo 'Completed.'
echo "Workbench status: `sudo status workbench`"
export IP="`ifconfig eth1 2>/dev/null|awk '/inet addr:/ {print $2}'|sed 's/addr://'`"
echo "IP address: ${IP}"
echo "Setup completed. Use vagrant ssh to enter the virtual machine, or open http://$IP:3000 in a browser."
