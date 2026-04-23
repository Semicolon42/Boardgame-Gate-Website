import type {GameRecord} from './gameRecordReducer'

const STORAGE_KEY = 'gate-game-stats'
const MAX_RECORDS = 100

export function saveGameRecord(record: GameRecord): void {
	const existing = loadGameRecords()
	const updated = [record, ...existing].slice(0, MAX_RECORDS)
	localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function loadGameRecords(): GameRecord[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw === null) return []
		return JSON.parse(raw) as GameRecord[]
	} catch {
		return []
	}
}

export function clearGameRecords(): void {
	localStorage.removeItem(STORAGE_KEY)
}
