"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import AboutUsFeatures from "./aboutUsFeatures";
import TeamSection from "./teamSection";
import WhoIAmSection from "./whoIAmSection";

export default function About() {
  return (
    <div className="text-default-700 pt-2">
      {/* Header Section */}
      <motion.div
        className="text-center mb-10 h-[60vh] mx-auto w-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-custom-header mb-4 text-default-700">
          About Us
        </h1>
        <p className="text-default-700 flex items-center justify-center my-2 text-sm font-light">
          <Link href={"/"}>Home</Link> &gt; About Us
        </p>
        <Image
          className="w-[300px] md:w-[400px]"
          src={
            "https://uigaint.com/demo/html/staco_i/assets/images/shape/breadcrumb-img.svg"
          }
          width={500}
          height={500}
          alt="Breadcrumb Image"
        />
      </motion.div>

      {/* Core Sections */}
      <AboutUsFeatures />
      <WhoIAmSection />
      <TeamSection />

      {/* Our Story Section */}
      <motion.section
        className="text-center py-16 px-6 bg-default-50 rounded-lg shadow-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-sage-700 dark:text-sage-300">
          Our Story
        </h2>
        <p className="text-default-600 max-w-2xl mx-auto mt-4">
          Founded with a passion for travel, we started our journey to connect
          travelers from all around the world. Our mission is to inspire
          discovery and make every adventure more accessible, enjoyable, and
          enriching.
        </p>
      </motion.section>

      {/* Mission, Values, and Join Us Section */}
      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-3 px-6 py-16">
        {["Our Mission", "Our Values", "Join Us"].map((title, index) => (
          <motion.div
            key={title}
            className="bg-default-50 shadow-lg rounded-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3, duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-3 text-sage-600 dark:text-sage-400">
              {title}
            </h3>
            <p className="text-default-600">
              {title === "Our Mission" &&
                "To inspire and empower travelers worldwide to explore new cultures and create lasting memories."}
              {title === "Our Values" &&
                "We value inclusively, respect, and sustainable travel that protects the beauty of the world for generations."}
              {title === "Join Us" &&
                "Become part of our community, connect with like-minded adventurers, and share your unique travel stories."}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Testimonials Section */}
      <motion.section
        className="text-center py-16 px-6 bg-sage-50 bg-opacity-10 rounded-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-sage-700 dark:text-sage-300">
          What Our Travelers Say
        </h2>
        <div className="flex flex-wrap gap-10 justify-center mt-8">
          {["Emily", "John", "Sarah"].map((name, index) => (
            <motion.div
              key={name}
              className="bg-default-50 shadow-md rounded-lg p-6 w-80"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <p className="italic text-default-700">
                &quot;
                {name === "Emily" &&
                  "This platform made my travel planning so easy and enjoyable!"}
                {name === "John" &&
                  "I discovered places I never knew existed thanks to this community."}
                {name === "Sarah" &&
                  "Amazing guides and tips for my first solo trip - couldn’t have done it without them!"}
                &quot;
              </p>
              <p className="text-sage-600 dark:text-sage-400 font-semibold mt-3">{name}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.div
        className="text-center py-12 px-4 bg-sage-700 text-default-50"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Join Our Travel Community
        </h2>
        <p className="max-w-lg mx-auto mt-4 text-white">
          Connect with fellow travelers, share your stories, and get exclusive
          travel insights!
        </p>
        <Link href="/register">
          <motion.button
            className="mt-6 px-6 py-3 bg-surface text-sage-700 dark:text-sage-300 font-bold rounded-full shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up Now
          </motion.button>
        </Link>
      </motion.div>

      {/* Footer Text */}
      <motion.p
        className="text-center text-default-600 mt-10 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Thank you for being a part of our journey. Happy travels!
      </motion.p>
    </div>
  );
}
