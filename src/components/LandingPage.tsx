import { signInWithGoogle, useAuthState } from "../utilities/firebase";
import { useNavigate } from "@tanstack/react-router";

const handleSignIn = () => {
  signInWithGoogle();
  const { isAuthenticated } = useAuthState();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate({ to: '/' });
  }
};




const LandingPage = () => (
  <button onClick={handleSignIn}>Sign In</button>
);


export default LandingPage;