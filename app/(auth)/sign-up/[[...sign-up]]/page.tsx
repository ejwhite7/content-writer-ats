import { SignUp } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - ATS Platform',
  description: 'Create your ATS Platform account and start streamlining your hiring process today.',
}

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">Get started with ATS Platform today</p>
      </div>
      
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border-0 bg-transparent",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "form-input",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
            formFieldInput: "form-input",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
        redirectUrl="/onboarding"
        signInUrl="/sign-in"
      />
    </div>
  )
}