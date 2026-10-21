'use client';

import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/card';
import { Avatar } from '@nextui-org/avatar';
import { Button } from '@nextui-org/button';
import { Tooltip } from '@nextui-org/tooltip';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoVerified } from 'react-icons/go';
import { FaUserFriends } from 'react-icons/fa';
import { TUser } from '@/src/types';
import Follow from '../follow';

interface TFollowerProps {
  followers: TUser[];
  follower: TUser;
}

export default function FollowerCard({ follower, followers }: TFollowerProps) {
  const { image, name, _id, verified, bio } = follower || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-[340px] w-full mx-auto transition-all duration-300">
        <CardHeader className="justify-between pb-0">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${_id}`}>
              <Avatar
                size="lg"
                src={image || undefined}
                name={name?.charAt(0).toUpperCase()}
                className="w-14 h-14 text-large"
              />
            </Link>
            <div className="flex flex-col">
              <Link
                className="text-md font-semibold text-default-700 flex items-center gap-1"
                href={`/profile/${_id}`}
              >
                {name}{' '}
                {verified && (
                  <Tooltip content="Verified User">
                    <GoVerified className="text-sage-600 dark:text-sage-400" />
                  </Tooltip>
                )}
              </Link>
              <p className="text-small text-default-500">
                {bio
                  ? bio.slice(0, 30) + (bio.length > 30 ? '...' : '')
                  : 'No bio available'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center">
            <motion.div
              className="w-full h-1 bg-gradient-to-r from-sage-300 to-sage-300 dark:from-sage-700 dark:to-sage-700 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </CardBody>
        <CardFooter className="flex-col items-center pt-0">
          <p className="text-default-500 text-sm flex items-center gap-2">
            <FaUserFriends className="text-sage-600 dark:text-sage-400" />
            <span>{followers?.length || 0} followers</span>
          </p>
          <Follow userId={_id} />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
