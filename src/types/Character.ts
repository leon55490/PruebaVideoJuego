export interface Character {
    id: number;
    name: string;
    x: number;
    y: number;
    spriteFolder: string; // Carpeta del sprite (1, 2, 3, etc.)
    currentAnimation: 'Idle' | 'Walk' | 'Special';
    direction: 'left' | 'right';
    isMoving: boolean;
    currentFrame: number; // Frame actual de la animación
    frameCount: { [key: string]: number }; // Número de frames por animación
}