import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ProfilesProvider } from '../contexts/ProfilesContext';
import { useAuthState } from '../utilities/firebase';
import { useEffect } from 'react';

function RootComponent() {
  const { isAuthenticated, isInitialLoading } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while auth state is loading
    if (isInitialLoading) return;

    // Redirect to landing if not authenticated and not already there
    if (!isAuthenticated && location.pathname !== '/landing') {
      navigate({ to: '/landing' });
    }
  }, [isAuthenticated, isInitialLoading, navigate, location.pathname]);

  return (
    <ProfilesProvider>
      <div>
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </ProfilesProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="h-screen flex items-center justify-center text-6xl">
      I looked for that page, I really did! 😭
    </div>
  )
});