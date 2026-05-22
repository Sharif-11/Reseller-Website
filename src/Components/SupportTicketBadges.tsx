import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaRegCircle,
  FaSpinner,
  FaTimesCircle,
} from 'react-icons/fa'

export const TicketStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    { label: string; icon: JSX.Element; color: string; bg: string }
  > = {
    OPEN: {
      label: 'খোলা',
      icon: <FaRegCircle className='h-3 w-3' />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    IN_PROGRESS: {
      label: 'প্রক্রিয়াধীন',
      icon: <FaSpinner className='h-3 w-3 animate-spin' />,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    WAITING_RESPONSE: {
      label: 'অপেক্ষমান',
      icon: <FaClock className='h-3 w-3' />,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    RESOLVED: {
      label: 'সমাধানকৃত',
      icon: <FaCheckCircle className='h-3 w-3' />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    CLOSED: {
      label: 'বন্ধ',
      icon: <FaTimesCircle className='h-3 w-3' />,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    },
  }

  const config = statusConfig[status] || statusConfig.OPEN

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

export const TicketPriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig: Record<
    string,
    { label: string; icon: JSX.Element; color: string; bg: string }
  > = {
    LOW: {
      label: 'নিম্ন',
      icon: <FaCheckCircle className='h-3 w-3' />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    MEDIUM: {
      label: 'মধ্যম',
      icon: <FaRegCircle className='h-3 w-3' />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    HIGH: {
      label: 'উচ্চ',
      icon: <FaExclamationTriangle className='h-3 w-3' />,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    CRITICAL: {
      label: 'জরুরি',
      icon: <FaExclamationTriangle className='h-3 w-3' />,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
  }

  const config = priorityConfig[priority] || priorityConfig.MEDIUM

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

export const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  return (
    <div className='relative group'>
      <img
        src={URL.createObjectURL(file)}
        alt={file.name}
        className='h-16 w-16 object-cover rounded-lg border border-gray-200'
      />
      <button
        onClick={onRemove}
        className='absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors shadow-sm'
      >
        <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity'>
        <span className='text-white text-[10px] font-medium'>প্রিভিউ</span>
      </div>
    </div>
  )
}
