# Setup user
echo 'Setting up webserver-user...'
sudo useradd webserver-user -m -u 10000
sudo echo $'\nvagrant\tALL=(webserver-user) NOPASSWD:ALL\n' >> /etc/sudoers
