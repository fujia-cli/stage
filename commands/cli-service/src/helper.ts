import {
	UpdateServiceCmdOptions,
	DeployViaPM2CmdOptions,
	DeployServiceCmdOptions,
} from './interface';

export const genCheckServerWorkDirCmd = (options: DeployServiceCmdOptions) => {
	const { sshPort, userName, serverIP, stackName, appDir } = options;

	const workDir = appDir ? appDir : `apps/docker/${stackName}`;

	return `
    ssh -tt -p ${sshPort} ${userName}@${serverIP} << EOF

    if [ ! -d "/home/${userName}/${workDir}" ]; then
      mkdir -p ${workDir}
    else
      rm -rf /home/${userName}/${workDir}/*
    fi

    exit
    EOF
  `;
};

export const genDeployServiceCmd = (options: DeployServiceCmdOptions) => {
	const { sshPort, userName, serverIP, stackName, appDir } = options;

	const workDir = appDir ? appDir : `apps/docker/${stackName}`;

	return `
    CUR_DIR=$(pwd)

    scp -P ${sshPort} -r $CUR_DIR/* ${userName}@${serverIP}:/home/${userName}/${workDir}

    ssh -tt -p ${sshPort} ${userName}@${serverIP} << EOF

    cd /home/${userName}/${workDir}

    docker stack deploy -c stack.yml ${stackName}

    exit
    EOF
  `;
};

export const genUpdateServiceCmd = (options: UpdateServiceCmdOptions) => {
	const { sshPort, userName, serverIP, mirrorName, repoZone, repoNamespace, serviceName } = options;

	return `
    # if you are using docker swarm, please make sure the follow ip address is the master node
    ssh -tt -p ${sshPort} ${userName}@${serverIP} << EOF

    docker service update --image ${repoZone}/${repoNamespace}/${mirrorName}:latest ${serviceName}
    exit
    EOF
  `;
};

export const genDeployServiceViaPM2Cmd = (options: DeployViaPM2CmdOptions) => {
	const { sshPort, userName, serverIP, appDir = 'apps/pm2' } = options;

	if (appDir === '/') {
		throw new Error(
			`Dangerous!!! the deploy directory must not the root directory of host machine`,
		);
	}

	return `
    ssh -tt -p ${sshPort} ${userName}@${serverIP} << EOF

    if [ ! -d "$HOME/${appDir}" ]; then
      mkdir $HOME/${appDir}
    else
      rm -rf $HOME/${appDir}/*
    fi

    exit
    EOF

    CUR_DIR=$(pwd)

    scp -P ${sshPort} -r $CUR_DIR/* ${userName}@${serverIP}:${appDir}
  `;
};
