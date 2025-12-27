import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex w-full justify-center">
      <SignIn 
        afterSignInUrl="/home" 
        appearance={{ 
          elements: { 
            card: 'shadow-none bg-transparent border-0',
            formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25',
            formFieldInput: 'rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500',
            footerActionLink: 'text-emerald-600 hover:text-emerald-700',
            identityPreviewEditButton: 'text-emerald-600 hover:text-emerald-700',
            formFieldLabel: 'text-slate-700',
            headerTitle: 'text-slate-800',
            headerSubtitle: 'text-slate-500',
            socialButtonsBlockButton: 'border-slate-200 hover:bg-slate-50 rounded-xl',
            dividerLine: 'bg-slate-200',
            dividerText: 'text-slate-400',
          } 
        }} 
      />
    </div>
  );
}
