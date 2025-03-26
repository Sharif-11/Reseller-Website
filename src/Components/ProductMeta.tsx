import { useState, useEffect } from "react";
import axios from "axios";
import flattenKeyValues, { unflattenKeyValues } from "../utils/product.utils";
import { addProductMeta, getProductMeta } from "../Api/product.api";

interface MetaInfo {
  key: string;
  values: string[];
}

interface ProductMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  initialMeta?: MetaInfo[];
}

const predefinedKeys = ["size", "color"];

const ProductMetaModal = ({
  isOpen,
  onClose,
  productId,
  initialMeta = [],
}: ProductMetaModalProps) => {
  const [metaInfo, setMetaInfo] = useState<MetaInfo[]>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
 useEffect(()=>{
   const fetchMeta = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const { success, data, message } = await getProductMeta(productId);
        if (success) {
          setMetaInfo(unflattenKeyValues(data));
        } else {
          setError(message);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
          setError(error.response.data.message || "Failed to fetch meta information");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMeta()
 },[])
  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
    }
  }, [isOpen]);

  const validateMeta = (): boolean => {
    const errors: Record<string, string> = {};
    const keys = new Set<string>();

    metaInfo.forEach((item, index) => {
      const keyPath = `key-${index}`;
      const valuePathPrefix = `values-${index}`;

      // Validate key
      if (!item.key.trim()) {
        errors[keyPath] = "Key cannot be empty";
      } else if (keys.has(item.key.toLowerCase())) {
        errors[keyPath] = "Duplicate key";
      } else {
        keys.add(item.key.toLowerCase());
      }

      // Validate values
      const uniqueValues = new Set<string>();
      item.values.forEach((value, valueIndex) => {
        const valuePath = `${valuePathPrefix}-${valueIndex}`;
        if (!value.trim()) {
          errors[valuePath] = "Value cannot be empty";
        } else if (uniqueValues.has(value.toLowerCase())) {
          errors[valuePath] = "Duplicate value for this key";
        } else {
          uniqueValues.add(value.toLowerCase());
        }
      });
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNewKey = () => {
    setMetaInfo([...metaInfo, { key: "", values: [""] }]);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const updatedMeta = [...metaInfo];
    updatedMeta[index].key = newKey;
    setMetaInfo(updatedMeta);
    validateMeta();
  };

  const handleValueChange = (keyIndex: number, valueIndex: number, newValue: string) => {
    const updatedMeta = [...metaInfo];
    updatedMeta[keyIndex].values[valueIndex] = newValue;
    setMetaInfo(updatedMeta);
    validateMeta();
  };

  const handleAddValue = (keyIndex: number) => {
    const updatedMeta = [...metaInfo];
    updatedMeta[keyIndex].values.push("");
    setMetaInfo(updatedMeta);
  };

  const handleRemoveValue = (keyIndex: number, valueIndex: number) => {
    const updatedMeta = [...metaInfo];
    updatedMeta[keyIndex].values.splice(valueIndex, 1);
    setMetaInfo(updatedMeta);
    validateMeta();
  };

  const handleRemoveKey = (keyIndex: number) => {
    const updatedMeta = [...metaInfo];
    updatedMeta.splice(keyIndex, 1);
    setMetaInfo(updatedMeta);
    validateMeta();
  };

  const handleSubmit = async () => {
    if (!validateMeta()) {
      setError("Please fix validation errors before submitting");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      
      // Filter out empty keys (though validation should prevent this)
      const filteredMeta = metaInfo.filter(item => item.key.trim() !== "");
      const flattenedMeta = flattenKeyValues(filteredMeta);
      const {success, message} = await addProductMeta(productId, flattenedMeta);
        if(success){
            setSuccess(message);
         
        } else {
            setError(message);
        }
      
    
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        setError(error.response.data.message || "Failed to save meta information");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Add Product Meta Information</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {metaInfo.map((item, keyIndex) => {
            const keyError = validationErrors[`key-${keyIndex}`];
            return (
              <div key={keyIndex} className="border p-2 sm:p-3 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <div className="flex-1">
                    <select
                      value={item.key}
                      onChange={(e) => handleKeyChange(keyIndex, e.target.value)}
                      className={`w-full border rounded p-1 sm:p-2 text-sm sm:text-base ${keyError ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select or type a key</option>
                      {predefinedKeys.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                    {keyError && (
                      <p className="text-red-500 text-xs mt-1">{keyError}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleKeyChange(keyIndex, e.target.value)}
                      placeholder="Or enter custom key"
                      className={`w-full border rounded p-1 sm:p-2 text-sm sm:text-base ${keyError ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveKey(keyIndex)}
                    className="bg-red-500 text-white p-1 sm:p-2 rounded hover:bg-red-600 text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-2 sm:ml-4">
                  {item.values.map((value, valueIndex) => {
                    const valueError = validationErrors[`values-${keyIndex}-${valueIndex}`];
                    return (
                      <div key={valueIndex} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              handleValueChange(keyIndex, valueIndex, e.target.value)
                            }
                            placeholder="Enter value"
                            className={`flex-1 border rounded p-1 sm:p-2 text-sm sm:text-base ${valueError ? 'border-red-500' : ''}`}
                          />
                          {item.values.length > 1 && (
                            <button
                              onClick={() => handleRemoveValue(keyIndex, valueIndex)}
                              className="bg-red-500 text-white p-1 rounded hover:bg-red-600 text-sm sm:text-base"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                        {valueError && (
                          <p className="text-red-500 text-xs mt-1">{valueError}</p>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => handleAddValue(keyIndex)}
                    className="text-blue-500 text-xs sm:text-sm hover:underline"
                  >
                    + Add another value
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleAddNewKey}
            className="bg-gray-200 hover:bg-gray-300 p-2 rounded w-full text-sm sm:text-base"
          >
            + Add New Key
          </button>
        </div>

        {error && <p className="text-red-500 mt-3 sm:mt-4 text-sm sm:text-base text-center p-1 ">{error}</p>}
        {success && <p className="text-green-500 mt-3 sm:mt-4 text-sm sm:text-base text-center p-1 ">{success}</p>}

        <div className="flex justify-end gap-2 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="px-3 py-1 sm:px-4 sm:py-2 border rounded hover:bg-gray-100 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(validationErrors).length > 0}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductMetaModal;