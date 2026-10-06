import { LiteFeedbackForm } from '../components/LiteFeedbackForm';

export const LiteFeedbackPage = () => (
  <div className="mx-auto max-w-4xl space-y-5">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p>
      <h1 className="mt-1 text-4xl font-black uppercase">Feedback</h1>
      <p className="mt-3 max-w-2xl font-bold leading-6 text-[#666]">Share an idea, report something confusing, or leave a review without sharing your application data.</p>
    </div>
    <LiteFeedbackForm />
  </div>
);
