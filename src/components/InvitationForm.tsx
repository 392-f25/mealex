import { useState } from 'react';
import { useAuthState } from '../utilities/firebase';
import { useDataPush } from '../utilities/firebase';

interface InvitationFormProps {
  receiverId: string;
}

export default function InvitationForm({ receiverId }: InvitationFormProps) {
  const { user } = useAuthState();
  const [body, setBody] = useState('');
  const [sendInvitation, message, error] = useDataPush(`/invitations/${receiverId}/messages`);
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;

    const msg = {
      sender: user.uid,
      receiver: receiverId,
      body: body.trim(),
    };
    sendInvitation(msg);
    setBody('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <form onSubmit={handleSend} className="mt-8 border-t pt-6">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">Send Invitation</h2>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write your message..."
        className="w-full rounded border border-slate-300 p-2 text-sm mb-2"
        rows={3}
        required
      />
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
        disabled={!body.trim() || sent}
      >
        {sent ? 'Sent!' : 'Send'}
      </button>
      {error && <div className="text-red-600 text-xs mt-2">{error.message}</div>}
      {message && <div className="text-green-600 text-xs mt-2">{message}</div>}
    </form>
  );
}
