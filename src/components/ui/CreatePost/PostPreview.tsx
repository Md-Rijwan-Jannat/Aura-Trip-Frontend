"use client";

import { Avatar } from "@nextui-org/avatar";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import Image from "next/image";
import Link from "next/link";
import { GoVerified } from "react-icons/go";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { TUser } from "@/src/types";

interface PostPreviewProps {
  userInfo: TUser | undefined;
  title: string;
  description: string;
  images: string[];
  mediaLayout: string;
  status: string;
}

const PostPreview = ({ userInfo, title, description, images, mediaLayout, status }: PostPreviewProps) => {
  const hasContent = title || description || images.length > 0;

  const renderMediaGrid = () => {
    if (images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-default-100'>
          <Image src={images[0]} alt='Post image' fill className='object-cover' />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className='grid grid-cols-2 gap-1 rounded-lg overflow-hidden'>
          {images.map((img, i) => (
            <div key={i} className='relative aspect-square bg-default-100'>
              <Image src={img} alt={`Image ${i + 1}`} fill className='object-cover' />
            </div>
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className='grid grid-cols-2 gap-1 rounded-lg overflow-hidden'>
          <div className='relative aspect-square bg-default-100 col-span-2'>
            <Image src={images[0]} alt='Image 1' fill className='object-cover' />
          </div>
          {images.slice(1).map((img, i) => (
            <div key={i + 1} className='relative aspect-square bg-default-100'>
              <Image src={img} alt={`Image ${i + 2}`} fill className='object-cover' />
            </div>
          ))}
        </div>
      );
    }

    // 4+ images
    return (
      <div className='grid grid-cols-2 gap-1 rounded-lg overflow-hidden'>
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className='relative aspect-square bg-default-100'>
            <Image src={img} alt={`Image ${i + 1}`} fill className='object-cover' />
            {i === 3 && images.length > 4 && (
              <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                <span className='text-white text-2xl font-semibold'>+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='p-6 h-full overflow-y-auto'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-4'>
          <h3 className='text-xl font-semibold text-center text-textMain'>Preview</h3>
          <p className='text-sm text-center text-textSecondary mt-1'>This is how your post will appear</p>
        </div>

        {!hasContent ? (
          <div className='flex items-center justify-center h-96'>
            <div className='text-center'>
              <div className='w-24 h-24 mx-auto mb-4 rounded-full bg-default-100 flex items-center justify-center'>
                <MessageCircle className='w-12 h-12 text-default-400' />
              </div>
              <p className='text-lg font-medium text-textSecondary'>Start creating your post</p>
              <p className='text-sm text-textSecondary mt-1'>Your preview will appear here</p>
            </div>
          </div>
        ) : (
          <Card className='shadow-sm border border-borderSubtle'>
            <CardHeader className='justify-between px-4 pt-4'>
              <div className='flex gap-3'>
                <Link href={`/profile/${userInfo?._id}`}>
                  <Avatar
                    className='cursor-pointer'
                    alt={userInfo?.name}
                    name={userInfo?.name?.charAt(0).toUpperCase()}
                    size='md'
                    src={userInfo?.image || undefined}
                  />
                </Link>
                <div className='flex flex-col gap-1 items-start justify-center'>
                  <Link href={`/profile/${userInfo?._id}`}>
                    <h4 className='text-sm font-semibold leading-none text-textMain flex items-center gap-1 hover:underline'>
                      {userInfo?.name}
                      {userInfo?.verified && <GoVerified className='text-primaryColor' size={14} />}
                    </h4>
                  </Link>
                  <h5 className='text-xs tracking-tight text-textSecondary flex items-center gap-1'>
                    Just now • {status === "FREE" ? "Public" : "Premium"}
                  </h5>
                </div>
              </div>
            </CardHeader>

            <CardBody className='px-4 py-3 text-sm space-y-3'>
              {title && <h3 className='text-base font-semibold text-textMain'>{title}</h3>}

              {description && (
                <div className='text-sm text-textMain prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: description }} />
              )}

              {images.length > 0 && <div className='mt-3'>{renderMediaGrid()}</div>}
            </CardBody>

            <Divider />

            <CardFooter className='gap-3 px-4 py-3'>
              <div className='flex items-center gap-1 text-textSecondary hover:text-primaryColor cursor-pointer transition-colors'>
                <Heart className='w-5 h-5' />
                <span className='text-sm'>Like</span>
              </div>
              <div className='flex items-center gap-1 text-textSecondary hover:text-primaryColor cursor-pointer transition-colors'>
                <MessageCircle className='w-5 h-5' />
                <span className='text-sm'>Comment</span>
              </div>
              <div className='flex items-center gap-1 text-textSecondary hover:text-primaryColor cursor-pointer transition-colors'>
                <Share2 className='w-5 h-5' />
                <span className='text-sm'>Share</span>
              </div>
              <div className='flex-1' />
              <div className='flex items-center gap-1 text-textSecondary hover:text-primaryColor cursor-pointer transition-colors'>
                <Bookmark className='w-5 h-5' />
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PostPreview;
