"use client";

import { motion } from "framer-motion";
import { Button } from "@nextui-org/button";
import Image from "next/image";
import { useGetAllReviewsQuery } from "@/src/redux/features/review/reviewApi";
import { TReview } from "@/src/types";
import SectionTitle from "../../../ui/sectionTitle";
import Link from "next/link";
import { Avatar } from "@nextui-org/avatar";

export default function Testimonials() {
  const { data: reviewData } = useGetAllReviewsQuery(undefined);
  const reviews = reviewData?.data?.slice(0, 4) ?? ([] as TReview[]);

  return (
    <>
      <SectionTitle text="Testimonials" />
      <section className="mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(({ user, quote }: TReview, index: number) => {
              const variant =
                index === 0 || index === 3
                  ? "bg-sage-600 text-white"
                  : "bg-default-50 text-default-700 border border-default-100";

              return (
                <motion.div
                  key={user?.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl p-6 ${variant}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Avatar
                        name={user?.name?.charAt(0)?.toUpperCase()}
                        src={user?.image || undefined}
                        radius="full"
                        className="text-xl"
                        size="lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <blockquote className="text-sm">
                        {quote.slice(0, 45) + "..."}
                      </blockquote>
                      <div
                        className={`${index === 0 || index === 3 ? "text-default-50" : "text-default-700"}`}
                      >
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-lg md:text-2xl lg:text-4xl font-bold text-sage-600 dark:text-sage-400">
                Join Our Travel Community & Explore Hidden Gems!
              </h2>
              <p className="text-gray-600">
                Discover expert travel tips, must-visit destinations, and
                exclusive guides curated by real travelers. Whether you are a
                solo backpacker, a luxury traveler, or someone planning a family
                getaway, our community is here to help you make the most of
                every adventure. Get insider recommendations, find hidden gems
                off the beaten path, and connect with fellow travelers who share
                your passion for exploration. Share your stories, ask for
                advice, and stay updated on the latest travel trends—all in one
                place!
              </p>
            </div>

            <Button
              variant="solid"
              radius="full"
              as={Link}
              href="/reviews"
              className="font-medium secondary-button"
            >
              MORE REVIEWS
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
