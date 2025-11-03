<script lang="ts">
	import {
		Mountain,
		Hammer,
		Dumbbell,
		Bike,
		HardHat,
		MapPin,
		PartyPopper,
		ChefHat,
		Luggage,
		Building,
		Ship,
		Flame,
		Baby,
		Shirt,
		Gamepad2,
		Car
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

	interface Props {
		iconName?: string;
		size?: number;
		class?: string;
	}

	let { iconName = 'MapPin', size = 16, class: className = '' }: Props = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const iconMap: Record<string, Component<any>> = {
		Mountain,
		Hammer,
		Dumbbell,
		Bike,
		HardHat,
		MapPin,
		PartyPopper,
		ChefHat,
		Luggage,
		Building,
		Ship,
		Flame,
		Baby,
		Shirt,
		Gamepad2,
		Car
	};

	const IconComponent = $derived(iconMap[iconName] || MapPin);
</script>

<svelte:component this={IconComponent} {size} class={className} />
