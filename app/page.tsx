"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, MessageSquare, Star, Users } from "lucide-react"

export default function Home() {
  const [year, setYear] = useState("")

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Futsal Match Making System</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="#">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="#">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Find Futsal Players & Opponents Near You
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Connect with futsal players in your area, organize matches, and enjoy the game. Our platform makes it
                  easy to find teammates and opponents.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="#">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  src="/OIP.JPEG"
                  alt="Futsal players in action"
                  className="rounded-lg object-cover border border-gray-200 shadow-lg w-full max-w-[600px] h-[400px]"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform makes it easy to connect with futsal players and teams in your area.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {/* Item 1 */}
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Users className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Create Profile</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Sign up and create your player profile with your skills and preferences.
                </p>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Find Matches</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Discover matches and players in your area based on your location.
                </p>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Connect</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Chat with other players and teams to organize matches.
                </p>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Star className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Rate & Review</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  After matches, provide feedback to improve the community experience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center">
          <div className="flex gap-4">
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Contact Us
            </Link>
          </div>

          {/* FIXED HYDRATION ERROR */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {year} Futsal Opponent Matcher. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
