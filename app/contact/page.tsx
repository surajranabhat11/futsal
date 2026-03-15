"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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
        setName(""); setEmail(""); setMessage("")
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
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-950 dark:to-green-950 py-16 md:py-24">
        <div className="container px-4 md:px-6 text-center space-y-4">
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">Get In Touch</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contact Us</h1>
          <p className="max-w-[500px] mx-auto text-gray-600 dark:text-gray-400 text-lg">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">

            {/* Form */}
            <Card className="border-gray-100 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fill out the form and we'll get back to you as soon as possible.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help you?" rows={5} required disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Send Message</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-gray-100 dark:border-gray-800">
                <CardContent className="pt-6 space-y-6">
                  {[
                    { icon: Mail, title: "Email", lines: ["support@futsalmatcher.com", "info@futsalmatcher.com"] },
                    { icon: Phone, title: "Phone", lines: ["+977 1234567890", "Mon-Fri, 9:00 AM - 5:00 PM"] },
                    { icon: MapPin, title: "Office", lines: ["123 Futsal Street", "Kathmandu, Nepal"] },
                  ].map(({ icon: Icon, title, lines }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{title}</h3>
                        {lines.map((line) => (
                          <p key={line} className="text-sm text-gray-500 dark:text-gray-400">{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-100 dark:border-gray-800">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {/* Facebook */}
                    <Button variant="outline" size="icon" className="hover:border-green-400 hover:text-green-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </Button>
                    {/* Instagram */}
                    <Button variant="outline" size="icon" className="hover:border-green-400 hover:text-green-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </Button>
                    {/* Twitter */}
                    <Button variant="outline" size="icon" className="hover:border-green-400 hover:text-green-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </Button>
                    {/* LinkedIn */}
                    <Button variant="outline" size="icon" className="hover:border-green-400 hover:text-green-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
