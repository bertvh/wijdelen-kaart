<script lang="ts">
	interface Props {
		locationsCount: number;
		onlineCount: number;
		onlineTargetId: string;
		variant?: 'desktop' | 'mobile';
		onExpand?: () => void;
	}

	let {
		locationsCount,
		onlineCount,
		onlineTargetId,
		variant = 'mobile',
		onExpand
	}: Props = $props();

	let totalResults = $derived(locationsCount + onlineCount);

	function scrollToId(targetId: string) {
		const el = document.getElementById(targetId);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleClick() {
		// On mobile, clicking anywhere on the results count should expand the list
		if (variant === 'mobile' && onExpand) {
			onExpand();
		}
	}

	function handleLinkClick(e: MouseEvent, targetId: string) {
		e.preventDefault();
		e.stopPropagation(); // Prevent triggering parent click handler
		// On mobile, expand first if needed, then scroll
		if (variant === 'mobile' && onExpand) {
			onExpand();
			// Small delay to ensure the list is rendered before scrolling
			setTimeout(() => {
				scrollToId(targetId);
			}, 100);
		} else {
			scrollToId(targetId);
		}
	}
</script>

<p
	class="text-sm font-extralight text-surface-800-200 {variant === 'mobile'
		? 'cursor-pointer'
		: ''}"
	onclick={handleClick}
>
	{totalResults} resultaten (

	<a
		href="#{onlineTargetId}"
		class="underline decoration-dotted underline-offset-2"
		onclick={(e) => handleLinkClick(e, onlineTargetId)}>{onlineCount} online</a
	>
	)
</p>
