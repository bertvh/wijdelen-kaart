<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { CircleQuestionMark, MapPinPlus } from '@lucide/svelte';
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
				<Dialog.Description class="text-sm">
					<p class="p">Ontdek waar je spullen kan huren of delen in plaats van te kopen.</p>
					<ol class="my-2 ml-4 list-inside list-decimal">
						<li>
							Kies een categorie: <span class="italic">Wij delen om te ...</span>
						</li>
						<li>De resultaten tonen zowel locaties met een fysiek adres als online diensten.</li>
					</ol>
					<hr class="my-2 hr border-surface-500" />
					<p class="text-sm text-surface-700-300">
						<span class="inline-flex items-center gap-2">
							<span>
								Gerealiseerd door
								<a
									class="text-primary-600 hover:text-primary-500 dark:text-primary-300"
									href="https://wijdelen.be"
									target="_blank"
									rel="noopener noreferrer"
								>
									Wij Delen
								</a>
								/
								<a
									class="text-primary-600 hover:text-primary-500 dark:text-primary-300"
									href="https://hurendelen.be"
									target="_blank"
									rel="noopener noreferrer"
								>
									Green Deal Huren &amp; Delen
								</a>. <MapPinPlus class="inline align-text-top" size="16" /> Wil je ook zichtbaar zijn
								op deze huur- en deelkaart?
								<a class="anchor" href="https://calendly.com/hurendelen/30min" target="_blank"
									>Maak een afspraak in ons loket.</a
								>
							</span>
						</span>
					</p>
				</Dialog.Description>
				<Dialog.CloseTrigger class="mt-4 btn preset-tonal">Sluit</Dialog.CloseTrigger>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
