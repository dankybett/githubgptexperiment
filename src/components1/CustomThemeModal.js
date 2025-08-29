import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CustomThemeModal({
  isEdit = false,
  existingTheme = null,
  customThemes = {},
  onSave,
  onCancel,
  onDelete = null
}) {
  const [themeName, setThemeName] = useState(isEdit ? existingTheme?.name || "" : "");
  const [themeNames, setThemeNames] = useState(
    isEdit ? existingTheme?.names || [] : ["", ""]
  );
  const [error, setError] = useState("");

  // Ensure minimum 2 name fields
  useEffect(() => {
    if (themeNames.length < 2) {
      setThemeNames(prev => [...prev, ...Array(2 - prev.length).fill("")]);
    }
  }, [themeNames]);

  const addNameField = () => {
    if (themeNames.length < 50) {
      setThemeNames([...themeNames, ""]);
    }
  };

  const removeNameField = (index) => {
    if (themeNames.length > 2) {
      setThemeNames(themeNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index, value) => {
    const updated = [...themeNames];
    updated[index] = value;
    setThemeNames(updated);
  };

  const validateAndSave = () => {
    setError("");

    // Validate theme name
    if (!themeName.trim()) {
      setError("Theme name is required");
      return;
    }

    // Check if theme name already exists (but allow editing the same theme)
    if (!isEdit && (themeName in customThemes || themeName in {
      "Default": true,
      "Takeaways": true,
      "Films": true,
      "Anime": true,
      "Games": true,
      "TV Shows": true,
      "Football Teams": true,
      "Countries": true,
      "Animals": true,
      "Colors": true
    })) {
      setError("Theme name already exists");
      return;
    }

    // Validate names
    const nonEmptyNames = themeNames.filter(name => name.trim());
    if (nonEmptyNames.length < 2) {
      setError("At least 2 names are required");
      return;
    }

    // Check for duplicate names
    const uniqueNames = [...new Set(nonEmptyNames.map(n => n.trim()))];
    if (uniqueNames.length !== nonEmptyNames.length) {
      setError("All names must be unique");
      return;
    }

    onSave(themeName.trim(), uniqueNames);
  };

  return (
    <div className="max-h-[80vh] flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {isEdit ? `Edit "${existingTheme?.name}"` : "Create New Theme"}
      </h2>
      
      {/* Theme Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Theme Name
        </label>
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          placeholder="Enter theme name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isEdit} // Can't rename existing themes
        />
      </div>

      {/* Names List */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Names ({themeNames.filter(n => n.trim()).length}/50)
          </label>
          <button
            onClick={addNameField}
            disabled={themeNames.length >= 50}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            + Add
          </button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {themeNames.map((name, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder={`Name ${index + 1}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {themeNames.length > 2 && (
                <button
                  onClick={() => removeNameField(index)}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={validateAndSave}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
        >
          {isEdit ? "Update Theme" : "Create Theme"}
        </button>
        
        {isEdit && onDelete && (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${existingTheme?.name}"?`)) {
                onDelete(existingTheme?.name);
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
          >
            Delete
          </button>
        )}
        
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}