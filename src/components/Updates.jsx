import React, { useState, useEffect } from 'react';
import '../styles/Updates.css';

const Updates = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states - using category_name instead of name
  const [formData, setFormData] = useState({
    category_name: '',  // Changed from 'name'
    image: '',
    isActive: 'yes',
    user_id: '84'
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
      const response = await fetch('https://tnreaders.in/mobile/articles');
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

    console.log('Form Data:', formData);
    console.log('isActive:', formData.isActive);

    if (!formData.category_name.trim()) {  // Changed from formData.name
      alert('Please enter category name');
      return;
    }

    const formPayload = new FormData();
    formPayload.append('category_name', formData.category_name);  // Changed from 'name'
    formPayload.append('isActive', formData.isActive);
    formPayload.append('user_id', formData.user_id);
    
    console.log('User ID:', formData.user_id);

    if (imageFile) {
      formPayload.append('image', imageFile);
    } else if (formData.image && !imageFile) {
      formPayload.append('image', formData.image);
    }

    // Log form data for debugging
    console.log('FormData entries:');
    for (let pair of formPayload.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      let response;

      console.log('Image:', formData.image);

      if (editingId) {
        // Update existing category
        console.log('Updating post with ID:', editingId);
        response = await fetch(`https://tnreaders.in/mobile/post-update/${editingId}`, {
          method: 'POST',
          body: formPayload
        });

        if (response.ok) {
          alert('Post updated successfully!');
        } else {
          const errorData = await response.json();
          console.error('Update failed:', errorData);
          alert('Update failed: ' + (errorData.message || 'Unknown error'));
        }
      } else {
        console.log('Adding new post');
        console.log('Payload:', formPayload);

        // Add new category
        response = await fetch('https://tnreaders.in/mobile/post-store', {
          method: 'POST',
          body: formPayload
        });

        if (response.ok) {
          alert('Post added successfully!');
        } else {
          const errorData = await response.json();
          console.error('Add failed:', errorData);
          alert('Add failed: ' + (errorData.message || 'Unknown error'));
        }
      }

      // Reset form and refresh list
      resetForm();
      fetchCategories();

    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post: ' + error.message);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      category_name: category.category_name || category.name || '',  // Handle both category_name and name
      image: category.image || '',
      isActive: category.isActive || 'yes',
      user_id: '84'
    });
    
    if (category.image) {
      const imageUrl = category.image.startsWith('http') ? category.image : `${category.image}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview('');
    }
    
    setImageFile(null);

    // Scroll to form
    const formElement = document.querySelector('.category-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`https://tnreaders.in/mobile/post-delete/${id}`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Post deleted successfully!');
        fetchCategories();
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert('Delete failed: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post: ' + error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      category_name: '',  // Changed from 'name'
      image: '',
      isActive: 'yes',
      user_id: '84'
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
              {/* Changed input name to category_name */}
              <label htmlFor="category_name">Post Name *</label>
              <input
                type="text"
                id="category_name"
                name="category_name"
                value={formData.category_name}
                onChange={handleInputChange}
                placeholder="Enter post name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Post Image</label>
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
                      setFormData({ ...formData, image: '' });
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
                {editingId ? 'Update Post' : 'Add Post'}
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

        {/* Posts List */}
        <section className="categories-list-container">
          <div className="list-header">
            <h2>All Posts ({categories.length})</h2>
            <button
              className="btn btn-refresh"
              onClick={fetchCategories}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>

          {loading && categories.length === 0 ? (
            <div className="loading-spinner">Loading posts...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <p>No posts found. Add your first post!</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="card-header">
                    {/* Display category_name or name from API */}
                    <h3>{category.category_name || category.name || 'Unnamed Post'}</h3>
                    <span className={`status-badge ${category.isActive === 'yes' ? 'active' : 'inactive'}`}>
                      {category.isActive === 'yes' ? 'Active' : 'Inactive'}
                    </span>
                  </div>    

                  {category.image && (
                    <div className="card-image">
                      <img
                        src={`${category.image}`}
                        alt={category.category_name || category.name || 'Post'}
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
        <p>Total Posts: {categories.length}</p>
        {editingId && <p className="editing-notice">Editing Mode Active</p>}
      </footer>
    </div>
  );
};

export default Updates;
