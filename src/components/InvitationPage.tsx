import { useState, useEffect } from 'react';
import {
  useAuthState,
  useDataQuery,
  useDataUpdate,
} from '../utilities/firebase.ts';
import { useProfiles } from '../contexts/ProfilesContext.tsx';
import { type Message } from '../types/Message.ts';

const InvitationPage = () => {
  const [view, setView] = useState('incoming'); // 'incoming' or 'outgoing'

  const { user } = useAuthState();
  const { getProfileById } = useProfiles();

  // Fetch incoming messages
  const incomingQueryPath = user
    ? `/invitations/${user.uid}/messages`
    : 'no-user-path';
  const [incomingMessagesData] = useDataQuery(incomingQueryPath);
  const [incomingUserMessages, setIncomingUserMessages] = useState<Message[]>(
    []
  );

  // hook to update incoming messages (we will update individual message status using relative paths)
  const [updateIncomingMessages] = useDataUpdate(incomingQueryPath);

  // Fetch all messages for outgoing filtering
  const allMessagesQueryPath = '/invitations';
  const [allMessagesData] = useDataQuery(allMessagesQueryPath);
  const [outgoingUserMessages, setOutgoingUserMessages] = useState<Message[]>(
    []
  );

  useEffect(() => {
    if (user && incomingMessagesData) {
      const messages = Object.entries(incomingMessagesData).map(
        ([id, data]: [string, any]) => ({
          id,
          ...data,
        })
      );
      setIncomingUserMessages(messages);
    } else {
      setIncomingUserMessages([]);
    }
  }, [user, incomingMessagesData]);

  useEffect(() => {
    if (user && allMessagesData) {
      const allMessages: Message[] = [];
      Object.values(allMessagesData).forEach((userMessages: any) => {
        if (userMessages.messages) {
          Object.entries(userMessages.messages).forEach(
            ([id, data]: [string, any]) => {
              allMessages.push({ id, ...data });
            }
          );
        }
      });

      const outgoing = allMessages.filter((msg) => msg.sender === user.uid);
      setOutgoingUserMessages(outgoing);
    } else {
      setOutgoingUserMessages([]);
    }
  }, [user, allMessagesData]);

  return (
      <div className="flex gap-8 w-full max-w-6xl mx-auto">
      <div className="w-96 bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Invitations</h2>
          <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setView('incoming')}
              className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'incoming' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Incoming
            </button>
            <button
              onClick={() => setView('outgoing')}
              className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'outgoing' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Outgoing
            </button>
          </div>
        </div>

        {view === 'incoming' && (
          <>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Pending Invitations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Pending Invitations
                </h3>
                {incomingUserMessages.filter(
                  (msg) => !msg.status || msg.status === 'pending'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {incomingUserMessages
                      .filter((msg) => !msg.status || msg.status === 'pending')
                      .map((msg) => {
                        const senderProfile = getProfileById(msg.sender);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                {senderProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wants to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  // update message status to accepted
                                  updateIncomingMessages({
                                    [`${msg.id}/status`]: 'accepted',
                                  });
                                  // optimistic UI update
                                  setIncomingUserMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id
                                        ? { ...m, status: 'accepted' }
                                        : m
                                    )
                                  );
                                }}
                                disabled={msg.status !== 'pending'}
                                className={`px-2 py-1 text-xs rounded ${msg.status === 'accepted' ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                              >
                                {msg.status === 'accepted'
                                  ? 'Accepted'
                                  : 'Accept'}
                              </button>
                              <button
                                onClick={() => {
                                  // update message status to rejected
                                  updateIncomingMessages({
                                    [`${msg.id}/status`]: 'rejected',
                                  });
                                  setIncomingUserMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id
                                        ? { ...m, status: 'rejected' }
                                        : m
                                    )
                                  );
                                }}
                                disabled={msg.status !== 'pending'}
                                className={`px-2 py-1 text-xs rounded ${msg.status === 'rejected' ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                              >
                                {msg.status === 'rejected'
                                  ? 'Declined'
                                  : 'Decline'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    You have no pending invitations.
                  </div>
                )}
              </div>

              {/* Resolved Invitations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Past Invitations
                </h3>
                {incomingUserMessages.filter(
                  (msg) =>
                    msg.status === 'accepted' || msg.status === 'rejected'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {incomingUserMessages
                      .filter(
                        (msg) =>
                          msg.status === 'accepted' || msg.status === 'rejected'
                      )
                      .map((msg) => {
                        const senderProfile = getProfileById(msg.sender);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                {senderProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wanted to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                              <p
                                className={`text-sm mt-2 ${msg.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {msg.status === 'accepted'
                                  ? 'Accepted'
                                  : 'Declined'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    No past invitations.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'outgoing' && (
          <>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Pending Outgoing Invitations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Pending Invitations
                </h3>
                {outgoingUserMessages.filter(
                  (msg) => !msg.status || msg.status === 'pending'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {outgoingUserMessages
                      .filter((msg) => !msg.status || msg.status === 'pending')
                      .map((msg) => {
                        const receiverProfile = getProfileById(msg.receiver);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                To: {receiverProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wanted to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: Pending
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    You have no pending outgoing invitations.
                  </div>
                )}
              </div>

              {/* Resolved Outgoing Invitations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Past Invitations
                </h3>
                {outgoingUserMessages.filter(
                  (msg) =>
                    msg.status === 'accepted' || msg.status === 'rejected'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {outgoingUserMessages
                      .filter(
                        (msg) =>
                          msg.status === 'accepted' || msg.status === 'rejected'
                      )
                      .map((msg) => {
                        const receiverProfile = getProfileById(msg.receiver);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                To: {receiverProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wanted to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.status === 'accepted'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                Status:{' '}
                                {msg.status === 'accepted'
                                  ? 'Accepted'
                                  : 'Declined'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    No past outgoing invitations.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default InvitationPage;