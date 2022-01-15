import { Comment, RedditUser, Submission } from 'snoowrap';
import { RedditProvider } from '../core/providers/reddit.provider';
import { subredditStream } from '../core/providers/streamable.provider';
import Discord from 'discord.js';
import { DiscordProvider } from '../core/providers/discord.provider';

import { logging } from '../core/logging';
import brigadeManager from '../core/managers/brigade.manager';

const logger = logging.getLogger('bot.astro');

interface astroNotifyInterface {
	type: 'Comment' | 'Submission';
	target: Comment | Submission;
	keyword?: string;
	linked?: string;
}

export default class astro {
	private _channelID: string = '931921060826349578'; // Brigades channel

	private _listOfSubreddits: string[] = [
		'NoNewNormal',
		'LockdownSkepticism',
		'badunitedkingdom',
		'coronaviruscirclejerk',
		'ukantilockdown',
		'watchredditdie',
		'banned',
		'badmods',
		'testingground4bots',
		'europe',
		'coronavirus',
		'ivermectin',
		'LockdownSceptics',
		'antiwork',
		'samharris',
	];

	private _listOfKeywords: string[] = [
		'coughuk',
		'coronavirusuk',
		'coofuk',
		'coviduk',
		'covuk',
		'coronauk',
		'ronauk',
	];

	private _stream: subredditStream;

	public constructor() {
		this._stream = new subredditStream(
			RedditProvider.Instance,
			this._listOfSubreddits.join('+')
		);
		this._stream.on('comment', this.onComment.bind(this));
		this._stream.on('submission', this.onSubmission.bind(this));
		this._stream.on('error', this.onError.bind(this));
	}

	private onComment(user: RedditUser, comment: Comment): void {
		let result: astroNotifyInterface = {
			type: 'Comment',
			target: comment,
		};

		// Check comment body for link
		result.linked = this.containsLinkToSubreddit(comment.body_html);

		// Check comment body for keyword
		result.keyword = this.containsKeyword(comment.body_html);

		// Output
		void this.output(result);
	}

	private onSubmission(user: RedditUser, submission: Submission): void {
		let result: astroNotifyInterface = {
			type: 'Submission',
			target: submission,
		};

		// Check submission link
		result.linked =
			this.containsLinkToSubreddit(submission.url ?? '') ??
			this.containsLinkToSubreddit(submission.selftext_html ?? '');

		// check submission body for keyword
		result.keyword = this.containsKeyword(submission.selftext_html ?? '');

		// Output
		void this.output(result);
	}

	private containsLinkToSubreddit(text: string): string | undefined {
		const match = text.match(
			/(?:(?:https?:\/\/)?(?:(?:www|old|new|i|m|[a-z]{2})\.)?reddit\.com)?\/r\/CoronavirusUK\/(?:comments\/)?(?<target>[a-z0-9]{6})/gm
		);
		if (match != null && match.length > 0) {
			console.log(match);
			return match.pop();
		}
		return undefined;
	}

	private containsKeyword(text: string): string | undefined {
		// ensure lowercase
		const input = text.toLowerCase();
		this._listOfKeywords.forEach((keyword) => {
			if (input.includes(keyword)) {
				return keyword;
			}
		});
		return undefined;
	}

	private onError(...data: any[]) {}

	private async output(item: astroNotifyInterface) {
		if (
			(item.keyword == undefined || null) &&
			(item.linked == undefined || null)
		) {
			return; // Do nothing
		}

		// Log output in console
		logger.info(
			`${item.type} from ${item.target.author.name} on ${item.target.subreddit_name_prefixed}`
		);

		item.target.subreddit.fetch().then( (subreddit) => {
			// Add entry to brigadeManager
			brigadeManager.Instance.addBrigadeEntry(
				subreddit.display_name, // origin
				item.target.author.name, // originator
				item.linked? // TO DO: Get target thread id from linked string
			);
		})


		// Notify discord
		let embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle("We've been mentioned!")
			.setURL('http://reddit.com' + item.target.permalink + '?context=2')
			.setAuthor({ name: item.target.author.name })
			.setTimestamp();
		if (item.type == 'Comment') {
			embed.setDescription((<Comment>item.target).body_html);
		} else {
			embed.setDescription(
				'Linked by top level post: ' + (<Submission>item.target).url
			); // TO DO: Check that this is actually doing what I expect it to be doing
		}
		embed
			.addFields(
				{
					name: 'Subreddit',
					value: item.target.subreddit_name_prefixed,
				}
				//{ name: 'Thread Title', value: item.target. }
			)
			.setFooter({ text: 'Provided by CensorshipCo' });
		DiscordProvider.Instance.sendMessage(
			{ embeds: [embed] },
			this._channelID
		);
	}
}