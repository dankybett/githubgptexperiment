            >
              Play Again
            </button>
          </div>
        </div>
      </DressageArena>
    );
  }

  // Main game with arena
  return (
    <DressageArena
      selectedHorse={selectedHorse}
      currentScore={totalScore}
      stamina={stamina}
      flowMeter={flowMeter}
      comboLength={flowLevel}
      currentTurn={currentTurn}
      maxTurns={maxTurns}
      lastPlayedCard={lastPlayedCard}
      isPerforming={isPerforming}
      flowBroke={flowBroke}
      onBack={onBack}
      onShowTutorial={() => {
        setShowTutorial(true);
        setTutorialStep(0);
      }}
      selectedJudges={selectedJudges}
      onJudgeClick={(judge) => {
        const sysId = judge?.systemJudge?.id || null;
        setFocusedJudgeId(sysId);
        setShowJudgePanel(true);
      }}
    >
      {/* Game Content */}
      <div className="space-y-4">
        {/* Message */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded-lg text-center">
            {message}
          </div>
        )}

        {/* Score Header */}
        <div className="flex justify-center gap-8 text-sm bg-white rounded-lg p-4 shadow-lg mb-4">
          <div className="flex items-center gap-2">
