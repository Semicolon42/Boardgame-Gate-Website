import type {RefObject} from 'react'

export function CardSlot(props: {
	title?: string | undefined
	ref?: RefObject<HTMLDivElement | null>
}) {
	const {title, ref} = props
	return (
		<div
			className='relative justify-center flex h-[140px] w-[100px] shrink-0 rounded-xl border-2 border-gray-600 border-dashed bg-gray-800/40'
			ref={ref}
		>
			<div className='absolute top-1 text-lg text-(--color-card-text)'>
				{title}
			</div>
		</div>
	)
}
