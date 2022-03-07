/*
 * @Author: fujia
 * @Date: 2021-12-04 10:54:19
 * @LastEditors: fujia(as default)
 * @Description: To initialize a project
 * @FilePath: /stage/commands/cli-init/src/index.ts
 */
import path from 'path';
import { readdir, rename } from 'fs/promises';
import userHome from '@fujia/user-home';
import CliCommand from '@fujia/cli-command';
import CliPackage from '@fujia/cli-package';
import log from '@fujia/cli-log';
import fse from 'fs-extra';
import kebabCase from 'kebab-case';
import ejs from 'ejs';
import glob from 'glob';
import { spinnerInstance, sleep, spawnAsync } from '@fujia/cli-utils';

import {
	inquireProjectCategory,
	inquireTemplateType,
	inquireCleanContinued,
	inquireCleanConfirmed,
	inquireProjectInfo,
	inquireNewCustomTpl,
	inquireCustomTplInfo,
	inquireSelectTplName,
} from './inquirer-prompt';
import { getDefaultTemplates, getCustomProjectTemplates } from './getTemplate';

import { ITemplate, ProjectInfo, ProjectTemplate, TemplateType } from './interface';
import { verifyCmd, isDirEmpty, getCustomTplInfo, writeCustomTplToJson } from './utils';
import { EJS_IGNORE_FILES, STAGE_CLI_TEMPLATES_DIR, ADD_CUSTOM_TPL_TEXT } from './constants';

const NPM_IGNORE_FILES = ['gitignore', 'npmrc'];

export class CliInit extends CliCommand {
	projectName: string;
	destination: string;
	force: boolean;
	template: Array<ProjectTemplate>;
	projectInfo?: ProjectInfo;
	templateInfo?: ProjectTemplate;
	templatePkg?: CliPackage;
	templateType: TemplateType;
	customTplInfo?: ProjectTemplate;
	constructor(args: any[]) {
		super(args);
		this.projectName = '';
		this.destination = '';
		this.force = false;
		this.template = [];
		this.templateType = 'default';
	}

	init() {
		this.projectName = this.argv[0] || '';
		this.destination = this.argv[1] || process.cwd();
		this.force = !!this.cmd?.force;

		log.verbose(
			'[cli-init]',
			`
      argv: ${this.argv.join(', ')}
      projectName: ${this.projectName}
      destination: ${this.destination}
      force: ${this.force}
    `,
		);
	}

	async exec() {
		/**
		 * NOTE: steps
		 *
		 * 1, prepare stage
		 * 2, download template
		 * 3, install template
		 */
		try {
			await this.prepare();
			await this.downloadTemplate();
			await this.installTemplate();
		} catch (err: any) {
			log.error('', err?.message);

			if (process.env.LOG_LEVEL === 'verbose') {
				console.log(err);
			}
		}
	}

	async prepare() {
		/**
		 * NOTE: general idea
		 *
		 * 1, select the type of template
		 * 2, check if the template exists
		 * 3, check if the current directory empty
		 * 4, whether enable force update
		 * 5, select the type of project
		 * 6, obtain the info of project
		 */
		await this.checkCwdEmpty();

		this.templateType = (await inquireTemplateType()).templateType;

		let template: ITemplate;
		// get default templates
		if (this.templateType === 'default') {
			const projectCategory = (await inquireProjectCategory()).projectCategory;
			template = await getDefaultTemplates(projectCategory);

			if (template.data.length <= 0) throw new Error("The template doesn't exist");

			this.template = template.data;

			log.verbose(
				'[cli-init]',
				`
          template: ${template.data?.length}
        `,
			);
		} else if (this.templateType === 'custom') {
			// handle custom templates
			template = await getCustomProjectTemplates();

			if (template.data.length <= 0) {
				const isNewTpl = (await inquireNewCustomTpl()).isNewTpl;

				if (!isNewTpl) process.exit(0);

				await this.newCustomTpl();
			} else {
				await this.getOrNewCustomTpl();
			}
		}

		await this.getProjectInfo();
	}

	async checkCwdEmpty() {
		const cwdPath = process.cwd();
		const isCwdEmpty = await isDirEmpty(cwdPath);

		if (!isCwdEmpty) {
			if (!this.force) {
				// NOTE: Inquiry into whether continue creating
				const continued = (await inquireCleanContinued()).continued;

				// NOTE: if the value of continued is false, ends the process
				if (!continued) return process.exit(0);
			}

			/**
			 * NOTE: As we known, the operation of cleanup folder is very dangerous.
			 * The best practice is confirmed once more.
			 */
			const cleanConfirmed = (await inquireCleanConfirmed()).cleanConfirmed;

			if (cleanConfirmed) {
				await fse.emptyDir(cwdPath);
			}
		}
	}

	async getProjectInfo() {
		let projectDetail: ProjectInfo | undefined;
		log.verbose('[cli-init]', `this.projectName: ${this.projectName}`);

		projectDetail = await inquireProjectInfo(this.template as ProjectTemplate[], this.projectName);
		let { projectName } = projectDetail || {};

		if (!projectName && this.projectName) {
			projectName = this.projectName;
		}

		if (projectDetail && projectName) {
			projectDetail.packageName = kebabCase(projectName).replace(/^-/, '');
		}

		this.projectInfo = projectDetail;

		log.verbose(
			'[cli-init]',
			`this.projectInfo:
        packageName?: ${this.projectInfo?.packageName}
        projectName: ${this.projectInfo?.projectName}
        projectVersion: ${this.projectInfo?.version}
        projectTemplate: ${this.projectInfo?.projectTemplate}
      `,
		);
	}

