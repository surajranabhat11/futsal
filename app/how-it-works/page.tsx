"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Users, MapPin, MessageSquare, Star, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { gsap } from "@/lib/gsap"
import { useGSAP } from "@gsap/react"
import { useLoading } from "@/contexts/loading-context"

const steps = [
  {
    image: "/man-using-computer.jpg",
    icon: Users,
    title: "Create Your Profile",
    description:
      "Sign up and create your player profile with your skills, position, and availability. This helps us match you with compatible players and teams.",
    points: [
      "Specify your skill level (Beginner, Intermediate, Advanced, Professional)",
      "Set your preferred position (Goalkeeper, Defender, Midfielder, Forward)",
      "Indicate your availability (weekdays, weekends, specific times)",
      "Add your location to find nearby players and venues",
    ],
  },
  {
    image:"/playing-football.jpg",
    icon: MapPin,
    title: "Find Matches",
    description:
      "Use our matchmaking system to find opponents or teammates based on your preferences. Search by location, skill level, team size, and availability.",
    points: [
      "Find opponents for your team",
      "Join existing teams looking for players",
      "Discover futsal venues near you",
      "Schedule matches at available time slots",
    ],
  },
  {
    image: "/messaging.jpg",
    icon: MessageSquare,
    title: "Connect & Organize",
    description:
      "Use our real-time chat system to connect with other players and teams. Organize matches, discuss details, and coordinate logistics.",
    points: [
      "Real-time messaging with players and teams",
      "Create group chats for team coordination",
      "Share files and images",
      "Receive notifications for new messages and match requests",
    ],
  },
  {
    image: "/review.jpg",
    icon: Star,
    title: "Play & Review",
    description:
      "After your match, provide feedback and ratings for your opponents. This helps build a trusted community and improves future matchmaking.",
    points: [
      "Rate your opponents on sportsmanship and skill",
      "Leave detailed feedback about your experience",
      "View your own ratings and feedback",
      "Build your reputation in the community",
    ],
  },
]

export default function HowItWorksPage() {
  const container = useRef<HTMLDivElement>(null)
  const { isLoading } = useLoading()

  useGSAP(
    () => {
      if (isLoading) return

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(".how-hero-badge", { opacity: 0, y: 20, duration: 0.8 })
        .from(".how-hero-title", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
        .from(".how-hero-desc", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")

      gsap.from(".step-card-item", {
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        stagger: 0.3,
        duration: 1,
      })

      gsap.from(".how-cta", {
        scrollTrigger: {
          trigger: ".how-cta-section",
          start: "top 85%",
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
      })
    },
    { scope: container, dependencies: [isLoading] },
  )

  return (
    <div ref={container} className="min-h-screen bg-background overflow-x-hidden">
      {/* HERO */}
      <section className="hero-section py-20 md:py-28 relative">
        <div className="container px-4 md:px-6 text-center space-y-6 relative z-10">
          <span className="how-hero-badge hero-badge inline-flex items-center gap-2 mx-auto">
            <Zap className="h-3.5 w-3.5" />
            Get Started
          </span>
          <h1 className="how-hero-title hero-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
            How <span className="hero-accent">It Works</span>
          </h1>
          <p className="how-hero-desc hero-desc max-w-[650px] mx-auto text-lg md:text-xl opacity-90">
            Futsal Opponent Matcher connects you with the community in just a few simple steps.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="steps-container py-20 md:py-28 how-steps-section">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12">
            {steps.map(({ icon: Icon, image, title, description, points }, index) => (
              <div key={title} className="step-card-item step-card p-0 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left: content */}
                  <div className={`p-10 space-y-6 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl font-black text-muted-foreground">0{index + 1}</span>
                      <div className="step-icon">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-muted-foreground font-heading">{title}</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
                    <ul className="space-y-3 pt-2">
                      {points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0" />
                          <span className="text-base text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: icon display */}
                  <div
                    className={` flex items-center justify-center min-h-[300px] ${index % 2 === 1 ? "md:order-1" : ""}`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
  <Image
    src={image}
    alt={title}
    width={500}
    height={350}
    className="rounded-2xl object-cover shadow-lg relative z-10 max-w-full h-auto"
  />
</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="how-cta-section cta-section py-20 md:py-28">
        <div className="how-cta container px-4 md:px-6 text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground font-heading">Ready to Get Started?</h2>
          <p className="text-primary-foreground/70 max-w-xl mx-auto text-lg md:text-xl">
            Join hundreds of futsal players already using our platform to find matches.
          </p>
          <Link href="/signup" className="inline-block">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-10 h-14 text-lg">
              Create Your Profile <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
