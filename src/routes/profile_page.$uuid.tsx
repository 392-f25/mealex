// import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router';
import ProfilePage from '../components/ProfilePage.tsx'


const profile_page = () => {
  const { userID } = useParams({ from: '/profile_page/$uuid' })

  const profile = {
      id: 1,
      initials: 'AB',
      name: 'Alice Brown',
      major: 'Computer Science',
      year: '2028',
      bio: 'Interested in AI research and internships.',
      tags: ['AI', 'Internships']
    }
  //const profile = useDataBaseQuer(...)

  if(!profile) {
    return <>
        <div> Profile Not Found! </div>
    </>
  }
  return (
    <ProfilePage profile={profile}/>
  )
};

export const Route = createFileRoute('/profile_page/$uuid')({
  component: profile_page,
})
