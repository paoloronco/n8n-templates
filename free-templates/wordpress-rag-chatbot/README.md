# WordPress AI Chatbot — n8n RAG Template

Build a bilingual AI chatbot for your WordPress website using n8n, OpenAI, Qdrant and Cohere. The workflow indexes WordPress posts for semantic search, handles conversational requests and optionally uses MongoDB Atlas for skills and profile information.

## Video Walkthrough

[![Watch the WordPress AI Chatbot walkthrough](https://img.youtube.com/vi/vg33xcdU9gE/hqdefault.jpg)](https://www.youtube.com/watch?v=vg33xcdU9gE)

## How It Works

- **Content Indexing** — Retrieves WordPress posts, cleans HTML, splits content into chunks, generates OpenAI embeddings and stores vectors in Qdrant.
- **Intent Routing** — Classifies messages as SmallTalk, WordPress content search (RAG), or optional skills/profile queries.
- **Semantic Search** — Retrieves relevant WordPress content from Qdrant and reranks results with Cohere.
- **AI Responses** — Uses OpenAI to generate conversational replies or structured search results with source URLs.
- **Multilingual Support** — Includes separate Italian and English RAG paths.
- **WordPress Integration** — Connects a WordPress chatbot plugin to an authenticated n8n webhook through a server-side REST proxy.
- **Optional Knowledge Base** — Uses MongoDB Atlas for skills/profile retrieval. Google Cloud Storage logging is an optional, disabled-by-default integration.

## Setup

1. **Download the Workflow** — Import [WordPress_AI_Chatbot_Template.json](workflow/WordPress_AI_Chatbot_Template.json) into n8n.
2. **Configure Credentials** — Connect WordPress, OpenAI, Qdrant and Cohere.
3. **Set Up Qdrant** — Create a collection with dimensions matching the chosen embedding model (1536 for default `text-embedding-3-small`).
4. **Index WordPress Content** — Run the manual indexing path to populate Qdrant.
5. **Configure the Webhook** — Enable Header Auth and activate the workflow.
6. **Install the WordPress Plugin** — Download it from the documentation, configure the production webhook URL and add `[wp_ai_chatbot]` to a page.
7. **Test the Chatbot** — Check Italian/English queries, content retrieval and the optional MongoDB branch if configured.

Follow the [complete setup and deployment documentation](https://paoloronco.notion.site/WordPress-AI-Chatbot-404f0ba27c3281c796fbfc177b050bef).

## Requirements

- WordPress website with REST API access
- n8n instance (self-hosted or cloud)
- OpenAI API credentials
- Qdrant vector database
- Cohere API credentials
- HTTPS for the WordPress integration

### Optional

- MongoDB Atlas for skills and profile retrieval
- Google Cloud Storage for conversation logging
- Standalone HTML test frontend

## Customization

- **Knowledge Sources** — Adapt WordPress indexing or add separate datasets.
- **Retrieval Settings** — Adjust chunk size, overlap, Qdrant Top-K, Cohere reranking and context limits.
- **AI Models & Prompts** — Customize intent routing, language, response style and model selection.
- **WordPress Frontend** — Modify the plugin's CSS/JavaScript, widget labels and result rendering.
- **Advanced Integrations** — Configure optional MongoDB Atlas retrieval and logging.

## Additional Info

- [Complete Documentation — Setup, WordPress Plugin, APIs & Architecture](https://paoloronco.notion.site/WordPress-AI-Chatbot-404f0ba27c3281c796fbfc177b050bef)
- [GitHub — Free Workflow & Source Code](https://github.com/paoloronco/n8n-templates/tree/main/free-templates/wordpress-rag-chatbot)
- [n8n Community Template](https://n8n.io/workflows/13291-build-a-wordpress-rag-chatbot-with-openai-qdrant-or-mongodb/)
- [Gumroad](https://paoloronco.gumroad.com/l/wordpress-aichatbot)
- [Video Walkthrough](https://www.youtube.com/watch?v=vg33xcdU9gE)

**Included in this repository:** [workflow JSON](workflow/WordPress_AI_Chatbot_Template.json), [HTML demo](demo/index.html) and [MongoDB embedding utility](mongodb/embed-skills-openai.js) with [package.json](mongodb/package.json) and [.env.example](mongodb/.env.example). The WordPress plugin ZIP is available through the documentation.

**The workflow is free to download and customize.** External API services and hosting may incur usage costs.

For implementation assistance, custom integrations or deployment consulting, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit [paoloronco.it](https://paoloronco.it).
