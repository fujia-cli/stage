import { readdir, rename } from 'fs/promises';
import path from 'path';
import CliCommand from '@fujia/cli-command';
import log from '@fujia/cli-log';
import CliPackage from '@fujia/cli-package';
import {
	spinnerInstance,
	sleep,
	NewEnvVariables,
	EJS_IGNORE_FILES,
	STAGE_CLI_TEMPLATES_DIR,
} from '@fujia/cli-utils';
import fse from 'fs-extra';
import ejs from 'ejs';
import glob from 'glob';
import { pathExistSync } from '@fujia/check-path';

import { TEMPLATE_MAP_PKG, TEMPLATE_TYPE_LIST, templateFileNameRe } from './constants';
import { inquireSelectTempType, inquireComponentName } from './inquirer-prompt';
import { ComponentTypeList } from './interface';
import { isValidComponentName, convertCamelOrPascalName } from './helper';

export class ComponentCommand extends CliCommand {
	templateType?: ComponentTypeList;
	destination: string;
	templatePkg?: CliPackage;
	componentName: string;
	constructor(args: any[]) {
		super(args);
		this.destination = this.argv[0] || process.cwd();
		this.componentName = '';
	}

	init() {
		if (this.cmd?.template) {
			this.templateType = this.cmd.template as ComponentTypeList;
		}
		this.componentName = this.argv[0];
		this.destination = this.argv[1];

		log.verbose(
			'[cli-component]',
			`
      argv: ${this.argv.join(', ')}
      componentName: ${this.componentName}
      templateType: ${this.templateType}
      destination: ${this.destination}
    `,
		);
	}

	async exec() {
		try {
			await this.prepare();
			await this.downloadTemplate();
			await this.installTemplate();
		} catch (err: any) {
			log.error('', `err?.message`);
			throw err;
		}
	}

	async prepare() {
		await this.checkCompName();
		await this.checkTempType();
	}

	async checkCompName() {
		if (!isValidComponentName(this.componentName)) {
			log.warn('', `the value of ${this.componentName} is invalid, please re-input!`);

			this.componentName = (await inquireComponentName()).componentName;
		}
	}

	async checkTempType() {
		if (!TEMPLATE_TYPE_LIST.includes(this.templateType!)) {
			log.warn(
				'',
				`the value of ${this.templateType} is invalid, please select from the following options!`,
			);
			this.templateType = (await inquireSelectTempType()).templateType;
		}
	}

	async downloadTemplate() {
		const homeDir = process.env[NewEnvVariables.USER_HOME];
		const localPath = path.resolve(homeDir!, '.stage-cli', STAGE_CLI_TEMPLATES_DIR);
		const storeDir = path.resolve(localPath, 'node_modules');
		const { npmName, version } = TEMPLATE_MAP_PKG[this.templateType as ComponentTypeList];

		const templatePkg = new CliPackage({
			localPath,
			storeDir,
			name: npmName,
			version,
		});
		log.verbose(
			'[cli-component]',
			`template downloading: {
      localPath: ${localPath},
      storeDir: ${storeDir},
      name: ${npmName},
      version: ${version},
    }`,
		);

		if (!(await templatePkg.exist())) {
			const spinner = spinnerInstance('template downloading...');
			// NOTE: if install's speed are quickly, hold on one second!
			await sleep();
			try {
				await templatePkg.install();
				spinner.stop(true);
				log.success('', 'Downloaded template successfully!');
				this.templatePkg = templatePkg;
			} catch (error) {
				spinner.stop(true);
				throw error;
			}
			return;
		}

		const spinner = spinnerInstance('template updating...');
		// NOTE: if install's speed are quickly, hold on one second!
		await sleep();
		try {
			await templatePkg.update();
			spinner.stop(true);
			log.success('', 'Updated template successfully!');
			this.templatePkg = templatePkg;
		} catch (error) {
			spinner.stop(true);
			throw error;
		}
	}

	async installTemplate() {
		// NOTE: copy template code to current directory
		const cacheFilePath = this.templatePkg?.cacheFilePath;

		if (!cacheFilePath) {
			log.warn('', 'The cached file path is not exist!');
			return;
		}

		const templatePath = path.resolve(cacheFilePath, 'template');
		fse.ensureDirSync(templatePath);

		log.verbose('[cli-component]', 'starting install component template ...');

		const spinner = spinnerInstance('template installing...');
		await sleep();

		const cwdPath = process.cwd();
		const destDir = this.destination ? path.resolve(cwdPath, this.destination) : cwdPath;
		const newCompDir = path.resolve(destDir, convertCamelOrPascalName(this.componentName, true));

		log.verbose('[cli-component]', `the destination folder: ${destDir}`);
		log.verbose('[cli-component]', `the new component directory: ${newCompDir}`);

		if (!pathExistSync(newCompDir)) {
			fse.ensureDirSync(newCompDir);
		} else {
			fse.emptyDirSync(newCompDir);
		}

		try {
			fse.copySync(templatePath, newCompDir);
		} catch (err) {
			throw err;
		} finally {
			spinner.stop(true);
			log.success('', 'template installed successfully!');
		}

		const ejsData = {
			rawName: this.componentName,
			camelName: convertCamelOrPascalName(this.componentName),
			pascalName: convertCamelOrPascalName(this.componentName, true),
		};

		await this.ejsRender(ejsData, newCompDir);

		await this.renameTemplateFileName(newCompDir);
	}

	async renameTemplateFileName(newCompDir: string) {
		log.verbose(
			'[cli-component]',
			`
      newCompDir: ${newCompDir}
      compName: ${this.componentName}
      `,
		);
		const readTempDir = await readdir(newCompDir);

		for await (const fileName of readTempDir) {
			const newFileName = fileName.replace(/(__template__)/i, `${this.componentName}`);

			if (templateFileNameRe.test(fileName)) {
				await rename(`${newCompDir}/${fileName}`, `${newCompDir}/${newFileName}`);
			}
		}
	}

	ejsRender(data = {}, destDir?: string, ignoreFiles = EJS_IGNORE_FILES) {
		const workDir = destDir || process.cwd();
		return new Promise((resolve, reject) => {
			glob(
				'**',
				{
					cwd: workDir,
					ignore: ignoreFiles,
					nodir: true,
				},
				(err, files) => {
					if (err) {
						reject(err);
					}

					Promise.all(
						files.map((file) => {
							const filePath = path.join(workDir, file);

							return new Promise((innerResolve, innerReject) => {
								ejs.renderFile(filePath, data, (err, res) => {
									if (err) {
										return innerReject(err);
									}
									fse.writeFileSync(filePath, res);
									innerResolve(res);
								});
							});
						}),
					)
						.then(() => {
							resolve(true);
						})
						.catch((err) => {
							reject(err);
						});
				},
			);
		});
	}
}

function componentCmd(args: any[]) {
	return new ComponentCommand(args);
}

export default componentCmd;
