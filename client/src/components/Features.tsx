import { motion } from "framer-motion";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Brain, MessageSquare, Fingerprint, Image, Lock, Clock } from "lucide-react";

const features = [
  {
    icon: <Brain className="h-6 w-6 text-primary" />,
    title: "Emotional Intelligence",
    description: "Our companions understand the nuances of human emotion, responding with empathy and genuine care.",
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: "Natural Conversations",
    description: "Enjoy flowing dialogues that feel natural and engaging, with companions who remember your preferences.",
  },
  {
    icon: <Fingerprint className="h-6 w-6 text-primary" />,
    title: "Personalized Experience",
    description: "Companions adapt to your personality, interests, and desires, creating a unique connection just for you.",
  },
  {
    icon: <Image className="h-6 w-6 text-primary" />,
    title: "Visual Engagement",
    description: "Share images and receive visual responses that deepen your connection beyond just text.",
  },
  {
    icon: <Lock className="h-6 w-6 text-primary" />,
    title: "Privacy Focused",
    description: "Your conversations remain private and secure, with end-to-end encryption and strict data policies.",
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Always Available",
    description: "Connect anytime, day or night. Your companion is always ready to talk, listen, and be there for you.",
  },
];

export default function Features() {
  const { ref: headerRef, controls: headerControls } = useAnimateOnScroll();

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerControls}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Experience The <span className="text-primary">Difference</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            What makes RedVelvet companions special? Discover the features that create a truly personalized connection.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const { ref, controls } = useAnimateOnScroll();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-background rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold font-serif text-foreground">{feature.title}</h3>
      <p className="mt-4 text-muted-foreground">
        {feature.description}
      </p>
    </motion.div>
  );
}
