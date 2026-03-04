'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Navigation, Plus, Trash2, Edit2, GripVertical, Check, X } from 'lucide-react';
import AdminSidebar from '@/app/components/AdminSidebar';

interface NavSection {
  id?: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  category_id?: number;
  order_index: number;
  active: boolean;
}

export default function NavSectionsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [sections, setSections] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NavSection>({
    name: '',
    slug: '',
    icon: '',
    description: '',
    order_index: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/admin/posts', {
        withCredentials: true,
      });
      if (response.status === 200) {
        setIsAuthenticated(true);
        fetchSections();
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchSections = async () => {
    try {
      // Fetch all sections (including inactive) for management
      const response = await axios.get('/api/nav-sections?all=true');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      order_index: sections.length,
      active: true,
    });
    setShowForm(true);
  };

  const handleEdit = (section: NavSection) => {
    setEditingId(section.id || null);
    setFormData(section);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      order_index: 0,
      active: true,
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      setMessage('Name and slug are required');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (editingId) {
        // Update existing section
        const response = await axios.put(`/api/nav-sections/${editingId}`, formData, {
          withCredentials: true,
        });
        if (response.data.success) {
          setMessageType('success');
          setMessage('Section updated successfully!');
          await fetchSections();
          handleCancel();
        }
      } else {
        // Create new section
        const response = await axios.post('/api/nav-sections', formData, {
          withCredentials: true,
        });
        if (response.data.success) {
          setMessageType('success');
          setMessage('Section created successfully!');
          await fetchSections();
          handleCancel();
        }
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await axios.delete(`/api/nav-sections/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setMessageType('success');
        setMessage('Section deleted successfully!');
        await fetchSections();
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to delete section');
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    // Reorder sections
    const draggedIndex = sections.findIndex((s) => s.id === draggedId);
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newSections = [...sections];
    [newSections[draggedIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[draggedIndex]];

    // Update order_index for all sections
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order_index: index,
    }));

    setSections(updatedSections);
    setDraggedId(null);

    // Save new order to backend
    try {
      const response = await axios.post(
        '/api/nav-sections/reorder',
        { 
          sections: updatedSections.map(s => ({ 
            id: s.id, 
            order_index: s.order_index 
          }))
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessageType('success');
        setMessage('Section order updated!');
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to update order');
      // Revert to previous sections on error
      await fetchSections();
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">Access Denied</h1>
          <p className="text-slate-600 text-center mb-6">You must be logged in as admin.</p>
          <Link href="/admin" className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Navigation className="text-blue-600" size={32} />
                <h1 className="text-3xl font-bold text-slate-900">Navigation Sections</h1>
              </div>
              {!showForm && (
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={20} /> Add Section
                </button>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {editingId ? 'Edit Section' : 'New Section'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="technology"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Icon (Upload SVG/PNG)</label>
                    <div className="space-y-2">
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept=".svg,.png,.jpg,.jpeg,.gif,.webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Check file size (max 500KB)
                                if (file.size > 500 * 1024) {
                                  setMessage('Image size must be less than 500KB');
                                  setMessageType('error');
                                  return;
                                }

                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  if (result) {
                                    setFormData({ ...formData, icon: result });
                                  }
                                };
                                reader.onerror = () => {
                                  setMessage('Failed to read file');
                                  setMessageType('error');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG, GIF, WebP (max 500KB)</p>
                        </div>
                        {formData.icon && (
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="p-2 bg-white border border-slate-300 rounded-lg">
                              <img 
                                src={formData.icon} 
                                alt="Icon preview" 
                                className="w-8 h-8 object-contain" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-600">✓</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: '' })}
                              className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Active</label>
                    <button
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className={`w-full px-3 py-2 rounded-lg font-semibold transition ${
                        formData.active
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {formData.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Brief description of this section"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-slate-300 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-400 transition flex items-center justify-center gap-2"
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sections List */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {sections.length === 0 ? 'No sections yet' : `${sections.length} sections`}
            </h2>

            <div className="space-y-3">
              {sections.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Navigation size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No navigation sections found. Create your first one!</p>
                </div>
              ) : (
                sections.map((section) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id!)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, section.id!)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, section.id!)}
                    className={`flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 transition cursor-move ${
                      draggedId === section.id
                        ? 'opacity-50 border-dashed border-slate-400'
                        : dragOverId === section.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical size={20} className={`${draggedId === section.id ? 'text-blue-500' : 'text-slate-400'} cursor-grab active:cursor-grabbing transition`} />
                      {section.icon && (
                        <div className="flex-shrink-0 p-2 bg-white border border-slate-200 rounded-lg group relative">
                          <img 
                            src={section.icon} 
                            alt={section.name} 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallback = (e.target as HTMLImageElement).nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-600 font-semibold">
                            {section.name.substring(0, 1)}
                          </div>
                          {section.icon.length > 5000 && (
                            <div className="absolute left-0 bottom-full mb-2 p-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              {Math.round(section.icon.length / 1024)}KB
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{section.name}</h3>
                          {section.active ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                          ) : (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{section.slug}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}