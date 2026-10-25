Build an AI chatbot that answers questions using your website's own knowledge base.

This workflow combines intent classification, safety routing, vector search with Qdrant, OpenAI embeddings, Cohere reranking, grounded AI responses, and structured JSON output through a webhook.

## **How It Works**

1. Receives chatbot requests through an authenticated webhook and normalizes the incoming payload.
2. Uses OpenAI to classify each request as **smalltalk**, **knowledge search**, or **rejected/out-of-scope**.
3. Routes each request to a dedicated processing path.
4. Handles smalltalk separately without unnecessarily querying the vector database.
5. For website-related questions, searches the Qdrant knowledge base using OpenAI embeddings.
6. Reranks retrieved documents with Cohere and builds a deduplicated context from the most relevant sources.
7. Uses an AI Agent to generate an answer grounded only in the retrieved website content.
8. Parses and cleans the result into a consistent JSON response ready for your website or frontend.

## **Key Features**

- Authenticated chatbot webhook
- AI-powered intent classification
- Smalltalk, knowledge search, and safety routing
- Qdrant vector knowledge retrieval
- OpenAI embeddings
- Cohere relevance reranking
- URL-based result deduplication
- Grounded RAG answer generation
- Structured JSON output
- Source URLs preserved in results
- Out-of-scope and safety handling
- Frontend-ready API architecture
- Customizable prompts, models, routing, and response format

## **Setup**

1. Import the workflow into n8n.
2. Configure the webhook authentication.
3. Add your OpenAI API credentials.
4. Connect your Qdrant instance and select your website knowledge collection.
5. Add your Cohere API credentials for reranking.
6. Review and customize the AI models, prompts, and output schema.
7. Connect your website or chat frontend to the production webhook URL.
8. Activate the workflow.

## **Requirements**

- n8n
- OpenAI API credentials
- Qdrant instance
- Website content already indexed in a Qdrant collection
- Cohere API credentials for reranking
- A website or frontend capable of sending requests to the webhook

> **Note:** This template handles the chatbot query and response pipeline. Your website content must already be indexed in Qdrant. Website crawling, content ingestion, chunking, and synchronization are not included in this workflow.

## **Use Cases**

- Website AI chatbots
- Documentation assistants
- SaaS help centers
- Product knowledge assistants
- Customer self-service portals
- Internal knowledge bots
- Documentation search
- RAG-powered support experiences

## **Customization**

Customize the intent rules, chatbot personality, safety behavior, AI models, Qdrant collection, retrieval depth, Cohere reranking, prompts, context generation, output schema, and final webhook response to fit your website or application.

**What you get:** A ready-to-import n8n workflow with the complete chatbot RAG pipeline, intent routing, Qdrant integration, OpenAI integration, Cohere reranking, structured output handling, and built-in setup notes.

Import it, connect your credentials and knowledge base, customize it for your website, and connect the webhook to your frontend.
