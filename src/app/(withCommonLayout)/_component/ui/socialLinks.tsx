import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function SocialLinks() {
  return (
    <div className="flex gap-6 mt-6 z-10">
      <FaFacebook
        className="text-blue-600 hover:scale-110 transition-transform"
        size={28}
      />
      <FaInstagram
        className="text-sage-600 dark:text-sage-400 hover:scale-110 transition-transform"
        size={28}
      />
      <FaTwitter
        className="text-blue-400 hover:scale-110 transition-transform"
        size={28}
      />
    </div>
  );
}
