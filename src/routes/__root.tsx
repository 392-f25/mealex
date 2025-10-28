import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ProfilesProvider } from '../contexts/ProfilesContext';
import { useAuthState, type AuthState } from '../utilities/firebase';

// Define the shape of the context that will be passed down
interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRoute({
  // This function provides the auth state to all child routes
  getContext: () => {
    const auth = useAuthState();
    return { auth };
  },
  component: () => (
    <ProfilesProvider>
      <div>
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </ProfilesProvider>
  ),
  // This function runs before any child route loads
  beforeLoad: ({ context, location }) => {
    // If the user is not authenticated and not already on the login page, redirect them.
    if (!context.auth.isAuthenticated && location.pathname !== '/landing') {
      throw redirect({
        to: '/landing',
        search: {
          // After login, redirect them back to the page they were trying to access.
          redirect: location.href,
        },
      })
    }
  },
  notFoundComponent: () => (
    <div className="h-screen flex items-center justify-center text-6xl">
     I looked for that page, I really did! 😭
    </div>
  )
});