import {WaButton, WaDialog} from '@awesome.me/webawesome/dist/react'
import type {CardInstance, EnemyCardInstance} from '../Boards/gameStateReducer'
import {XCard} from '../Cards/XCard'
import {XEnemyCard} from '../Cards/XEnemyCard'

export function PlayerEnemyCardDialog(props: {
	title: string
	playerCards?: CardInstance[]
	enemyCards?: EnemyCardInstance[]
	isOpen: boolean
	onClose: () => void
}) {
	const {title, playerCards = [], enemyCards = [], isOpen, onClose} = props
	return (
		<WaDialog
			label={title}
			onWaAfterHide={e => { if (e.target === e.currentTarget) onClose() }}
			open={isOpen}
			lightDismiss
		>
			<div className='grid grid-cols-3 gap-1'>
				{playerCards.map(card => (
					<XCard card={card} isPlayable={false} />
				))}
				{enemyCards.map(card => (
					<XEnemyCard card={card} isAttackable={false} />
				))}
			</div>
			<WaButton
				appearance='filled'
				data-dialog='close'
				slot='footer'
				variant='brand'
			>
				Close
			</WaButton>
		</WaDialog>
	)
}
