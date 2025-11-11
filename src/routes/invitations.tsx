import { createFileRoute } from '@tanstack/react-router'
import InvitationPage from '../components/InvitationPage.tsx';

export const Route = createFileRoute('/invitations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <InvitationPage />
}
