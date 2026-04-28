import api from './axiosConfig';

export const getLiveSignal = (index: string) =>
  api.get(`/live-signal/${index}`).then(r => r.data);

export const getAllSignals = () =>
  api.get('/live-signal').then(r => r.data);

export const getLivePrice = (index: string) =>
  api.get(`/live-price/${index}`).then(r => r.data);

export const getAllLivePrices = () =>
  api.get('/live-prices').then(r => r.data);

export const openTrade = (data: {
  index_name: string;
  strategy: string;
  trade_type: string;
  capital: number;
  user_id?: string;
}) => api.post('/paper-trade/open', data).then(r => r.data);

export const closeTrade = (trade_id: string) =>
  api.post('/paper-trade/close', { trade_id }).then(r => r.data);

export const getPositions = () =>
  api.get('/paper-trade/positions').then(r => r.data);

export const getTradeHistory = () =>
  api.get('/paper-trade/history').then(r => r.data);

export const getMetrics = () =>
  api.get('/paper-trade/metrics').then(r => r.data);
