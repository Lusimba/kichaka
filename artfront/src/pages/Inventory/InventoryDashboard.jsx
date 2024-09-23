import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBoxOpen, FaClipboardList, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import {
  fetchCategories,
  fetchInventoryData,
  fetchLowStockItems,
  batchUpdateStock,
  updateSingleStock,
  addItem,
  addCategory
} from '../../store/slices/inventorySlice';
import Pagination from '../../components/Pagination';
import SummaryCard from './components/SummaryCard';
import ActionButton from './components/ActionButton';
import ItemList from './components/ItemList';
import CategoryList from './components/CategoryList';
import AddItemForm from './components/AddItemForm';
import AddCategoryForm from './components/AddCategoryForm';

function InventoryDashboard() {
  const dispatch = useDispatch();
  const { items, categories, lowStockItems, loading, error } = useSelector(state => state.inventory);
  const [activeView, setActiveView] = useState('totalItems');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalItems = useMemo(() => items?.count || 0, [items]);
  const lowStockCount = useMemo(() => lowStockItems?.count || 0, [lowStockItems]);

  useEffect(() => {
    dispatch( fetchCategories() );
    dispatch( fetchInventoryData( { page: currentPage, searchTerm } ) );
    dispatch( fetchLowStockItems( { page: currentPage, searchTerm } ) );
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    if (activeView === 'lowStockItems') {
      dispatch(fetchLowStockItems({ page: currentPage, searchTerm }));
    } else if (activeView === 'totalItems') {
      dispatch(fetchInventoryData({ page: currentPage, searchTerm }));
    }
  }, [dispatch, activeView, currentPage, searchTerm]);

  const handleBatchUpdateStock = useCallback(async (updatedStocks) => {
    try {
      await dispatch( batchUpdateStock( updatedStocks ) ).unwrap();
      dispatch(fetchLowStockItems({ page: currentPage, searchTerm }));
      dispatch(fetchInventoryData({ page: currentPage, searchTerm }));
    } catch (error) {
      console.error('Failed to update stocks:', error);
    }
  }, [dispatch, currentPage, searchTerm]);

  const handleSingleUpdateStock = useCallback(async (itemId, newStock) => {
    try {
      await dispatch(updateSingleStock({ itemId, newStock })).unwrap();
      if (activeView === 'lowStockItems') {
        dispatch(fetchLowStockItems({ page: currentPage, searchTerm }));
      } else {
        dispatch(fetchInventoryData({ page: currentPage, searchTerm }));
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  }, [dispatch, activeView, currentPage, searchTerm]);

  const handleAddItem = useCallback(async (itemData) => {
    try {
      const result = await dispatch(addItem(itemData)).unwrap();
      setShowAddItemForm(false);
      
      // Refresh inventory data
      dispatch(fetchInventoryData({ page: currentPage, searchTerm }));
      
      // Check if the new item is a low stock item and update accordingly
      if (result.stock <= result.low_stock_threshold) {
        dispatch(fetchLowStockItems({ page: 1, searchTerm: '' }));
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  }, [dispatch, currentPage, searchTerm]);

  const handleAddCategory = useCallback(async (categoryData) => {
    try {
      await dispatch(addCategory(categoryData)).unwrap();
      setShowAddCategoryForm(false);
      dispatch(fetchCategories());
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  }, [dispatch]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const renderListView = useCallback(() => {
    let displayItems, totalCount;

    switch (activeView) {
      case 'totalItems':
        displayItems = items?.results || [];
        totalCount = totalItems;
        break;
      case 'categories':
        displayItems = categories.results;
        totalCount = categories.count;
        break;
      case 'lowStockItems':
        displayItems = lowStockItems?.results || [];
        totalCount = lowStockCount;
        break;
      default:
        return null;
    }

    const totalPages = Math.ceil(totalCount / 10);

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {activeView === 'totalItems' && 'All Items'}
          {activeView === 'categories' && 'Categories'}
          {activeView === 'lowStockItems' && 'Low Stock Items'}
        </h3>
        {activeView !== 'categories' && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-2 border rounded-md"
            />
          </div>
        )}
        {activeView === 'categories' ? (
          <CategoryList categories={displayItems} />
        ) : (
          <ItemList 
            items={displayItems} 
            onBatchUpdateStock={handleBatchUpdateStock}
            onSingleUpdateStock={handleSingleUpdateStock}
            onItemSelect={setSelectedItem}
            selectedItemId={selectedItem?.id}
          />
        )}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  }, [activeView, items, categories, lowStockItems, totalItems, lowStockCount, searchTerm, currentPage, handleSearch, handleBatchUpdateStock, handleSingleUpdateStock, selectedItem, handlePageChange]);

  if (loading && !items.results.length) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Inventory Management Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SummaryCard 
          icon={<FaBoxOpen />} 
          title="Total Items" 
          value={totalItems} 
          onClick={() => { setActiveView('totalItems'); setCurrentPage(1); }} 
        />
        <SummaryCard 
          icon={<FaClipboardList />} 
          title="Categories" 
          value={categories.count} 
          onClick={() => { setActiveView('categories'); setCurrentPage(1); }} 
        />
        <SummaryCard 
          icon={<FaExclamationTriangle />} 
          title="Low Stock Items" 
          value={lowStockCount} 
          color="text-yellow-500" 
          onClick={() => { setActiveView('lowStockItems'); setCurrentPage(1); }} 
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {activeView === 'categories' ? (
          <ActionButton 
            icon={<FaPlus />} 
            text="Add New Category" 
            onClick={() => setShowAddCategoryForm(true)} 
          />
        ) : (
          <ActionButton 
            icon={<FaPlus />} 
            text="Add New Item" 
            onClick={() => setShowAddItemForm(true)} 
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Pane - List View */}
        <div className="w-full bg-white shadow overflow-hidden sm:rounded-lg p-6">
          {renderListView()}
        </div>
      </div>

      {/* Add New Item Form Popup */}
      {showAddItemForm && (
        <AddItemForm onClose={() => setShowAddItemForm(false)} onAddItem={handleAddItem} />
      )}
      
      {/* Add New Category Form Popup */}
      {showAddCategoryForm && (
        <AddCategoryForm onClose={() => setShowAddCategoryForm(false)} onAddCategory={handleAddCategory} />
      )}
    </div>
  );
}

export default InventoryDashboard;