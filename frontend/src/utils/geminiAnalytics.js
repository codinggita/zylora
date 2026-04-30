/**
 * Gemini API Utility for Business Analytics
 * Analyzes seller data and provides AI-powered recommendations
 */

const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;
const MODELS = ['meta/llama-3.1-70b-instruct', 'meta/llama3-70b-instruct', 'mistralai/mixtral-8x7b-instruct-v0.1'];

/**
 * Cache key format: seller_id_week_number or seller_id_day_number
 * Stores AI recommendations with timestamp
 */
const getAnalysisCache = () => {
  try {
    const cache = localStorage.getItem('seller_ai_analysis_cache');
    return cache ? JSON.parse(cache) : {};
  } catch (err) {
    console.error('Error reading cache:', err);
    return {};
  }
};

const saveAnalysisToCache = (sellerId, analysis, frequencyType = 'weekly', lang = 'en') => {
  try {
    const cache = getAnalysisCache();
    const now = new Date();
    const cacheKey = frequencyType === 'daily' 
      ? `${sellerId}_day_${now.getDate()}_${lang}`
      : `${sellerId}_week_${Math.ceil(now.getDate() / 7)}_${lang}`;
    
    cache[cacheKey] = {
      data: analysis,
      timestamp: now.getTime(),
      type: frequencyType,
      lang: lang
    };
    
    localStorage.setItem('seller_ai_analysis_cache', JSON.stringify(cache));
  } catch (err) {
    console.error('Error saving to cache:', err);
  }
};

const getCachedAnalysis = (sellerId, frequencyType = 'weekly', lang = 'en') => {
  try {
    const cache = getAnalysisCache();
    const now = new Date();
    const cacheKey = frequencyType === 'daily'
      ? `${sellerId}_day_${now.getDate()}_${lang}`
      : `${sellerId}_week_${Math.ceil(now.getDate() / 7)}_${lang}`;
    
    const cached = cache[cacheKey];
    if (cached) {
      // Check if cache is still valid (less than frequency period)
      const timeDiff = now.getTime() - cached.timestamp;
      const isValid = frequencyType === 'daily' 
        ? timeDiff < 24 * 60 * 60 * 1000  // 24 hours
        : timeDiff < 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (isValid) {
        return cached.data;
      }
    }
    return null;
  } catch (err) {
    console.error('Error getting cached analysis:', err);
    return null;
  }
};

/**
 * Prepare analysis prompt with seller data
 */
const buildAnalysisPrompt = (sellerData, lang = 'en') => {
  const {
    totalRevenue,
    orderCount,
    revenueByMonth,
    topProducts,
    totalProducts,
    conversionRate,
    pendingOrders,
    negotiationCount
  } = sellerData;

  const monthlyTrend = revenueByMonth?.slice(-3).map(m => m.total).join(', ') || '0';
  const monthlyLabels = revenueByMonth?.slice(-3).map(m => m.label).join(', ') || 'Recent months';

  const languageInstruction = lang === 'hi' 
    ? "IMPORTANT: Please provide your entire response in HINDI language using Devanagari script. Ensure the tone is professional and business-oriented."
    : "Respond in English. Ensure the tone is professional and business-oriented.";

  return `
You are a business consultant for an e-commerce seller. Analyze the following seller performance data and provide actionable, specific business improvement recommendations.

${languageInstruction}

SELLER PERFORMANCE DATA (Last 6 months):
- Total Revenue: ₹${totalRevenue?.toLocaleString() || 0}
- Total Orders: ${orderCount || 0}
- Active Product Listings: ${totalProducts || 0}
- Pending Orders: ${pendingOrders || 0}
- Open Negotiations: ${negotiationCount || 0}
- Average Conversion Rate: ${conversionRate || 0}%

MONTHLY REVENUE TREND (${monthlyLabels}):
₹${monthlyTrend}

TOP PERFORMING PRODUCTS:
${topProducts?.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} - ₹${p.price?.toLocaleString() || 0} (Orders: ${p.orderCount || 0})`).join('\n') || 'No data available'}

Please provide:
1. KEY INSIGHTS: 2-3 key observations about business performance
2. RECOMMENDATIONS: 3-4 specific, actionable recommendations to increase revenue
3. GROWTH OPPORTUNITIES: Areas with highest potential for growth
4. PRICING STRATEGY: Recommendations on current pricing strategy
5. INVENTORY TIPS: Suggestions for inventory management
6. NEXT STEPS: Top 3 priority actions for this week/month

