export function BrandMark({ size = 'md', showWordmark = false, className = '' }) {
  const iconSize = { sm: 'h-9', md: 'h-11', lg: 'h-16', xl: 'h-32' }[size] ?? 'h-11'
  const wordSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl', xl: 'text-3xl' }[size] ?? 'text-xl'

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="Moonberry"
        className={`${iconSize} w-auto shrink-0 object-contain`}
      />
      {showWordmark ? (
        <span className={`font-serif ${wordSize} leading-none tracking-tight text-moonberry-brown`}>
          Moonberry
        </span>
      ) : null}
    </span>
  )
}
