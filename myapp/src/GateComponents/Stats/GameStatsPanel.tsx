import {WaButton, WaDialog} from '@awesome.me/webawesome/dist/react'
import {useState} from 'react'
import {getCitizenCard} from '../Data/PlayerCardsData'
import type {GameRecord} from './gameRecordReducer'
import {clearGameRecords, loadGameRecords} from './gameStats'

interface Props {
	isOpen: boolean
	onClose: () => void
}

function topPlayedCards(
	cardPlayCounts: Record<number, number>,
	limit = 3
): string {
	const entries = Object.entries(cardPlayCounts)
		.map(([id, count]) => ({id: Number(id), count}))
		.sort((a, b) => b.count - a.count)
		.slice(0, limit)
	if (entries.length === 0) return '—'
	return entries
		.map(e => {
			try {
				return `${getCitizenCard(e.id).name} ×${e.count}`
			} catch {
				return `#${e.id} ×${e.count}`
			}
		})
		.join(', ')
}

function formatDate(iso: string): string {
	if (!iso) return '—'
	const d = new Date(iso)
	return d.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

export function GameStatsPanel({isOpen, onClose}: Props) {
	const [records, setRecords] = useState<GameRecord[]>(() => loadGameRecords())

	const handleClear = () => {
		clearGameRecords()
		setRecords([])
	}

	const handleOpen = () => {
		setRecords(loadGameRecords())
	}

	return (
		<WaDialog
			label='Game History'
			onWaHide={onClose}
			onWaShow={handleOpen}
			open={isOpen}
			style={{['--width' as string]: 'min(95vw, 900px)'}}
		>
			<div className='flex flex-col gap-2'>
				{records.length === 0 ? (
					<p className='text-center text-gray-500 py-4'>No games yet.</p>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full text-xs border-collapse'>
							<thead>
								<tr className='bg-gray-100 text-left'>
									<th className='p-1 border'>Date</th>
									<th className='p-1 border'>Result</th>
									<th className='p-1 border'>Turns</th>
									<th className='p-1 border'>Fear</th>
									<th className='p-1 border'>+Fear</th>
									<th className='p-1 border'>-Fear</th>
									<th className='p-1 border'>Farm Dmg</th>
									<th className='p-1 border'>Gate Dmg</th>
									<th className='p-1 border'>Tower Dmg</th>
									<th className='p-1 border'>Farm Rep</th>
									<th className='p-1 border'>Gate Rep</th>
									<th className='p-1 border'>Tower Rep</th>
									<th className='p-1 border'>Dealt</th>
									<th className='p-1 border'>Bought</th>
									<th className='p-1 border'>Bonus</th>
									<th className='p-1 border'>Top Played</th>
									<th className='p-1 border'>Seed</th>
								</tr>
							</thead>
							<tbody>
								{records.map((r, i) => (
									<tr
										className={
											r.outcome === 'WIN' ? 'bg-green-50' : 'bg-red-50'
										}
										key={i}
									>
										<td className='p-1 border whitespace-nowrap'>
											{formatDate(r.date)}
										</td>
										<td className='p-1 border font-bold'>
											{r.outcome === 'WIN' ? '✓ Win' : '✗ Loss'}
										</td>
										<td className='p-1 border text-center'>{r.turnCount}</td>
										<td className='p-1 border text-center'>{r.finalFear}</td>
										<td className='p-1 border text-center'>{r.fearGained}</td>
										<td className='p-1 border text-center'>{r.fearHealed}</td>
										<td className='p-1 border text-center'>
											{r.damageTakenByBuilding.farm}
										</td>
										<td className='p-1 border text-center'>
											{r.damageTakenByBuilding.gate}
										</td>
										<td className='p-1 border text-center'>
											{r.damageTakenByBuilding.tower}
										</td>
										<td className='p-1 border text-center'>
											{r.repairByBuilding.farm}
										</td>
										<td className='p-1 border text-center'>
											{r.repairByBuilding.gate}
										</td>
										<td className='p-1 border text-center'>
											{r.repairByBuilding.tower}
										</td>
										<td className='p-1 border text-center'>
											{r.damageDealtToEnemies}
										</td>
										<td className='p-1 border text-center'>
											{r.purchasedCardIds.length}
										</td>
										<td className='p-1 border text-center'>
											{r.bonusCardsDrawn}
										</td>
										<td className='p-1 border'>
											{topPlayedCards(r.cardPlayCounts)}
										</td>
										<td className='p-1 border font-mono text-gray-400'>
											{r.seed}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
			<div className='flex gap-2' slot='footer'>
				<WaButton
					appearance='outlined'
					disabled={records.length === 0}
					onClick={handleClear}
					variant='danger'
				>
					Clear History
				</WaButton>
				<WaButton appearance='filled' onClick={onClose} variant='brand'>
					Close
				</WaButton>
			</div>
		</WaDialog>
	)
}
