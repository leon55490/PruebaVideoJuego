import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../types/Character';
import './Town.css';

const TILE_SIZE = 64;
const TOWN_WIDTH = 800;
const TOWN_HEIGHT = 600;
const MOVEMENT_SPEED = 500; // Velocidad de movimiento
const FRAME_SPEED = 150; // Velocidad de animación de frames
const MOVE_DISTANCE = 3; // Distancia de movimiento por step

// Función para contar frames disponibles para cada personaje
const getFrameCount = (spriteFolder: string): number => {
	let count = 0;
	for (let i = 1; i <= 10; i++) {
		try {
			require(`../personajes/${spriteFolder}/Walk${i}.png`);
			count++;
		} catch {
			break;
		}
	}
	console.log(`Personaje ${spriteFolder} tiene ${count} frames de walk`);
	return count || 1;
};

// Nombres únicos para cada personaje
const characterNames = ['Elena', 'Marco', 'Sofia', 'Leo', 'Maya', 'Alex'];

const initialCharacters: Character[] = [
	{
		id: 1,
		name: characterNames[0],
		x: Math.random() * (TOWN_WIDTH - TILE_SIZE),
		y: Math.random() * (TOWN_HEIGHT - TILE_SIZE),
		spriteFolder: '1',
		currentAnimation: 'Walk',
		direction: 'right',
		isMoving: true,
		currentFrame: 1,
		frameCount: {
			Walk: getFrameCount('1'),
			Idle: 1,
			Special: 1,
		},
	},
	{
		id: 2,
		name: characterNames[1],
		x: Math.random() * (TOWN_WIDTH - TILE_SIZE),
		y: Math.random() * (TOWN_HEIGHT - TILE_SIZE),
		spriteFolder: '2',
		currentAnimation: 'Walk',
		direction: 'right',
		isMoving: true,
		currentFrame: 1,
		frameCount: {
			Walk: getFrameCount('2'),
			Idle: 1,
			Special: 1,
		},
	},
	{
		id: 3,
		name: characterNames[2],
		x: Math.random() * (TOWN_WIDTH - TILE_SIZE),
		y: Math.random() * (TOWN_HEIGHT - TILE_SIZE),
		spriteFolder: '3',
		currentAnimation: 'Walk',
		direction: 'right',
		isMoving: true,
		currentFrame: 1,
		frameCount: {
			Walk: getFrameCount('3'),
			Idle: 1,
			Special: 1,
		},
	},
	{
		id: 4,
		name: characterNames[3],
		x: Math.random() * (TOWN_WIDTH - TILE_SIZE),
		y: Math.random() * (TOWN_HEIGHT - TILE_SIZE),
		spriteFolder: '4',
		currentAnimation: 'Walk',
		direction: 'right',
		isMoving: true,
		currentFrame: 1,
		frameCount: {
			Walk: getFrameCount('4'),
			Idle: 1,
			Special: 1,
		},
	},
	{
		id: 5,
		name: characterNames[4],
		x: Math.random() * (TOWN_WIDTH - TILE_SIZE),
		y: Math.random() * (TOWN_HEIGHT - TILE_SIZE),
		spriteFolder: '5',
		currentAnimation: 'Walk',
		direction: 'right',
		isMoving: true,
		currentFrame: 1,
		frameCount: {
			Walk: getFrameCount('5'),
			Idle: 1,
			Special: 1,
		},
	},
	{
		id: 6,
		name: characterNames[5],
		x: Math.random() * (TOWN_WIDTH - TILE_SIZE),
		y: Math.random() * (TOWN_HEIGHT - TILE_SIZE),
		spriteFolder: '6',
		currentAnimation: 'Walk',
		direction: 'right',
		isMoving: true,
		currentFrame: 1,
		frameCount: {
			Walk: getFrameCount('6'),
			Idle: 1,
			Special: 1,
		},
	},
];

