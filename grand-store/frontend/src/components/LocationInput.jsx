import React, { useEffect, useRef } from 'react';

export default function LocationInput({ name, value, onChange, placeholder, className, required, type = "text", onPlaceDetails }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Maps API is not loaded');
      return;
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        
        let city = '';
        let postalCode = '';
        let country = '';

        if (place.address_components) {
          for (const component of place.address_components) {
            const types = component.types;
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
            if (types.includes('country')) {
              country = component.long_name;
            }
          }
        }

        // Trigger the standard onChange for the address string
        const event = {
          target: {
            name: name,
            value: place.formatted_address
          }
        };
        onChange(event);

        // Optional custom callback for parsed fields
        if (onPlaceDetails) {
          onPlaceDetails({ city, postalCode, country });
        }
      }
    });

    return () => {
      if (window.google && window.google.maps && window.google.maps.event && autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [name, onChange, onPlaceDetails]);

  return (
    <input
      ref={inputRef}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={className}
      placeholder={placeholder}
    />
  );
}
