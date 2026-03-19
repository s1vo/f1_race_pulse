const CIRCUIT_COORDS = [
  {
    coords: { lat: -37.8497, lon: 144.9683 },
    aliases: ['albert park', 'melbourne', 'australian grand prix', 'australia'],
  },
  {
    coords: { lat: 31.3389, lon: 121.2197 },
    aliases: ['shanghai', 'chinese grand prix', 'china'],
  },
  {
    coords: { lat: 34.8431, lon: 136.5411 },
    aliases: ['suzuka', 'japanese grand prix', 'japan'],
  },
  {
    coords: { lat: 26.0325, lon: 50.5106 },
    aliases: ['sakhir', 'bahrain international circuit', 'bahrain grand prix', 'bahrain'],
  },
  {
    coords: { lat: 21.6319, lon: 39.1036 },
    aliases: ['jeddah', 'jeddah corniche circuit', 'saudi arabian grand prix', 'saudi arabia'],
  },
  {
    coords: { lat: 25.9581, lon: -80.2389 },
    aliases: ['miami', 'miami international autodrome', 'miami grand prix'],
  },
  {
    coords: { lat: 44.3439, lon: 11.7167 },
    aliases: ['imola', 'emilia romagna grand prix', 'autodromo enzo e dino ferrari'],
  },
  {
    coords: { lat: 43.7347, lon: 7.4206 },
    aliases: ['monaco', 'monte carlo', 'circuit de monaco', 'monaco grand prix'],
  },
  {
    coords: { lat: 41.57, lon: 2.2611 },
    aliases: ['barcelona', 'montmelo', 'catalunya', 'spanish grand prix', 'spain'],
  },
  {
    coords: { lat: 45.5006, lon: -73.5226 },
    aliases: ['montreal', 'circuit gilles villeneuve', 'canadian grand prix', 'canada'],
  },
  {
    coords: { lat: 47.2197, lon: 14.7647 },
    aliases: ['spielberg', 'red bull ring', 'austrian grand prix', 'austria'],
  },
  {
    coords: { lat: 52.0786, lon: -1.0169 },
    aliases: ['silverstone', 'silverstone circuit', 'british grand prix', 'great britain', 'united kingdom'],
  },
  {
    coords: { lat: 50.4372, lon: 5.9714 },
    aliases: ['spa', 'spa-francorchamps', 'belgian grand prix', 'belgium'],
  },
  {
    coords: { lat: 47.5839, lon: 19.2519 },
    aliases: ['hungaroring', 'budapest', 'hungarian grand prix', 'hungary'],
  },
  {
    coords: { lat: 52.3888, lon: 4.5469 },
    aliases: ['zandvoort', 'dutch grand prix', 'netherlands'],
  },
  {
    coords: { lat: 45.6156, lon: 9.2811 },
    aliases: ['monza', 'autodromo nazionale monza', 'italian grand prix', 'italy'],
  },
  {
    coords: { lat: 40.3725, lon: 49.8531 },
    aliases: ['baku', 'baku city circuit', 'azerbaijan grand prix', 'azerbaijan'],
  },
  {
    coords: { lat: 1.2914, lon: 103.8644 },
    aliases: ['singapore', 'marina bay', 'singapore grand prix'],
  },
  {
    coords: { lat: 30.1328, lon: -97.6411 },
    aliases: ['austin', 'circuit of the americas', 'united states grand prix', 'cota'],
  },
  {
    coords: { lat: 19.4042, lon: -99.0907 },
    aliases: ['mexico city', 'mexican grand prix', 'autodromo hermanos rodriguez', 'mexico'],
  },
  {
    coords: { lat: -23.7036, lon: -46.6997 },
    aliases: ['sao paulo', 'são paulo', 'interlagos', 'brazilian grand prix', 'brazil'],
  },
  {
    coords: { lat: 36.1147, lon: -115.1733 },
    aliases: ['las vegas', 'las vegas street circuit', 'las vegas grand prix'],
  },
  {
    coords: { lat: 25.4881, lon: 51.4531 },
    aliases: ['qatar', 'losail', 'lusail', 'qatar grand prix'],
  },
  {
    coords: { lat: 24.4672, lon: 54.6031 },
    aliases: ['abu dhabi', 'yas marina', 'yas island', 'abu dhabi grand prix', 'united arab emirates'],
  },
];

function normalize(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getCircuitCoords(...candidates) {
  const normalizedCandidates = candidates
    .filter(Boolean)
    .map(normalize);

  const circuit = CIRCUIT_COORDS.find(entry =>
    entry.aliases.some(alias => {
      const normalizedAlias = normalize(alias);
      return normalizedCandidates.some(candidate =>
        candidate.includes(normalizedAlias) || normalizedAlias.includes(candidate)
      );
    })
  );

  return circuit?.coords || null;
}
