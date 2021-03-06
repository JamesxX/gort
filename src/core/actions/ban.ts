import action from '../action.class';
import { executableArguments } from '../condition.class';
import { logging } from '../logging';
import { RedditProvider } from '../providers/reddit.provider';

const logger = logging.getLogger('core.action.ban');

interface BanOptions {
	banMessage?: string;
	banReason?: string;
	duration?: number;
	banNote?: string;
}

/**
 * Ban Action
 *
 * @category Actions
 */
export default class banAction extends action {
	private _sOpts: BanOptions;

	constructor(opts: BanOptions = {}) {
		super();
		this._sOpts = opts;
	}

	public override async execute(args: executableArguments) {
		logger.info(`Executing ban action on ${args.user.name}`);
		RedditProvider.Instance.getTargetSubreddit().banUser({
			name: args.user.name,
			banMessage: this._sOpts.banMessage,
			banReason: this._sOpts.banReason,
			duration: this._sOpts.duration,
			banNote: this._sOpts.banNote,
		});
	}
}
