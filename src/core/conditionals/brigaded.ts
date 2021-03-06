import { Comment } from 'snoowrap';
import { executable, executableArguments } from '../condition.class';
import brigadeManager from '../managers/brigade.manager';

export class brigadeOrigin extends executable<string> {
	public override async execute(args: executableArguments): Promise<string> {
		// Get threadID
		if (args.targetType == 'Submission') return ''; // New threads can't be brigaded
		const threadID: string = (<Comment>args.target).link_id.slice(3);
		// Check if thread is on brigaded list
		if (await brigadeManager.Instance.isTargetOnBrigadeList(threadID)) {
			const info = await brigadeManager.Instance.getBrigadeEntryInfo(
				threadID
			);
			return info.origin;
		}
		return '';
	}
}
