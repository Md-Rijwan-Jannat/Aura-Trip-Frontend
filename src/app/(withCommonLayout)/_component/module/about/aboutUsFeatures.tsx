import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const TravelFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tips');

  // Intersection observer hooks to detect if the sections are in view
  const { ref: leftRef, inView: leftInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: rightRef, inView: rightInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const tabs = [
    { id: 'tips', label: 'Travel Tips' },
    { id: 'destinations', label: 'Top Destinations' },
    { id: 'guides', label: 'Travel Guides' },
  ];

  const tabContent = {
    tips: 'Get the best travel tips from seasoned travelers to make your journey smoother and more enjoyable.',
    destinations:
      'Discover the most popular travel destinations, from breathtaking beaches to vibrant cities around the world.',
    guides:
      'Explore comprehensive travel guides to help you navigate new places with ease.',
  };

  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 px-2">
      {/* Left Side: Text Content */}
      <motion.div
        ref={leftRef}
        initial={{ opacity: 0, x: -50 }}
        animate={leftInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="lg:w-1/2 space-y-6"
      >
        <h2 className="text-sage-700 dark:text-sage-300 tracking-wider text-sm">
          Travel Platform
        </h2>
        <h1 className="text-xl md:text-2xl font-bold">
          Explore the{' '}
          <span className="text-sage-600 dark:text-sage-400 bg-sage-100 px-2 rounded">world</span>{' '}
          with the best travel insights
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 items-center justify-center mt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-2 px-3 rounded-full text-xs md:text-sm ${
                activeTab === tab.id
                  ? 'bg-sage-100 text-sage-700 dark:text-sage-300'
                  : 'bg-default-100 text-default-500'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <h3 className="font-semibold text-lg mt-6">
          {tabs.find((t) => t.id === activeTab)?.label}
        </h3>
        <p className="text-default-600 text-xs">
          {tabContent[activeTab as keyof typeof tabContent]}
        </p>

        {/* Feature Highlights */}
        <div className="flex space-x-4 mt-6">
          <motion.div
            className="px-3 py-2 text-xs md:text-sm rounded-lg bg-default-50 text-sage-700 dark:text-sage-300 border border-default-100"
            whileHover={{ scale: 1.05 }}
          >
            Sustainable Travel Tips
          </motion.div>
          <motion.div
            className="px-3 py-2 text-xs md:text-sm rounded-lg bg-default-50 text-sage-700 dark:text-sage-300 border border-default-100"
            whileHover={{ scale: 1.05 }}
          >
            Community Recommendations
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side: Image with Stats */}
      <motion.div
        ref={rightRef}
        initial={{ opacity: 0, x: 50 }}
        animate={rightInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="lg:w-1/2 relative bg-default-50 rounded-lg"
      >
        <div className="relative overflow-hidden rounded-lg">
          <Image
            width={500}
            height={500}
            src="https://media.istockphoto.com/id/1526986072/photo/airplane-flying-over-tropical-sea-at-sunset.jpg?s=612x612&w=0&k=20&c=Ccvg3BqlqsWTT0Mt0CvHlbwCuRjPAIWaCLMKSl3PCks="
            alt="Explore Destinations"
            className="object-cover w-full"
          />
          {/* Stat 1 */}
          <motion.div
            className="absolute top-4 left-4 bg-default-50 p-3 rounded-lg border border-default-100 text-center text-default-80"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ scale: 1.1 }}
          >
            <p className="text-2xl font-bold">75+</p>
            <p className="text-default-500 text-sm">Countries Covered</p>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            className="absolute bottom-4 right-4 bg-default-50 p-3 rounded-lg border border-default-100 text-center text-default-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ scale: 1.1 }}
          >
            <p className="text-2xl font-bold">1M+</p>
            <p className="text-default-500 text-sm">Happy Travelers</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default TravelFeatures;
