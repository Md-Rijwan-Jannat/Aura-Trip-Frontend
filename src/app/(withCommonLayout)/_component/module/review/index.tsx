"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";
import { TReview } from "@/src/types";
import { useGetAllReviewsQuery } from "@/src/redux/features/review/reviewApi";
import { Avatar } from "@nextui-org/avatar";
import StarRating from "../../ui/starRatinh";
import { Pagination } from "@nextui-org/pagination";
import CreateReview from "./createReview";
import { Quote } from "lucide-react";
import Loader from "@/src/components/ui/loader";

const MAX_LENGTH = 100;

export default function Reviews() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const [page, setPage] = useState(1);
  const { data: reviewData, isLoading } = useGetAllReviewsQuery({
    page,
    limit: 6,
  });

  const reviews = reviewData?.data ?? [];
  const meta = reviewData?.meta;

  console.log("Review Data", reviews);

  return (
    <div className="min-h-screen bg-appBackground py-12 pt-24 px-6 md:px-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-sage-600 dark:text-sage-400">
          What Our Travelers Say
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore real stories and experiences from our travel-loving community.
          Your next adventure starts here!
        </p>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center w-full h-[200px]">
          <Loader />
        </div>
      )}

      {/* Reviews Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {reviews.map((review: TReview) => (
          <motion.div
            key={review._id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Card className="shadow-lg rounded-2xl border border-gray-200 p-6 h-full">
              <CardBody>
                <div className="flex items-center space-x-4">
                  <Avatar
                    name={review?.user?.name?.charAt(0)?.toUpperCase()}
                    src={review?.user?.image || undefined}
                    radius="full"
                    className="text-xl"
                    size="lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-textMain">
                      {review.user.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{review.user.bio}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 italic">
                  <Quote className="inline-block w-5 h-5 text-sage-600 dark:text-sage-400 mr-2" />
                  {isExpanded || review.quote.length <= MAX_LENGTH
                    ? review.quote
                    : `${review.quote.substring(0, MAX_LENGTH)}...`}
                  {review.quote.length > MAX_LENGTH && (
                    <button
                      onClick={toggleExpand}
                      className="ml-2 text-sage-600 dark:text-sage-400 hover:underline"
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>
                  )}
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <StarRating rating={review.rating} totalStars={5} />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {meta && meta.totalPage > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            color="default"
            variant="flat"
            showControls
            total={meta.totalPage}
            page={page}
            onChange={setPage}
            className="mb-5 px-5 py-2 mx-3 border-none shadow-none rounded-full bg-default-50"
          />
        </div>
      )}

      <CreateReview />
    </div>
  );
}
