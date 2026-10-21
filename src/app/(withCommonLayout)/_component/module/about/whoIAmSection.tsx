import React from 'react';
import { motion } from 'framer-motion';
import { FaFire } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';

const WhoIAmSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
        ease: 'easeInOut',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.section
      className="relative py-20 md:py-28 bg-fixed bg-cover bg-center mt-16"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/2163520306/photo/small-group-of-people-working-at-the-office.jpg?s=612x612&w=0&k=20&c=JBCK0X7GALjpY8sQy7iU1iI9Q5n4mIhidiLwgcB2G7M=')",
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center gap-6 bg-default-50 bg-opacity-80 p-6 rounded-lg shadow-lg"
          variants={containerVariants}
        >
          {/* Text Section: Left */}
          <motion.div
            className="lg:w-1/2 w-full flex flex-col items-start xl:max-w-[90%]"
            variants={itemVariants}
          >
            <h2 className="text-sage-700 dark:text-sage-300 tracking-wider text-sm">
              Travel Community
            </h2>
            <h1 className="text-2xl md:text-3xl font-bold">Who Are We?</h1>
            <p className="text-lg text-default-700 mb-3">
              We’re a community-driven platform dedicated to helping people
              discover, explore, and share unforgettable travel experiences.
            </p>
            <p className="text-default-600 mb-6 text-sm md:text-base">
              Our mission is to connect passionate travelers, offering tips,
              guides, and advice to inspire new journeys and adventures. From
              insider travel tips to personal stories and recommendations, we’re
              here to make each journey more rewarding and authentic.
            </p>
          </motion.div>

          {/* Icon Section: Right */}
          <motion.div
            className="lg:w-1/2 w-full grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {/* Community-Driven Insights */}
            <motion.div className="flex items-start" variants={itemVariants}>
              <div className="text-sage-600 dark:text-sage-400 mr-4">
                <MdSettings size={34} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Community-Driven Insights
                </h3>
                <p className="text-default-600">
                  Our guides and tips come from travelers like you, sharing real
                  experiences and insights to help others make the most of their
                  trips.
                </p>
              </div>
            </motion.div>

            {/* Passion for Exploration */}
            <motion.div className="flex items-start" variants={itemVariants}>
              <div className="text-sage-600 dark:text-sage-400 mr-4">
                <FaFire size={30} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Passion for Exploration
                </h3>
                <p className="text-default-600">
                  We believe that travel brings the world closer, sparking
                  curiosity and bringing people together across cultures.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default WhoIAmSection;
