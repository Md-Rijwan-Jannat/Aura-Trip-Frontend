"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Card } from "@nextui-org/card";
import Container from "@/src/components/shared/container";
import { Button } from "@nextui-org/button";
import { sections } from "./termsSectionData";
import TermSectionCard from "./termSectionCard";
import { SectionId } from "@/src/types";

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState<SectionId>("introduction");

  const sectionRefs: Record<SectionId, React.RefObject<HTMLDivElement>> = {
    introduction: useRef<HTMLDivElement>(null),
    "account-registration": useRef<HTMLDivElement>(null),
    "user-content": useRef<HTMLDivElement>(null),
    "community-guidelines": useRef<HTMLDivElement>(null),
    "aura-trip": useRef<HTMLDivElement>(null),
    "photo-sharing": useRef<HTMLDivElement>(null),
    "reviews-ratings": useRef<HTMLDivElement>(null),
    "third-party-links": useRef<HTMLDivElement>(null),
    "intellectual-property": useRef<HTMLDivElement>(null),
    "limitation-liability": useRef<HTMLDivElement>(null),
    "changes-terms": useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  const handleScrollToSection = (id: SectionId) => {
    const offset = 80;
    const section = sectionRefs[id]?.current;

    if (section) {
      const top = section.offsetTop - offset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });

      setActiveSection(id);
    }
  };

  return (
    <Container>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 mb-8 md:mb-0 md:pr-8 hidden md:block">
          <Card className="p-4 sticky top-20">
            <p className="text-2xl font-bold text-sage-600 dark:text-sage-400 mb-4">Sections</p>
            <div className="space-y-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  onClick={() => handleScrollToSection(section.id as SectionId)}
                  className={`w-full justify-start ${activeSection === section.id ? "bg-sage-600 text-white font-semibold" : "bg-default-200 text-default-700"}`}
                >
                  {section.title}
                </Button>
              ))}
            </div>
          </Card>
        </div>
        <div className="md:w-3/4 pt-24">
          <p className="text-2xl md:text-4xl font-bold text-center text-sage-600 dark:text-sage-400 mb-8">
            Terms of Service
          </p>
          <p className="text-sm md:text-[16px] text-center text-gray-600 mb-8">
            Welcome to Aura Trip. These terms of service
            outline the rules and regulations for the use of our website and
            services.
          </p>

          {sections.map((section) => (
            <div key={section.id} id={section.id}>
              <TermSectionCard
                title={section.title}
                content={section.content}
                icon={section.icon}
                sectionRef={sectionRefs[section.id as SectionId]}
              />
            </div>
          ))}

          <Card className="p-6  shadow-lg">
            <p className="text-secondaryColor mb-4 text-center">
              By using Aura Trip, you acknowledge that you
              have read and understood these Terms of Service and agree to be
              bound by them.
            </p>
            <p className="text-primaryColor text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </Card>
        </div>
      </div>
    </Container>
  );
}
