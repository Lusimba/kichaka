import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaSave, FaPlus } from 'react-icons/fa';

const UpdateStockModal = ({ item, onClose, onUpdate }) => {
  const [stockToAdd, setStockToAdd] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (stockToAdd !== '') {
      onUpdate(item.id, parseInt(stockToAdd, 10));
      onClose();
    }
  }, [item.id, onUpdate, onClose, stockToAdd]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Add to Inventory</h3>
        <p className="mb-4">Adding stock for: {item.name}</p>
        <p className="mb-2">Current stock: {item.stock}</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="stockToAdd" className="block text-sm font-medium text-gray-700 mb-2">
            Quantity to add:
          </label>
          <input
            id="stockToAdd"
            type="number"
            value={stockToAdd}
            onChange={(e) => setStockToAdd(e.target.value)}
            placeholder="Enter quantity to add"
            className="w-full p-2 mb-4 border rounded"
            min="1"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={stockToAdd === ''}
            >
              Add to Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UpdateStockModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    stock: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

const ItemList = ({ items, onBatchUpdateStock, onSingleUpdateStock, onItemSelect, selectedItemId }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedStocks, setEditedStocks] = useState({});
  const [updateModalItem, setUpdateModalItem] = useState(null);

  const handleBatchUpdateClick = useCallback(() => {
    if (editMode) {
      onBatchUpdateStock(editedStocks);
      setEditMode(false);
      setEditedStocks({});
    } else {
      setEditMode(true);
    }
  }, [editMode, onBatchUpdateStock, editedStocks]);

  const handleSingleUpdateClick = useCallback((item) => {
    setUpdateModalItem(item);
  }, []);

  const handleStockChange = useCallback((itemId, value) => {
    setEditedStocks(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const isLowStock = useCallback((stock) => stock < 50, []); // Define low stock threshold

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={handleBatchUpdateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {editMode ? <><FaSave className="mr-2" /> Save All</> : <><FaEdit className="mr-2" /> Edit Inventory</>}
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr 
              key={item.id} 
              onClick={() => onItemSelect(item)}
              className={`cursor-pointer hover:bg-gray-100 ${selectedItemId === item.id ? 'bg-blue-100' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.sku || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.category_details.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editMode ? (
                  <input
                    type="number"
                    value={editedStocks[item.id] !== undefined ? editedStocks[item.id] : item.stock}
                    onChange={(e) => handleStockChange(item.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent row selection when editing
                    className="w-20 p-1 border rounded"
                  />
                ) : (
                  <span className={isLowStock(item.stock) ? 'text-red-600 font-bold' : ''}>{item.stock}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">${parseFloat(item.selling_price).toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSingleUpdateClick(item);
                  }}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2"
                >
                  <FaPlus className="mr-1" /> Add Stock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {updateModalItem && (
        <UpdateStockModal
          item={updateModalItem}
          onClose={() => setUpdateModalItem(null)}
          onUpdate={onSingleUpdateStock}
        />
      )}
    </div>
  );
};

ItemList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      sku: PropTypes.string,
      name: PropTypes.string.isRequired,
      category_details: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      stock: PropTypes.number.isRequired,
      selling_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  onBatchUpdateStock: PropTypes.func.isRequired,
  onSingleUpdateStock: PropTypes.func.isRequired,
  onItemSelect: PropTypes.func.isRequired,
  selectedItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ItemList;