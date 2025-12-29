interface ScoreBageProps {
    score: number;
}

const ScoreBage = ({ score }: ScoreBageProps) => {
    let badgeColor = '';
    let badgeText ='';

    if (score >= 75) {
        badgeColor = 'bg-green-100 text-green-800';
        badgeText = 'Excellent';
    } else if (score >= 50) {
        badgeColor = 'bg-yellow-100 text-yellow-800';
        badgeText = 'Good';
    } else {
        badgeColor = 'bg-red-100 text-red-800';
        badgeText = 'Needs Improvement';
    }


return (
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
        <p className="text-sm font-medium">{badgeText}</p>
    </div>
);
};

export default ScoreBage;