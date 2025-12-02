import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell } from 'recharts';

const AdaptiveTypingSystem = () => {
  // Enhanced vocabulary with more diverse letters including x, y, z
  const vocabulary = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    "is", "was", "are", "been", "has", "had", "were", "said", "did", "having",
    "may", "should", "could", "must", "might", "being", "does", "done", "doing", "made",
    "making", "through", "before", "between", "under", "since", "both", "each", "few", "more",
    "many", "such", "own", "same", "than", "too", "very", "can", "will", "just",
    "should", "now", "during", "always", "where", "why", "find", "something", "seem", "next",
    "near", "together", "became", "call", "help", "within", "state", "never", "become", "high",
    "enough", "across", "although", "still", "children", "side", "feet", "car", "city", "walk",
    "might", "story", "until", "far", "sea", "draw", "left", "late", "run", "while",
    "press", "close", "night", "real", "life", "north", "book", "carry", "science", "eat",
    "room", "friend", "began", "idea", "fish", "mountain", "stop", "once", "base", "hear",
    "horse", "cut", "sure", "watch", "color", "face", "wood", "main", "open", "seem",
    "quiz", "zero", "zone", "zeal", "zip", "zoo", "zap", "zen", "zigzag", "zinc",
    "rix", "vex", "vox", "wax", "fox", "box", "mix", "six", "fix", "tax",
    "oxygen", "pixie", "proxy", "toxic", "oxy", "lynx", "onyx", "yx", "xray", "waxy",
    "fuzzy", "jazz", "fizz", "buzz", "lazy", "crazy", "hazy", "cozy", "dozen", "frozen"
  ];

  const initialTestParagraphs = [
    "the quick brown fox jumps over the lazy dog while zigzagging through exotic vegetation with maximum speed and agility",
    "pack my box with five dozen liquor jugs while quickly analyzing the government budget expectations for next quarter",
    "few black taxis drive up major roads on quiet hazy nights seeking convenience and just making weekly plans"
  ];

  const [phase, setPhase] = useState('test');
  const [testIndex, setTestIndex] = useState(0);
  const [currentText, setCurrentText] = useState(initialTestParagraphs[0]);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const [alpha, setAlpha] = useState(Array(26).fill(1));
  const [beta, setBeta] = useState(Array(26).fill(1));
  
  const [stats, setStats] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentText]);

  const charToIndex = (char) => {
    const lower = char.toLowerCase();
    const code = lower.charCodeAt(0);
    if (code >= 97 && code <= 122) {
      return code - 97;
    }
    return -1;
  };

  const handleInput = (e) => {
    const input = e.target.value;
    
    // Prevent backspace - only allow forward typing
    if (input.length < userInput.length) {
      return;
    }

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (input.length > currentText.length) {
      return;
    }

    setUserInput(input);

    if (input.length === currentText.length) {
      setEndTime(Date.now());
      setIsComplete(true);
      processResults(input);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
    }
  };

  const bootstrapErrorRate = (successes, failures, numSamples = 1000) => {
    const samples = [];
    const total = successes + failures;
    
    for (let i = 0; i < numSamples; i++) {
      let bootstrapFailures = 0;
      for (let j = 0; j < total; j++) {
        if (Math.random() < failures / total) {
          bootstrapFailures++;
        }
      }
      samples.push(bootstrapFailures / total);
    }
    
    samples.sort((a, b) => a - b);
    const mean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
    const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;
    const ci95Low = samples[Math.floor(numSamples * 0.025)];
    const ci95High = samples[Math.floor(numSamples * 0.975)];
    
    return { mean, variance, ci95Low, ci95High, stdDev: Math.sqrt(variance) };
  };

  const processResults = (input) => {
    const newAlpha = [...alpha];
    const newBeta = [...beta];

    for (let i = 0; i < currentText.length; i++) {
      const expected = currentText[i];
      const actual = input[i] || '';
      const idx = charToIndex(expected);

      if (idx !== -1) {
        if (expected === actual) {
          newBeta[idx]++;
        } else {
          newAlpha[idx]++;
        }
      }
    }

    setAlpha(newAlpha);
    setBeta(newBeta);

    const timeSeconds = (endTime || Date.now() - startTime) / 1000;
    const correctChars = input.split('').filter((c, i) => c === currentText[i]).length;
    const totalChars = currentText.length;
    const accuracy = correctChars / totalChars;
    const wpm = (totalChars / 5) / (timeSeconds / 60);

    // Calculate typing score (weighted combination of WPM and accuracy)
    const typingScore = (wpm * 0.6 + accuracy * 100 * 0.4).toFixed(2);

    const pErr = newAlpha.map((a, i) => a / (a + newBeta[i]));
    const sumErr = pErr.reduce((sum, p) => sum + p, 0);
    const pErrNorm = pErr.map(p => p / sumErr);

    const entropy = -pErrNorm.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);

    const uniform = 1 / 26;
    const klDiv = pErrNorm.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p / uniform) : 0);
    }, 0);

    // Bootstrap confidence intervals for each letter
    const bootstrapResults = newAlpha.map((a, i) => {
      const failures = a - 1; // Subtract initial prior
      const successes = newBeta[i] - 1;
      if (failures + successes > 0) {
        return bootstrapErrorRate(successes, failures);
      }
      return { mean: 0, variance: 0, ci95Low: 0, ci95High: 0, stdDev: 0 };
    });

    const newStats = {
      wpm: wpm.toFixed(2),
      accuracy: (accuracy * 100).toFixed(2),
      entropy: entropy.toFixed(3),
      klDivergence: klDiv.toFixed(3),
      typingScore: typingScore,
      pErr: pErr,
      pErrNorm: pErrNorm,
      pCorrect: newBeta.map((b, i) => b / (newAlpha[i] + b)),
      timeSeconds: timeSeconds.toFixed(2),
      bootstrapResults: bootstrapResults,
      rawAccuracy: accuracy,
      rawWpm: wpm
    };

    setStats(newStats);
    setSessionHistory(prev => [...prev, {
      phase: phase === 'test' ? `Test ${testIndex + 1}` : `Practice ${prev.filter(s => s.phase.startsWith('Practice')).length + 1}`,
      sessionNum: prev.length + 1,
      ...newStats
    }]);
  };

  const generateParagraph = () => {
    const pErr = alpha.map((a, i) => a / (a + beta[i]));

    // Calculate letter coverage in vocabulary
    const letterCoverage = Array(26).fill(0);
    vocabulary.forEach(word => {
      for (const char of word.toLowerCase()) {
        const idx = charToIndex(char);
        if (idx !== -1) {
          letterCoverage[idx]++;
        }
      }
    });

    // Boost weights for underrepresented letters (x, y, z, q, etc.)
    const boostFactor = letterCoverage.map(count => {
      return count < 10 ? 2.0 : 1.0;
    });

    const weights = vocabulary.map(word => {
      let weight = 0;
      for (const char of word.toLowerCase()) {
        const idx = charToIndex(char);
        if (idx !== -1) {
          weight += pErr[idx] * boostFactor[idx];
        }
      }
      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const probabilities = weights.map(w => w / totalWeight);

    // Generate 50-100 words (target ~75)
    const numWords = 50 + Math.floor(Math.random() * 51);
    const selectedWords = [];
    
    for (let i = 0; i < numWords; i++) {
      let rand = Math.random();
      let cumProb = 0;
      
      for (let j = 0; j < vocabulary.length; j++) {
        cumProb += probabilities[j];
        if (rand <= cumProb) {
          selectedWords.push(vocabulary[j]);
          break;
        }
      }
    }

    return selectedWords.join(' ');
  };

  const handleNext = () => {
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setIsComplete(false);
    setStats(null);

    if (phase === 'test') {
      if (testIndex < initialTestParagraphs.length - 1) {
        setTestIndex(testIndex + 1);
        setCurrentText(initialTestParagraphs[testIndex + 1]);
      } else {
        setPhase('practice');
        const newParagraph = generateParagraph();
        setCurrentText(newParagraph);
      }
    } else {
      const newParagraph = generateParagraph();
      setCurrentText(newParagraph);
    }
  };

  const getCharClass = (index) => {
    if (index >= userInput.length) return 'text-gray-400';
    return userInput[index] === currentText[index] ? 'text-green-600' : 'text-red-600 bg-red-100';
  };

  const getLetterStats = () => {
    return Array.from({ length: 26 }, (_, i) => ({
      letter: String.fromCharCode(97 + i),
      error: ((alpha[i] / (alpha[i] + beta[i])) * 100).toFixed(1),
      attempts: alpha[i] + beta[i] - 2
    })).filter(item => item.attempts > 0);
  };

  const getKLDivergenceData = () => {
    if (!stats) return [];
    return Array.from({ length: 26 }, (_, i) => {
      const letter = String.fromCharCode(97 + i);
      const pErr = stats.pErrNorm[i];
      const uniform = 1 / 26;
      const contribution = pErr > 0 ? pErr * Math.log2(pErr / uniform) : 0;
      return {
        letter,
        klContribution: contribution.toFixed(4),
        errorProb: (pErr * 100).toFixed(2)
      };
    }).filter(item => parseFloat(item.errorProb) > 0);
  };

  const getBootstrapData = () => {
    if (!stats) return [];
    return Array.from({ length: 26 }, (_, i) => {
      const letter = String.fromCharCode(97 + i);
      const bootstrap = stats.bootstrapResults[i];
      const attempts = alpha[i] + beta[i] - 2;
      if (attempts > 0) {
        return {
          letter,
          errorRate: (bootstrap.mean * 100).toFixed(2),
          stdDev: (bootstrap.stdDev * 100).toFixed(2),
          ci95Low: (bootstrap.ci95Low * 100).toFixed(2),
          ci95High: (bootstrap.ci95High * 100).toFixed(2),
          variance: (bootstrap.variance * 10000).toFixed(4)
        };
      }
      return null;
    }).filter(item => item !== null);
  };

  const getImprovementData = () => {
    if (sessionHistory.length < 2) return [];
    
    const improvements = [];
    for (let i = 1; i < sessionHistory.length; i++) {
      const current = sessionHistory[i];
      const previous = sessionHistory[i - 1];
      
      improvements.push({
        session: current.phase,
        sessionNum: i + 1,
        wpmChange: (parseFloat(current.wpm) - parseFloat(previous.wpm)).toFixed(2),
        accuracyChange: (parseFloat(current.accuracy) - parseFloat(previous.accuracy)).toFixed(2),
        scoreChange: (parseFloat(current.typingScore) - parseFloat(previous.typingScore)).toFixed(2)
      });
    }
    return improvements;
  };

  const getEntropyInsight = () => {
    if (!stats) return "";
    const entropy = parseFloat(stats.entropy);
    const maxEntropy = Math.log2(26);
    const normalizedEntropy = entropy / maxEntropy;
    
    if (normalizedEntropy > 0.85) {
      return "High entropy detected: Your errors are uniformly distributed across many characters. This suggests general typing practice is needed rather than focused practice on specific problem letters.";
    } else if (normalizedEntropy > 0.6) {
      return "Moderate entropy: Your errors show some concentration on specific characters, but are fairly distributed. Consider focusing on your weakest letters while maintaining general practice.";
    } else {
      return "Low entropy detected: Your errors are concentrated on specific characters. This indicates clear problem areas. The adaptive paragraphs will focus heavily on these specific letters to improve your targeted weaknesses.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Adaptive Typing Practice</h1>
          <p className="text-gray-600 mb-6">
            {phase === 'test' 
              ? `Test Phase: Paragraph ${testIndex + 1} of ${initialTestParagraphs.length}`
              : `Practice Phase: Adaptive paragraph (50-100 words)`}
          </p>

          <div className="mb-6 p-6 bg-gray-50 rounded-lg font-mono text-lg leading-relaxed">
            {currentText.split('').map((char, idx) => (
              <span key={idx} className={getCharClass(idx)}>
                {char}
              </span>
            ))}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isComplete}
            className="w-full p-4 text-lg font-mono border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            placeholder="Start typing... (backspace disabled)"
          />

          {isComplete && stats && (
            <div className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">WPM</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.wpm}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Accuracy</div>
                  <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Typing Score</div>
                  <div className="text-2xl font-bold text-purple-600">{stats.typingScore}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Entropy</div>
                  <div className="text-2xl font-bold text-orange-600">{stats.entropy}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">KL Divergence</div>
                  <div className="text-2xl font-bold text-red-600">{stats.klDivergence}</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Entropy Analysis</h3>
                <p className="text-sm text-gray-700">{getEntropyInsight()}</p>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {phase === 'test' && testIndex < initialTestParagraphs.length - 1
                  ? 'Next Test Paragraph'
                  : 'Generate Adaptive Paragraph'}
              </button>
            </div>
          )}
        </div>

        {stats && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Letter Error Rates</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getLetterStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="letter" />
                  <YAxis label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="error" fill="#ef4444" name="Error Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">KL Divergence from Uniform Distribution</h2>
              <p className="text-sm text-gray-600 mb-4">
                Shows how much each letter's error probability differs from uniform distribution (1/26). 
                Higher values indicate letters that deviate more from expected uniform error rates.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getKLDivergenceData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="letter" />
                  <YAxis label={{ value: 'KL Contribution', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="klContribution" fill="#f97316" name="KL Contribution" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Bootstrap Confidence Intervals for Error Rates</h2>
              <p className="text-sm text-gray-600 mb-4">
                Using bootstrap resampling (1000 iterations) to estimate uncertainty in error rates. 
                Error bars show 95% confidence intervals. Higher standard deviation indicates more uncertainty.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="letter" />
                  <YAxis label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-bold">{data.letter}</p>
                          <p>Error Rate: {data.errorRate}%</p>
                          <p>Std Dev: {data.stdDev}%</p>
                          <p>95% CI: [{data.ci95Low}%, {data.ci95High}%]</p>
                          <p>Variance: {data.variance}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Scatter data={getBootstrapData()} fill="#8b5cf6">
                    {getBootstrapData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#8b5cf6" />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {sessionHistory.length > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Improvement Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" />
                <YAxis yAxisId="left" label={{ value: 'Score / WPM', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="typingScore" stroke="#8b5cf6" name="Typing Score" strokeWidth={2} />
                <Line yAxisId="left" type="monotone" dataKey="wpm" stroke="#3b82f6" name="WPM" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy (%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {sessionHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Session History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Phase</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">WPM</th>
                    <th className="text-left p-2">Accuracy</th>
                    <th className="text-left p-2">Entropy</th>
                    <th className="text-left p-2">KL Div</th>
                    <th className="text-left p-2">Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map((session, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2">{session.phase}</td>
                      <td className="p-2 font-semibold text-purple-600">{session.typingScore}</td>
                      <td className="p-2">{session.wpm}</td>
                      <td className="p-2">{session.accuracy}%</td>
                      <td className="p-2">{session.entropy}</td>
                      <td className="p-2">{session.klDivergence}</td>
                      <td className="p-2">{session.timeSeconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveTypingSystem;
