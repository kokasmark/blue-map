import React, { useCallback, useState } from "react"
import { useLayout, useStore } from "../store"
import { loadSecrets } from "../parse";
import Tab from "./Tab";
import { EdgeTooltip } from "./Edge";
import { getCompletion } from "../utils";
import { CompletionBar } from "./CompletionBar";

export const Header = React.memo(() => {
    const achievements = useStore((s) => s.achievements);
    const map = useStore((s) => s.achievementMap);
    const transform = useStore((s) => s.transform)
    const setTransform = useStore((s) => s.setTransform)
    const setUnlocked = useStore((s) => s.setUnlocked)
    const layout = useLayout();
    const graphRef = useStore((s) => s.graphRef)
    const hoveredEdge = useStore((s) => s.hoveredEdge)

    const [completion, setCompletion] = useState<ReturnType<typeof getCompletion>>()

    const handleLoadFile = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return
            const fromSave = await loadSecrets(files[0])
            setUnlocked(fromSave)
            setCompletion(getCompletion(fromSave))
        },
        [setUnlocked],
    )

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 border-b-2 border-white/[0.07]"
            style={{ background: 'rgba(8,8,10,0.92)', backdropFilter: 'blur(12px)' }}
        >
            <div className="flex items-center gap-3">
                <img
                    src="https://static.wikia.nocookie.net/bindingofisaacre_gamepedia/images/c/c6/Achievement_Blue_Map_icon.png"
                    width={64}
                    height={64}
                    decoding="async"
                    className="opacity-80"
                    style={{ imageRendering: "pixelated" }}
                />
                <div className="flex flex-col items-baseline">
                    <span className="text-sm font-semibold tracking-widest text-white/90 uppercase">Blue Map</span>
                    <span className="text-[11px] text-white/25 tracking-wide">The Binding Of Isaac Progress Tree</span>
                </div>
            </div>

            {completion && (
                <CompletionBar completion={completion} />
            )}

            <div className="flex items-center">
                {/* {transform && <p className="text-xs text-white/20 cursor-pointer border-r-2 px-4 py-2" title="Center"
                    onClick={() => setTransform({ x: 0, y: 0, scale: 0.03 })}>{Math.round(transform.x)}px {Math.round(transform.y)}px {Math.round(transform.scale * 100)}%</p>} */}

                <div className="flex items-center gap-2.5 text-xs border-r-2 px-4 text-white/20 py-2">
                    <span className="tabular-nums text-green-400/80">{achievements.map(a => map[a.id]).filter(a => a.isUnlocked).length}</span>
                    <span className="text-white/25">/</span>
                    <span className="tabular-nums text-yellow-400/80">{achievements.map(a => map[a.id]).filter(a => a.isUnlockable).length}</span>
                    <span className="text-white/25">/</span>
                    <span className="tabular-nums text-white/30">{achievements.length}</span>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer group ml-4">
                    <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">
                        Load save file
                    </span>
                    <input className="hidden" type="file" onChange={(e) => handleLoadFile(e.target.files)} />
                    <span className="px-3 py-1.5 rounded-lg text-xs text-white/60 group-hover:text-white/90 border border-white/10 group-hover:border-white/20 transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                        Browse
                    </span>
                </label>
            </div>

            <div className="absolute flex top-20 left-4 items-start gap-4">
                <Tab title="Unlockables" icon={achievements.map(a => map[a.id]).filter(a => a.isUnlockable).at(-1)?.image} hide={achievements.map(a => map[a.id]).filter(a => a.isUnlockable).length === 0}>
                    <div className="flex flex-col">
                        {
                            achievements.map(a => map[a.id]).filter(a => a.isUnlockable).toReversed().slice(0, 10).map((a) => (
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                    const node = layout?.children?.find((n) => n.id === String(a.id))
                                    if (!node) return
                                    graphRef.current?.focusPoint(
                                        node.x! + node.width! / 2,
                                        node.y! + node.height! / 2,
                                    )
                                }}>
                                    <img
                                        src={a.image}
                                        alt={a.name}
                                        decoding="async"
                                        loading="lazy"
                                        style={{ imageRendering: "pixelated" }}
                                        className="w-[32px] h-[32px] bg-[#16171d]"
                                    />

                                    <p className="font-medium text-yellow-400/80">{a.name}</p>
                                    <p className="text-xs text-white/50">{a.unlock}</p>
                                </div>
                            ))
                        }
                    </div>
                </Tab>

                <Tab title="Latest Unlocks" icon={achievements.map(a => map[a.id]).filter(a => a.isUnlocked).at(-1)?.image} hide={achievements.map(a => map[a.id]).filter(a => a.isUnlocked).length === 0}>
                    <div className="flex flex-col">
                        {
                            achievements.map(a => map[a.id]).filter(a => a.isUnlocked).toReversed().slice(0, 10).map((a) => (
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                    const node = layout?.children?.find((n) => n.id === String(a.id))
                                    if (!node) return
                                    graphRef.current?.focusPoint(
                                        node.x! + node.width! / 2,
                                        node.y! + node.height! / 2,
                                    )
                                }}>
                                    <img
                                        src={a.image}
                                        alt={a.name}
                                        decoding="async"
                                        loading="lazy"
                                        style={{ imageRendering: "pixelated" }}
                                        className="w-[32px] h-[32px] bg-[#16171d]"
                                    />

                                    <p className="font-medium text-green-400/80">{a.name}</p>
                                    <p className="text-xs text-white/50">{a.unlock}</p>
                                </div>
                            ))
                        }
                    </div>
                </Tab>

                {hoveredEdge &&
                    <Tab title={map[parseInt(hoveredEdge.split('-')[1])]?.name} icon={map[parseInt(hoveredEdge.split('-')[1])]?.image} hide={!hoveredEdge}>
                        {(()=>{
                            const targetId = parseInt(hoveredEdge.split('-')[1])
                            const targetAch = map[targetId]

                            const isUnlocked = !!targetAch?.isUnlocked
                            const isUnlockable = !!targetAch?.isUnlockable

                            const baseColor = isUnlocked ? '#86efac' : isUnlockable ? '#fef08a' : '#444'
                            const color = isUnlocked ? '#86efac' : isUnlockable ? '#fef08a' : 'white'

                            return <EdgeTooltip edgeId={hoveredEdge} color={color}/>
                        })()}
                    </Tab>
                }
            </div>

        </header>
    )
})
