import {WaButton, WaDialog} from '@awesome.me/webawesome/dist/react'
import type {CardInstance, EnemyCardInstance} from '../Boards/gameStateReducer'
import {XCard} from '../Cards/XCard'
import {XEnemyCard} from '../Cards/XEnemyCard'
import { getCitizenCard } from '../Data/PlayerCards'

export function PlayerEnemyCardDialog(props: {
	title: string
	playerCards?: CardInstance[]
	enemyCards?: EnemyCardInstance[]
	isOpen: boolean
	mayTrashFromDiscard: number
	onTrashCardFromDiscard: (card: CardInstance)=>void
	onClose: () => void
}) {
	const {title, playerCards = [], enemyCards = [], isOpen, onClose, mayTrashFromDiscard=0, onTrashCardFromDiscard} = props
	return (
		<WaDialog
			label={title}
			lightDismiss={true}
			onWaAfterHide={e => {
				if (e.target === e.currentTarget) onClose()
			}}
			open={isOpen}
		>
			<div className='grid grid-cols-3 gap-1'>
				{playerCards.map(card => {
					const canTrash = (
						(getCitizenCard(card.cardId).canTrashFromDiscard ?? false)
						|| mayTrashFromDiscard > 0
					)
					return (
						<XCard 
							card={card} 
							isPlayable={false} 
							isTrashable={canTrash}
							onTrash={onTrashCardFromDiscard}
						/>
					)}
				)}
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
