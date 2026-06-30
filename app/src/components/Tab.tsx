import { useState, type ReactNode } from "react";

export default function Tab({ icon, title, children, hide }: { icon?: string, title: string, children: ReactNode, hide?:boolean }) {
    const [opened, setOpened] = useState(false)

    if(hide) return <div></div>

    return (
        <div className="p-2 border-2 border-t-0 border-white/[0.07] rounded-b-md" style={{ background: "rgba(8,8,10,0.92)", backdropFilter: 'blur(12px)' }} onMouseLeave={() => setOpened(false)}>
            <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setOpened(true)}>
                <img
                    src={icon}
                    width={32}
                    height={32}
                    decoding="async"
                    className="opacity-80"
                    style={{ imageRendering: "pixelated" }}
                />
                <p className="text-white/30">{title}</p>
            </div>
            {opened &&
                <div className="mt-2 pt-2 border-t-2 border-white/[0.07] px-1">
                    {children}
                </div>
            }
        </div>
    )
}