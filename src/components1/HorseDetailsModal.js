import React, { useState } from "react";
import { motion } from "framer-motion";

export default function HorseDetailsModal({ horse, onClose, onRename, onSendToLabyrinth }) {
  const [name, setName] = useState(horse.name);

  const handleSave = () => {
    onRename(horse.id, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-xl p-6 w-80 shadow-2xl relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Horse Details</h2>
        <img
          src={horse.avatar}
          alt={horse.name}
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <p className="text-sm">Personality: {horse.personality}</p>
        </div>
        <div className="mt-4 space-y-2">
          <button
          onClick={onSendToLabyrinth}
          className="w-full px-3 py-1 bg-purple-600 text-white rounded"
          >
          Send to Labyrinth
          </button>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
