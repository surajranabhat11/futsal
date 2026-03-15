import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            By accessing or using the Futsal Opponent Matcher platform, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our services.
          </p>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. Your continued use of the platform following any
            changes constitutes your acceptance of the revised terms.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>2. User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To use certain features of our platform, you must create an account. You are responsible for maintaining the
            confidentiality of your account information and for all activities that occur under your account.
          </p>
          <p className="text-muted-foreground">
            You agree to provide accurate and complete information when creating your account and to update your
            information to keep it accurate and current.
          </p>
          <p className="text-muted-foreground">
            We reserve the right to suspend or terminate your account if any information provided is found to be
            inaccurate, false, or outdated.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>3. User Conduct</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You agree to use our platform only for lawful purposes and in accordance with these Terms of Service. You
            agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Use the platform in any way that violates any applicable laws or regulations</li>
            <li>
              Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or
              entity
            </li>
            <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the platform</li>
            <li>Use the platform to send spam, unsolicited messages, or advertisements</li>
            <li>Attempt to interfere with the proper functioning of the platform</li>
            <li>
              Make any unauthorized use of the platform, including collecting usernames and/or email addresses by
              electronic means
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>4. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The platform and its original content, features, and functionality are owned by Futsal Opponent Matcher and
            are protected by international copyright, trademark, patent, trade secret, and other intellectual property
            laws.
          </p>
          <p className="text-muted-foreground">
            You may not copy, modify, create derivative works of, publicly display, publicly perform, republish, or
            transmit any of the material on our platform without prior written consent.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>5. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            In no event shall Futsal Opponent Matcher, its directors, employees, partners, agents, suppliers, or
            affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Your access to or use of or inability to access or use the platform</li>
            <li>Any conduct or content of any third party on the platform</li>
            <li>Any content obtained from the platform</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="font-medium mt-2">support@futsalmatcher.com</p>
        </CardContent>
      </Card>
    </div>
  )
}
