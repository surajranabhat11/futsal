"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap"

export default function SignOutPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out"
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background elements to match the site theme */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div ref={containerRef} className="w-full max-w-md relative z-10">
        <Card className="border-none shadow-2xl shadow-black/10 rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-accent" />
          <CardHeader className="pt-10 pb-4 text-center">
            <div className="mx-auto h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <LogOut className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black font-heading tracking-tight">Signing Out?</CardTitle>
            <p className="text-muted-foreground mt-2">Are you sure you want to log out of your Futsal session?</p>
          </CardHeader>
          <CardContent className="pt-6 pb-8 text-center space-y-4">
             <Button 
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="destructive" 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-destructive/20 hover:scale-[1.02] transition-transform"
             >
               YES, SIGN ME OUT
             </Button>
             <Button 
                asChild
                variant="ghost" 
                className="w-full h-14 rounded-2xl font-bold text-muted-foreground hover:bg-muted"
             >
               <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  NO, STAY LOGGED IN
               </Link>
             </Button>
          </CardContent>
          <CardFooter className="bg-muted/30 p-6 flex justify-center">
             <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                <Home className="w-3 h-3" />
                Back to Landing Page
             </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
