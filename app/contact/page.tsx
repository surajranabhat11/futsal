"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { gsap } from "@/lib/gsap"
import { useGSAP } from "@gsap/react"
import { useLoading } from "@/contexts/loading-context"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const container = useRef<HTMLDivElement>(null)
  const { isLoading } = useLoading()

  useGSAP(
    () => {
      if (isLoading) return

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(".contact-hero-badge", { opacity: 0, y: 20, duration: 0.8 })
        .from(".contact-hero-title", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
        .from(".contact-hero-desc", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")

      gsap.from(".contact-form-card", {
        scrollTrigger: {
          trigger: ".contact-grid",
          start: "top 80%",
        },
        opacity: 0,
        x: -50,
        duration: 1,
      })

      gsap.from(".contact-info-card", {
        scrollTrigger: {
          trigger: ".contact-grid",
          start: "top 80%",
        },
        opacity: 0,
        x: 50,
        duration: 1,
      })

      gsap.from(".social-btn", {
        scrollTrigger: {
          trigger: ".social-section",
          start: "top 90%",
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
      })
    },
    { scope: container, dependencies: [isLoading] },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
      if (res.ok) {
        toast({ title: "Message sent", description: "Thank you! We'll get back to you soon." })
        setName("")
        setEmail("")
        setMessage("")
      } else {
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div ref={container} className="min-h-screen bg-background overflow-x-hidden">
      {/* HERO */}
      <section className="hero-section py-20 md:py-28 relative">
        <div className="container px-4 md:px-6 text-center space-y-6 relative z-10">
          <span className="contact-hero-badge hero-badge inline-flex items-center gap-2 mx-auto">
            <Mail className="h-3.5 w-3.5" />
            Get In Touch
          </span>
          <h1 className="contact-hero-title hero-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Let's <span className="hero-accent">Connect</span>
          </h1>
          <p className="contact-hero-desc hero-desc max-w-[600px] mx-auto text-lg md:text-xl opacity-90">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="contact-grid grid gap-10 md:grid-cols-2 max-w-6xl mx-auto">
            {/* Form */}
            <div className="contact-form-card step-card p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold font-heading mb-2">Send Message</h3>
                <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={isSubmitting}
                    className="h-12 bg-muted/30 border-primary/10 focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    disabled={isSubmitting}
                    className="h-12 bg-muted/30 border-primary/10 focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    disabled={isSubmitting}
                    className="bg-muted/30 border-primary/10 focus:border-accent transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-14"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="contact-info-card step-card p-8">
                <h3 className="text-2xl font-bold font-heading mb-8">Contact Information</h3>
                <div className="space-y-8">
                  {[
                    { icon: Mail, title: "Email Us", lines: ["support@futsalmatcher.com", "info@futsalmatcher.com"] },
                    { icon: Phone, title: "Call Us", lines: ["+977 1234567890", "Mon-Fri, 9:00 AM - 5:00 PM"] },
                    { icon: MapPin, title: "Visit Us", lines: ["123 Futsal Street", "Kathmandu, Nepal"] },
                  ].map(({ icon: Icon, title, lines }) => (
                    <div key={title} className="flex items-start gap-5">
                      <div className="step-icon bg-accent/10 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{title}</h4>
                        {lines.map((line) => (
                          <p key={line} className="text-muted-foreground">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-info-card step-card p-8 social-section">
                <h3 className="text-xl font-bold font-heading mb-6">Follow Our Community</h3>
                <div className="flex gap-4">
                  {[
                    {
                      name: "Facebook",
                      path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
                    },
                    {
                      name: "Instagram",
                      path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
                      extra: <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>,
                      isInsta: true,
                    },
                    {
                      name: "Twitter",
                      path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
                    },
                  ].map((social) => (
                    <Button
                      key={social.name}
                      variant="outline"
                      size="icon"
                      className="social-btn h-12 w-12 rounded-xl border-primary/10 hover:border-accent hover:text-accent transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {social.isInsta ? <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect> : null}
                        <path d={social.path}></path>
                        {social.extra}
                      </svg>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
