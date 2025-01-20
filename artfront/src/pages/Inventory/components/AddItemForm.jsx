import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { searchCategories, addItem } from '../../../store/slices/inventorySlice';
import { debounce } from 'lodash';

const INITIAL_ITEM_STATE = {
  name: '',
  category: '',
  stock: '',
  splitting_drawing_cost: '',
  carving_cutting_cost: '',
  sanding_cost: '',
  painting_cost: '',
  finishing_cost: '',
  packaging_cost: '',
  selling_price: ''
};

const COST_FIELDS = [
  'splitting_drawing_cost',
  'carving_cutting_cost',
  'sanding_cost',
  'painting_cost',
  'finishing_cost',
  'packaging_cost'
];

function AddItemForm({ onClose }) {
  const dispatch = useDispatch();
  const { categorySearchResults, categorySearchLoading, loading } = useSelector((state) => state.inventory);
  const [newItem, setNewItem] = useState(INITIAL_ITEM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const formRef = useRef(null);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.trim()) {
        dispatch(searchCategories(term));
      }
    }, 300),
    [dispatch]
  );

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newItem.name.trim()) errors.name = "Name is required";
    if (!newItem.category.trim()) errors.category = "Category is required";
    if (!newItem.stock) errors.stock = "Initial stock is required";
    if (!newItem.selling_price) errors.selling_price = "Selling price is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const itemToSubmit = {
      ...newItem,
      name: newItem.name.trim(),
      category: newItem.category.trim(),
      stock: parseInt(newItem.stock, 10),
      selling_price: parseFloat(newItem.selling_price),
      ...Object.fromEntries(
        COST_FIELDS.map(field => [field, parseFloat(newItem[field]) || 0])
      )
    };

    try {
      const resultAction = await dispatch(addItem(itemToSubmit));
      if (addItem.fulfilled.match(resultAction)) {
        onClose();
      } else if (addItem.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (typeof error === 'object' && error !== null) {
          setFormErrors(error);
        } else {
          setFormErrors({ submit: error || 'An unexpected error occurred' });
        }
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setFormErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  }, [dispatch, newItem, onClose]);

  const handleCategoryChange = useCallback((e) => {
    const value = e.target.value;
    setNewItem(prev => ({ ...prev, category: value }));
    
    if (value.trim()) {
      debouncedSearch(value);
    }
  }, [debouncedSearch]);

  const handleCategorySelect = useCallback((categoryName) => {
    setNewItem(prev => ({ ...prev, category: categoryName }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const formatFieldName = (field) => {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" ref={formRef}>
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Item</h3>
          <form onSubmit={handleFormSubmit} className="mt-2 text-left">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={newItem.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
              {formErrors.name && <p className="text-red-500 text-xs italic">{formErrors.name}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <div className="relative">
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={newItem.category}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
                {categorySearchLoading && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
                
                {/* Move the dropdown inside the relative div and adjust styling */}
                {newItem.category && categorySearchResults.length > 0 && (
                  <ul className="absolute left-0 right-0 z-50 mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-300">
                    {categorySearchResults.map((category) => (
                      <li
                        key={category.id}
                        className="cursor-pointer px-4 py-2 hover:bg-blue-50 text-gray-900"
                        onClick={() => {
                          handleCategorySelect(category.name);
                          // Clear the search results after selection
                          dispatch({ type: 'inventory/clearCategorySearch' });
                        }}
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {formErrors.category && <p className="text-red-500 text-xs italic">{formErrors.category}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Initial Stock</label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={newItem.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                min="0"
              />
              {formErrors.stock && <p className="text-red-500 text-xs italic">{formErrors.stock}</p>}
            </div>

            {COST_FIELDS.map((field) => (
              <div key={field} className="mb-4">
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">{formatFieldName(field)}</label>
                <input
                  type="number"
                  name={field}
                  id={field}
                  value={newItem[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="0"
                  step="0.01"
                />
              </div>
            ))}

            <div className="mb-4">
              <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">Selling Price</label>
              <input
                type="number"
                name="selling_price"
                id="selling_price"
                value={newItem.selling_price}
                onChange={(e) => handleInputChange('selling_price', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                min="0"
                step="0.01"
              />
              {formErrors.selling_price && <p className="text-red-500 text-xs italic">{formErrors.selling_price}</p>}
            </div>

            {formErrors.submit && (
              <p className="text-red-500 text-sm italic mb-4">{formErrors.submit}</p>
            )}

            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                className="inline-flex justify-center w-1/2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

AddItemForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddItemForm;