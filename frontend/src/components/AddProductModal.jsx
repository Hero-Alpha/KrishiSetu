import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import ImageUpload from './ImageUpload';

const AddProductModal = ({ isOpen, onClose, onProductAdded, editingProduct }) => {
  const { addProduct, updateProduct, loading } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
  });
  const [images, setImages] = useState([]); // Separate state for image files

  // Reset form when modal opens/closes or editing product changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price.toString(),
        unit: editingProduct.unit,
        stock: editingProduct.currentStock.toString(),
        description: editingProduct.description,
      });
      
      // Set existing images (convert to file-like objects for preview)
      if (editingProduct.images && editingProduct.images.length > 0) {
        setImages(editingProduct.images);
      } else if (editingProduct.image) {
        setImages([{ url: editingProduct.image }]);
      } else {
        setImages([]);
      }
    } else {
      setFormData({
        name: '',
        category: 'vegetables',
        price: '',
        unit: 'kg',
        stock: '',
        description: '',
      });
      setImages([]);
    }
  }, [editingProduct, isOpen]);

  const categories = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'grains', label: 'Grains' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'others', label: 'Others' }
  ];

  const units = ['kg', 'g', 'liter', 'ml', 'piece', 'bunch', 'dozen'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Prepare data for backend
    const productData = {
      name: formData.name.trim(),
      category: formData.category,
      price: parseInt(formData.price),
      unit: formData.unit,
      currentStock: parseInt(formData.stock),
      description: formData.description.trim(),
      images: images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1546470427-e212b7d31075?w=400&h=300&fit=crop' }] // Fallback image
    };

    console.log('Sending product data to backend:', productData);

    if (editingProduct) {
      await updateProduct(editingProduct._id, productData);
    } else {
      await addProduct(productData);
    }
    
    onProductAdded();
    onClose();
  } catch (error) {
    console.error('Product creation error details:', error);
    console.error('Backend error response:', error.response?.data);
    
    // Check if backend is down
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      alert('Backend server is not running. Please start the server on port 5000.');
    } else {
      alert(`Failed to ${editingProduct ? 'update' : 'add'} product: ${error.response?.data?.message || error.message}`);
    }
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Component */}
            <ImageUpload 
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={5}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Organic Tomatoes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="1"
                  value={formData.stock}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="25"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Describe your product..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading 
                  ? (editingProduct ? 'Updating...' : 'Adding...') 
                  : (editingProduct ? 'Update Product' : 'Add Product')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;