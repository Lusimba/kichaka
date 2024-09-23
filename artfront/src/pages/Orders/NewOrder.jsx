import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, fetchInventoryItems, createOrder, createOrderItem } from '../../store/slices/orderSlice';

function NewOrder() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers, inventoryItems } = useSelector(state => state.orders);

  const [customerName, setCustomerName] = useState('');
  const [currentItem, setCurrentItem] = useState({ product: '', quantity: 1, notes: '' });
  const [orderItems, setOrderItems] = useState([]);
  const [suggestions, setSuggestions] = useState({ customers: [], products: [] });
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const handleCustomerChange = (e) => {
    const value = e.target.value;
    setCustomerName(value);
    setShowCustomerSuggestions(true);
    if (value) {
      dispatch(fetchCustomers(value));
    } else {
      setSuggestions(prev => ({ ...prev, customers: [] }));
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
    if (name === 'product' && value) {
      dispatch(fetchInventoryItems(value));
    } else if (name === 'product') {
      setSuggestions(prev => ({ ...prev, products: [] }));
    }
  };

  useEffect(() => {
    if (customers.results) {
      const filteredCustomers = customers.results.filter(customer => 
        customer.name.toLowerCase().includes(customerName.toLowerCase())
      );
      setSuggestions(prev => ({
        ...prev,
        customers: filteredCustomers.slice(0, 5)
      }));
    }
  }, [customers, customerName]);

  useEffect(() => {
    if (inventoryItems.results) {
      setSuggestions(prev => ({
        ...prev,
        products: inventoryItems.results.slice(0, 5)
      }));
    }
  }, [inventoryItems]);

  const selectCustomerSuggestion = (customer) => {
    setCustomerName(customer.name);
    setShowCustomerSuggestions(false);
    setSuggestions(prev => ({ ...prev, customers: [] }));
  };

  const selectProductSuggestion = (product) => {
    setCurrentItem(prev => ({
      ...prev,
      itemId: product.id,
      product: `${product.sku} - ${product.name}`
    }));
    setSuggestions(prev => ({ ...prev, products: [] }));
  };

  const addItem = () => {
    if (currentItem.itemId && currentItem.quantity > 0) {
      setOrderItems([...orderItems, currentItem]);
      setCurrentItem({ itemId: null, product: '', quantity: 1, notes: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedCustomer = suggestions.customers.find(c => c.name === customerName);
    if (!selectedCustomer) {
      alert("Please select a valid customer from the suggestions.");
      return;
    }
    
    try {
      const orderData = { customer_id: selectedCustomer.id };
      const orderResult = await dispatch(createOrder(orderData)).unwrap();

      let allItemsAdded = true;
      for (const item of orderItems) {
        if (!item.itemId) continue;
        
        const orderItemData = {
          order_id: orderResult.id,
          item_id: item.itemId,
          quantity: parseInt(item.quantity),
          notes: item.notes
        };
        
        try {
          await dispatch(createOrderItem(orderItemData)).unwrap();
        } catch (itemError) {
          console.error('Error creating order item:', itemError);
          allItemsAdded = false;
          break;  // Stop adding items if one fails
        }
      }

      if (allItemsAdded) {
        alert("Order and all items created successfully!");
        navigate('/orders');
      } else {
        // If any item failed to add, delete the order
        // You'll need to implement a deleteOrder action in your orderSlice
        await dispatch(deleteOrder(orderResult.id)).unwrap();
        alert("Failed to add all items to the order. The order was not created. Please try again.");
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(`Error: ${error.message || 'An unexpected error occurred while creating the order.'}. Please try again.`);
    }
  };

  return (
    <div className='max-w-6xl mx-auto'>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">New Order</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Customer input field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerName">
            Customer Name
          </label>
          <input
            className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="customerName"
            type="text"
            value={customerName}
            onChange={handleCustomerChange}
            required
          />
          {showCustomerSuggestions && suggestions.customers.length > 0 && (
            <ul className="bg-white w-1/3 border border-gray-300 mt-1 rounded-md shadow-lg">
              {suggestions.customers.map((customer, index) => (
                <li 
                  key={index} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectCustomerSuggestion(customer)}
                >
                  {customer.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Add item section */}
        <div className="mb-4 p-4 border rounded">
          <h3 className="font-bold mb-2">Add Item</h3>
          <div className="w-1/2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product">
                Product
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="product"
                type="text"
                name="product"
                value={currentItem.product}
                onChange={handleItemChange}
                placeholder="Search by SKU or product name"
              />
              {suggestions.products.length > 0 && (
                <ul className="bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
                  {suggestions.products.map((product, index) => (
                    <li 
                      key={index} 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectProductSuggestion(product)}
                    >
                      {product.sku} - {product.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                Quantity
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="quantity"
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleItemChange}
                required
                min="1"
              />
            </div>
          </div>
          <div className='w-1/2'>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="notes"
              name="notes"
              value={currentItem.notes}
              onChange={handleItemChange}
              rows="2"
            ></textarea>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Item
          </button>
        </div>
        
        {/* Order items table */}
        {orderItems.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold mb-2">Order Items</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Submit button */}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewOrder;