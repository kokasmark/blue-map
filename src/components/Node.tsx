import React from 'react'
import type { ElkNode } from 'elkjs'
import { useStore } from '../store'

interface AchievementNodeProps {
  node: ElkNode
}

export const Node = React.memo(({ node }: AchievementNodeProps) => {
  const achievement = useStore((s) => s.achievementMap[Number(node.id)])
  const unlocked = useStore((s) => s.unlocked)

  if (!achievement) return null

  const isUnlocked = !unlocked || achievement.isUnlocked;

  return (
    <div className='cursor-pointer' style={{ position: 'absolute', left: node.x, top: node.y }} title={`${achievement.name} #${achievement.id}`}>
      <div className={`flex items-center gap-2 ${isUnlocked ? "" : "grayscale"}`}>
            <img
                src={achievement.image}
                alt={achievement.name}
                decoding="async"
                loading="lazy"
                style={{imageRendering: "pixelated"}}
                className="w-[64px] h-[64px] bg-[#08080a]"
            />
        </div>
    </div>
  )
})