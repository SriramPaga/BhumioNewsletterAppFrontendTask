import { useState, useCallback } from 'react';
import { useSnackbar } from '../context/SnackbarContext.jsx';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const callApi = useCallback(async (apiCall, successMessage = null) => {
    setLoading(true);
    try {
      const result = await apiCall();
      if (successMessage) {
        showSnackbar(successMessage, 'success');
      }
      return result;
    } catch (error) {
      const message = error.message || 'An error occurred';
      showSnackbar(message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]); // important dependency

  return { loading, callApi };
}