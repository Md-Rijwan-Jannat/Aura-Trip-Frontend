'use client';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/dropdown';
import { Button } from '@nextui-org/button';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, LaptopIcon } from 'lucide-react';

const ThemeDropdown = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className="border-none"
          isIconOnly
          variant="bordered"
          radius="full"
          startContent={
            theme === 'dark' ? <MoonIcon size={18} /> : <SunIcon size={18} />
          }
         />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Theme selection"
        onAction={(key) => handleThemeChange(key as string)}
      >
        <DropdownItem
          className="rounded"
          key="light"
          startContent={<SunIcon size={15} />}
        >
          Light Mode
        </DropdownItem>
        <DropdownItem
          className="rounded"
          key="dark"
          startContent={<MoonIcon size={15} />}
        >
          Dark Mode
        </DropdownItem>
        <DropdownItem
          className="rounded"
          key="system"
          startContent={<LaptopIcon size={15} />}
        >
          System
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ThemeDropdown;
