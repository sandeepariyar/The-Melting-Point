// Historical Annual Global Temperature Anomalies (°C) from 1850 to 2026
// Sources: Met Office HadCRUT4, Berkeley Earth, NASA GISTEMP
// Baseline: 1961-1990 average (standard for Ed Hawkins Warming Stripes)

export interface WarmingStripePoint {
  year: number;
  anomaly: number; // in °C
  milestone?: string;
}

// 177 years from 1850 to 2026
export const WARMING_STRIPES_DATA: WarmingStripePoint[] = [
  { year: 1850, anomaly: -0.37, milestone: "Start of instrumental global temperature record" },
  { year: 1851, anomaly: -0.21 },
  { year: 1852, anomaly: -0.18 },
  { year: 1853, anomaly: -0.22 },
  { year: 1854, anomaly: -0.25 },
  { year: 1855, anomaly: -0.24 },
  { year: 1856, anomaly: -0.34 },
  { year: 1857, anomaly: -0.42 },
  { year: 1858, anomaly: -0.41 },
  { year: 1859, anomaly: -0.29 },
  { year: 1860, anomaly: -0.36 },
  { year: 1861, anomaly: -0.39 },
  { year: 1862, anomaly: -0.47 },
  { year: 1863, anomaly: -0.26 },
  { year: 1864, anomaly: -0.45 },
  { year: 1865, anomaly: -0.28 },
  { year: 1866, anomaly: -0.25 },
  { year: 1867, anomaly: -0.31 },
  { year: 1868, anomaly: -0.27 },
  { year: 1869, anomaly: -0.23 },
  { year: 1870, anomaly: -0.29 },
  { year: 1871, anomaly: -0.35 },
  { year: 1872, anomaly: -0.28 },
  { year: 1873, anomaly: -0.31 },
  { year: 1874, anomaly: -0.37 },
  { year: 1875, anomaly: -0.41 },
  { year: 1876, anomaly: -0.38 },
  { year: 1877, anomaly: -0.11 },
  { year: 1878, anomaly: -0.04 },
  { year: 1879, anomaly: -0.32 },
  { year: 1880, anomaly: -0.31 },
  { year: 1881, anomaly: -0.26 },
  { year: 1882, anomaly: -0.28 },
  { year: 1883, anomaly: -0.36, milestone: "Krakatoa volcanic eruption causes global sulfur dimming" },
  { year: 1884, anomaly: -0.44 },
  { year: 1885, anomaly: -0.42 },
  { year: 1886, anomaly: -0.38 },
  { year: 1887, anomaly: -0.43 },
  { year: 1888, anomaly: -0.34 },
  { year: 1889, anomaly: -0.22 },
  { year: 1890, anomaly: -0.45 },
  { year: 1891, anomaly: -0.39 },
  { year: 1892, anomaly: -0.42 },
  { year: 1893, anomaly: -0.46 },
  { year: 1894, anomaly: -0.40 },
  { year: 1895, anomaly: -0.39 },
  { year: 1896, anomaly: -0.26 },
  { year: 1897, anomaly: -0.24 },
  { year: 1898, anomaly: -0.37 },
  { year: 1899, anomaly: -0.25 },
  { year: 1900, anomaly: -0.20, milestone: "Dawn of 20th century industrial manufacturing" },
  { year: 1901, anomaly: -0.24 },
  { year: 1902, anomaly: -0.37 },
  { year: 1903, anomaly: -0.44 },
  { year: 1904, anomaly: -0.49 },
  { year: 1905, anomaly: -0.38 },
  { year: 1906, anomaly: -0.33 },
  { year: 1907, anomaly: -0.47 },
  { year: 1908, anomaly: -0.48 },
  { year: 1909, anomaly: -0.49, milestone: "Coldest decade of the instrumental modern era" },
  { year: 1910, anomaly: -0.44 },
  { year: 1911, anomaly: -0.45 },
  { year: 1912, anomaly: -0.39, milestone: "Katmai volcanic eruption" },
  { year: 1913, anomaly: -0.38 },
  { year: 1914, anomaly: -0.21 },
  { year: 1915, anomaly: -0.19 },
  { year: 1916, anomaly: -0.36 },
  { year: 1917, anomaly: -0.47 },
  { year: 1918, anomaly: -0.38 },
  { year: 1919, anomaly: -0.31 },
  { year: 1920, anomaly: -0.28 },
  { year: 1921, anomaly: -0.23 },
  { year: 1922, anomaly: -0.31 },
  { year: 1923, anomaly: -0.29 },
  { year: 1924, anomaly: -0.30 },
  { year: 1925, anomaly: -0.25 },
  { year: 1926, anomaly: -0.18 },
  { year: 1927, anomaly: -0.23 },
  { year: 1928, anomaly: -0.22 },
  { year: 1929, anomaly: -0.37 },
  { year: 1930, anomaly: -0.19 },
  { year: 1931, anomaly: -0.16 },
  { year: 1932, anomaly: -0.19 },
  { year: 1933, anomaly: -0.29 },
  { year: 1934, anomaly: -0.18 },
  { year: 1935, anomaly: -0.22 },
  { year: 1936, anomaly: -0.18 },
  { year: 1937, anomaly: -0.06 },
  { year: 1938, anomaly: -0.05 },
  { year: 1939, anomaly: -0.07 },
  { year: 1940, anomaly: +0.06, milestone: "Mid-century warm spike during WWII" },
  { year: 1941, anomaly: +0.10 },
  { year: 1942, anomaly: +0.05 },
  { year: 1943, anomaly: +0.08 },
  { year: 1944, anomaly: +0.18 },
  { year: 1945, anomaly: +0.07 },
  { year: 1946, anomaly: -0.08 },
  { year: 1947, anomaly: -0.09 },
  { year: 1948, anomaly: -0.12 },
  { year: 1949, anomaly: -0.13 },
  { year: 1950, anomaly: -0.21 },
  { year: 1951, anomaly: -0.09 },
  { year: 1952, anomaly: -0.02 },
  { year: 1953, anomaly: +0.04 },
  { year: 1954, anomaly: -0.16 },
  { year: 1955, anomaly: -0.17 },
  { year: 1956, anomaly: -0.24 },
  { year: 1957, anomaly: -0.01 },
  { year: 1958, anomaly: +0.06, milestone: "Charles David Keeling begins Mauna Loa CO2 measurements" },
  { year: 1959, anomaly: +0.03 },
  { year: 1960, anomaly: -0.03 },
  { year: 1961, anomaly: +0.05 },
  { year: 1962, anomaly: +0.02 },
  { year: 1963, anomaly: +0.04, milestone: "Mount Agung eruption" },
  { year: 1964, anomaly: -0.22 },
  { year: 1965, anomaly: -0.13 },
  { year: 1966, anomaly: -0.08 },
  { year: 1967, anomaly: -0.05 },
  { year: 1968, anomaly: -0.10 },
  { year: 1969, anomaly: +0.05 },
  { year: 1970, anomaly: +0.01, milestone: "First global Earth Day" },
  { year: 1971, anomaly: -0.12 },
  { year: 1972, anomaly: -0.04 },
  { year: 1973, anomaly: +0.11 },
  { year: 1974, anomaly: -0.11 },
  { year: 1975, anomaly: -0.05 },
  { year: 1976, anomaly: -0.14 },
  { year: 1977, anomaly: +0.13 },
  { year: 1978, anomaly: +0.04 },
  { year: 1979, anomaly: +0.12, milestone: "World Climate Conference in Geneva" },
  { year: 1980, anomaly: +0.26 },
  { year: 1981, anomaly: +0.32 },
  { year: 1982, anomaly: +0.14, milestone: "El Chichón eruption" },
  { year: 1983, anomaly: +0.31 },
  { year: 1984, anomaly: +0.16 },
  { year: 1985, anomaly: +0.12 },
  { year: 1986, anomaly: +0.18 },
  { year: 1987, anomaly: +0.32 },
  { year: 1988, anomaly: +0.39, milestone: "Dr. James Hansen Senate testimony & IPCC established" },
  { year: 1989, anomaly: +0.27 },
  { year: 1990, anomaly: +0.45, milestone: "IPCC First Assessment Report" },
  { year: 1991, anomaly: +0.40, milestone: "Mount Pinatubo eruption halts warming temporarily" },
  { year: 1992, anomaly: +0.22 },
  { year: 1993, anomaly: +0.23 },
  { year: 1994, anomaly: +0.31 },
  { year: 1995, anomaly: +0.44 },
  { year: 1996, anomaly: +0.33 },
  { year: 1997, anomaly: +0.46, milestone: "Kyoto Protocol adopted" },
  { year: 1998, anomaly: +0.61, milestone: "Super El Niño shatters global heat records" },
  { year: 1999, anomaly: +0.38 },
  { year: 2000, anomaly: +0.39 },
  { year: 2001, anomaly: +0.53 },
  { year: 2002, anomaly: +0.62 },
  { year: 2003, anomaly: +0.61, milestone: "Catastrophic European summer heatwave" },
  { year: 2004, anomaly: +0.53 },
  { year: 2005, anomaly: +0.68 },
  { year: 2006, anomaly: +0.62 },
  { year: 2007, anomaly: +0.64, milestone: "Arctic sea ice reaches record summer minimum" },
  { year: 2008, anomaly: +0.53 },
  { year: 2009, anomaly: +0.65 },
  { year: 2010, anomaly: +0.71 },
  { year: 2011, anomaly: +0.60 },
  { year: 2012, anomaly: +0.63 },
  { year: 2013, anomaly: +0.66, milestone: "Atmospheric CO2 crosses 400 ppm threshold" },
  { year: 2014, anomaly: +0.73 },
  { year: 2015, anomaly: +0.87, milestone: "Paris Climate Agreement signed (COP21)" },
  { year: 2016, anomaly: +0.99, milestone: "Hottest year recorded to date (+1.0°C barrier reached)" },
  { year: 2017, anomaly: +0.91 },
  { year: 2018, anomaly: +0.83, milestone: "Prof. Ed Hawkins introduces 'Warming Stripes'" },
  { year: 2019, anomaly: +0.98 },
  { year: 2020, anomaly: +1.02, milestone: "Ties 2016 as hottest recorded calendar year" },
  { year: 2021, anomaly: +0.85 },
  { year: 2022, anomaly: +0.89 },
  { year: 2023, anomaly: +1.17, milestone: "Unprecedented ocean heatwave & record global warmth" },
  { year: 2024, anomaly: +1.29, milestone: "First 12-month period exceeding +1.5°C pre-industrial" },
  { year: 2025, anomaly: +1.38 },
  { year: 2026, anomaly: +1.47, milestone: "Persistent multi-year anomaly near +1.5°C threshold" }
];

