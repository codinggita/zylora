import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, AlertCircle, RefreshCw, Calendar, 
  ChevronDown, ChevronUp, BarChart3, Lightbulb, Rocket, 
  Tag, Box, CheckSquare, Zap, Target, PieChart, Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { analyzeSellerData, parseRecommendations, getNextUpdateTime } from '../utils/geminiAnalytics.js';

const EarningsAnalytics = ({ 
  sellerOrders, 
  sellerProducts, 
  totalRevenue, 
  pendingOrders,
  negotiationCount 
}) => {
  const { t, i18n } = useTranslation();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [frequencyType, setFrequencyType] = useState('weekly');
  const [expandedSection, setExpandedSection] = useState('recommendations');
  const [fromCache, setFromCache] = useState(false);
  const [nextUpdate, setNextUpdate] = useState(null);

  // Calculate analytics data
  const calculateAnalyticsData = () => {
    const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthOrders = sellerOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => {
        return sum + (order.totalPrice || order.totalAmount || 0);
      }, 0);

      return {
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        total: monthRevenue,
        orderCount: monthOrders.length
      };
    });

    const topProducts = sellerProducts
      .map(product => {
        const productOrders = sellerOrders.filter(order =>
          order.orderItems?.some(item => item.product === product._id)
        );
        return {
          name: product.name,
          price: product.price,
          orderCount: productOrders.length,
          revenue: productOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    const conversionRate = sellerProducts.length > 0
      ? Math.round((sellerOrders.length / (sellerProducts.length * 100)) * 100)
      : 0;

    return {
      totalRevenue: totalRevenue || 0,
      orderCount: sellerOrders.length,
      revenueByMonth,
      topProducts,
      totalProducts: sellerProducts.length,
      conversionRate,
      pendingOrders,
      negotiationCount
    };
  };

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const analyticsData = calculateAnalyticsData();
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 'default';
      
      const result = await analyzeSellerData(analyticsData, userId, frequencyType, i18n.language);
      
      if (result.success) {
        setAnalysis(result.analysis);
        setFromCache(result.fromCache || false);
        setNextUpdate(getNextUpdateTime(frequencyType));
      } else {
        setError(result.error || 'Failed to analyze data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [frequencyType, sellerOrders.length, i18n.language]);

  const parsedSections = analysis ? parseRecommendations(analysis) : {};

  const sectionConfig = [
    {
      id: 'keyInsights',
      title: t('key_insights'),
      icon: BarChart3,
      color: 'blue',
      description: t('key_insights_desc')
    },
    {
      id: 'recommendations',
      title: t('recommendations'),
      icon: Lightbulb,
      color: 'amber',
      description: t('recommendations_desc')
    },
    {
      id: 'growthOpportunities',
      title: t('growth_opportunities'),
      icon: Rocket,
      color: 'green',
      description: t('growth_opportunities_desc')
    },
    {
      id: 'pricingStrategy',
      title: t('pricing_strategy'),
      icon: Tag,
      color: 'purple',
      description: t('pricing_strategy_desc')
    },
    {
      id: 'inventoryTips',
      title: t('inventory_tips'),
      icon: Box,
      color: 'orange',
      description: t('inventory_tips_desc')
    },
    {
      id: 'nextSteps',
      title: t('priority_actions'),
      icon: CheckSquare,
      color: 'indigo',
      description: t('priority_actions_desc')
    }
  ];

  const renderFormattedText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderSection = (section) => {
    const items = parsedSections[section.id] || [];
    if (items.length === 0) return null;

    const isExpanded = expandedSection === section.id;

    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    };

    return (
      <div key={section.id} className="mb-4 border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white group">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : section.id)}
          className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors ${isExpanded ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[section.color]}`}>
              <section.icon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900">{section.title}</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${colorClasses[section.color]}`}>
                  {items.length} {t('points')}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium mt-1 line-clamp-1">{section.description}</p>
            </div>
          </div>
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>

        {isExpanded && (
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <ul className="space-y-3 mt-2">
              {items.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                  <span className="text-amber-500 font-bold flex-shrink-0 text-base leading-none mt-0.5">•</span>
                  <div>{renderFormattedText(item)}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('ai_business_advisor')}</h2>
            <p className="text-sm text-gray-500">{t('powered_by_gemini')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Frequency Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['daily', 'weekly'].map(type => (
              <button
                key={type}
                onClick={() => setFrequencyType(type)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  frequencyType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t(type)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh analysis"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <div className="animate-spin">
            <Sparkles size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-900">{t('analyzing_business')}</p>
            <p className="text-sm text-blue-700">{t('please_wait')}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">{t('analysis_error')}</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {fromCache && !loading && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          📌 {t('cached_analysis')} - {t('next_update')}: {nextUpdate?.toLocaleDateString()}
        </div>
      )}

      {/* Analysis Content */}
      {analysis && !loading && (
        <div>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">&#8377;{(totalRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">{t('total_revenue')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{sellerOrders.length}</p>
              <p className="text-xs text-gray-600 mt-1">{t('total_orders')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{sellerProducts.length}</p>
              <p className="text-xs text-gray-600 mt-1">{t('active_products')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              <p className="text-xs text-gray-600 mt-1">{t('pending_orders')}</p>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-2">
            {sectionConfig.map(section => renderSection(section))}
          </div>

          {/* Last Updated */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
            <p>{t('last_updated')}: {new Date().toLocaleString()}</p>
            {nextUpdate && (
              <p className="mt-1">
                <Calendar size={12} className="inline mr-1" />
                {t('next_analysis')}: {nextUpdate.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Get AI-powered business insights</p>
          <button
            onClick={fetchAnalysis}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Generate Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default EarningsAnalytics;
