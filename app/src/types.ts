export interface Achievement{
    id: number;
    name: string;
    image: string;
    description: string;
    unlock: string;
    children: number[]
    parents: number[]
}