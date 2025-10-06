'use client';

import { useState, useEffect, useCallback } from 'react';
import { VaultItem, vaultAPI } from '@/utils/api';
import { decryptData } from '@/utils/crypto';

interface VaultListProps {
  masterPassword: string;
  onEdit: (item: VaultItem) => void;
  refreshTrigger: number;
  searchQuery?: string;
}

export default function VaultList({ masterPassword, onEdit, refreshTrigger, searchQuery = '' }: VaultListProps) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vaultAPI.getAll();
      
      // Decrypt items
      const decryptedItems = await Promise.all(
        response.data.items.map(async (item) => {
          try {
            return {
              ...item,
              password: await decryptData(item.password, masterPassword),
              notes: item.notes ? await decryptData(item.notes, masterPassword) : ''
            };
          } catch (decryptError) {
            console.error('Failed to decrypt item:', item._id, decryptError);
            return {
              ...item,
              password: '[Decryption Failed]',
              notes: '[Decryption Failed]'
            };
          }
        })
      );
      
      setItems(decryptedItems);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vault items';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [masterPassword]);

  useEffect(() => {
    loadItems();
  }, [refreshTrigger, loadItems]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await vaultAPI.delete(id);
      setItems(items.filter(item => item._id !== id));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      setError(errorMessage);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      
      // Auto-clear clipboard after 15 seconds
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch {
          // May be blocked by browser - ignore silently
        }
        setCopiedId(null);
      }, 15000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.username.toLowerCase().includes(query) ||
      item.url?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading your vault...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={loadItems}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No matching items found' : 'Your vault is empty'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? `No items match "${searchQuery}". Try a different search term.`
              : 'Add your first password to get started securing your accounts.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {searchQuery ? `Search Results (${filteredItems.length})` : `Your Passwords (${filteredItems.length})`}
        </h2>
      </div>

      {filteredItems.map((item) => (
        <div
          key={item._id}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {item.title}
                  </h3>
                  {item.url && (
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {item.url}
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white truncate">
                      {item.username}
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.username, `username-${item._id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy username"
                    >
                      {copiedId === `username-${item._id}` ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white">
                      {visiblePasswords.has(item._id!) ? item.password : '••••••••••••'}
                    </div>
                    <button
                      onClick={() => togglePasswordVisibility(item._id!)}
                      className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title={visiblePasswords.has(item._id!) ? 'Hide password' : 'Show password'}
                    >
                      {visiblePasswords.has(item._id!) ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878A3 3 0 1012 6.5m2.122 2.878l4.242 4.242M15.12 15.12L19.5 19.5" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.password, `password-${item._id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy password"
                    >
                      {copiedId === `password-${item._id}` ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                    {item.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Edit item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(item._id!)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {copiedId?.includes(item._id!) && (
            <div className="mt-3 text-center text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Copied! Will clear from clipboard in 15 seconds
            </div>
          )}
        </div>
      ))}
    </div>
  );
}