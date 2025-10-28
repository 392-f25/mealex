import { createFileRoute, redirect } from '@tanstack/react-router'
import LandingPage from '../components/LandingPage.tsx'
import { StrictMode } from 'react'

function LandingComponent() {
  return (
    <StrictMode>
        <LandingPage />
    </StrictMode>
  )
}

export const Route = createFileRoute('/landing')({
  // If the user is already authenticated, redirect them to the home page.
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: LandingComponent,
})
