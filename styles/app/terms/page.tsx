import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using the Futsal Opponent Matcher platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
      "We reserve the right to modify these terms at any time. Your continued use of the platform following any changes constitutes your acceptance of the revised terms.",
    ],
  },
  {
    title: "2. User Accounts",
    content: [
      "To use certain features of our platform, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.",
      "You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and current.",
      "We reserve the right to suspend or terminate your account if any information provided is found to be inaccurate, false, or outdated.",
    ],
  },
  {
    title: "3. User Conduct",
    content: ["You agree to use our platform only for lawful purposes and in accordance with these Terms of Service. You agree not to:"],
    list: [
      "Use the platform in any way that violates any applicable laws or regulations",
      "Impersonate any person or entity, or falsely state or misrepresent your affiliation",
      "Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the platform",
      "Use the platform to send spam, unsolicited messages, or advertisements",
      "Attempt to interfere with the proper functioning of the platform",
    ],
  },
  {
    title: "4. Intellectual Property",
    content: [
      "The platform and its original content, features, and functionality are owned by Futsal Opponent Matcher and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
      "You may not copy, modify, create derivative works of, publicly display, or transmit any of the material on our platform without prior written consent.",
    ],
  },
  {
    title: "5. Limitation of Liability",
    content: ["In no event shall Futsal Opponent Matcher be liable for any indirect, incidental, special, or punitive damages resulting from:"],
    list: [
      "Your access to or use of or inability to access or use the platform",
      "Any conduct or content of any third party on the platform",
      "Any content obtained from the platform",
      "Unauthorized access, use, or alteration of your transmissions or content",
    ],
  },
  {
    title: "6. Contact Us",
    content: ["If you have any questions about these Terms of Service, please contact us at:"],
    contact: "support@futsalmatcher.com",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-950 dark:to-green-950 py-16 md:py-20">
        <div className="container px-4 md:px-6 text-center space-y-4">
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wider">Legal</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Terms of Service</h1>
          <p className="text-gray-500 dark:text-gray-400">Last updated: {new Date().getFullYear()}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto space-y-6">
          {sections.map(({ title, content, list, contact }) => (
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
