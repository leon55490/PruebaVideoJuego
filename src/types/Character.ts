export type Direction = 'down' | 'up' | 'left' | 'right';

export interface CharacterSprites {
    down: string[];
    up: string[];
    left: string[];
    right: string[];
}

export interface Goal {
    task: string;
    location: string;
    completed: boolean;
}

export interface Character {
    id: number;
    name: string;
    x: number;
    y: number;
    sprites: CharacterSprites;
    direction: Direction;
    animationFrame: number;
    isMoving: boolean;
    // AI-driven properties
    personality: string;
    memories: string[];
    dailyGoals: Goal[];
    currentGoalIndex: number;
    // Nuevas propiedades para interacciones
    relationships?: { [characterId: number]: string }; // Relación con otros personajes
    mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'tired'; // Estado de ánimo
    lastInteraction?: number; // Timestamp de la última interacción
}
