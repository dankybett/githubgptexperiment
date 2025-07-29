import React from "react";

const BattleshipGame = ({ onBack }) => {
  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          zIndex: 10,
          top: 10,
          left: 10,
          padding: "8px 12px",
          background: "#3498DB",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Back
      </button>
      <iframe
        src="/battleship.html"
        title="Battleship Game"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
};

export default BattleshipGame;
