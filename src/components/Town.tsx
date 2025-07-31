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
];

// Character activity states
type ActivityState = 'moving' | 'working' | 'exploring' | 'idle';

// Extended interface for conversation history entry
interface ConversationEntry {
	speaker: string;
	message: string;
	isSender: boolean;
}

// Extended interface for the component
interface ExtendedCharacter extends Character {
	activityState: ActivityState;
	taskStartTime?: number;
	explorationStartTime?: number;
	explorationTarget?: { x: number; y: number };
	basePosition?: { x: number; y: number };
	conversationHistory: ConversationEntry[]; // Updated type for conversation history
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
					const personality = await generatePersonality(
						def.name,
						def.personalityKeywords
					);

					// Mix base tasks with exploration tasks
					const explorationTasks = generateExplorationTasks();
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
						conversationHistory: [] as ConversationEntry[], // Initialize empty history with new type
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

	const updateCharacters = () => {
		gameTick.current += 1;
		const shouldUpdateFrame = gameTick.current % ANIMATION_TICK_SPEED === 0;
		const now = Date.now();

		setCharacters((prevChars) =>
			prevChars.map((char) => {
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

				// Handle activity states
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

					case 'moving':
					default:
						if (!activeInteraction) {
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
								activityState: 'idle' as ActivityState,
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
						backgroundColor: 'rgba(255,255,255,0.3)',
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
			<div id="town-container" className="town-container">
				{characters.map((character) => (
					<img
						key={character.id}
						src={character.sprites[character.direction][character.animationFrame] || ''}
						alt={character.name}
						className="character-sprite"
						style={{
							left: `${character.x}px`,
							top: `${character.y}px`,
							opacity: character.isMoving ? 1 : 0.9,
							transform: `scale(${character.isMoving ? 1.02 : 1})`,
							filter: character.activityState === 'working' ? 'brightness(1.2)' : 'none',
							border:
								selectedCharacter?.id === character.id ? '2px solid #FFD700' : 'none',
						}}
						onClick={() => handleCharacterClick(character)}
						loading="eager"
					/>
				))}
			</div>

			{/* Conversation History Panel */}
			<div
				id="history-panel"
				style={{
					width: '300px',
					height: '600px',
					backgroundColor: '#f0f0f0',
					border: '1px solid #ccc',
					padding: '15px',
					overflowY: 'auto',
					fontFamily: 'Arial, sans-serif',
					marginLeft: '20px',
				}}
			>
				{selectedCharacter ? (
					<>
						<h3
							style={{
								fontSize: '18px',
								fontWeight: 'bold',
								marginBottom: '10px',
								color: '#333',
							}}
						>
							{selectedCharacter.name}'s History
						</h3>
						<div
							style={{
								marginBottom: '15px',
								padding: '10px',
								backgroundColor: '#e8f4f8',
								borderRadius: '5px',
							}}
						>
							<strong>Personality:</strong> {selectedCharacter.personality}
						</div>
						<div style={{ marginBottom: '15px' }}>
							<strong>Task Progress:</strong>{' '}
							{selectedCharacter.dailyGoals.filter((goal) => goal.completed).length}/
							{selectedCharacter.dailyGoals.length}
						</div>
						<div style={{ marginBottom: '10px' }}>
							<strong>Conversations:</strong>
						</div>
						<ul
							style={{
								listStyleType: 'none',
								padding: 0,
								margin: 0,
							}}
						>
							{selectedCharacter.conversationHistory.length === 0 ? (
								<li style={{ padding: '8px', fontStyle: 'italic', color: '#666' }}>
									This character hasn't had any conversations yet.
								</li>
							) : (
								selectedCharacter.conversationHistory.map((entry, index) => (
									<li
										key={index}
										style={{
											marginBottom: '8px',
											padding: '8px',
											backgroundColor: '#fff',
											borderRadius: '4px',
											boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
											fontSize: '14px',
											lineHeight: '1.4',
											borderLeft: `4px solid ${entry.isSender ? '#4CAF50' : '#2196F3'}`,
										}}
									>
										<strong style={{ color: entry.isSender ? '#4CAF50' : '#2196F3' }}>
											{entry.speaker}:
										</strong>{' '}
										{entry.message}
									</li>
								))
							)}
						</ul>
					</>
				) : (
					<div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
						<h3>Click on a character to view their history</h3>
						<p>Select any character on the map to see their conversations and details.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Town;
