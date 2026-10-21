import { FC } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import Link from 'next/link';
import Image from 'next/image';
import { TPost } from '@/src/types';

type TPostImagesProps = { post: TPost };

const PostImages: FC<TPostImagesProps> = ({ post }) => {
  const images = post?.images ?? [];
  const validImages = images.filter((image): image is string => Boolean(image));

  if (validImages.length === 0) return null;

  const showMoreCount = validImages.length > 3 ? validImages.length - 3 : 0;

  const gridClass =
    validImages.length === 1
      ? 'grid-cols-1'
      : validImages.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-3';

  const imageClass =
    validImages.length === 1
      ? 'h-[300px] w-full'
      : validImages.length === 2
        ? 'h-[300px] w-full'
        : 'h-[250px]';

  return (
    <div className="relative">
      <LightGallery
        elementClassNames={`grid gap-2 ${gridClass} mt-2`}
        plugins={[lgThumbnail, lgZoom]}
        speed={500}
      >
        {validImages.slice(0, 3).map((image, index) => (
          <Link key={index} href={image}>
            <Image
              alt={`image${index}`}
              className={`object-cover object-center ${imageClass}`}
              height={validImages.length === 1 ? 300 : 250}
              src={image}
              width={500}
            />
          </Link>
        ))}
      </LightGallery>

      {showMoreCount > 0 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 rounded-lg px-2 pb-1 pt-0.5">
          <Link
            href={`/news-feed/posts/${post?._id}`}
            className="text-white font-semibold text-xs"
          >
            +{showMoreCount} more
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostImages;
