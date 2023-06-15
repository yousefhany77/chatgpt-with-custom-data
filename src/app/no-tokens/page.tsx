import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
const Time = dynamic(() => import('@/components/Time'), { ssr: false });

export const revalidate = 0;

async function page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tokens`, {
    next: {
      tags: ['tokens'],
    },
  });

  const data = await res.json();
  const { reset, token } = data;
  if (token > 0 || token === null) {
    redirect('/');
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 prose lg:prose-xl mx-auto ">
      <h1 className="text-4xl font-bold text-center">You have no more Tokens</h1>
      <div className="text-center">
        You can ask 4 questions per hour. You can ask again in
        <br />
        <Time date={reset} />
        <br />
      </div>
      if you are a recruiter, please contact me at{' '}
      <a href="mailto:contact@youssefhany.dev" className="text-blue-600">
        contact@youssefhany.dev
      </a>{' '}
    </div>
  );
}

export default page;
