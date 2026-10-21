"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/button";
import { useCreateReviewMutation } from "@/src/redux/features/review/reviewApi";
import { useUser } from "@/src/hooks/useUser";
import { Star } from "lucide-react";
import { toast } from "sonner";

export default function CreateReview() {
  const { userInfo } = useUser();
  const router = useRouter();
  const [createReviewFn, { isLoading }] = useCreateReviewMutation();

  // Form state
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(0);
  const variant = "pink";

  // Handle rating click (simple star selection)
  const handleStarClick = (star: number) => {
    setRating(star);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!quote || rating === 0) {
      toast.error("Please provide a review and select a rating.");

      return;
    }

    try {
      // Assuming userInfo has _id property
      await createReviewFn({
        user: userInfo?._id ?? "",
        quote,
        variant,
        rating,
      }).unwrap();
      setQuote("");
      setRating(0);
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="mt-16 text-center max-w-xl mx-auto"
    >
      <h3 className="text-2xl font-bold text-textMain">
        Have an Experience to Share?
      </h3>
      <p className="text-gray-600 mt-2">
        Leave a review and help other travelers find the best places!
      </p>

      {userInfo?.email ? (
        <>
          <div className="mt-6">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-600"
              rows={4}
              placeholder="Write your review here..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-center items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => handleStarClick(star)}
                className={`w-6 h-6 cursor-pointer ${
                  star <= rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-gray-600 text-sm">({rating}/5)</span>
          </div>

          <Button
            isLoading={isLoading}
            onClick={handleSubmit}
            className="mt-4 bg-sage-600 text-white rounded-lg py-2 px-6 hover:bg-sage-800 transition"
          >
            Send Review
          </Button>
        </>
      ) : (
        <Button
          onClick={() => router.push(`/register?redirect=/reviews`)}
          className="mt-4 bg-sage-600 text-white rounded-lg py-2 px-6 hover:bg-sage-800 transition"
        >
          Add Review
        </Button>
      )}
    </motion.div>
  );
}
