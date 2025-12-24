import React, { useState, useEffect } from 'react';
import '../styles/Updates.css';

const Updates = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    isActive: 'yes'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://tnreaders.in/mobile/articles-category');
      const data = await response.json();
      console.log(data.data);
      
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({
        ...formData,
        image: file.name
      });
    }
  };
  
  // Handle form submission (Add/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData.isActive);
    
    
    if (!formData.name.trim()) {
      alert('Please enter category name');
      return;
    }
    
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('isActive', formData.isActive);
    
    if (imageFile) {
      formPayload.append('image', imageFile);
    } else if (formData.image && !imageFile) {
      formPayload.append('image', formData.image);
    }
    
    try {
      let response;

      console.log(formData.image);
      
      if (editingId) {
        // Update existing category
        response = await fetch(`https://tnreaders.in/mobile/articles-category-update/${editingId}`, {
          method: 'POST',
          body: formPayload
        });
        
        if (response.ok) {
          alert('Category updated successfully!');
        }
      } else {
        console.log(formPayload);
        
        // Add new category
        response = await fetch('https://tnreaders.in/mobile/articles-category-add', {
          method: 'POST',
          body: formPayload
        });
        
        if (response.ok) {
          alert('Category added successfully!');
        }
      }
      
      // Reset form and refresh list
      resetForm();
      fetchCategories();
      
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };
  
  // Edit category
  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      image: category.image || '',
      isActive: category.isActive || 'yes'
    });
    setImagePreview(category.image ? `${category.image}` : '');
    setImageFile(null);
    
    // Scroll to form
    document.querySelector('.category-form-container').scrollIntoView({ behavior: 'smooth' });
  };
  
  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      const response = await fetch(`https://tnreaders.in/mobile/articles-category-destroy/${id}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Category deleted successfully!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      isActive: 'yes'
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };
  
  return (
    <div className="article-categories-container">      
      <main className="main-content">
        {/* Add/Edit Form */}
        <section className="category-form-container">
          <h2>{editingId ? 'Edit Update Post' : 'Add New Updates Post'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Category Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                      setFormData({...formData, image: ''});
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
              
              {!imagePreview && formData.image && (
                <div className="current-image">
                  <p>Current Image: {formData.image}</p>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="isActive">Status</label>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive}
                onChange={handleInputChange}
              >
                <option value="yes">Active</option>
                <option value="no">Inactive</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Category' : 'Add Category'}
              </button>
              
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>
        
        {/* Categories List */}
        <section className="categories-list-container">
          <div className="list-header">
            <h2>All Categories ({categories.length})</h2>
            <button 
              className="btn btn-refresh"
              onClick={fetchCategories}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>
          
          {loading && categories.length === 0 ? (
            <div className="loading-spinner">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <p>No categories found. Add your first category!</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="card-header">
                    <h3>{category.name}</h3>
                    <span className={`status-badge ${category.isActive === 'yes' ? 'active' : 'inactive'}`}>
                      {category.isActive === 'yes' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {category.image && (
                    <div className="card-image">
                      <img 
                        src={`${category.image}`} 
                        alt={category.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="card-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      
      <footer className="app-footer">
        <p>Total Categories: {categories.length}</p>
        {editingId && <p className="editing-notice">Editing Mode Active</p>}
      </footer>
    </div>
  );
};

export default Updates;