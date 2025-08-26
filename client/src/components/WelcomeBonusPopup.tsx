import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Diamond, Sparkles, Gift, X } from "lucide-react";
import confetti from 'canvas-confetti';

interface WelcomeBonusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  diamondAmount: number;
  userName?: string;
}

export default function WelcomeBonusPopup({ 
  isOpen, 
  onClose, 
  diamondAmount, 
  userName 
}: WelcomeBonusPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation when popup opens
      setTimeout(() => {
        setShowConfetti(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E91E63', '#F8BBD9', '#FCE4EC', '#AD1457']
        });
      }, 500);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-8 text-white text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-4 animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="absolute top-8 right-6 animate-pulse delay-300">
                <Gift className="h-5 w-5" />
              </div>
              <div className="absolute bottom-4 left-8 animate-pulse delay-500">
                <Diamond className="h-4 w-4" />
              </div>
              <div className="absolute bottom-6 right-4 animate-pulse delay-700">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4">
                <Gift className="h-12 w-12 mx-auto mb-3" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome{userName ? ` ${userName}` : ''}!
              </h2>
              <p className="text-pink-100 text-sm">
                Thank you for joining RedVelvet
              </p>
            </motion.div>
          </div>

          {/* Main content */}
          <div className="px-6 py-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Diamond display */}
              <div className="mb-6">
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full mb-4"
                  animate={{ 
                    scale: showConfetti ? [1, 1.1, 1] : 1,
                    rotate: showConfetti ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Diamond className="h-10 w-10 text-pink-600 fill-current" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    +{diamondAmount}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Welcome Bonus Diamonds
                  </p>
                </motion.div>
              </div>

              {/* Benefits text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-6 space-y-2"
              >
                <p className="text-gray-700 font-medium">
                  Your diamonds are ready to use!
                </p>
                <p className="text-gray-500 text-sm">
                  Chat with AI companions, unlock premium features, and enjoy personalized conversations.
                </p>
              </motion.div>

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white py-3 font-medium"
                >
                  Start Chatting
                  <Diamond className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative footer */}
          <div className="h-2 bg-gradient-to-r from-pink-600 to-pink-700"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}