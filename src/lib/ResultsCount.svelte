<script lang="ts">
	interface Props {
		locationsCount: number;
		onlineCount: number;
		locationsTargetId: string;
		onlineTargetId: string;
		variant?: 'desktop' | 'mobile';
		onExpand?: () => void;
	}

	let {
		locationsCount,
		onlineCount,
		locationsTargetId,
		onlineTargetId,
		variant = 'mobile',
		onExpand
	}: Props = $props();

	function scrollToId(targetId: string) {
		const el = document.getElementById(targetId);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleClick(e: MouseEvent) {
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

	const totalResults = locationsCount + onlineCount;
	const linkClass =
		variant === 'desktop'
			? 'underline decoration-dotted underline-offset-2 hover:text-primary-600'
			: 'underline decoration-dotted underline-offset-2';
</script>

<p
	class="text-sm font-extralight text-surface-800-200 {variant === 'mobile'
		? 'cursor-pointer'
		: ''}"
	onclick={handleClick}
>
	{totalResults} resultaten (
	<a
		href="#{locationsTargetId}"
		class={linkClass}
		onclick={(e) => handleLinkClick(e, locationsTargetId)}>{locationsCount} locaties</a
	>
	|
	<a href="#{onlineTargetId}" class={linkClass} onclick={(e) => handleLinkClick(e, onlineTargetId)}
		>{onlineCount} online</a
	>
	)
</p>
