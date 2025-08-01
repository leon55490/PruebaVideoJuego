
import React, { useState, useEffect, useRef } from 'react';
import { Character, CharacterSprites, Direction, Goal } from '../types/Character';
import './Town.css';

const TILE_SIZE = 48;
const TOWN_WIDTH = 800;
const TOWN_HEIGHT = 600;
const ANIMATION_TICK_SPEED = 15;
const MOVEMENT_SPEED = 1.2;
const GOAL_REACH_THRESHOLD = 5;

// Realistic timing
const TASK_DURATION = 5000;
const EXPLORATION_DURATION = 3000;
const EXPLORATION_RADIUS = 40;
const TASK_REGENERATION_PAUSE = 5000; // 5-second pause before regenerating tasks

const GITHUB_RAW_BASE_URL =
	'https://raw.githubusercontent.com/leon55490/PruebaVideoJuego/main/src/personajes/';

// --- Expanded Locations (13 new locations) ---
const locations: { [key: string]: { x: number; y: number } } = {
	// Original locations
	park: { x: 100, y: 100 },
	office: { x: 700, y: 150 },
	cafe: { x: 250, y: 450 },
	animal_shelter: { x: 50, y: 500 },
	library: { x: 400, y: 50 },
	plaza: { x: 400, y: 300 },
	bakery: { x: 550, y: 450 },
	fountain: { x: 400, y: 250 },
	power_plant: { x: 700, y: 500 },
	bar: { x: 150, y: 300 },
	// 13 new locations
	town_hall: { x: 50, y: 50 },
	market: { x: 750, y: 50 },
	school: { x: 50, y: 250 },
	hospital: { x: 750, y: 250 },
	church: { x: 200, y: 50 },
	gym: { x: 600, y: 50 },
	museum: { x: 50, y: 350 },
	theater: { x: 750, y: 350 },
	beach: { x: 200, y: 550 },
	dock: { x: 600, y: 550 },
	forest: { x: 100, y: 400 },
	hills: { x: 500, y: 150 },
	windmill: { x: 650, y: 350 },
};

// Array shuffling function (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// Generate random exploration tasks
const generateExplorationTasks = (): Goal[] => {
	const explorationLocations = [
		'forest',
		'hills',
		'windmill',
		'beach',
		'dock',
		'museum',
		'theater',
	];
	const shuffledLocations = shuffleArray(explorationLocations);
	const numTasks = 2 + Math.floor(Math.random() * 2);

	return shuffledLocations.slice(0, numTasks).map((location) => ({
		task: `Explore ${location.replace('_', ' ')}`,
		location,
		completed: false,
	}));
};

// --- Sprite Definitions ---
const danteSprites: CharacterSprites = {
	down: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}dante/dante${i + 1}.png`
	),
	up: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}dante/dante${i + 1}.png`
	),
	left: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}dante/dante${i + 1}.png`
	),
	right: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}dante/dante${i + 1}.png`
	),
};

const dianaSprites: CharacterSprites = {
	down: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}diana/diana${i + 1}.png`
	),
	up: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}diana/diana${i + 1}.png`
	),
	left: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}diana/diana${i + 1}.png`
	),
	right: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}diana/diana${i + 1}.png`
	),
};

const elenaSprites: CharacterSprites = {
	down: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}elena/elena${i + 1}.png`
	),
	up: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}elena/elena${i + 1}.png`
	),
	left: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}elena/elena${i + 1}.png`
	),
	right: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}elena/elena${i + 1}.png`
	),
};

const marcoSprites: CharacterSprites = {
	down: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}marco/marco${i + 1}.png`
	),
	up: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}marco/marco${i + 1}.png`
	),
	left: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}marco/marco${i + 1}.png`
	),
	right: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}marco/marco${i + 1}.png`
	),
};

const maxSprites: CharacterSprites = {
	down: Array.from({ length: 6 }, (_, i) => `${GITHUB_RAW_BASE_URL}max/max${i + 1}.png`),
	up: Array.from({ length: 6 }, (_, i) => `${GITHUB_RAW_BASE_URL}max/max${i + 1}.png`),
	left: Array.from({ length: 6 }, (_, i) => `${GITHUB_RAW_BASE_URL}max/max${i + 1}.png`),
	right: Array.from({ length: 6 }, (_, i) => `${GITHUB_RAW_BASE_URL}max/max${i + 1}.png`),
};

const yasminSprites: CharacterSprites = {
	down: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}yasmin/yasmin${i + 1}.png`
	),
	up: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}yasmin/yasmin${i + 1}.png`
	),
	left: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}yasmin/yasmin${i + 1}.png`
	),
	right: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}yasmin/yasmin${i + 1}.png`
	),
};

