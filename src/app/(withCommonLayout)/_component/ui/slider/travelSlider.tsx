import React, { FC, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/button";
import Image from "next/image";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import SwiperCore from "swiper";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

type DestinationCard = {
  name: string;
  rating: number;
  category: string;
  icon: string;
};

interface TravelSliderProps {
  destinations: DestinationCard[];
}

const TravelSlider: FC<TravelSliderProps> = ({ destinations }) => {
  const swiperRef = useRef<SwiperCore | null>(null);

  const handleNextSlide = () => {
    swiperRef.current?.slideNext();
  };

  const handlePrevSlide = () => {
    swiperRef.current?.slidePrev();
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-end gap-3">
        <Button
          isIconOnly
          radius="full"
          startContent={<IoIosArrowBack />}
          onClick={handlePrevSlide}
          className="bg-default-200 p-2 rounded-full text-sage-600 dark:text-sage-400"
        />
        <Button
          isIconOnly
          radius="full"
          startContent={<IoIosArrowForward />}
          onClick={handleNextSlide}
          className="bg-default-200 p-2 rounded-full text-sage-600 dark:text-sage-400"
        />
      </div>

      <Swiper
        modules={[Navigation]}
        slidesPerView={2}
        spaceBetween={20}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="my-5"
      >
        {destinations.map((destination, idx) => (
          <SwiperSlide key={idx}>
            {/* Each slide has its own LightGallery instance */}
            <LightGallery
              plugins={[lgThumbnail, lgZoom]}
              speed={500}
              elementClassNames="w-full"
            >
              <a href={destination.icon}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-default-50 rounded-lg m-3 md:m-5 flex flex-col items-center cursor-pointer w-[140px] md:w-full border border-default-200/90"
                >
                  <Image
                    width={500}
                    height={500}
                    src={destination.icon}
                    alt={`${destination.name} icon`}
                    className="w-full h-[90px] rounded-t-md"
                  />
                  <div className="flex flex-col justify-center items-center p-2">
                    <h3 className="text-default-800 font-semibold">
                      {destination.name}
                    </h3>
                    <div className="text-warning text-sm">
                      {destination.rating} ★
                    </div>
                    <div className="text-default-800 font-medium mt-1">
                      {destination.category}
                    </div>
                  </div>
                </motion.div>
              </a>
            </LightGallery>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TravelSlider;
