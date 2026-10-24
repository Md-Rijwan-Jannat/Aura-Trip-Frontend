"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaStar, FaPlaneDeparture, FaGlobeAmericas } from "react-icons/fa";
import Image from "next/image";
import { useGetAllUsersQuery } from "@/src/redux/features/user/userApi";

const WhyWeAre: React.FC = () => {
  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  };

  const { data } = useGetAllUsersQuery({ sort: "-createdAt" });

  return (
    <div className='py-10 px-6 grid md:grid-cols-2 gap-12'>
      {/* Right Block */}
      <motion.div className='relative' initial='hidden' animate='visible' transition={{ duration: 1 }} variants={fadeInRight}>
        <Image
          src='https://res.cloudinary.com/dihqveqyc/image/upload/v1734208153/tg8vcxgj5gklk05ht5xp.png'
          alt='Travel Inspiration'
          width={600}
          height={400}
          className='rounded-lg shadow'
        />
        <div className='absolute top-0 left-0 bg-darkPink text-default-50 p-4 rounded-full shadow-md transform -translate-x-6 -translate-y-6'>
          <FaPlaneDeparture className='text-2xl' />
        </div>
        <div className='absolute bottom-0 right-0 bg-primaryPink text-default-800 p-4 rounded-full shadow-md transform translate-x-6 translate-y-6'>
          <FaGlobeAmericas className='text-2xl' />
        </div>
      </motion.div>

      {/* Stats Block */}
      <motion.div
        className='grid grid:col-span-1 gap-6'
        initial='hidden'
        animate='visible'
        transition={{ duration: 1, staggerChildren: 0.2 }}
      >
        {/* Stat 1 */}
        <motion.div className='bg-default-50/20 rounded-lg shadow p-6 flex items-center' variants={fadeInLeft}>
          <FaUsers className='text-darkPink text-3xl mr-4' />
          <div>
            <h4 className='text-3xl font-bold'>{data?.data?.length || "25K"}+</h4>
            <p className='text-default-600'>Active Travelers</p>
          </div>
        </motion.div>

        {/* Stat 2 */}
        <motion.div className='bg-default-50/20 rounded-lg shadow p-6 flex items-center' variants={fadeInLeft}>
          <FaStar className='text-darkPink text-3xl mr-4' />
          <div>
            <h4 className='text-3xl font-bold'>4.9/5</h4>
            <p className='text-default-600'>Average Rating</p>
          </div>
        </motion.div>

        {/* Stat 3 */}
        <motion.div className='bg-default-50/20 rounded-lg shadow p-6 flex items-center' variants={fadeInLeft}>
          <FaGlobeAmericas className='text-darkPink text-3xl mr-4' />
          <div>
            <h4 className='text-3xl font-bold'>100+</h4>
            <p className='text-default-600'>Countries Covered</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WhyWeAre;
