import React, { useState, useEffect } from 'react';
import { Sparkles, Target, Eye, TrendingUp, CheckCircle, AlertCircle, Zap, RefreshCw, Copy, Download } from 'lucide-react';

const ECommerceOptimizer = () => {
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

  const optimizationRules = {
    electronics: {
      keywords: ['premium', 'advanced', 'innovative', 'high-performance', 'cutting-edge'],
      structure: 'specifications-first',
      tone: 'professional'
    },
    fashion: {
      keywords: ['trendy', 'stylish', 'comfortable', 'versatile', 'premium'],
      structure: 'lifestyle-focused',
      tone: 'aspirational'
    },
    home: {
      keywords: ['durable', 'practical', 'elegant', 'space-saving', 'quality'],
      structure: 'benefit-focused',
      tone: 'warm'
    },
    sports: {
      keywords: ['performance', 'durable', 'professional', 'comfortable', 'reliable'],
      structure: 'performance-focused',
      tone: 'energetic'
    }
  };

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
    const avgWordsPerSentence = words.length / sentences.length;
    const readabilityFactors = {
      sentenceLength: avgWordsPerSentence < 20 ? 30 : 10,
      wordComplexity: words.filter(w => w.length < 7).length / words.length * 30,
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

  const generateOptimizedDescription = () => {
    if (!originalDescription.trim()) return;
    
    setIsOptimizing(true);
    
    // Simulate AI optimization process
    setTimeout(() => {
      const rules = optimizationRules[productCategory];
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      
      let optimized = originalDescription;
      
      // Apply optimization rules
      if (rules.structure === 'specifications-first') {
        optimized = `Experience premium quality with this ${productCategory} product. ${optimized}`;
      } else if (rules.structure === 'lifestyle-focused') {
        optimized = `Transform your style with this ${productCategory} essential. ${optimized}`;
      } else if (rules.structure === 'benefit-focused') {
        optimized = `Enhance your home with this practical ${productCategory} solution. ${optimized}`;
      } else if (rules.structure === 'performance-focused') {
        optimized = `Boost your performance with this professional ${productCategory} equipment. ${optimized}`;
      }
      
      // Add keywords naturally
      if (keywordList.length > 0) {
        optimized += ` Key features include: ${keywordList.slice(0, 3).join(', ')}.`;
      }
      
      // Add call-to-action
      optimized += ' Order now and experience the difference!';
      
      // Add bullet points for better readability
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
          metric: 'SEO Score',
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
          metric: 'Conversion Potential',
          original: originalAnalysis.conversion,
          optimized: optimizedAnalysis.conversion,
          improvement: optimizedAnalysis.conversion - originalAnalysis.conversion
        }
      ]);
      
      setIsOptimizing(false);
    }, 2000);
  };

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

  const ScoreCard = ({ title, score, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`w-6 h-6 ${color}`} />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <span className={`text-2xl font-bold ${color}`}>{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Product Description Optimizer</h1>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('optimizer')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'optimizer'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Optimizer
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'optimizer' ? (
          <div className="space-y-8">
            {/* Configuration Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Optimization Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Category
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports & Outdoors</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="general">General Public</option>
                    <option value="professional">Professionals</option>
                    <option value="enthusiast">Enthusiasts</option>
                    <option value="budget">Budget Conscious</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Keywords
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Input/Output Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Original Description</h3>
                <textarea
                  value={originalDescription}
                  onChange={(e) => setOriginalDescription(e.target.value)}
                  placeholder="Paste your original product description here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={generateOptimizedDescription}
                    disabled={isOptimizing || !originalDescription.trim()}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isOptimizing ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Optimize Description
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Optimized Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Optimized Description</h3>
                  {optimizedDescription && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(optimizedDescription)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={downloadDescription}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Download as text file"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="h-64 p-4 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto">
                  {optimizedDescription ? (
                    <div className="whitespace-pre-wrap text-gray-800">{optimizedDescription}</div>
                  ) : (
                    <div className="text-gray-500 italic">Optimized description will appear here...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {optimizedDescription && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreCard
                  title="SEO Score"
                  score={seoScore}
                  icon={Target}
                  color="text-blue-600"
                />
                <ScoreCard
                  title="Readability"
                  score={readabilityScore}
                  icon={Eye}
                  color="text-green-600"
                />
                <ScoreCard
                  title="Conversion Potential"
                  score={conversionScore}
                  icon={TrendingUp}
                  color="text-purple-600"
                />
              </div>
            )}
          </div>
        ) : (
          /* Analytics Tab */
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                Performance Analysis
              </h2>
              
              {analysisResults.length > 0 ? (
                <div className="space-y-4">
                  {analysisResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-medium text-gray-800">{result.metric}</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Original: {result.original}%</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-indigo-600 font-semibold">Optimized: {result.optimized}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.improvement > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className={`font-semibold ${
                          result.improvement > 0 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {result.improvement > 0 ? '+' : ''}{result.improvement}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No analysis data available. Please optimize a description first.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ECommerceOptimizer;