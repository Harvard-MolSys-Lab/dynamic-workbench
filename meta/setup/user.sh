# Setup user
echo 'Setting up webserver-user...'
sudo useradd webserver-user -m -u 10000

# Allow vagrant to sudo as webserver-user
sudo echo $'\nvagrant\tALL=(webserver-user) NOPASSWD:ALL\n' >> /etc/sudoers

# Allow to ssh as webserver-user using
# # vagrant ssh -- -l webserver-user
# sudo -H -u webserver-user sh -c 'mkdir -p /home/webserver-user/.ssh/'
# sudo cp /home/vagrant/.ssh/authorized_keys /home/webserver-user/.ssh/authorized-keys
# sudo chmod 600 /home/webserver-user/.ssh/authorized-keys
# sudo chown webserver-user:vagrant /home/webserver-user/.ssh/authorized-keys

# Set password for webserver-user
echo 'webserver-user: ' | sudo chpasswd
echo 'Done setting up webserver-user.'