import fs from 'fs';
import action from './action.class';
import { conditional, executableArguments } from './condition.class';
import { logging } from './logging';
const logger = logging.getLogger('core.rule');

export type targetType = 'Submission' | 'Comment' | 'Both';

export default abstract class ruleBase {
	abstract name: string;
	abstract targetType: targetType;
	abstract Condition: conditional;
	abstract Action: action;

	pre(args: executableArguments): boolean {
		return true;
	}
	post(args: executableArguments): void {}
}

export class ruleHandler {
	private _rulesDirectory: string = './dist/rules';
	private _ruleArray: Map<string, ruleBase> = new Map<string, ruleBase>();

	private static _instance?: ruleHandler;
	public static get Instance(): ruleHandler {
		return this._instance || (this._instance = new ruleHandler());
	}

	private constructor() {
		this.loadRules();
	}

	private loadRules(): void {
		logger.info('Loading rules ...');
		const ruleFiles = fs
			.readdirSync(this._rulesDirectory)
			.filter((file) => file.endsWith('.js'));
		for (const file of ruleFiles) {
			this.loadRule(file);
		}
	}

	private loadRule(filename: string) {
		const rules: ruleBase[] = (
			require(`../rules/${filename}`) as {
				default: { rules: ruleBase[] };
			}
		).default.rules;

		for (const rule of rules) {
			if (this._ruleArray.has(rule.name)) {
				return logger.error(`Attempting to redefine rule ${rule.name}`);
			}
			logger.info(`Loading rule: ${rule.name}`);
			this._ruleArray.set(rule.name, rule);
		}
	}

	public iterateRules(args: executableArguments) {

		args.user.fetch().then( (user) => {
			args.user = user;

			for (let [rulename, rule] of this._ruleArray) {
				if ( rule.targetType == 'Both' || args.targetType == rule.targetType ) {
					if (rule.pre(args)) {
						rule.Condition.execute(args).then((value) => {
							if (value) {
								logger.info(`Executing rule ${rulename} on ${args.target.permalink}, submitted by ${args.user.name}.`);
								return rule.Action.execute(args);
							}
						})
						.finally(() => {
							rule.post(args);
						});
					}
				}
			}
		})
	}
}
