# OpenAI Key Diagnostics - 2026-07-02T15:42:03.534Z

Overall: PASS

## Source Metadata

- process.env:OPENAI_API_KEY: present=false; length=0; normalized_length=0; fingerprint=none; quotes=false; newline=false; carriage_return=false; bom=false; normalization_changed=false
- keyholder:openaiv2.txt: present=true; length=164; normalized_length=164; fingerprint=f74957cf4b14; quotes=false; newline=false; carriage_return=false; bom=false; normalization_changed=false
- keyholder:openai-api-key.txt: present=false; length=0; normalized_length=0; fingerprint=none; quotes=false; newline=false; carriage_return=false; bom=false; normalization_changed=false
- .secrets/openai-api-key.txt: present=true; length=165; normalized_length=164; fingerprint=02079c0b5ca1; quotes=false; newline=false; carriage_return=false; bom=true; normalization_changed=true
- .env.local:OPENAI_API_KEY: present=true; length=164; normalized_length=164; fingerprint=df69acc2e029; quotes=false; newline=false; carriage_return=false; bom=false; normalization_changed=false

## Environment

- selected_source: keyholder:openaiv2.txt
- env_file_equality: false
- OPENAI_BASE_URL present: true
- OPENAI_ORG present: false
- OPENAI_PROJECT present: false

## Railway

- attempted: true
- ok: true
- OPENAI_API_KEY present=true; length=164; fingerprint=f74957cf4b14; normalization_changed=false

## Live Checks

- /v1/models: status=200; request_id=09512788-3a68-46b0-b086-d548787909d6; error_type=none; error_code=none; message=none
- /v1/responses: status=200; request_id=e5a815e5-62bc-48e5-b1ba-f9b0ae6d38c0; error_type=none; error_code=none; message=none
