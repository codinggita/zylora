/**
 * Gemini API Utility for Business Analytics
 * Analyzes seller data and provides AI-powered recommendations
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_VERSIONS = ['v1beta'];
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];

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

const saveAnalysisToCache = (sellerId, analysis, frequencyType = 'weekly') => {
  try {
    const cache = getAnalysisCache();
    const now = new Date();
    const cacheKey = frequencyType === 'daily' 
      ? `${sellerId}_day_${now.getDate()}`
      : `${sellerId}_week_${Math.ceil(now.getDate() / 7)}`;
    
    cache[cacheKey] = {
      data: analysis,
      timestamp: now.getTime(),
      type: frequencyType
    };
    
    localStorage.setItem('seller_ai_analysis_cache', JSON.stringify(cache));
  } catch (err) {
    console.error('Error saving to cache:', err);
  }
};

const getCachedAnalysis = (sellerId, frequencyType = 'weekly') => {
  try {
    const cache = getAnalysisCache();
    const now = new Date();
    const cacheKey = frequencyType === 'daily'
      ? `${sellerId}_day_${now.getDate()}`
      : `${sellerId}_week_${Math.ceil(now.getDate() / 7)}`;
    
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
const buildAnalysisPrompt = (sellerData) => {
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

  return `
You are a business consultant for an e-commerce seller. Analyze the following seller performance data and provide actionable, specific business improvement recommendations.

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
 * Call Gemini API for business analysis with multiple fallbacks
 */
export const analyzeSellerData = async (sellerData, sellerId = 'default', frequencyType = 'weekly') => {
  try {
    // Check cache first
    const cachedAnalysis = getCachedAnalysis(sellerId, frequencyType);
    if (cachedAnalysis) {
      console.log('Using cached analysis');
      return {
        success: true,
        analysis: cachedAnalysis,
        fromCache: true
      };
    }

    const prompt = buildAnalysisPrompt(sellerData);
    let lastError = null;

    // Try different version and model combinations
    for (const version of API_VERSIONS) {
      for (const model of MODELS) {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        
        try {
          console.log(`Attempting Gemini analysis with ${model} (${version})...`);
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
              const analysis = data.candidates[0].content.parts[0].text;
              
              // Cache the analysis
              saveAnalysisToCache(sellerId, analysis, frequencyType);

              return {
                success: true,
                analysis: analysis,
                fromCache: false,
                timestamp: new Date().toISOString(),
                modelUsed: `${model} (${version})`
              };
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`Gemini ${model} (${version}) failed: ${response.status}`, errorData);
            lastError = `API error: ${response.status} ${response.statusText}`;
            
            // If we hit a rate limit, don't spam the other models/versions
            if (response.status === 429) {
              lastError = "Rate limit exceeded. Please wait a minute before trying again.";
              throw new Error(lastError);
            }
          }
        } catch (err) {
          console.error(`Fetch error for ${model} (${version}):`, err);
          lastError = err.message;
        }
      }
    }

    throw new Error(lastError || 'All Gemini API attempts failed');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
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

  for (const line of lines) {
    // Check for section headers
    if (line.includes('KEY INSIGHTS')) {
      currentSection = 'keyInsights';
      sections[currentSection] = [];
    } else if (line.includes('RECOMMENDATIONS')) {
      currentSection = 'recommendations';
      sections[currentSection] = [];
    } else if (line.includes('GROWTH OPPORTUNITIES')) {
      currentSection = 'growthOpportunities';
      sections[currentSection] = [];
    } else if (line.includes('PRICING STRATEGY')) {
      currentSection = 'pricingStrategy';
      sections[currentSection] = [];
    } else if (line.includes('INVENTORY TIPS')) {
      currentSection = 'inventoryTips';
      sections[currentSection] = [];
    } else if (line.includes('NEXT STEPS')) {
      currentSection = 'nextSteps';
      sections[currentSection] = [];
    } else if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./)) {
      // Collect bullet points
      if (currentSection && sections[currentSection]) {
        const cleanedLine = line.trim().replace(/^([-•*]|\d+\.)\s*/, '');
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
