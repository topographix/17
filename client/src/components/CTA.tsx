import { motion } from "framer-motion";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CTA() {
  const { ref, controls } = useAnimateOnScroll();
  const [, setLocation] = useLocation();

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            Begin Your <span className="text-accent">RedVelvet</span> Journey Today
          </h2>
          <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto">
            Experience meaningful connections that understand your desires, engage your mind, and create moments you'll treasure.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 rounded-full px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              onClick={() => setLocation("/signup")}
            >
              Create Your Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8"
              onClick={() => {
                const companionsSection = document.getElementById('companions');
                if (companionsSection) {
                  companionsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Explore Companions
            </Button>
          </div>
          
          {/* Quick Start Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button
              variant="ghost"
              className="bg-black/20 hover:bg-black/30 text-white border border-white/20 rounded-full"
              onClick={() => setLocation("/chat/3")}
            >
              Try Chat with Emma
            </Button>
            <Button
              variant="ghost"
              className="bg-black/20 hover:bg-black/30 text-white border border-white/20 rounded-full"
              onClick={() => setLocation("/chat/4")}
            >
              Try Chat with Ava
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
