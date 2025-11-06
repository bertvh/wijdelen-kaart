<script lang="ts">
	interface Props {
		locationsCount: number;
		onlineCount: number;
		locationsTargetId: string;
		onlineTargetId: string;
		variant?: 'desktop' | 'mobile';
	}

	let {
		locationsCount,
		onlineCount,
		locationsTargetId,
		onlineTargetId,
		variant = 'mobile'
	}: Props = $props();

	function scrollToId(targetId: string) {
		const el = document.getElementById(targetId);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	const totalResults = locationsCount + onlineCount;
	const linkClass =
		variant === 'desktop'
			? 'underline decoration-dotted underline-offset-2 hover:text-primary-600'
			: 'underline decoration-dotted underline-offset-2';
</script>

<p class="text-xs font-extralight text-surface-800-200">
	{totalResults} resultaten (
	<a
		href="#{locationsTargetId}"
		class={linkClass}
		onclick={(e) => {
			e.preventDefault();
			scrollToId(locationsTargetId);
		}}>{locationsCount} locaties</a
	>
	|
	<a
		href="#{onlineTargetId}"
		class={linkClass}
		onclick={(e) => {
			e.preventDefault();
			scrollToId(onlineTargetId);
		}}>{onlineCount} online</a
	>
	)
</p>
