import { LoaderCircle, MessageSquareHeart, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { apiClient } from '../lib/apiClient';

type FeedbackCategory = 'feedback' | 'feature' | 'review';

export const LiteFeedbackForm = ({ compact = false }: { compact?: boolean }) => {
  const [category, setCategory] = useState<FeedbackCategory>('feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    setError('');
    try {
      await apiClient.post('/lite/feedback', { category, message: message.trim(), email: email.trim() || undefined });
      setMessage('');
      setEmail('');
      setStatus('sent');
    } catch (submissionError) {
      setStatus('error');
      setError(submissionError instanceof Error ? submissionError.message : 'Your message could not be sent. Please try again.');
    }
  };

  return (
    <section className={`border-[4px] border-black bg-white shadow-[7px_7px_0_#000] ${compact ? '' : 'mx-auto max-w-3xl'}`}>
      <div className="border-b-[3px] border-black bg-[#f5ead8] p-6 sm:p-8">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#f97316]"><MessageSquareHeart className="h-4 w-4" /> Help improve Landed Lite</p>
        <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">Your feedback shapes what we build next.</h2>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#555]">Tell us what works, what is missing, or leave a short review. Your application data is never included.</p>
      </div>
      <form className="space-y-7 p-6 sm:p-8" onSubmit={(event) => void submit(event)}>
        <div>
          <label className="text-xs font-black uppercase" htmlFor="feedback-category">I want to share</label>
          <select className="mt-3 w-full border-[3px] border-black bg-white px-5 py-4 text-base font-normal sm:text-lg" id="feedback-category" value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}>
            <option value="feedback">General feedback</option>
            <option value="feature">Feature idea</option>
            <option value="review">Review</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-black uppercase" htmlFor="feedback-message">Your message</label>
          <textarea className="mt-3 min-h-36 w-full resize-y border-[3px] border-black bg-[#fffaf1] p-4 text-sm font-bold leading-6 outline-none focus:bg-white" id="feedback-message" maxLength={4000} placeholder="For example: I would love a way to…" required value={message} onChange={(event) => { setMessage(event.target.value); setStatus('idle'); }} />
        </div>
        <div>
          <label className="text-xs font-black uppercase" htmlFor="feedback-email">Email for a reply <span className="normal-case text-[#666]">(optional)</span></label>
          <input className="mt-3 w-full border-[3px] border-black bg-[#fffaf1] px-4 py-3.5 text-sm font-bold outline-none focus:bg-white" id="feedback-email" maxLength={255} placeholder="you@example.com" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setStatus('idle'); }} />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn-primary" disabled={status === 'sending'} type="submit">
            {status === 'sending' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {status === 'sending' ? 'Sending…' : 'Send feedback'}
          </button>
          {status === 'sent' ? <p className="text-sm font-black text-[#237a2b]">Thank you — your message was sent.</p> : null}
          {status === 'error' ? <p className="text-sm font-black text-[#b42318]">{error}</p> : null}
        </div>
      </form>
    </section>
  );
};
