"use client"

import React, { useEffect, useState, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LucideIcon, Menu, X, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { ThemeToggle } from "./ThemeToggle"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  children?: NavItem[]
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export const NavBar = memo(({ items, className }: NavBarProps) => {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Update active tab based on current URL
  useEffect(() => {
    const updateActiveTab = () => {
      const currentPath = window.location.pathname;
      
      // First check for exact matches
      const exactMatch = items.find(item => item.url === currentPath);
      if (exactMatch) {
        setActiveTab(exactMatch.name);
        return;
      }
      
      // Then check for child items
      for (const item of items) {
        if (item.children) {
          const childMatch = item.children.find(child => child.url === currentPath);
          if (childMatch) {
            setActiveTab(item.name); // Set parent as active for dropdown items
            return;
          }
        }
      }
      
      // If no exact match, check if current path starts with any item URL (for nested routes)
      const partialMatch = items.find(item => 
        item.url !== '/' && item.url !== '#' && currentPath.startsWith(item.url)
      );
      if (partialMatch) {
        setActiveTab(partialMatch.name);
      }
    };

    updateActiveTab();
    
    // Listen for route changes
    window.addEventListener('popstate', updateActiveTab);
    return () => window.removeEventListener('popstate', updateActiveTab);
  }, [items]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleDropdownToggle = (itemName: string, e?: React.MouseEvent) => {
    // Stop propagation if event is provided
    if (e) {
      e.stopPropagation();
    }
    
    if (openDropdown === itemName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(itemName);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    // Don't close if clicking on a dropdown toggle button
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-toggle]')) {
      return;
    }
    setOpenDropdown(null);
  };

  useEffect(() => {
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-white/40 to-white/30 backdrop-blur-xl dark:from-gray-900/80 dark:to-gray-900/70",
          className,
        )}
      >
        <div className="container mx-auto px-8 md:px-12 lg:px-16">
          <div className="flex items-center h-20">
            {/* Logo with Link */}
            <a 
              href="/" 
              className="flex items-center flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            >
              <img 
                src="/assets/logo.png" 
                alt="CyberShield Logo" 
                className="h-12 w-auto md:h-14"
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-grow gap-3">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name
                const hasChildren = item.children && item.children.length > 0
                const isDropdownOpen = openDropdown === item.name
                const isHovered = hoveredItem === item.name

                return (
                  <div 
                    key={item.name} 
                    className="relative" 
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {hasChildren ? (
                      <div className="relative">
                        <button
                          onClick={(e) => handleDropdownToggle(item.name, e)}
                          data-dropdown-toggle="true"
                          className={cn(
                            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-all duration-300 flex items-center",
                            "text-gray-700 hover:text-[#f28749] hover:bg-white/50",
                            "dark:text-gray-200 dark:hover:text-[#f28749] dark:hover:bg-gray-800/50",
                            isActive && "bg-white/50 text-[#f28749] shadow-sm dark:bg-gray-800/50",
                          )}
                        >
                          <span>{item.name}</span>
                          <ChevronDown size={16} className={`ml-1 transition-transform ${(isDropdownOpen || isHovered) ? 'rotate-180' : ''}`} />
                          {isActive && (
                            <motion.div
                              layoutId="lamp"
                              className="absolute inset-0 w-full bg-[#f28749]/5 dark:bg-[#f28749]/10 rounded-full -z-10"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            >
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#f28749] rounded-t-full">
                                <div className="absolute w-12 h-6 bg-[#f28749]/20 rounded-full blur-md -top-2 -left-2" />
                                <div className="absolute w-8 h-6 bg-[#f28749]/20 rounded-full blur-md -top-1" />
                                <div className="absolute w-4 h-4 bg-[#f28749]/20 rounded-full blur-sm top-0 left-2" />
                              </div>
                            </motion.div>
                          )}
                        </button>
                        
                        {/* Dropdown Menu - Show on hover or click */}
                        <AnimatePresence>
                          {(isDropdownOpen || isHovered) && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20"
                            >
                              {/* Colorful top indicator line */}
                              <div className="h-1 w-full bg-gradient-to-r from-[#f28749] via-[#f28749]/80 to-[#f28749]"></div>
                              
                              <div className="py-2">
                                {item.children?.map((child) => {
                                  const ChildIcon = child.icon
                                  return (
                                    <a
                                      key={child.name}
                                      href={child.url}
                                      onClick={() => {
                                        setActiveTab(child.name)
                                        setOpenDropdown(null)
                                      }}
                                      className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#f28749] dark:hover:text-[#f28749]"
                                    >
                                      <ChildIcon size={18} className="mr-2" />
                                      <span>{child.name}</span>
                                    </a>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <a
                        href={item.url}
                        onClick={() => setActiveTab(item.name)}
                        className={cn(
                          "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-all duration-300",
                          "text-gray-700 hover:text-[#f28749] hover:bg-white/50",
                          "dark:text-gray-200 dark:hover:text-[#f28749] dark:hover:bg-gray-800/50",
                          isActive && "bg-white/50 text-[#f28749] shadow-sm dark:bg-gray-800/50",
                        )}
                      >
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="lamp"
                            className="absolute inset-0 w-full bg-[#f28749]/5 dark:bg-[#f28749]/10 rounded-full -z-10"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          >
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#f28749] rounded-t-full">
                              <div className="absolute w-12 h-6 bg-[#f28749]/20 rounded-full blur-md -top-2 -left-2" />
                              <div className="absolute w-8 h-6 bg-[#f28749]/20 rounded-full blur-md -top-1" />
                              <div className="absolute w-4 h-4 bg-[#f28749]/20 rounded-full blur-sm top-0 left-2" />
                            </div>
                          </motion.div>
                        )}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Theme Toggle */}
            <div className="ml-auto md:ml-4">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-[#f28749] dark:hover:text-[#f28749] transition-colors ml-4 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99] pt-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm overflow-y-auto"
          >
            <div className="container mx-auto px-8 py-6">
              <div className="flex flex-col space-y-4">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.name
                  const hasChildren = item.children && item.children.length > 0
                  const isDropdownOpen = openDropdown === item.name

                  return (
                    <div key={item.name} className="w-full">
                      {hasChildren ? (
                        <div className="w-full">
                          <button
                            onClick={(e) => handleDropdownToggle(item.name, e)}
                            data-dropdown-toggle="true"
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-lg",
                              "text-gray-700 dark:text-gray-200",
                              isActive && "bg-white/50 dark:bg-gray-800/50 text-[#f28749]",
                            )}
                          >
                            <div className="flex items-center">
                              <Icon size={20} className="mr-3" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronDown
                              size={20}
                              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-10 py-2 space-y-2">
                                  {item.children?.map((child) => {
                                    const ChildIcon = child.icon
                                    return (
                                      <a
                                        key={child.name}
                                        href={child.url}
                                        onClick={() => {
                                          setActiveTab(child.name)
                                          setIsMenuOpen(false)
                                          setOpenDropdown(null)
                                        }}
                                        className="flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#f28749] dark:hover:text-[#f28749]"
                                      >
                                        <ChildIcon size={18} className="mr-3" />
                                        <span>{child.name}</span>
                                      </a>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <a
                          href={item.url}
                          onClick={() => {
                            setActiveTab(item.name)
                            setIsMenuOpen(false)
                          }}
                          className={cn(
                            "flex items-center p-4 rounded-lg",
                            "text-gray-700 dark:text-gray-200",
                            isActive && "bg-white/50 dark:bg-gray-800/50 text-[#f28749]",
                          )}
                        >
                          <Icon size={20} className="mr-3" />
                          <span className="font-medium">{item.name}</span>
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})
