"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, MessageSquare, Star, Users, Trophy, Shield, Zap } from "lucide-react"
import { gsap } from "@/lib/gsap"
import { useGSAP } from "@gsap/react"
import { useLoading } from "@/contexts/loading-context"

export default function Home() {
  const container = useRef<HTMLDivElement>(null)
  const { isLoading } = useLoading()

  useGSAP(
    () => {
      if (isLoading) return

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(".hero-badge", { opacity: 0, y: 20, duration: 1 })
        .from(".hero-heading", { opacity: 0, y: 30, duration: 1 }, "-=0.6")
        .from(".hero-desc", { opacity: 0, y: 20, duration: 1 }, "-=0.7")
        .from(".hero-btns", { opacity: 0, y: 20, duration: 1 }, "-=0.7")
        .from(".stat-pill", { opacity: 0, scale: 0.8, stagger: 0.1, duration: 0.6 }, "-=0.5")
        .from(".hero-image-wrapper", { opacity: 0, x: 50, duration: 0.8 }, "-=1")
        .from(".floating-card", { opacity: 0, scale: 0, duration: 0.8 }, "-=0.5")

      gsap.from(".feature-card", {
        scrollTrigger: { trigger: ".features-grid", start: "top 85%" },
        opacity: 0,
        scale: 0.9,
        y: 30,
        stagger: 0.15,
        duration: 0.7,
        ease: "back.out(1.7)",
      })

      gsap.from(".cta-content", {
        scrollTrigger: { trigger: ".cta-section", start: "top 80%" },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      })
    },
    { scope: container, dependencies: [isLoading] },
  )

  const steps = [
    {
      icon: Users,
      title: "Create Profile",
      desc: "Sign up and build your player profile — set your position, skill level, and the areas you play in.",
      step: "01",
      image: "man-using-computer.jpg",
    },
    {
      icon: MapPin,
      title: "Find Matches",
      desc: "Browse open games near you, filtered by time, venue, and how many spots are left.",
      step: "02",
      image: "playing-football.jpg",
    },
    {
      icon: MessageSquare,
      title: "Connect",
      desc: "Message players and team organisers directly to confirm your spot or fill an empty slot fast.",
      step: "03",
      image: "messaging.jpg",
    },
    {
      icon: Star,
      title: "Rate & Review",
      desc: "After the game, rate your teammates. Build a reputation that gets you more invites.",
      step: "04",
      image: "review.jpg",
    },
  ]

  return (
    <>

      <div ref={container} className="flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1">

          {/* ── HERO ── */}
          <section className="hero-section py-20 md:py-28 lg:py-36 relative">
            <div className="max-w-6xl mx-auto px-5 relative z-10">
              <div className="grid gap-10 lg:grid-cols-1 lg:gap-14 items-center">
                <div className="space-y-7">
                  <span className="hero-badge inline-flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" />
                    Nepal's Futsal Community
                  </span>
                  <h1 className="hero-heading text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-balance">
                    Find Players & <span className="hero-accent">Opponents</span> Near You
                  </h1>
                  <p className="hero-desc text-lg leading-relaxed max-w-[500px]">
                    Connect with futsal players in your area, organise matches, and enjoy the beautiful game — no more
                    last-minute scrambles for a fifth player.
                  </p>
                  <div className="hero-btns flex flex-col gap-3 sm:flex-row pt-1">
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
                      { value: "20+",  label: "Venues" },
                    ].map((stat) => (
                      <div key={stat.label} className="stat-pill">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end hidden">
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

          {/* ── HOW IT WORKS ── */}
          <section className="py-20 md:py-28 bg-background">
            <div className="max-w-6xl mx-auto px-5">

              {/* Section header */}
              <div className="text-center space-y-3 mb-14">
                <p className="section-label">Simple Process</p>
                <h2 className="section-title">How It Works</h2>
              </div>

              {/* Flip cards grid */}
              <div className="steps-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map(({ icon: Icon, title, desc, step, image }) => (
                  <div
                    key={step}
                    className="step-card flip-card"
                    style={{ height: "320px", padding: 0 }}
                  >
                    <div className="flip-card-inner shadow-md">

                      {/* ── FRONT ── image + step number + title */}
                      <div className="flip-card-front">
                        {/* Background image */}
                        <Image
                          src={image}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />

                        {/* Dark gradient overlay so text is legible */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                        {/* Icon + title — bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                          <div className="w-10 h-10 rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
                        </div>
                      </div>

                      {/* ── BACK ── description */}
                      <div className="flip-card-back flex flex-col justify-between p-6">
                        {/* Step number */}
                        <span className="text-xs font-bold tracking-widest text-accent-foreground/50 select-none">
                          {step}
                        </span>

                        {/* Icon centred */}
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className="w-14 h-14 rounded-full bg-accent-foreground/10 flex items-center justify-center ring-1 ring-accent-foreground/20">
                            <Icon className="h-7 w-7 text-accent-foreground" />
                          </div>
                          <h3 className="text-accent-foreground font-bold text-lg">{title}</h3>
                          <p className="text-accent-foreground/80 text-sm leading-relaxed">{desc}</p>
                        </div>

                        {/* Bottom nudge */}
                        <div className="text-center">
                          <span className="text-accent-foreground/40 text-[10px] tracking-wide select-none">
                            step {step} of 04
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          {/* WHY CHOOSE US */}
<section className="py-16 md:py-24 bg-muted/40">
  <div className="max-w-6xl mx-auto px-5">

    <div className="space-y-2 mb-14 text-center">
      <p className="section-label">Why choose us</p>
      <h2 className="section-title">Everything you need to play</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[
        {
          image: "/verified-player.png",
          title: "Verified players only",
          desc: "Every account is manually verified so you always know who you're stepping on the pitch with. No surprises.",
        },
        {
          image: "/instant-match.png",
          title: "Instant player matching",
          desc: "Tell us your level, position, and area. Our system finds you the right game — no scrolling through endless lists.",
        },
        {
          image: "/track.png",
          title: "Track your progress",
          desc: "Every match logged. Watch your ratings, positions, and reputation grow the more you play.",
        },
      ].map(({ image, title, desc }) => (
        <div
          key={title}
          className="rounded-2xl border border-border overflow-hidden bg-background"
        >
          <Image
            src={image}
            alt={title}
            width={600}
            height={340}
            className="w-full h-[200px] object-cover"
          />
          <div className="p-6">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {desc}
            </p>
          </div>
        </div>
      ))}
    </div>

  </div>
</section>

          {/* ── CTA ── */}
          <section className="cta-section py-16 md:py-24">
            <div className="cta-content max-w-6xl mx-auto px-5 text-center space-y-6 relative z-10">
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
    </>
  )
}