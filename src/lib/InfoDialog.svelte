<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { CircleQuestionMark } from '@lucide/svelte';
</script>

<Dialog>
	<Dialog.Trigger class="cursor-pointer">
		<CircleQuestionMark class="text-primary-500" size={20} />
	</Dialog.Trigger>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
		<Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
			<Dialog.Content
				class="w-md space-y-2 card bg-surface-100-900 p-4 text-primary-950-50 shadow-xl"
			>
				<Dialog.Title class="text-2xl font-bold">Deelkaart info</Dialog.Title>
				<Dialog.Description>
					<p class="p">Ontdek waar je spullen kan huren of delen in plaats van te kopen.</p>
					<ol class="my-2 ml-4 list-inside list-decimal">
						<li>
							Kies een categorie: <span class="font-medium italic">Wij delen om te ...</span>
						</li>
						<li>De resultaten tonen zowel locaties met een fysiek adres als online diensten.</li>
					</ol>
					<p>
						Deze kaart werd gerealiseerd door
						<a
							class="text-primary-600 underline underline-offset-2 hover:text-primary-500 dark:text-primary-300"
							href="https://wijdelen.be"
							target="_blank"
							rel="noopener noreferrer"
						>
							Wij Delen
						</a>
						in het kader van de
						<a
							class="text-primary-600 underline underline-offset-2 hover:text-primary-500 dark:text-primary-300"
							href="https://hurendelen.be"
							target="_blank"
							rel="noopener noreferrer"
						>
							Green Deal Huren &amp; Delen
						</a>.
					</p>
				</Dialog.Description>
				<Dialog.CloseTrigger class="mt-4 btn preset-tonal">Sluit</Dialog.CloseTrigger>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
