## Usage

You can run the Worker defined by your new project by executing `wrangler dev` in this
directory. This will start up an HTTP server and will allow you to iterate on your
Worker without having to restart `wrangler`.

### Types and autocomplete

This project also includes a pyproject.toml file with some requirements which
set up autocomplete and type hints for this Python Workers project.

To get these installed you'll need `uv`, which you can install by following
https://docs.astral.sh/uv/getting-started/installation/.

Once `uv` is installed, you can run the following:

```
uv venv
uv sync
```

Then point your editor's Python plugin at the `.venv` directory. You should then have working
autocomplete and type information in your editor.

# cf_ai_study_assistant

An AI-powered study assistant built on Cloudflare Workers.

## Features
- Chat with Llama 3.1
- Persistent memory using Durable Objects
- Cloudflare edge deployment
- AI tutoring for programming and Cloudflare careers

## Tech Stack
- Cloudflare Workers (Python)
- Workers AI (Llama 3.1)
- Durable Objects
- HTML / CSS / JavaScript



## Architecture

User Browser  
↓  
Cloudflare Worker (Python)  
↓  
Durable Object (session memory)  
↓  
Workers AI (Llama 3.1)


## Deploy
npx wrangler deploy

## Live Demo
https://cf_ai_chat_agent.arcansesmarkdominic.workers.dev
