"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  Zap,
  Trophy,
  MapPin,
  MessageSquare,
  User,
  Star,
  Users,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { useLoading } from "@/contexts/loading-context";

export default function AboutPage() {
  const container = useRef<HTMLDivElement>(null);
  const { isLoading } = useLoading();

  useGSAP(
    () => {
      if (isLoading) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".about-hero-badge", { opacity: 0, y: 20, duration: 0.8 })
        .from(
          ".about-hero-title",
          { opacity: 0, y: 30, duration: 0.8 },
          "-=0.6",
        )
        .from(
          ".about-hero-desc",
          { opacity: 0, y: 20, duration: 0.8 },
          "-=0.6",
        );

      gsap.from(".flow-step", {
        scrollTrigger: {
          trigger: ".flow-section",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        clearProps: "all",
      });
    },
    { scope: container, dependencies: [isLoading] },
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-background overflow-x-hidden"
    >
      {/* HERO */}
      <section className="hero-section py-20 md:py-28 relative">
        <div className="container px-4 md:px-6 text-center space-y-6 relative z-10">
          <span className="about-hero-badge hero-badge inline-flex items-center gap-2 mx-auto">
            <Zap className="h-3.5 w-3.5" />
            About Us
          </span>
          <h1 className="about-hero-title hero-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Futsal <span className="hero-accent">Match Making</span> System
          </h1>
          <p className="about-hero-desc hero-desc max-w-[650px] mx-auto text-lg md:text-xl opacity-90">
            Connecting futsal players and teams across Nepal. We make it simple
            to find teammates, opponents, and venues for your next match.
          </p>
        </div>
      </section>

      {/* MISSION + VISION */}
      <section className="mission-section relative">
        <div className="flex justify-center">
          {/* LEFT — scrollable content */}
          <div className="w-full lg:w-[55%] py-20 md:py-28">
            <div className="pl-6 md:pl-12 lg:pl-20 pr-6 md:pr-12 max-w-2xl">
              <p className="section-label mb-3">Who we are</p>
              <h2 className="section-title mb-16">Mission & vision</h2>

              {/* Mission */}
              <div className="mission-card mb-16 pb-16 border-b border-border">
                <div className="flex items-start gap-5">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#12211A] mb-3">
                      Our mission
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight mb-4 leading-snug">
                      Build a stronger futsal community across Nepal
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We eliminate the hassle of finding players and booking
                      courts — so you spend less time organising and more time
                      on the pitch where it matters.
                    </p>
                    <div className="flex gap-8 mt-8">
                      {[
                        ["500+", "players"],
                        ["20+", "venues"],
                        ["100+", "matches"],
                      ].map(([val, lbl]) => (
                        <div key={lbl}>
                          <div className="text-xl font-semibold tracking-tight">
                            {val}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {lbl}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision */}
              <div className="mission-card">
                <div className="flex items-start gap-5">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#12211A] mb-3">
                      Our vision
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight mb-4 leading-snug">
                      Every futsal enthusiast in Nepal — instantly connected
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      A future where finding teammates, opponents, and courts is
                      as easy as opening your phone. No calls, no group chaos —
                      just football.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — sticky image that bleeds to the right edge of the viewport */}
          <div className="hidden lg:block lg:w-[45%]">
            <div className="sticky top-0 h-full w-full">
              <Image
                src="/mission-vision.png"
                alt="Futsal court"
                fill
                className="object-cover"
                priority
              />
              {/* feather the left edge so it blends into the content */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, hsl(var(--background)) 0%, transparent 20%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW YOU PLAY */}
<section className="flow-section py-20 md:py-28">
  <div className="container px-4 md:px-6">

    <div className="grid lg:grid-cols-2 gap-16 items-start">

      {/* Left Side */}
      <div className="sticky top-24">
        <p className="section-label mb-3">User Journey</p>

        <h2 className="section-title mb-6">
          How You Play
        </h2>

        <p className="text-muted-foreground leading-relaxed mb-20">
          From creating your profile to finding opponents, organizing matches,
          and building your reputation, the platform makes every step simple
          and seamless.
        </p>

        <div className="relative">
    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full " />

    <Image
      src="/player.png"
      alt="Football player kicking a ball"
      width={500}
      height={500}
      className="relative z-10 object-contain"
    />
  </div>
      </div>

      {/* Right Side */}
      <div className="grid md:grid-cols-2 gap-5">
  {[
    {
      num: "01",
      label: "Register",
      desc: "Create your account in under a minute. Just your name, email, and you're in.",
    },
    {
      num: "02",
      label: "Build profile",
      desc: "Set your position, skill level, and which areas of Nepal you play in.",
    },
    {
      num: "03",
      label: "Dashboard",
      desc: "Your personal hub — see upcoming games, recent matches, and your stats.",
    },
    {
      num: "04",
      label: "Find opponents",
      desc: "Browse open games near you. Filter by time, venue, and spots available.",
    },
    {
      num: "05",
      label: "Chat & plan",
      desc: "Message organisers directly to confirm your spot or sort out the details.",
    },
    {
      num: "06",
      label: "Play",
      desc: "Show up, play your game. Everything else was handled already.",
    },
    {
      num: "07",
      label: "Rate players",
      desc: "After the match, rate your teammates. Build a reputation that earns more invites.",
    },
  ].map(({ num, label, desc }) => (
    <div
      key={num}
      className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
          {num}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            {label}
          </h3>

          <p className="text-muted-foreground leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

    </div>
  </div>
</section>
    </div>
  );
}
