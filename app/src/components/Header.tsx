import React, { useCallback, useState } from "react"
import { useLayout, useStore } from "../store"
import { loadSecrets } from "../parse";
import Tab from "./Tab";
import { getCompletion } from "../utils";
import { CompletionBar } from "./CompletionBar";

export const Header = React.memo(() => {
    const achievements = useStore((s) => s.achievements);
    const map = useStore((s) => s.achievementMap);
    const setUnlocked = useStore((s) => s.setUnlocked)
    const layout = useLayout();
    const graphRef = useStore((s) => s.graphRef)

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

    const latestUnlocked = achievements.map(a => map[a.id]).filter(a => a.isUnlocked && !a.essential).toReversed()
    const latestUnlockable = achievements.map(a => map[a.id]).filter(a => a.isUnlockable).toReversed()

    return (
        <header className="fixed top-0 left-0 right-0 z-1000 flex justify-between items-center px-8 py-3 border-b-2 border-white/[0.07]"
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
                <Tab title="Unlockables" icon={latestUnlockable.at(-1)?.image} hide={latestUnlockable.length === 0}>
                    <div className="flex flex-col max-h-128 overflow-y-auto">
                        {
                            latestUnlockable.map((a) => (
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

                                    <p className="text-sm text-yellow-400/80">{a.name} #{a.id}</p>
                                    <p className="text-[11px] text-white/50">{a.unlock}</p>
                                </div>
                            ))
                        }
                    </div>
                </Tab>

                <Tab title="Latest Unlocks" icon={latestUnlocked.at(-1)?.image} hide={latestUnlocked.length === 0}>
                    <div className="flex flex-col max-h-128 overflow-y-auto">
                        {
                            latestUnlocked.map((a) => (
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

                                    <p className="text-green-400/80 text-sm">{a.name} #{a.id}</p>
                                    <p className="text-[11px] text-white/50">{a.unlock}</p>
                                </div>
                            ))
                        }
                    </div>
                </Tab>
            </div>

        </header>
    )
})
