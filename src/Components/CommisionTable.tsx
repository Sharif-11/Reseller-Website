import { useState } from "react";

const CommissionTable = () => {
  const [tableData, setTableData] = useState([]); // Start with an empty table
  const [columns, setColumns] = useState([]); // Start with no columns

  // Function to handle row addition
  const addRow = () => {
    setTableData([
      ...tableData,
      { startPrice: "", endPrice: "", levels: Array(columns.length).fill("") },
    ]);
  };

  // Function to handle column (level) addition
  const addColumn = () => {
    const newColumnIndex = columns.length + 1;
    setColumns([...columns, newColumnIndex]);
    setTableData(
      tableData.map((row) => ({
        ...row,
        levels: [...row.levels, ""],
      }))
    );
  };

  // Function to handle row deletion
  const deleteRow = (rowIndex) => {
    const updatedTable = tableData.filter((_, index) => index !== rowIndex);
    setTableData(updatedTable);
  };

  // Function to handle column (level) deletion
  const deleteColumn = (colIndex) => {
    const updatedColumns = columns.filter((_, index) => index !== colIndex);
    setColumns(updatedColumns);
    setTableData(
      tableData.map((row) => {
        const updatedLevels = row.levels.filter(
          (_, index) => index !== colIndex
        );
        return { ...row, levels: updatedLevels };
      })
    );
  };

  // Function to handle input changes
  const handleInputChange = (e, rowIndex, colIndex) => {
    const { name, value } = e.target;
    const updatedTable = [...tableData];

    if (name === "startPrice" || name === "endPrice") {
      updatedTable[rowIndex][name] = value;
    } else {
      updatedTable[rowIndex].levels[colIndex] = value;
    }

    setTableData(updatedTable);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        >
          Add Row
        </button>
        <button
          onClick={addColumn}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-200"
        >
          Add Level
        </button>
      </div>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 border border-gray-300 text-left bg-gray-100">
              Start Price
            </th>
            <th className="px-4 py-2 border border-gray-300 text-left bg-gray-100">
              End Price
            </th>
            {columns.map((level, index) => (
              <th
                key={index}
                className="px-4 py-2 border border-gray-300 text-left bg-gray-100"
              >
                Level {level}
                <button
                  onClick={() => deleteColumn(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="px-4 py-2 border border-gray-300">
                <input
                  type="number"
                  name="startPrice"
                  value={row.startPrice}
                  onChange={(e) => handleInputChange(e, rowIndex, null)}
                  placeholder="Start Price"
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-2 border border-gray-300">
                <input
                  type="number"
                  name="endPrice"
                  value={row.endPrice}
                  onChange={(e) => handleInputChange(e, rowIndex, null)}
                  placeholder="End Price"
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              {row.levels.map((level, colIndex) => (
                <td key={colIndex} className="px-4 py-2 border border-gray-300">
                  <input
                    type="number"
                    value={level}
                    onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                    placeholder={`Level ${columns[colIndex]}`}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              ))}
              <td className="px-4 py-2 border border-gray-300">
                <button
                  onClick={() => deleteRow(rowIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionTable;
