import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    
    <div className="container mx-auto py-12 px-4">
      
      <h1 className="text-4xl font-bold mb-8">About Futsal Match Making System</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>Connecting futsal enthusiasts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Futsal Match Making System is designed to connect futsal players and teams in your area. Our platform makes
              it easy to find teammates, opponents, and venues for your next match.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Simple and effective matchmaking</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Create your player profile with your skills and preferences</li>
              <li>Find matches and players in your area based on your location</li>
              <li>Chat with other players and teams to organize matches</li>
              <li>Rate and review your opponents after matches</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">App Flow</h2>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="border rounded-lg p-6 bg-muted/20">
            <pre className="text-xs text-muted-foreground">
              {`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Registration   │────▶│  Create Profile │────▶│    Dashboard    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Give Feedback │◀────│   Play Match    │◀────│  Find Opponents │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        │                                                │
        │                                                │
        ▼                                                ▼
┌─────────────────┐                            ┌─────────────────┐
│                 │                            │                 │
│  Rate Players   │                            │   Chat & Plan   │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
              `}
            </pre>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">Technology Stack</h2>

      <Card>
        <CardContent className="pt-6">
          <ul className="grid gap-4 md:grid-cols-2">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Next.js - React Framework</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>MongoDB Atlas - Database</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>NextAuth.js - Authentication</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Socket.io - Real-time Communication</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Tailwind CSS - Styling</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>TypeScript - Type Safety</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
