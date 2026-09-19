# Manual AI Chat Extraction Mode

Status: V0.1.1 production smoke verified. V0.1.2 Assisted AI Chat improvements are in development.

## Goal

Lower the first-use barrier for people who already have access to an AI chat product and do not want to create or fund an API key.

The core FlowExtract pipeline remains:

`Document -> Extract -> Validate -> Review -> Export`

## Modes

### AI Chat

1. Parse the document locally.
2. Build a prompt locally from the parsed document text and current schema.
3. Let the user explicitly click to copy the prompt and open ChatGPT, Claude, Gemini, Qwen, or another AI chat.
4. The user pastes and sends the prompt in the AI chat.
5. The user copies the AI response.
6. Let the user explicitly click to read that response from the clipboard and validate it, or paste it manually if clipboard access is blocked.
7. Parse and validate the response locally.
8. Continue through the existing Review, correction, export, persistence, and eval flow.

FlowExtract does not sign in to, automate, scrape, or read any AI chat account.

### API

The existing BYOK provider flow remains unchanged. Parsed document text is sent directly from the browser to the explicitly selected provider and region.

## Data and provenance

API extraction records `extractionMode: "api"` plus provider, model, optional region, timestamp, predictions, validation, and corrections.

Manual extraction records `extractionMode: "manual"` plus the selected chat service, timestamp, predictions, validation, and corrections.

Legacy V0.1.0 extraction records without `extractionMode` are treated as API records for UI restoration.

The raw pasted AI chat response is transient UI state and is not written to the project record, IndexedDB, or project backup.

## Validation

Manual imports reuse the existing deterministic validation engine. They keep the same behavior for Required, Type, Regex, Minimum, Maximum, strict YYYY-MM-DD dates, Unknown Fields, and Malformed AI Output.

Malformed pasted output creates an extraction result with a global validation issue so the failure is visible in Review.

## Security boundary

The generated prompt contains parsed document text. Copying it does not transmit data. Once the user pastes it into an external AI service, that service's privacy, retention, billing, and account policies apply.

No browser session reuse, cookie access, hidden API, web scraping, AI-page DOM automation, or background clipboard monitoring is part of this mode. Clipboard read and write are user-triggered convenience actions only.
