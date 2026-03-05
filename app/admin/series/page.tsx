'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import AdminSidebar from '@/app/components/AdminSidebar';

interface Series {
  id: number;
  name: string;
  category: string;
  description?: string;
  total_parts: number;
  created_at: string;
  updated_at: string;
}

interface NavSection {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

export default function SeriesManagementPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [series, setSeries] = useState<Series[]>([]);
  const [navSections, setNavSections] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Series>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSeriesForm, setNewSeriesForm] = useState({
    name: '',
    category: '',
    description: '',
  });
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
        fetchData();
      }
    } catch {
      setIsAuthenticated(false);
      window.location.href = '/admin';
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get('/api/nav-sections');
      setNavSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchSeries(),
        fetchSections(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await axios.get('/api/series');
      setSeries(response.data);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };

  const handleEdit = (s: Series) => {
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      category: s.category,
      description: s.description || '',
      total_parts: s.total_parts,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await axios.put(`/api/series/${id}`, editForm, {
        withCredentials: true,
      });
      setMessage('Series updated successfully');
      setMessageType('success');
      setEditingId(null);
      setEditForm({});
      fetchSeries();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update series');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete series "${name}"? This will remove the series relationship from all posts.`)) {
      return;
    }

    try {
      await axios.delete(`/api/series/${id}`, {
        withCredentials: true,
      });
      setMessage('Series deleted successfully');
      setMessageType('success');
      fetchSeries();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to delete series');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleAddNew = async () => {
    if (!newSeriesForm.name || !newSeriesForm.category) {
      setMessage('Series name and category are required');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await axios.post('/api/series', newSeriesForm, {
        withCredentials: true,
      });
      setMessage('Series created successfully');
      setMessageType('success');
      setShowAddForm(false);
      setNewSeriesForm({ name: '', category: '', description: '' });
      fetchSeries();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to create series');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen size={32} className="text-purple-600" />
                <h1 className="text-3xl font-bold text-slate-900">Manage Series</h1>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={20} />
                New Series
              </button>
            </div>
            <p className="text-slate-600">Manage your blog post series and their categories</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}

          {/* Add New Series Form */}
          {showAddForm && (
            <div className="mb-6 bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Create New Series</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSeriesForm({ name: '', category: '', description: '' });
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Series Name *</label>
                  <input
                    type="text"
                    value={newSeriesForm.name}
                    onChange={(e) => setNewSeriesForm({ ...newSeriesForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., ABAP Debugger, React Tutorial"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                  <select
                    value={newSeriesForm.category}
                    onChange={(e) => setNewSeriesForm({ ...newSeriesForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Category</option>
                    {navSections.map((section) => (
                      <option key={section.id} value={section.id.toString()}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={newSeriesForm.description}
                    onChange={(e) => setNewSeriesForm({ ...newSeriesForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Brief description of this series..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Save size={18} />
                    Create Series
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewSeriesForm({ name: '', category: '', description: '' });
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Series List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : series.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg">No series found</p>
              <p className="text-slate-500 text-sm mt-2">Create your first series to group related blog posts</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Series Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Posts</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {series.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      {editingId === s.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editForm.category || ''}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {navSections.map((section) => (
                                <option key={section.id} value={section.id.toString()}>
                                  {section.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Optional description"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              value={editForm.total_parts || 0}
                              onChange={(e) => setEditForm({ ...editForm, total_parts: parseInt(e.target.value) || 0 })}
                              className="w-20 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSaveEdit(s.id)}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📚</span>
                              <span className="font-medium text-slate-900">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {navSections.find(ns => ns.id.toString() === s.category)?.name || s.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-600 text-sm">{s.description || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-600">{s.total_parts} posts</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(s)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(s.id, s.name)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
