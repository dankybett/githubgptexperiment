                  borderTop: 'none',
                  height: '28px',
                  borderRadius: '0 0 8px 8px'
                }}
              >
                <span className="text-sm font-bold text-amber-200 tracking-wide">JUDGES</span>
              </div>


              {/* Judges - Behind Table */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4" style={{ transform: 'translateX(-50%) translateY(-8px)' }}>
                {judges.map((judge, index) => (
                  <div key={judge.id} className="flex flex-col items-center">
                    {/* Judge Character - Larger for Foreground - Clickable */}
                    <motion.div 
                      className="relative cursor-pointer"
                      animate={reactingJudges[judge.id] ? { 
                        y: [-2, -8, -2],
                        rotate: [-2, 2, -1, 1, 0]
                      } : { y: 0 }}
                      transition={{ duration: 1.0 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onJudgeClick && onJudgeClick(judge)}
                      title={`Click to see ${judge.name} scoring criteria`}
                    >
                      <img 
                        src={judge.avatar} 
                        alt={judge.name}
                        className="w-32 h-32 object-contain filter drop-shadow-lg hover:brightness-110 transition-all"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1)'
                        }}
                      />
                      
                      {/* Click indicator */}
                      {onJudgeClick && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="text-white text-xs font-bold">?</div>
                        </div>
                      )}
                    </motion.div>

                    {/* Judge Name Plate - Also Clickable */}
                    <div 
                      className="-mt-4 px-2 py-1 text-xs font-bold text-center rounded cursor-pointer hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-400 transition-all"
                      style={{
                        background: 'linear-gradient(145deg, #D4AF37, #B8860B)',
                        color: '#2C1810',
                        border: '1px solid #8B7355',
                        minWidth: '60px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => onJudgeClick && onJudgeClick(judge)}
                      title={`Click to see ${judge.name} scoring criteria`}
                    >
                      {judge.name.replace('Judge ', '').replace(/🧭|🎯|➡️|🔥|🦅|🎭|⚡|🏁|⏱️|🎨|🐎|🗃️/g, '').trim()}
                    </div>

                  </div>
                ))}
              </div>

              {/* Reaction Bubble - Above Everything */}
              <AnimatePresence>
                {judges.some(judge => reactingJudges[judge.id]) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.7 }}
                    animate={{ opacity: 1, y: -60, scale: 1 }}
                    exit={{ opacity: 0, y: -80, scale: 1.2 }}
                    className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-xl px-4 py-3 shadow-2xl border-2 border-gray-200"
                    style={{ zIndex: 40, maxWidth: '200px' }}
                  >
                    <div className="text-sm font-medium text-gray-800 text-center">
                      <span className="font-bold text-blue-600">
                        {judges.find(judge => reactingJudges[judge.id] && judgeReactions[judge.id])?.name.replace('Judge ', '') || 'Judge'}:
                      </span>
                      <br />
                      <span className="font-bold text-gray-900">
                        "{Object.entries(reactingJudges).find(([id, reacting]) => reacting)?.[0] && 
                         judgeReactions[Object.entries(reactingJudges).find(([id, reacting]) => reacting)?.[0]]}"
                      </span>
