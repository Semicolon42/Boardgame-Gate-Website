import type { RefObject } from "react"
import type { EnemyCardInstance } from "../gameStateReducer"
import { CardSlot } from "./CardSlot"
import { getEnemyCard } from "@/GateComponents/Data/EnemyCardsData"
import { WaIcon } from "@awesome.me/webawesome/dist/react"
import {cnStackTitle} from './stackStyles'

export function EnemyDeck(props: {
	enemyDeck: EnemyCardInstance[]
	eDeckRef?: RefObject<HTMLDivElement | null> | undefined
	onViewDeck?: (() => void) | undefined
}) {
	const {enemyDeck, eDeckRef, onViewDeck: onViewEnemyDeck} = props
	if (enemyDeck.length <= 0) {
		return <CardSlot />
	}
	const cn = [
		'relative flex flex-col items-center justify-center',
		'h-[140px] w-[100px] rounded-xl',
		'bg-(--color-card-back) text-(--color-card-text)',
		'outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)',
		onViewEnemyDeck ? 'cursor-pointer' : ''
	].join(' ')

	let topEnemyLevel = '<empty>'
	if (enemyDeck.length > 0) {
		switch (getEnemyCard(enemyDeck[0]?.cardId ?? 0).type) {
			case 'L1':
				topEnemyLevel = 'WAVE 1'
				break
			case 'L2':
				topEnemyLevel = 'WAVE 2'
				break
			case 'L3':
				topEnemyLevel = 'WAVE 3'
				break
			case 'Z':
				topEnemyLevel = 'ZOLTAR'
				break
			default:
				topEnemyLevel = 'default'
				break
		}
	}

	return (
		<div
			className={cn}
			ref={eDeckRef}
			{...(onViewEnemyDeck ? {role: 'button', onClick: onViewEnemyDeck} : {})}
		>
			<div className={cnStackTitle}>Enemy</div>
			<WaIcon className='text-6xl' name='skull' />
			<div className='absolute bottom-0'>{topEnemyLevel}</div>
		</div>
	)
}