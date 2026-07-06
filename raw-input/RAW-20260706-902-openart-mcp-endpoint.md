# RAW-20260706-902 - OpenArt MCP Endpoint

Source channel: codex_chat
Captured at: 2026-07-06
Parse status: registered

## Raw Operator Input

> https://mcp.openart.ai/mcp

## Parsed Items

- `REQ-20260706-902`: Treat `https://mcp.openart.ai/mcp` as the canonical OpenArt MCP endpoint for the One Time AI Studio integration scope.
- `TASK-20260706-902`: When Studio implementation resumes, design the OpenArt adapter around an auth-required MCP connection. The operator or account owner still needs to complete OpenArt signup/auth before live calls, model access, usage limits, and rights/cost behavior can be verified.

## Quick Readback

- Opening the endpoint directly returned `401 Unauthorized`, which is expected for a protected MCP endpoint without OpenArt auth/token context.
- This does not require the Studio operator to manually browse OpenArt during normal use once our app has a properly authorized backend/tool connection.
