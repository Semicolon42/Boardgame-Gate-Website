import {WaButton, WaDialog} from '@awesome.me/webawesome/dist/react'
import {useState} from 'react'
import type {CardInstance, EnemyCardInstance} from '../Boards/gameStateReducer'
import {XCard} from '../Cards/XCard'
import {XEnemyCard} from '../Cards/XEnemyCard'
import {getCitizenCard} from '../Data/PlayerCardsData'

export interface CardDialogProps {
	title: string
	playerCards?: CardInstance[]
	enemyCards?: EnemyCardInstance[]
	isOpen: boolean
	onClose: (() => void) | undefined
	onTrashCard?:
		| ((card: CardInstance, consumesGenericAmount: boolean) => void)
		| undefined
	genericTrashesAvailable?: number | undefined
}

export function PlayerEnemyCardDialog({
	title,
	playerCards = [],
	enemyCards = [],
	isOpen,
	onClose,
	onTrashCard,
	genericTrashesAvailable
}: CardDialogProps) {
	const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null)
	const [trashingCard, setTrashingCard] = useState<CardInstance | null>(null)

	const isTrashable = (card: CardInstance): boolean => {
		if (!onTrashCard) return false
		const info = getCitizenCard(card.cardId)
		return (
			info.canTrashFromDiscard === true || (genericTrashesAvailable ?? 0) > 0
		)
	}

	const handleConfirmTrash = () => {
		if (!selectedCard) return
		setTrashingCard(selectedCard)
		setSelectedCard(null)
	}

	const handleTrashAnimEnd = () => {
		if (!trashingCard || !onTrashCard) return
		const info = getCitizenCard(trashingCard.cardId)
		onTrashCard(trashingCard, !info.canTrashFromDiscard)
		setTrashingCard(null)
	}

	return (
		<WaDialog
			label={title}
			lightDismiss={trashingCard === null}
			onWaAfterHide={e => {
				if (e.target === e.currentTarget && onClose) onClose()
			}}
			open={isOpen}
		>
			<div className='grid grid-cols-3 gap-1'>
				{playerCards.map(card => {
					const trashable = isTrashable(card)
					const isAnimatingAway = trashingCard?.instanceId === card.instanceId
					const isSelected = selectedCard?.instanceId === card.instanceId
					return (
						<div className='relative' key={card.instanceId}>
							<XCard
								animSpec={isAnimatingAway ? {type: 'FALL_AWAY'} : undefined}
								card={card}
								isPlayable={false}
								isTrashable={trashable}
								onAnimationEnd={
									isAnimatingAway ? handleTrashAnimEnd : undefined
								}
								onTrash={trashable ? setSelectedCard : undefined}
							/>
							{isSelected && (
								<div className='absolute bottom-0 left-0 right-0 z-10 flex justify-center pb-1'>
									<WaButton
										onClick={handleConfirmTrash}
										size='small'
										variant='danger'
									>
										Trash
									</WaButton>
								</div>
							)}
						</div>
					)
				})}
				{enemyCards.map(card => (
					<XEnemyCard card={card} isAttackable={false} key={card.instanceId} />
				))}
			</div>
			<WaButton
				appearance='filled'
				data-dialog='close'
				disabled={trashingCard !== null}
				slot='footer'
				variant='brand'
			>
				Close
			</WaButton>
		</WaDialog>
	)
}
