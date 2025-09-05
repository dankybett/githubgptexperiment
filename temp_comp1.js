              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Competition Stats - Top Left */}
        <div className="absolute top-4 left-8" style={{ zIndex: 20 }}>
          <div className="text-center p-2" style={{
            background: 'linear-gradient(145deg, rgba(232,245,232,0.95), rgba(200,230,200,0.95))',
            border: '2px solid #28a745',
            borderRadius: '6px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div className="text-sm mb-1">📊</div>
            <div className="text-xs font-semibold">Competition</div>
            <div className="text-xs text-gray-600">{competitionLevel}</div>
            <div className="mt-1 text-xs">
              Target: {competitionLevel === 'Training' ? '18+' : 
                       competitionLevel === 'Intermediate' ? '25+' :
                       competitionLevel === 'Advanced' ? '35+' : '40+'} pts
            </div>
            <div className="text-xs font-bold mt-1 text-green-700">
              Avg: {Object.keys(judgeScores).length > 0 
                ? (Object.values(judgeScores).reduce((a, b) => a + b, 0) / Object.values(judgeScores).length).toFixed(1)
                : '--'}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Standard non-integrated layout
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {judges.map(judge => (
        <JudgeCard
          key={judge.id}
          judge={judge}
          score={judgeScores[judge.id]}
          reaction={judgeReactions[judge.id]}
          isReacting={reactingJudges[judge.id]}
          integrated={false}
        />
      ))}
      
      {/* Competition Stats */}
      <div className="text-center p-3" style={{
        background: 'linear-gradient(145deg, #e8f5e8, #c8e6c8)',
        border: '2px solid #28a745',
        borderRadius: '8px'
      }}>
        <div className="text-lg mb-2">📊</div>
        <div className="text-xs font-semibold">Competition</div>
        <div className="text-xs text-gray-600">{competitionLevel} Level</div>
        <div className="mt-2 text-xs">
          Target: {competitionLevel === 'Training' ? '18+' : 
                   competitionLevel === 'Intermediate' ? '25+' :
                   competitionLevel === 'Advanced' ? '35+' : '40+'} pts
        </div>
        <div className="text-sm font-bold mt-1 text-green-700">
          Average: {Object.keys(judgeScores).length > 0 
            ? (Object.values(judgeScores).reduce((a, b) => a + b, 0) / Object.values(judgeScores).length).toFixed(1)
            : '--'}
        </div>
      </div>
    </div>
  );
};

