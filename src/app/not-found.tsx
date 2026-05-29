"use client";

import { ArrowLeftIcon, GhostIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 4,
            ease: "easeInOut",
          }}
        >
          <GhostIcon
            weight="duotone"
            className="w-32 h-32 text-primary relative z-10"
          />
        </motion.div>
      </motion.div>

      <motion.h1
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="text-5xl md:text-7xl font-black tracking-tight mb-4"
      >
        404
      </motion.h1>
      <motion.h2
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="text-xl md:text-2xl font-bold mb-4 opacity-90"
      >
        Page Not Found
      </motion.h2>

      <motion.p
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed"
      >
        The link you followed may be broken, or the page may have been removed.
        If it's a user profile, they might have changed their username.
      </motion.p>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 font-semibold transition-transform hover:scale-105 active:scale-95"
        >
          <Link href="/">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
