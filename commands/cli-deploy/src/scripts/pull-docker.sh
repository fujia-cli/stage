#!/bin/bash

# if you are using docker swarm, please make sure the follow ip address is the master node
ssh -tt -p 29999 ubuntu@175.27.190.215 << EOF
docker login --username=1239138462@qq.com --password='Fujia-092023' $IMAGE_URL

docker pull $IMAGE_URL/fujia-site/www.fujia.site:$CI_COMMIT_TAG

exit
EOF
