'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Edit2, AlertCircle } from 'lucide-react';

interface MenuItem {
  name: string;
  price?: string;
  description?: string;
  tags?: string[];
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface MenuReviewProps {
  processedMenu: {
    categories: MenuCategory[];
    confidence: number;
    needsReview: boolean;
  };
  onApprove: (menu: { categories: MenuCategory[] }) => void;
}

export default function MenuReview({ processedMenu, onApprove }: MenuReviewProps) {
  const [categories, setCategories] = useState(processedMenu.categories);
  const [editingItem, setEditingItem] = useState<{
    categoryIndex: number;
    itemIndex: number;
    item: MenuItem;
  } | null>(null);

  const handleItemEdit = (categoryIndex: number, itemIndex: number, item: MenuItem) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex] = item;
    setCategories(newCategories);
    setEditingItem(null);
  };

  const handleCategoryEdit = (index: number, newName: string) => {
    const newCategories = [...categories];
    newCategories[index].name = newName;
    setCategories(newCategories);
  };

  const addCategory = () => {
    setCategories([...categories, { name: 'New Category', items: [] }]);
  };

  const addItem = (categoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push({
      name: 'New Item',
      price: '0.00',
      description: '',
      tags: [],
    });
    setCategories(newCategories);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.splice(itemIndex, 1);
    setCategories(newCategories);
  };

  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  return (
    <div className="space-y-6">
      {/* Confidence Score */}
      <div className="flex items-center space-x-2 text-sm">
        <AlertCircle className={`h-5 w-5 ${
          processedMenu.confidence > 0.8 ? 'text-green-500' : 'text-yellow-500'
        }`} />
        <span className="font-medium">
          Confidence Score: {Math.round(processedMenu.confidence * 100)}%
        </span>
        {processedMenu.needsReview && (
          <span className="text-yellow-600">Please review carefully</span>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <input
                type="text"
                value={category.name}
                onChange={(e) => handleCategoryEdit(categoryIndex, e.target.value)}
                className="font-medium bg-transparent border-none focus:ring-0 p-0"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addItem(categoryIndex)}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  onClick={() => removeCategory(categoryIndex)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-200">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="p-4 hover:bg-gray-50">
                  {editingItem?.categoryIndex === categoryIndex && 
                   editingItem?.itemIndex === itemIndex ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingItem.item.name}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, name: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                        placeholder="Item name"
                      />
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={editingItem.item.price}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, price: e.target.value }
                          })}
                          className="w-24 p-2 border rounded"
                          placeholder="Price"
                        />
                        <input
                          type="text"
                          value={editingItem.item.description}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, description: e.target.value }
                          })}
                          className="flex-1 p-2 border rounded"
                          placeholder="Description"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleItemEdit(categoryIndex, itemIndex, editingItem.item)}
                          className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-900">${item.price}</span>
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingItem({ categoryIndex, itemIndex, item })}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(categoryIndex, itemIndex)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <button
          onClick={addCategory}
          className="px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
        >
          Add Category
        </button>
        <button
          onClick={() => onApprove({ categories })}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          Approve & Publish
        </button>
      </div>
    </div>
  );
}
