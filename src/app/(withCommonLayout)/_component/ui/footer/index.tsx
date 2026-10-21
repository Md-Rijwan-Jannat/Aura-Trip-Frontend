"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import CountUp from "react-countup";
import Link from "next/link";
import BrandLogo from "@/src/components/shared/logo";
import SocialLinks from "../socialLinks";
import Container from "@/src/components/shared/container";

const Footer = () => {
  const date = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-default-50/80 to-default-100/20 py-12 text-default-800 md:mx-2 mt-5 border-t border-default-100">
      <Container>
        {/* Top Section */}
        <div className="flex flex-wrap justify-between items-start mb-8 space-y-8 md:space-y-0">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-1/3 flex flex-col items-start"
          >
            <Link className="flex items-center gap-2" href="/">
              <BrandLogo />
            </Link>
            <p className="mt-4 text-sm">
              Exploring the World, one adventure at a time. Connecting travelers
              everywhere and your journey starts here.
            </p>
            {/* Satisfied Travelers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full md:w-1/3 flex flex-col items-start text-start"
            >
              <h3 className="text-sm font-semibold text-default-900 mb-2 mt-5 whitespace-nowrap">
                Satisfied Travelers
              </h3>
              <div className="text-4xl font-bold text-sage-600 dark:text-sage-400">
                <CountUp end={5879} duration={2.5} separator="," />
              </div>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full md:w-1/3"
          >
            <h3 className="text-lg font-semibold text-sage-700 dark:text-sage-300 mb-4 mt-1">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-4 text-sm text-default-600">
              <li>
                <Link href="/" className="hover:text-sage-700 dark:hover:text-sage-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sage-700 dark:hover:text-sage-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-sage-700 dark:hover:text-sage-300">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-sage-700 dark:hover:text-sage-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-sage-700 dark:hover:text-sage-300">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Stay Connected Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full md:w-1/3"
          >
            <h3 className="text-lg font-semibold text-sage-700 dark:text-sage-300 mb-4 mt-1">
              Stay Connected
            </h3>
            <div className="flex space-x-4 mb-4">
              <Link href="#" className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300">
                <FaFacebookF size={24} />
              </Link>
              <Link href="#" className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300">
                <FaTwitter size={24} />
              </Link>
              <Link href="#" className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300">
                <FaInstagram size={24} />
              </Link>
              <Link href="#" className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300">
                <FaLinkedinIn size={24} />
              </Link>
            </div>
            <div className="text-sm text-default-700 space-y-2">
              <p className="flex items-center gap-1">
                <p>Email:</p>{" "}
                <a
                  href="mailto:info@fitnessgear.com"
                  className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
                >
                  info@fitnessgear.com
                </a>
              </p>
              <p className="flex items-center gap-1">
                <p>Phone:</p>{" "}
                <a
                  href="tel:+1234567890"
                  className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
                >
                  +1 234 567 890
                </a>
              </p>
              <p className="flex items-center gap-1">
                Address: 123 Fitness Lane, Wellness City, Fitland 45678
              </p>
            </div>
          </motion.div>
        </div>

        <Divider className="my-8" />

        {/* Bottom Section */}
        <div className="flex justify-center items-center">
          {/* Footer Copyright */}
          <p className="text-sm text-default-500 text-center">
            © {date} Aura Trip. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
