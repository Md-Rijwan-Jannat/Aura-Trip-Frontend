"use client";

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hook";
import { clearCredentials, getUser } from "@/src/redux/features/auth/authSlice";
import { useUser } from "@/src/hooks/useUser";
import { toast } from "sonner";
import { Logout } from "@/src/service/logout";
import { useDisclosure } from "@nextui-org/modal";
import CreateGroupModal from "@/src/app/(withDashbroadLayout)/_component/modal/createGroupModal";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { motion } from "framer-motion";
import { UserCircle, Settings, Users, MessageCircle, LogOut, UserPlus, Bell } from "lucide-react";
import { FaConnectdevelop } from "react-icons/fa";
import { TbPremiumRights } from "react-icons/tb";
import { ActiveAvatar } from "./activeAvatar";
import { setChatPanelOpen } from "@/src/redux/features/message/chatUiSlice";

const NavDropdown: FC = () => {
  const dispatch = useAppDispatch();
  const userExists = useAppSelector(getUser);
  const router = useRouter();

  const { userInfo, isFetching } = useUser();

  // Desktop: open the chat list in the right sidebar. Mobile: old /messages page.
  const handleChatClick = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      dispatch(setChatPanelOpen(true));
    } else {
      router.push("/messages");
    }
  };

  const handleLogout = async () => {
    dispatch(clearCredentials());
    await Logout();
    router.push("/");
    toast.success("Logout successful");
  };

  const { isOpen: isGroupOpen, onOpen: onGroupOpen, onOpenChange: onGroupChange } = useDisclosure();

  const dropdownItemClass = "flex items-center gap-2 transition-all duration-300 hover:bg-default-50 rounded";
  const dropdownItemClass2 = "flex items-center gap-2 transition-all duration-300 text-red-500 hover:text-red-600 bgt-transparent rounded";

  return (
    <>
      {userExists?.email ? (
        <Dropdown>
          <DropdownTrigger>
            <div>
              <ActiveAvatar
                className='cursor-pointer transition-transform hover:scale-105 mt-1'
                name={userInfo?.name.charAt(0).toUpperCase()}
                size='md'
                src={userInfo?.image || undefined}
                onClick={(e) => e.stopPropagation()}
                userId={userInfo?._id as string}
              />
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label='User Actions'>
            <DropdownItem
              as={Link}
              href='/news-feed/premium-posts'
              className={`block lg:hidden ${userInfo?.role === "USER" ? "block" : "hidden"} ${dropdownItemClass}`}
              startContent={<TbPremiumRights className='w-4 h-4' />}
            >
              Premium Posts
            </DropdownItem>
            <DropdownItem
              as={Link}
              href={userInfo?.role === "ADMIN" ? "/admin-dashboard" : "/profile"}
              className={`${userInfo?.role === "USER" ? "block" : "hidden"} ${dropdownItemClass}`}
              startContent={<UserCircle className='w-4 h-4' />}
            >
              Profile
            </DropdownItem>
            <DropdownItem
              as={Link}
              href='/add-connections'
              className={`block lg:hidden ${userInfo?.role === "USER" ? "block" : "hidden"} ${dropdownItemClass}`}
              startContent={<FaConnectdevelop className='w-4 h-4' />}
            >
              Add Connection
            </DropdownItem>
            <DropdownItem onClick={handleChatClick} className={dropdownItemClass} startContent={<MessageCircle className='w-4 h-4' />}>
              Chat
            </DropdownItem>
            <DropdownItem
              as={Link}
              href='/notifications'
              className={`block lg:hidden ${userInfo?.role === "USER" ? "block" : "hidden"} ${dropdownItemClass}`}
              startContent={<Bell className='w-4 h-4' />}
            >
              Notifications
            </DropdownItem>

            <DropdownItem onClick={onGroupOpen} className={dropdownItemClass} startContent={<Users className='w-4 h-4' />}>
              Create Group
            </DropdownItem>
            <DropdownItem href='/settings' className={dropdownItemClass} startContent={<Settings className='w-4 h-4' />}>
              Setting
            </DropdownItem>

            <DropdownItem onClick={handleLogout} className={dropdownItemClass2} startContent={<LogOut className='w-4 h-4' />}>
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <div className='flex justify-end'>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size='sm' className='secondary-button' as={Link} href='/register'>
              <UserPlus className='w-4 h-4' />
              Register
            </Button>
          </motion.div>
        </div>
      )}
      <CreateGroupModal isOpen={isGroupOpen} onOpenChange={onGroupChange} />
    </>
  );
};

export default NavDropdown;
