# Detailed AI & API Workflows

This document provides in-depth technical details about how the application handles AI analysis and external API data fetching.

## 1. AI Analysis Workflow

The application uses **Puter.js AI** (powered by Claude 3.7 Sonnet) to analyze resumes. The analysis is performed entirely on the client-side (via Puter's backend proxy).

### 1.1. Analysis Process Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Page as React Page
    participant PDF as PDF.js Library
    participant Store as Puter Store (Zustand)
    participant FS as Puter FileSystem
    participant AI as Puter AI (Claude 3.7)

    User->>Page: Upload PDF Resume
    
    rect rgb(240, 248, 255)
        note right of Page: 1. Processing
        Page->>Page: Validate File Type/Size
        Page->>PDF: convertPdfToImage(file)
        PDF-->>Page: Return PNG Blob (Preview)
    end
    
    rect rgb(255, 250, 240)
        note right of Page: 2. Storage
        Page->>Store: fs.upload(pdfFile)
        Store->>FS: puter.fs.upload([pdfFile])
        FS-->>Page: Return PDF File Path
        Page->>Store: fs.upload(pngBlob)
        Store->>FS: puter.fs.upload([pngBlob])
        FS-->>Page: Return Image File Path
    end

    rect rgb(240, 255, 240)
        note right of Page: 3. Analysis
        Page->>Page: Prepare Prompt (General or Job Match)
        Page->>Store: ai.feedback(pdfPath, instructions)
        
        note right of AI: Prompt Composition behind scenes
        Store->>AI: chat({role: "user", content: [{type: "file", path: pdfPath}, {type: "text", text: instructions}]})
        
        AI-->>Page: JSON Response
    end

    Page->>Page: Parse JSON & Redirect to Results
```

### 1.2. Prompt Engineering Structure

The prompts are dynamically constructed in `app/constants/index.ts`.

#### General Analysis Prompt
Used when the user simply uploads a CV without a specific job description.

```mermaid
graph TD
    A[Start: prepareGeneralInstructions] --> B{Prompt Template}
    B --> C[Role Definition]
    C --> D[Task: General Analysis]
    D --> E[Correction Instructions]
    E --> F[Output Format: JSON Schema]
    F --> G[End: Final Prompt String]
```

**Key Components:**
*   **Role**: "Expert in resume analysis"
*   **Extraction**: Name, Email, Phone, Current Title
*   **Format**: Strict JSON structure enforcement
*   **Language**: Enforce English output

#### Job Match Prompt
Used when comparing a CV against a specific Job Description (JD).

```mermaid
graph TD
    A[Start: prepareInstructions(jobTitle, jobDescription)] --> B{Prompt Template}
    B --> C[Role Definition]
    C --> D[Context Injection]
    D --> D1[Inject content of jobTitle]
    D --> D2[Inject content of jobDescription]
    D --> E[Analysis Logic]
    E --> E1[Extract Candidate Info]
    E --> E2[Extract JD Requirements]
    E --> E3[Compare & Score]
    E --> F[Output Format: JSON Schema]
    F --> G[End: Final Prompt String]
```

## 2. API Data Fetching (Job Search)

The application fetches job listings from the **JSearch API (via RapidAPI)**. To protect API keys (when needed) and manage CORS, the request is routed through a Remix/React Router resource route.

### 2.1. Job Fetching Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Client Browser
    participant API as /api/jobs Route (Server Proxy)
    participant Lib as jobs-api.ts
    participant Rapid as RapidAPI (JSearch)

    User->>Client: Enters "React Developer"
    Client->>API: GET /api/jobs?query=React%20Developer
    
    note right of API: Server-Side Execution
    API->>Lib: fetchJobsFromRapidAPI(query, 1)
    
    Lib->>Lib: Read process.env.RAPIDAPI_KEY
    
    lib->>Rapid: GET https://jsearch.p.rapidapi.com/search...
    note right of Rapid: Headers: x-rapidapi-key
    
    Rapid-->>Lib: JSON Response (Raw Data)
    
    Lib->>Lib: Transform Data (Normalize Fields)
    note right of Lib: Map fields: job_id -> id, etc.
    
    Lib-->>API: Normalized Job Array
    API-->>Client: { jobs: [...], success: true }
    
    Client->>Client: Update React State & Render
```

## 3. Data Transformation

Raw data from external APIs is never used directly in the UI. It passes through a transformation layer.

```mermaid
classDiagram
    class JSearchResponse {
        +job_id: string
        +job_title: string
        +employer_name: string
        +job_city: string
        +job_country: string
        +job_highlights: object
        +job_apply_link: string
    }

    class ExternalJob {
        +id: string
        +title: string
        +company: string
        +location: string
        +description: string
        +url: string
        +employmentType: string
    }

    class Transformer {
        +fetchJobsFromRapidAPI()
    }

    JSearchResponse --> Transformer : Input
    Transformer --> ExternalJob : Output
```
