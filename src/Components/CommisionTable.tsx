import { useEffect, useState } from 'react'
import { getCommissionTable, replaceCommissionTable } from '../Api/commission.api'

type TableRow = {
  startPrice: string
  endPrice: string
  levels: string[]
}

const CommissionTable: React.FC = () => {
  const [tableData, setTableData] = useState<TableRow[]>([])
  const [columns, setColumns] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Fetch existing commission table on component mount
  useEffect(() => {
    const fetchCommissionTable = async () => {
      try {
        setIsLoading(true)
        const response = await getCommissionTable()

        if (response.success && response.data) {
          // Transform API data to UI format
          const transformedData = response.data.map((row: any) => ({
            startPrice: row.startPrice.toString(),
            endPrice: row.endPrice ? row.endPrice.toString() : '',
            levels: row.amounts.map((amount: number) => amount.toString()),
          }))

          setTableData(transformedData)

          // Set columns based on levels count
          if (transformedData.length > 0) {
            setColumns(Array.from({ length: transformedData[0].levels.length }, (_, i) => i + 1))
          }
        }
      } catch (error) {
        console.error('Failed to fetch commission table:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommissionTable()
  }, [])

  const addRow = () => {
    setTableData([
      ...tableData,
      { startPrice: '', endPrice: '', levels: Array(columns.length).fill('') },
    ])
    setSaveStatus(null)
  }

  const addColumn = () => {
    const newColumnIndex = columns.length + 1
    setColumns([...columns, newColumnIndex])
    setTableData(
      tableData.map(row => ({
        ...row,
        levels: [...row.levels, ''],
      }))
    )
    setSaveStatus(null)
  }

  const deleteRow = (rowIndex: number) => {
    setTableData(tableData.filter((_, index) => index !== rowIndex))
    setSaveStatus(null)
  }

  const deleteColumn = (colIndex: number) => {
    setColumns(columns.filter((_, index) => index !== colIndex))
    setTableData(
      tableData.map(row => ({
        ...row,
        levels: row.levels.filter((_, index) => index !== colIndex),
      }))
    )
    setSaveStatus(null)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number | null
  ) => {
    const { name, value } = e.target
    setTableData(prevData => {
      const updatedTable = [...prevData]
      if (colIndex === null) {
        updatedTable[rowIndex] = { ...updatedTable[rowIndex], [name]: value }
      } else {
        updatedTable[rowIndex].levels[colIndex] = value
      }
      return updatedTable
    })
    setSaveStatus(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveStatus(null) // Clear previous status

      // Transform UI data to API format
      const apiData = tableData.map(row => ({
        startPrice: parseFloat(row.startPrice),
        endPrice: row.endPrice ? parseFloat(row.endPrice) : null,
        amounts: row.levels.map(level => parseFloat(level)),
      }))

      const response = await replaceCommissionTable(apiData)

      setSaveStatus({
        success: response.success,
        message: response.message || 'Commission table saved successfully',
      })

      if (!response.success) {
        console.error('Save failed:', response.message)
      }
    } catch (error) {
      setSaveStatus({
        success: false,
        message: 'Failed to save commission table',
      })
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6'>কমিশন টেবিল</h1>

      <div className='flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-4'>
        <button
          onClick={addRow}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200 flex items-center justify-center'
          disabled={isSaving}
        >
          <span className='mr-1'>+</span> সারি যোগ করুন
        </button>
        <button
          onClick={addColumn}
          className='px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-200 flex items-center justify-center'
          disabled={isSaving}
        >
          <span className='mr-1'>+</span> লেভেল যোগ করুন
        </button>
        <button
          onClick={handleSave}
          className='px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-200 flex items-center justify-center'
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              সেভ হচ্ছে...
            </>
          ) : (
            'সেভ করুন'
          )}
        </button>
      </div>

      {isSaving && (
        <div className='mb-4 p-3 rounded-lg bg-blue-100 text-blue-800 flex items-center'>
          <svg
            className='animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          আপনার ডাটা সেভ করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
        </div>
      )}

      {saveStatus && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            saveStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      <div className='overflow-x-auto'>
        <table className='min-w-full table-auto border-collapse border border-gray-300'>
          <thead>
            <tr>
              <th className='px-4 py-2 border border-gray-300 text-left bg-gray-100 whitespace-nowrap'>
                শুরু মূল্য
              </th>
              <th className='px-4 py-2 border border-gray-300 text-left bg-gray-100 whitespace-nowrap'>
                শেষ মূল্য
              </th>
              {columns.map((level, index) => (
                <th
                  key={index}
                  className='px-4 py-2 border border-gray-300 text-left bg-gray-100 whitespace-nowrap'
                >
                  লেভেল {level}
                  <button
                    onClick={() => deleteColumn(index)}
                    className='ml-2 text-red-500 hover:text-red-700'
                    aria-label='Delete column'
                    disabled={isSaving}
                  >
                    ❌
                  </button>
                </th>
              ))}
              <th className='px-4 py-2 border border-gray-300 text-left bg-gray-100'>অপশন</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className='px-4 py-4 text-center text-gray-500'>
                  কোনো ডাটা পাওয়া যায়নি। সারি যোগ করুন।
                </td>
              </tr>
            ) : (
              tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className='hover:bg-gray-50'>
                  <td className='px-4 py-2 border border-gray-300'>
                    <input
                      type='number'
                      name='startPrice'
                      value={row.startPrice}
                      onChange={e => handleInputChange(e, rowIndex, null)}
                      placeholder='শুরু মূল্য'
                      min='0.01'
                      step='0.01'
                      className='w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      disabled={isSaving}
                    />
                  </td>
                  <td className='px-4 py-2 border border-gray-300'>
                    <input
                      type='number'
                      name='endPrice'
                      value={row.endPrice}
                      onChange={e => handleInputChange(e, rowIndex, null)}
                      placeholder={rowIndex === tableData.length - 1 ? '' : 'শেষ মূল্য'}
                      min='0.01'
                      step='0.01'
                      disabled={rowIndex === tableData.length - 1 || isSaving}
                      className={`w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        rowIndex === tableData.length - 1 ? 'bg-gray-100' : ''
                      }`}
                    />
                  </td>
                  {row.levels.map((level, colIndex) => (
                    <td key={colIndex} className='px-4 py-2 border border-gray-300'>
                      <input
                        type='number'
                        value={level}
                        onChange={e => handleInputChange(e, rowIndex, colIndex)}
                        placeholder={`লেভেল ${columns[colIndex]}`}
                        min='0.01'
                        step='0.01'
                        className='w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        disabled={isSaving}
                      />
                    </td>
                  ))}
                  <td className='px-4 py-2 border border-gray-300 text-center'>
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className='text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors'
                      aria-label='Delete row'
                      disabled={isSaving}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {tableData.length > 0 && (
        <div className='mt-4 text-sm text-gray-600'>
          <p className='font-semibold'>নির্দেশনা:</p>
          <ul className='list-disc pl-5 space-y-1'>
            <li>শেষ সারির শেষ মূল্য ফাঁকা রাখুন (যেমন: 1500+)</li>
            <li>সমস্ত মূল্য ০ এর বেশি হতে হবে</li>
            <li>পরিসীমা ওভারল্যাপ করা যাবে না</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default CommissionTable
