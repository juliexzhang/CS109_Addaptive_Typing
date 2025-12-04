import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';

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

  // alpha = incorrect + 1, beta = correct + 1
  const [alpha, setAlpha] = useState(Array(26).fill(1));
  const [beta, setBeta] = useState(Array(26).fill(1));

  const [stats, setStats] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);

  // For global accuracy-improvement bootstrap
  const [accuracyImprovement, setAccuracyImprovement] = useState(null);
  const [showAccuracyImprovement, setShowAccuracyImprovement] = useState(false);

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
      const end = Date.now();
      setEndTime(end);
      setIsComplete(true);
      processResults(input, end);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
    }
  };

  const processResults = (input, finalEndTime) => {
    const newAlpha = [...alpha];
    const newBeta = [...beta];

    let correctChars = 0;
    const totalChars = currentText.length;

    for (let i = 0; i < currentText.length; i++) {
      const expected = currentText[i];
      const actual = input[i] || '';
      const idx = charToIndex(expected);

      if (idx !== -1) {
        if (expected === actual) {
          newBeta[idx]++;
          correctChars++;
        } else {
          newAlpha[idx]++;
        }
      }
    }

    setAlpha(newAlpha);
    setBeta(newBeta);

    const end = finalEndTime || Date.now();
    const timeSeconds = startTime ? (end - startTime) / 1000 : 0;

    const accuracy = totalChars > 0 ? correctChars / totalChars : 0;
    const wpm = timeSeconds > 0 ? (totalChars / 5) / (timeSeconds / 60) : 0;

    // Calculate typing score (weighted combination of WPM and accuracy)
    const typingScore = (wpm * 0.3 + accuracy * 100 * 0.7).toFixed(2);

    // Error-based distribution across letters for this session
    const pErr = newAlpha.map((a, i) => a / (a + newBeta[i]));
    const sumErr = pErr.reduce((sum, p) => sum + p, 0) || 1;
    const pErrNorm = pErr.map(p => p / sumErr);

    const entropy = -pErrNorm.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);

    const uniform = 1 / 26;
    const klDiv = pErrNorm.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p / uniform) : 0);
    }, 0);

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
      rawAccuracy: accuracy,
      rawWpm: wpm,
      correctChars,
      totalChars
    };

    setStats(newStats);
    setSessionHistory(prev => [
      ...prev,
      {
        phase: phase === 'test'
          ? `Test ${testIndex + 1}`
          : `Practice ${prev.filter(s => s.phase.startsWith('Practice')).length + 1}`,
        sessionNum: prev.length + 1,
        ...newStats
      }
    ]);
  };

  const generateParagraph = () => {
    // Use full posterior info (alpha,beta) plus entropy and per-letter KL
    const pErr = alpha.map((a, i) => a / (a + beta[i]));
    const sumErr = pErr.reduce((sum, p) => sum + p, 0) || 1;
    const pErrNorm = pErr.map(p => p / sumErr);

    // Entropy of error distribution
    const entropy = -pErrNorm.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    const maxEntropy = Math.log2(26);
    const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

    const uniform = 1 / 26;

    // Per-letter KL contribution (clamped at 0; only positive "over-represented" letters boosted)
    const klPerLetter = pErrNorm.map(p => {
      if (p <= 0) return 0;
      const contrib = p * Math.log2(p / uniform);
      return Math.max(contrib, 0);
    });
    const maxKL = Math.max(...klPerLetter, 0);
    const klNorm = maxKL > 0 ? klPerLetter.map(k => k / maxKL) : Array(26).fill(0);

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

    // Use error probs, KL, and entropy to weight words
    const weights = vocabulary.map(word => {
      let weight = 0;
      const lower = word.toLowerCase();

      for (const char of lower) {
        const idx = charToIndex(char);
        if (idx !== -1) {
          const errProb = pErr[idx]; // higher error => more practice
          const klBoost = 1 + klNorm[idx] * 2; // 1x–3x depending on KL
          const entropyBoost = 1 + normalizedEntropy; // 1–2 global exploration factor
          weight += errProb * boostFactor[idx] * klBoost * entropyBoost;
        }
      }
      return weight;
    });

    let totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) {
      // fallback to uniform weights if something degenerate happens
      totalWeight = vocabulary.length;
      for (let i = 0; i < weights.length; i++) {
        weights[i] = 1;
      }
    }

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
    setShowAccuracyImprovement(false);
    setAccuracyImprovement(null);

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
    return userInput[index] === currentText[index]
      ? 'text-green-600'
      : 'text-red-600 bg-red-100';
  };

  const getLetterStats = () => {
    return Array.from({ length: 26 }, (_, i) => {
      const letter = String.fromCharCode(97 + i);
  
      const rawAlpha = alpha[i]; // errors + 1
      const rawBeta = beta[i];   // correct + 1
  
      const mistakes = rawAlpha - 1;
      const successes = rawBeta - 1;
      const attempts = mistakes + successes;
  
      if (attempts <= 0) {
        return null;
      }
  
      const empiricalError = (mistakes / attempts) * 100;
  
      return {
        letter,
        error: empiricalError.toFixed(1),
        attempts
      };
    }).filter(item => item !== null);
  };
  

  const getKLDivergenceData = () => {
    if (!stats) return [];
    const uniform = 1 / 26;
  
    return Array.from({ length: 26 }, (_, i) => {
      const letter = String.fromCharCode(97 + i);
      const pErr = stats.pErrNorm[i];
  
      const contribution =
        pErr > 0 ? pErr * Math.log2(pErr / uniform) : 0;
  
      return {
        letter,
        klContribution: contribution.toFixed(4),
        errorProb: (pErr * 100).toFixed(2)
      };
    }).filter(item => parseFloat(item.errorProb) > 0);
  };
  

  // Beta expectation / variance for per-letter correctness
  const getBetaCorrectData = () => {
    return Array.from({ length: 26 }, (_, i) => {
      const a = beta[i];  // successes (correct) parameter
      const b = alpha[i]; // failures (incorrect) parameter
      const total = a + b;
      const attempts = total - 2; // subtract priors

      if (attempts <= 0) {
        return null;
      }

      const mean = a / total;
      const variance = (a * b) / (total * total * (total + 1));

      return {
        letter: String.fromCharCode(97 + i),
        meanCorrect: parseFloat((mean * 100).toFixed(2)), // percentage
        variance: variance // raw variance in [0, 0.25]
      };
    }).filter(item => item !== null);
  };

  const getEntropyInsight = () => {
    if (!stats) return "";
    const entropy = parseFloat(stats.entropy);
    const maxEntropy = Math.log2(26);
    const normalizedEntropy = entropy / maxEntropy;

    if (normalizedEntropy > 0.85) {
      return "High entropy detected: Your errors are fairly spread across many characters. InfiniteMonkeyType will continue exploring broadly to better understand your typing profile.";
    } else if (normalizedEntropy > 0.6) {
      return "Moderate entropy: Your errors show some concentration on specific characters, but are still fairly distributed. The adaptive text will balance focused practice with exploration.";
    } else {
      return "Low entropy detected: Your errors are concentrated on specific characters. The adaptive paragraphs will heavily emphasize these letters to target your weaknesses.";
    }
  };

  // Bootstrap comparison of baseline (non-adaptive) vs combined (non-adaptive + adaptive)
  const computeAccuracyImprovement = () => {
    const testSessions = sessionHistory.filter(s => s.phase.startsWith('Test'));
    const practiceSessions = sessionHistory.filter(s => s.phase.startsWith('Practice'));

    if (testSessions.length === 0 || practiceSessions.length === 0) {
      setAccuracyImprovement(null);
      setShowAccuracyImprovement(false);
      return;
    }

    let baselineCorrect = 0;
    let baselineTotal = 0;
    testSessions.forEach(s => {
      baselineCorrect += s.correctChars;
      baselineTotal += s.totalChars;
    });

    let adaptiveCorrect = 0;
    let adaptiveTotal = 0;
    practiceSessions.forEach(s => {
      adaptiveCorrect += s.correctChars;
      adaptiveTotal += s.totalChars;
    });

    const combinedCorrect = baselineCorrect + adaptiveCorrect;
    const combinedTotal = baselineTotal + adaptiveTotal;

    if (baselineTotal === 0 || combinedTotal === 0) {
      setAccuracyImprovement(null);
      setShowAccuracyImprovement(false);
      return;
    }

    const baselineAcc = baselineCorrect / baselineTotal;
    const combinedAcc = combinedCorrect / combinedTotal;

    const numSamples = 2000;
    const diffs = [];

    for (let i = 0; i < numSamples; i++) {
      let bootCorrectBaseline = 0;
      for (let j = 0; j < baselineTotal; j++) {
        if (Math.random() < baselineAcc) bootCorrectBaseline++;
      }

      let bootCorrectCombined = 0;
      for (let j = 0; j < combinedTotal; j++) {
        if (Math.random() < combinedAcc) bootCorrectCombined++;
      }

      const acc1 = bootCorrectBaseline / baselineTotal;
      const acc2 = bootCorrectCombined / combinedTotal;
      diffs.push(acc2 - acc1);
    }

    diffs.sort((a, b) => a - b);
    const meanDiff = diffs.reduce((sum, x) => sum + x, 0) / diffs.length;
    const ciLow = diffs[Math.floor(numSamples * 0.025)];
    const ciHigh = diffs[Math.floor(numSamples * 0.975)];

    setAccuracyImprovement({
      baselineAccuracy: baselineAcc,
      combinedAccuracy: combinedAcc,
      meanDiff,
      ciLow,
      ciHigh
    });
    setShowAccuracyImprovement(true);
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

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Entropy Analysis</h3>
                <p className="text-sm text-gray-700">{getEntropyInsight()}</p>
              </div>

              {/* Accuracy improvement (binomial bootstrap) – appears once at least one practice session exists */}
              {phase === 'practice' &&
                sessionHistory.filter(s => s.phase.startsWith('Practice')).length >= 1 && (
                  <div className="mb-4">
                    <button
                      onClick={computeAccuracyImprovement}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                      Analyze Accuracy Improvement (Bootstrap)
                    </button>

                    {showAccuracyImprovement && accuracyImprovement && (
                      <div className="mt-4 bg-white border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Accuracy Improvement (Binomial Bootstrap)
                        </h3>
                        <p className="text-sm text-gray-700">
                          Baseline (test only):{" "}
                          <span className="font-semibold">
                            {(accuracyImprovement.baselineAccuracy * 100).toFixed(2)}%
                          </span>
                        </p>
                        <p className="text-sm text-gray-700">
                          After adaptive practice (combined):{" "}
                          <span className="font-semibold">
                            {(accuracyImprovement.combinedAccuracy * 100).toFixed(2)}%
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Estimated improvement:{" "}
                          <span className="font-semibold">
                            {(accuracyImprovement.meanDiff * 100).toFixed(2)}%
                          </span>{" "}
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
            {/* Letter error rates (still in terms of error probability) */}
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

            {/* KL divergence contributions (per-letter) */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                KL Divergence from Uniform Distribution
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Shows how much each letter&apos;s error probability differs from a uniform error
                distribution (1/26). Higher values indicate letters that deviate more and may need
                targeted practice.
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

            {/* NEW: Beta expectation / variance for per-letter correctness */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Bayesian Belief About Letter Correctness (Beta Posterior)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Bars show the expected probability of typing each letter correctly under a Beta
                posterior. The line shows the variance of that belief. Higher variance indicates
                more uncertainty about your ability on that letter.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={getBetaCorrectData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="letter" />
                  <YAxis
                    yAxisId="left"
                    label={{ value: 'E[p(correct)] (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Var[p(correct)]', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="meanCorrect"
                    fill="#22c55e"
                    name="E[p(correct)] (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="variance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Var[p(correct)]"
                  />
                </ComposedChart>
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
                <YAxis
                  yAxisId="left"
                  label={{ value: 'Score / WPM', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="typingScore"
                  stroke="#8b5cf6"
                  name="Typing Score"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wpm"
                  stroke="#3b82f6"
                  name="WPM"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  name="Accuracy (%)"
                  strokeWidth={2}
                />
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
