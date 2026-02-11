/**
 * WebAPI client for VentoDesktop.
 * Uses the OpenAPI-generated client from @schema/WebAPI.
 */

import { WebAPI as WebAPIClass } from '@schema/index';

// Initialize WebAPI with configuration
// BASE URL will be set from environment variable or default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const webAPI = new WebAPIClass({
  BASE: BASE_URL,
  VERSION: '1.0.0',
  WITH_CREDENTIALS: true,
  CREDENTIALS: 'include',
  TOKEN: () => {
    // Get token from localStorage for desktop
    const token = localStorage.getItem('vento-token');
    return Promise.resolve(token || '');
  },
});

export default webAPI;

