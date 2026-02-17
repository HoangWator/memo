import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { addWordDB } from '../handleData.js';

export default function AddWordModal({ onClose, userID, currentFolder, onWordAdded }) {
  const [wordName, setWordName] = useState('');
  const [wordType, setWordType] = useState('noun');
  const [definitionEng, setDefinitionEng] = useState('');
  const [definitionVie, setDefinitionVie] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const wordTypes = ['noun', 'verb', 'adjective', 'adverb', 'idiom', 'phverb'];

  const handleAddWord = async () => {
    setError('');

    // Validation
    if (!wordName.trim()) {
      setError('Vui lòng nhập tên từ');
      return;
    }

    if (!definitionEng.trim() && !definitionVie.trim()) {
      setError('Vui lòng nhập định nghĩa tiếng Anh hoặc tiếng Việt');
      return;
    }

    if (wordName.trim().length > 100) {
      setError('Tên từ không được vượt quá 100 ký tự');
      return;
    }

    if (definitionEng.trim().length > 500) {
      setError('Định nghĩa tiếng Anh không được vượt quá 500 ký tự');
      return;
    }

    if (definitionVie.trim().length > 500) {
      setError('Định nghĩa tiếng Việt không được vượt quá 500 ký tự');
      return;
    }

    try {
      setIsLoading(true);

      // Create word object with proper structure
      const newWord = {
        name: wordName.trim(),
        type: wordType,
        definition_eng: definitionEng.trim(),
        definition_vie: definitionVie.trim(),
        mean: definitionEng.trim() || definitionVie.trim(),
        scheduleReview: []
      };

      // Add to Firebase
      await addWordDB(userID, currentFolder, newWord);

      // Call callback to refresh word list
      onWordAdded();

      // Reset form and close
      setWordName('');
      setDefinitionEng('');
      setDefinitionVie('');
      setWordType('noun');
      setError('');
      onClose();
    } catch (err) {
      console.error('Error adding word:', err);
      setError('Lỗi khi thêm từ. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-screen bg-black/50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-bg flex flex-col p-6 rounded-lg w-full max-w-md mx-4 max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary-text font-semibold text-lg">Thêm từ mới</h3>
          <button
            onClick={onClose}
            className="text-secondary-text hover:text-primary-text transition"
          >
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        {/* Word Name Input */}
        <div className="mb-4">
          <label className="text-secondary-text text-sm font-medium block mb-1">
            Tên từ *
          </label>
          <input
            type="text"
            value={wordName}
            onChange={(e) => setWordName(e.target.value)}
            placeholder="Nhập tên từ..."
            className="input-field w-full px-3 py-2 rounded-md border border-transparent bg-primary-surface text-primary-text"
          />
        </div>

        {/* Word Type Dropdown */}
        <div className="mb-4">
          <label className="text-secondary-text text-sm font-medium block mb-1">
            Loại từ
          </label>
          <select
            value={wordType}
            onChange={(e) => setWordType(e.target.value)}
            className="input-field w-full px-3 py-2 rounded-md border border-transparent bg-primary-surface text-primary-text cursor-pointer"
          >
            {wordTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'phverb' ? 'Phrasal verb' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* English Definition Input */}
        <div className="mb-4">
          <label className="text-secondary-text text-sm font-medium block mb-1">
            Định nghĩa tiếng Anh
          </label>
          <textarea
            value={definitionEng}
            onChange={(e) => setDefinitionEng(e.target.value)}
            placeholder="Nhập định nghĩa tiếng Anh..."
            className="input-field w-full px-3 py-2 rounded-md border border-transparent bg-primary-surface text-primary-text resize-none"
            rows="3"
          />
        </div>

        {/* Vietnamese Definition Input */}
        <div className="mb-4">
          <label className="text-secondary-text text-sm font-medium block mb-1">
            Định nghĩa tiếng Việt
          </label>
          <textarea
            value={definitionVie}
            onChange={(e) => setDefinitionVie(e.target.value)}
            placeholder="Nhập định nghĩa tiếng Việt..."
            className="input-field w-full px-3 py-2 rounded-md border border-transparent bg-primary-surface text-primary-text resize-none"
            rows="3"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-warn/20 text-warn rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-surface text-primary-text rounded-lg cursor-pointer hover:scale-105 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleAddWord}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-bg rounded-lg cursor-pointer hover:scale-105 transition disabled:opacity-50"
          >
            {isLoading ? 'Đang thêm...' : 'Thêm từ'}
          </button>
        </div>
      </div>
    </div>
  );
}
