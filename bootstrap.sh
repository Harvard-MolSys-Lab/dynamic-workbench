
# Add MongoDB Package
echo 'Add MongoDB Package...'
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
echo 'MongoDB Package completed'

# Update System
echo 'Update system packages...'
apt-get -y update
echo 'Update completed'

# Install other helper apps
apt-get -y install libssl-dev git-core pkg-config build-essential curl gcc g++

# Install NodeJS
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs

# Install MongoDB
echo 'Install MongoDB...'
sudo apt-get install -y mongodb-org
echo 'MongoDB install completed.'

# Setup user
echo 'Setting up webserver-user...'
sudo useradd webserver-user -m
sudo echo $'\nvagrant\tALL=(webserver-user) NOPASSWD:ALL\n' >> /etc/sudoers

# Create and link relevant directories
sudo mkdir -p /mnt/dynamic-logs/logs
sudo mkdir -p /mnt/dynamic-user-data/files
sudo mkdir -p /home/webserver-user/share
sudo mkdir -p /home/webserver-user/fileshare/
sudo ln -s /mnt/dynamic-logs/logs /home/webserver-user/logs
sudo ln -s /mnt/dynamic-user-data/files /home/webserver-user/fileshare/files
sudo ln -s /mnt/infomachine2 /home/webserver-user/share/infomachine2
sudo ln -s /home/webserver-user/share/infomachine2 /home/webserver-user/app

# Change ownership
sudo chown -R webserver-user /mnt/infomachine2
sudo chown -R webserver-user /mnt/dynamic-user-data
sudo chown -R webserver-user /mnt/dynamic-logs 
sudo chown -R webserver-user /home/webserver-user/app/
sudo chown -R webserver-user /home/webserver-user/logs/
sudo chown -R webserver-user /home/webserver-user/fileshare/
echo 'User setup completed.'


echo 'Setting up home directory for webserver-user...'
sudo cp -r /home/webserver-user/app/meta/home/* /home/webserver-user
sudo chown -R webserver-user /home/webserver-user
sudo chmod a+x /home/webserver-user/{repair,startup}
echo 'Completed.'

echo 'Setting up Mongo data directory...'
sudo mkdir -p /data/db
sudo chmod 0755 /data/db
sudo chown mongodb:mongodb /data/db

# Install dependencies with NPM
echo 'Installing dependencies with NPM'
# uncomment to force installation of latest dependencies from package.json
sudo -u webserver-user sh -c 'cd /home/webserver-user/app && npm install'
echo '(Skipping)'
echo 'Dependency installation completed.'

# Setup auto-start
echo 'Setting up Workbench to auto-start...'
sudo cp /home/webserver-user/app/meta/etc/init/workbench.conf /etc/init/workbench.conf
echo 'Completed.'


echo 'Starting workbench...'
sudo start workbench
echo 'Completed.'

echo 'Setup completed. Use vagrant ssh to enter the virtual machine.'