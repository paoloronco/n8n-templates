# WordPress AI Chatbot

## Documentation links

- [Full Notion documentation](https://paoloronco.notion.site/404f0ba27c3281c796fbfc177b050bef)
- [WordPress plugin installation](https://github.com/paoloronco/n8n-templates/blob/main/workflows/wordpress-ai-chatbot/Frontend-wordpressPlugin%26Website/wordpress-ai-chatbot-plugin/README.md)

## Documentation

- [Full setup, API, indexing and troubleshooting guide](https://paoloronco.notion.site/404f0ba27c3281c796fbfc177b050bef)
- [WordPress plugin installation](./Frontend-wordpressPlugin%26Website/wordpress-ai-chatbot-plugin/README.md)
- [Import the workflow](./template.json)

## Import and logging configuration

The context-building Code node returns the user query, ranked documents and text context to the AI Agent. Configure the Google Cloud Storage credential and replace `your-chatbot-logs` before running the connected logging path. `Code: parsing` produces the JSON in binary field `data`; `GCS: Object_Log` uploads that field. Operational nodes are enabled in the template; the imported workflow remains inactive during setup.
