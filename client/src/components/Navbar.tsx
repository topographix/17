import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Diamond } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DiamondCounter from "@/components/DiamondCounter";
import type { UserPreferences } from "@shared/schema";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Fetch user preferences to get diamond count
  const { data: userPrefs } = useQuery<UserPreferences>({
    queryKey: [`/api/user/preferences`],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U'; // Default to 'U' for User if no name is available
    
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-transparent border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setLocation("/")}
            >
              <span className="text-3xl font-bold text-white font-serif text-glow">
                RedVelvet
              </span>
            </div>
            

          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div 
              className="text-white hover:text-white/80 font-medium transition-colors h-10 flex items-center text-base cursor-pointer"
              onClick={() => setLocation("/companions")}
            >
              Companions
            </div>
            
            {/* Show dashboard link only for logged in users */}
            {user && (
              <div className="text-white hover:text-white/80 font-medium transition-colors h-10 flex items-center text-base cursor-pointer" onClick={() => setLocation("/dashboard")}>
                Dashboard
              </div>
            )}
            
            {/* Diamond counter for both registered and guest users */}
            <DiamondCounter className="text-white" />
            
            <Button
              variant="outline"
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 hover:from-yellow-300 hover:to-yellow-500 border-yellow-300 h-10 flex items-center px-4 font-semibold text-base text-glow-gold rounded-full shadow-lg"
              onClick={() => setLocation("/membership")}
            >
              👑 Premium
            </Button>
            
            {!user ? (
              <Button 
                className="bg-white hover:bg-white/90 text-[#E91E63] font-semibold rounded-lg h-10 px-6 text-base"
                onClick={() => setLocation("/auth")}
              >
                Login / Sign Up
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(user.fullName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/admin")}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#E91E63] shadow-md absolute w-full overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-4">
              <div
                className="block text-white hover:text-white/80 font-medium py-2 text-lg"
                onClick={() => {
                  setIsOpen(false);
                  setLocation("/companions");
                }}
              >
                Companions
              </div>
              
              {user && (
                <>
                  <div
                    className="block text-white hover:text-white/80 font-medium py-2 text-lg"
                    onClick={() => {
                      setIsOpen(false);
                      setLocation("/dashboard");
                    }}
                  >
                    Dashboard
                  </div>
                  <div
                    className="block text-white hover:text-white/80 font-medium py-2 text-lg"
                    onClick={() => {
                      setIsOpen(false);
                      setLocation("/admin");
                    }}
                  >
                    Admin Panel
                  </div>
                </>
              )}
              
              <Button
                variant="outline"
                className="w-full bg-white/20 text-white hover:bg-white/30 border-transparent justify-start h-12 font-medium text-lg"
                onClick={() => {
                  setIsOpen(false);
                  setLocation("/membership");
                }}
              >
                Premium
              </Button>
              
              {!user ? (
                <Button 
                  className="w-full bg-white hover:bg-white/90 text-[#E91E63] font-semibold rounded-lg h-12 text-lg"
                  onClick={() => {
                    setIsOpen(false);
                    setLocation("/auth");
                  }}
                >
                  Login / Sign Up
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full bg-white/20 text-white hover:bg-white/30 border-transparent justify-start h-12 font-medium text-lg"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
