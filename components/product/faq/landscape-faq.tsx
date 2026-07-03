"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

// Answers are written to naturally include the primary keyword
// ("AI landscape design") and secondary keywords ("AI landscape design
// generator", "AI garden design", "backyard design AI", "virtual landscape
// design") used across the homepage copy, for on-page SEO consistency.
const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is an AI landscape design generator?",
    answer:
      "An AI landscape design generator is a tool that turns a photo of your yard into a new, photorealistic design using artificial intelligence. Instead of starting from a blank page, our AI landscape design tool analyzes your actual photo and generates a redesign that keeps your real structures, trees, and layout in place.",
  },
  {
    question: "Is this AI landscape design tool free to use?",
    answer:
      "Yes. You can generate your first AI landscape design for free with no sign-up required. After that, you can purchase credits to keep generating designs in different styles, with no subscription or expiration date.",
  },
  {
    question: "How accurate is the AI garden design to my real yard?",
    answer:
      "Because every design starts from your own uploaded photo, the AI garden design preserves your property's real layout, including existing structures, fences, and mature trees. The AI changes the landscaping, plants, and hardscape, not the bones of your space.",
  },
  {
    question: "Can I use this for backyard design as well as front yards?",
    answer:
      "Yes. Our AI backyard design and front yard tools work the same way — upload a photo of any outdoor space, including patios, side yards, or rooftop terraces, and choose a style to generate a virtual landscape design concept.",
  },
  {
    question: "What styles can I choose from?",
    answer:
      "You can choose from styles including Modern, Mediterranean, Japanese Zen, Tropical, English Garden, Minimalist, and Desert/Xeriscape, or describe your own vision in plain words and let the AI landscape design generator adapt it to your yard.",
  },
  {
    question: "Do landscaping professionals use this tool?",
    answer:
      "Many landscapers and designers use our AI landscape design tool during client consultations to quickly visualize ideas before committing to a full plan, which helps cut down on revisions and speeds up approval.",
  },
];

export default function LandscapeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about AI landscape design before you get started.
            </p>
          </motion.div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-background overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-foreground">{item.question}</span>
                    <span
                      className={cn(
                        "text-muted-foreground text-xl leading-none transition-transform shrink-0",
                        isOpen && "rotate-45"
                      )}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={cn(
                      "px-5 text-muted-foreground text-sm leading-relaxed transition-all overflow-hidden",
                      isOpen ? "max-h-60 pb-5 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    {item.answer}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQPage structured data for SEO rich results */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
