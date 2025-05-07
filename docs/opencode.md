# OpenCode Usage Instructions

[https://github.com/opencode-ai/opencode](OpenCode) is a terminal-based AI assistant for developers, providing intelligent coding assistance directly in your terminal. See the linked README for installation instructions.

## API Keys

Copy the following to a either `$HOME/.opencode.json` or `$XDG_CONFIG_HOME/opencode/.opencode.json`. An Anthropic API Key (for Claude) is available in Bitwarden.

```json
{
  "data": {
    "directory": ".opencode"
  },
  "providers": {
    "openai": {
      "apiKey": "INSERT_API_KEY_HERE",
      "disabled": true
    },
    "anthropic": {
      "apiKey": "INSERT_API_KEY_HERE",
      "disabled": false
    },
    "groq": {
      "apiKey": "INSERT_API_KEY_HERE",
      "disabled": true
    },
    "openrouter": {
      "apiKey": "INSERT_API_KEY_HERE",
      "disabled": true
    }
  },
  "agents": {
    "coder": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 5000
    },
    "task": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 5000
    },
    "title": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 80
    }
  },
  "mcpServers": {
  },
  "lsp": {
  },
  "debug": false,
  "debugLSP": false
}
```

## Usage

At the root of this repo run `opencode`. It's best to first run `. deno/local-setup.sh` so that opencode has access to all the necessary tools in its path.

In the interactive terminal `ctrl+?` brings up help. Otherwise give instructions to the agent.

### Sessions

Sessions are stored locally in the gitignored .opencode folder. This means you can resume previous "sessions" even after quitting OpenCode. This may be useful for longer chats that have more context about the feature you are working on. 

## Workflow

A useful workflow is to make manual ADL changes, run `deno task genadl` and then ask OpenCode to do the implementation.

## TODO

- [ ] Add configuration for LSPs