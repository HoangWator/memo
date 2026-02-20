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

  const wordTypes = [
    { id: 'noun', label: 'Noun', color: 'from-blue-500 to-blue-600' },
    { id: 'verb', label: 'Verb', color: 'from-green-500 to-green-600' },
    { id: 'adjective', label: 'Adjective', color: 'from-orange-500 to-orange-600' },
    { id: 'adverb', label: 'Adverb', color: 'from-yellow-500 to-yellow-600' },
    { id: 'idiom', label: 'Idiom', color: 'from-purple-500 to-purple-600' },
    { id: 'phverb', label: 'Phrasal Verb', color: 'from-indigo-500 to-indigo-600' }
  ];

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
        name: wordName.trim().toLowerCase(),
        type: wordType,
        definition_eng: definitionEng.trim(),
        definition_vie: definitionVie.trim(),
        scheduleReview: [
          {
            mode: 'matching',
            reviewCount: 0,
            lastReview: null,
            rateAccuracy: null,
            reviewDates: [new Date()]
          },
          {
            mode: 'filling',
            reviewCount: 0,
            lastReview: null,
            rateAccuracy: null,
            reviewDates: [new Date()]
          },
          {
            mode: 'listening',
            reviewCount: 0,
            lastReview: null,
            rateAccuracy: null,
            reviewDates: [new Date()]
          }
        ],
        dateAdded: new Date(),
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
            Tên từ
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
          <label className="text-secondary-text text-sm font-medium block mb-3">
            Loại từ
          </label>
          <div className="grid grid-cols-3 gap-2">
            {wordTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setWordType(type.id)}
                className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  wordType === type.id
                    ? `bg-gradient-to-br ${type.color} text-white shadow-lg scale-105`
                    : 'bg-primary-surface text-secondary-text hover:bg-opacity-80 border border-transparent hover:border-primary'
                }`}
              >
                <span className="text-sm font-medium text-center">
                  {type.label}
                </span>
              </button>
            ))}
          </div>
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
