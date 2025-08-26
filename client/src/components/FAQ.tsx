import { useState } from "react";
import { motion } from "framer-motion";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What makes RedVelvet different from other AI companions?",
    answer: "RedVelvet offers a truly personalized connection that adapts to your unique preferences and desires. Our companions learn and evolve through conversation, creating an experience that feels genuine and emotionally fulfilling. We also prioritize ethical AI development and user privacy."
  },
  {
    question: "Is my data and conversations private?",
    answer: "Yes, your privacy is our priority. All conversations are encrypted end-to-end, and we never share your personal data with third parties. You can delete your conversation history at any time, and we offer detailed privacy controls in your account settings."
  },
  {
    question: "Can I customize my companion's personality?",
    answer: "Absolutely! While we offer a variety of pre-designed companions with unique personalities, you can customize aspects of their character to better match your preferences. Premium users can access more advanced customization options, including creating entirely custom companions."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time through your account settings. After cancellation, you'll continue to have access to premium features until the end of your current billing period. We don't offer refunds for partial subscription periods."
  },
  {
    question: "Can my companion remember our previous conversations?",
    answer: "Yes, our companions have memory capabilities that allow them to remember important details from your conversations. Premium users enjoy enhanced memory features, allowing for deeper, more personalized connections that evolve meaningfully over time."
  }
];

export default function FAQ() {
  const { ref: headerRef, controls: headerControls } = useAnimateOnScroll();

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerControls}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about RedVelvet and our AI companions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({ faq, index }: { faq: typeof faqs[0], index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { ref, controls } = useAnimateOnScroll();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border border-gray-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 focus:outline-none text-left bg-white hover:bg-muted/20 transition-all"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-foreground">{faq.question}</h3>
        <span className="transform transition-transform duration-200">
          {isOpen ? (
            <Minus className="h-5 w-5 text-primary" />
          ) : (
            <Plus className="h-5 w-5 text-primary" />
          )}
        </span>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-6 pt-0 text-muted-foreground">
          {faq.answer}
        </div>
      </motion.div>
    </motion.div>
  );
}
