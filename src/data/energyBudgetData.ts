// Earth Energy Imbalance (EEI) & Planetary Heat Accumulation Dataset
// Scientific Source: von Schuckmann et al. (2020, 2023), IPCC AR6 WG1, NASA CERES, Argo International Array

export interface HeatReservoir {
  id: 'oceans' | 'cryosphere' | 'land' | 'atmosphere';
  title: { en: string; fi: string; sv: string };
  percentage: number; // % of trapped heat
  energyZJ: number; // Zettajoules absorbed since 1970
  primaryImpact: { en: string; fi: string; sv: string };
  color: string;
  glowColor: string;
  metricLabel: { en: string; fi: string; sv: string };
  metricValue: string;
}

export const HEAT_RESERVOIRS: HeatReservoir[] = [
  {
    id: 'oceans',
    title: {
      en: 'World Oceans (0–2000m)',
      fi: 'Valtameret (0–2000 m syvyyteen)',
      sv: 'Världshaven (0–2000 m)',
    },
    percentage: 89,
    energyZJ: 340,
    primaryImpact: {
      en: 'Absorbs 89% of all trapped solar heat, causing thermal expansion, marine heatwaves, and extreme moisture flux into monsoon systems.',
      fi: 'Sitouttaa 89 % planeetan vangitsemasta liikalämmöstä, aiheuttaen lämpölaajenemista ja monsuunien äärimmäistä kosteuskuormaa.',
      sv: 'Absorberar 89 % av all fångad solenergi, vilket driver termisk expansion och extrema monsunregn.',
    },
    color: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.4)',
    metricLabel: { en: 'Ocean Heat Content', fi: 'Valtamerten lämpövarasto', sv: 'Havens värmeinnehåll' },
    metricValue: '+382.4 ZJ',
  },
  {
    id: 'cryosphere',
    title: {
      en: 'Cryosphere & Glacial Ice',
      fi: 'Kryosfääri & jäätiköt',
      sv: 'Kryosfären & glaciärer',
    },
    percentage: 5,
    energyZJ: 19.1,
    primaryImpact: {
      en: 'Latent heat absorbed directly into melting Himalayan glaciers, Arctic sea ice, and Antarctic ice sheets, destabilizing alpine slopes.',
      fi: 'Piilevä lämpö sulattaa Himalajan jäätiköitä, Grönlannin mannerjäätä ja Arktista merijäätä, heikentäen vuorten kallioperää.',
      sv: 'Latent värme smälter Himalaya-glaciärer och Grönlandsisen, vilket destabiliserar bergmassiv.',
    },
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    metricLabel: { en: 'Annual Ice Mass Loss', fi: 'Vuotuinen jäämassan menetys', sv: 'Årlig isförlust' },
    metricValue: '-1,040 Gt/vuosi',
  },
  {
    id: 'land',
    title: {
      en: 'Land Surface & Continents',
      fi: 'Mannerlaatat & maaperä',
      sv: 'Landyta & kontinenter',
    },
    percentage: 4,
    energyZJ: 15.3,
    primaryImpact: {
      en: 'Conducts heat into continental rock and soil, accelerating permafrost thaw, soil desiccations, and megadroughts.',
      fi: 'Johtaa lämpöä mannerkallioon ja maaperään, kiihdyttäen ikiroudan sulamista ja maastopaloja.',
      sv: 'Leder värme ner i marken och påskyndar permafrostens upptining och torka.',
    },
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    metricLabel: { en: 'Land Heat Uptake', fi: 'Maan lämmön vastaanotto', sv: 'Markens värmeupptag' },
    metricValue: '+15.3 ZJ',
  },
  {
    id: 'atmosphere',
    title: {
      en: 'Global Atmosphere',
      fi: 'Ilmakehä & troposfääri',
      sv: 'Atmosfären',
    },
    percentage: 2,
    energyZJ: 7.6,
    primaryImpact: {
      en: 'Although only 2% of trapped heat resides in the air, each 1°C increase expands moisture capacity by 7%, supercharging extreme cloudbursts.',
      fi: 'Vaikka vain 2 % liikalämmöstä jää ilmaan, jokainen +1 °C lisää ilman kosteuskapasiteettia 7 %, synnyttäen tuhoisia rankkasateita.',
      sv: 'Varje +1 °C ökar luftens fuktkapacitet med 7 %, vilket förstärker extrema skyfall.',
    },
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    metricLabel: { en: 'Radiative Forcing Rate', fi: 'Säteilypakotteen taso', sv: 'Strålningsdrivning' },
    metricValue: '+1.48 W/m²',
  },
];

export const ENERGY_IMBALANCE_SUMMARY = {
  currentImbalanceRateWm2: 1.48, // W/m² net absorption
  wattsTrappedGlobal: 7.55e14, // Joules per second (Watts) across 510M km² Earth
  hiroshimaEquivalentPerSec: 5.2, // ~63 TJ per Little Boy bomb
  cumulativeZettajoules1970_2026: 382.4,
};
