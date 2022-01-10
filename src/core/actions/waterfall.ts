import action from '../action.class';
import Snoowrap from 'snoowrap';
import { logging } from '../logging';
import { executableArguments } from '../condition.class';

const logger = logging.getLogger('core.action.waterfall');

export default class waterfallAction extends action {
	private _waterfall: action[];

	constructor(...args: action[]) {
		super();
		this._waterfall = args;
	}

	public override async execute(args: executableArguments) {
		logger.info(`Executing waterfall action...`);
		this._waterfall.forEach(async (element) => await element.execute(args));
		logger.info(`Executing waterfall action... finished`);
	}
}
