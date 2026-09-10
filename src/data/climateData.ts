import { ClimateDataPoint, FutureScenario, NepalEventData } from '../types';

export const TEMP_ANOMALY: ClimateDataPoint[] = [
  { year: 1980, value: 0.26 }, { year: 1981, value: 0.32 }, { year: 1982, value: 0.14 },
  { year: 1983, value: 0.31 }, { year: 1984, value: 0.16 }, { year: 1985, value: 0.12 },
  { year: 1986, value: 0.18 }, { year: 1987, value: 0.32 }, { year: 1988, value: 0.39 },
  { year: 1989, value: 0.27 }, { year: 1990, value: 0.45 }, { year: 1991, value: 0.40 },
  { year: 1992, value: 0.22 }, { year: 1993, value: 0.23 }, { year: 1994, value: 0.31 },
  { year: 1995, value: 0.44 }, { year: 1996, value: 0.33 }, { year: 1997, value: 0.46 },
  { year: 1998, value: 0.61 }, { year: 1999, value: 0.38 }, { year: 2000, value: 0.39 },
  { year: 2001, value: 0.53 }, { year: 2002, value: 0.62 }, { year: 2003, value: 0.61 },
  { year: 2004, value: 0.53 }, { year: 2005, value: 0.68 }, { year: 2006, value: 0.62 },
  { year: 2007, value: 0.64 }, { year: 2008, value: 0.53 }, { year: 2009, value: 0.65 },
  { year: 2010, value: 0.71 }, { year: 2011, value: 0.60 }, { year: 2012, value: 0.63 },
  { year: 2013, value: 0.66 }, { year: 2014, value: 0.73 }, { year: 2015, value: 0.87 },
  { year: 2016, value: 0.99 }, { year: 2017, value: 0.91 }, { year: 2018, value: 0.83 },
  { year: 2019, value: 0.98 }, { year: 2020, value: 1.02 }, { year: 2021, value: 0.85 },
  { year: 2022, value: 0.89 }, { year: 2023, value: 1.17 }, { year: 2024, value: 1.29 },
  { year: 2025, value: 1.38 }, { year: 2026, value: 1.47 }
];

export const ICE_MASS: ClimateDataPoint[] = TEMP_ANOMALY.map(d => ({
  year: d.year,
  value: Math.max(0.55, 1.0 - (d.year - 1980) * 0.009 - Math.max(0, d.value - 0.5) * 0.04)
}));

export const SEA_LEVEL: ClimateDataPoint[] = TEMP_ANOMALY.map(d => {
  const y = d.year;
  if (y < 1993) return { year: y, value: -(1993 - y) * 1.8 };
  return { year: y, value: (y - 1993) * 3.4 + Math.max(0, y - 2010) * 0.4 };
});

// NOAA Mauna Loa atmospheric carbon dioxide concentration (ppm)
export const CO2_PPM: ClimateDataPoint[] = [
  { year: 1980, value: 338.7 }, { year: 1985, value: 346.0 }, { year: 1990, value: 354.4 },
  { year: 1995, value: 360.8 }, { year: 2000, value: 369.5 }, { year: 2005, value: 379.8 },
  { year: 2010, value: 389.9 }, { year: 2015, value: 401.0 }, { year: 2020, value: 414.2 },
  { year: 2023, value: 421.1 }, { year: 2024, value: 424.5 }, { year: 2025, value: 426.1 },
  { year: 2026, value: 427.8 }
];

// NOAA / AGAGE Atmospheric Methane (CH4 in parts per billion)
// Pre-industrial baseline: 722 ppb. 2026: ~1,932 ppb (+168% above natural baseline)
export const CH4_PPB: ClimateDataPoint[] = [
  { year: 1980, value: 1575 }, { year: 1985, value: 1640 }, { year: 1990, value: 1714 },
  { year: 1995, value: 1750 }, { year: 2000, value: 1773 }, { year: 2005, value: 1782 },
  { year: 2010, value: 1808 }, { year: 2015, value: 1834 }, { year: 2020, value: 1879 },
  { year: 2023, value: 1912 }, { year: 2024, value: 1922 }, { year: 2025, value: 1928 },
  { year: 2026, value: 1932 }
];

// Global Ocean Heat Content anomaly (0-2000m, NOAA / Copernicus ERA5, in Zettajoules: 10^21 Joules)
// 90%+ of all trapped greenhouse energy is stored here, supercharging monsoonal evaporation
export const OCEAN_HEAT_ZJ: ClimateDataPoint[] = [
  { year: 1980, value: 0 }, { year: 1985, value: 25 }, { year: 1990, value: 58 },
  { year: 1995, value: 94 }, { year: 2000, value: 135 }, { year: 2005, value: 184 },
  { year: 2010, value: 236 }, { year: 2015, value: 295 }, { year: 2020, value: 341 },
  { year: 2023, value: 366 }, { year: 2024, value: 372 }, { year: 2025, value: 377 },
  { year: 2026, value: 382 }
];

// Global mountain glacier & polar ice mass loss rate (Gigatons / year lost)
export const ICE_LOSS_RATE_GT: ClimateDataPoint[] = [
  { year: 1980, value: -120 }, { year: 1990, value: -168 }, { year: 2000, value: -234 },
  { year: 2010, value: -318 }, { year: 2020, value: -395 }, { year: 2026, value: -425 }
];

