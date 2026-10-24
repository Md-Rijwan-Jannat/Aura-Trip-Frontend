"use client";

import React from "react";
import { motion } from "framer-motion";
import { MdArrowBack } from "react-icons/md";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import Connections from "../../../../_component/module/publicProfile/connections";

interface ConnectionsPageProps {
  params: {
    userId: string;
  };
}

export default function ConnectionsPage({ params }: ConnectionsPageProps) {
  const router = useRouter();
  const { userId } = params;

  return (
    <motion.div
      className='w-full min-h-screen bg-appBackground'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Bar */}
      <div className='sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-borderSubtle shadow-sm'>
        <div className='max-w-5xl mx-auto px-4 py-3 flex items-center justify-between'>
          <button
            onClick={() => router.back()}
            className='flex items-center gap-2 px-3 py-2 hover:bg-sage-50 dark:hover:bg-default-100 rounded-lg transition-colors'
          >
            <MdArrowBack size={20} className='text-textMain' />
            <span className='text-sm font-medium text-textMain'>Back to Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-5xl mx-auto px-4 py-6'>
        <motion.div
          className='bg-surface rounded-xl shadow-lg border border-borderSubtle overflow-hidden'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className='px-6 sm:px-8 py-6'>
            <h1 className='text-2xl font-bold text-textMain mb-6'>Connections</h1>
            <Connections userId={userId} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
