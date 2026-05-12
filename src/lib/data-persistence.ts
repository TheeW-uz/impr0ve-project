'use client';

/**
 * Helper to get the current user ID from the auth store's local storage entry.
 * This allows us to isolate data between accounts in localStorage.
 */
export const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return 'guest';
  
  try {
    const authData = localStorage.getItem('impr0ve-auth-session');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.user?.id || 'guest';
    }
  } catch (e) {
    console.error('Error reading auth session for data isolation:', e);
  }
  
  return 'guest';
};

/**
 * Returns the storage key for the current user's data.
 */
export const getDataStorageKey = () => `impr0ve_data_v2_${getCurrentUserId()}`;
