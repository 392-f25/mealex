import { useNavigate } from '@tanstack/react-router';
import { signOut } from '../utilities/firebase.ts';

const TopBar = () => {
  const navigate = useNavigate();

  const handleManageProfile = () => {
    navigate({ to: '/profile' });
  };

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-white to-white/98 px-5 py-5 shadow-sm">
      <div>
        <h1 className="m-0 text-xl font-semibold">MealEx</h1>
        <p className="m-0 mt-0.5 text-xs text-slate-500">
          Network with peers over meals
        </p>
      </div>
      <div className='flex gap-2'>
        <button
          onClick={handleManageProfile}
          className="rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition cursor-pointer hover:bg-blue-100"
        >
          Manage
        </button>
        <button
          onClick={signOut}
          className="rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition cursor-pointer hover:bg-blue-100"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default TopBar