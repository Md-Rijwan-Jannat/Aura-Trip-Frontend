// components/DocumentCardtsxCardBody
import React from 'react';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import Link from 'next/link';

interface DocumentCardProps {
  title: string;
  items: string[];
  link: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ title, items, link }) => {
  return (
    <Card className="p-4 rounded-md shadow-sm w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sage-600 rounded-full flex items-center justify-center text-white">
            ✓
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
      </CardHeader>
      <CardBody>
        <ul className="space-y-1 text-default-600 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span>📄</span>
              {item}
            </li>
          ))}
        </ul>
      </CardBody>
      <CardFooter>
        <Button
          as={Link}
          href={link}
          target="_blank"
          radius="full"
          size="sm"
          className="w-full text-sage-600 dark:text-sage-400"
        >
          View More →
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
