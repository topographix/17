import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle } from "lucide-react";

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  diamonds: number;
}

export default function WelcomePopup({ isOpen, onClose, diamonds }: WelcomePopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-pink-500 animate-pulse" />
            Yay! Welcome to RedVelvet!
            <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="relative">
            <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {diamonds}
            </div>
            <div className="text-lg font-semibold text-gray-700 mt-2">
              FREE DIAMONDS! 💎
            </div>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="animate-bounce text-2xl">✨</div>
                <div className="animate-pulse text-xl absolute top-2 right-2">🎉</div>
                <div className="animate-bounce text-xl absolute bottom-2 left-2 delay-300">💫</div>
              </div>
            )}
          </div>
          
          <div className="text-gray-600 space-y-2">
            <p className="font-medium">Start chatting with our AI companions!</p>
            <p className="text-sm">Each message costs 1 diamond. Make them count! 💕</p>
          </div>
        </div>
        
        <Button 
          onClick={onClose}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Start Chatting Now!
        </Button>
        
        <div className="text-center mt-4 p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg border border-pink-200">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Want even more diamonds? 💎
          </p>
          <p className="text-xs text-gray-600 mb-2">
            <a 
              href="/auth" 
              className="font-bold text-pink-600 hover:text-pink-700 underline decoration-2 underline-offset-2 transition-colors"
            >
              Register now
            </a> and get <span className="font-bold text-pink-600">25 MORE FREE DIAMONDS</span> to keep chatting with your favorite companions!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}