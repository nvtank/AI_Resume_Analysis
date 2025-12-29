import React from 'react'
import ScoreGauge from '../ui/ScoreGauge'
import ScoreBadge from '../ui/ScoreBadge';


const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
    const bgColor = score >= 75 ? 'bg-green-50' : score >= 50 ? 'bg-yellow-50' : 'bg-red-50';
    
    return (
        <div className={`p-4 ${bgColor} rounded-lg hover:shadow-md transition-all`}>
            <div className='flex items-center justify-between mb-2'>
                <p className='text-lg font-semibold text-gray-800'>{title}</p>
                <ScoreBadge score={score} />
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${
                  score >= 75 ? 'bg-green-500' : 
                  score >= 50 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
        </div>
    )
}

const Summary = ({feedback}:{feedback:Feedback}) => {
  return ( 
    <div className='feedback-card animate-in fade-in duration-500'>
        <div className='flex flex-row items-center justify-between p-4 gap-8 mb-6'>
            <div>
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>
                    Overall Resume Score
                </h2>
                <p className='text-sm text-gray-600'>
                    Based on multiple evaluation criteria
                </p>
            </div>
            <ScoreGauge score={feedback.overallScore}/>
        </div>
        
        <div className='flex flex-col gap-4'>
            <h3 className='text-xl font-semibold text-gray-800'>Category Breakdown</h3>
            <Category title="ATS Compatibility" score={feedback.ATS?.score || 0}/>
            <Category title="Tone and Style" score={feedback.toneAndStyle.score}/>
            <Category title="Content Quality" score={feedback.content.score}/>
            <Category title="Structure" score={feedback.structure.score}/>
            <Category title="Skills Match" score={feedback.skills.score}/>
        </div>
    </div>
  )
}

export default Summary