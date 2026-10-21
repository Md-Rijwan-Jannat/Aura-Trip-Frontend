"use client";

import React, { useState, useEffect } from "react";
import { useGetAllPostsQuery } from "@/src/redux/features/post/postApi";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "./postCard/postCard";
import Spinner from "@/src/components/ui/spinner";
import { useUser } from "@/src/hooks/useUser";
import PostModal from "../../modal/postingModal";
import { categoriesList } from "@/src/constants";
import { MdLockReset } from "react-icons/md";
import DropdownFilter from "./postFilter/dropdownFilter";
import PremiumPostsMarquee from "../dashboardSuggessions/premiumPostsMarquee";
import PostDetailsSkeleton from "@/src/components/ui/skeleton/postDetailsSkeleton";
import Stories from "../story";
import { TPost } from "@/src/types";

export default function Post() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterOption, setFilterOption] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<string>("forYou");

  // Current user info
  const { userInfo } = useUser();

  // Fetching posts with Redux Query
  const postParams = {
    page: page.toString(),
    limit: "5",
    ...(selectedCategory && { category: selectedCategory }),
  };

  const {
    data: postData,
    isLoading,
    refetch,
  } = useGetAllPostsQuery(postParams, {
    refetchOnMountOrArgChange: true, // Ensures data refetch when params change
  });

  const allPosts = postData?.data || [];
  const totalPosts = postData?.meta?.total || 0;

  // Filter posts based on selected filter option and tab
  const filteredPosts = () => {
    let filtered = allPosts;

    if (filterOption === "popular") {
      filtered = filtered
        .filter((post: TPost) => post.likes.length > 0)
        .sort((a: TPost, b: TPost) => b.likes.length - a.likes.length);
    }
    if (filterOption === "poor") {
      filtered = filtered.filter((post: TPost) => post.likes.length === 0);
    }

    if (selectedTab === "following") {
      filtered = filtered.filter((post: TPost) =>
        userInfo?.following.includes(post?.user?._id)
      );
    }

    return filtered;
  };

  // Fetch more data for infinite scroll
  const fetchData = () => {
    if (allPosts.length < totalPosts) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Post Modal */}
      <div>
        <PostModal userInfo={userInfo} />
      </div>

      {/* Story List */}
      <Stories />

      {/* Category Buttons */}
      <div className="mt-4 mb-6 flex flex-wrap gap-3">
        {categoriesList.map((category) => (
          <button
            key={category}
            className={`px-4 text-xs py-1 rounded-full border border-default-200 focus:outline-none ${
              selectedCategory === category
                ? "bg-default-100 text-primaryColor"
                : "bg-default-50"
            } hover:bg-default-100 hover:text-primaryColor hover:transition-colors duration-500`}
            onClick={() =>
              setSelectedCategory(category === selectedCategory ? "" : category)
            }
          >
            {category}
          </button>
        ))}
        <button
          className="px-4 py-1 rounded-full border border-default-200 bg-default-50 focus:outline-none hover:bg-default-100 hover:text-primaryColor hover:transition-colors duration-500"
          onClick={() => setSelectedCategory("")}
        >
          <MdLockReset />
        </button>
      </div>

      {/* Dropdown for Post Filtering */}
      <DropdownFilter
        filterOption={filterOption}
        setFilterOption={setFilterOption}
      />

      {/* Premium Posts (only for mobile view) */}
      <div className="block lg:hidden">
        <PremiumPostsMarquee posts={filteredPosts()} />
      </div>

      {/* Tabs for For You and Following */}
      <div className="flex my-5 rounded-xl bg-default-100 p-1 gap-6 text-xs w-full">
        <button
          className={`px-4 py-2 rounded-xl w-full ${
            selectedTab === "forYou" ? "bg-default-50" : "bg-default-100"
          } transition-colors duration-700 ease-in-out`}
          onClick={() => setSelectedTab("forYou")}
        >
          For You
        </button>
        <button
          className={`px-4 py-2 rounded-xl w-full ${
            selectedTab === "following" ? "bg-default-50" : "bg-default-100"
          } transition-colors duration-700 ease-in-out`}
          onClick={() => setSelectedTab("following")}
        >
          Following
        </button>
      </div>

      {/* Tab Content */}
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchData}
        hasMore={allPosts.length < totalPosts}
        loader={
          <div className="flex items-center justify-center mt-5">
            <Spinner />
          </div>
        }
        endMessage={
          <p className="text-center text-xs text-sage-500 dark:text-sage-400 my-3">
            You seen all posts
          </p>
        }
      >
        {/* Render Posts */}
        <div className="grid grid-cols-1 gap-5 mt-5">
          {filteredPosts().map((post: TPost) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {/* Fallback: Skeleton while loading */}
        {isLoading && (
          <div className="flex flex-col">
            {Array.from({ length: 7 }).map((_, index) => (
              <PostDetailsSkeleton key={index} />
            ))}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
}
