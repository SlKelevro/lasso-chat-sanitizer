# Lasso ChatGPT Sanitizer Browser Extension

## Technical details

Tech stack:
* TypeScript
* React + React Compiler
* PNPM (important! project uses `pnpm-lock.yaml`, not `package-lock.json`)
* Vite

For development mode use `pnpm run prod-watch` command, it will keep the `dist/` folder up to date with code changes.

For a finalized prod build use `pnpm run build`.

----

## Functionality

This extension prevents submitting any emails in ChatGPT prompts. If any are found in the user's message - a pop-up appears that lists emails found in the prompt and allows several actions:
- hide notifications about some of the emails for 24hrs (per-email setting)
- acknowledge presence of email addresses and proceed (note that all mails will still be anonymized)
- get back to editing message to remove emails from text

**Important note**: dismissing/hiding notifications does exactly that. Considering that the purpose of the extension is to anonymize the data, emails are always stripped from the chat prompts. Dismissing specific emails simply disables notifications about their occurrence in text.