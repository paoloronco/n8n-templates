# WordPress AI Chatbot — n8n RAG Template

A bilingual WordPress chatbot that indexes posts in Qdrant and answers questions through n8n. OpenAI handles intent classification and response generation, Cohere reranks search results, and an optional MongoDB Atlas branch supports skills and profile queries.

## How it works

1. **Index WordPress posts:** retrieve published posts, normalize HTML, split text, generate OpenAI embeddings and store vectors in Qdrant.
2. **Receive a chat request:** a WordPress server-side proxy forwards messages to an authenticated n8n webhook.
3. **Route the intent:** SmallTalk, WordPress semantic search (Italian/English), or optional skills/profile retrieval.
4. **Return JSON:** format conversational replies or source-linked search results for the WordPress widget.

## Files

| Resource | Purpose |
|---|---|
| [Workflow JSON](workflow/WordPress_AI_Chatbot_Template.json) | Importable n8n workflow with indexing and chat branches |
| [HTML demo](demo/index.html) | Standalone example using the WordPress REST proxy |\n| [MongoDB embedding utility](mongodb/embed-skills-openai.js) | Optional Node.js tool with [package.json](mongodb/package.json) and [.env.example](mongodb/.env.example) |\n| [Full setup guide](https://app.notion.com/p/404f0ba27c32810b989ccb0c8af3b372) | Credentials, Qdrant, indexing and webhook |
| [WordPress plugin and HTML demo](https://app.notion.com/p/404f0ba27c32812d84d9d0b4183ef957) | Download the plugin ZIP and HTML example |
| [API reference](https://app.notion.com/p/404f0ba27c3281678d69d5fab0663469) | Webhook and response formats |
| [Architecture](https://app.notion.com/p/404f0ba27c32813c86dde81d8fec229e) | Data flow and components |
| [MongoDB and customization](https://app.notion.com/p/404f0ba27c328157973fd0f95e69b978) | Optional skills/profile search and tuning |

## Setup

1. Import the [workflow JSON](workflow/WordPress_AI_Chatbot_Template.json) into n8n.
2. Configure WordPress, OpenAI, Qdrant and Cohere credentials.
3. Create a Qdrant collection with dimensions matching the embedding model (1536 for default `text-embedding-3-small`).
4. Run **Manual Indexing** to populate the vector store.
5. Configure Header Auth on the webhook and activate the workflow.
6. Download and install the WordPress plugin from the [WordPress guide](https://app.notion.com/p/404f0ba27c32812d84d9d0b4183ef957).
7. Enter the production webhook URL and matching Header Auth in WordPress settings; add `[wp_ai_chatbot]` to a page.

For complete instructions, see the [public documentation](https://app.notion.com/p/404f0ba27c3281c796fbfc177b050bef).

## Requirements

- WordPress with REST API access
- n8n (self-hosted or cloud)
- OpenAI API credentials
- Qdrant vector database
- Cohere API credentials for the included reranking nodes
- Optional: MongoDB Atlas for profile/skills queries

## Customization

Adjust OpenAI prompts for language and tone, Qdrant retrieval depth and Cohere reranking for relevance, and WordPress CSS/JavaScript for the widget. The supplied workflow uses separate Italian and English RAG branches. The WordPress plugin ZIP is provided on the linked Notion WordPress guide; it is not currently mirrored as source files in this GitHub directory.

## Additional information

- The template is free; API usage and hosting may incur costs.
- Credentials, collections and endpoints must be configured for each installation.
- The original workflow includes optional GCS logging, disabled in the community configuration.
- Validate the imported workflow and WordPress integration in your own environment before deploying it publicly.

## Links

- [Notion documentation](https://app.notion.com/p/404f0ba27c3281c796fbfc177b050bef)
- [n8n Creators listing](https://n8n.io/workflows/13291-build-a-wordpress-rag-chatbot-with-openai-qdrant-or-mongodb/)
- [Gumroad listing](https://paoloronco.gumroad.com/l/wordpress-aichatbot)
- [Video walkthrough](https://www.youtube.com/watch?v=vg33xcdU9gE)
