#!/bin/sh

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install node dependencies
sudo apt-get install build-essential libssh-dev git-core -y

# Install node
#wget http://nodejs.org/dist/node-v0.4.11.tar.gz
#tar zxf node-v0.4.11.tar.gz
#cd node-v0.4.11
git clone git://github.com/joyent/node.git
cd node
git checkout v0.4.12 
./configure # --prefix=/opt/node
make -j2
sudo make install
#echo 'export NODE_PATH=/opt/node:/opt/node/lib/node_modules' >> ~/.profile # ~/.bash_profile or ~/.bashrc on some systems
# or
echo 'export PATH=$PATH:/opt/node/bin' >> ~/.profile # ~/.bash_profile or ~/.bashrc on some systems

# install npm

# From: http://apptob.org/
# chmod a+x node.sh && sudo ./node.sh

####################################
#
# Author: Ruslan Khissamov, email: rrkhissamov@gmail.com
#
####################################
# Update System
echo 'System Update'
apt-get update
echo 'Update completed'
apt-get install git-core curl python-software-properties
# Install Node.js
echo 'Install Node.js'
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install nodejs nodejs-dev
echo 'Node.js install completed'
# Install Node Package Manager
echo 'Install Node Package Manager'
curl http://npmjs.org/install.sh | sudo sh
echo 'NPM install completed'
# Install MongoDB
echo 'Install MongoDB'
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" >> /etc/apt/sources.list
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
sudo apt-get update
sudo apt-get install mongodb-10gen
echo 'MongoDB install completed.'