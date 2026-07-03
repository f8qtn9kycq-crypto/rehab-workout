# Localization Style Guide

The app supports Traditional Chinese and English. Product, UX, fitness, rehab, and user-facing explanations should default to Taiwan Traditional Chinese unless the user asks otherwise.

Use English for:

- code
- file names
- constants
- branch names
- PR titles
- Codex prompts

## Tone

The product voice should feel:

- plain
- friendly
- reassuring
- action-oriented
- safety-aware
- not overly clinical
- not literal or robotic

Use emotionally supportive wording without making medical certainty claims.

## Traditional Chinese Rules

zh-TW mode should use Taiwan Traditional Chinese.

Rules:

- Avoid Simplified Chinese leakage.
- Avoid awkward literal translation from English.
- Prefer plain wording active-aging users can understand quickly.
- Keep safety warnings direct and visible.
- Do not weaken safety meaning to make text sound friendlier.
- Avoid diagnosis or cure claims.

Preferred safety wording:

```text
如果疼痛增加、出現麻木無力，或感覺不穩，請停止本次訓練，並建議諮詢醫師或物理治療師。
```

Preferred professional referral wording:

```text
建議諮詢醫師或物理治療師
```

## English Rules

English mode should not leak Traditional Chinese content.

Preferred English style:

```text
Stop if pain increases during the movement.
Move slowly and stay in control.
Use a smaller range of motion if this feels uncomfortable.
Consider checking with a physician or physical therapist.
```

Avoid:

- overly clinical language
- guaranteed outcomes
- cure claims
- “safe for everyone” wording
- literal Chinese-English phrasing

## Glossary

Keep terms consistent when changing copy.

| Concept | zh-TW preferred | English preferred |
| --- | --- | --- |
| Safety gate | 安全檢查 | Safety check |
| Red flags | 警訊 | Red flags |
| Recovery mode | 恢復模式 | Recovery mode |
| Regression | 降階動作 | Easier option |
| Progression | 進階變化 | Progression |
| Pain scale | 疼痛程度 | Pain level |
| Stop training | 停止本次訓練 | Stop this session |
| Physical therapist | 物理治療師 | physical therapist |

## Translation QA

When translation changes are made, check:

- zh-TW mode has no English leakage unless intentional.
- English mode has no unintended Traditional Chinese leakage.
- Safety wording is not weakened.
- Pain thresholds retain the same meaning.
- Buttons and labels fit on mobile.
- Touch targets remain usable.
- The copy can be understood within a short scan.

Run the repeatable guardrail audit when changing English copy, zh-TW copy, or exercise text:

```bash
npm run audit:safety-i18n
```

This command catches obvious unsafe claim phrases and unintended Traditional Chinese leakage in English-visible UI files. It is a guardrail, not a replacement for human review of tone and safety meaning.

## Reviewer Guidance

Translation and localization findings are P1 when:

- mixed-language UI reduces trust
- primary controls are unclear
- safety warnings are ambiguous
- wording implies diagnosis or cure
- mobile labels are too dense to scan

Translation findings can be P0 when:

- safety meaning changes
- red-flag blocking becomes unclear
- pain >=6 stop guidance is weakened
- users could reasonably start unsafe training because of copy

## External Review Notes

Gemini can be used for large-context UX and language comparison.

Perplexity can be used for source-backed references on plain-language health communication or active-aging accessibility.

Do not let external tools directly edit code or override repo-tracked workflow files.
