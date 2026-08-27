import { Lottie } from 'lottie-react'

type Props = {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function LottiePlayer({
  src,
  className,
  loop = true,
  autoplay = true,
}: Props) {
  return (
    <Lottie
      className={className}
      src={src}
      loop={loop}
      autoplay={autoplay}
    />
  )
}

export function lottieUrl(name: 'search' | 'success'): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
  return `${base}lottie/${name}.json`
}
