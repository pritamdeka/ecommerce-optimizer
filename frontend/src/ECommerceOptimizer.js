import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

// ===== Mistral AI utility functions via proxy =====
async function mistralSinglePrompt(prompt, sys = "You are an expert e-commerce product analyst.", temperature = 0.4, max_tokens = 256) {
  const res = await fetch("/api/mistral-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: "/v1/chat/completions",
      body: {
        model: "mistral-small-2503",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt }
        ],
        max_tokens,
        temperature
      }
    })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function mistralOptimizeDescription(original, keywords, category, audience) {
  const prompt = `Rewrite the following product description to maximize sales and SEO, tailoring language and content for the target audience.

Category: ${category}
Target audience: ${audience}
Required keywords: ${keywords}

Instructions:
- Use a persuasive, concise style.
- Adapt vocabulary, tone, and details to appeal specifically to the target audience.
- DO NOT use markdown, symbols, asterisks, or bullet points. Write as plain text only.
- Output ONLY the improved product description. No intro, no explanation, no formatting.

For example: For 'professionals', use precise, technical language. For 'budget' audiences, emphasize savings and value.

Description:
${original}`.trim();
  return mistralSinglePrompt(prompt, "You are an expert e-commerce copywriter. Do not add any text by yourself. Strictly Stick to the description given to you.", 0.5, 1024);
}
async function mistralKeywordSuggestion(original) {
  const prompt = `Extract exactly 5 main SEO keywords (not phrases, just single or two-word terms) from the following product description. 
  Only print the keywords separated by commas—no extra text, no explanation:\n${original}`.trim();
  return mistralSinglePrompt(prompt,  "You are an expert SEO copywriter.", 0.2, 128);
  return raw.replace(/^[^a-zA-Z0-9]*|[^a-zA-Z0-9, ]*$/g, '').trim(););
}
async function mistralSentiment(original) {
  const prompt = `What is the sentiment of this product description? Respond with one of: Positive, Negative, Neutral. Also give a confidence score from 0-100. Description:\n${original}`;
  return mistralSinglePrompt(prompt,"You are an expert marketing analyst.", 0.2, 20);
}
async function mistralTone(original) {
  const prompt = `Is the tone of this product description formal, informal, or neutral? Description:\n${original}`;
  return mistralSinglePrompt(prompt, "You are an expert marketing analyst.", 0.2, 128);
}
async function mistralSummary(original) {
  const prompt = `Summarize the following product description in 1-2 sentences:\n${original}`;
  return mistralSinglePrompt(prompt, "You are an expert summarizer.", 0.3, 128);
}
// Generate exactly 2 USPs as bullet points, no intro
async function mistralUSPs(original) {
  const prompt = `
List exactly 2 unique selling points for this product.
- Print only the selling points as bullet points, no intro, no extra text, no markdown or asterisks. Use "•" at the start of each line.
Description:
${original}
  `.trim();
  return mistralSinglePrompt(prompt, "You are an expert product marketing copywriter.", 0.4, 80);
}

// Generate an SEO title, max 8 words, plain text only
async function mistralSEOTitle(original) {
  const prompt = `
Suggest a short, catchy SEO title for this product (max 8 words).
- Print only the title, no intro, no extra text, no formatting.
Description:
${original}
  `.trim();
  return mistralSinglePrompt(prompt, "You are an expert SEO copywriter.", 0.3, 32);
}


