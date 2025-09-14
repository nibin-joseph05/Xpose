
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MLInsightsProps {
  toxicityScores: Record<string, number> | null;
  shapExplanation: Record<string, any> | null;
  reportStatus: string;
  reportQuality: string | null;
}

interface WordImportance {
  word: string;
  score: number;
}

interface TopInfluentialWord {
  word: string;
  impact: number;
  influence: string;
}

export default function MLInsights({ toxicityScores, shapExplanation, reportStatus, reportQuality }: MLInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleInsights = () => setIsOpen(!isOpen);

  const getToxicitySummary = () => {
    if (!toxicityScores) return 'No toxicity data available.';
    const highToxicityThreshold = 0.7;
    const criticalScores = Object.entries(toxicityScores)
      .filter(([key, value]) => value >= highToxicityThreshold && key !== 'hate_speech_score')
      .map(([key, value]) => `${key}: ${value.toFixed(2)}`);
    if (criticalScores.length > 0) {
      return `High toxicity detected: ${criticalScores.join(', ')}. This likely contributed to the report's ${reportStatus.toLowerCase()} status.`;
    }
    return 'Toxicity levels are within acceptable limits.';
  };

  const getImprovementSuggestions = () => {
    if (!shapExplanation || !shapExplanation.word_importances) return ['No SHAP data available for suggestions.'];
    const negativeWords = (shapExplanation.word_importances as WordImportance[])
      .filter((item) => item.score > 0 && item.word.trim() !== '')
      .map((item) => item.word);
    const suggestions = [];
    if (negativeWords.length > 0) {
      suggestions.push(`Avoid using offensive words like: ${negativeWords.join(', ')}.`);
      suggestions.push('Rephrase with neutral terms, e.g., "individual" instead of "asshole", "perpetrators" instead of "bastards".');
    }
    suggestions.push('Include specific details like time, location, and description of the incident.');
    suggestions.push('Resubmit the report with clear, factual language to improve its quality.');
    return suggestions;
  };

  const getTopInfluentialWords = () => {
    if (!shapExplanation || !shapExplanation.top_influential_words) return [];
    return (shapExplanation.top_influential_words as TopInfluentialWord[])
      .filter((item) => item.word.trim() !== '')
      .map((item) => ({
        word: item.word,
        impact: item.impact.toExponential(2),
        influence: item.influence,
      }));
  };

  return (
    <div className="mt-6">
      <button
        onClick={toggleInsights}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 light:bg-blue-500 light:hover:bg-blue-600"
      >
        {isOpen ? 'Hide ML Insights' : 'Show ML Insights'}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600 light:bg-gray-100 light:border-gray-300"
        >
          <h4 className="text-lg font-semibold text-gray-200 light:text-gray-700">ML Classification Insights</h4>
          <div className="mt-4 space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-400 light:text-gray-600">Toxicity Summary</h5>
              <p className="mt-1 text-gray-200 light:text-gray-800">{getToxicitySummary()}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-400 light:text-gray-600">Top Influential Words</h5>
              {getTopInfluentialWords().length > 0 ? (
                <ul className="mt-1 text-gray-200 light:text-gray-800 list-disc pl-5">
                  {getTopInfluentialWords().map((item, index) => (
                    <li key={index}>
                      <span className={item.influence === 'positive' ? 'text-red-400' : 'text-green-400'}>
                        {item.word}
                      </span>{' '}
                      (Impact: {item.impact}, {item.influence})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-gray-200 light:text-gray-800">No influential words identified.</p>
              )}
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-400 light:text-gray-600">Improvement Suggestions</h5>
              <ul className="mt-1 text-gray-200 light:text-gray-800 list-disc pl-5">
                {getImprovementSuggestions().map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-400 light:text-gray-600">Report Quality</h5>
              <p className="mt-1 text-gray-200 light:text-gray-800">{reportQuality || 'N/A'}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
