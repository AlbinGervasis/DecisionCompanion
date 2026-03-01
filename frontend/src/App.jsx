import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Settings, Play, AlertCircle, RefreshCw, BarChart2, Zap, Plus, Trash2, Save, FolderOpen } from 'lucide-react';
import './index.css';

const TEMPLATES = {
  'Custom Decision': {
    name: "Custom Decision Context",
    criteria: ['Criterion A', 'Criterion B'],
    weights: { 'Criterion A': 0.5, 'Criterion B': 0.5 },
    types: { 'Criterion A': 'benefit', 'Criterion B': 'cost' },
    options: { 'Option 1': { 'Criterion A': 10, 'Criterion B': 5 }, 'Option 2': { 'Criterion A': 8, 'Criterion B': 2 } }
  },
  'Laptop Purchase': {
    name: "Laptop Purchase",
    criteria: ['Price', 'Performance', 'Battery', 'Weight'],
    weights: { 'Price': 0.35, 'Performance': 0.3, 'Battery': 0.2, 'Weight': 0.15 },
    types: { 'Price': 'cost', 'Performance': 'benefit', 'Battery': 'benefit', 'Weight': 'cost' },
    options: {
      'MacBook Air': { 'Price': 999, 'Performance': 85, 'Battery': 18, 'Weight': 2.7 },
      'Dell XPS 13': { 'Price': 1200, 'Performance': 90, 'Battery': 12, 'Weight': 2.8 },
      'ThinkPad T14': { 'Price': 1050, 'Performance': 78, 'Battery': 15, 'Weight': 3.2 }
    }
  },
  'Job Offer Selection': {
    name: "Job Offer Selection",
    criteria: ['Base Salary', 'Growth Potential', 'Commute Time', 'Culture'],
    weights: { 'Base Salary': 0.4, 'Growth Potential': 0.3, 'Commute Time': 0.15, 'Culture': 0.15 },
    types: { 'Base Salary': 'benefit', 'Growth Potential': 'benefit', 'Commute Time': 'cost', 'Culture': 'benefit' },
    options: {
      'Startup X': { 'Base Salary': 90000, 'Growth Potential': 9, 'Commute Time': 15, 'Culture': 8 },
      'Big Tech Y': { 'Base Salary': 130000, 'Growth Potential': 6, 'Commute Time': 60, 'Culture': 5 },
      'Agency Z': { 'Base Salary': 105000, 'Growth Potential': 7, 'Commute Time': 30, 'Culture': 9 }
    }
  },
  'Travel Destination': {
    name: "Travel Destination",
    criteria: ['Flight Cost', 'Weather Score', 'Activities', 'Safety'],
    weights: { 'Flight Cost': 0.3, 'Weather Score': 0.3, 'Activities': 0.2, 'Safety': 0.2 },
    types: { 'Flight Cost': 'cost', 'Weather Score': 'benefit', 'Activities': 'benefit', 'Safety': 'benefit' },
    options: {
      'Bali': { 'Flight Cost': 1200, 'Weather Score': 9, 'Activities': 9, 'Safety': 7 },
      'Tokyo': { 'Flight Cost': 1500, 'Weather Score': 7, 'Activities': 10, 'Safety': 10 },
      'Rome': { 'Flight Cost': 800, 'Weather Score': 8, 'Activities': 8, 'Safety': 6 }
    }
  }
};

