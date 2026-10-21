'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CButton from './CButton/CButton';
import { primaryColor, secondaryColor } from '@/src/styles/button';
import { Button } from '@nextui-org/button';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the previous page when the user clicks the back button
    const handleGoBack = () => {
      window.history.back();
    };

    document
      .getElementById('backButton')
      ?.addEventListener('click', handleGoBack);

    return () => {
      document
        .getElementById('backButton')
        ?.removeEventListener('click', handleGoBack);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-default-600">
      {/* Blurred Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-[200px] md:w-[300px] h-[300px] bg-sage-500 opacity-70 blur-[100px] absolute top-10 left-20" />
        <div className="w-[200px] md:w-[300px] h-[300px] bg-blue-400 opacity-70 blur-[100px] absolute bottom-10 right-20 " />
      </div>

      <motion.h1
        className="text-2xl md:text-5xl text-sage-600 dark:text-sage-400 mb-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Page Not Found
      </motion.h1>
      <motion.p
        className="text-lg mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Oops! The page you are looking for does nt exist.
      </motion.p>
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {' '}
        <Button
          onClick={() => router.back()}
          className="primary-button"
          type="submit"
        >
          Go Back
        </Button>
        <Button as={Link} href="/" className="primary-button" type="submit">
          Home
        </Button>
      </motion.div>
    </div>
  );
}
