const COUNTRY_FLAGS = {
  'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺',
  'Japan': '🇯🇵', 'China': '🇨🇳', 'United States': '🇺🇸',
  'Miami': '🇺🇸', 'Italy': '🇮🇹', 'Monaco': '🇲🇨',
  'Canada': '🇨🇦', 'Spain': '🇪🇸', 'Austria': '🇦🇹',
  'Great Britain': '🇬🇧', 'UK': '🇬🇧', 'Hungary': '🇭🇺',
  'Belgium': '🇧🇪', 'Netherlands': '🇳🇱', 'Singapore': '🇸🇬',
  'Azerbaijan': '🇦🇿', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷',
  'Las Vegas': '🇺🇸', 'Qatar': '🇶🇦', 'Abu Dhabi': '🇦🇪',
  'UAE': '🇦🇪', 'Emilia-Romagna': '🇮🇹', 'Emilia Romagna': '🇮🇹',
  // Driver nationalities
  'NED': '🇳🇱', 'GBR': '🇬🇧', 'ESP': '🇪🇸', 'MON': '🇲🇨',
  'AUS': '🇦🇺', 'MEX': '🇲🇽', 'FRA': '🇫🇷', 'CAN': '🇨🇦',
  'GER': '🇩🇪', 'FIN': '🇫🇮', 'THA': '🇹🇭', 'JPN': '🇯🇵',
  'CHN': '🇨🇳', 'DEN': '🇩🇰', 'USA': '🇺🇸', 'ARG': '🇦🇷',
  'NZL': '🇳🇿', 'ITA': '🇮🇹', 'BRA': '🇧🇷',
};

export function getFlag(countryOrCode) {
  if (!countryOrCode) return '🏁';
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (countryOrCode.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase() === countryOrCode.toLowerCase()) {
      return flag;
    }
  }
  return '🏁';
}
