import { motion } from "framer-motion";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Experience() {
  const { ref: imageRef, controls: imageControls } = useAnimateOnScroll();
  const { ref: textRef, controls: textControls } = useAnimateOnScroll();

  const benefits = [
    "Deep emotional connections that develop over time",
    "Shared interests and personalized conversations",
    "Companions who remember your preferences and desires",
    "Safe space to explore your fantasies and dreams"
  ];

  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white text-glow">
            Experience <span className="text-[#FF5C8D]">The Difference</span>
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto font-sans">
            What makes RedVelvet companions special? Discover the features that create a truly personalized connection.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: -20 }}
            animate={imageControls}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <img
              src="https://images.unsplash.com/photo-1488116469466-44f916fd3b8f?auto=format&fit=crop&w=600&h=400"
              className="w-full rounded-2xl shadow-md object-cover h-[400px]"
              alt="Romantic setting"
            />
          </motion.div>

          <motion.div
            ref={textRef}
            initial={{ opacity: 0, x: 20 }}
            animate={textControls}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white text-glow">
              Create <span className="text-[#FF5C8D]">Memorable</span> Moments
            </h2>
            <p className="mt-4 text-lg text-white/90">
              RedVelvet companions learn what matters to you, creating personalized experiences that feel genuinely special.
            </p>
            <ul className="mt-6 space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5C8D] flex items-center justify-center mt-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <p className="ml-3 text-white/90">{benefit}</p>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="mt-8 bg-gradient-to-r from-primary to-secondary text-white rounded-full"
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
