<script lang="ts">
	import type { PageProps } from './$types';
	import PostWithGallery from '$lib/components/PostWithGallery.svelte';

	let { data }: PageProps = $props();
</script>

<div class="min-h-[100vh] bg-green-50">
	<div class="container mx-auto px-10 py-10 lg:px-0">
		<div class="container mx-auto flex w-full justify-center lg:w-4/5 xl:w-3/4">
			<div class="w-full items-start gap-x-10 lg:flex">
				<div class="mb-10 overflow-hidden border bg-white lg:sticky lg:top-10 lg:w-72">
					<!-- <div class="relative"> -->
					<!-- <div class="top-0 left-0 absolute text-4xl -z-1 skew-10 scale-160 -translate-x-4 translate-y-4 font-bold text-green-100">Louis Clais</div> -->
					<div class="w-full border-b px-10 py-6 text-right text-4xl font-bold">Louis Clais</div>
					<!-- </div> -->
					<div class="flex flex-col items-end px-10 py-6 text-right">
						<div>louis.clais@gmail.com</div>
						<div>curriculum vitae</div>
					</div>
				</div>
				<div class="flex-1">
					<div class="space-y-10">
						{#each data.posts || [] as post}
							<PostWithGallery dataset={data.dataset} {post} projectId={data.projectId} />
						{/each}
						<div class="inline-flex items-center border bg-white">
							{#each Array.from({ length: data.nav.numPages }, (_, i) => i) as n}
								<a
									class="border-r border-black px-3.5 py-2 last:border-r-0
										{n === data.nav.pageId
										? 'bg-black text-white'
										: 'from-green-100 to-white to-65% hover:bg-radial hover:text-black'}"
									href={`/?p=${n}`}>{n + 1}</a
								>
							{/each}
							<!-- <div class="px-4 py-2 text-gray-400">2</div> -->
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
