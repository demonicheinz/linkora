"use client";

import {
  ArrowCounterClockwiseIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
      }}
      className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6 text-center select-none"
    >
      <motion.div
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", bounce: 0.5 },
          },
        }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <WarningCircleIcon
            weight="duotone"
            className="w-32 h-32 text-destructive relative z-10"
          />
        </motion.div>
      </motion.div>

      <motion.h1
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="text-3xl md:text-5xl font-black tracking-tight mb-4"
      >
        Something went wrong
      </motion.h1>

      <motion.p
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed"
      >
        We've encountered an unexpected error. Our system has logged the issue
        and we'll look into it. Please try again or go back to home.
      </motion.p>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="flex gap-4 items-center"
      >
        <Button
          onClick={() => reset()}
          size="lg"
          className="rounded-full px-8 font-semibold transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowCounterClockwiseIcon className="w-5 h-5 mr-2" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}
