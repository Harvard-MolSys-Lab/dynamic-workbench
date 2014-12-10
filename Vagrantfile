# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "hashicorp/precise64"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080
  # config.vm.network "forwarded_port", guest: 3000, host: 3000

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "private_network", ip: "192.168.56.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # If true, then any SSH connections made will enable agent forwarding.
  # Default value: false
  # config.ssh.forward_agent = true


  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # provision shared folders
  # virtualbox shared folders don't support modifications to POSIX permissions
  # http://superuser.com/questions/640027/why-cant-i-chown-a-virtualbox-shared-directory
  # 
  # so instead we assign appropriate ownership now. However, provisioning to create 
  # `webserver-user` doesn't run until after these filesystems are mounted.
  # so we manually assign the UID to the one we'll create later for `webserver-user`
  # http://stackoverflow.com/questions/17966365/vagrant-chicken-and-egg-shared-folder-with-uid-apache-user
  mount_options = ["uid=10000"]
  config.vm.synced_folder ".", "/mnt/infomachine2", :mount_options => mount_options #, owner: 'webserver-user'
  config.vm.synced_folder "../logs", "/mnt/dynamic-logs", create: true, :mount_options => mount_options #, owner: 'webserver-user'
  config.vm.synced_folder "../../fileshare", "/mnt/dynamic-user-data", create: true, :mount_options => mount_options #, owner: 'webserver-user'

  # provision with shell script
  config.vm.provision :shell, path: "meta/setup/user.sh"
  config.vm.provision :shell, path: "meta/setup/bootstrap.sh"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Don't boot with headless mode
  #   vb.gui = true
  #
  #   # Use VBoxManage to customize the VM. For example to change memory:
  #   vb.customize ["modifyvm", :id, "--memory", "1024"]
  # end
  #
  # View the documentation for the provider you're using for more
  # information on available options.
end
