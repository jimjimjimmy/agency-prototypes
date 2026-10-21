# Slack etiquette - agency-prototypes

Work channel: #ai-workflows in typographic.slack.com. Important work goes top-level in that channel, never in threads.

## On session start, before building

1. Read the full #ai-workflows history, not just new messages. On reconnect, re-read everything. A restarted listener misses the gap unless it checks history.
2. React to unread messages: waving hand for greetings, thumbs up for tasks and check requests, thinking face for questions, eyes for everything else. Thumbs up means agreement, no follow-up needed. Eyes and thinking face mean reading, and must be followed by actual words in the channel.
3. Post a top-level status in #ai-workflows when the session is set up: repo, task, what you read, what is open, what you will do next. Never post status in a thread.

## While working

- Post top-level for important updates, decisions, and results. Use threads only for side detail that does not change the decision.
- Report back in channel when done, with commit, URL, or exact error. A local session note alone is not a report.
- If you cannot post as the Claude bot, do not post as Jimmy. Give the result to Muse to relay, clearly marked as Claude words, or tell Jimmy to paste it marked as Claude words. Posting as Jimmy misattributes Claude words to Jimmy.
- A reading reaction alone is not a reply. If you react with eyes or thinking face, follow with words.

## Identities

- Muse bot posts as Muse.
- Claude bot posts as Claude, when its bot token session is active.
- A Claude app chat session using Jimmy Slack integration posts as Jimmy. That session must not post agency results directly to Slack as Jimmy. Relay through Muse or through the Mac Claude Code session that has the bot token.

## How we made Claude use the bot last time

This is the setup that worked on 2026-10-18, in typographic.slack.com, not in the other workspace. Do not redo it in the wrong workspace.

Slack app for Claude: app A0CB10YR23S, named Claude. Muse app is different: A0CB10KGV5W, named Muse. Do not mix their tokens.

Jimmy pastes two tokens into Claude setup, by hand, never in chat:
1. Bot User OAuth Token, starts xoxb, from api.slack.com/apps, Claude app, OAuth and Permissions page. This is SLACK_BOT_TOKEN. It is used for Web API calls like chat.postMessage and reactions.add.
2. App-Level Token, starts xapp, from Basic Information, App-Level Tokens, for Socket Mode. This is SLACK_APP_TOKEN.

Do not use the tokens at the bottom of the app config page labeled Your App Configuration Tokens. Those expire in about 11 hours and are not the bot token.

Do not swap the two token types. Putting an xapp token in SLACK_BOT_TOKEN gives auth.test with no user_id or bot_id. Putting an xoxb token in the app-level slot fails with not_allowed_token_type.

Also allow slack.com in Claude environment settings, Network access, Limited, Allowed domains. Without that, Slack API calls were blocked by the sandbox proxy with 403, even with correct tokens.

Verification that passed on 2026-10-18, run all five before claiming bot access works:
1. Bot auth.test returns user_id U0C9R8BK739 and bot_id B0CAAAD3476.
2. App-token auth.test returns app_id A0CB10YR23S.
3. chat.postMessage to #ai-workflows succeeds.
4. reactions.add with thumbs up succeeds.
5. Threaded reply succeeds.

Before that fix, Claude had no bot token pasted, so it posted as Jimmy user account signed with Claude name. Genuine bot-identity posting began only after Jimmy pasted the correct bot token, on 2026-10-18 about 15:46 PDT.

If a new session says it cannot post as the Claude bot, check in order: is SLACK_BOT_TOKEN an xoxb token from the Claude app OAuth page, is SLACK_APP_TOKEN an xapp token from the Claude app Basic Information, is slack.com allowed in network settings, and is the workspace typographic.slack.com, not the other workspace. Do not post as Jimmy to work around a failed bot check.

## Tokens in local mode, on the Mac

Cloud sessions show a token UI in Claude app settings because there is no terminal there. Local mode, Claude Code in Terminal on the Mac, has no token UI. Tokens are environment variables in that terminal session, not in the cloud UI.

Per-session, safest, no file to leak:
1. Open Terminal on the Mac.
2. cd to the agency-prototypes folder.
3. Run: export SLACK_BOT_TOKEN="xoxb-..." and export SLACK_APP_TOKEN="xapp-..." using the same two tokens from the Claude app above.
4. Start claude in that same Terminal window.

Tokens set this way live only in that Terminal session. A new Terminal window needs them again. An already running session will not pick up tokens added after it started. You must start a new session after setting them.

Persistent option, if you do not want to export every time:
Add an env block to ~/.claude/settings.json on the Mac, with SLACK_BOT_TOKEN and SLACK_APP_TOKEN in it. Claude Code reads settings.json at startup and injects those variables into each session. Shell export takes precedence over settings.json if both are set.

Do not put tokens in a file inside agency-prototypes, and do not commit a settings file with tokens to GitHub. ~/.claude/settings.json is outside the repo, keep it that way.

After tokens are set locally, start a new session in the agency-prototypes folder. That session auto-reads CLAUDE.md from that folder, then read SLACK.md, then run the five verification steps above, then post a top-level status in #ai-workflows as the Claude bot. A resumed old session does not automatically pull in new file changes, so a new session is the clean re-read, not a resume.
