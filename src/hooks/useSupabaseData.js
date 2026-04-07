import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useSupabaseQuery(query, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const result = await query();

        if (cancelled) return;

        if (result.error) {
          throw result.error;
        }

        setState({
          data: result.data || null,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;

        console.error('Supabase query error:', error);
        setState({
          data: null,
          loading: false,
          error: error.message || 'An error occurred',
        });
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return state;
}

export function useLocations() {
  return useSupabaseQuery(
    () => supabase.from('locations').select('*').eq('is_active', true),
    []
  );
}

export function useVibes() {
  return useSupabaseQuery(
    () => supabase.from('vibes').select('*'),
    []
  );
}

export function useCategories() {
  return useSupabaseQuery(
    () => supabase.from('categories').select('*'),
    []
  );
}

export function useFavorites(userId) {
  return useSupabaseQuery(
    () => supabase.from('favorites').select('*').eq('user_id', userId),
    [userId]
  );
}

export function useProfile(userId) {
  return useSupabaseQuery(
    () => supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    [userId]
  );
}
