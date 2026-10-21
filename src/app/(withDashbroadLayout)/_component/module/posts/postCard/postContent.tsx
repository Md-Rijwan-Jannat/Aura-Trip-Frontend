"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TPost } from "@/src/types";
import { FaFilePdf } from "react-icons/fa6";
import { Button } from "@nextui-org/button";
import { generatePDF } from "@/src/utils/generatePDF";

interface PostContentProps {
  post: TPost;
}

export default function PostContent({ post }: PostContentProps) {
  useEffect(() => {
    if (!post) {
      return;
    }
  }, [post]);

  // Function to safely render HTML content
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  // Function to style links in the description
  const styleLinksInDescription = (html: string) => {
    return html.replace(
      /<a\s+(href="[^"]*")/g,
      `<a class="text-sage-600 dark:text-sage-400 hover:underline" $1`
    );
  };

  // Title, description pdf creations
  const downloadPDF = async () => {
    generatePDF(post);
  };

  return (
    <div>
      <Link
        href={`/news-feed/posts/${post?._id}`}
        className="text-lg font-bold text-default-700"
      >
        {post?.title}
      </Link>
      <div className="flex items-center gap-1">
        <div
          className="text-xs md:text-sm text-default-800 mt-2"
          dangerouslySetInnerHTML={createMarkup(
            styleLinksInDescription(post?.description)
          )}
        />
      </div>

      {/* Button to download the description and images as a PDF */}
      <div className="flex w-full items-end justify-end">
        <Button
          className="mt-3 h-8 text-sage-600 dark:text-sage-400"
          startContent={<FaFilePdf size={18} />}
          size="sm"
          onClick={downloadPDF}
        >
          Download
        </Button>
      </div>
    </div>
  );
}
