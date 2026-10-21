"use client";

import type React from "react";
import { Shield, Lock, Eye, Users, Globe, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Card } from "@nextui-org/card";
import { motion } from "framer-motion";
import Container from "@/src/components/shared/container";

const PolicySection: React.FC<{
  title: string;
  content: string;
  icon: React.ReactNode;
}> = ({ title, content, icon }) => (
  <Card className="w-full p-6 mb-6 bg-card">
    <div className="flex items-center mb-4">
      <div className="mr-4 text-primaryColor">{icon}</div>
      <h3 className="text-xl font-bold text-primaryColor">{title}</h3>
    </div>
    <p className="text-default-700 text-start">{content}</p>
  </Card>
);

export default function PrivacyPolicy() {
  return (
    <Container>
      <div className="text-default-700 pt-2">
        {/* Header Section */}
        <motion.div
          className="text-center mb-10 mt-24 mx-auto w-full flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-8">
            Privacy Policy
          </h1>
          <p className="text-center text-default-700 mb-12">
            At Aura Trip, we value your privacy and are
            committed to protecting your personal information.
          </p>

          <PolicySection
            title="Information We Collect"
            content="We collect information you provide directly to us, such as when you create an account, post content, or communicate with other users."
            icon={<Shield size={24} />}
          />

          <PolicySection
            title="How We Use Your Information"
            content="We use your information to provide, maintain, and improve our services, as well as to communicate with you and personalize your experience."
            icon={<Lock size={24} />}
          />

          <PolicySection
            title="Information Sharing"
            content="We do not sell your personal information. We may share information with third-party service providers or as required by law."
            icon={<Eye size={24} />}
          />

          <PolicySection
            title="Community Guidelines"
            content="As a social community website, we expect all users to respect each other's privacy and adhere to our community guidelines."
            icon={<Users size={24} />}
          />

          <PolicySection
            title="International Data Transfers"
            content="Your information may be transferred to and processed in countries other than your own. We take appropriate measures to protect your data during these transfers."
            icon={<Globe size={24} />}
          />

          <div className="mt-12 text-center">
            <p className="text-secondaryColor mb-4">
              If you have any questions about our Privacy Policy, please contact
              us.
            </p>
            <Link
              href="contact"
              className="text-primaryColor hover:underline inline-flex items-center"
            >
              <HelpCircle size={16} className="mr-2" />
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}
