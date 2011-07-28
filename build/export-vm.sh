#!/bin/sh

export OUTNAME="DyNAMiC Workbench Server (0.3.0)"
mkdir ./vm
VBoxManage export "DyNAMiC Workbench Server" -o ./vm/test.ovf --product ${OUTNAME}
VBoxManage import ./vm/test.ovf
VBoxManage sharedfolder remove ${OUTNAME} 'vmshare'
VBoxManage createdir ${OUTNAME} '/home/webserver-user/share/infomachine2'
VBoxManage cp ../ '/home/webserver-user/share/infomachine2'
VBoxManage export ${OUTNAME} -o './vm/out.ova' --product ${OUTNAME}