const ECommerceOptimizer = () => {
  // --- State ---
  const [originalDescription, setOriginalDescription] = useState('');
  const [optimizedDescription, setOptimizedDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('optimizer');
  const [seoScore, setSeoScore] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [conversionScore, setConversionScore] = useState(0);
  const [keywords, setKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('general');
  const [productCategory, setProductCategory] = useState('electronics');
  const [analysisResults, setAnalysisResults] = useState([]);

  // --- AI Insights ---
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [tone, setTone] = useState("");
  const [summary, setSummary] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usps, setUSPs] = useState([]);
  const [seoTitle, setSEOTitle] = useState('');


  // --- Fallback rules (only if API down) ---
  const optimizationRules = {
    electronics: {
      keywords: ['premium', 'advanced', 'innovative', 'high-performance', 'cutting-edge'],
      structure: 'specifications-first'
    },
    fashion: {
      keywords: ['trendy', 'stylish', 'comfortable', 'versatile', 'premium'],
      structure: 'lifestyle-focused'
    },
    home: {
      keywords: ['durable', 'practical', 'elegant', 'space-saving', 'quality'],
      structure: 'benefit-focused'
    },
    sports: {
      keywords: ['performance', 'durable', 'professional', 'comfortable', 'reliable'],
      structure: 'performance-focused'
    }
  };

  // --- Metrics ---
  const analyzeText = (text) => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // SEO Score calculation
    const keywordDensity = keywords.split(',').reduce((acc, keyword) => {
      const regex = new RegExp(keyword.trim(), 'gi');
      return acc + (text.match(regex) || []).length;
    }, 0);

    const seoFactors = {
      length: text.length >= 150 && text.length <= 300 ? 25 : 10,
      keywords: Math.min(keywordDensity * 10, 25),
      structure: text.includes('•') || text.includes('-') ? 20 : 0,
      callToAction: /buy|purchase|order|get|shop/i.test(text) ? 30 : 0
    };

    const newSeoScore = Math.min(Object.values(seoFactors).reduce((a, b) => a + b, 0), 100);

    // Readability Score
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const readabilityFactors = {
      sentenceLength: avgWordsPerSentence < 20 ? 30 : 10,
      wordComplexity: words.filter(w => w.length < 7).length / Math.max(words.length, 1) * 30,
      structure: sentences.length >= 3 ? 20 : 10,
      clarity: text.match(/\b(this|that|it|they)\b/gi)?.length < 3 ? 20 : 10
    };

    const newReadabilityScore = Math.min(Object.values(readabilityFactors).reduce((a, b) => a + b, 0), 100);

    // Conversion Score
    const conversionFactors = {
      benefits: /benefit|advantage|improve|enhance|save|easy/gi.test(text) ? 25 : 0,
      emotions: /love|amazing|perfect|best|incredible|fantastic/gi.test(text) ? 20 : 0,
      urgency: /limited|now|today|don't miss|exclusive/gi.test(text) ? 20 : 0,
      social: /customers|reviews|rated|popular|trusted/gi.test(text) ? 15 : 0,
      guarantee: /guarantee|warranty|return|satisfaction/gi.test(text) ? 20 : 0
    };

    const newConversionScore = Math.min(Object.values(conversionFactors).reduce((a, b) => a + b, 0), 100);

    return {
      seo: newSeoScore,
      readability: newReadabilityScore,
      conversion: newConversionScore
    };
  };

  // --- AI-powered Optimization ---
  const generateOptimizedDescription = async () => {
    if (!originalDescription.trim()) return;
    setIsOptimizing(true);
    let aiText = null;
    let aiError = null;
    try {
      aiText = await mistralOptimizeDescription(
        originalDescription,
        keywords,
        productCategory,
        targetAudience
      );
    } catch (e) {
      aiError = "AI API Error: " + e.message;
    }

    if (aiText) {
      setOptimizedDescription(aiText);
      const originalAnalysis = analyzeText(originalDescription);
      const optimizedAnalysis = analyzeText(aiText);

      setSeoScore(optimizedAnalysis.seo);
      setReadabilityScore(optimizedAnalysis.readability);
      setConversionScore(optimizedAnalysis.conversion);

      setAnalysisResults([
        {
          metric: 'SEO',
          original: originalAnalysis.seo,
          optimized: optimizedAnalysis.seo,
          improvement: optimizedAnalysis.seo - originalAnalysis.seo
        },
        {
          metric: 'Readability',
          original: originalAnalysis.readability,
          optimized: optimizedAnalysis.readability,
          improvement: optimizedAnalysis.readability - originalAnalysis.readability
        },
        {
          metric: 'Conversion',
          original: originalAnalysis.conversion,
          optimized: optimizedAnalysis.conversion,
          improvement: optimizedAnalysis.conversion - originalAnalysis.conversion
        }
      ]);
      setIsOptimizing(false);
      return;
    }

    if (aiError) {
      alert(aiError);
      setIsOptimizing(false);
      return;
    }

    // Fallback (old logic)
    setTimeout(() => {
      const rules = optimizationRules[productCategory];
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);

      let optimized = originalDescription;
      if (rules.structure === 'specifications-first') {
        optimized = `Experience premium quality with this ${productCategory} product. ${optimized}`;
      } else if (rules.structure === 'lifestyle-focused') {
        optimized = `Transform your style with this ${productCategory} essential. ${optimized}`;
      } else if (rules.structure === 'benefit-focused') {
        optimized = `Enhance your home with this practical ${productCategory} solution. ${optimized}`;
      } else if (rules.structure === 'performance-focused') {
        optimized = `Boost your performance with this professional ${productCategory} equipment. ${optimized}`;
      }

      if (keywordList.length > 0) {
        optimized += ` Key features include: ${keywordList.slice(0, 3).join(', ')}.`;
      }
      optimized += ' Order now and experience the difference!';
      const benefits = [
        'Premium quality construction',
        'Easy to use and maintain',
        'Backed by customer satisfaction guarantee',
        'Fast and reliable shipping'
      ];
      optimized += '\n\n• ' + benefits.join('\n• ');

      setOptimizedDescription(optimized);

      // Analyze both descriptions
      const originalAnalysis = analyzeText(originalDescription);
      const optimizedAnalysis = analyzeText(optimized);

      setSeoScore(optimizedAnalysis.seo);
      setReadabilityScore(optimizedAnalysis.readability);
      setConversionScore(optimizedAnalysis.conversion);

      setAnalysisResults([
        {
          metric: 'SEO',
          original: originalAnalysis.seo,
          optimized: optimizedAnalysis.seo,
          improvement: optimizedAnalysis.seo - originalAnalysis.seo
        },
        {
          metric: 'Readability',
          original: originalAnalysis.readability,
          optimized: optimizedAnalysis.readability,
          improvement: optimizedAnalysis.readability - originalAnalysis.readability
        },
        {
          metric: 'Conversion',
          original: originalAnalysis.conversion,
          optimized: optimizedAnalysis.conversion,
          improvement: optimizedAnalysis.conversion - originalAnalysis.conversion
        }
      ]);
      setIsOptimizing(false);
    }, 1200);
  };

  // --- Clipboard/download ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  const downloadDescription = () => {
    const element = document.createElement('a');
    const file = new Blob([optimizedDescription], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'optimized-description.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- Chart data ---
  const analyticsChartData = analysisResults.map(r => ({
    metric: r.metric,
    Original: Number(r.original.toFixed(1)),
    Optimized: Number(r.optimized.toFixed(1)),
    Improvement: Number(r.improvement.toFixed(1))
  }));

  // --- Animated AI Insights Handler ---
	const runInsights = async () => {
	  setIsAnalyzing(true);
	  setSuggestedKeywords([]);
	  setSentiment(null);
	  setTone("");
	  setSummary("");
	  setUSPs([]);
	  setSEOTitle("");
	  try {
		// Keywords
		const keywordsRaw = await mistralKeywordSuggestion(originalDescription);
		setSuggestedKeywords(
		  keywordsRaw.split(',').map(k => k.trim()).filter(Boolean)
		);

		// Sentiment
		const sentimentRaw = await mistralSentiment(originalDescription);
		const match = sentimentRaw.match(/(Positive|Negative|Neutral)[^\d]*(\d+)?/i);
		setSentiment(match
		  ? { label: match[1], score: match[2] ? (Number(match[2]) / 100) : null }
		  : { label: sentimentRaw, score: null }
		);

		// Tone
		setTone(await mistralTone(originalDescription));

		// Summary
		setSummary(await mistralSummary(originalDescription));

		// USPs
		const uspsArr = await mistralUSPs(originalDescription);
		setUSPs(Array.isArray(uspsArr) ? uspsArr : []);

		// SEO Title
		const seoTitleRaw = await mistralSEOTitle(originalDescription);
		setSEOTitle(seoTitleRaw);

		// Show success modal/sparkle
		setShowSuccess(true);
		setTimeout(() => setShowSuccess(false), 1400);

	  } catch (e) {
		alert("AI Insights Error: " + e.message);
	  }
	  setIsAnalyzing(false);
	};


  return (
    <div>
      {/* Main Header and Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
        <h1>
          <span role="img" aria-label="sparkles">✨</span>
          &nbsp;Product Description Optimizer
        </h1>
        <div>
          <button
            className={activeTab === 'optimizer' ? 'active-tab-btn' : 'tab-btn'}
            onClick={() => setActiveTab('optimizer')}
          >
            Optimize
          </button>
          <button
            className={activeTab === 'analytics' ? 'active-tab-btn' : 'tab-btn'}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {activeTab === 'optimizer' && (
        <div className="card" style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: "1.18rem", marginBottom: 20, fontWeight: 600 }}>⚙️ Optimization Settings</h2>
          <div className="flex-row" style={{ gap: 20 }}>
            <div style={{ flex: 1 }}>
              <label>Product Category</label>
              <select
                value={productCategory}
                onChange={e => setProductCategory(e.target.value)}
              >
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports & Outdoors</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Target Audience</label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
              >
                <option value="general">General Public</option>
                <option value="professional">Professionals</option>
                <option value="enthusiast">Enthusiasts</option>
                <option value="budget">Budget Conscious</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Target Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>
      )}

      {/* Optimizer Input/Output */}
      {activeTab === 'optimizer' && (
        <div className="flex-row" style={{ gap: 20 }}>
          {/* Original Description */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ color: "#41416b" }}>Original Description</h3>
            <textarea
              value={originalDescription}
              onChange={e => setOriginalDescription(e.target.value)}
              placeholder="Paste your original product description here..."
              style={{ minHeight: 120, marginBottom: 14 }}
            />
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={generateOptimizedDescription}
                disabled={isOptimizing || !originalDescription.trim()}
              >
                {isOptimizing ? "Optimizing with AI..." : "Optimize Description"}
              </button>
            </div>
          </div>

          {/* Optimized Description */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ color: "#41416b" }}>Optimized Description</h3>
              {optimizedDescription && (
                <span>
                  <button title="Copy" style={{ padding: "3px 10px" }} onClick={() => copyToClipboard(optimizedDescription)}>📋</button>
                  <button title="Download" style={{ padding: "3px 10px" }} onClick={downloadDescription}>⬇️</button>
                </span>
              )}
            </div>
            <div style={{
              minHeight: 120,
              background: "#f4f7fb",
              borderRadius: 7,
              border: "1px solid #dbe1fa",
              padding: 12,
              color: "#343478",
              overflowY: "auto"
            }}>
              {optimizedDescription
                ? <span style={{ whiteSpace: "pre-line" }}>{optimizedDescription}</span>
                : <span style={{ color: "#999" }}>Optimized description will appear here...</span>
              }
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Panel (no API key field) */}
      {activeTab === 'optimizer' && (
        <div className="card" style={{ marginTop: 26 }}>
          <h3>✨ AI Insights</h3>
          <div style={{margin: "10px 0"}}>
            <button
              style={{marginLeft: 8}}
              disabled={isAnalyzing || !originalDescription}
              onClick={runInsights}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>
          <AnimatePresence>
            {(suggestedKeywords.length > 0 || sentiment || tone || summary) && (
              <motion.div
                className="insights-grid"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.09, delayChildren: 0.12 } }}
                exit={{ opacity: 0, y: 16 }}
              >
                {/* Sparkle animation */}
                {(!isAnalyzing && (suggestedKeywords.length > 0 || sentiment || tone || summary)) &&
                  <span className="sparkle" key="sparkle">✨</span>
                }

                {/* Sentiment */}
                {sentiment && (
                  <motion.div
                    className="insight-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    tabIndex={0}
                  >
                    <div className="info-tooltip">How positive/negative is the description? Confidence shown.</div>
                    <div className="insight-title">
                      <span role="img" aria-label="sentiment">💬</span>
                      Sentiment
                      <span className={
                        "sentiment-badge " +
                        (sentiment.label.toLowerCase().includes("pos") ? "sentiment-positive"
                          : sentiment.label.toLowerCase().includes("neg") ? "sentiment-negative"
                          : "sentiment-neutral")
                      }>
                        {sentiment.label}
                        {sentiment.score !== null ? ` ${(sentiment.score*100).toFixed(0)}%` : ""}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Tone */}
                {tone && (
                  <motion.div
                    className="insight-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    tabIndex={0}
                  >
                    <div className="info-tooltip">Is the language formal, informal or neutral?</div>
                    <div className="insight-title">
                      <span role="img" aria-label="tone">🎤</span>
                      Tone
                    </div>
                    <div style={{ fontWeight: 500, color: "#6366f1", fontSize: "1.1rem" }}>{tone}</div>
                  </motion.div>
                )}

                {/* Summary */}
                {summary && (
                  <motion.div
                    className="insight-card"
                    style={{ minWidth: 220 }}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    tabIndex={0}
                  >
                    <div className="info-tooltip">A quick summary of the description content.</div>
                    <div className="insight-title">
                      <span role="img" aria-label="summary">📝</span>
                      Summary
                    </div>
                    <div style={{ color: "#454579", fontSize: "1.03rem" }}>{summary}</div>
                  </motion.div>
                )}

                {/* Keywords */}
                {suggestedKeywords.length > 0 && (
                  <motion.div
                    className="insight-card"
                    style={{ minWidth: 220 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    tabIndex={0}
                  >
                    <div className="info-tooltip">Top SEO keywords the AI found in your description.</div>
                    <div className="insight-title">
                      <span role="img" aria-label="keywords">🔑</span>
                      Suggested Keywords
                    </div>
                    <div className="keywords-list">
                      {suggestedKeywords.map((kw, i) =>
                        <span className="keyword-pill" key={i}>{kw}</span>
                      )}
                    </div>
                  </motion.div>
                )}
				
				{/* SEO Title */}
				{seoTitle && (
				  <motion.div
					className="insight-card"
					style={{ minWidth: 210, background: "#ecfeff" }}
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 6 }}
					tabIndex={0}
				  >
					<div className="info-tooltip">AI-generated short SEO title for this product.</div>
					<div className="insight-title">
					  <span role="img" aria-label="title">🏷️</span>
					  SEO Title
					</div>
					<div style={{ fontWeight: 600, color: "#1e293b", fontSize: "1.08rem", marginTop: 7 }}>
					  {seoTitle}
					</div>
				  </motion.div>
				)}

				{/* USPs */}
				{usps.length > 0 && (
				  <motion.div
					className="insight-card"
					style={{ minWidth: 220, background: "#fef9c3" }}
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 6 }}
					tabIndex={0}
				  >
					<div className="info-tooltip">Top 2 unique selling points, AI-generated.</div>
					<div className="insight-title">
					  <span role="img" aria-label="usp">💡</span>
					  Unique Selling Points
					</div>
					<ul style={{ margin: "8px 0 0 8px", padding: 0 }}>
					  {usps.map((u, i) => <li key={i} style={{ fontSize: "1rem" }}>• {u}</li>)}
					</ul>
				  </motion.div>
				)}

				
				
              </motion.div>
            )}
          </AnimatePresence>
          {/* Success modal */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                style={{
                  position: "fixed", left: 0, right: 0, top: 0, bottom: 0,
                  background: "rgba(32,38,60,0.19)",
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  style={{
                    background: "#fff", borderRadius: 14, boxShadow: "0 4px 38px rgba(60,80,150,0.18)",
                    padding: "40px 38px", display: "flex", flexDirection: "column", alignItems: "center"
                  }}
                  initial={{ scale: 0.6, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <span style={{ fontSize: 36 }}>✨</span>
                  <div style={{ marginTop: 8, fontSize: "1.15rem", color: "#444", fontWeight: 600 }}>AI Insights Ready!</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Analytics Tab ONLY */}
      {activeTab === 'analytics' && (
        <div>
          <h2 style={{ textAlign: "center", marginBottom: 10, color: "#343478" }}>
            Performance Analysis
          </h2>
          {analysisResults.length > 0 ? (
            <>
              {/* Bar Chart */}
              <div style={{width: "100%", height: 320, background: "#f8fafc", borderRadius: 10, marginBottom: 28, boxShadow: "0 2px 8px rgba(80,100,160,0.06)"}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsChartData}
                    margin={{top: 22, right: 30, left: 0, bottom: 0}}
                  >
                    <XAxis dataKey="metric" fontSize={15}/>
                    <YAxis domain={[0, 100]} fontSize={13} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Original" fill="#60a5fa" />
                    <Bar dataKey="Optimized" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Analytics Cards */}
              <div className="analytics-grid">
                {analysisResults.map((result, idx) => (
                  <div className="analytics-card" key={idx}>
                    <div className="metric-title">
                      {result.metric === "SEO" && <span>🔍</span>}
                      {result.metric === "Readability" && <span>📖</span>}
                      {result.metric === "Conversion" && <span>💸</span>}
                      {result.metric}
                    </div>
                    <div className="score">{result.optimized.toFixed(2)}%</div>
                    <div className="analytics-bar-bg">
                      <div
                        className="analytics-bar"
                        style={{ width: `${result.optimized}%` }}
                      ></div>
                    </div>
                    <div style={{ fontSize: 14, color: "#6a6a9a", marginTop: 2 }}>
                      Original: <b>{result.original.toFixed(2)}%</b>
                    </div>
                    <div
                      className={
                        "analytics-improvement" +
                        (result.improvement < 0 ? " negative" : "")
                      }
                    >
                      {result.improvement > 0 && <span>▲</span>}
                      {result.improvement < 0 && <span>▼</span>}
                      {result.improvement === 0 && <span>■</span>}
                      &nbsp;{result.improvement >= 0 ? "+" : ""}
                      {result.improvement.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: 30, color: "#7d7dad", textAlign: "center" }}>
              <span style={{ fontSize: 36 }}>📊</span>
              <div>No analysis data available. Please optimize a description first.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ECommerceOptimizer;
