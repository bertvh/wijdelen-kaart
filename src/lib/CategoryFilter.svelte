<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface Props {
		categories: string[];
		onSelectedCategoriesChange: (selectedCategories: string[]) => void;
		onAnimationComplete?: () => void;
	}

	let { categories, onSelectedCategoriesChange, onAnimationComplete }: Props = $props();

	// Track selected categories (initialize with all categories)
	let selectedCategories = $state<string[]>([...categories]);

	// Animation state
	let typewriterText = $state('');
	let showCategories = $state(false);
	let visibleCategories = $state<string[]>([]);

	const fullText = 'Wij delen om te ';
	const typewriterSpeed = import.meta.env.DEV ? 10 : 50; // milliseconds per character
	const categoryDelay = import.meta.env.DEV ? 50 : 100; // milliseconds between categories

	// Emit changes when selectedCategories changes
	$effect(() => {
		onSelectedCategoriesChange(selectedCategories);
	});

	onMount(() => {
		// Start typewriter animation
		let currentIndex = 0;
		const typewriterInterval = setInterval(() => {
			if (currentIndex < fullText.length) {
				typewriterText += fullText[currentIndex];
				currentIndex++;
			} else {
				clearInterval(typewriterInterval);
				// Start showing categories after typewriter finishes
				setTimeout(() => {
					showCategories = true;
					animateCategories();
				}, 0);
			}
		}, typewriterSpeed);
	});

	function animateCategories() {
		let categoryIndex = 0;
		const categoryInterval = setInterval(() => {
			if (categoryIndex < categories.length) {
				visibleCategories = [...visibleCategories, categories[categoryIndex]];
				categoryIndex++;
			} else {
				clearInterval(categoryInterval);
				// Call the animation complete callback
				onAnimationComplete?.();
			}
		}, categoryDelay);
	}

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter((c) => c !== category);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}
</script>

<div class="border-b border-surface-500/30 p-4 text-primary-500">
	<span class="mb-3 font-light text-primary-500">{typewriterText}</span>
	{#if showCategories}
		<span>
			{#each visibleCategories as category (category)}
				<button
					class="-mx-1 me-2 rounded px-1 text-sm font-bold transition-all hover:bg-primary-500/20 {selectedCategories.includes(
						category
					)
						? 'bg-primary-500/10 opacity-100'
						: 'opacity-50'}"
					onclick={() => toggleCategory(category)}
					in:fly={{ x: -20, duration: 300 }}
				>
					{category}
				</button>
			{/each}
		</span>
	{/if}
</div>
