import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, MessageSquare, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    icon: Users,
    title: "Create Your Profile",
    description: "Sign up and create your player profile with your skills, position, and availability. This helps us match you with compatible players and teams.",
    points: [
      "Specify your skill level (Beginner, Intermediate, Advanced, Professional)",
      "Set your preferred position (Goalkeeper, Defender, Midfielder, Forward)",
      "Indicate your availability (weekdays, weekends, specific times)",
      "Add your location to find nearby players and venues",
    ],
  },
  {
    icon: MapPin,
    title: "Find Matches",
    description: "Use our matchmaking system to find opponents or teammates based on your preferences. Search by location, skill level, team size, and availability.",
    points: [
      "Find opponents for your team",
      "Join existing teams looking for players",
      "Discover futsal venues near you",
      "Schedule matches at available time slots",
    ],
  },
  {
    icon: MessageSquare,
    title: "Connect & Organize",
    description: "Use our real-time chat system to connect with other players and teams. Organize matches, discuss details, and coordinate logistics.",
    points: [
      "Real-time messaging with players and teams",
      "Create group chats for team coordination",
      "Share files and images",
      "Receive notifications for new messages and match requests",
    ],
  },
  {
    icon: Star,
    title: "Play & Review",
    description: "After your match, provide feedback and ratings for your opponents. This helps build a trusted community and improves future matchmaking.",
    points: [
      "Rate your opponents on sportsmanship and skill",
      "Leave detailed feedback about your experience",
      "View your own ratings and feedback",
      "Build your reputation in the community",
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-950 dark:to-green-950 py-16 md:py-24">
        <div className="container px-4 md:px-6 text-center space-y-4">
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">Get Started</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">How It Works</h1>
          <p className="max-w-[600px] mx-auto text-gray-600 dark:text-gray-400 text-lg">
            Futsal Opponent Matcher makes it easy to connect with other players and teams in your area in just a few simple steps.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8">
            {steps.map(({ icon: Icon, title, description, points }, index) => (
              <Card key={title} className="border-gray-100 dark:border-gray-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left: content */}
                    <div className={`p-8 space-y-4 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-green-100 dark:text-green-900">0{index + 1}</span>
                        <div className="h-10 w-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold">{title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
                      <ul className="space-y-2">
                        {points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: icon display */}
                    <div className={`bg-green-50 dark:bg-green-950/30 flex items-center justify-center p-8 min-h-[200px] ${index % 2 === 1 ? "md:order-1" : ""}`}>
                      <Icon className="h-28 w-28 text-green-200 dark:text-green-900" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600 dark:bg-green-800">
        <div className="container px-4 md:px-6 text-center space-y-5">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-green-100 max-w-md mx-auto">Join the community and start finding futsal matches today.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-semibold px-8">
              Create Your Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
