<script lang="ts">
	import {
		Mountain,
		Hammer,
		Dumbbell,
		Bike,
		HardHat,
		PartyPopper,
		ChefHat,
		Luggage,
		Building,
		Ship,
		Flame,
		Baby,
		Shirt,
		Gamepad2,
		Car,
		ShoppingCart
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

	interface Props {
		iconName?: string;
		size?: number;
		class?: string;
	}

	let { iconName = 'ShoppingCart', size = 16, class: className = '' }: Props = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const iconMap: Record<string, Component<any>> = {
		Mountain,
		Hammer,
		Dumbbell,
		Bike,
		HardHat,
		PartyPopper,
		ChefHat,
		Luggage,
		Building,
		Ship,
		Flame,
		Baby,
		Shirt,
		Gamepad2,
		Car,
		ShoppingCart
	};

	const IconComponent = $derived(iconMap[iconName] || ShoppingCart);
</script>

<svelte:component this={IconComponent} {size} class={className} />
