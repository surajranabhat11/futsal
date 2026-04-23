import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const sections = [
  {
    title: "1. Information We Collect",
    content: ["We collect several types of information from and about users of our platform, including:"],
    list: [
      "Personal information such as name, email address, and location",
      "Profile information such as skill level, position, and availability",
      "Communication data including chat messages and match requests",
      "Usage data such as how you interact with our platform",
      "Device information including IP address, browser type, and operating system",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: ["We use the information we collect about you for various purposes, including:"],
    list: [
      "Providing, maintaining, and improving our platform",
      "Matching you with other players and teams based on your preferences",
      "Processing and facilitating match requests and communications",
      "Sending you notifications about matches, messages, and platform updates",
      "Analyzing usage patterns to enhance user experience",
      "Protecting against unauthorized access and ensuring platform security",
    ],
  },
  {
    title: "3. Information Sharing",
    content: ["We may share your information in the following circumstances:"],
    list: [
      "With other users as part of the matchmaking process",
      "With service providers who perform services on our behalf",
      "To comply with legal obligations or protect our rights",
      "In connection with a business transfer or acquisition",
      "With your consent or at your direction",
    ],
    footer: "We do not sell your personal information to third parties.",
  },
  {
    title: "4. Data Security",
    content: [
      "We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.",
      "However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.",
    ],
  },
  {
    title: "5. Your Rights",
    content: ["Depending on your location, you may have certain rights regarding your personal information, including:"],
    list: [
      "The right to access and receive a copy of your personal information",
      "The right to rectify or update your personal information",
      "The right to delete your personal information",
      "The right to restrict or object to processing of your personal information",
      "The right to data portability",
      "The right to withdraw consent",
    ],
    footer: "To exercise these rights, please contact us using the information provided below.",
  },
  {
    title: "6. Contact Us",
    content: ["If you have any questions about this Privacy Policy, please contact us at:"],
    contact: "privacy@futsalmatcher.com",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-950 dark:to-green-950 py-16 md:py-20">
        <div className="container px-4 md:px-6 text-center space-y-4">
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">Legal</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400">Last updated: {new Date().getFullYear()}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto space-y-6">
          {sections.map(({ title, content, list, footer, contact }) => (
            <Card key={title} className="border-gray-100 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {content.map((para, i) => (
                  <p key={i} className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{para}</p>
                ))}
                {list && (
                  <ul className="space-y-2 mt-2">
                    {list.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {footer && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-1">{footer}</p>
                )}
                {contact && (
                  <Link href={`mailto:${contact}`} className="text-green-600 dark:text-green-400 font-medium text-sm hover:underline">
                    {contact}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
