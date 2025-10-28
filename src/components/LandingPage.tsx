import { signInWithGoogle } from "../utilities/firebase";

const LandingPage = () => (
  <button onClick={signInWithGoogle}>Sign In</button>
);

export default LandingPage;