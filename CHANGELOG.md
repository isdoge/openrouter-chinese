# Changelog

## 0.1.10 - 2026-09-02

- Added homepage hero and footer translations such as `Discover`, `Trust Center`, and `Developer Platform`.
- Added models-page filter labels including weekly tokens, throughput, discounts, and zero data retention.
- Enabled the userscript on `/benchmarks` and added benchmarks-page translations with title rule.
- Added rankings-page translations for the leaderboard, measurement methodology, licensing notes, and split-link fragments.
- Added server-tools catalog translations covering web access, multi-model, code execution, and utility tools.
- Added workspace translations for files, default guardrails, routing, presets, budgets, and server tools overview.
- Added account settings translations for profile usage summary, activity charts, credits, management keys, notifications, and 18+ attestation.
- Added API key detail translations for expiration, credit limit, and 30-day spend labels.
- Fixed queued re-translations never running in background tabs by adding a `setTimeout` fallback when `requestAnimationFrame` does not fire.

## 0.1.9 - 2026-07-29

- Added rankings translations for LLM, image, embedding, rerank, video, speech, and transcription leaderboards.
- Added workspace overview, guardrail budget/model access, classifier, logs, and privacy settings translations.
- Updated userscript metadata with Chinese description, author, and icon.

## 0.1.8 - 2026-05-26

- Added stable homepage footer and card label translations such as provider counts and weekly trend labels.
- Updated README coverage notes to include the OpenRouter homepage.

## 0.1.7 - 2026-05-26

- Enabled the userscript on the OpenRouter homepage while keeping non-target public pages outside the runtime allowlist.
- Added homepage translations for the hero section, stable feature cards, onboarding steps, and stable section headings.

## 0.1.6 - 2026-05-26

- Added BYOK provider-detail translations for key management labels, ordering hints, and provider-specific page titles.
- Added BYOK web-search translations for Firecrawl onboarding copy and terms text.
- Added plugin-page translations for the settings info tooltip and Pareto Router labels.

## 0.1.5 - 2026-05-26

- Added guardrail detail-page translations for budget policies, model/provider access, prompt injection, and sensitive info sections.
- Added dynamic translations for labels such as `Clear all`, `Remove <name>`, and `<count> allowed`.
- Translate `document.title` during each run so page titles like `Guardrails | OpenRouter` follow the same dictionary.

## 0.1.4 - 2026-05-26

- Added API key detail-page translations for titles, descriptions, budget labels, status labels, and model-count badges.
- Moved exact-match checks ahead of sensitive-value filtering so safe short labels like `N/A` can still be translated.

## 0.1.3 - 2026-05-26

- Renamed the public userscript display name to `OpenRouter 中文化插件`.
- Simplified userscript metadata to a single `https://openrouter.ai/*` match with runtime path allowlisting.
- Aligned source, dist, and install URLs around `openrouter-chinese.user.js`.
- Refreshed README screenshots and installation docs for the GitHub release flow.

## 0.1.2 - 2026-05-21

- Added GitHub install metadata and public-facing project files.
- Added OpenRouter top-level page coverage for labs, apps, rankings, chat, fusion, and models.
- Improved translations for presets, I/O logging settings, profile statistics, labs, apps, rankings, chat, fusion, and model filters.
- Fixed model price units when `tokens` had already been partially translated to `Token`.

## 0.1.1 - 2026-05-21

- Expanded live-page translations from workspaces/settings pages to OpenRouter public navigation pages.
- Added runtime split-text handling for headings rendered by React across multiple text nodes.

## 0.1.0 - 2026-05-20

- Initial Tampermonkey userscript for OpenRouter workspaces and account settings pages.
