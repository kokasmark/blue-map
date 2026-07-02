import type { getCompletion } from "../utils"

interface Props {
    completion: ReturnType<typeof getCompletion>
}

export function CompletionBar({ completion }: Props) {
    const { current, next, percent } = completion

    return (
        <div className="flex items-center gap-4"
            style={{ background: 'rgba(8,8,10,0.92)' }}>

            <div className="flex items-center gap-2 shrink-0 cursor-pointer" title={current?.description}>
                {current ? (
                    <>
                        <img src={current.icon} width={64} height={64}
                            style={{ imageRendering: 'pixelated' }} className="opacity-90" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-white/90 truncate">{current.label}</span>
                        </div>
                    </>
                ) : (
                    <span className="text-xs text-white/20">No rank yet</span>
                )}
            </div>

            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden w-64 cursor-pointer" title={`${Math.round(percent)}%`}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${Math.round(percent)}%`,
                        background: percent === 100 ? '#86efac' : '#fef08a',
                    }}
                />
            </div>

            <div className="flex items-center gap-2 shrink-0 justify-end cursor-pointer" title={next?.description}>
                {next ? (
                    <>
                        <div className="flex flex-col min-w-0 items-end">
                            <span className={`text-xs font-medium ${ Math.round(percent) < 100 ? "text-white/40" : "text-white/90"} truncate`}>{next.label}</span>
                        </div>
                        <img src={next.icon} width={64} height={64}
                            style={{ imageRendering: 'pixelated', filter: Math.round(percent) < 100 ? 'grayscale(1)' : '', opacity: Math.round(percent) < 100 ? 0.3 : 1.0 }}/>
                    </>
                ) : (
                    <span className="text-xs text-white/20">...</span>
                )}
            </div>

        </div>
    )
}