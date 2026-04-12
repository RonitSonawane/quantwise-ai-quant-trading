import api from './axiosConfig'

export async function fetchHealth(): Promise<{ ready?: boolean }> {
  const res = await api.get('/health')
  return res.data as { ready?: boolean }
}
