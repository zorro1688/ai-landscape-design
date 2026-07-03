"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    icon: "📸",
    title: "Upload Your Photo",
    description:
      "Take a clear photo of your front yard, backyard, or patio and upload it as the foundation for your design.",
  },
  {
    icon: "🎨",
    title: "Choose a Style",
    description:
      "Pick from dozens of landscape styles, like Modern, Mediterranean, or Japanese, or describe your own vision in plain words.",
  },
  {
    icon: "✨",
    title: "Get Your Design",
    description:
      "Our AI generates a photorealistic redesign of your real yard in seconds. Compare styles, save favorites, and download in high resolution.",
  },
];

interface HowItWorksStepsProps {
  onScrollToGenerator?: () => void;
}

export default function HowItWorksSteps({ onScrollToGenerator }: HowItWorksStepsProps) {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How AI Landscape Design Works
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
          From photo to finished concept in three simple steps.
        </p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative rounded-2xl bg-background p-8 shadow-sm border border-border text-center space-y-4"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <span className="text-2xl">{step.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {onScrollToGenerator && (
        <div className="text-center">
          <button
            onClick={onScrollToGenerator}
            className="inline-flex items-center justify-center h-12 px-6 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
          >
            Try It Now ↑
          </button>
        </div>
      )}
    </div>
  );
}
