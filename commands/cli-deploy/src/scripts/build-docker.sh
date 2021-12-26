#!/bin/bash

# 1. build image
docker build -t $CI_PROJECT_NAME:$CI_COMMIT_TAG .

# 2. fetch image id
IMAGE_ID=$(docker image ls -q $CI_PROJECT_NAME:$CI_COMMIT_TAG)

# 3. use free container mirror service and login private repository，recommended:
#       - aliyun(https://help.aliyun.com/document_detail/257112.html?spm=5176.166170.J_5253785160.5.93cf5164mGxRDG)
#       - tencent(https://console.cloud.tencent.com/tcr)
docker login --username=1239138462@qq.com --password='Fujia-092023' $IMAGE_URL

docker tag $IMAGE_ID $IMAGE_URL/fujia-site/www.fujia.site:$CI_COMMIT_TAG

# 4. push to your private repository
docker push $IMAGE_URL/fujia-site/www.fujia.site:$CI_COMMIT_TAG
