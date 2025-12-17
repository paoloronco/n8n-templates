📄 Certificate Creation&Validation (n8n)
===============================

This template provides a **complete and reusable solution to automatically create, distribute, and verify digital certificates using n8n**, with **PDF Generator API templates** for PDF generation.

The workflow is designed to cover the **entire lifecycle of a certificate**, from the initial request to public verification, in a clean and maintainable way.

It is an **MVP**, but already **fully functional, tested, and production-ready**, and can be reused with minimal configuration in different environments.

![image](assets/Workflow-image.png)

[Example-certificate](./Assets/Example-Certificate.pdf)

Visit my website for the: [n8n-template Certification Creator&Checker](https://paoloronco.it/n8n-template-certification-creator-checker/)

See the workflow on n8n Creators hub: [Automated Digital Certificate Creator & Validator with PDF Generation](https://n8n.io/workflows/11097-automated-digital-certificate-creator-and-validator-with-pdf-generation/)



***

### 📁 Repository Structure:

```textile
3-Certificate_Creation&Validation/
├── HTML-Files/
│   ├── Cerification_Check.html
│   └── Certificate.html
├── Assets/
│   ├── Example-Certificate.pdf
│   └── Workflow-image.png
├── README.md
└── workflow.json
```



****

## 🔥 What This Workflow Does

### 🎓 1. Certificate Creation

Automatically generates a fully personalized certificate when a new request is received:

- Accepts candidate data via a **POST webhook** (`/certifications`)
- Reads: **name**, **surname**, **course**, **email**
- Produces a **unique Certification ID** using a custom generation algorithm

### 🗂 2. Data Storage

Stores each issued certificate in an **n8n Data Table**, including:

- Candidate First Name  
- Candidate Last Name  
- Certification ID

This creates a persistent, searchable certification registry.

### 🧾 3. PDF Certificate Generation

Builds a professional certificate PDF using **PDF Generator API**:

- Fully customizable HTML template  
- Inserts candidate data, course name, certification ID, and date  
- Outputs the final document as `document.pdf`

### ✉️ 4. Email Delivery

Automatically sends the generated certificate to the candidate:

- Uses **Gmail OAuth2**  
- Includes the PDF as an attachment  
- Sends a clean, customizable confirmation message

### 🔍 5. Certificate Verification

Provides a secure verification system through:

- A **public API endpoint** (`/certificationscheck`)
- Response includes:
  - Validation status
  - Candidate name + surname (if valid)

### 🌐 6. Verification Mini-Website

Includes a ready-to-use HTML page for certificate lookup:

- User enters Certification ID  
- Page queries your `certificationscheck` endpoint  
- Displays whether the certificate is valid  
- Shows the candidate’s name if found  
- Fully customizable (branding, style, messages)

File included in the repo:  
**`Cerification_Check.html`**

---

In short, this workflow automates:
✔ Certificate generation  
✔ Certificate storage  
✔ Certificate validation  
✔ PDF production  
✔ Email distribution  
✔ Public verification interface

Together, these features form a complete, production-ready certificate management platform powered by n8n.

* * *

🛠 Requirements
---------------

Before using this workflow, you must have:

1. **n8n instance**  
   (Cloud or self-hosted)

2. **n8n Data Table** with ID fields:
   
   * `Name` (string)
   
   * `Surname` (string)
   
   * `CertificationID` (string)

3. **PDF Generator API account**  
   Credentials set in n8n as `pdfGeneratorApi`.

4. **Gmail OAuth2 credentials**  
   Configured in n8n as `gmailOAuth2`.

5. Ability to call **HTTP POST endpoints** from your website, backend, forms, etc.

* * *

🚀 Installation
---------------

### **1. Import workflow**

In n8n:

* Go to **Workflows → Import**

* Paste the JSON provided in this repository

### **2. Configure Data Table**

Update the following nodes to point to your Data Table:

* `Insert_Certificaton`

* `Find_Certification_By_ID`

* `Find_Certification_By_ID1`

Make sure the Data Table has the fields:

| Field           | Type   |
| --------------- | ------ |
| Name            | string |
| Surname         | string |
| CertificationID | string |

### **3. Configure Credentials**

In the workflow:

* Node **Generate_PDF** → set PDF Generator API credentials

* Node **Email_Certification** → set Gmail OAuth2 credentials

### **4. Activate Workflow**

Click **Activate** in n8n.

* * *

🔧 How the Workflow Works
------------------------------------

### 🔹 1. Webhook: Certificate Creation (`/certifications`)

The workflow starts with:

`POST https://YOUR-N8N-DOMAIN.com/webhook/certification
 Headers:  
   name: John  
   surname: Doe  
   course: Advanced n8n  
   email: john.doe@example.com`

The webhook passes these headers to the next nodes.

* * *

### 🔹 2. Generate_Certification_ID (Code Node)

JavaScript used:

```javascript
const uniqueId =
  Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).substring(2, 8).toUpperCase();

return [{ id: uniqueId }];
```

Produces something like:  
`LQ4Z5H8R2A1F`

* * *

### 🔹 3. Check if ID already exists

The workflow uses:

* `Find_Certification_By_ID`

* `Certification_ID_Exists`

If the ID **already exists**, it loops back and generates a new one.

If the ID is **unique**, the workflow continues.

* * *

### 🔹 4. Insert certification in Data Table

Saves:

* Name

* Surname

* Unique ID

* * *

### 🔹 5. Generate PDF Certificate

Using the PDF Generator API, the workflow builds a certificate from an **HTML template**.

The **default HTML provided in the workflow is just an example** and can be fully customized.  
You can freely change:

- Layout and structure (containers, sections, alignment)
- Colors, fonts, borders, and background
- Logos, images, and branding elements
- Text content (titles, subtitles, messages)
- Additional placeholders/fields

By default, the example template includes:

- Candidate name  
- Course title  
- Unique Certification ID  
- Current date  

After the HTML is rendered, this node generates a PDF file and outputs it as `binary.document.pdf`, which is then attached to the email in the next step.

* * *

### 🔹 6. Send Certificate via Gmail

The workflow sends an email with:

**Subject:** `Your certification is ready!`  
**Attachment:** the generated `document.pdf`

The recipient is the email provided to the webhook.

* * *

🔍 Certificate Verification (`/certificationscheck`)
--------------------------------------------------------

The workflow provides two different ways to verify the authenticity of a certificate:

### ✅ 1. Manual API Request

You can verify a certificate by sending a manual HTTP request:    

`POST /certificationscheck
 Headers:
  id: CERTIFICATION-ID-HERE`

#### API Logic:

1. `Find_Certification_By_ID1` searches the Data Table for the ID

2. `Certification_Exists` checks if a match exists

3. Returns JSON:

#### If found:

`{   "ok": "true",   "name": "John",   "surname": "Doe" }`

#### If NOT found:

`{ "ok": "false" }` 

* * *

🌐 Using This on Your Website
-----------------------------

The repository also includes a **ready-to-use verification webpage**:  
`Cerification_Check.html`

#### Use the correct endpoint URL

Inside the HTML page, the verification request uses:

`fetch("https://YOUR-N8N-DOMAIN.com/webhook/certificationscheck",`

Replace **YOUR-N8N-DOMAIN.com** with the actual domain where your n8n instance is hosted.



This mini site allows users to:

* Enter a Certification ID into a text field

* Trigger a verification request with a single click

* See the result immediately on-screen

* View the certificate holder’s name and surname if the ID is valid

The page communicates with your `/certificationscheck` endpoint using JavaScript `fetch()` and behaves exactly like the manual API request — but in a clean, simple interface.



#### What you can customize

* Logo and header text

* Colors, fonts, and CSS

* Button styles and layout

* Messages for valid/invalid IDs

* Language and UI text

* The endpoint URL (if your n8n instance changes)

This makes it easy to embed certificate verification directly into your website, LMS, or customer portal. 

* * *
