import {
  Activity,
  BarChart3,
  Briefcase,
  Code2,
  FileText,
  Grid2X2,
  Link as LinkIcon,
  MessageSquare,
  Users
} from 'lucide-react';

export const jobBoards = [
  'LinkedIn',
  'Indeed',
  'Naukri',
  'Glassdoor',
  'Greenhouse',
  'Lever',
  'Workday',
  'Ashby',
  'Wellfound',
  'ZipRecruiter',
  'Instahyre',
  'Monster'
];

export const applications = [
  {
    company: 'Google',
    role: 'Software Engineer L4',
    details: ['Bangalore', 'Resume v4 - Big Tech', '2 days ago'],
    version: 'v4',
    badge: 'Offer',
    badgeClass: 'bg-[rgba(34,197,94,0.1)] text-[#16a34a]',
    highlight: true
  },
  {
    company: 'Razorpay',
    role: 'SDE-1 Backend',
    details: ['Mumbai', 'Resume v2 - Startup', '4 days ago'],
    version: 'v2',
    badge: 'Interview',
    badgeClass: 'bg-[rgba(249,115,22,0.1)] text-[#ea580c]'
  },
  {
    company: 'Swiggy',
    role: 'Platform Engineer',
    details: ['Remote', 'Resume v3 - Full-stack', '6 days ago'],
    version: 'v3',
    badge: 'Screening',
    badgeClass: 'bg-[rgba(59,130,246,0.1)] text-[#2563eb]'
  },
  {
    company: 'Zepto',
    role: 'Senior SWE',
    details: ['Bangalore', 'Resume v1 - General', '1 week ago'],
    version: 'v1',
    badge: 'Applied',
    badgeClass: 'bg-[#f5f5f5] text-[#9a9a9a]'
  }
];

export const features = [
  {
    title: 'Resume vault',
    body: 'Upload, tag, switch, and compare multiple resume versions without hunting through folders.',
    icon: FileText,
    color: 'bg-[#f97316]'
  },
  {
    title: 'Pipeline tracker',
    body: 'See every company, role, stage, next action, and resume version in one loud dashboard.',
    icon: Grid2X2,
    color: 'bg-[#5dd6e4]'
  },
  {
    title: 'Resume diff',
    body: 'Compare two versions line by line and understand which edits improved your story.',
    icon: Code2,
    color: 'bg-[#f5b8d4]'
  },
  {
    title: 'Job import',
    body: 'Paste a job URL from popular boards and Landed extracts the company, role, and details.',
    icon: LinkIcon,
    color: 'bg-[#f9d44a]'
  },
  {
    title: 'Activity timeline',
    body: 'Every stage change, note, and follow-up is captured so your next move stays obvious.',
    icon: Activity,
    color: 'bg-[#96d35f]'
  },
  {
    title: 'Performance analytics',
    body: 'Measure callbacks, stalled stages, and which resume versions are doing the most work.',
    icon: BarChart3,
    color: 'bg-[#a78bfa]'
  },
  {
    title: 'Interview notes',
    body: 'Attach notes to every application so prep, questions, and recruiter context stay together.',
    icon: MessageSquare,
    color: 'bg-[#60a5fa]'
  }
];

export const steps = [
  {
    number: '1',
    title: 'Build your profile',
    body: 'Add resumes, links, skills, work history, and job preferences once.'
  },
  {
    number: '2',
    title: 'Import every job',
    body: 'Paste job links or add applications manually with the resume version you used.'
  },
  {
    number: '3',
    title: 'Track to offer',
    body: 'Move stages, add notes, compare outcomes, and keep follow-ups on rails.'
  }
];

export const faqs = [
  {
    question: 'Is Landed an autofill browser extension?',
    answer:
      'Landed is focused on the full job-search operating system: resume vault, job import, application tracking, interview notes, and analytics. It helps you know what you sent, where you sent it, and what to do next.'
  },
  {
    question: 'Can I manage multiple resumes?',
    answer:
      'Yes. Store multiple resume versions, tag them by role or company type, and attach the exact version to each application.'
  },
  {
    question: 'Which job boards can I import from?',
    answer:
      'Landed supports common job sources such as LinkedIn, Naukri, Greenhouse, Lever, Workday, Ashby, Wellfound, and generic career pages.'
  },
  {
    question: 'Does Landed replace my spreadsheet?',
    answer:
      'That is the idea. Instead of rows and manual notes, you get structured applications, stage history, resume links, notes, and analytics.'
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Yes. Start free with the core tracker and resume vault workflow, then upgrade when you need deeper analytics and power-user limits.'
  }
];

export const roles = [
  { title: 'Active Job Seekers', body: 'Keep dozens of applications moving without spreadsheet drift.', icon: Activity },
  { title: 'Career Switchers', body: 'Test resume variants and learn which positioning gets traction.', icon: Briefcase },
  { title: 'Placement Advisors', body: 'Organize client pipelines, notes, and resume outcomes.', icon: Users }
];
