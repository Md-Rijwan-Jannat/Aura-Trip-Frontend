'use client';

import { Input } from '@nextui-org/input';
import { Kbd } from '@nextui-org/kbd';
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from '@/src/components/ui/icons';
import { useGetAllPostsQuery } from '@/src/redux/features/post/postApi';
import { useGetAllUsersQuery } from '@/src/redux/features/adminManagement/manageUserApi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { TPost, TUser } from '@/src/types';
import { FiArrowUpRight } from 'react-icons/fi';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { Avatar } from '@nextui-org/avatar';
import { Chip } from '@nextui-org/chip';

export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch posts and users with the searchTerm
  const { data: allPostsData, refetch: refetchPosts } = useGetAllPostsQuery({
    searchTerm,
  });
  const { data: allUsersData, refetch: refetchUsers } = useGetAllUsersQuery({
    searchTerm,
  });

  const posts = allPostsData?.data as TPost[];
  const users = allUsersData?.data as TUser[];

  useEffect(() => {
    const debounce = setTimeout(() => {
      refetchPosts();
      refetchUsers();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchTerm, refetchPosts, refetchUsers]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Ctrl + K key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full">
      <Input
        aria-label="Search"
        ref={inputRef}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => setIsDropdownOpen(true)}
        classNames={{
          inputWrapper: 'bg-default-100 p-2 md:p-4',
          input: 'text-xs md:text-sm lg:text-base',
        }}
        endContent={
          <Kbd className="hidden md:flex" keys={['command']}>
            K
          </Kbd>
        }
        labelPlacement="outside"
        placeholder="Search posts and users..."
        radius="full"
        size="md"
        startContent={
          <SearchIcon className="text-xs md:text-base lg:text-lg text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
      />

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && searchTerm && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute w-[250px] md:w-full left-0 mt-2 bg-default-50 border border-default-200 rounded-lg backdrop-blur-2xl h-[200px] md:h-[300px] overflow-auto scrollbar-hide"
          >
            {/* Posts Section */}
            {posts && posts.length > 0 && (
              <div className="p-2">
                <h3 className="text-[10px] md:text-[14px] lg:text-[16px] font-semibold text-default-700 mb-2">
                  Posts
                </h3>
                <div className="grid grid-cols-1">
                  {posts.map((post: TPost) => (
                    <Link
                      key={post._id}
                      onClick={() => setIsDropdownOpen(false)}
                      className="py-2 px-4 text-sm cursor-pointer hover:bg-default-100 rounded-md border border-default-100 flex gap-3 items-center"
                      href={`/news-feed/posts/${post?._id}`}
                    >
                      <FiArrowUpRight className="text-[16px] md:text-[22px] lg:text-[27px] " />
                      <div className="flex flex-col items-start gap-0.5 w-full">
                        <p className="font-semibold text-[10px] md:text-[14px] lg:text-[16px]">
                          {post.title.slice(0, 30)}
                        </p>
                        <p
                          className="text-default-500 text-[10px] md:text-[14px] lg:text-[16px]"
                          dangerouslySetInnerHTML={{
                            __html: post.description.slice(0, 50),
                          }}
                         />
                      </div>
                      <MdOutlineKeyboardArrowRight className="text-[18px] md:text-[22px] lg:text-[30px]" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Users Section */}
            {users && users.length > 0 && (
              <div className="p-2">
                <h3 className="text-[10px] md:text-[14px] lg:text-[16px] font-semibold text-default-700 mb-2">
                  Users
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {users.map((user: TUser) => (
                    <Link
                      key={user._id}
                      onClick={() => setIsDropdownOpen(false)}
                      className="py-2 px-4 text-sm cursor-pointer hover:bg-default-100 rounded-md border border-default-100 flex gap-3 items-center"
                      href={`/profile/${user?._id}`}
                    >
                      <div className="flex flex-col items-start md:gap-0.5 w-full text-[10px] md:text-[14px] lg:text-[16px]">
                        <p className="font-semibold">{user.name}</p>
                      </div>
                      <Chip
                        className="text-[10px] md:text-[14px] lg:text-[16px]"
                        size="sm"
                        color={user.role === 'ADMIN' ? 'danger' : 'default'}
                      >
                        {user.role}
                      </Chip>
                      <MdOutlineKeyboardArrowRight size={22} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {(!posts || posts.length === 0) &&
              (!users || users.length === 0) && (
                <div className="p-4 text-sm text-default-500">
                  No results found
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
