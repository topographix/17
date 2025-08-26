import React, { useEffect, useState } from 'react';
import { Diamond, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import DiamondPurchase from '@/components/DiamondPurchase';
import { fetchApi } from '@/lib/api';

type DiamondCounterProps = {
  className?: string;
  showText?: boolean;
};

// Initialize the guest session first to ensure welcome bonus
const initGuestSession = async () => {
  try {
    console.log('Initializing guest session...');
    const response = await fetchApi('/api/guest/session');
    if (response.ok) {
      const data = await response.json();
      console.log('Guest session initialized:', data);
      return data;
    }
  } catch (err) {
    console.error('Failed to initialize guest session:', err);
  }
  return null;
};

const DiamondCounter: React.FC<DiamondCounterProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const [, setLocation] = useLocation();
  const [diamondCount, setDiamondCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // First check if we're logged in by querying user
  const { 
    data: user,
    isLoading: isUserLoading,
    isError: isUserError 
  } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    refetchInterval: 30000,
  });
  
  // If logged in, get user preferences, otherwise get guest diamonds
  useEffect(() => {
    const fetchDiamonds = async () => {
      setLoading(true);
      
      try {
        if (user) {
          // Logged in user - get preferences
          const res = await fetchApi('/api/user/preferences');
          if (res.ok) {
            const prefs = await res.json();
            setDiamondCount(prefs.messageDiamonds || 0);
          }
        } else {
          // Guest user - first initialize session, then get diamonds
          const sessionData = await initGuestSession();
          if (sessionData?.sessionId) {
            setCurrentSessionId(sessionData.sessionId);
          }
          
          const res = await fetchApi('/api/guest/diamonds');
          if (res.ok) {
            const data = await res.json();
            setDiamondCount(data.diamonds || 0);
          }
          
          // If still 0 diamonds, try to refresh the session
          if (diamondCount === 0) {
            console.log('Attempting to refresh guest session...');
            const refreshRes = await fetchApi('/api/guest/refresh', { method: 'POST' });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              console.log('Guest session refreshed:', refreshData);
              // Use messageDiamonds from the session response
              setDiamondCount(refreshData.messageDiamonds || 0);
              
              // Invalidate the diamonds query to get updated count
              queryClient.invalidateQueries({ queryKey: ['/api/guest/diamonds'] });
              
              // Double-check diamonds count
              const checkRes = await fetchApi('/api/guest/diamonds');
              if (checkRes.ok) {
                const checkData = await checkRes.json();
                console.log('Verified diamond count:', checkData);
                setDiamondCount(checkData.diamonds || 0);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching diamonds:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!isUserLoading) {
      fetchDiamonds();
    }
  }, [user, isUserLoading]);
  
  // Refresh diamond count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isUserLoading) {
        if (user) {
          fetchApi('/api/user/preferences')
            .then(res => res.json())
            .then(prefs => setDiamondCount(prefs.messageDiamonds || 0))
            .catch(err => console.error('Error refreshing user diamonds:', err));
        } else {
          fetchApi('/api/guest/diamonds')
            .then(res => res.json())
            .then(data => setDiamondCount(data.diamonds || 0))
            .catch(err => console.error('Error refreshing guest diamonds:', err));
        }
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, isUserLoading]);

  const handlePurchaseClick = () => {
    setIsPurchaseOpen(true);
  };

  const handleMembershipClick = () => {
    setLocation('/membership');
  };

  if (loading || isUserLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Diamond className="h-4 w-4 text-pink-500 animate-pulse" />
        <span className="text-sm font-medium">...</span>
      </div>
    );
  }

  if (isUserError && !user) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="flex items-center gap-1 cursor-pointer hover:opacity-80"
          onClick={handleMembershipClick}
          title="View membership options"
        >
          <Diamond className="h-4 w-4 text-pink-500" />
          {showText && (
            <span className="text-sm font-medium">{diamondCount}</span>
          )}
        </div>
        
        {(diamondCount < 50 || diamondCount > 999999) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handlePurchaseClick}
            className="h-6 px-2 text-xs border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            <Plus className="h-3 w-3 mr-1" />
            Buy
          </Button>
        )}
      </div>

      <DiamondPurchase
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        sessionId={currentSessionId || undefined}
      />
    </>
  );
};

export default DiamondCounter;