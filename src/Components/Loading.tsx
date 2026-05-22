// Loading.tsx — BazaarHub design system
// Tokens: navy #1a1a2e · rose #e94560 · cream #f7f6f3
const Loading = () => {
  return (
    <div className='flex min-h-[200px] flex-col items-center justify-center gap-4'>
      {/* Layered spinner — navy outer ring + rose sweep */}
      <div className='relative h-12 w-12'>
        <div className='absolute inset-0 rounded-full border-2 border-[#1a1a2e]/10' />
        <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#e94560]' />
        {/* Inner dot pulse */}
        <div className='absolute inset-[14px] animate-pulse rounded-full bg-[#e94560]/20' />
      </div>
      <p className='text-[12px] font-medium text-gray-400'>লোড হচ্ছে...</p>
    </div>
  )
}

export default Loading
