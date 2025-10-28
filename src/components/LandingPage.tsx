import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { signInWithGoogle, useAuthState } from '../utilities/firebase';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialLoading } = useAuthState();

  // Navigate to home once authenticated
  useEffect(() => {
    if (!isInitialLoading && isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, isInitialLoading, navigate]);

  const handleSignIn = () => {
    signInWithGoogle();
    // Don't navigate here — let the useEffect above handle it
  };

  return (
    <div className='flex justify-center p-2 h-[100vh] items-center'><button className='rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50' onClick={handleSignIn}>Sign In</button></div>
  );
};

export default LandingPage;