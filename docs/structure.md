# Project Structure & Architecture

This document outlines the structure and architecture of the **AI Resume Analysis** application.

## 1. File Structure

```text
├── app/
│   ├── components/
│   │   ├── features/       # Feature-specific components (Chat, Cover Letter)
│   │   ├── layout/         # Layout components (Navbar, Footer)
│   │   ├── resume/         # Resume analysis display components
│   │   └── ui/             # Reusable UI elements (Buttons, Uploaders)
│   ├── hooks/              # Custom React hooks (useResumeData, etc.)
│   ├── lib/                # Core utilities and services
│   │   ├── jobs-api.ts     # RapidAPI integration
│   │   ├── pdf2img.ts      # PDF processing
│   │   └── puter.ts        # Puter.js integration (Auth, DB, Storage, AI)
│   ├── routes/             # React Router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── analyze-cv.tsx  # General analysis flow
│   │   ├── match-jd.tsx    # Job matching flow
│   │   ├── jobs.tsx        # Job search page
│   │   └── ...
│   └── root.tsx            # Application root
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 2. System Architecture

The application is a client-side React app (using React Router v7) that leverages **Puter.js** as a Backend-as-a-Service solution for all server-side capabilities, eliminating the need for a traditional backend server.

```mermaid
graph TD
    User["User"]
    
    subgraph "Client Application (React)"
        UI["User Interface"]
        Logic["Business Logic"]
        
        subgraph "Services"
            PuterService["Puter.js Service"]
            JobService["Jobs API Service"]
        end
    end
    
    subgraph "Infrastructure & External APIs"
        PuterCloud["Puter.js Cloud"]
        RapidAPI["RapidAPI (JSearch)"]
        Claude["Anthropic Claude 3.7"]
    end
    
    User <--> UI
    UI --> Logic
    Logic --> PuterService
    Logic --> JobService
    
    PuterService <-->|"Auth, DB, Storage"| PuterCloud
    PuterService <-->|"AI Analysis"| Claude
    JobService <-->|"Fetch Listings"| RapidAPI
```

## 3. Component Architecture

Structure of the main application routes and their relationships.

```mermaid
classDiagram
    class RootLayout {
        +Navbar
        +Outlet
        +Footer
    }

    class Routes {
        +Home
        +Auth
        +Jobs
        +AnalyzeCV
        +MatchJD
        +ResumeResult
        +Profile
        +Admin
    }

    class SharedComponents {
        +FileUploader
        +PDFPreview
        +ScoreGauge
    }

    RootLayout *-- Routes
    Routes ..> SharedComponents : uses

    class AnalyzeCV {
        +handleFileUpload()
        +callAIAnalysis()
    }

    class Jobs {
        +searchQuery
        +fetchJobs()
    }

    class Profile {
        +getUserHistory()
    }
```

## 4. Key Workflows

### 4.1. Resume Analysis Flow

This diagram illustrates how a resume is processed from upload to analysis.

```mermaid
sequenceDiagram
    actor User
    participant App as React App
    participant PDF as PDF.js
    participant FS as Puter.js FS
    participant KV as Puter.js KV
    participant AI as Puter.js AI / Claude

    User->>App: Upload PDF Resume
    App->>PDF: Convert 1st page to Image
    PDF-->>App: Image Blob
    
    App->>FS: Upload PDF File
    App->>FS: Upload Image File
    
    App->>AI: Request Analysis (PDF + Prompt)
    Note right of App: Prompt depends on mode:<br/>(General or Job Match)
    
    AI-->>App: JSON Analysis Result
    
    App->>KV: Save Record (ID, Paths, Result)
    App-->>User: Redirect to Result Page via ID
```

### 4.2. Job Search Flow

```mermaid
sequenceDiagram
    actor User
    participant App as React App
    participant Loader as API Loader
    participant Rapid as RapidAPI

    User->>App: Enter Search Term
    App->>Loader: GET /api/jobs?query=...
    Loader->>Rapid: Fetch Jobs
    Rapid-->>Loader: Job List (JSON)
    Loader-->>App: Normalized Job Data
    App-->>User: Display Job Cards
```
