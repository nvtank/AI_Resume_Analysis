# 📄 AI Resume Analysis

An intelligent AI-powered resume analysis platform that helps job seekers optimize their CVs and match them with job descriptions using advanced AI technology.

![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=flat&logo=react-router&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Puter.js](https://img.shields.io/badge/Puter.js-AI_Powered-purple?style=flat)

## ✨ Features

- **Resume Analysis**: Get comprehensive feedback on your CV including ATS compatibility, formatting, content quality, and suggestions for improvement
- **Job Description Matching**: Match your resume against specific job descriptions to see how well you fit the role
- **Claude AI Integration**: Powered by Claude 3.7 Sonnet for intelligent and context-aware analysis

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Puter.js account (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nvtank/AI_Resume_Analysis.git
cd AI_Resume_Analysis
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory (if needed for custom configuration)

### Development

Start the development server with Hot Module Replacement:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`

### Building for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📁 Project Structure

```
AI_Resume_Analysis/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── FileUploader.tsx # PDF upload component
│   │   ├── ScoreGauge.tsx  # Score visualization
│   │   └── ...
│   ├── routes/             # Application routes
│   │   ├── home.tsx        # Landing page
│   │   ├── auth.tsx        # Authentication
│   │   ├── analyze-cv.tsx  # General CV analysis
│   │   ├── match-jd.tsx    # Job description matching
│   │   ├── resume.tsx      # Results page
│   │   └── admin/          # Admin routes
│   ├── lib/                # Utility functions
│   │   ├── puter.ts        # Puter.js integration
│   │   ├── pdf2img.ts      # PDF to image conversion
│   │   └── utils.ts        # Helper functions
│   ├── constants/          # App constants
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
│   ├── icons/             # SVG icons
│   └── images/            # Images and GIFs
├── Dockerfile             # Docker configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Tech Stack

### Frontend
- **React Router v7**: Modern full-stack React framework with SSR
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **GSAP**: Professional-grade animation library
- **PDF.js**: PDF rendering and processing

### Backend & Services
- **Puter.js**: Cloud platform for file storage, KV storage, and AI services
- **Claude AI (3.7 Sonnet)**: Advanced language model for resume analysis

## 📖 Usage Guide

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **nvtank** - [GitHub Profile](https://github.com/nvtank)

## 🙏 Acknowledgments

- Built with [React Router](https://reactrouter.com/)
- Powered by [Puter.js](https://puter.com/)
- AI by [Anthropic Claude](https://www.anthropic.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Animations by [GSAP](https://greensock.com/gsap/)

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the maintainers

---
