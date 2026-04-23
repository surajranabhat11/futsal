"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, MessageSquare, Star, Users, Trophy, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="relative w-full py-16 md:py-28 lg:py-36 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 dark:bg-green-900/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl" />
          </div>

          <div className="container relative px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-medium px-3 py-1 rounded-full">
                  <Zap className="h-3.5 w-3.5" />
                  Nepal's Futsal Community
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight">
                  Find Futsal Players &{" "}
                  <span className="text-green-600 dark:text-green-400">Opponents</span>{" "}
                  Near You
                </h1>
                <p className="max-w-[560px] text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  Connect with futsal players in your area, organize matches, and enjoy the game. Our platform makes it easy to find teammates and opponents.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button size="lg" variant="outline" className="px-8">
                      Learn More
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-8 pt-2">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">500+</p>
                    <p className="text-sm text-gray-500">Active Players</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">100+</p>
                    <p className="text-sm text-gray-500">Matches Played</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">20+</p>
                    <p className="text-sm text-gray-500">Venues</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[540px]">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-20" />
                  <Image
                    src="/futsal.jpeg"
                    alt="Futsal players in action"
                    className="relative rounded-2xl object-cover shadow-2xl w-full h-[380px]"
                    width={540}
                    height={380}
                  />
                  <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg px-4 py-3 flex items-center gap-2">
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Match Ready</p>
                      <p className="text-xs text-gray-500">Find a game today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-3 mb-14">
              <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">Simple Process</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
              <p className="max-w-[600px] mx-auto text-gray-500 dark:text-gray-400 text-lg">
                Our platform makes it easy to connect with futsal players and teams in your area.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, title: "Create Profile", desc: "Sign up and create your player profile with your skills and preferences.", step: "01" },
                { icon: MapPin, title: "Find Matches", desc: "Discover matches and players in your area based on your location.", step: "02" },
                { icon: MessageSquare, title: "Connect", desc: "Chat with other players and teams to organize matches.", step: "03" },
                { icon: Star, title: "Rate & Review", desc: "After matches, provide feedback to improve the community experience.", step: "04" },
              ].map(({ icon: Icon, title, desc, step }) => (
                <div key={step} className="group relative flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900">
                  <span className="absolute top-4 right-4 text-5xl font-black text-gray-50 dark:text-gray-800 select-none group-hover:text-green-50 dark:group-hover:text-green-950 transition-colors">
                    {step}
                  </span>
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-3 mb-14">
              <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">Why Choose Us</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Verified Players", desc: "All players are verified to ensure a safe and trusted community experience." },
                { icon: Zap, title: "Instant Matching", desc: "Our smart system matches you with compatible players and teams instantly." },
                { icon: Trophy, title: "Track Progress", desc: "Track your match history, ratings, and progress over time." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                  <div className="shrink-0 h-10 w-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 md:py-24 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6 text-center space-y-6">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Play?</h2>
            <p className="max-w-[500px] mx-auto text-green-100 text-lg">
              Join hundreds of futsal players already using our platform to find matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 px-8 font-semibold">
                  Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-green-700 px-8">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
