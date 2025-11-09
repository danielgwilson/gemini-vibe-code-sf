"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/landing/ui/button"
import { Logo } from "@/components/landing/logo"

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignIn = async () => {
    await signIn("google", { callbackUrl: "/chat" })
  }

  const handleGetStarted = async () => {
    if (session) {
      router.push("/chat")
    } else {
      await signIn("google", { callbackUrl: "/chat" })
    }
  }

  return (
    <header className="glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          <a href="#agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Agents
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <Button 
              onClick={() => router.push("/chat")}
              className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-opacity"
            >
              Go to Chat
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="hidden sm:inline-flex"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-opacity"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
