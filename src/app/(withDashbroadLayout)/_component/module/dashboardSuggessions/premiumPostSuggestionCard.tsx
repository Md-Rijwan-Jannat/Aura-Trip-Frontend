import React from "react";
import { Avatar } from "@nextui-org/avatar";
import { PiCrownSimpleDuotone } from "react-icons/pi";
import { motion } from "framer-motion";
import { useStartPaymentProcessMutation } from "@/src/redux/features/payment/subscriptionsApi";
import { TPost, TPaymentData } from "@/src/types";
import { useUser } from "@/src/hooks/useUser";
import { useGetMyPostsQuery } from "@/src/redux/features/post/postApi";

interface TPremiumPostSuggestionCardProps {
  post: TPost;
}

export default function PremiumPostSuggestionCard({
  post,
}: TPremiumPostSuggestionCardProps) {
  const { userInfo: user } = useUser();
  const [startPaymentProcess, { isLoading }] = useStartPaymentProcessMutation();

  // Fetch user's posts data
  const { data: postsData, isSuccess: postsFetched } =
    useGetMyPostsQuery(undefined);
  const posts = postsData?.data;

  // Ensure posts are fetched before checking likes
  const hasLikedPosts =
    postsFetched && posts?.some((p: TPost) => p.likes?.length > 0);

  const truncatedTitle =
    post?.title.length > 5 ? post?.title.slice(0, 5) + "..." : post?.title;

  const handleSubscription = async () => {
    if (!user || user.verified) return;

    const paymentData: TPaymentData = {
      user: user._id!,
      amount: 1000, // Subscription amount
      customerName: user.name!,
      customerEmail: user.email!,
      customerAddress: user.address!,
      customerCountry: user.country || "N/A",
      customerNumber: "N/A",
    };

    try {
      const response = await startPaymentProcess({
        userId: user._id!,
        paymentData,
      }).unwrap();

      if (response.success && response.data.paymentResponse.payment_url) {
        window.location.href = response.data.paymentResponse.payment_url;
      }
    } catch (error) {
      console.error("Error starting payment process:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="bg-default-50 border border-default-200 rounded-md p-2 duration-300 ease-in-out"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar
            alt="premium post"
            className="text-[20px] text-primaryColor"
            name={post?.title.charAt(0).toUpperCase()}
            size="md"
            src={post.images && post.images[0]}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-default-900 text-[12px]">
              {truncatedTitle}
            </h3>
            <p className="text-default-500 text-[10px] bg-sage-600/10 rounded-full px-2">
              Recommended
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <motion.button
            whileHover={{ scale: hasLikedPosts ? 1.05 : 1 }}
            className={`${
              user?.verified || !hasLikedPosts
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } flex items-center gap-1 rounded-full px-3 py-1 border border-default-200 hover:bg-default-100 transition-colors-opacity duration-500 ease-in-out text-xs text-default-500`}
            onClick={handleSubscription}
            disabled={user?.verified || !hasLikedPosts || isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : user?.verified || !hasLikedPosts ? (
              <>
                Subscribed
                <PiCrownSimpleDuotone className="text-default-500" size={16} />
              </>
            ) : (
              <>
                Premium
                <PiCrownSimpleDuotone className="text-yellow-500" size={16} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
