import { useNavigate } from '@tanstack/react-router';
import { signOut, useAuthState, useDataQuery } from '../utilities/firebase';
import { MessageSquare } from 'lucide-react';
import { type Message } from '../types/Message';
import { useState, useEffect, useRef } from 'react';

const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const queryPath = user ? `/invitations/${user.uid}/messages` : 'no-user-path';
  const [messagesData] = useDataQuery(queryPath);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (user && messagesData) {
      const messages = Object.entries(messagesData).map(([id, data]: [string, any]) => ({
        id,
        ...data,
      }));
      setUserMessages(messages);
    } else {
      setUserMessages([]);
    }
  }, [user, messagesData]);

  const handleManageProfile = () => {
    navigate({ to: '/profile' });
  };
  
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-white to-white/98 px-5 py-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="m-0 text-xl font-semibold">MealEx</h1>
          <p className="m-0 mt-0.5 text-xs text-slate-500">
            Network with peers over meals
          </p>
        </div>
        <button
        onClick={() => navigate({ to: '/'})}
        className="rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition cursor-pointer hover:bg-blue-100"
      >
        Home
      </button>
      </div>
      

      

      <div className='flex items-center gap-2'>
        <div className="relative" ref={popupRef}>
          <button onClick={() => navigate({ to: '/invitations'})} className="relative p-2 rounded-full hover:bg-gray-100">
            <MessageSquare className="h-6 w-6 text-gray-600" />
            {userMessages.filter(message => message.status == 'pending').length > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {userMessages.filter(message => message.status == 'pending').length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleManageProfile}
          className="rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition cursor-pointer hover:bg-blue-100"
        >
          Profile
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