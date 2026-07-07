// HP/MPゲージ。色は Tailwind の bg-* クラスで渡す
export function Bar({
  value,
  max,
  colorClass,
}: {
  value: number
  max: number
  colorClass: string
}) {
  return (
    <div className="w-full rounded-[2px] border-[3px] border-white p-[2px]">
      <div
        className={`h-2 transition-[width] duration-300 ease-[steps(8)] ${colorClass}`}
        style={{ width: `${Math.max(0, (value / max) * 100)}%` }}
      />
    </div>
  )
}
