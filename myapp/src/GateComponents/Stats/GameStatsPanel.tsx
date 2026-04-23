import {WaButton, WaDialog} from '@awesome.me/webawesome/dist/react'
import {useState} from 'react'
import {getCitizenCard} from '../Data/PlayerCardsData'
import type {GameRecord} from './gameRecordReducer'
import {clearGameRecords, loadGameRecords} from './gameStats'

interface Props {
	isOpen: boolean
	onClose: () => void
}

function formatDate(iso: string): string {
	if (!iso) return '—'
	return new Date(iso).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

function topPlayedCards(counts: Record<number, number>, limit = 3): string {
	const entries = Object.entries(counts) as [string, number][]
	if (entries.length === 0) return '—'
	return entries
		.sort(([, a], [, b]) => b - a)
		.slice(0, limit)
		.map(([id, count]) => {
			try {
				const name = getCitizenCard(Number(id)).name
				return `${name} ×${count}`
			} catch {
				return `#${id} ×${count}`
			}
		})
		.join(', ')
}

export function GameStatsPanel({isOpen, onClose}: Props) {
	const [records, setRecords] = useState<GameRecord[]>(() => loadGameRecords())

	const handleClear = () => {
		clearGameRecords()
		setRecords([])
	}

	const thClass =
		'px-2 py-1 text-left text-xs font-semibold whitespace-nowrap border-b border-gray-300'
	const tdClass = 'px-2 py-1 text-xs whitespace-nowrap'

	return (
		<WaDialog
			label='Game History'
			onWaAfterHide={onClose}
			open={isOpen}
			style={{['--width' as string]: 'min(95vw, 900px)'}}
		>
			<div className='overflow-x-auto max-h-[70vh] overflow-y-auto'>
				{records.length === 0 ? (
					<p className='p-4 text-sm text-gray-500'>No games played yet.</p>
				) : (
					<table className='w-full border-collapse text-left'>
						<thead className='sticky top-0 bg-white'>
							<tr>
								<th className={thClass}>Date</th>
								<th className={thClass}>Result</th>
								<th className={thClass}>Turns</th>
								<th className={thClass}>Final Fear</th>
								<th className={thClass}>Fear +/-</th>
								<th className={thClass}>Farm Dmg</th>
								<th className={thClass}>Gate Dmg</th>
								<th className={thClass}>Tower Dmg</th>
								<th className={thClass}>Farm Repair</th>
								<th className={thClass}>Gate Repair</th>
								<th className={thClass}>Tower Repair</th>
								<th className={thClass}>Dmg Dealt</th>
								<th className={thClass}>Purchased</th>
								<th className={thClass}>Bonus Draws</th>
								<th className={thClass}>Top Played</th>
							</tr>
						</thead>
						<tbody>
							{records.map((r, i) => (
								<tr
									className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
									key={r.date || i}
								>
									<td className={tdClass}>{formatDate(r.date)}</td>
									<td
										className={`${tdClass} font-bold ${r.outcome === 'WIN' ? 'text-green-600' : 'text-red-600'}`}
									>
										{r.outcome}
									</td>
									<td className={tdClass}>{r.turnCount}</td>
									<td className={tdClass}>{r.finalFear}</td>
									<td className={tdClass}>
										+{r.fearGained} / -{r.fearHealed}
									</td>
									<td className={tdClass}>{r.damageTakenByBuilding.farm}</td>
									<td className={tdClass}>{r.damageTakenByBuilding.gate}</td>
									<td className={tdClass}>{r.damageTakenByBuilding.tower}</td>
									<td className={tdClass}>{r.repairByBuilding.farm}</td>
									<td className={tdClass}>{r.repairByBuilding.gate}</td>
									<td className={tdClass}>{r.repairByBuilding.tower}</td>
									<td className={tdClass}>{r.damageDealtToEnemies}</td>
									<td className={tdClass}>{r.purchasedCardIds.length}</td>
									<td className={tdClass}>{r.bonusCardsDrawn}</td>
									<td className={tdClass}>
										{topPlayedCards(r.cardPlayCounts)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
			<div className='flex gap-2' slot='footer'>
				{records.length > 0 && (
					<WaButton onClick={handleClear} variant='danger'>
						Clear History
					</WaButton>
				)}
				<WaButton appearance='filled' data-dialog='close' variant='brand'>
					Close
				</WaButton>
			</div>
		</WaDialog>
	)
}
