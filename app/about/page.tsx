import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, Zap, Trophy, MapPin, MessageSquare } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-950 dark:to-green-950 py-16 md:py-24">
        <div className="container px-4 md:px-6 text-center space-y-4">
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">About Us</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Futsal Match Making System</h1>
          <p className="max-w-[600px] mx-auto text-gray-600 dark:text-gray-400 text-lg">
            Designed to connect futsal players and teams across Nepal. We make it simple to find teammates, opponents, and venues.
          </p>
        </div>
      </section>

      {/* MISSION + HOW IT WORKS */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-100 dark:border-gray-800">
              <CardHeader>
                <div className="h-10 w-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Futsal Match Making System is designed to connect futsal players and teams in your area. Our platform makes it easy to find teammates, opponents, and venues for your next match — building a stronger futsal community across Nepal.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 dark:border-gray-800">
              <CardHeader>
                <div className="h-10 w-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {[
                    "Create your player profile with your skills and preferences",
                    "Find matches and players in your area based on your location",
                    "Chat with other players and teams to organize matches",
                    "Rate and review your opponents after matches",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="shrink-0 h-6 w-6 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{item}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* APP FLOW */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-2 mb-12">
            <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">App Flow</p>
            <h2 className="text-2xl font-bold">Your Journey</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 items-center">
            {[
              { label: "Register", icon: Users },
              { label: "Create Profile", icon: Users },
              { label: "Dashboard", icon: Trophy },
              { label: "Find Opponents", icon: MapPin },
              { label: "Chat & Plan", icon: MessageSquare },
              { label: "Play Match", icon: Trophy },
              { label: "Rate Players", icon: Trophy },
            ].map(({ label, icon: Icon }, i, arr) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-green-300 dark:text-green-700 font-bold mb-4">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-2 mb-12">
            <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">Built With</p>
            <h2 className="text-2xl font-bold">Technology Stack</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { name: "Next.js", desc: "React Framework" },
              { name: "MongoDB Atlas", desc: "Database" },
              { name: "NextAuth.js", desc: "Authentication" },
              { name: "Socket.io", desc: "Real-time Chat" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "TypeScript", desc: "Type Safety" },
            ].map(({ name, desc }) => (
              <div key={name} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
