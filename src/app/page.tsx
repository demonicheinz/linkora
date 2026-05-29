"use client";

import {
  ArrowRightIcon,
  CalendarDotsIcon,
  ChartBarIcon,
  HeartIcon,
  ImagesIcon,
  PaletteIcon,
  PlayCircleIcon,
  ShareIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const username = process.env.NEXT_PUBLIC_USERNAME ?? "me";
const currentYear = new Date().getFullYear();

type User = {
  login: {
    uuid: string;
  };
  name: {
    first: string;
    last: string;
  };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
};

const avatarSkeletons = [
  { id: "avatar-skeleton-1" },
  { id: "avatar-skeleton-2" },
  { id: "avatar-skeleton-3" },
];

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(
          "https://randomuser.me/api/?results=3&seed=heinz",
        );
        const data = await res.json();

        setUsers(data.results);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }

    fetchUsers();
  }, []);
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white selection:bg-indigo-500/30">
      {/* ─── Noise texture overlay ─── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* ─── Background glows ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-700/8 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* ──────────── NAVBAR ──────────── */}
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={24} height={24} />
              <span className="font-heading text-lg font-700 tracking-tight">
                Linkora
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/${username}`}
              className="flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/90"
            >
              View profile
              <ShareIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-white/8 px-4 py-2 text-sm font-500 text-white/80 ring-1 ring-white/10 transition-all hover:bg-white/12 hover:text-white hover:ring-white/20"
            >
              Login
            </Link>
          </div>
        </nav>

        {/* ──────────── HERO ──────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-32 pt-24 md:pt-32 relative z-10 flex flex-col md:flex-row items-center gap-16 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="md:w-1/2 z-10 flex flex-col items-center text-center md:items-start md:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-6">
              <SparkleIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>New: Kinetic Templates Available</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl mb-6 leading-tight">
              Your entire online presence in{" "}
              <span className="bg-gradient-to-r from-[#4b22fc] to-[#0fcbfa] bg-clip-text text-transparent">
                one link.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg leading-relaxed text-white/60 mb-10 max-w-lg mx-auto md:mx-0">
              The most kinetic link-in-bio tool for creators and professionals.
              Consolidate your content, drive engagement, and analyze
              performance from a single, beautiful touchpoint.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-400 hover:-translate-y-1 transition-all text-center shadow-lg shadow-indigo-500/20"
              >
                Get Started for Free
              </Link>
              <Link
                href={`/${username}`}
                className="inline-flex items-center justify-center bg-transparent border border-white/10 text-white/80 font-semibold px-8 py-4 rounded-xl hover:bg-white/5 hover:text-white hover:-translate-y-1 transition-all text-center gap-2"
              >
                <PlayCircleIcon className="w-6 h-6" />
                Live Demo
              </Link>
            </div>

            {/* Trusted creators */}
            <div className="mt-12 flex items-center justify-center md:justify-start gap-4 text-white/50 text-sm w-full md:w-auto">
              <div className="flex -space-x-3">
                {users.length > 0
                  ? users.map((user) => (
                      <Avatar
                        key={user.login.uuid}
                        className="w-8 h-8 border-2 border-[#0c0c0e]"
                      >
                        <AvatarImage
                          src={user.picture.thumbnail}
                          alt={`${user.name.first} ${user.name.last}`}
                        />
                        <AvatarFallback>
                          {user.name.first[0]}
                          {user.name.last[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  : avatarSkeletons.map((item) => (
                      <Avatar
                        key={item.id}
                        className="w-8 h-8 border-2 border-[#0c0c0e]"
                      >
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    ))}
              </div>
              <p>
                Trusted by{" "}
                <strong className="text-white font-semibold">10,000+</strong>{" "}
                creators.
              </p>
            </div>
          </motion.div>

          {/* Right Side: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.4,
              delay: 0.2,
            }}
            className="md:w-1/2 relative z-10 w-full flex justify-center"
          >
            <div className="relative w-[300px] h-[600px] bg-white rounded-[40px] shadow-2xl border-[8px] border-neutral-200 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 ease-out">
              {/* Phone Mockup Content */}
              <div className="absolute top-0 w-full h-full bg-[#faf8ff] flex flex-col items-center pt-12 px-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4b22fc] to-[#0fcbfa] mb-4 shadow-md" />
                <h3 className="text-lg font-bold text-[#131b2e]">
                  Alex Rivera
                </h3>
                <p className="text-xs text-[#474557] mb-6">
                  Digital Creator &amp; Designer
                </p>

                <div className="w-full flex flex-col gap-3">
                  <div className="w-full bg-white border border-[#e2e8f0] rounded-xl p-4 flex items-center justify-between shadow-xs hover:scale-[1.02] transition-transform">
                    <span className="text-sm font-semibold text-[#131b2e]">
                      Latest Video
                    </span>
                    <ArrowRightIcon className="w-6 h-6 text-indigo-800" />
                  </div>
                  <div className="w-full bg-white border border-[#e2e8f0] rounded-xl p-4 flex items-center justify-between shadow-xs hover:scale-[1.02] transition-transform">
                    <span className="text-sm font-semibold text-[#131b2e]">
                      Design Portfolio
                    </span>
                    <ArrowRightIcon className="w-6 h-6 text-indigo-800" />
                  </div>
                  <div className="w-full bg-[#4b22fc] rounded-xl p-4 flex items-center justify-between shadow-md hover:scale-[1.02] transition-transform">
                    <span className="text-sm font-semibold text-white">
                      Book a Consultation
                    </span>
                    <CalendarDotsIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements around phone */}
            <div className="hidden sm:flex absolute top-1/4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-[#e2e8f0] items-center gap-3 animate-pulse z-20">
              <div className="w-10 h-10 rounded-lg bg-[#0fcbfa]/10 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-indigo-800" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#474557] uppercase tracking-wider">
                  Click Rate
                </p>
                <p className="text-lg font-bold text-[#131b2e]">+24%</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ──────────── FEATURES ──────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
          className="mx-auto max-w-6xl px-6 pb-24 relative z-10"
        >
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white mb-4 md:text-4xl tracking-tight">
              Everything you need to grow.
            </h2>
            <p className="text-lg text-white/60">
              Powerful tools disguised as a simple profile. Built for
              conversion, designed for expression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-white/3 border border-white/5 rounded-2xl p-8 hover:bg-white/6 hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <PaletteIcon className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Infinite Customization
              </h3>
              <p className="text-sm leading-relaxed text-white/50 flex-grow">
                Themes, fonts, and colors to match your brand perfectly. Don't
                settle for generic layouts when you can build a kinetic
                experience.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-white/3 border border-white/5 rounded-2xl p-8 hover:bg-white/6 hover:border-white/10 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full opacity-50 -z-10" />
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Deep Analytics
              </h3>
              <p className="text-sm leading-relaxed text-white/50 flex-grow">
                Track every click and understand your audience. Get actionable
                insights to optimize your links and drive more traffic.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-white/3 border border-white/5 rounded-2xl p-8 hover:bg-white/6 hover:border-white/10 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ImagesIcon className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Media Integration
              </h3>
              <p className="text-sm leading-relaxed text-white/50 flex-grow">
                Embed videos, music, podcasts, and social feeds directly onto
                your profile. Keep your audience engaged without them ever
                leaving your page.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* ──────────── CTA BAND ──────────── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="mx-auto max-w-6xl px-6 pb-24"
        >
          <div
            className="relative overflow-hidden rounded-2xl p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #3b0764 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 70% 50%, #818cf8 0%, transparent 50%)`,
              }}
            />

            <h2 className="font-heading relative text-3xl font-700 tracking-tight text-white md:text-4xl">
              Ready to share the link?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-base text-indigo-200/70">
              Login to dashboard to start managing your links and customizing
              your profile.
            </p>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-white px-6 py-3 text-sm font-600 text-indigo-900 shadow-lg transition-all hover:bg-indigo-50"
              >
                Log in to Dashboard
              </Link>
              <Link
                href={`/${username}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-500 text-white/80 transition-all hover:border-white/40 hover:text-white"
              >
                View Profile
                <ShareIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ──────────── FOOTER ──────────── */}
        <footer className="border-t border-white/6 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <p className="text-xs text-white/30">
              © {currentYear} Linkora. All rights reserved.
            </p>

            <p className="flex items-center gap-1 text-xs text-white/30">
              Made with{" "}
              <HeartIcon
                className="h-3.5 w-3.5 fill-red-500 animate-pulse"
                weight="fill"
              />{" "}
              <Link
                href="https://github.com/demonicheinz"
                className="transition-colors hover:text-white/70 font-bold"
              >
                Heinz
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
