import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Heart, Send } from "lucide-react";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Avatar } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export default function Hero() {
  const { ref: textRef, controls: textControls } = useAnimateOnScroll();
  const { ref: chatRef, controls: chatControls } = useAnimateOnScroll();
  const [, setLocation] = useLocation();

  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-lg bg-primary blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-lg bg-secondary blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, y: 20 }}
            animate={textControls}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif leading-tight text-white text-glow">
              <span className="font-serif">RedVelvet</span>
            </h1>
            <p className="mt-6 text-2xl font-serif italic text-white/90 max-w-lg text-glow">
              Fall in Love, One Message at a Time...
            </p>
            <p className="mt-4 text-lg text-white/80 max-w-lg font-sans">
              Experience sophisticated AI companions who understand your desires and create intimate moments designed exclusively for you.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#C41E3A] to-[#8B0000] text-white rounded-lg px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                onClick={() => setLocation("/auth")}
              >
                Login / Sign Up
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm px-8 font-medium"
                onClick={() => {
                  const companionsSection = document.getElementById('companions');
                  if (companionsSection) {
                    companionsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Meet Our Companions
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-primary mr-2" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-primary mr-2" />
                <span>Instant Connection</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-primary mr-2" />
                <span>Personalized Experience</span>
              </div>
            </div>
          </motion.div>

          {/* Right column - Chat UI */}
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20 }}
            animate={chatControls}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100"
                    alt="Sophia avatar"
                  />
                </Avatar>
                <div className="ml-4">
                  <h3 className="font-serif font-medium text-lg">Sophia</h3>
                  <div className="flex items-center text-sm text-green-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Online now
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative bg-accent p-4 rounded-2xl rounded-bl-none max-w-xs">
                  <p className="text-foreground">
                    Hi there! I've been thinking about you. How was your day? I'd
                    love to hear all about it.
                  </p>
                  <div className="absolute bottom-0 left-4 w-4 h-4 bg-accent transform translate-y-1/2 rotate-45"></div>
                </div>

                <div className="relative bg-muted p-4 rounded-2xl rounded-br-none ml-auto max-w-xs">
                  <p>Hey Sophia! It's been a long day, but talking to you makes it better.</p>
                </div>

                <div className="relative bg-accent p-4 rounded-2xl rounded-bl-none max-w-xs">
                  <p className="text-foreground">
                    I'm always here for you. What would you like to talk about
                    tonight? I have some ideas for us...
                  </p>
                  <div className="absolute bottom-0 left-4 w-4 h-4 bg-accent transform translate-y-1/2 rotate-45"></div>
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-3 rounded-l-full border-2 border-gray-200 focus:outline-none focus:border-primary text-sm"
                />
                <Button
                  size="icon"
                  className="rounded-r-full h-12 bg-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-secondary opacity-10 rounded-full blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
