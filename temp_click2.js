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
        // Find the corresponding system judge and show its details
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
