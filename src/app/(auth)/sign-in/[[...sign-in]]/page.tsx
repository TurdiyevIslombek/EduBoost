import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex w-full justify-center">
      <SignIn afterSignInUrl="/home" appearance={{ elements: { card: 'shadow-none bg-transparent', formButtonPrimary: 'rounded-full' } }} />
    </div>
  );
}