function App() {
  const [activeDecisionName, setActiveDecisionName] = useState('Job Offer Selection');
  const [criteria, setCriteria] = useState(TEMPLATES['Job Offer Selection'].criteria);
  const [weights, setWeights] = useState(TEMPLATES['Job Offer Selection'].weights);
  const [criteriaTypes, setCriteriaTypes] = useState(TEMPLATES['Job Offer Selection'].types);
  const [options, setOptions] = useState(TEMPLATES['Job Offer Selection'].options);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [liveMode, setLiveMode] = useState(false);

  // History State
  const [savedDecisions, setSavedDecisions] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('smartDecisionHistory');
    if (stored) {
      setSavedDecisions(JSON.parse(stored));
    }
  }, []);

  const handleSaveDecision = () => {
    const newHistory = {
      ...savedDecisions,
      [activeDecisionName]: { criteria, weights, types: criteriaTypes, options }
    };
    setSavedDecisions(newHistory);
    localStorage.setItem('smartDecisionHistory', JSON.stringify(newHistory));
    alert('Decision saved to history!');
  };

  const loadTemplate = (templateName, isHistory = false) => {
    const data = isHistory ? savedDecisions[templateName] : TEMPLATES[templateName];
    if (!data) return;
    setActiveDecisionName(isHistory ? templateName : data.name);
    setCriteria(data.criteria);
    setWeights(data.weights);
    setCriteriaTypes(data.types);
    setOptions(data.options);
    setResults(null);
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options,
          criteria,
          weights,
          criteria_type: criteriaTypes
        })
      });

      if (!response.ok) throw new Error("Evaluation failed check the backend.");

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (liveMode) handleEvaluate();
    // eslint-disable-next-line
  }, [weights, options]);

  const addOption = () => {
    const newOptName = `New Option ${Object.keys(options).length + 1}`;
    const newOpt = {};
    criteria.forEach(c => newOpt[c] = 0);
    setOptions({ ...options, [newOptName]: newOpt });
  };

  const addCriterion = () => {
    const newCrit = `Factor ${criteria.length + 1}`;
    setCriteria([...criteria, newCrit]);
    setWeights({ ...weights, [newCrit]: 0.1 });
    setCriteriaTypes({ ...criteriaTypes, [newCrit]: 'benefit' });

    // update options
    const newOpts = { ...options };
    Object.keys(newOpts).forEach(o => newOpts[o][newCrit] = 0);
    setOptions(newOpts);
  };

  const removeCriterion = (cToRemove) => {
    const newCrit = criteria.filter(c => c !== cToRemove);
    const newWeights = { ...weights }; delete newWeights[cToRemove];
    const newTypes = { ...criteriaTypes }; delete newTypes[cToRemove];

    const newOpts = { ...options };
    Object.keys(newOpts).forEach(o => delete newOpts[o][cToRemove]);

    setCriteria(newCrit);
    setWeights(newWeights);
    setCriteriaTypes(newTypes);
    setOptions(newOpts);
  };

  return (
    <div className="min-h-screen p-8 text-white relative flex flex-col gap-8" style={{ minHeight: '100vh', background: '#0f172a' }}>

      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600 blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[150px] opacity-10 pointer-events-none" />

      {/* Header & Template Selector */}
      <header className="flex flex-col gap-4 pb-4 border-b border-white/10" style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BrainCircuit size={36} color="#8b5cf6" />
            <div>
              <h1 className="gradient-text m-0" style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>Universal Decision Companion</h1>
              <p className="text-gray-400 m-0" style={{ margin: 0, color: 'rgba(255,255,255,0.6)' }}>Dynamic contextual evaluation framework</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px' }}
              onChange={(e) => {
                if (e.target.value.startsWith('HIST:')) loadTemplate(e.target.value.split(':')[1], true);
                else loadTemplate(e.target.value, false);
              }}
            >
              <optgroup label="Starter Templates">
                {Object.keys(TEMPLATES).map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
              {Object.keys(savedDecisions).length > 0 && (
                <optgroup label="Your Saved Decisions">
                  {Object.keys(savedDecisions).map(t => <option key={t} value={`HIST:${t}`}>{t}</option>)}
                </optgroup>
              )}
            </select>

            <button onClick={handleSaveDecision} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
              <Save size={16} /> Save Scope
            </button>
          </div>
        </div>

        <input
          type="text"
          value={activeDecisionName}
          onChange={(e) => setActiveDecisionName(e.target.value)}
          style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', fontWeight: 600, color: '#e2e8f0', outline: 'none' }}
          placeholder="Decision Context Name"
        />
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flex: 1, zIndex: 1 }}>

        {/* Left Col: Setup via Sliders */}
        <section className="glass-panel flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 className="flex items-center gap-2 text-xl m-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0 }}>
              <Settings size={20} /> Criteria Matrix
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} style={{ accentColor: '#10b981' }} />
              Live Mode
            </label>
          </div>

          <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {criteria.map((c, i) => (
              <div key={i} className="bg-black/20 p-4 rounded-xl relative group" style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
                <div className="flex justify-between mb-2 items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input
                    value={c}
                    onChange={(e) => {
                      const newC = e.target.value;
                      if (!newC || criteria.includes(newC)) return; // prevent dupes/empties in this simple UI

                      const newCrits = [...criteria]; newCrits[i] = newC;
                      const newWeights = { ...weights }; newWeights[newC] = newWeights[c]; delete newWeights[c];
                      const newTypes = { ...criteriaTypes }; newTypes[newC] = newTypes[c]; delete newTypes[c];
                      const newOpts = { ...options };
                      Object.keys(newOpts).forEach(o => { newOpts[o][newC] = newOpts[o][c]; delete newOpts[o][c]; });

                      setCriteria(newCrits); setWeights(newWeights); setCriteriaTypes(newTypes); setOptions(newOpts);
                    }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', width: '120px' }}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="text-purple-400" style={{ color: '#a78bfa', fontSize: '0.9rem' }}>{(weights[c] * 100).toFixed(0)}%</span>
                    <button onClick={() => removeCriterion(c)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.8 }}><Trash2 size={16} /></button>
                  </div>
                </div>

                <input
                  type="range" min="0" max="1" step="0.05" value={weights[c]}
                  onChange={(e) => setWeights({ ...weights, [c]: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-purple-500" style={{ width: '100%', accentColor: '#a78bfa', cursor: 'pointer' }}
                />

                <div className="flex justify-between text-xs mt-2 text-gray-400" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.5)' }}>
                  <select
                    value={criteriaTypes[c]}
                    onChange={(e) => setCriteriaTypes({ ...criteriaTypes, [c]: e.target.value })}
                    style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="benefit" style={{ color: 'black' }}>Higher is Better</option>
                    <option value="cost" style={{ color: 'black' }}>Lower is Better</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addCriterion} style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)', padding: '0.8rem', borderRadius: '8px', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Plus size={16} /> Add Custom Criterion
          </button>

          {!liveMode && (
            <button className="btn-primary mt-auto" onClick={handleEvaluate} disabled={loading} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: '#8b5cf6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <><Play size={18} /> Compute Decision Context</>}
            </button>
          )}
        </section>

        {/* Right Col: Options & Results */}
        <section className="flex flex-col gap-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-xl m-0" style={{ fontSize: '1.25rem', margin: 0 }}>Alternative Options Matrix</h2>
              <button onClick={addOption} style={{ background: '#3b82f6', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', color: 'white', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}><Plus size={14} /> Add Option</button>
            </div>

            <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
              <table className="w-full text-left border-collapse" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr className="border-b border-white/10" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="p-4 text-gray-400" style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>Option Name</th>
                    {criteria.map(c => <th key={c} className="p-4 text-gray-400" style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(options).map(([optName, optValues]) => (
                    <tr key={optName} className="border-b border-white/5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="p-4 font-medium" style={{ padding: '1rem' }}>
                        <input
                          value={optName}
                          onChange={(e) => {
                            const newName = e.target.value;
                            if (!newName || options[newName]) return;
                            const newOpts = { ...options };
                            newOpts[newName] = newOpts[optName];
                            delete newOpts[optName];
                            setOptions(newOpts);
                          }}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.4rem', borderRadius: '4px' }}
                        />
                      </td>
                      {criteria.map(c => (
                        <td key={c} className="p-4" style={{ padding: '1rem' }}>
                          <input
                            className="input-glass w-24 p-2"
                            type="number"
                            value={optValues[c]}
                            onChange={(e) => {
                              const newOpts = { ...options };
                              newOpts[optName][c] = parseFloat(e.target.value) || 0;
                              setOptions(newOpts);
                            }}
                            style={{ width: '80px', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analysis & Results Area */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {results.analysis && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', margin: '0 0 0.8rem 0' }}><BarChart2 size={18} /> Confidence Protocol</h4>
                      <p style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{results.analysis.confidence.message}</p>
                    </div>

                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', margin: '0 0 0.8rem 0' }}><Zap size={18} /> Stability Analysis</h4>
                      <p style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{results.analysis.sensitivity.message}</p>
                    </div>

                    {results.analysis.tradeoffs && results.analysis.tradeoffs.length > 0 && (
                      <div style={{ gridColumn: '1 / -1', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', margin: '0 0 0.8rem 0' }}><AlertCircle size={18} /> Objective Conflicts Detected</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                          {results.analysis.tradeoffs.map((t, idx) => <li key={idx} style={{ marginBottom: '0.5rem' }}>{t}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '16px' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#34d399', margin: '0 0 1.5rem 0' }}>Evaluation Outcomes</h2>

                  {results.ranked_options.map((opt, idx) => {
                    const name = opt[0];
                    const score = opt[1];
                    const isWinner = idx === 0;
                    const explanation = results.explanations[name];

                    return (
                      <div key={name} style={{
                        padding: '1.5rem',
                        background: isWinner ? 'rgba(52, 211, 153, 0.1)' : 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                        border: isWinner ? '1px solid #34d399' : '1px solid transparent'
                      }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '1.4rem', color: isWinner ? '#34d399' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <span style={{ opacity: 0.5 }}>#{idx + 1}</span> {name}
                          </h3>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score.toFixed(3)}</div>
                        </div>

                        {isWinner ? (
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontStyle: 'italic', letterSpacing: '0.02em', lineHeight: '1.6' }}>
                            💡 {explanation.summary}
                          </div>
                        ) : (
                          explanation.why_not_winner && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid #ef4444', padding: '0.8rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                              📉 <strong>Deficit Analysis for {name}:</strong> {explanation.why_not_winner}
                            </div>
                          )
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          {explanation.details.map(det => (
                            <div key={det.criterion} style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>{det.criterion}</div>
                              <div style={{ fontSize: '0.9rem', color: '#a78bfa', marginTop: '0.2rem' }}>{det.insight}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </section>
      </div>
    </div>
  );
}

export default App;
