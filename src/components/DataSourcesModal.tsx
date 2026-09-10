import React from 'react';
import { motion } from 'motion/react';
import { Database, ShieldCheck, ExternalLink, X, Scale } from 'lucide-react';
import { TranslationSchema } from '../types';

interface DataSourcesModalProps {
  t: TranslationSchema;
  onClose: () => void;
}

export const DataSourcesModal: React.FC<DataSourcesModalProps> = ({ t, onClose }) => {
  const sources = [
    {
      name: 'UN OCHA ReliefWeb',
      domain: 'Nepal Humanitarian Response & Disaster Bulletins',
      dataset: 'Situation Reports, Casualty & Displacement Records',
      license: 'Public Domain / Creative Commons BY 3.0 IGO',
      url: 'https://reliefweb.int/country/npl',
    },
    {
      name: 'NDRRMA Nepal',
      domain: 'National Disaster Risk Reduction & Management Authority',
      dataset: 'Official Incident Reporting & Monsoon Disaster Assessments',
      license: 'Government Open Data Portal (Nepal)',
      url: 'https://bipadportal.gov.np',
    },
    {
      name: 'NASA GISTEMP v4',
      domain: 'Goddard Institute for Space Studies',
      dataset: 'Global Surface Temperature Anomaly Time Series (1880–Present)',
      license: 'NASA Open Data Policy (Public Domain)',
      url: 'https://data.giss.nasa.gov/gistemp',
    },
    {
      name: 'ICIMOD',
      domain: 'International Centre for Integrated Mountain Development',
      dataset: 'Hindu Kush Himalaya Glacial Lake Outburst Inventory (GLOF Hazard)',
      license: 'Open Access Research Repository',
      url: 'https://www.icimod.org',
    },
    {
      name: 'Copernicus Climate Change Service (ERA5)',
      domain: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
      dataset: 'Atmospheric Reanalysis & Cryosphere Extent',
      license: 'Copernicus Open Access Licence',
      url: 'https://climate.copernicus.eu',
    },
    {
      name: 'Open-Meteo Alpine Forecasts',
      domain: 'High-Resolution Numerical Alpine Model (Langtang / Trishuli Catchment)',
      dataset: 'Live Ambient Temperature, Pressure, Precipitation & Wind Direction',
      license: 'Attribution 4.0 International (CC BY 4.0)',
      url: 'https://open-meteo.com',
    },
    {
      name: 'IPCC AR6 Working Group I & II',
      domain: 'Intergovernmental Panel on Climate Change',
      dataset: 'Regional Sea Level Projections & SSP Future Scenarios',
      license: 'United Nations / WMO / UNEP Scientific Attribution',
      url: 'https://www.ipcc.ch/report/ar6/wg1',
    },
  ];

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-3xl bg-[#091118] border border-white/15 p-8 rounded-sm text-white shadow-2xl relative my-auto max-h-[92vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
          <Database className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-light tracking-wide text-white">
            {t.provenance_title}
          </h2>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-sm mb-6 flex gap-3">
          <Scale className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-cyan-100/90 font-light">
            <span className="font-semibold text-cyan-300">Legal Compliance Notice: </span>
            {t.provenance_disclaimer}
          </div>
        </div>

        {/* Scrollable list of authoritative sources */}
        <div className="overflow-y-auto pr-2 space-y-3 flex-1 mb-6">
          {sources.map((s, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-sm transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-sm text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  {s.name}
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-white/50 hover:text-white flex items-center gap-1 font-mono transition-colors"
                >
                  Verify <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-xs text-white/80 font-light mb-1">{s.domain}</div>
              <div className="text-[11px] text-white/50 flex justify-between font-mono">
                <span>Data: {s.dataset}</span>
                <span className="text-white/40">License: {s.license}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs font-mono text-white/40">
            Kiosk Edition · Offline Resilience Active
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium tracking-wider uppercase transition-colors"
          >
            {t.modal_close}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
