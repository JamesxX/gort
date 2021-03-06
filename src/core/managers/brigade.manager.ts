import { logging } from '../logging';
import mongoose from '../providers/database.provider';

const BrigadeEntrySchema = new mongoose.Schema(
	{
		origin: String,
		originator: String,
		target: String,
	},
	{ strict: false }
);

export const BrigadeEntry = mongoose.model('brigadeentry', BrigadeEntrySchema);

const logger = logging.getLogger('core.manager.brigadeManager');

export default class brigadeManager {
	private static _instance?: brigadeManager;
	public static get Instance(): brigadeManager {
		return this._instance || (this._instance = new brigadeManager());
	}
	private constructor() {}

	public async addBrigadeEntry(
		origin: string,
		originator: string,
		target: string
	): Promise<any> {
		// Check that it isn't already on the list somehow?

		const entry = new BrigadeEntry({
			origin: origin.toLowerCase(),
			originator: originator.toLowerCase(),
			target: target.toLowerCase(),
		});
		entry.save();
		logger.info(`Adding BrigadeEntry: Origin ${origin}, target ${target}`);
		return entry;
	}

	public async isTargetOnBrigadeList(target: string): Promise<boolean> {
		return (await BrigadeEntry.exists({ target: target.toLowerCase() }).exec()) != null;
	}

	public async getBrigadeEntryInfo(target: string): Promise<any> {
		return BrigadeEntry.findOne({ target: target.toLowerCase() }).exec();
	}

	public static stringContainsBrigadeLink(
		text: string
	): IStringContainsBrigadeLinkResults[] {
		let results: IStringContainsBrigadeLinkResults[] = [];

		const Regex = new RegExp(
			`(?:(?:https?:\/\/)?(?:(?:www|old|new|i|m|[a-z]{2})\\.)?(?:reddit|reveddit)\\.com)?\/(?:r|v)\/${process.env.REDDIT_SUBREDDIT}\/(?:comments\/)?(?<target>[a-z0-9]{6})`, "gm")
		const matches = text.matchAll(Regex);

		for (const match of matches) {
			results.push({
				bContainsLink: true,
				sInput: text,
				sTargetID: match[1],
				match: match[0],
			});
		}

		return results;
	}
}

export interface IStringContainsBrigadeLinkResults {
	bContainsLink: boolean;
	sInput: string;
	sTargetID: string;
	match?: string;
}
