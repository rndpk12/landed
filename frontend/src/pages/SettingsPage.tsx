import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/userApi';

const schema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Enter a valid email.')
});
type FormValues = z.infer<typeof schema>;

export const SettingsPage = () => {
  const { user, logout, getCurrentUser } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: async () => {
      await getCurrentUser();
      await queryClient.invalidateQueries();
    }
  });
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' }
  });

  const onSubmit = async (values: FormValues) => {
    await mutation.mutateAsync(values);
  };

  return (
    <div className="page-shell">
      <div className="border-b-[3px] border-black pb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f97316]">Account controls</p>
        <h2 className="mt-1 text-[clamp(30px,3vw,42px)] font-black uppercase leading-none tracking-[-0.045em] text-black">Settings</h2>
        <p className="mt-3 text-sm font-bold text-[#555]">Manage your profile and session.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <form className="card p-6" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-lg font-semibold text-slate-950">Profile</h3>
          <p className="mt-1 text-sm text-slate-500">Update the details shown across Landed.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input className="input mt-2" {...register('name')} />
              {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input className="input mt-2 bg-[#f8efe2] text-[#555]" type="email" readOnly {...register('email')} />
              <p className="mt-1 text-xs text-slate-500">Used for sign in.</p>
              {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="btn-primary" type="submit" disabled={mutation.isPending}><Save className="h-4 w-4" />Update Profile</button>
            {isSubmitSuccessful ? <span className="text-sm font-medium text-emerald-600">Saved</span> : null}
          </div>
        </form>
        <aside className="card p-6">
          <h3 className="text-lg font-semibold text-slate-950">Session</h3>
          <p className="mt-1 text-sm text-slate-500">Log out of this device when you are done.</p>
          <button className="mt-6 inline-flex items-center justify-center gap-2 border-[3px] border-black bg-black px-4 py-2.5 text-xs font-black uppercase text-white shadow-[4px_4px_0_#f97316] transition hover:-translate-y-0.5" type="button" onClick={logout}><LogOut className="h-4 w-4" />Logout</button>
        </aside>
      </section>
    </div>
  );
};
