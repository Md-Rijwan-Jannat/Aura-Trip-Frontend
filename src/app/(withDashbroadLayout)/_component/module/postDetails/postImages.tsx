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
  const { images } = (post as TPost) || {};

  const validImages = (images ?? []).filter(
    (image): image is string => Boolean(image)
  );

  if (validImages.length === 0) return null;

  return (
    <LightGallery
      elementClassNames={`grid gap-2 ${
        validImages.length === 1
          ? 'grid-cols-1'
          : validImages.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-3'
      } mt-2`}
      plugins={[lgThumbnail, lgZoom]}
      speed={500}
    >
      {validImages.map((image, index) => (
        <Link key={index} href={image}>
          <Image
            alt={`image${index}`}
            className={`object-cover object-center ${
              validImages.length === 1
                ? 'h-[300px] w-full'
                : validImages.length === 2
                  ? 'h-[300px] w-full'
                  : 'h-[250px]'
            }`}
            height={validImages.length === 1 ? 300 : 250}
            src={image}
            width={500}
          />
        </Link>
      ))}
    </LightGallery>
  );
};

export default PostImages;
