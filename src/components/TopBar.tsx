import { useNavigate } from '@tanstack/react-router';
import { signOut, useAuthState, useDataQuery } from '../utilities/firebase';
import { useProfiles } from '../contexts/ProfilesContext';
import { MessageSquare } from 'lucide-react';
import { type Message } from '../types/Message';
import { useState, useEffect, useRef } from 'react';

type MessagesPopupProps = {
  messages: Message[];
};

const MessagesPopup = ({ messages }: MessagesPopupProps) => {
  const { getProfileById } = useProfiles();

  if (messages.length === 0) {
    return (
      <div className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-lg border p-4">
        <p className="text-sm text-gray-500">No new messages.</p>
      </div>
    );
  }

  return (
    <div className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Messages</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {messages.map((msg) => {
          const senderProfile = getProfileById(msg.sender);
          return (
            <div key={msg.id} className="p-4 border-b hover:bg-gray-50">
              <p className="font-semibold text-sm">{senderProfile?.name ?? 'Unknown User'}</p>
              <p className="text-sm text-gray-600 truncate">{msg.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const queryPath = user ? `/invitations/${user.uid}/messages` : 'no-user-path';
  const [messagesData] = useDataQuery(queryPath);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (user && messagesData) {
      const allMessages = Object.entries(messagesData).map(([id, msg]) => ({ id, ...(msg as Omit<Message, 'id'>) }));
      const receivedMessages = allMessages.filter(msg => msg.receiver === user.uid);
      setUserMessages(receivedMessages);
    } else {
      setUserMessages([]);
    }
  }, [user, messagesData]);

  const handleManageProfile = () => {
    navigate({ to: '/profile' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-white to-white/98 px-5 py-5 shadow-sm">
      <div>
        <h1 className="m-0 text-xl font-semibold">MealEx</h1>
        <p className="m-0 mt-0.5 text-xs text-slate-500">
          Network with peers over meals
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <div className="relative" ref={popupRef}>
          <button onClick={() => setIsPopupOpen(prev => !prev)} className="relative p-2 rounded-full hover:bg-gray-100">
            <MessageSquare className="h-6 w-6 text-gray-600" />
            {userMessages.length > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {userMessages.length}
              </span>
            )}
          </button>
          {isPopupOpen && <MessagesPopup messages={userMessages} />}
        </div>

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