// Add prota sprites
const protaSprites: CharacterSprites = {
	down: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}prota/prota${i + 1}.png`
	),
	up: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}prota/prota${i + 1}.png`
	),
	left: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}prota/prota${i + 1}.png`
	),
	right: Array.from(
		{ length: 6 },
		(_, i) => `${GITHUB_RAW_BASE_URL}prota/prota${i + 1}.png`
	),
};

// --- Base Character Definitions with mixed tasks ---
const characterDefinitions = [
	{
		id: 1,
		name: 'Dante',
		x: 50,
		y: 100,
		sprites: danteSprites,
		personalityKeywords: 'Ambitious, analytical, reserved. Likes to have control.',
		memories: [
			'Used to lead a youth group that organized science events.',
			'Has a friendly rivalry with Marco since university.',
		],
		baseTasks: [
			{ task: 'Meditate in the morning', location: 'park', completed: false },
			{ task: 'Work in his tech office', location: 'office', completed: false },
			{ task: 'Debate ideas with Marco', location: 'office', completed: false },
			{ task: 'Buy coffee before going home', location: 'cafe', completed: false },
			{ task: 'Visit the town hall', location: 'town_hall', completed: false },
		],
	},
	{
		id: 2,
		name: 'Diana',
		x: 150,
		y: 150,
		sprites: dianaSprites,
		personalityKeywords: 'Kind, creative, empathetic. Always willing to help.',
		memories: [
			'Took care of Elena when they were both young.',
			'Helped organize a local animal shelter.',
		],
		baseTasks: [
			{ task: 'Pick flowers for her garden', location: 'park', completed: false },
			{ task: 'Visit the animal shelter', location: 'animal_shelter', completed: false },
			{ task: 'Chat with Yasmin about books', location: 'library', completed: false },
			{ task: 'Paint in the plaza', location: 'plaza', completed: false },
			{
				task: 'Go to the hospital for a checkup',
				location: 'hospital',
				completed: false,
			},
		],
	},
	{
		id: 3,
		name: 'Elena',
		x: 250,
		y: 200,
		sprites: elenaSprites,
		personalityKeywords: 'Curious, impulsive, dreamer.',
		memories: [
			'Was a sickly child and Diana took care of her.',
			'Dreams of becoming a writer.',
		],
		baseTasks: [
			{ task: 'Write at the library', location: 'library', completed: false },
			{
				task: "Go to Max's bakery for inspiration",
				location: 'bakery',
				completed: false,
			},
			{ task: 'Hide clues around the city', location: 'plaza', completed: false },
			{ task: 'Read her story by the fountain', location: 'fountain', completed: false },
			{ task: 'Attend a play at the theater', location: 'theater', completed: false },
		],
	},
	{
		id: 4,
		name: 'Marco',
		x: 350,
		y: 250,
		sprites: marcoSprites,
		personalityKeywords: 'Extroverted, competitive, jokester.',
		memories: ['Studied engineering with Dante.', 'Has a collection of sports medals.'],
		baseTasks: [
			{ task: 'Train at the plaza', location: 'plaza', completed: false },
			{ task: 'Visit Dante to share theories', location: 'office', completed: false },
			{
				task: "Check the city's electrical system",
				location: 'power_plant',
				completed: false,
			},
			{ task: 'Relax at the bar', location: 'bar', completed: false },
			{ task: 'Exercise at the gym', location: 'gym', completed: false },
		],
	},
	{
		id: 5,
		name: 'Max',
		x: 450,
		y: 300,
		sprites: maxSprites,
		personalityKeywords: 'Patient, meticulous, traditional.',
		memories: [
			'Inherited the bakery from his father.',
			'Used to make sweets with his grandmother.',
		],
		baseTasks: [
			{ task: 'Bake from dawn', location: 'bakery', completed: false },
			{ task: 'Serve the residents', location: 'bakery', completed: false },
			{ task: 'Chat with Elena', location: 'bakery', completed: false },
			{ task: 'Read old recipes at the library', location: 'library', completed: false },
			{ task: 'Buy ingredients at the market', location: 'market', completed: false },
		],
	},
	{
		id: 6,
		name: 'Yasmin',
		x: 550,
		y: 350,
		sprites: yasminSprites,
		personalityKeywords: 'Intellectual, organized, visionary.',
		memories: ['Was a librarian in the capital, but moved seeking tranquility.'],
		baseTasks: [
			{ task: 'Organize the town library', location: 'library', completed: false },
			{ task: 'Talk with Diana', location: 'library', completed: false },
			{ task: 'Write philosophical reflections', location: 'cafe', completed: false },
			{ task: 'Promote reading with neighbors', location: 'plaza', completed: false },
			{ task: 'Give a talk at the school', location: 'school', completed: false },
		],
	},
	{
		id: 7,
		name: 'Prota',
		x: 100,
		y: 300,
		sprites: protaSprites,
		personalityKeywords: 'Player-controlled character.',
		memories: ['The protagonist of our story.'],
		baseTasks: [{ task: 'Explore the world', location: 'plaza', completed: false }],
		isPlayerControlled: true, // Mark as player-controlled
	},
];

// Character activity states
type ActivityState = 'moving' | 'working' | 'exploring' | 'idle' | 'regenerating_tasks';

// Extended interface for conversation history entry
interface ConversationEntry {
	speaker: string;
	message: string;
	isSender: boolean;
}

// New interface for player conversation
interface PlayerConversation {
	targetCharacter: ExtendedCharacter;
	isActive: boolean;
	isPlayerTurn: boolean;
	currentMessage: string;
	isWaitingForResponse: boolean;
}

// Extended interface for the component
interface ExtendedCharacter extends Character {
	activityState: ActivityState;
	taskStartTime?: number;
	explorationStartTime?: number;
	explorationTarget?: { x: number; y: number };
	basePosition?: { x: number; y: number };
	conversationHistory: ConversationEntry[];
	isPlayerControlled?: boolean;
	playerTarget?: { x: number; y: number };
	isInPlayerConversation?: boolean; // New property to track if in manual conversation
}

// --- AI Personality Generation ---
const generatePersonality = async (name: string, keywords: string): Promise<string> => {
	try {
		const response = await fetch(
			`https://vsuqjhylvbjboijdbfvs.supabase.co/functions/v1/replicate-proxy`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project_id: 'ed5ce1fb-9d91-4241-ad57-5e4419a8941c',
					model: 'openai/gpt-4o-mini',
					input: {
						prompt: `Character Name: ${name}. Keywords: ${keywords}. Write a single, concise paragraph describing this character's personality for a video game.`,
						system_prompt:
							'You are a creative writer specializing in character backstories for video games. You are brief and impactful.',
						max_completion_tokens: 150,
						temperature: 0.75,
					},
				}),
			}
		);
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Replicate API call failed with status ${response.status}: ${errorText}`
			);
		}
		const result = await response.json();
		return result.output as string;
	} catch (error) {
		let errorMessage = 'An unknown error occurred.';
		if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
			errorMessage =
				'Network error: Failed to connect to the Replicate proxy. This might be due to temporary network issues, your network configuration, or the proxy service being temporarily unavailable.';
		} else if (error instanceof Error) {
			errorMessage = `API error: ${error.message}`;
		}
		console.error(`Error generating personality for ${name}:`, errorMessage);
		return `Failed to generate personality. Base traits: ${keywords}`;
	}
};

// Adjusted interaction constants
const INTERACTION_DISTANCE = 60;
const MESSAGE_DISPLAY_TIME = 4000;
const TYPING_INDICATOR_TIME = 1500;
const INTERACTION_COOLDOWN = 25000;
const INTERACTION_PROBABILITY = 0.003;

const Town: React.FC = () => {
	const [characters, setCharacters] = useState<ExtendedCharacter[]>([]);
	const [selectedCharacter, setSelectedCharacter] = useState<ExtendedCharacter | null>(
		null
	);
	const [loadingState, setLoadingState] = useState<{ message: string; progress: number }>(
		{
			message: 'Loading assets...',
			progress: 0,
		}
	);
	const [interactions, setInteractions] = useState<{ [key: string]: number }>({});
	const [activeInteraction, setActiveInteraction] = useState<boolean>(false);
	const [lastInteractionTime, setLastInteractionTime] = useState<{
		[key: string]: number;
	}>({});
	const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(
		null
	);

	// New state for player conversations
	const [playerConversation, setPlayerConversation] = useState<PlayerConversation | null>(
		null
	);
	const [showConversationDialog, setShowConversationDialog] = useState(false);
	const [playerMessage, setPlayerMessage] = useState('');

	const animationFrameId = useRef<number | null>(null);
	const gameTick = useRef(0);

	useEffect(() => {
		const initializeTown = async () => {
			// Preload all images
			const allImageUrls = new Set<string>();
			characterDefinitions.forEach((c) =>
				Object.values(c.sprites)
					.flat()
					.forEach((url) => allImageUrls.add(url))
			);
			const imagePromises = Array.from(allImageUrls).map((url) => {
				return new Promise<void>((resolve) => {
					const img = new Image();
					img.src = url;
					img.onload = img.onerror = () => resolve();
				});
			});
			await Promise.all(imagePromises);
			setLoadingState({ message: 'Generating personalities...', progress: 50 });

			// Generate personalities with AI and mix tasks
			const charactersWithAI = await Promise.all(
				characterDefinitions.map(async (def) => {
					// Skip AI generation for player-controlled character
					const personality = def.isPlayerControlled
						? 'You are the protagonist of this story. Your actions shape the world around you.'
						: await generatePersonality(def.name, def.personalityKeywords);

					// Mix base tasks with exploration tasks (skip for player)
					const explorationTasks = def.isPlayerControlled
						? []
						: generateExplorationTasks();
					const allTasks = [...def.baseTasks, ...explorationTasks];
					const shuffledTasks = shuffleArray(allTasks);

					return {
						...def,
						personality,
						sprites: def.sprites,
						direction: 'down' as Direction,
						animationFrame: 0,
						isMoving: false,
						currentGoalIndex: 0,
						dailyGoals: shuffledTasks,
						activityState: 'moving' as ActivityState,
						conversationHistory: [] as ConversationEntry[],
						isPlayerControlled: def.isPlayerControlled || false,
					};
				})
			);
			setLoadingState({ message: 'Town is ready!', progress: 100 });

			setTimeout(() => {
				setCharacters(charactersWithAI);
			}, 500);
		};

		initializeTown();
	}, []);

	// Function to update history panel
	const updateHistoryPanel = (character: ExtendedCharacter | null) => {
		setSelectedCharacter(character);
	};

	// Generate random position within exploration radius
	const generateExplorationTarget = (
		baseX: number,
		baseY: number
	): { x: number; y: number } => {
		const angle = Math.random() * 2 * Math.PI;
		const distance = Math.random() * EXPLORATION_RADIUS;
		let targetX = baseX + Math.cos(angle) * distance;
		let targetY = baseY + Math.sin(angle) * distance;

		targetX = Math.max(TILE_SIZE, Math.min(TOWN_WIDTH - TILE_SIZE, targetX));
		targetY = Math.max(TILE_SIZE, Math.min(TOWN_HEIGHT - TILE_SIZE, targetY));

		return { x: targetX, y: targetY };
	};

	const findNearbyCharacters = (
		character: ExtendedCharacter,
		allCharacters: ExtendedCharacter[]
	) => {
		return allCharacters.filter((other) => {
			if (other.id === character.id) return false;
			const dx = other.x - character.x;
			const dy = other.y - character.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return distance < INTERACTION_DISTANCE;
		});
	};

	// Message functions
	const showTypingIndicator = (
		container: HTMLElement,
		characterName: string,
		x: number,
		y: number
	): HTMLElement => {
		const typingDiv = document.createElement('div');
		typingDiv.style.position = 'absolute';
		typingDiv.style.left = `${x - 100}px`;
		typingDiv.style.top = `${y - 80}px`;
		typingDiv.style.background = 'rgba(100,100,100,0.9)';
		typingDiv.style.color = 'white';
		typingDiv.style.padding = '8px 12px';
		typingDiv.style.borderRadius = '8px';
		typingDiv.style.fontSize = '12px';
		typingDiv.style.maxWidth = '200px';
		typingDiv.style.zIndex = '1000';
		typingDiv.style.border = '2px solid #FFA500';
		typingDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
		typingDiv.style.fontStyle = 'italic';
		typingDiv.style.opacity = '0';
		typingDiv.style.transform = 'scale(0.8)';
		typingDiv.style.transition = 'all 0.3s ease-out';

		typingDiv.innerHTML = `<strong style="color: #FFA500;">${characterName}</strong> is typing...`;

		container.appendChild(typingDiv);

		setTimeout(() => {
			typingDiv.style.opacity = '1';
			typingDiv.style.transform = 'scale(1)';
		}, 100);

		return typingDiv;
	};

	const showMessage = (
		container: HTMLElement,
		message: string,
		characterName: string,
		x: number,
		y: number,
		isFirstCharacter: boolean
	): HTMLElement => {
		const messageDiv = document.createElement('div');
		messageDiv.style.position = 'absolute';
		messageDiv.style.left = `${x - 100}px`;
		messageDiv.style.top = `${y - 80}px`;
		messageDiv.style.background = 'rgba(0,0,0,0.9)';
		messageDiv.style.color = 'white';
		messageDiv.style.padding = '12px 16px';
		messageDiv.style.borderRadius = '8px';
		messageDiv.style.fontSize = '14px';
		messageDiv.style.maxWidth = '280px';
		messageDiv.style.zIndex = '1000';
		messageDiv.style.border = `2px solid ${isFirstCharacter ? '#4CAF50' : '#2196F3'}`;
		messageDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
		messageDiv.style.lineHeight = '1.4';
		messageDiv.style.opacity = '0';
		messageDiv.style.transform = 'scale(0.8)';
		messageDiv.style.transition = 'all 0.3s ease-out';

		const color = isFirstCharacter ? '#4CAF50' : '#2196F3';
		messageDiv.innerHTML = `<strong style="color: ${color};">${characterName}:</strong> ${message}`;

		container.appendChild(messageDiv);

		setTimeout(() => {
			messageDiv.style.opacity = '1';
			messageDiv.style.transform = 'scale(1)';
		}, 100);

		return messageDiv;
	};

	const generateInteractionDialogue = async (
		char1: ExtendedCharacter,
		char2: ExtendedCharacter
	): Promise<string> => {
		try {
			const response = await fetch(
				`https://vsuqjhylvbjboijdbfvs.supabase.co/functions/v1/replicate-proxy`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						project_id: 'ed5ce1fb-9d91-4241-ad57-5e4419a8941c',
						model: 'openai/gpt-4o-mini',
						input: {
							prompt: `${char1.name} (${char1.personality}) meets ${char2.name} (${char2.personality}). Write a brief, natural dialogue exchange between them. Format it as: "${char1.name}: [message]" then "${char2.name}: [response]". Keep each message short and conversational.`,
							system_prompt:
								'You are a dialogue writer for a video game. Keep conversations brief, natural, and character-appropriate. Each character should say one thing.',
							max_completion_tokens: 100,
							temperature: 0.8,
						},
					}),
				}
			);
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Replicate API call for dialogue failed with status ${response.status}: ${errorText}`
				);
			}
			const result = await response.json();
			return result.output as string;
		} catch (error) {
			console.error(
				`Error generating dialogue for ${char1.name} & ${char2.name}:`,
				error
			);
			return `${char1.name}: Hello ${char2.name}!\n${char2.name}: Hey there, ${char1.name}!`;
		}
	};

	// Function to add conversation to history for both participants
	const addConversationToHistory = (
		char1: ExtendedCharacter,
		char2: ExtendedCharacter,
		char1Message: string,
		char2Message: string
	) => {
		setCharacters((prevChars) =>
			prevChars.map((char) => {
				if (char.id === char1.id) {
					const updatedChar = {
						...char,
						conversationHistory: [
							...char.conversationHistory,
							{ speaker: char1.name, message: char1Message, isSender: true },
							{ speaker: char2.name, message: char2Message, isSender: false },
						],
					};

					// Update panel if this character is selected
					if (selectedCharacter && char.id === selectedCharacter.id) {
						setSelectedCharacter(updatedChar);
					}

					return updatedChar;
				}

				if (char.id === char2.id) {
					const updatedChar = {
						...char,
						conversationHistory: [
							...char.conversationHistory,
							{ speaker: char1.name, message: char1Message, isSender: false },
							{ speaker: char2.name, message: char2Message, isSender: true },
						],
					};

					// Update panel if this character is selected
					if (selectedCharacter && char.id === selectedCharacter.id) {
						setSelectedCharacter(updatedChar);
					}

					return updatedChar;
				}

				return char;
			})
		);
	};

	const startConversation = async (
		char1: ExtendedCharacter,
		char2: ExtendedCharacter,
		container: HTMLElement
	) => {
		const dialogue = await generateInteractionDialogue(char1, char2);
		const messages = dialogue.split('\n').filter((msg) => msg.trim() !== '');

		const centerX = (char1.x + char2.x) / 2;
		const centerY = Math.min(char1.y, char2.y);

		let currentTimeout = 0;
		let char1Message = '';
		let char2Message = '';

		for (let i = 0; i < messages.length && i < 2; i++) {
			const message = messages[i];
			const isFirstCharacter = i === 0;
			const currentChar = isFirstCharacter ? char1 : char2;
			const speakerName = currentChar.name;

			const messageText = message
				.replace(new RegExp(`^${speakerName}:\\s*`), '')
				.replace(/^["']|["']$/g, '');

			// Store messages for history
			if (isFirstCharacter) {
				char1Message = messageText;
			} else {
				char2Message = messageText;
			}

			setTimeout(() => {
				const typingIndicator = showTypingIndicator(
					container,
					speakerName,
					centerX,
					centerY
				);

				setTimeout(() => {
					if (typingIndicator.parentNode) {
						typingIndicator.style.opacity = '0';
						typingIndicator.style.transform = 'scale(0.8)';
						setTimeout(() => {
							if (typingIndicator.parentNode) {
								typingIndicator.parentNode.removeChild(typingIndicator);
							}
						}, 300);
					}

					const messageDiv = showMessage(
						container,
						messageText,
						speakerName,
						centerX,
						centerY,
						isFirstCharacter
					);

					setTimeout(() => {
						if (messageDiv.parentNode) {
							messageDiv.style.opacity = '0';
							messageDiv.style.transform = 'scale(0.8)';
							setTimeout(() => {
								if (messageDiv.parentNode) {
									messageDiv.parentNode.removeChild(messageDiv);
								}
							}, 300);
						}
					}, MESSAGE_DISPLAY_TIME);
				}, TYPING_INDICATOR_TIME);
			}, currentTimeout);

			currentTimeout += TYPING_INDICATOR_TIME + MESSAGE_DISPLAY_TIME + 500;
		}

		// Add complete conversation to history after all messages are processed
		setTimeout(() => {
			if (char1Message && char2Message) {
				addConversationToHistory(char1, char2, char1Message, char2Message);
			}
		}, currentTimeout);

		const totalConversationTime =
			(TYPING_INDICATOR_TIME + MESSAGE_DISPLAY_TIME + 500) * Math.min(messages.length, 2);

		setTimeout(() => {
			setInteractions((prev) => {
				const newInteractions = { ...prev };
				delete newInteractions[char1.id.toString()];
				delete newInteractions[char2.id.toString()];
				return newInteractions;
			});
			setActiveInteraction(false);
		}, totalConversationTime + 1000);
	};

	// New function to start player conversation
	const startPlayerConversation = (targetCharacter: ExtendedCharacter) => {
		const playerChar = characters.find((char) => char.isPlayerControlled);
		if (!playerChar) return;

		// Move player to target character
		setCharacters((prevChars) =>
			prevChars.map((char) => {
				if (char.isPlayerControlled) {
					return {
						...char,
						playerTarget: { x: targetCharacter.x + 50, y: targetCharacter.y },
						activityState: 'moving' as ActivityState,
					};
				}
				if (char.id === targetCharacter.id) {
					return {
						...char,
						isInPlayerConversation: true,
						activityState: 'idle' as ActivityState,
					};
				}
				return char;
			})
		);

		// Set up conversation after a delay to allow movement
		setTimeout(() => {
			setPlayerConversation({
				targetCharacter,
				isActive: true,
				isPlayerTurn: true,
				currentMessage: '',
				isWaitingForResponse: false,
			});
			setShowConversationDialog(true);
			setActiveInteraction(true);
		}, 2000);
	};

	// Function to send player message
	const sendPlayerMessage = async () => {
		if (!playerConversation || !playerMessage.trim()) return;

		const { targetCharacter } = playerConversation;

		// Add player message to history
		const playerChar = characters.find((char) => char.isPlayerControlled);
		if (!playerChar) return;

		// Update conversation state
		setPlayerConversation((prev) =>
			prev
				? {
						...prev,
						isPlayerTurn: false,
						isWaitingForResponse: true,
						currentMessage: playerMessage,
				  }
				: null
		);

		// Show player message on screen
		const townContainer = document.getElementById('town-container');
		if (townContainer) {
			const centerX = (playerChar.x + targetCharacter.x) / 2;
			const centerY = Math.min(playerChar.y, targetCharacter.y);

			showMessage(townContainer, playerMessage, 'Prota', centerX, centerY, true);
		}

		// Generate AI response
		try {
			const response = await fetch(
				`https://vsuqjhylvbjboijdbfvs.supabase.co/functions/v1/replicate-proxy`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						project_id: 'ed5ce1fb-9d91-4241-ad57-5e4419a8941c',
						model: 'openai/gpt-4o-mini',
						input: {
							prompt: `${targetCharacter.name} (${targetCharacter.personality}) is talking to Prota. Prota just said: "${playerMessage}". Write a natural response that ${targetCharacter.name} would give. Keep it conversational and in character. Only respond as ${targetCharacter.name}, don't include the name prefix.`,
							system_prompt:
								'You are a dialogue writer for a video game. Write natural, character-appropriate responses. Keep responses conversational and engaging.',
							max_completion_tokens: 100,
							temperature: 0.8,
						},
					}),
				}
			);

			if (response.ok) {
				const result = await response.json();
				const aiResponse = result.output as string;

				// Show AI response after delay
				setTimeout(() => {
					if (townContainer) {
						const centerX = (playerChar.x + targetCharacter.x) / 2;
						const centerY = Math.min(playerChar.y, targetCharacter.y);

						showMessage(
							townContainer,
							aiResponse,
							targetCharacter.name,
							centerX,
							centerY,
							false
						);
					}

					// Add both messages to history
					addPlayerConversationToHistory(
						playerChar,
						targetCharacter,
						playerMessage,
						aiResponse
					);

					// Reset for next player turn
					setPlayerConversation((prev) =>
						prev
							? {
									...prev,
									isPlayerTurn: true,
									isWaitingForResponse: false,
									currentMessage: '',
							  }
							: null
					);

					setPlayerMessage('');
				}, 1500);
			}
		} catch (error) {
			console.error('Error generating AI response:', error);
			// Fallback response
			const fallbackResponse = `I'm not sure how to respond to that right now.`;

			setTimeout(() => {
				if (townContainer) {
					const centerX = (playerChar.x + targetCharacter.x) / 2;
					const centerY = Math.min(playerChar.y, targetCharacter.y);

					showMessage(
						townContainer,
						fallbackResponse,
						targetCharacter.name,
						centerX,
						centerY,
						false
					);
				}

				addPlayerConversationToHistory(
					playerChar,
					targetCharacter,
					playerMessage,
					fallbackResponse
				);

				setPlayerConversation((prev) =>
					prev
						? {
								...prev,
								isPlayerTurn: true,
								isWaitingForResponse: false,
								currentMessage: '',
						  }
						: null
				);

				setPlayerMessage('');
			}, 1500);
		}
	};

	// Function to add player conversation to history
	const addPlayerConversationToHistory = (
		playerChar: ExtendedCharacter,
		targetChar: ExtendedCharacter,
		playerMessage: string,
		aiResponse: string
	) => {
		setCharacters((prevChars) =>
			prevChars.map((char) => {
				if (char.id === playerChar.id || char.id === targetChar.id) {
					const updatedChar = {
						...char,
						conversationHistory: [
							...char.conversationHistory,
							{
								speaker: 'Prota',
								message: playerMessage,
								isSender: char.id === playerChar.id,
							},
							{
								speaker: targetChar.name,
								message: aiResponse,
								isSender: char.id === targetChar.id,
							},
						],
					};

					// Update panel if this character is selected
					if (selectedCharacter && char.id === selectedCharacter.id) {
						setSelectedCharacter(updatedChar);
					}

					return updatedChar;
				}
				return char;
			})
		);
	};

	// Function to end player conversation
	const endPlayerConversation = () => {
		// Primero ocultar el diálogo inmediatamente
		setShowConversationDialog(false);

		// Limpiar todos los mensajes activos en pantalla
		const townContainer = document.getElementById('town-container');
		if (townContainer) {
			// Buscar y remover todos los divs de mensajes y typing indicators
			const messageElements = townContainer.querySelectorAll(
				'div[style*="position: absolute"][style*="background"]'
			);
			messageElements.forEach((element) => {
				if (element.parentNode) {
					// Agregar animación de salida
					(element as HTMLElement).style.opacity = '0';
					(element as HTMLElement).style.transform = 'scale(0.8)';
					setTimeout(() => {
						if (element.parentNode) {
							element.parentNode.removeChild(element);
						}
					}, 300);
				}
			});
		}

		// Luego limpiar el estado con un pequeño retraso para evitar conflictos
		setTimeout(() => {
			setPlayerConversation(null);
			setPlayerMessage('');
			setActiveInteraction(false);

			// Release characters from conversation state
			setCharacters((prevChars) =>
				prevChars.map((char) => ({
					...char,
					isInPlayerConversation: false,
				}))
			);
		}, 50);
	};

	const updateCharacters = () => {
		gameTick.current += 1;
		const shouldUpdateFrame = gameTick.current % ANIMATION_TICK_SPEED === 0;
		const now = Date.now();

		setCharacters((prevChars) =>
			prevChars.map((char) => {
				// Handle player-controlled character differently
				if (char.isPlayerControlled) {
					// Check if character is in a player conversation
					if (char.isInPlayerConversation || playerConversation?.isActive) {
						return {
							...char,
							isMoving: false,
							animationFrame: 0,
							activityState: 'idle' as ActivityState,
						};
					}

					// Check if character is in an automatic interaction
					const interactionKey = `${char.id}`;
					const isInteracting =
						interactions[interactionKey] && interactions[interactionKey] > now;

					if (isInteracting) {
						return {
							...char,
							isMoving: false,
							animationFrame: 0,
							activityState: 'idle' as ActivityState,
						};
					}

					// Handle player movement with improved animation
					if (char.playerTarget) {
						const dx = char.playerTarget.x - char.x;
						const dy = char.playerTarget.y - char.y;
						const distance = Math.sqrt(dx * dx + dy * dy);

						// If close enough to target, stop moving with smooth transition
						if (distance < 8) {
							return {
								...char,
								playerTarget: undefined,
								isMoving: false,
								animationFrame: 0,
								activityState: 'idle' as ActivityState,
							};
						}

						// Improved movement with smoother speed calculation
						const speedMultiplier = Math.min(distance / 20, 1.5);
						const moveX = (dx / distance) * MOVEMENT_SPEED * speedMultiplier;
						const moveY = (dy / distance) * MOVEMENT_SPEED * speedMultiplier;

						let newX = char.x + moveX;
						let newY = char.y + moveY;

						// Keep within bounds with better padding
						newX = Math.max(TILE_SIZE / 2, Math.min(TOWN_WIDTH - TILE_SIZE / 2, newX));
						newY = Math.max(TILE_SIZE / 2, Math.min(TOWN_HEIGHT - TILE_SIZE / 2, newY));

						// Improved direction calculation with hysteresis to avoid flickering
						let newDirection = char.direction;
						const directionThreshold = 0.3;

						if (Math.abs(moveX) > Math.abs(moveY) + directionThreshold) {
							newDirection = moveX > 0 ? 'right' : 'left';
						} else if (Math.abs(moveY) > Math.abs(moveX) + directionThreshold) {
							newDirection = moveY > 0 ? 'down' : 'up';
						}

						// Smoother animation frame updates
						let newFrame = char.animationFrame;
						if (shouldUpdateFrame && distance > 3) {
							newFrame = (char.animationFrame + 1) % char.sprites[newDirection].length;
						}

						return {
							...char,
							x: newX,
							y: newY,
							isMoving: true,
							direction: newDirection,
							animationFrame: newFrame,
						};
					}

					// Si no hay playerTarget, NO hacer nada automático:
					return {
						...char,
						isMoving: false,
						animationFrame: 0,
						activityState: 'idle' as ActivityState,
					};
				}

				// Handle AI characters - skip automatic interactions if in player conversation
				if (char.isInPlayerConversation) {
					return {
						...char,
						isMoving: false,
						animationFrame: 0,
						activityState: 'idle' as ActivityState,
					};
				}

				// Check if character is in an interaction
				const interactionKey = `${char.id}`;
				const isInteracting =
					interactions[interactionKey] && interactions[interactionKey] > now;

				if (isInteracting) {
					return {
						...char,
						isMoving: false,
						animationFrame: 0,
						activityState: 'idle' as ActivityState,
					};
				}

				// Handle activity states for AI characters
				switch (char.activityState) {
					case 'working':
						if (char.taskStartTime && now - char.taskStartTime >= TASK_DURATION) {
							const currentGoal = char.dailyGoals[char.currentGoalIndex];
							if (currentGoal) {
								currentGoal.completed = true;
							}

							const basePosition = { x: char.x, y: char.y };
							const explorationTarget = generateExplorationTarget(char.x, char.y);

							return {
								...char,
								activityState: 'exploring' as ActivityState,
								explorationStartTime: now,
								explorationTarget,
								basePosition,
								currentGoalIndex: char.currentGoalIndex + 1,
							};
						}
						return {
							...char,
							isMoving: false,
							animationFrame: 0,
						};

					case 'exploring':
						if (
							char.explorationStartTime &&
							now - char.explorationStartTime >= EXPLORATION_DURATION
						) {
							return {
								...char,
								activityState: 'moving' as ActivityState,
								explorationTarget: undefined,
								explorationStartTime: undefined,
								basePosition: undefined,
							};
						}

						if (char.explorationTarget) {
							const dx = char.explorationTarget.x - char.x;
							const dy = char.explorationTarget.y - char.y;
							const distance = Math.sqrt(dx * dx + dy * dy);

							if (distance < 5) {
								const newTarget = generateExplorationTarget(
									char.basePosition?.x || char.x,
									char.basePosition?.y || char.y
								);
								return {
									...char,
									explorationTarget: newTarget,
								};
							}

							const moveX = (dx / distance) * MOVEMENT_SPEED * 0.7;
							const moveY = (dy / distance) * MOVEMENT_SPEED * 0.7;

							let newX = char.x + moveX;
							let newY = char.y + moveY;

							newX = Math.max(0, Math.min(TOWN_WIDTH - TILE_SIZE, newX));
							newY = Math.max(0, Math.min(TOWN_HEIGHT - TILE_SIZE, newY));

							let newDirection = char.direction;
							if (Math.abs(moveX) > Math.abs(moveY)) {
								newDirection = moveX > 0 ? 'right' : 'left';
							} else {
								newDirection = moveY > 0 ? 'down' : 'up';
							}

							let newFrame = char.animationFrame;
							if (shouldUpdateFrame) {
								newFrame = (char.animationFrame + 1) % char.sprites[newDirection].length;
							}

							return {
								...char,
								x: newX,
								y: newY,
								isMoving: true,
								direction: newDirection,
								animationFrame: newFrame,
							};
						}
						break;
					
					case 'regenerating_tasks':
						if (char.taskStartTime && now - char.taskStartTime >= TASK_REGENERATION_PAUSE) {
							const definition = characterDefinitions.find(d => d.id === char.id);
							if (definition) {
                                const explorationTasks = generateExplorationTasks();
                                const allTasks = [...definition.baseTasks, ...explorationTasks];
								const shuffledTasks = shuffleArray(allTasks);
								
								return {
									...char,
									dailyGoals: shuffledTasks.map(task => ({ ...task, completed: false })),
									currentGoalIndex: 0,
									activityState: 'moving' as ActivityState,
									taskStartTime: undefined,
								};
							}
						}
						return { ...char, isMoving: false, animationFrame: 0 };


					case 'moving':
					default:
						// Skip automatic interactions during player conversations
						if (!activeInteraction || playerConversation?.isActive) {
							const nearbyCharacters = findNearbyCharacters(char, prevChars);

							if (
								nearbyCharacters.length > 0 &&
								Math.random() < INTERACTION_PROBABILITY
							) {
								const otherChar = nearbyCharacters[0];
								const charLastInteraction = lastInteractionTime[char.id.toString()] || 0;
								const otherCharLastInteraction =
									lastInteractionTime[otherChar.id.toString()] || 0;

								if (
									now - charLastInteraction > INTERACTION_COOLDOWN &&
									now - otherCharLastInteraction > INTERACTION_COOLDOWN
								) {
									const estimatedDuration =
										(TYPING_INDICATOR_TIME + MESSAGE_DISPLAY_TIME + 500) * 2 + 2000;
									const interactionEndTime = now + estimatedDuration;

									setActiveInteraction(true);
									setInteractions((prev) => ({
										...prev,
										[char.id.toString()]: interactionEndTime,
										[otherChar.id.toString()]: interactionEndTime,
									}));

									setLastInteractionTime((prev) => ({
										...prev,
										[char.id.toString()]: now,
										[otherChar.id.toString()]: now,
									}));

									const townContainer = document.getElementById('town-container');
									if (townContainer) {
										startConversation(char, otherChar, townContainer);
									}

									return {
										...char,
										isMoving: false,
										animationFrame: 0,
										activityState: 'idle' as ActivityState,
									};
								}
							}
						}

						const currentGoal = char.dailyGoals[char.currentGoalIndex];

						if (!currentGoal || char.currentGoalIndex >= char.dailyGoals.length) {
							return {
								...char,
								isMoving: false,
								animationFrame: 0,
								activityState: 'regenerating_tasks' as ActivityState,
								taskStartTime: now,
							};
						}

						const targetLocation = locations[currentGoal.location];
						if (!targetLocation) {
							console.warn(`Location ${currentGoal.location} not found for ${char.name}`);
							char.dailyGoals[char.currentGoalIndex].completed = true;
							return {
								...char,
								isMoving: false,
								currentGoalIndex: char.currentGoalIndex + 1,
								activityState: 'moving' as ActivityState,
							};
						}

						const dx = targetLocation.x - char.x;
						const dy = targetLocation.y - char.y;
						const distance = Math.sqrt(dx * dx + dy * dy);

						if (distance < GOAL_REACH_THRESHOLD) {
							return {
								...char,
								isMoving: false,
								animationFrame: 0,
								activityState: 'working' as ActivityState,
								taskStartTime: now,
							};
						}

						const moveX = (dx / distance) * MOVEMENT_SPEED;
						const moveY = (dy / distance) * MOVEMENT_SPEED;

						let newX = char.x + moveX;
						let newY = char.y + moveY;

						newX = Math.max(0, Math.min(TOWN_WIDTH - TILE_SIZE, newX));
						newY = Math.max(0, Math.min(TOWN_HEIGHT - TILE_SIZE, newY));

						let newDirection = char.direction;
						if (Math.abs(moveX) > Math.abs(moveY)) {
							newDirection = moveX > 0 ? 'right' : 'left';
						} else {
							newDirection = moveY > 0 ? 'down' : 'up';
						}

						let newFrame = char.animationFrame;
						if (shouldUpdateFrame) {
							newFrame = (char.animationFrame + 1) % char.sprites[newDirection].length;
						}

						return {
							...char,
							x: newX,
							y: newY,
							isMoving: true,
							direction: newDirection,
							animationFrame: newFrame,
						};
				}

				return char;
			})
		);

		animationFrameId.current = requestAnimationFrame(updateCharacters);
	};

	useEffect(() => {
		if (characters.length > 0) {
			animationFrameId.current = requestAnimationFrame(updateCharacters);
		}
		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [characters]);

	const handleCharacterClick = (character: ExtendedCharacter) => {
		updateHistoryPanel(character);
	};

	// Handle map click for player movement
	const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
		// Only handle clicks on the map container, not on characters
		if (event.target === event.currentTarget) {
			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			// Find the player character (prota)
			const playerChar = characters.find((char) => char.isPlayerControlled);
			if (playerChar) {
				setCharacters((prevChars) =>
					prevChars.map((char) => {
						if (char.isPlayerControlled) {
							return {
								...char,
								playerTarget: { x, y },
								activityState: 'moving' as ActivityState,
							};
						}
						return char;
					})
				);
			}

			// Show click indicator
			setClickPosition({ x, y });
			setTimeout(() => setClickPosition(null), 1000);
		}
	};

	if (characters.length === 0) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
				}}
			>
				<div
					style={{
						color: 'white',
						fontSize: '20px',
						marginBottom: '20px',
						textAlign: 'center',
					}}
				>
					{loadingState.message}
				</div>
				<div
					style={{
						width: '300px',
						height: '10px',
						borderRadius: '5px',
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							width: `${loadingState.progress}%`,
							height: '100%',
							backgroundColor: '#4CAF50',
							transition: 'width 0.5s ease-out',
							borderRadius: '5px',
						}}
					/>
				</div>
				<div style={{ color: 'white', fontSize: '14px', marginTop: '10px' }}>
					{Math.round(loadingState.progress)}%
				</div>
			</div>
		);
	}

	// Enhanced render with conversation UI
	return (
		<div
			style={{
				display: 'flex',
				backgroundColor: '#282c34',
				minHeight: '100vh',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{/* Town Container */}
			<div
				id="town-container"
				className="town-container"
				onClick={handleMapClick}
				style={{ cursor: 'pointer' }}
			>
				{/* ...existing character rendering... */}
				{characters.map((character) => {
					const shouldFlipHorizontal = character.direction === 'left';
					const spriteDirection =
						character.direction === 'left' ? 'right' : character.direction;

					return (
						<img
							key={character.id}
							src={character.sprites[spriteDirection][character.animationFrame] || ''}
							alt={character.name}
							className="character-sprite"
							style={{
								left: `${character.x}px`,
								top: `${character.y}px`,
								opacity: character.isMoving ? 1 : 0.9,
								transform: `scale(${shouldFlipHorizontal ? -1 : 1}, ${
									character.isMoving ? 1.02 : 1
								})`,
								filter:
									character.activityState === 'working' ? 'brightness(1.2)' : 'none',
								border: character.isPlayerControlled
									? '3px solid #FF6B6B'
									: selectedCharacter?.id === character.id
									? '2px solid #FFD700'
									: character.isInPlayerConversation
									? '2px solid #4CAF50'
									: 'none',
								borderRadius: character.isPlayerControlled ? '50%' : '0',
								transition: character.isPlayerControlled
									? 'transform 0.1s ease-out, opacity 0.2s ease-out, filter 0.2s ease-out'
									: 'none',
								boxShadow: character.isPlayerControlled
									? '0 4px 12px rgba(255, 107, 107, 0.3)'
									: character.isInPlayerConversation
									? '0 4px 12px rgba(76, 175, 80, 0.3)'
									: 'none',
								imageRendering: 'pixelated',
								transformOrigin: 'center center',
							}}
							onClick={(e) => {
								e.stopPropagation();
								handleCharacterClick(character);
							}}
							loading="eager"
						/>
					);
				})}

				{/* Click indicator */}
				{clickPosition && (
					<div
						style={{
							position: 'absolute',
							left: `${clickPosition.x - 15}px`,
							top: `${clickPosition.y - 15}px`,
							width: '30px',
							height: '30px',
							borderRadius: '50%',
							backgroundColor: 'rgba(255, 107, 107, 0.6)',
							border: '3px solid white',
							opacity: 0.9,
							animation: 'pulseEnhanced 1.2s ease-out',
							pointerEvents: 'none',
							boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
						}}
					/>
				)}
			</div>

			{/* Enhanced CSS */}
			<style>{`
				@keyframes pulseEnhanced {
					0% {
						transform: scale(0.8);
						opacity: 0.9;
						background-color: rgba(255, 107, 107, 0.8);
					}
					25% {
						transform: scale(1.1);
						opacity: 0.7;
						background-color: rgba(255, 107, 107, 0.6);
					}
					50% {
						transform: scale(1.4);
						opacity: 0.5;
						background-color: rgba(255, 107, 107, 0.4);
					}
					75% {
						transform: scale(1.7);
						opacity: 0.3;
						background-color: rgba(255, 107, 107, 0.2);
					}
					100% {
						transform: scale(2.2);
						opacity: 0;
						background-color: rgba(255, 107, 107, 0);
					}
				}

				@keyframes pulse {
					0%, 100% {
						opacity: 1;
					}
					50% {
						opacity: 0.5;
					}
				}

				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}

				.character-sprite {
					image-rendering: -moz-crisp-edges;
					image-rendering: -webkit-crisp-edges;
					image-rendering: pixelated;
					image-rendering: crisp-edges;
					transition: transform 0.2s ease-out;
				}

				.town-container {
					position: relative;
					transition: background 0.3s ease;
				}
			`}</style>

			{/* Enhanced History Panel with Integrated Chat */}
			<div
				id="history-panel"
				style={{
					width: '400px',
					height:
						playerConversation?.isActive &&
						playerConversation.targetCharacter.id === selectedCharacter?.id
							? '950px' // más alto cuando hay conversación activa
							: '700px', // altura normal
					backgroundColor: '#ffffff',
					border: '2px solid #e0e0e0',
					borderRadius: '12px',
					padding: '0',
					overflowY: 'hidden',
					fontFamily: 'Arial, sans-serif',
					marginLeft: '20px',
					boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{selectedCharacter ? (
					<>
						{/* Header Section */}
						<div
							style={{
								padding: '20px',
								borderBottom: '2px solid #f0f0f0',
								backgroundColor: '#f8f9fa',
								borderRadius: '12px 12px 0 0',
							}}
						>
							<h3
								style={{
									fontSize: '20px',
									fontWeight: 'bold',
									margin: '0 0 10px 0',
									color: '#2c3e50',
									display: 'flex',
									alignItems: 'center',
									gap: '10px',
								}}
							>
								<div
									style={{
										width: '12px',
										height: '12px',
										borderRadius: '50%',
										backgroundColor: selectedCharacter.isPlayerControlled
											? '#FF6B6B'
											: selectedCharacter.isInPlayerConversation
											? '#4CAF50'
											: '#95a5a6',
									}}
								/>
								{selectedCharacter.name}
								{selectedCharacter.isPlayerControlled && (
									<span
										style={{ color: '#FF6B6B', fontSize: '14px', fontWeight: 'normal' }}
									>
										(You)
									</span>
								)}
							</h3>

							{/* Talk Button for non-player characters */}
							{!selectedCharacter.isPlayerControlled && !playerConversation?.isActive && (
								<button
									onClick={() => startPlayerConversation(selectedCharacter)}
									style={{
										width: '100%',
										padding: '12px',
										marginTop: '10px',
										backgroundColor: '#4CAF50',
										color: 'white',
										border: 'none',
										borderRadius: '8px',
										cursor: 'pointer',
										fontSize: '14px',
										fontWeight: 'bold',
										transition: 'all 0.2s ease',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '8px',
									}}
									onMouseOver={(e) => {
										e.currentTarget.style.backgroundColor = '#45a049';
										e.currentTarget.style.transform = 'translateY(-1px)';
									}}
									onMouseOut={(e) => {
										e.currentTarget.style.backgroundColor = '#4CAF50';
										e.currentTarget.style.transform = 'translateY(0)';
									}}
								>
									💬 Start Conversation
								</button>
							)}

							{/* Character Info */}
							<div
								style={{
									marginTop: '15px',
									padding: '12px',
									backgroundColor: '#e8f4f8',
									borderRadius: '8px',
									border: '1px solid #bee5eb',
								}}
							>
								<strong style={{ color: '#2c3e50' }}>Personality:</strong>
								<p
									style={{
										margin: '5px 0 0 0',
										fontSize: '13px',
										lineHeight: '1.4',
										color: '#5a6c7d',
									}}
								>
									{selectedCharacter.personality}
								</p>
							</div>

							{/* Task Progress and List for non-player characters */}
							{!selectedCharacter.isPlayerControlled && (
								<>
									<div
										style={{
											marginTop: '10px',
											padding: '8px 12px',
											backgroundColor: '#fff3cd',
											borderRadius: '6px',
											border: '1px solid #ffeaa7',
										}}
									>
										<strong style={{ fontSize: '13px', color: '#2c3e50' }}>
											Task Progress:
										</strong>
										<span
											style={{ marginLeft: '8px', color: '#6c757d', fontSize: '13px' }}
										>
											{
												selectedCharacter.dailyGoals.filter((goal) => goal.completed)
													.length
											}
											/{selectedCharacter.dailyGoals.length}
										</span>
									</div>
									{/* Lista de tareas */}
									<div
										style={{
											marginTop: '8px',
											padding: '8px 12px',
											backgroundColor: '#f8f9fa',
											borderRadius: '6px',
											border: '1px solid #e0e0e0',
											maxHeight: '120px',
											overflowY: 'auto',
										}}
									>
										<strong style={{ fontSize: '13px', color: '#2c3e50' }}>Tasks:</strong>
										<ul
											style={{
												paddingLeft: '18px',
												margin: '8px 0 0 0',
												fontSize: '13px',
											}}
										>
											{selectedCharacter.dailyGoals.map((goal, idx) => (
												<li
													key={idx}
													style={{
														color: goal.completed ? '#4CAF50' : '#888',
														textDecoration: goal.completed ? 'line-through' : 'none',
														marginBottom: '2px',
													}}
												>
													{goal.task}
												</li>
											))}
										</ul>
									</div>
								</>
							)}
						</div>

						{/* Chat/Conversation Section */}
						{playerConversation?.isActive &&
						playerConversation.targetCharacter.id === selectedCharacter.id ? (
							<div
								style={{
									flex: 1,
									display: 'flex',
									flexDirection: 'column',
									minHeight: 0,
								}}
							>
								{/* Active Chat Header */}
								<div
									style={{
										padding: '15px 20px',
										backgroundColor: '#4CAF50',
										color: 'white',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
										<div
											style={{
												width: '8px',
												height: '8px',
												borderRadius: '50%',
												backgroundColor: '#81C784',
												animation: 'pulse 2s infinite',
											}}
										/>
										<span style={{ fontWeight: 'bold' }}>Active Conversation</span>
									</div>
									<button
										onClick={endPlayerConversation}
										style={{
											background: 'rgba(255,255,255,0.2)',
											border: '1px solid rgba(255,255,255,0.3)',
											borderRadius: '4px',
											color: 'white',
											padding: '4px 8px',
											cursor: 'pointer',
											fontSize: '12px',
										}}
									>
										✕ End
									</button>
								</div>

								{/* Chat Messages Area */}
								<div
									style={{
										flex: 1,
										overflowY: 'auto',
										backgroundColor: '#fafafa',
										padding: '15px',
										minHeight: 0,
										maxHeight: 'none',
									}}
								>
									{selectedCharacter.conversationHistory.slice(-6).map((entry, index) => (
										<div
											key={index}
											style={{
												marginBottom: '12px',
												display: 'flex',
												flexDirection: entry.speaker === 'Prota' ? 'row-reverse' : 'row',
												alignItems: 'flex-start',
												gap: '8px',
											}}
										>
											<div
												style={{
													minWidth: '24px',
													height: '24px',
													borderRadius: '50%',
													backgroundColor:
														entry.speaker === 'Prota' ? '#FF6B6B' : '#4CAF50',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '10px',
													color: 'white',
													fontWeight: 'bold',
												}}
											>
												{entry.speaker.charAt(0)}
											</div>
											<div
												style={{
													maxWidth: '70%',
													padding: '10px 12px',
													borderRadius: '12px',
													backgroundColor:
														entry.speaker === 'Prota' ? '#FF6B6B' : '#4CAF50',
													color: 'white',
													fontSize: '13px',
													lineHeight: '1.4',
													wordWrap: 'break-word',
												}}
											>
												{entry.message}
											</div>
										</div>
									))}
								</div>

								{/* Chat Input Area */}
								<div
									style={{
										padding: '15px',
										backgroundColor: '#ffffff',
										borderTop: '1px solid #e0e0e0',
										borderRadius: '0 0 12px 12px',
										flexShrink: 0,
										display: 'flex',
										flexDirection: 'column',
										gap: '10px',
									}}
								>
									{playerConversation.isWaitingForResponse ? (
										<div
											style={{
												textAlign: 'center',
												padding: '20px',
												color: '#6c757d',
												fontStyle: 'italic',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												gap: '10px',
											}}
										>
											<div
												style={{
													width: '20px',
													height: '20px',
													border: '2px solid #e0e0e0',
													borderTop: '2px solid #4CAF50',
													borderRadius: '50%',
													animation: 'spin 1s linear infinite',
												}}
											/>
											{playerConversation.targetCharacter.name} is thinking...
										</div>
									) : (
										<>
											<textarea
												value={playerMessage}
												onChange={(e) => setPlayerMessage(e.target.value)}
												placeholder="Type your message here..."
												style={{
													width: '100%',
													height: '60px',
													padding: '10px',
													border: '2px solid #e0e0e0',
													borderRadius: '8px',
													fontSize: '14px',
													resize: 'none',
													fontFamily: 'inherit',
													outline: 'none',
													transition: 'border-color 0.2s ease',
													marginBottom: 0,
												}}
												onFocus={(e) => {
													e.currentTarget.style.borderColor = '#4CAF50';
												}}
												onBlur={(e) => {
													e.currentTarget.style.borderColor = '#e0e0e0';
												}}
												disabled={!playerConversation.isPlayerTurn}
											/>

											<button
												onClick={sendPlayerMessage}
												disabled={
													!playerMessage.trim() || !playerConversation.isPlayerTurn
												}
												style={{
													width: '100%',
													padding: '12px',
													backgroundColor:
														!playerMessage.trim() || !playerConversation.isPlayerTurn
															? '#95a5a6'
															: '#4CAF50',
													color: 'white',
													border: 'none',
													borderRadius: '8px',
													cursor:
														!playerMessage.trim() || !playerConversation.isPlayerTurn
															? 'not-allowed'
															: 'pointer',
													fontSize: '14px',
													fontWeight: 'bold',
													transition: 'all 0.2s ease',
												}}
											>
												Send Message
											</button>
										</>
									)}
								</div>
							</div>
						) : (
							// Conversation History Section
							<div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
								<h4 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '16px' }}>
									Conversation History
								</h4>

								{selectedCharacter.conversationHistory &&
								selectedCharacter.conversationHistory.length > 0 ? (
									<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
										{selectedCharacter.conversationHistory.map((entry, index) => (
											<div
												key={index}
												style={{
													padding: '12px',
													borderRadius: '8px',
													backgroundColor: entry.isSender ? '#e8f5e8' : '#e8f4f8',
													border: `1px solid ${entry.isSender ? '#c8e6c9' : '#b3e5fc'}`,
													position: 'relative',
												}}
											>
												<div
													style={{
														fontSize: '12px',
														fontWeight: 'bold',
														color: entry.isSender ? '#2e7d32' : '#1976d2',
														marginBottom: '4px',
													}}
												>
													{entry.speaker}
												</div>
												<div
													style={{
														fontSize: '13px',
														lineHeight: '1.4',
														color: '#2c3e50',
													}}
												>
													{entry.message}
												</div>
											</div>
										))}
									</div>
								) : (
									<div
										style={{
											textAlign: 'center',
											padding: '40px 20px',
											color: '#6c757d',
											fontStyle: 'italic',
										}}
									>
										<div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
										<p>No conversations yet</p>
										<p style={{ fontSize: '12px' }}>
											{selectedCharacter.isPlayerControlled
												? 'Start talking to other characters!'
												: 'Click "Start Conversation" to begin chatting!'}
										</p>
									</div>
								)}
							</div>
						)}
					</>
				) : (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
							padding: '40px',
							textAlign: 'center',
							color: '#6c757d',
						}}
					>
						<div style={{ fontSize: '60px', marginBottom: '20px' }}>👥</div>
						<h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Select a Character</h3>
						<p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
							Click on any character on the map to view their conversations and details.
						</p>
						<div
							style={{
								marginTop: '30px',
								padding: '15px',
								backgroundColor: '#fff3cd',
								borderRadius: '8px',
								border: '1px solid #ffeaa7',
								margin: 0,
							}}
						>
							<span role="img" aria-label="tip">
								💡
							</span>{' '}
							Tip: Click anywhere on the map to move Prota!
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
export default Town;
