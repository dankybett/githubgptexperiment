                            {card.flow && <div className="text-blue-600">{card.tags?.includes("Wild") ? "? (Random: Walk/Trot/Canter)" : card.flow}</div>}
                            {card.bonus && <div className="text-green-600">{card.bonus}</div>}
                            {card.risk && <div className="text-red-600">{card.risk}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Judges Panel Modal */}
        {showJudgePanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🏆 Competition Judges</h2>
                <button 
                  onClick={() => setShowJudgePanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {selectedJudges.map((judge, index) => (
                  <div key={judge.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-1">{judge.emoji}</div>
                      <div className="font-bold text-lg">{judge.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{judge.description}</div>
                    </div>
                    
                    {/* Judge Requirements */}
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-semibold text-sm mb-2">Scoring Criteria:</h4>
                      <div className="text-xs space-y-1">
                        {Object.entries(judge.modifiers).map(([key, modifier]) => (
                          <div key={key} className={`${modifier.value > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {modifier.description}
                          </div>
                        ))}
                      </div>
                      
                      {/* Special case for Gait Specialist */}
                      {judge.id === 'gaitSpecialist' && judge.declaredGait && (
                        <div className="mt-2 p-2 bg-blue-100 rounded">
                          <div className="font-semibold text-sm text-blue-800">
                            Specialty: {judge.declaredGait} moves
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Cap: +{judge.cap.positive}{judge.cap.negative < 0 ? ` / ${judge.cap.negative}` : ''}
                      </div>
                    </div>
