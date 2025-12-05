// src/services/endpoints.js
export const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
};


export const FARMS = {
  LIST: "/farms/getFarms",
  CREATE: "/farms/createFarm",
  GET: (id) => `/farms/${id}`,
  UPDATE: (id) => `/farms/${id}`,
  DELETE: (id) => `/farms/${id}`,
};

export const ANALYSIS = {
  RUN: "/analysis/run",
  STATUS: (jobId) => `/analysis/${jobId}`,
};

export const WEATHER = {
  CURRENT: "/weather/current",
  TREND: "/weather/trend",
};

export const ALERTS = {
  LIST: "/alerts",
  TEST: "/alerts/test",
};

export const SETTINGS = {
  GET: "/settings",
  UPDATE: "/settings",
};
