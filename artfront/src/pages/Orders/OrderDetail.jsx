import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, updateOrderStatus, updateOrderItem, removeOrderItem } from '../../store/slices/orderSlice';

const STATUS_CHOICES = {
  'NEW': 'New',
  'PROCESSING': 'Processing',
  'SHIPPED': 'Shipped',
  'DELIVERED': 'Delivered',
  'CANCELLED': 'Cancelled'
};

function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector(state => state.orders);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedItems, setEditedItems] = useState([]);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentOrder) {
      setEditedStatus(currentOrder.status || '');
      setEditedItems(currentOrder.items ? currentOrder.items.map(item => ({ ...item })) : []);
    }
  }, [currentOrder]);

  const handleStatusChange = (e) => {
    setEditedStatus(e.target.value);
  };

  const handleStatusUpdate = async () => {
    try {
      await dispatch(updateOrderStatus({ orderId: id, status: editedStatus })).unwrap();
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update order status', error);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing && currentOrder && currentOrder.items) {
      setEditedItems(currentOrder.items.map(item => ({ ...item })));
    }
  };

  const handleItemUpdate = (itemId, field, value) => {
    setEditedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleItemRemove = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      try {
        await dispatch(removeOrderItem({ orderId: id, itemId })).unwrap();
        setEditedItems(prevItems => prevItems.filter(item => item.id !== itemId));
      } catch (error) {
        alert(`Failed to remove item: ${error.message}`);
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      for (const item of editedItems) {
        const originalItem = currentOrder.items.find(i => i.id === item.id);
        if (
          item.quantity !== originalItem.quantity ||
          item.notes !== originalItem.notes
        ) {
          await dispatch(updateOrderItem({
            itemId: item.id,
            quantity: item.quantity,
            notes: item.notes
          })).unwrap();
        }
      }
      await dispatch(fetchOrderDetails(id));
      setIsEditing(false);
      // alert('Changes saved successfully');
    } catch (error) {
      alert(`Failed to save changes: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  if (!currentOrder) return <div className="text-center mt-8">Order not found</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Detail</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <p><strong>Order ID:</strong> {currentOrder.order_id || 'N/A'}</p>
        <p><strong>Customer:</strong> {currentOrder.customer || 'N/A'}</p>
        <p><strong>Date:</strong> {currentOrder.date ? new Date(currentOrder.date).toLocaleDateString() : 'N/A'}</p>
        <div>
          <strong>Status:</strong> 
          {isEditing ? (
            <select 
              value={editedStatus} 
              onChange={handleStatusChange}
              className="ml-2 p-1 border rounded"
            >
              {Object.entries(STATUS_CHOICES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          ) : (
            <span className="ml-2">{STATUS_CHOICES[currentOrder.status] || 'N/A'}</span>
          )}
        </div>
        <p><strong>Employee:</strong> {currentOrder.employee || 'N/A'}</p>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-2">Ordered Items</h3>
      <table className="min-w-full divide-y divide-gray-200 mb-6">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            {isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {(isEditing ? editedItems : currentOrder.items || []).map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">{item.sku || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.product_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                  <input
                    type="number"
                    value={item.quantity ?? ''}
                    onChange={(e) => {
                      const newValue = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      handleItemUpdate(item.id, 'quantity', newValue);
                    }}
                    className="w-20 p-1 border rounded"
                  />
                ) : item.quantity ?? ''}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">KES {(item.price || 0).toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">KES {(item.subtotal || 0).toFixed(2)}</td>
              <td className="px-6 py-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) => handleItemUpdate(item.id, 'notes', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                ) : item.notes || 'N/A'}
              </td>
              {isEditing && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => handleItemRemove(item.id)} className="text-red-600 hover:text-red-900">
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
          <tr className="bg-gray-50 font-bold">
            <td className="px-6 py-4 whitespace-nowrap" colSpan={isEditing ? 5 : 4}>Total Amount</td>
            <td className="px-6 py-4 whitespace-nowrap">KES {(currentOrder.total_amount || 0).toFixed(2)}</td>
            <td></td>
            {isEditing && <td></td>}
          </tr>
        </tbody>
      </table>

      <div className="mt-6">
        <Link to="/orders" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">
          Back to List
        </Link>
        <button 
          onClick={toggleEdit} 
          className={`${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded mr-2`}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Order'}
        </button>
        {isEditing && (
          <>
            <button 
              onClick={handleStatusUpdate} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Update Status
            </button>
            <button 
              onClick={handleSaveChanges} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Save Item Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;