// NASA GRACE / GRACE-FO Greenland Ice Sheet Cumulative Mass Loss (Gigatons, Gt)
// 1 Gt = 1 billion metric tons. 361.8 Gt melt = ~1mm global sea level rise.
// Pre-2000 near balance; after 2000 accelerating to -275 Gt/yr.
export const GREENLAND_ICE_LOSS_GT: ClimateDataPoint[] = [
  { year: 1980, value: 0 },
  { year: 1990, value: -80 },
  { year: 1995, value: -210 },
  { year: 2000, value: -450 },
  { year: 2005, value: -1250 },
  { year: 2010, value: -2410 },
  { year: 2012, value: -3120 },
  { year: 2015, value: -3890 },
  { year: 2019, value: -4680 },
  { year: 2020, value: -4890 },
  { year: 2023, value: -5170 },
  { year: 2024, value: -5290 },
  { year: 2025, value: -5340 },
  { year: 2026, value: -5380 }
];

export interface CoastalCityRisk {
  name: string;
  country: string;
  elevationMeters: number;
  populationAtRiskMillions: number;
  submersionYearUnderRunaway: number;
  coordinates: [number, number];
}

export const COASTAL_CITIES: CoastalCityRisk[] = [
  { name: 'Malé & Atolls', country: 'Maldives', elevationMeters: 1.5, populationAtRiskMillions: 0.5, submersionYearUnderRunaway: 2070, coordinates: [4.17, 73.5] },
  { name: 'Dhaka & Delta', country: 'Bangladesh', elevationMeters: 2.2, populationAtRiskMillions: 22.4, submersionYearUnderRunaway: 2065, coordinates: [23.81, 90.41] },
  { name: 'Mumbai', country: 'India', elevationMeters: 2.8, populationAtRiskMillions: 14.2, submersionYearUnderRunaway: 2075, coordinates: [19.07, 72.87] },
  { name: 'Venice', country: 'Italy', elevationMeters: 1.0, populationAtRiskMillions: 0.3, submersionYearUnderRunaway: 2050, coordinates: [45.44, 12.31] },
  { name: 'Alexandria', country: 'Egypt', elevationMeters: 2.0, populationAtRiskMillions: 5.2, submersionYearUnderRunaway: 2060, coordinates: [31.2, 29.91] },
  { name: 'New York & NJ Coast', country: 'USA', elevationMeters: 3.1, populationAtRiskMillions: 8.8, submersionYearUnderRunaway: 2085, coordinates: [40.71, -74.0] }
];

export const FUTURES: Record<string, FutureScenario> = {
  '1.5': { seaRise2100: 430, iceRemaining: 0.55, displaced: 143e6, labelKey: '1.5' },
  '2.0': { seaRise2100: 560, iceRemaining: 0.35, displaced: 280e6, labelKey: '2.0' },
  '3.0': { seaRise2100: 810, iceRemaining: 0.15, displaced: 630e6, labelKey: '3.0' },
  '4.0': { seaRise2100: 1100, iceRemaining: 0.04, displaced: 1200e6, labelKey: '4.0' }
};

export const NEPAL_EVENT: NepalEventData = {
  lat: 28.25,
  lon: 85.51,
  date: '2026-08-26T04:17:00+05:45',
  lakeVolume_m3: 35e6,
  peakDischarge_m3s: 14500,
  valleyLength_km: 100,
  arrivalTime_min: 12,
  casualties: 1356,
  missing: 5587,
  displaced: 12400,
  affected: 45000,
  source: 'NDRRMA Nepal / Copernicus EMS / UN OCHA ReliefWeb / Nepal Flood Watch',
  lastUpdated: 'September 2026'
};

export function interpolateSeries(series: ClimateDataPoint[], year: number): number {
  if (year <= series[0].year) return series[0].value;
  if (year >= series[series.length - 1].year) return series[series.length - 1].value;
  for (let i = 0; i < series.length - 1; i++) {
    if (series[i].year <= year && series[i + 1].year >= year) {
      const t = (year - series[i].year) / (series[i + 1].year - series[i].year);
      return series[i].value + (series[i + 1].value - series[i].value) * t;
    }
  }
  return series[series.length - 1].value;
}

export const getTempAt = (year: number) => interpolateSeries(TEMP_ANOMALY, year);
export const getIceAt = (year: number) => interpolateSeries(ICE_MASS, year);
export const getSeaAt = (year: number) => interpolateSeries(SEA_LEVEL, year);
export const getCO2At = (year: number) => interpolateSeries(CO2_PPM, year);
export const getCH4At = (year: number) => interpolateSeries(CH4_PPB, year);
export const getOceanHeatAt = (year: number) => interpolateSeries(OCEAN_HEAT_ZJ, year);
export const getIceLossAt = (year: number) => interpolateSeries(ICE_LOSS_RATE_GT, year);
export const getGreenlandIceLossAt = (year: number) => interpolateSeries(GREENLAND_ICE_LOSS_GT, year);

export const YEAR_MIN = 1980;
export const YEAR_MAX = 2026;
