import axios from 'axios';
import {ADIVAHA_API_KEY, ADIVAHA_API_SECRET} from './keys';
import {Post} from './Service';

const flightApi = axios.create({
  baseURL: 'https://api.adivaha.io/flights/api/',
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'x-api-key': ADIVAHA_API_KEY,
    PID: ADIVAHA_API_SECRET,
  },
});

flightApi.interceptors.response.use(
  response => response.data,
  error => {
    if (!error.response) {
      return Promise.reject({message: 'Network error. Please check your connection.'});
    }
    const {status, data} = error.response;
    if (status === 401) {
      return Promise.reject({message: 'Unauthorized. Please log in again.', status});
    }
    if (status === 500) {
      return Promise.reject({message: 'Server error. Please try again later.', status});
    }
    return Promise.reject(data ?? {message: 'Something went wrong.', status});
  },
);

export const getFlightLocations = async (term, limit = 5) => {
  const url = `https://api.adivaha.io/flights/api/?action=flightLocations&term=${encodeURIComponent(term)}&limit=${limit}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'PostmanRuntime/7.43.0',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'x-api-key': ADIVAHA_API_KEY,
      PID: ADIVAHA_API_SECRET,
    },
  });
  return res.json();
};

export const searchFlights = params => flightApi.get('search', {params});

export const getFlightDetails = flightId => flightApi.get(`details/${flightId}`);

export const getFareRules = fareId => flightApi.get(`fare-rules/${fareId}`);

export const bookFlight = payload => flightApi.post('book', payload);

export const getBooking = bookingId => flightApi.get(`bookings/${bookingId}`);

export const getCancellationCharges = payload => Post('flight/cancellation-charges', payload);

export const cancelBooking = payload => Post('flight/cancel', payload);

export default flightApi;
