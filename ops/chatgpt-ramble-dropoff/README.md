# ChatGPT Ramble Drop-off Queue

This folder is the repo-visible intake queue for ChatGPT-generated ramble packets.

ChatGPT sandbox paths such as `/mnt/data/...` are not visible to Codex or the background agent fleet. A packet becomes actionable only after it is placed under this repo path:

```txt
ops/chatgpt-ramble-dropoff/incoming/<packet-id>/
```

A packet contains:

```txt
packet.json
RAW.md
CODEX_PROMPT.md
MANIFEST.json
status.json
attachments/
```

The first packet is:

```txt
ops/chatgpt-ramble-dropoff/incoming/RAW-20260626-901-helper-control-plane/
```
