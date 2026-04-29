import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';

const StaticPage = () => {
  const { pageId } = useParams();
  
  const content = {
    'about-zylora': {
      title: 'About ZyLora',
      subtitle: 'The future of agricultural and professional commerce.',
      text: 'ZyLora is a premium marketplace designed to bridge the gap between traditional agricultural exchanges and modern retail expectations. We provide a platform for bulk procurement, direct farmer-to-business auctions, and curated professional tools.'
    },
    'sustainability': {
      title: 'Sustainability at ZyLora',
      subtitle: 'Nurturing the earth while growing your business.',
      text: 'Our commitment to sustainability is at the core of everything we do. From supporting organic farming practices to optimizing supply chains for reduced carbon footprints, ZyLora is dedicated to a greener future.'
    },
    'shipping-policy': {
      title: 'Shipping Policy',
      subtitle: 'Reliable logistics for professional procurement.',
      text: 'We partner with India\'s leading logistics providers to ensure your bulk orders and auction wins arrive safely and on time. Most orders are dispatched within 24-48 hours and delivered within 3-7 business days.'
    },
    'bulk-discounts': {
      title: 'Bulk Discounts',
      subtitle: 'Scale your business with volume-based pricing.',
      text: 'ZyLora offers aggressive bulk discounting for corporate and wholesale buyers. The more you procure, the more you save. Check individual product pages for tiered pricing or contact our sales team for custom quotes.'
    },
    'returns-refunds': {
      title: 'Returns & Refunds',
      subtitle: 'Hassle-free resolutions for our professional partners.',
      text: 'We understand that sometimes things don\'t go as planned. Our simplified return policy covers damaged goods, incorrect items, and quality mismatches. Refunds are processed within 5-7 business days after approval.'
    },
    'faqs': {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about the ZyLora platform.',
      text: 'How do auctions work? What is a Verified Seller? How do I track my bulk order? Find answers to all your common questions in our comprehensive knowledge base.'
    },
    'privacy-policy': {
      title: 'Privacy Policy',
      subtitle: 'Your data security is our top priority.',
      text: 'We take your privacy seriously. This policy outlines how we collect, use, and protect your personal and business information. We never sell your data to third parties.'
    },
    'terms-of-service': {
      title: 'Terms of Service',
      subtitle: 'The rules of the ZyLora professional marketplace.',
      text: 'By using ZyLora, you agree to our terms of conduct, payment procedures, and auction rules. These terms ensure a fair and transparent environment for all participants.'
    },
    'cookie-settings': {
      title: 'Cookie Settings',
      subtitle: 'Manage your browsing experience.',
      text: 'We use cookies to personalize content, analyze traffic, and provide a better shopping experience. You can manage your preferences here.'
    }
  };

  const page = content[pageId] || {
    title: 'Information Page',
    subtitle: 'ZyLora Professional Marketplace',
    text: 'We are currently updating our documentation. Please check back soon for detailed information about this section.'
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Information / {page.title}</span>
            <h1 className="text-5xl font-black tracking-tight text-[#0A1628] leading-tight">{page.title}</h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">{page.subtitle}</p>
          </div>
          
          <div className="h-px bg-gray-100 w-full" />
          
          <div className="prose prose-lg prose-amber max-w-none">
            <p className="text-gray-600 leading-relaxed text-lg">
              {page.text}
            </p>
            <p className="text-gray-600 leading-relaxed text-lg mt-6">
              At ZyLora, we believe in transparency and professional excellence. Whether you are a farmer looking to auction your harvest or a business seeking high-quality equipment, our platform is built to support your growth with reliable data, secure payments, and world-class logistics.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg mt-4">
              Our team works tirelessly to vet every seller and verify every product listed on the platform. We are committed to fostering a marketplace where quality and trust are the standard, not the exception.
            </p>
            <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">Need more help?</h3>
              <p className="text-sm text-gray-500">Contact our 24/7 professional support team at <span className="text-amber-600 font-bold">support@zylora.com</span></p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default StaticPage;
