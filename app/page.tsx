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
        <section className="hero-section py-20 md:py-28 lg:py-36 relative">
          <div className="max-w-6xl mx-auto px-5 relative z-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
              <div className="space-y-7">
                <span className="hero-badge inline-flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  Nepal's Futsal Community
                </span>
                <h1 className="hero-heading text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-balance">
                  Find Players &amp;{" "}
                  <span className="hero-accent">Opponents</span>{" "}
                  Near You
                </h1>
                <p className="hero-desc text-lg leading-relaxed max-w-[500px]">
                  Connect with futsal players in your area, organize matches, and enjoy the beautiful game — no more last-minute scrambles for a fifth player.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row pt-1">
                  <Link href="/signup">
                    <Button size="lg" className="gap-2 px-7 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button size="lg" variant="outline" className="px-7 border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      Learn More
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-10 pt-4">
                  {[
                    { value: "500+", label: "Active Players" },
                    { value: "100+", label: "Matches Played" },
                    { value: "20+", label: "Venues" },
                  ].map((stat) => (
                    <div key={stat.label} className="stat-pill">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[520px]">
                  <div className="hero-image-wrapper">
                    <Image
                      src="/futsal.jpeg"
                      alt="Futsal players in action"
                      className="w-full h-[380px] object-cover"
                      width={540}
                      height={380}
                    />
                  </div>
                  <div className="floating-card absolute -bottom-5 -left-4">
                    <div className="h-9 w-9 bg-accent/20 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="floating-title text-xs font-bold">Match Ready</p>
                      <p className="floating-sub text-xs">Find a game today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 md:py-28 bg-background">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center space-y-3 mb-14">
              <p className="section-label">Simple Process</p>
              <h2 className="section-title">How It Works</h2>
              <p className="section-desc mx-auto">
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
                <div key={step} className="step-card flex flex-col items-center text-center space-y-4">
                  <span className="step-number">{step}</span>
                  <div className="step-icon">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center space-y-3 mb-14">
              <p className="section-label">Why Choose Us</p>
              <h2 className="section-title">Everything You Need</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Verified Players", desc: "All players are verified to ensure a safe and trusted community experience." },
                { icon: Zap, title: "Instant Matching", desc: "Our smart system matches you with compatible players and teams instantly." },
                { icon: Trophy, title: "Track Progress", desc: "Track your match history, ratings, and progress over time." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="feature-card">
                  <div className="feature-icon">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold mb-1 text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-5 text-center space-y-6 relative z-10">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground sm:text-4xl">Ready to Play?</h2>
            <p className="max-w-[500px] mx-auto text-primary-foreground/70 text-lg">
              Join hundreds of futsal players already using our platform to find matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 font-bold">
                  Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 px-8">
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
