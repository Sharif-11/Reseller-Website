export const TicketStatusBadge = ({ status }: { status: string }) => {
  const statusClasses = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    WAITING_RESPONSE: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  }

  const statusText = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    WAITING_RESPONSE: 'Waiting for Response',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        statusClasses[status as keyof typeof statusClasses]
      }`}
    >
      {statusText[status as keyof typeof statusText]}
    </span>
  )
}

export const TicketPriorityBadge = ({ priority }: { priority: string }) => {
  const priorityClasses = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-yellow-100 text-yellow-800',
    CRITICAL: 'bg-red-100 text-red-800',
  }

  const priorityText = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        priorityClasses[priority as keyof typeof priorityClasses]
      }`}
    >
      {priorityText[priority as keyof typeof priorityText]}
    </span>
  )
}

export const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className='h-12 w-12 object-cover rounded'
        />
      )
    }

    let iconClass = 'text-gray-400'
    let iconPath = ''

    if (file.type.includes('pdf')) {
      iconClass = 'text-red-400'
      iconPath = 'M4 4v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4l-2-2H6a2 2 0 00-2 2z'
    } else if (file.type.includes('word') || file.type.includes('document')) {
      iconClass = 'text-blue-400'
      iconPath =
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      iconClass = 'text-green-400'
      iconPath =
        'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    } else {
      iconPath =
        'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
    }

    return (
      <svg
        className={`h-12 w-12 ${iconClass}`}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={iconPath} />
      </svg>
    )
  }

  return (
    <div className='border border-gray-200 rounded p-2 hover:bg-gray-50 relative'>
      <div className='flex items-center'>
        {getFileIcon()}
        <div className='ml-2 truncate'>
          <p className='text-xs text-gray-700 truncate'>{file.name}</p>
          <p className='text-xs text-gray-500'>{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
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
    </div>
  )
}
