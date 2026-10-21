"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "lucide-react";

export interface TBlog {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  date: string; // ISO date format, e.g., '2024-10-05'
  content: string;
  tags: string[];
  readTime: string; // e.g., '5 min'
}

export const blogPosts = [
  {
    id: 1,
    title: "Exploring the Beauty of Nature",
    description:
      "Discover the hidden gems of nature and learn how to enjoy the great outdoors.",
    image:
      "https://res.cloudinary.com/dihqveqyc/image/upload/v1730000501/f330vrcnoenjiuxfejzw.jpg",
    author: "Jane Doe",
    date: "2024-10-05",
    content: `Nature offers a serene escape from the bustling city life, where one can connect with the beauty of the natural world. 
              From dense forests to crystal-clear lakes, each landscape tells its own story. In this post, we'll explore 
              some breathtaking natural destinations and tips on how to make the most of your nature trips.`,
    tags: ["nature", "outdoors", "travel"],
    readTime: "5 min",
  },
  {
    id: 2,
    title: "Culinary Adventures: A Taste of Travel",
    description:
      "Join us on a journey through the flavors of the world and the stories behind them.",
    image:
      "https://res.cloudinary.com/dihqveqyc/image/upload/v1730001159/bgftolhd60eualfkelye.png",
    author: "John Smith",
    date: "2024-09-15",
    content: `Food is more than sustenance; it’s a way to experience cultures and histories. In our journey through culinary 
              wonders, we dive into local dishes from around the world. Learn about the origins of these flavors and how 
              they represent the spirit of the places they come from.`,
    tags: ["food", "travel", "culture"],
    readTime: "7 min",
  },
  {
    id: 3,
    title: "Travel Tips for Your Next Adventure",
    description:
      "Get insider tips on how to make the most of your travels and avoid common pitfalls.",
    image:
      "https://res.cloudinary.com/dihqveqyc/image/upload/v1730000518/adadka1ay9td1yikjriw.png",
    author: "Emily Johnson",
    date: "2024-08-20",
    content: `Traveling can be daunting, but with a bit of preparation, you can make the journey smooth and enjoyable. 
              In this guide, we share tips on packing, planning, and how to avoid common travel mishaps. Whether you're 
              a first-time traveler or a seasoned globetrotter, there's something here for everyone.`,
    tags: ["travel", "tips", "adventure"],
    readTime: "6 min",
  },
  {
    id: 4,
    title: "Hidden Beaches You Must Visit",
    description:
      "Explore serene beaches off the beaten path and escape the crowds.",
    image:
      "https://static.theceomagazine.net/wp-content/uploads/2019/12/23084741/benagil-sea-cave.jpg",
    author: "Anna Lee",
    date: "2024-07-30",
    content: `Tired of crowded beaches? Discover hidden paradises where you can relax and unwind away from the masses. 
              We’ve gathered a list of some of the most secluded and beautiful beaches worldwide, ideal for your next escape.`,
    tags: ["beach", "secluded", "relaxation"],
    readTime: "4 min",
  },
  {
    id: 5,
    title: "The Best Hiking Trails Around the World",
    description:
      "Lace up your boots and explore some of the world’s most breathtaking hiking trails.",
    image:
      "https://www.planetware.com/wpimages/2020/03/best-hikes-in-the-world-machu-picchu-overview.jpg",
    author: "Mark Wilson",
    date: "2024-06-18",
    content: `Hiking is one of the best ways to immerse yourself in nature and challenge your limits. From the Inca Trail 
              to the Rockies, we’ve compiled a list of the top trails for adventurous hikers. Find out what makes each of 
              these hikes unique and get tips on how to prepare for the journey.`,
    tags: ["hiking", "adventure", "nature"],
    readTime: "8 min",
  },
  {
    id: 6,
    title: "City Escapes: Discovering Urban Wonders",
    description:
      "Delve into the heart of vibrant cities and uncover urban marvels worth exploring.",
    image:
      "https://www.staysure.co.uk/wp-content/uploads/2015/07/copenhagen_skyline.jpg.webp",
    author: "Rachel Green",
    date: "2024-05-12",
    content: `Urban adventures offer a unique blend of history, culture, and modernity. Discover hidden spots and 
              architectural wonders in cities around the world. From local markets to towering skyscrapers, find out 
              what makes each city a marvel in its own right.`,
    tags: ["city", "culture", "architecture"],
    readTime: "6 min",
  },
] as TBlog[];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-10 pt-28">
      {/* Header Section */}
      <motion.div
        className="text-center mb-10 h-[60vh] mx-auto w-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-custom-header mb-4 text-default-700">
          Our Blogs
        </h1>
        <p className="text-default-700 flex items-center justify-center my-2 text-sm font-light">
          <Link href={"/"} className="hover:underline">
            Home
          </Link>{" "}
          &gt; Our Travel Blog
        </p>
        <Image
          className="md:w-1/2"
          src={
            "https://cdni.iconscout.com/illustration/premium/thumb/young-woman-writes-about-attractive-destinations-in-travel-illustration-download-svg-png-gif-file-formats--blog-creative-writing-vacation-pack-holidays-illustrations-6091445.png?f=webp"
          }
          width={500}
          height={500}
          alt="doc image"
        />
      </motion.div>

      {/* Search Bar */}
      <div className="flex justify-center mb-6 w-full">
        <input
          type="text"
          placeholder="Search documents..."
          className="border rounded-full px-4 py-2 w-[300px] md:w-[400px] focus:outline-none border-default-200 text-default-900 "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon className="-ml-9 mt-2 text-default-600" />
      </div>

      {/* All Blogs Section */}
      <section>
        <motion.h2
          className="text-2xl font-semibold text-default-700 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          All Blog Posts
        </motion.h2>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              className="bg-default-50 shadow-lg rounded-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: post.id * 0.1 }}
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold text-sage-700 dark:text-sage-300 mb-2">
                  {post.title}
                </h3>
                <p className="text-default-700 mb-3">{post.description}</p>
                <Link
                  href={`/blog/${post.id}`}
                  className="text-sage-600 dark:text-sage-400 hover:underline"
                >
                  Read More
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
