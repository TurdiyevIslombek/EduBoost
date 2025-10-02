import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex w-full justify-center">
      <SignUp afterSignUpUrl="/home" appearance={{ elements: { card: 'shadow-none bg-transparent', formButtonPrimary: 'rounded-full' } }} />
    </div>
  );
}