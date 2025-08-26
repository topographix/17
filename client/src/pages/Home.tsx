import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Companions from "@/components/Companions";
import Experience from "@/components/Experience";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PreferenceModal from "@/components/PreferenceModal";
import WelcomePopup from "@/components/WelcomePopup";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

type Preference = "male" | "female" | "both" | null;

export default function Home() {
  const [, setLocation] = useLocation();
  const [preference, setPreference] = useState<Preference>(null);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const { user } = useAuth();

  // Fetch guest session for non-logged-in users
  const { data: guestSession } = useQuery<{
    sessionId: string;
    preferredGender: string;
    messageDiamonds: number;
    accessibleCompanionIds: number[];
  }>({
    queryKey: ['/api/guest/session'],
    enabled: !user,
    retry: false,
  });
  
  // Check for stored preference or show modal on first visit
  useEffect(() => {
    // For testing purposes (remove in production):
    // localStorage.removeItem("companionPreference");
    
    const storedPreference = localStorage.getItem("companionPreference") as Preference | null;
    console.log("INIT: Stored preference from localStorage:", storedPreference);
    
    if (storedPreference) {
      console.log("INIT: Using stored preference", storedPreference);
      setPreference(storedPreference);
    } else {
      console.log("INIT: No preference found, setting default to 'both'");
      setPreference("both");
      localStorage.setItem("companionPreference", "both");
      // Don't show modal, just set default preference
    }
  }, []);

  // Show welcome popup for new guest users on home page
  useEffect(() => {
    if (!user && guestSession && !localStorage.getItem('welcomeShown')) {
      setShowWelcomePopup(true);
      localStorage.setItem('welcomeShown', 'true');
    }
  }, [user, guestSession]);
  
  // Handle preference selection
  const handlePreferenceSelected = (selected: Preference) => {
    console.log("PREFERENCE SELECTED:", selected);
    setPreference(selected);
    setShowPreferenceModal(false); // Ensure modal closes
    localStorage.setItem("companionPreference", selected || "both");
    console.log("PREFERENCE SAVED TO LOCALSTORAGE:", localStorage.getItem("companionPreference"));
    setShowPreferenceModal(false); // Explicitly close the modal
  };
  
  // Smooth scrolling setup
  useEffect(() => {
    const handleClick = (e: Event) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLAnchorElement;
      const targetId = target.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    };
    
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", handleClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.removeEventListener("click", handleClick);
      });
    };
  }, []);

  // Quick Chat Options based on preference
  const getQuickChatOptions = () => {
    switch (preference) {
      case "male":
        return (
          <>
            <Button
              variant="outline"
              className="text-white border-white/50 hover:bg-white/20"
              onClick={() => setLocation("/chat/5")}
            >
              Chat with James
            </Button>
          </>
        );
      case "female":
        return (
          <>
            <Button
              variant="outline"
              className="text-white border-white/50 hover:bg-white/20"
              onClick={() => setLocation("/chat/3")}
            >
              Chat with Emma
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/50 hover:bg-white/20"
              onClick={() => setLocation("/chat/4")}
            >
              Chat with Ava
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/50 hover:bg-white/20"
              onClick={() => setLocation("/chat/1")}
            >
              Chat with Sophia
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button
              variant="outline"
              className="text-white border-white/50 hover:bg-white/20"
              onClick={() => setLocation("/chat/3")}
            >
              Chat with Emma
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/50 hover:bg-white/20"
              onClick={() => setLocation("/chat/5")}
            >
              Chat with James
            </Button>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Navbar />

      

      
      <Hero />
      <Features />
      
      {/* Pass preference to Companions component */}
      <Companions preferredGender={preference} />
      
      <Experience />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
      
      {/* Preference selection modal */}
      <PreferenceModal 
        open={showPreferenceModal}
        onOpenChange={setShowPreferenceModal}
        onPreferenceSelected={handlePreferenceSelected}
      />

      {/* Welcome popup for new guest users */}
      <WelcomePopup 
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        diamonds={guestSession?.messageDiamonds || 25}
      />
    </motion.div>
  );
}
