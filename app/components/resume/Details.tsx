import React, { useState } from 'react'

interface Tip {
  type: 'good' | 'improve';
  tip: string;
  explanation?: string;
}

interface CategoryFeedback {
  score: number;
  tips: Tip[];
}

interface DetailsProps {
  feedback: Feedback;
}

const AccordionSection = ({ 
  title, 
  score, 
  tips, 
  icon,
  isOpen,
  onToggle
}: { 
  title: string; 
  score: number; 
  tips: Tip[]; 
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="feedback-card animate-in fade-in duration-500">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all rounded-lg"
      >
        <div className="flex items-center gap-3">
          <img src={icon} alt={title} className="w-8 h-8" />
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg ${getScoreColor(score)}`}>
            <span className="text-2xl font-bold">{score}</span>
            <span className="text-sm">/100</span>
          </div>
          <img 
            src="/icons/info.svg" 
            alt="toggle" 
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${getScoreBgColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Accordion Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-2 space-y-3">
          {tips && tips.length > 0 ? (
            tips.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                  item.type === 'good'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-orange-50 border-orange-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'}
                    alt={item.type}
                    className="w-5 h-5 mt-1 shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{item.tip}</h4>
                    {item.explanation && (
                      <p className="text-sm text-gray-600 mt-2">{item.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic p-4 bg-gray-50 rounded-lg text-center">
              No specific feedback available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Details = ({ feedback }: DetailsProps) => {
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    toneAndStyle: true,
    content: false,
    structure: false,
    skills: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Detailed Feedback</h2>
        <button
          onClick={() => {
            const allOpen = Object.values(openSections).every(v => v);
            setOpenSections({
              toneAndStyle: !allOpen,
              content: !allOpen,
              structure: !allOpen,
              skills: !allOpen
            });
          }}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          {Object.values(openSections).every(v => v) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      
      <AccordionSection
        title="Tone & Style"
        score={feedback.toneAndStyle.score}
        tips={feedback.toneAndStyle.tips}
        icon="/icons/info.svg"
        isOpen={openSections.toneAndStyle}
        onToggle={() => toggleSection('toneAndStyle')}
      />

      <AccordionSection
        title="Content Quality"
        score={feedback.content.score}
        tips={feedback.content.tips}
        icon="/icons/check.svg"
        isOpen={openSections.content}
        onToggle={() => toggleSection('content')}
      />

      <AccordionSection
        title="Structure & Format"
        score={feedback.structure.score}
        tips={feedback.structure.tips}
        icon="/icons/info.svg"
        isOpen={openSections.structure}
        onToggle={() => toggleSection('structure')}
      />

      <AccordionSection
        title="Skills & Keywords"
        score={feedback.skills.score}
        tips={feedback.skills.tips}
        icon="/icons/check.svg"
        isOpen={openSections.skills}
        onToggle={() => toggleSection('skills')}
      />
    </div>
  );
};

export default Details;