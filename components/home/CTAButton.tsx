'use client';

import { useRouter } from 'next/navigation';

export function CTAButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/reparaciones');
  };

  return (
    <button
      onClick={handleClick}
      className="inline-block bg-[#FFC107] text-[#0A2B4E] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#FFD700] transition-all duration-300 transform hover:scale-105 cursor-pointer"
    >
      Agendar reparación
    </button>
  );
}