import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export function useGeoLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState({
    country_code: null,
    country_name: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch location');
        const data = await response.json();
        setLocation({
          country_code: data.country_code,
          country_name: data.country_name,
          currency: data.currency,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error('IP Geolocation error:', err);
        setLocation({
          country_code: 'ZA', // Default to SA if API fails
          country_name: 'South Africa',
          currency: 'ZAR',
          isLoading: false,
          error: err.message
        });
      }
    };

    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}
