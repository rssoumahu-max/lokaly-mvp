import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.warn('Auth check error:', error);
        }

        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to get user:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}
