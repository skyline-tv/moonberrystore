export function BrandMark({ size = 'md', showWordmark = false, className = '' }) {
  const iconSize = { sm: 'h-8', md: 'h-10', lg: 'h-12' }[size] ?? 'h-10'
  const wordSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }[size] ?? 'text-xl'

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="logo-seal">
        <img
          src="/logo.png"
          alt="Moonberry"
          className={`${iconSize} w-auto shrink-0 object-contain`}
        />
      </span>
      {showWordmark ? (
        <span className={`font-serif ${wordSize} leading-none tracking-tight text-moonberry-brown`}>
          Moonberry
        </span>
      ) : null}
    </span>
  )
}