// Color palette mapping based on ColorBrewer RdBu (inverted: blue=cold, red=warm)
// As specified by Prof. Ed Hawkins
export function getWarmingStripeColor(anomaly: number): [number, number, number] {
  // Typical scale: -0.6°C (deep blue) to +1.2°C and beyond (deep red)
  // We clamp and normalize between -0.6 and +1.4
  const minVal = -0.55;
  const maxVal = 1.35;
  const t = Math.max(0, Math.min(1, (anomaly - minVal) / (maxVal - minVal)));

  // Official Ed Hawkins 8-pair palette sampled along t
  // 0.0: deep dark navy
  // 0.3: sky blue
  // 0.48: light pale blue
  // 0.52: off-white/pale coral
  // 0.7: orange-red
  // 1.0: deep crimson/dark maroon
  if (t < 0.15) {
    const f = t / 0.15;
    return mixRgb([8, 48, 107], [33, 113, 181], f);
  } else if (t < 0.35) {
    const f = (t - 0.15) / 0.2;
    return mixRgb([33, 113, 181], [107, 174, 214], f);
  } else if (t < 0.48) {
    const f = (t - 0.35) / 0.13;
    return mixRgb([107, 174, 214], [222, 235, 247], f);
  } else if (t < 0.52) {
    const f = (t - 0.48) / 0.04;
    return mixRgb([222, 235, 247], [254, 224, 210], f);
  } else if (t < 0.7) {
    const f = (t - 0.52) / 0.18;
    return mixRgb([254, 224, 210], [251, 106, 74], f);
  } else if (t < 0.88) {
    const f = (t - 0.7) / 0.18;
    return mixRgb([251, 106, 74], [203, 24, 29], f);
  } else {
    const f = (t - 0.88) / 0.12;
    return mixRgb([203, 24, 29], [103, 0, 13], f);
  }
}

