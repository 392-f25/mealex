import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '../components/ProfilePage.tsx'
import { StrictMode } from 'react'

function ProfilePageRoute() {
  const params = Route.useParams()

  if(!params.uuid) {
    return <div>User Not Found!</div>
  }
  
  return (
    <StrictMode>
      <ProfilePage userID={params.uuid}/>
    </StrictMode>
  );
}

export const Route = createFileRoute('/profilepage/$uuid')({
  component: ProfilePageRoute,
})