	async downloadTemplate() {
		/**
		 * NOTE: basic ideas
		 *
		 * 1, Obtains the template information by the api of project's template
		 *   1.1, You may need have a set of api services
		 *   1.2, The template can publish to npm
		 *   1.3, You can store the template information in databases, such as: mongoDB, MySQL etc.
		 *   1.4, Gets the template information by request api services.
		 */
		const homeDir = await userHome();
		const localPath = path.resolve(homeDir!, '.stage-cli', STAGE_CLI_TEMPLATES_DIR);
		const storeDir = path.resolve(localPath, 'node_modules');

		if (this.templateType === 'default') {
			const selectTemplate = this.projectInfo?.projectTemplate;

			if (!selectTemplate) throw new Error('The selected template is not exist!');

			const templateInfo = this.template.find((t) => t.npmName === selectTemplate);
			this.templateInfo = templateInfo;
		}

		const { npmName, version } = this.templateInfo!;

		const templatePkg = new CliPackage({
			localPath,
			storeDir,
			name: npmName,
			version,
		});
		log.verbose(
			'[cli-init]',
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

				/**
				 * Note: there is an extra step that rename there ignore files by npm, such as: .gitignore, .npmrc etc.
				 */
				await this.ignoreFilesHandle();
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

			await this.ignoreFilesHandle();
		} catch (error) {
			spinner.stop(true);
			throw error;
		}
	}

	async ignoreFilesHandle() {
		if (this.templatePkg?.cacheFilePath) {
			const tmpDir = path.resolve(this.templatePkg?.cacheFilePath, 'template');

			if (tmpDir) {
				const readTmpDir = await readdir(tmpDir);

				for await (const fileName of readTmpDir) {
					if (NPM_IGNORE_FILES.includes(fileName)) {
						await rename(`${tmpDir}/${fileName}`, `${tmpDir}/.${fileName}`);
					}
				}
			}
		}
	}

	async installTemplate() {
		if (!this.templateInfo) throw new Error("The info of template isn't exist.");

		// NOTE: copy template code to current directory
		const cacheFilePath = this.templatePkg?.cacheFilePath;

		if (!cacheFilePath) {
			log.warn('', 'The cached file path is not exist!');
			return;
		}

		const templatePath = path.resolve(cacheFilePath, 'template');
		fse.ensureDirSync(templatePath);

		await this.installProjectTemplate(templatePath);
	}

	async installProjectTemplate(templatePath: string) {
		const { installCommand, startCommand } = this.templateInfo as ProjectTemplate;

		log.verbose(
			'[cli-init]',
			`
      installCommand: ${installCommand}
      startCommand: ${startCommand}
    `,
		);

		const spinner = spinnerInstance('template installing...');
		await sleep();
		try {
			const cwdPath = process.cwd();
			fse.copySync(templatePath, cwdPath);
		} catch (err) {
			throw err;
		} finally {
			spinner.stop(true);
			log.success('', 'template installed successfully!');
		}

		await this.ejsRender(this.projectInfo);

		/**
		 * NOTE: next steps
		 *
		 * 1, install dependencies
		 * 2, run command
		 */
		await this.execCommand(installCommand, 'Installing dependencies failed.');

		if (startCommand) {
			await this.execCommand(startCommand);
		}
	}

	async execCommand(command: string, errMsg?: string) {
		let result: number | unknown;

		if (command && command.length > 0) {
			const cmdList = command.split(' ');
			const cmd = verifyCmd(cmdList[0]);

			if (!cmd) throw new Error(`The command of ${cmd} is invalid.`);

			const args = cmdList.slice(1);

			result = await spawnAsync(cmd, args, {
				stdio: 'inherit',
				cwd: process.cwd(),
			});

			if (result !== 0) throw new Error(errMsg || '');
		}

		return result;
	}

	ejsRender(data = {}, destDir?: string, ignoreFiles = EJS_IGNORE_FILES) {
		const cwdDir = process.cwd();
		return new Promise((resolve, reject) => {
			glob(
				'**',
				{
					cwd: destDir || cwdDir,
					ignore: ignoreFiles,
					nodir: true,
				},
				(err, files) => {
					if (err) {
						reject(err);
					}

					const filterFiles = files.filter((f) => {
						const fileExt = path.extname(f);
						const validExt = ['.html', '.md', '.json', '.tsx', '.ts', '.js', '.vue'];

						return validExt.includes(fileExt);
					});

					Promise.all(
						filterFiles.map((file) => {
							const filePath = path.join(cwdDir, file);

							return new Promise((innerResolve, innerReject) => {
								ejs.renderFile(filePath, data, (err, res) => {
									if (err) {
										log.error(
											'[cli-init]',
											`
                      file: ${file},
                      err: ${err}
                    `,
										);
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

	async newCustomTpl() {
		this.templateInfo = await inquireCustomTplInfo();
		const { name } = this.templateInfo;

		const newTplObj = {
			nameList: [name],
			pkgList: [this.templateInfo],
		};

		await writeCustomTplToJson(newTplObj);
	}

	async getOrNewCustomTpl() {
		const { nameList, pkgList } = await getCustomTplInfo();

		const selectName = (await inquireSelectTplName(nameList)).tplName;

		if (selectName === ADD_CUSTOM_TPL_TEXT) {
			this.templateInfo = await inquireCustomTplInfo();

			const { name } = this.templateInfo;
			const newTplObj = {
				nameList: [name, ...nameList],
				pkgList: [this.templateInfo, ...pkgList],
			};

			await writeCustomTplToJson(newTplObj);
		} else {
			this.templateInfo = pkgList.find((s) => s.name === selectName);
		}
	}
}

function init(args: any[]) {
	return new CliInit(args);
}

export default init;