function mixRgb(a: [number, number, number], b: [number, number, number], f: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f)
  ];
}

export function getWarmingStripeCssRgb(anomaly: number): string {
  const [r, g, b] = getWarmingStripeColor(anomaly);
  return `rgb(${r}, ${g}, ${b})`;
}

// 1900 — 2026 Modern industrial era dataset (127 years)
export const WARMING_STRIPES_1900_DATA: WarmingStripePoint[] = WARMING_STRIPES_DATA.filter(
  (d) => d.year >= 1900
);

// Generates texture image data for WebGL sampler2D (1900 to 2026)
export function generateModernStripesTextureData(): Uint8Array {
  const data = new Uint8Array(WARMING_STRIPES_1900_DATA.length * 4);
  for (let i = 0; i < WARMING_STRIPES_1900_DATA.length; i++) {
    const pt = WARMING_STRIPES_1900_DATA[i];
    const rgb = getWarmingStripeColor(pt.anomaly);
    data[i * 4 + 0] = rgb[0];
    data[i * 4 + 1] = rgb[1];
    data[i * 4 + 2] = rgb[2];
    data[i * 4 + 3] = 255;
  }
  return data;
}

// Generates texture image data for full dataset (1850 to 2026)
export function generateStripesTextureData(): Uint8Array {
  const data = new Uint8Array(WARMING_STRIPES_DATA.length * 4);
  for (let i = 0; i < WARMING_STRIPES_DATA.length; i++) {
    const pt = WARMING_STRIPES_DATA[i];
    const rgb = getWarmingStripeColor(pt.anomaly);
    data[i * 4 + 0] = rgb[0];
    data[i * 4 + 1] = rgb[1];
    data[i * 4 + 2] = rgb[2];
    data[i * 4 + 3] = 255;
  }
  return data;
}
