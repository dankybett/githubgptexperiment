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
        <div className="bg-white rounded-lg p-6 shadow-lg text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold mb-2">Routine Complete!</h1>
          
          {judgeScores.length > 0 ? (
