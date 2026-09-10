export type ActType = 'attract' | 'act1' | 'act2' | 'act3';
export type Language = 'en' | 'fi' | 'sv';

export interface ClimateDataPoint {
  year: number;
  value: number;
}

export interface FutureScenario {
  seaRise2100: number; // in mm
  iceRemaining: number; // 0..1 fraction
  displaced: number; // total people
  labelKey: string;
}

export interface NepalEventData {
  lat: number;
  lon: number;
  date: string;
  lakeVolume_m3: number;
  peakDischarge_m3s: number;
  valleyLength_km: number;
  arrivalTime_min: number;
  casualties: number;
  missing: number;
  displaced: number;
  affected: number;
  source: string;
  lastUpdated: string;
}

export interface LiveDisasterReport {
  dead: number;
  missing: number;
  displaced: number;
  affected: number;
  sourceTitle: string;
  sourceUrl: string;
  updatedAt: string;
  status: 'live' | 'cached';
  details: string;
}

export interface LiveStationWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  precipitation: number;
  pressure: number;
  elevation: number;
  updatedAt: string;
}

export interface AttractStat {
  big: string;
  small: string;
}

export interface TranslationSchema {
  lang_name: string;
  attract_touch: string;
  attract_subtitle: string;
  attract_stats: AttractStat[];
  ui_skip: string;
  ui_next: string;
  ui_replay: string;
  ui_mute: string;
  ui_sound_on: string;
  ui_sound_off: string;
  ui_language: string;
  ui_live_weather: string;
  ui_developer: string;
  ui_data_sources: string;
  ui_sea_level_toggle: string;
  ui_data_dashboard: string;

  act1_title: string;
  act1_subtitle: string;
  act1_dateline: string;
  act1_beat1: string;
  act1_beat2: string;
  act1_beat3: string;
  act1_beat4: string;
  act1_toll_dead: string;
  act1_toll_missing: string;
  act1_toll_disp: string;
  act1_toll_affected: string;
  act1_toll_cause: string;
  act1_explore_cause?: string;
  act1_question?: string;
  act1_prompt: string;
  act1_live_source: string;

  act2_title: string;
  act2_subtitle: string;
  act2_intro: string;
  act2_scrubber: string;
  act2_temp_label: string;
  act2_ice_label: string;
  act2_co2_label: string;
  act2_wind_prompt: string;
  act2_wind_response: string;
  act2_close: string;
  act2_ocean_heat_label?: string;
  act2_ch4_label?: string;
  act2_greenland_label?: string;
  act2_public_hint?: string;
  metric_co2_desc?: string;
  metric_temp_desc?: string;
  metric_ice_desc?: string;
  metric_greenland_desc?: string;
  metric_sea_desc?: string;
  metric_ocean_desc?: string;
  metric_ch4_desc?: string;
  act2_step1_label?: string;
  act2_step2_label?: string;
  act2_step3_label?: string;
  act2_step4_label?: string;
  act2_step5_label?: string;
  act2_step6_label?: string;
  act2_next_tunnel?: string;
  act2_next_spiral?: string;
  act2_next_energy?: string;
  act2_next_ocean?: string;
  act2_next_global?: string;
  act2_next_future?: string;
  act2_prev_cryo?: string;
  act2_prev_tunnel?: string;
  act2_prev_spiral?: string;
  act2_prev_energy?: string;
  act2_prev_ocean?: string;
  act1_explore_cause_btn?: string;

  act3_title: string;
  act3_subtitle: string;
  act3_intro: string;
  act3_scenarios: Record<'1.5' | '2.0' | '3.0' | '4.0', string>;
  act3_sea_label: string;
  act3_ice_remain: string;
  act3_disp_label: string;
  act3_close: string;
  act3_cta_learn: string;
  act3_cta_share: string;
  act3_cta_act: string;

  credits: string;
  dedication: string;

  // Modal contents
  modal_learn_title: string;
  modal_learn_body: string;
  modal_share_title: string;
  modal_share_body: string;
  modal_act_title: string;
  modal_act_body: string;
  modal_close: string;

  // Developer & Data provenance
  developer_title: string;
  developer_role: string;
  developer_name: string;
  developer_bio: string;
  provenance_title: string;
  provenance_disclaimer: string;

  // Museum Info modal
  museum_info_title: string;
  museum_info_subtitle: string;
  museum_info_section1_title: string;
  museum_info_section1_body: string;
  museum_info_section2_title: string;
  museum_info_section2_body: string;
  museum_info_section3_title: string;
  museum_info_section3_body: string;
  museum_info_section4_title: string;
  museum_info_section4_body: string;
  museum_info_section5_title: string;
  museum_info_section5_body: string;
  museum_info_close: string;
  museum_info_badge?: string;
  museum_info_stat1?: string;
  museum_info_stat2?: string;
  museum_info_stat3?: string;
  ui_reset_kiosk?: string;
  ui_info_btn?: string;
}

export type CameraPresetName =
  | 'attract'
  | 'act1_wide'
  | 'act1_valley'
  | 'act1_flood'
  | 'act1_aftermath'
  | 'act2'
  | 'act3'
  | 'act3_close'
  | 'sea_level_focus'
  | 'global_earth';

export interface TouchRipple {
  id: number;
  x: number;
  y: number;
}

