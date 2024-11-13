// src/app/(admin)/inventory/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  Search, 
  Plus,
  AlertTriangle,
  Package,
  RefreshCcw,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  item_type: string;
  item_name: string;
  sku: string;
  quantity: number;
  low_stock_threshold: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    item_type: '',
    item_name: '',
    sku: '',
    quantity: 0,
    low_stock_threshold: 10,
    category: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          ...newItem,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setInventory([...(data || []), ...inventory]);
      setIsAddingItem(false);
      setNewItem({
        item_type: '',
        item_name: '',
        sku: '',
        quantity: 0,
        low_stock_threshold: 10,
        category: ''
      });
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setInventory(inventory.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInventory(inventory.filter(item => item.id !== id));
      toast.success('Item deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={() => setIsAddingItem(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      {isAddingItem && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                className="border rounded-lg px-4 py-2"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
              />
              <input
                type="text"
                placeholder="SKU"
                className="border rounded-lg px-4 py-2"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
              />
              <input
                type="text"
                placeholder="Category"
                className="border rounded-lg px-4 py-2"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
              <input
                type="number"
                placeholder="Quantity"
                className="border rounded-lg px-4 py-2"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Low Stock Threshold"
                className="border rounded-lg px-4 py-2"
                value={newItem.low_stock_threshold}
                onChange={(e) => setNewItem({ ...newItem, low_stock_threshold: parseInt(e.target.value) })}
              />
              <select
                className="border rounded-lg px-4 py-2"
                value={newItem.item_type}
                onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="qr_code">QR Code</option>
                <option value="nfc_card">NFC Card</option>
                <option value="sign">Sign</option>
                <option value="taxi_light">Taxi Light</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsAddingItem(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addInventoryItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Inventory List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.item_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.item_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1 text-sm"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity <= item.low_stock_threshold ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {/* Add edit functionality */}}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}