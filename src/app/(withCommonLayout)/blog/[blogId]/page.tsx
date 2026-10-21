"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TBlog, blogPosts } from "../../_component/module/blogs";
import BackButton from "@/src/app/(withAuthLayout)/_component/ui/backButton";
import { Card, CardBody, CardHeader, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import Image from "next/image";

interface TBlogDetailsProps {
  params: { blogId: string };
}

export default function BlogDetailsPage({ params }: TBlogDetailsProps) {
  const router = useRouter();
  const blogId = parseInt(params.blogId);
  const blog = blogPosts.find((post) => post.id === blogId);

  if (!blog) {
    return (
      <div className="p-5 min-h-screen flex flex-col items-center justify-center pt-24">
        <h1 className="text-2xl font-bold text-danger">Blog Not Found</h1>
        <Button
          color="primary"
          variant="shadow"
          onPress={() => router.back()}
          className="mt-5"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-8 pt-20 space-y-5">
      <BackButton />
      <Card className="bg-background/60 dark:bg-default-100/50 backdrop-blur-lg max-w-2xl mx-auto">
        <CardHeader className="flex-col items-start">
          <h1 className="text-2xl font-bold text-center mb-2">{blog.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-default-500">
            <span>{blog.author}</span>
            <span>•</span>
            <span>{new Date(blog.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{blog.readTime} read</span>
          </div>
        </CardHeader>
        <CardBody className="px-4 py-0 text-foreground">
          <Image
            src={blog.image}
            alt={blog.title}
            width={1000}
            height={1000}
            className="w-full h-full object-cover rounded-lg mb-6"
          />
          <p className="text-lg mb-6 leading-relaxed">{blog.content}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag) => (
              <Chip
                key={tag}
                className="bg-default-50 text-sage-600 dark:text-sage-400 border border-sage-600"
                variant="flat"
              >
                #{tag}
              </Chip>
            ))}
          </div>
        </CardBody>
        <CardFooter>
          <Button
            onClick={() => router.back()}
            className="primary-button"
            radius="full"
          >
            Back to Blog
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
