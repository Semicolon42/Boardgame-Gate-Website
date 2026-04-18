import type {RefObject} from 'react'

export function CardSlot(props: {
	title?: string | undefined
	ref?: RefObject<HTMLDivElement | null>
	bottomText?: string | undefined
	onClick?: (() => void) | undefined
}) {
	const {title, ref, bottomText = undefined, onClick = undefined} = props
	let cn = [
		'group/cardSlot relative justify-center flex',
		'h-[140px] w-[100px]', 
		'shrink-0 rounded-xl',
		'border-2 border-gray-600 border-dashed bg-gray-800/40',
		(onClick ? 'cursor-pointer' : '')
	].join(' ')
	return (
		<div
			className={cn}
			{...(onClick !== undefined ? {role: 'button', onClick} : {})}
			ref={ref}
		>
			<div className='absolute top-1 text-lg text-(--color-card-text)'>
				{title}
			</div>
			<div className='absolute bottom-0 text-xs text-(--color-card-text) group-hover/cardSlot:font-bold'>
				{bottomText}
			</div>
		</div>
	)
}