const Town: React.FC = () => {
	const [characters, setCharacters] = useState<Character[]>(initialCharacters);
	const movementAnimationId = useRef<number | null>(null);
	const frameAnimationId = useRef<number | null>(null);
	const lastMovementTime = useRef<number>(0);
	const lastFrameTime = useRef<number>(0);

	// Actualizar movimiento aleatorio continuo
	const updateCharacterMovement = (currentTime: number) => {
		if (currentTime - lastMovementTime.current > MOVEMENT_SPEED) {
			setCharacters((prevCharacters) =>
				prevCharacters.map((char) => {
					// Generar dirección aleatoria (-1, 0, 1) para X e Y
					const moveX = (Math.random() - 0.5) * 2; // Random entre -1 y 1
					const moveY = (Math.random() - 0.5) * 2; // Random entre -1 y 1

					// Normalizar y aplicar distancia de movimiento
					const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
					const normalizedX = magnitude > 0 ? (moveX / magnitude) * MOVE_DISTANCE : 0;
					const normalizedY = magnitude > 0 ? (moveY / magnitude) * MOVE_DISTANCE : 0;

					let newX = char.x + normalizedX;
					let newY = char.y + normalizedY;

					// Boundary checks - rebote en los bordes
					if (newX < 0) {
						newX = 0;
					} else if (newX > TOWN_WIDTH - TILE_SIZE) {
						newX = TOWN_WIDTH - TILE_SIZE;
					}

					if (newY < 0) {
						newY = 0;
					} else if (newY > TOWN_HEIGHT - TILE_SIZE) {
						newY = TOWN_HEIGHT - TILE_SIZE;
					}

					// Determinar dirección basada en movimiento
					let direction = char.direction;
					if (normalizedX > 0.5) {
						direction = 'right';
					} else if (normalizedX < -0.5) {
						direction = 'left';
					}

					// Ocasionalmente hacer que se detengan
					const shouldStop = Math.random() < 0.15; // 15% chance de parar (un poco más para evitar multitudes)

					if (shouldStop) {
						return {
							...char,
							currentAnimation: 'Idle',
							isMoving: false,
							currentFrame: 1,
							direction,
						};
					}

					return {
						...char,
						x: newX,
						y: newY,
						currentAnimation: 'Walk',
						isMoving: true,
						direction,
					};
				})
			);
			lastMovementTime.current = currentTime;
		}
		movementAnimationId.current = requestAnimationFrame(updateCharacterMovement);
	};

	// Actualizar frames de animación
	const updateAnimationFrames = (currentTime: number) => {
		if (currentTime - lastFrameTime.current > FRAME_SPEED) {
			setCharacters((prevCharacters) =>
				prevCharacters.map((char) => {
					// Solo animar frames si está caminando
					if (char.currentAnimation === 'Walk' && char.isMoving) {
						const maxFrames = char.frameCount['Walk'];
						const nextFrame = char.currentFrame >= maxFrames ? 1 : char.currentFrame + 1;

						return {
							...char,
							currentFrame: nextFrame,
						};
					}

					// Si está en Idle, mantener frame 1
					if (char.currentAnimation === 'Idle') {
						return {
							...char,
							currentFrame: 1,
						};
					}

					return char;
				})
			);
			lastFrameTime.current = currentTime;
		}
		frameAnimationId.current = requestAnimationFrame(updateAnimationFrames);
	};

	useEffect(() => {
		movementAnimationId.current = requestAnimationFrame(updateCharacterMovement);
		frameAnimationId.current = requestAnimationFrame(updateAnimationFrames);

		return () => {
			if (movementAnimationId.current) {
				cancelAnimationFrame(movementAnimationId.current);
			}
			if (frameAnimationId.current) {
				cancelAnimationFrame(frameAnimationId.current);
			}
		};
	}, []);

	const handleCharacterClick = (character: Character) => {
		// Parar temporalmente al hacer clic
		setCharacters((prevCharacters) =>
			prevCharacters.map((char) =>
				char.id === character.id
					? { ...char, currentAnimation: 'Special', currentFrame: 1, isMoving: false }
					: char
			)
		);

		setTimeout(() => {
			setCharacters((prevCharacters) =>
				prevCharacters.map((char) =>
					char.id === character.id
						? { ...char, currentAnimation: 'Walk', currentFrame: 1, isMoving: true }
						: char
				)
			);
		}, 1500);

		alert(`¡Hola! Soy ${character.name} (Personaje ${character.spriteFolder})`);
	};

	const getSpriteUrl = (character: Character) => {
		try {
			// Para Idle: siempre usar Walk1.png
			if (character.currentAnimation === 'Idle') {
				return require(`../personajes/${character.spriteFolder}/Walk1.png`);
			}

			// Para Walk: ciclar por todos los frames
			if (character.currentAnimation === 'Walk') {
				return require(`../personajes/${character.spriteFolder}/Walk${character.currentFrame}.png`);
			}

			// Para Special: usar Walk1.png
			return require(`../personajes/${character.spriteFolder}/Walk1.png`);
		} catch (error) {
			console.error(
				`Error loading sprite for ${character.name} (${character.spriteFolder}):`,
				error
			);
			// Fallback: intentar con Walk1.png del personaje 1
			try {
				return require(`../personajes/1/Walk1.png`);
			} catch (fallbackError) {
				return '';
			}
		}
	};

	return (
		<div id="town-container" className="town-container">
			{characters.map((character) => (
				<div
					key={character.id}
					style={{
						position: 'absolute',
						left: `${character.x}px`,
						top: `${character.y}px`,
					}}
				>
					<img
						src={getSpriteUrl(character)}
						alt={character.name}
						className={`character-sprite ${
							character.direction
						} ${character.currentAnimation.toLowerCase()}`}
						style={{
							transform: character.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
						}}
						onClick={() => handleCharacterClick(character)}
						onError={() => console.error(`Failed to load sprite for ${character.name}`)}
					/>
					{/* Debug info opcional */}
					<div
						style={{
							position: 'absolute',
							top: '-20px',
							left: '0',
							fontSize: '10px',
							color: 'black',
							background: 'rgba(255,255,255,0.7)',
							padding: '2px',
							borderRadius: '2px',
						}}
					>
						{character.name}
					</div>
				</div>
			))}
		</div>
	);
};

export default Town;