Format your response as clear sections with bullet points. Be specific and data-driven.`;
};

/**
 * Call NVIDIA API for business analysis with multiple fallbacks
 */
export const analyzeSellerData = async (sellerData, sellerId = 'default', frequencyType = 'weekly', lang = 'en') => {
  try {
    // Check cache first
    const cachedAnalysis = getCachedAnalysis(sellerId, frequencyType, lang);
    if (cachedAnalysis) {
      console.log(`Using cached analysis for language: ${lang}`);
      return {
        success: true,
        analysis: cachedAnalysis,
        fromCache: true
      };
    }

    const prompt = buildAnalysisPrompt(sellerData, lang);
    let lastError = null;

    // Try different models
    for (const model of MODELS) {
      const url = `https://integrate.api.nvidia.com/v1/chat/completions`;
      
      try {
        console.log(`Attempting NVIDIA analysis with ${model}...`);
        
        const BACKEND_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:5001' 
          : 'https://zylora-e-commerce.onrender.com';

        const response = await fetch(`${BACKEND_URL}/api/ai-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NVIDIA_API_KEY}`
          },
          body: JSON.stringify({
            url: url,
            body: {
              model: model,
              messages: [{
                role: 'user',
                content: prompt
              }],
              max_tokens: 1024,
              temperature: 0.7,
              top_p: 0.9,
              stream: false
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.choices && data.choices[0]?.message?.content) {
            const analysis = data.choices[0].message.content;
            
            // Cache the analysis
            saveAnalysisToCache(sellerId, analysis, frequencyType, lang);

            return {
              success: true,
              analysis: analysis,
              fromCache: false,
              timestamp: new Date().toISOString(),
              modelUsed: model
            };
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn(`NVIDIA ${model} failed: ${response.status}`, errorData);
          lastError = errorData?.error?.message || `API error: ${response.status} ${response.statusText}`;
          
          // Stop trying other models if it's an auth or quota error
          if (response.status === 401 || response.status === 429) {
            throw new Error(lastError);
          }
        }
      } catch (err) {
        console.error(`Fetch error for ${model}:`, err);
        lastError = err.message;
      }
    }

    throw new Error(lastError || 'All NVIDIA API attempts failed');
  } catch (error) {
    console.error('Error calling NVIDIA API:', error);
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
};

/**
 * Parse structured recommendations from analysis text
 */
export const parseRecommendations = (analysisText) => {
  const sections = {};
  const lines = analysisText.split('\n');
  let currentSection = '';

  const headerMap = {
    keyInsights: ['KEY INSIGHTS', 'महत्वपूर्ण अंतर्दृष्टि', 'अंतर्दृष्टि', 'INSIGHTS'],
    recommendations: ['RECOMMENDATIONS', 'सिफारिशें', 'सुझाव'],
    growthOpportunities: ['GROWTH OPPORTUNITIES', 'विकास के अवसर', 'अवसर', 'OPPORTUNITIES'],
    pricingStrategy: ['PRICING STRATEGY', 'मूल्य निर्धारण रणनीति', 'मूल्य निर्धारण', 'PRICING'],
    inventoryTips: ['INVENTORY TIPS', 'इन्वेंटरी टिप्स', 'इन्वेंटरी', 'INVENTORY'],
    nextSteps: ['NEXT STEPS', 'प्राथमिकता कार्रवाई', 'अगले कदम', 'STEPS']
  };

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    
    // Check for section headers using the map
    let foundHeader = false;
    for (const [sectionId, keywords] of Object.entries(headerMap)) {
      if (keywords.some(keyword => upperLine.includes(keyword.toUpperCase()))) {
        currentSection = sectionId;
        sections[currentSection] = [];
        foundHeader = true;
        break;
      }
    }

    if (foundHeader) continue;

    // Collect bullet points
    if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^(\d+|[•\u2022\u25CF])[\.\s]/)) {
      if (currentSection && sections[currentSection]) {
        const cleanedLine = line.trim().replace(/^([-•\u2022\u25CF*]|\d+[\.\s])\s*/, '');
        if (cleanedLine) {
          sections[currentSection].push(cleanedLine);
        }
      }
    }
  }

  return sections;
};

/**
 * Clear old cache entries (optional cleanup)
 */
export const clearAnalysisCache = () => {
  try {
    localStorage.removeItem('seller_ai_analysis_cache');
    return true;
  } catch (err) {
    console.error('Error clearing cache:', err);
    return false;
  }
};

/**
 * Get next analysis update time
 */
export const getNextUpdateTime = (frequencyType = 'weekly') => {
  const now = new Date();
  const nextUpdate = new Date(now);
  
  if (frequencyType === 'daily') {
    nextUpdate.setDate(now.getDate() + 1);
    nextUpdate.setHours(0, 0, 0, 0);
  } else {
    // Weekly: update on Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    nextUpdate.setDate(now.getDate() + daysUntilSunday);
    nextUpdate.setHours(0, 0, 0, 0);
  }
  
  return nextUpdate;
};
