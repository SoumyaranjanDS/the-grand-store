import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LocationContext = createContext();

const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(' ');

const regionNames = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

export const countries = COUNTRY_CODES
  .map((code) => ({ code, name: regionNames?.of(code) || code }))
  .sort((a, b) => a.name.localeCompare(b.name));

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
      const savedCountry = localStorage.getItem('userCountry');
      if (savedCountry) {
        try {
          const parsedCountry = JSON.parse(savedCountry);
          const matchedCountry = countries.find((country) => country.code === parsedCountry.country_code);
          if (matchedCountry) {
            setLocation({
              country_code: matchedCountry.code,
              country_name: matchedCountry.name,
              currency: parsedCountry.currency || null,
              isLoading: false,
              isManual: true,
              error: null
            });
            return;
          }
        } catch {
          localStorage.removeItem('userCountry');
        }
      }

      try {
        let data;
        try {
          const response = await axios.get('https://ipapi.co/json/');
          if (response.data.error) throw new Error(response.data.reason || 'ipapi.co error');
          data = response.data;
        } catch (err) {
          console.warn('ipapi.co failed, falling back to ipwho.is', err);
          const fallbackRes = await axios.get('https://ipwho.is/');
          if (!fallbackRes.data.success) throw new Error('ipwho.is error');
          data = {
            country_code: fallbackRes.data.country_code,
            country_name: fallbackRes.data.country,
            currency: fallbackRes.data.currency?.code
          };
        }

        setLocation({
          country_code: data.country_code,
          country_name: data.country_name,
          currency: data.currency,
          isLoading: false,
          isManual: false,
          error: null
        });
      } catch (err) {
        console.error('IP Geolocation completely failed:', err);
        setLocation({
          country_code: 'ZA', // Default to SA if API fails
          country_name: 'South Africa',
          currency: 'ZAR',
          isLoading: false,
          isManual: false,
          error: err.message
        });
      }
    };

    fetchLocation();
  }, []);

  const changeCountry = (countryCode) => {
    const selectedCountry = countries.find((country) => country.code === countryCode);
    if (!selectedCountry) return;

    setLocation((current) => ({
      ...current,
      country_code: selectedCountry.code,
      country_name: selectedCountry.name,
      isLoading: false,
      isManual: true,
      error: null
    }));
    localStorage.setItem('userCountry', JSON.stringify({
      country_code: selectedCountry.code,
      country_name: selectedCountry.name
    }));
  };

  return (
    <LocationContext.Provider value={{ ...location, countries, changeCountry }}>
      {children}
    </LocationContext.Provider>
  );
}
