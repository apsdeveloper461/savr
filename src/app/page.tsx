"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Lock, Shield, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <header className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black">
              S
            </div>
            Savr
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Log in
            </Link>
            <Button asChild className="rounded-full">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 dark:from-white dark:via-zinc-400 dark:to-white"
              variants={itemVariants}
            >
              Master your money with simplistic clarity.
            </motion.h1>
            <motion.p
              className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400"
              variants={itemVariants}
            >
              Track accounts, manage saving goals, and visualize your financial health without the clutter.
              Designed for modern life.
            </motion.p>
            <motion.div
              className="mt-10 flex items-center justify-center gap-x-6"
              variants={itemVariants}
            >
              <Button asChild size="lg" className="rounded-full h-12 px-8 text-base">
                <Link href="/register">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/dashboard" // Assuming dashboard is accessible or redirects to login
                className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100"
              >
                Live Demo <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            className="mx-auto mt-24 max-w-7xl sm:mt-32 lg:mt-40"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, idx) => (
                <div key={idx} className="relative pl-16">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Social Proof / Dashboard Preview */}
          <motion.div
            className="relative mt-24 overflow-hidden rounded-3xl bg-zinc-900 px-6 pb-9 pt-64 shadow-2xl sm:px-12 lg:px-8 lg:pb-8 xl:px-10 xl:pb-10 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-zinc-50/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Your finances, unified.</h2>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">See all your bank accounts, cash wallets, and saving goals in one single, beautiful view.</p>
                <Button variant="secondary" asChild>
                  <Link href="/register">Create your account</Link>
                </Button>
              </div>
            </div>
            {/* Abstract UI representation */}
            <div className="opacity-30 blur-sm scale-110 pointer-events-none select-none" aria-hidden="true">
              {/* This could be a screenshot image or mock dashboard */}
              <div className="grid grid-cols-3 gap-4 p-8">
                <div className="h-32 bg-zinc-800 rounded-xl"></div>
                <div className="h-32 bg-zinc-800 rounded-xl"></div>
                <div className="h-32 bg-zinc-800 rounded-xl"></div>
                <div className="col-span-2 h-64 bg-zinc-800 rounded-xl"></div>
                <div className="h-64 bg-zinc-800 rounded-xl"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="mt-24 border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Savr. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-sm text-zinc-400">Privacy</span>
            <span className="text-sm text-zinc-400">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    name: 'Multi-Account Tracking',
    description: 'Manage bank accounts, cash, and digital wallets in one centralized dashboard.',
    icon: Wallet,
  },
  {
    name: 'Saving Goals',
    description: 'Set targets for what matters. Visual progress bars keep you motivated.',
    icon: BarChart3,
  },
  {
    name: 'Bank-Grade Security',
    description: 'Your data is encrypted and secure. We prioritize your privacy above all.',
    icon: Shield,
  },
  {
    name: 'Private by Design',
    description: 'No ads, no selling data. Your financial life belongs to you alone.',
    icon: Lock,
  },
]
