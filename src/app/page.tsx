import Chat from '@/components/Chat';
import Time from '@/components/Time';

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center max-w-6xl overflow-hidden bg-slate-400  rounded-2xl antialiased mx-auto w-full">
      <Chat />
    </section>
  );
}
