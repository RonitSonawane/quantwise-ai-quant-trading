export type SavedExperiment = {
  id: string
  name: string
  runAt: string
  indexLabel: string
  strategies: string[]
  bestReturnPct: number
  bestSharpe: number
  keyFinding: string
  notes?: string
  resultSnapshot?: unknown
}

const KEY = 'quantwise_student_experiments_v1'

export function loadExperiments(): SavedExperiment[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const p = JSON.parse(raw) as SavedExperiment[]
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

export function saveExperiments(list: SavedExperiment[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function addExperiment(exp: SavedExperiment) {
  const list = loadExperiments()
  saveExperiments([exp, ...list])
}

export function removeExperiment(id: string) {
  saveExperiments(loadExperiments().filter((e) => e.id !== id))
}
