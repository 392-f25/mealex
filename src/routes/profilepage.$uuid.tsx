import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '../components/ProfilePage.tsx'

function ProfilePageRoute() {
  const params = Route.useParams()

  if(!params.uuid) {
    return <div>User Not Found!</div>
  }
  
  return <ProfilePage userID={params.uuid}/>
}

export const Route = createFileRoute('/profilepage/$uuid')({
  component: ProfilePageRoute,
})
