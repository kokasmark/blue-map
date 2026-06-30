export interface IAchievement{
    id: number;
    name: string;
    image: string;
    description: string;
    unlock: string;
    children: number[]
    parents: number[]
}

export interface Achievement extends IAchievement {
  isUnlocked: boolean
  isUnlockable: boolean
}

export interface CompletionTier {
  label: string
  description: string
  secret: number
  icon: string
}