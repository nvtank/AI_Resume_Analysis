import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resume } from "react-dom/server";
import { resumes } from "~/constants";
import ResumeCard from "~/components/ResumeCard";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Welcome to Resumind</h1>
          <h2>Your AI-powered resume analysis tool</h2>
        </div>

    {resumes.length>0 && (
        <div className="resumes-section">
      {resumes.map((resume) => (
          <div>
            <ResumeCard key={resume.id} resume={resume} />
          </div>
        ))}
      </div>
    )}
      </section>
    </main>
  );
}
