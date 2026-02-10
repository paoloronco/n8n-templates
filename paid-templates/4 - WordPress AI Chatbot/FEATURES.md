# Features & What's Included

Complete package for deploying an AI chatbot on WordPress.

---

## What You Get

### Core Package

**n8n Workflow Files**
- Indexing Workflow - Fetches and processes WordPress content
  - Cleans HTML and extracts text
  - Chunks long documents
  - Generates AI embeddings
  - Stores in vector database
- Chatbot Workflow - Handles real-time queries
  - Intent classification
  - Semantic vector search
  - AI response generation
  - Privacy-compliant logging

**WordPress Plugin**
- PHP plugin with admin settings panel
- Secure REST API proxy with bearer token auth
- WordPress nonces for CSRF protection
- Input sanitization and validation
- Modern, responsive chat UI
- Customizable colors and styling
- Mobile-optimized
- Simple shortcode: `[wp_ai_chatbot]`

**Test Micro-Website**
- Standalone HTML page for testing
- Test workflows before WordPress deployment
- No WordPress needed for initial verification

### Documentation

**Setup Guides**
- Quick Start (Qdrant) - 15-25 minutes
- Advanced Setup (MongoDB) - 1-2 hours with skills/profile features
- Step-by-step instructions with screenshots
- Two paths based on needs and experience level

**Technical Documentation**
- Architecture overview
- API integration guides (OpenAI, Cohere, Qdrant, MongoDB)
- WordPress integration
- Security best practices
- Customization guide

**Troubleshooting**
- Common issues and solutions
- Error message explanations
- Debug techniques
- FAQ section

### Bonus Tools

**MongoDB Utilities** (if using MongoDB path)
- Node.js embedding scripts
  - Skills database script
  - Profile database script
  - Batch processing
- Sample data files
  - Skills JSON template
  - Profile data template
- Vector search test scripts
- Migration tools

### Support

- Email support for installation
- Response within 24-48 hours
- Community forum access
- 12 months of free updates
- Bug fixes and security patches

---

## Detailed Features

### Intent Classification

The chatbot routes queries based on type:
- **Small Talk** - Casual conversations, greetings
- **Content Search** - Semantic search across WordPress posts
- **Profile/Skills** - Expertise and experience queries (optional, requires MongoDB)

### Semantic Search

- Vector embeddings for meaning-based search (not just keywords)
- Cohere reranker for improved relevance (optional)
- Combines multiple sources for comprehensive answers
- Intelligent document chunking

### Security

- Bearer token authentication for webhooks
- GDPR-compliant IP hashing (SHA3-256)
- Input sanitization and validation
- Server-side API key management (never exposed to browser)
- HTTPS-only communication
- WordPress nonces for CSRF protection

### Customization

- CSS variables for colors and themes
- Customizable fonts and typography
- Adjustable layout and sizing
- Mobile responsive design
- Shortcode attributes for per-page customization
- Multiple chatbot instances supported
- Works with any WordPress theme
- Page builder compatible (Elementor, Divi, Gutenberg)

### AI Capabilities

- GPT-4/4.5 integration
- 1536-dimensional vector embeddings
- Multilingual support (English and Italian, extensible)
- Customizable AI prompts and tone
- Context-aware responses
- Source attribution

---

## Vector Database Options

**Qdrant Cloud** - Simple
- Setup: 15 minutes
- Best for: WordPress content only
- Free tier: 1GB storage
- Native vector search

**MongoDB Atlas** - Advanced
- Setup: 1-2 hours
- Best for: Multiple data sources (posts, skills, profile)
- Free tier: 512MB M0 cluster
- Full database capabilities
- Advanced aggregations

**Switching:** Start with Qdrant and migrate to MongoDB later if needed.

---

## Use Cases

**Content Sites & Blogs**
- Answer questions about articles
- Help visitors discover related content
- Reduce bounce rate

**Business Websites**
- Automate common support questions
- Provide 24/7 assistance
- Reduce support ticket volume

**Portfolio Sites**
- Discuss skills and experience (requires MongoDB)
- Answer questions about projects
- Engage potential clients

**Documentation Sites**
- Semantic search across technical docs
- Find solutions by meaning
- Combine multiple doc sources

**E-commerce**
- Answer product questions
- Search descriptions and specs
- Guide customers

---

## Technical Specifications

**AI & Machine Learning**
- OpenAI GPT-4/4.5 for responses
- OpenAI text-embedding models
- Cohere rerank API (optional)
- Intent classification
- 1536-dimensional vectors

**Backend**
- n8n workflows (visual automation)
- Qdrant Cloud or MongoDB Atlas
- RESTful APIs
- Webhook system
- Real-time processing

**Frontend**
- WordPress plugin (PHP 7.4+)
- Vanilla JavaScript (no framework dependencies)
- Responsive CSS
- REST API client
- AJAX communication

**Security & Privacy**
- GDPR compliant IP hashing
- Bearer token authentication
- WordPress nonces
- Input validation and sanitization
- HTTPS encryption

---

## Cost Breakdown

**One-Time Purchase**
- Plugin + workflows
- 12 months updates
- Email support
- Documentation
- Commercial license

**Monthly Operating Costs**

For typical small site (100 posts, 500 queries/month):

| Service | Cost |
|---------|------|
| OpenAI Embeddings | ~$0.01 (one-time) |
| OpenAI Chat | $5-10 |
| Qdrant Cloud | $0 (free tier) |
| MongoDB Atlas | $0 (free tier) |
| Cohere Reranking | $0 (free tier) |
| n8n Self-Hosted | $0 |
| n8n Cloud | $20 (optional) |
| **TOTAL** | **$5-30/month** |

Medium site (500 posts, 2000 queries/month):
- OpenAI: $20-40/month
- Vector DB: Usually still free tier
- Total: $20-60/month

Large site (2000+ posts, 10000+ queries/month):
- OpenAI: $100-200/month
- May need paid vector DB tier
- Total: $100-300/month

---

## System Requirements

**Minimum:**
- WordPress 5.0+
- PHP 7.4+
- n8n instance (self-hosted or cloud)
- OpenAI API account
- Vector database (Qdrant or MongoDB)

**Recommended:**
- WordPress 6.0+
- PHP 8.0+
- HTTPS enabled
- Cohere API account (for reranking)
- Node.js 18+ (for MongoDB scripts)

**Free Tier Compatibility:**
All required services work on free tiers:
- Qdrant: 1GB free
- MongoDB: 512MB M0 cluster
- OpenAI: $5 free credit
- Cohere: 100 requests/minute free

---

## FAQ

**Q: Is this everything I need?**
A: Yes. Workflows, plugin, documentation, tools, and support included.

**Q: What if I need help?**
A: Email support included, plus comprehensive documentation.

**Q: Can I customize it?**
A: Yes. Full source code access with customization documentation.

**Q: Will it work with my WordPress theme?**
A: Yes. Works with any theme via shortcode.

**Q: What about updates?**
A: 12 months of free updates included.

---

[← Back to Main Page](README.md)
