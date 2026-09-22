# OpenAI Key Diagnostics - 2026-06-14T09:23:26.662Z

Overall: FAIL

## Source Metadata

- process.env:OPENAI_API_KEY: present=false; length=0; normalized_length=0; fingerprint=none; quotes=false; newline=false; carriage_return=false; bom=false; normalization_changed=false
- .secrets/openai-api-key.txt: present=true; length=165; normalized_length=164; fingerprint=02079c0b5ca1; quotes=false; newline=false; carriage_return=false; bom=true; normalization_changed=true
- .env.local:OPENAI_API_KEY: present=true; length=164; normalized_length=164; fingerprint=df69acc2e029; quotes=false; newline=false; carriage_return=false; bom=false; normalization_changed=false

## Environment

- selected_source: .secrets/openai-api-key.txt
- env_file_equality: false
- OPENAI_BASE_URL present: true
- OPENAI_ORG present: false
- OPENAI_PROJECT present: false

## Railway

- attempted: true
- ok: true
- OPENAI_API_KEY present=true; length=164; fingerprint=02079c0b5ca1; normalization_changed=false

## Live Checks

- /v1/models: status=401; request_id=556cf8a6-9d0d-4cc8-983d-e457d847a788; error_type=invalid_request_error; error_code=invalid_api_key; message=Incorrect API key provided: sk-proj-********************************************************************************************************************************************************2DsA. You can find your API key at https://platform.openai.com/account/api-keys.
- /v1/responses: status=skipped; request_id=none; error_type=none; error_code=none; message=Skipped because /v1/models did not authenticate.

