import {WaButton, WaDialog} from '@awesome.me/webawesome/dist/react'
import {useState} from 'react'
import type {CardInstance, EnemyCardInstance} from '../Boards/gameStateReducer'
import {XCard} from '../Cards/XCard'
import {XEnemyCard} from '../Cards/XEnemyCard'
import {getCitizenCard} from '../Data/PlayerCards'

export function PlayerEnemyCardDialog(props: {
	title: string
	playerCards?: CardInstance[]
	enemyCards?: EnemyCardInstance[]
	isOpen: boolean
	onClose: () => void
	onTrashCard?: ((card: CardInstance, consumesGenericAmount: boolean) => void) | undefined
	genericTrashesAvailable?: number | undefined
}) {
	const {
		title,
		playerCards = [],
		enemyCards = [],
		isOpen,
		onClose,
		onTrashCard,
		genericTrashesAvailable
	} = props

	const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null)
	const [trashingCard, setTrashingCard] = useState<CardInstance | null>(null)

	const isTrashable = (card: CardInstance): boolean => {
		if (!onTrashCard) return false
		const info = getCitizenCard(card.cardId)
		return info.canTrashFromDiscard === true || (genericTrashesAvailable ?? 0) > 0
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
				if (e.target === e.currentTarget) onClose()
			}}
			open={isOpen}
		>
			<div className='grid grid-cols-3 gap-1'>
				{playerCards.map(card => {
					const trashable = isTrashable(card)
					const isAnimatingAway = trashingCard?.instanceId === card.instanceId
					const isSelected = selectedCard?.instanceId === card.instanceId
					return (
						<div key={card.instanceId} className='relative'>
							<XCard
								animSpec={isAnimatingAway ? {type: 'FALL_AWAY'} : undefined}
								card={card}
								isPlayable={false}
								isTrashable={trashable}
								onAnimationEnd={isAnimatingAway ? handleTrashAnimEnd : undefined}
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
					<XEnemyCard key={card.instanceId} card={card} isAttackable={false} />
				))}
			</div>
				<WaButton
					appearance='filled'
					data-dialog='close'
					slot='footer'
					variant='brand'
					disabled={trashingCard !== null}
				>
					Close
				</WaButton>
		</WaDialog>
	)
}
