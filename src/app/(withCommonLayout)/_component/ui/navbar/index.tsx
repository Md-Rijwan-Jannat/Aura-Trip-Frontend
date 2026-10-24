import React from "react";
import { Navbar as NextUINavbar, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarBrand, NavbarItem } from "@nextui-org/navbar";
import NextLink from "next/link";
import NavLinks from "./navLinks";
import NavDropdown from "./navDropdown";
import BrandLogo from "@/src/components/shared/logo";
import ThemeDropdown from "@/src/components/modal/themeDropdown";
import Link from "next/link";
import { NotificationBell } from "@/src/components/ui/NotificationBell";

export default function NavBar() {
  return (
    <NextUINavbar className='bg-surface/80 backdrop-blur-xl border-b border-borderSubtle shadow-sm fixed' maxWidth='xl' position='sticky'>
      <NavbarContent className='basis-1/5 sm:basis-auto' justify='start'>
        <NavbarBrand as='li' className='gap-3 max-w-fit shrink-0'>
          <Link className='flex items-center gap-2 shrink-0' href='/'>
            <BrandLogo />
          </Link>
        </NavbarBrand>
        <div className='hidden md:block shrink-0'>
          <NavLinks />
        </div>
      </NavbarContent>

      <NavbarContent className='hidden md:flex basis-1/5 sm:basis-auto items-center' justify='end'>
        <NavbarItem className='hidden md:flex gap-4'>
          <ThemeDropdown />
          <NotificationBell />
        </NavbarItem>
        <NavbarItem className='hidden md:flex gap-4'>
          <NavDropdown />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className='flex items-center  md:hidden gap-4' justify='end'>
        <ThemeDropdown />
        <NotificationBell />
        <NavDropdown />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className='mx-4 mt-2 flex flex-col gap-2'>
          <NavLinks />
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
}
