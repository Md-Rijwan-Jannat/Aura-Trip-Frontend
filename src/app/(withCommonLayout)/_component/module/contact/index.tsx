"use client";

import React, { useState } from "react";
import { Input, Textarea } from "@nextui-org/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@nextui-org/button";
import { SUPPORT_EMAIL } from "@/src/constants/support";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 2000);

    toast.success("Message sent successfully");
  };

  return (
    <div className="max-w-7xl w-full pt-8">
      {/* Header Section */}
      <motion.div
        className="text-center mb-10 h-[60vh] mx-auto w-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-custom-header mb-4 text-default-700">
          Contact Us
        </h1>
        <p className="text-default-700 flex items-center justify-center my-2 text-sm font-light">
          <Link href={"/"}>Home</Link> &gt; Contact Us
        </p>
        <Image
          className="w-[250px]"
          src={
            "https://uigaint.com/demo/html/staco_i/assets/images/services/skills-img.svg"
          }
          width={500}
          height={500}
          alt="doc image"
        />
      </motion.div>

      {/* Form Section */}
      <div className="flex items-center justify-between gap-5 flex-col md:flex-row border border-default-100 p-5 bg-default-50/20 backdrop-blur-2xl rounded-md w-full">
        <Image
          src={
            "https://res.cloudinary.com/dihqveqyc/image/upload/v1735501607/gfqwg36s69s1bv99k4tg.svg"
          }
          height={500}
          width={500}
          alt="contact"
          className="w-full md:w-[350px]"
        />

        <form
          onSubmit={handleSubmit}
          className="rounded-lg w-full md:w-[500px] space-y-7"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-sage-700 dark:text-sage-300 tracking-wider text-sm md:text-lg my-3">
              Travel Platform
            </h2>
            <h1 className="text-2xl md:text-3xl font-bold">
              Do not hesitate to ask <br /> a question
            </h1>
          </motion.div>

          {/* Name Field */}
          <Input
            fullWidth
            variant="bordered"
            radius="full"
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email Field */}
          <Input
            fullWidth
            variant="bordered"
            radius="full"
            label="Your Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Message Field */}
          <Textarea
            fullWidth
            variant="bordered"
            radius="full"
            label="Your Message"
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          {/* Submit Button */}

          <div className="flex items-center justify-center">
            <Button
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="primary-button"
              type="submit"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>

      {/* Contact Information Section */}
      <div className="mt-10 p-5 bg-default-50/50 rounded-md border border-default-100 backdrop-blur-2xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h2 className="text-2xl font-bold text-primaryColor">Get in Touch</h2>
          <p className="text-default-700 mt-2">
            We’d love to hear from you! Reach us via:
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center mt-4 justify-center">
            <p className="bg-default-50 rounded-md px-3 py-1 border border-default-100 text-xs">
              <strong>Email:</strong>{" "}
              <a
                className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p className="bg-default-50 rounded-md px-3 py-1 border border-default-100 text-xs">
              <strong>Support:</strong> We usually reply within 24 hours
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
