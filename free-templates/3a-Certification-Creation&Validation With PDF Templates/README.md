📄 Certificate Creation&Validation with PDFgenerationAPI Templates (n8n)
===============================

This template provides a **complete and reusable solution to automatically create, distribute, and verify digital certificates using n8n**, with **PDF Generator API templates** for PDF generation.

The workflow is designed to cover the **entire lifecycle of a certificate**, from the initial request to public verification, in a clean and maintainable way.

It is an **MVP**, but already **fully functional, tested, and production-ready**, and can be reused with minimal configuration in different environments.

![image](assets/Workflow-image.png)

[Example-certificate](./Assets/Example-Certificate.pdf)

Visit my website for the: [n8n-template Certification Creator&Checke with PDF Templatesr](https://paoloronco.it/n8n-template-certification-creator-checker-with-pdfgenerationapi-templates/)

See the workflow on n8n Creators hub: [coming soon](coming soon)

***

### 📁 Repository Structure:

```textile
3-Certificate_Creation&Validation/
├── PDFgeneratorAPI-Template/
│   └── template_export_1560735.json
├── Assets/
│   ├── Example-Certificate.pdf
│   └── Workflow-image.png
├── README.md
└── workflow.json
```



****

## What problem this template solves

In many real-world scenarios, certificates are still:

- generated manually
- created with fragile scripts
- hard to verify
- visually inconsistent
- difficult to maintain over time

This template solves those problems by providing:

- automated certificate creation
- a unique and verifiable Certification ID
- consistent PDF output using templates
- a public verification endpoint
- a clear separation between automation logic and visual design

---

## 🚀 What makes this version different

This workflow is the **evolution of the original HTML-based version**.

### Why templates instead of HTML?

- No HTML inside the workflow
- Clean separation between logic and layout
- Visual template editor
- Easier maintenance and customization
- Better collaboration between developers and designers

The PDF layout is managed **entirely through PDF Generator API templates**.

![image](assets/PDFgenerationAPI-Template.png)

------

## 🔍 High-level overview

The system exposes **two main endpoints**:

### 1️⃣ Certificate creation

```
POST /certifications2
```

Handles:

- candidate input
- unique ID generation
- data persistence
- PDF generation (template-based)
- email delivery

------

### 2️⃣ Certificate verification

```
GET /certificationscheck
```

Allows anyone to verify:

- if a certificate exists
- who it belongs to

------

## 🔥 What this workflow does

### 🎓 1. Certificate creation

- Triggered via **POST webhook** (`/certifications2`)
- Accepts candidate data:
  - name
  - surname
  - course
  - email
- Generates a **unique Certification ID**
- Prevents collisions via ID existence checks

------

### 🗂 2. Data storage

Each certificate is stored in an **n8n Data Table**, creating a persistent registry.

Stored fields:

- Name
- Surname
- CertificationID

This registry is used both for validation and auditing.

------

### 🧾 3. PDF generation (Template-based)

The workflow uses **PDF Generator API – Generate a PDF document** node.

Instead of HTML, it sends a **JSON payload** that maps directly to template placeholders.

Example:

```
{
  "DueDate": "{{$now.toISODate()}}",
  "Candidate": "{{$('Webhook_Creation').item.json.headers.name}} {{$('Webhook_Creation').item.json.headers.surname}}",
  "CourseName": "{{ $('Webhook_Creation').item.json.headers.course }}",
  "ID": "{{ $('Generate_Certification_ID').item.json.id }}"
}
```

⚠️ The JSON must be valid and keys must match the template placeholders exactly.

------

### ✉️ 4. Email delivery

- Uses **Gmail OAuth2**
- Sends the generated PDF as attachment
- Fully customizable subject and body

------

### 🔍 5. Certificate verification

The verification endpoint:

```
GET /certificationscheck?id=CERTIFICATION-ID
```

Returns:

**If valid**

```
{
  "ok": true,
  "name": "John",
  "surname": "Doe"
}
```

**If not valid**

```
{
  "ok": false
}
```

This makes certificates **publicly verifiable and tamper-resistant**.

------

## 🧠 PDF Generator API Template

### What is included

The repository includes:

- a ready-to-use **PDF Generator API template**
- placeholders such as:
  - `{Candidate}`
  - `{CourseName}`
  - `{DueDate}`
  - `{ID}`

You can freely customize:

- layout
- fonts
- colors
- logos
- signatures
- date formatting
- QR codes

No workflow changes are required when updating the template.

------

## 🤖 AI-powered template editing (Gemini)

PDF Generator API provides an **AI Gem powered by Gemini** to help users create and refine templates.

👉 AI Gem link:
 https://gemini.google.com/gem/1RrpDHQocP7E7C7Bpsc7yhDT-AkuKNuT_?usp=sharing

You can:

- describe the layout in natural language
- generate or modify templates
- iterate faster without manual positioning

------

## 🛠 Requirements

Before importing the workflow, you need:

1. **n8n instance** (Cloud or self-hosted)
2. **n8n Data Table** with fields:
   - `Name` (string)
   - `Surname` (string)
   - `CertificationID` (string)
3. **PDF Generator API account**
4. **Gmail OAuth2 credentials**
5. Ability to call HTTP webhooks

------

---

## 🚀 Installation

### 1. Import the workflow

- Go to **n8n → Workflows → Import**
- Paste `workflow.json`

------

### 2. Configure Data Table

Update these nodes:

- `Insert_Certification`
- `Find_Certification_By_ID`
- `Find_Certification_By_ID1`

------

### 3. Configure credentials

- PDF Generator API node → set credentials
- Gmail node → set OAuth2 credentials

------

### 4. Activate the workflow

Click **Activate** and you’re ready to go.

------

---

## 🧪 Status: MVP (but production-ready)

This project started as an MVP, but it is:

- fully functional
- tested
- modular
- easy to extend

You can use it **for free**, adapt it to your needs, and deploy it in production with minimal changes.

------

## 🌍 Why this matters

This repository demonstrates how:

- low-code automation
- clean API design
- reusable templates
- community-driven sharing

can produce **real-world, production-grade solutions**, not just demos.

------

## 📎 Links

- [n8n workflow on Creators Hub](coming soon)
- [YouTube Video](https://youtu.be/eqSWoPndVUg)
- [Project article and documentation](https://paoloronco.it/n8n-template-certification-creator-checker/)
- [PDF Generator API](https://pdfgeneratorapi.com/)
- [Template AI Gem]()
