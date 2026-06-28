import type { Achievement } from "../types";

export function Node({ achievement, unlocked }: { achievement: Achievement, unlocked?: number[] }) {
    const isBoss = achievement.image.includes("BossRoomDoor")
    const isUnlocked = !unlocked || isBoss || unlocked[achievement.id - 1] === 1

    return (
        <div className={`flex items-center gap-2 ${isUnlocked ? "" : "grayscale"}`}>
            <img
                src={achievement.image}
                alt={achievement.name}
                decoding="async"
                loading="lazy"
                className="w-8 h-8 bg-[#16171d]"
            />
            <p className="text-gray-500">{achievement.name}</p>
        </div>
    )
}