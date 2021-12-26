#!/bin/bash

# if you are using docker swarm, please make sure the follow ip address is the master node
ssh -tt -p 29999 aliyun@47.100.196.120 << EOF

docker service update --image registry.cn-shanghai.aliyuncs.com/fujia-site/www.fujia.site:0.4.7 fujia-site_web
exit
EOF
