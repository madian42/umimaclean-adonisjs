export default function PhotoThumb({ src, label }: { src?: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src || '/placeholder.svg'} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            No photo
          </div>
        )}
      </div>
      <span className="text-[10px]">{label}</span>
    </div>
  )
}
