'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { TDestinationCard } from './destinationGrid';
import { Chip } from '@nextui-org/chip';
import Image from 'next/image';
import { Divider } from '@nextui-org/divider';
import BackButton from '@/src/app/(withAuthLayout)/_component/ui/backButton';

type Props = {
  destination: TDestinationCard;
};

export default function DestinationDetails({ destination }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-8 pt-20 space-y-5">
      <BackButton />
      <Card className="bg-background/60 backdrop-blur-2xl max-w-2xl mx-auto border border-default-100">
        <CardHeader className="flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-sage-700 dark:text-sage-300 mb-2">
            {destination.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 mr-1">★</span>
            <span className="font-semibold">
              {destination.rating.toFixed(1)}
            </span>
            <Chip className="ml-2 bg-sage-600 text-white">
              {destination.category}
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <Image
            src={destination.icon}
            alt={destination.name}
            width={1000}
            height={1000}
            className="w-full h-full object-cover rounded-lg mb-4"
          />
          <p className="text-sm md:text-medium mb-4">
            {destination.longDescription}
          </p>
          <Divider className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-sage-700 dark:text-sage-300">
                Highlights
              </h2>
              <ul className="list-disc list-inside text-sm md:text-medium">
                {destination.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-sage-700 dark:text-sage-300">
                Activities
              </h2>
              <ul className="list-disc list-inside text-sm md:text-medium">
                {destination.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>
          <Divider className="my-4" />
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3 mb-3">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-sage-700 dark:text-sage-300">
                Best Season
              </h2>
              <p className="text-sm md:text-medium">{destination.bestSeason}</p>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-sage-700 dark:text-sage-300">
                Average Cost
              </h2>
              <p className="text-sm md:text-medium">
                {destination.averageCost}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
