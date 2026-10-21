import React from 'react';
import { motion } from 'framer-motion';
import { GoVerified } from 'react-icons/go';
import { useStartPaymentProcessMutation } from '@/src/redux/features/payment/subscriptionsApi';
import { TPaymentData, TUser, TPost } from '@/src/types';
import { useGetMyPostsQuery } from '@/src/redux/features/post/postApi';

interface TVerifiedForPaymentProps {
  user: TUser | undefined;
}

export default function VerifiedForPayment({ user }: TVerifiedForPaymentProps) {
  const [startPaymentProcess, { isLoading }] = useStartPaymentProcessMutation();

  // Fetch user's posts data
  const { data: postsData, isSuccess: postsFetched } =
    useGetMyPostsQuery(undefined);
  const posts = postsData?.data;

  // Ensure posts are fetched before checking likes
  const hasLikedPosts =
    postsFetched && posts?.some((p: TPost) => p.likes?.length > 0);

  // Handle verification click
  const handleVerifyClick = async () => {
    if (!user || user.verified) return;

    const paymentData: TPaymentData = {
      user: user._id!,
      amount: 1000, // Subscription amount
      customerName: user.name!,
      customerEmail: user.email!,
      customerAddress: user.address!,
      customerCountry: user.country || 'N/A',
      customerNumber: 'N/A',
    };

    try {
      const response = await startPaymentProcess({
        userId: user._id!,
        paymentData,
      }).unwrap();

      if (response.success && response.data.paymentResponse.payment_url) {
        // Navigate to the payment URL
        window.location.href = response.data.paymentResponse.payment_url;
      }
    } catch (error) {
      console.error('Error starting payment process:', error);
    }
  };

  return (
    <motion.button
      onClick={handleVerifyClick}
      whileHover={{ scale: !hasLikedPosts && !isLoading ? 1.05 : 1 }}
      className={`${
        user?.verified || !hasLikedPosts || isLoading
          ? 'cursor-not-allowed'
          : 'cursor-pointer'
      } flex items-center gap-1 rounded-full px-3 py-1 border border-dashed border-sage-600 hover:bg-default-100 transition-colors-opacity duration-500 ease-in-out text-xs text-default-500`}
      disabled={user?.verified || !hasLikedPosts || isLoading}
    >
      <GoVerified className="text-primaryColor" size={16} />
      {isLoading ? 'Processing...' : 'Verify Now'}
    </motion.button>
  );
}
