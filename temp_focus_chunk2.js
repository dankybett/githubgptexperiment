                    </div>
                    
                    {/* Current Progress (if game in progress) */}
                    {gameLog.turns.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <h5 className="font-semibold text-sm text-blue-800 mb-1">Current Progress:</h5>
                        <div className="text-xs text-blue-700">
                          {Object.entries(judge.triggerCounts || {}).map(([key, count]) => (
                            count > 0 && <div key={key}>{key}: {count}</div>
                          ))}
                          <div className="font-semibold mt-1">
                            Modifier: {judge.currentModifier >= 0 ? '+' : ''}{judge.currentModifier || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Final Scores (if game finished) */}
              {judgeScores.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-bold mb-3">📊 Final Judge Scores</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {judgeScores.map((score, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3 text-center">
                        <div className="font-semibold">{score.emoji} {score.judgeName}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Core: {score.coreScore} + Modifier: {score.judgeModifier >= 0 ? '+' : ''}{score.judgeModifier}
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {score.finalScore}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-lg font-bold">
                    Average Score: {judgeSystem.getAverageFinalScore(judgeScores)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DressageArena>
  );
};

export default FullArenaGame;
