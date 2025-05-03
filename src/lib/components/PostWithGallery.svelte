<script lang="ts">
	import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
	import type { Post } from '$lib/sanity.types';
	import imageUrlBuilder from '@sanity/image-url';
	import { PortableText } from '@portabletext/svelte';
	import IconExpand from './IconExpand.svelte';
	import { fade } from 'svelte/transition';
	import IconArrowLeft from './IconArrowLeft.svelte';
	import IconArrowRight from './IconArrowRight.svelte';

	type ImgRes = '320-240' | '640-480' | '960-720' | '1280-960' | 'original';
	const IMG_RES: Record<ImgRes, { width?: number; height?: number }> = {
		'320-240': { width: 320, height: 240 },
		'640-480': { width: 640, height: 480 },
		'960-720': { width: 960, height: 720 },
		'1280-960': { width: 1280, height: 960 },
		original: {}
	};

	interface Props {
		dataset: string;
		post: Post;
		projectId: string;
	}
	let { dataset, post, projectId }: Props = $props();

	let selectedImageIdx = $state(0);

	let multipleImgs = $derived((post.gallery || []).length > 1);
	let gallery = $derived((post.gallery || []).map((image) => getImageUrls(image, multipleImgs)));
	let selectedImage = $derived(gallery[selectedImageIdx]);

	function getImageUrls(
		source: SanityImageSource,
		withRatio: boolean
	): Record<ImgRes, string | undefined> {
		const imageBuilder =
			projectId && dataset ? imageUrlBuilder({ projectId, dataset }).image(source) : undefined;
		return Object.fromEntries(
			Object.entries(IMG_RES).map(([res, { width, height }]) => {
				let url: string | undefined;
				if (withRatio && width && height) {
					url = imageBuilder?.size(width, height).url();
				} else if (width) {
					url = imageBuilder?.width(width).url();
				} else {
					url = imageBuilder?.url();
				}
				return [res, url];
			})
		) as Record<ImgRes, string | undefined>;
	}

	function handleClickPrev() {
		if (gallery.length > 1) {
			selectedImageIdx = selectedImageIdx - 1 > -1 ? selectedImageIdx - 1 : gallery.length - 1;
		}
	}

	function handleClickNext() {
		if (gallery.length > 1) {
			selectedImageIdx = selectedImageIdx + 1 < gallery.length ? selectedImageIdx + 1 : 0;
		}
	}
</script>

<div class="border bg-white">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div>
		<div class="{multipleImgs ? 'relative aspect-4/3' : ''} p-2" onclick={handleClickNext}>
			{#each gallery || [] as imageUrls, i}
				{#if selectedImageIdx === i}
					<picture class={multipleImgs ? 'absolute top-0 left-0 aspect-4/3 w-full' : ''} in:fade out:fade>
						<source media="(max-width: 319px)" srcset={imageUrls['320-240']} />
						<source media="(max-width: 639px)" srcset={imageUrls['640-480']} />
						<source media="(max-width: 959px)" srcset={imageUrls['960-720']} />
						<img
							alt=""
							class="{multipleImgs ? 'aspect-4/3' : ''} w-full"
							draggable="false"
							src={imageUrls['1280-960']}
						/>
					</picture>
				{/if}
			{/each}
		</div>
		<div class="flex items-center border-t text-sm">
			<div class="flex items-center">
				<button
					class="cursor-pointer px-3.5 py-3 hover:bg-radial from-green-100 to-white to-65%"
					type="button"
					onclick={handleClickPrev}><IconArrowLeft /></button
				>
				<button
					class="cursor-pointer border-r px-3.5 py-3 hover:bg-radial from-green-100 to-white to-65%"
					type="button"
					onclick={handleClickNext}><IconArrowRight /></button
				>
			</div>
			<div class="border-r px-4 py-2">
				{selectedImageIdx + 1}
				<span class="mx-1">/</span>
				{gallery.length}
			</div>
			{#if selectedImage}
				<a
					class="ml-auto border-l px-3.5 py-3 hover:bg-radial from-green-100 to-white to-65%"
					href={selectedImage['original']}
					target="_blank"><IconExpand /></a
				>
			{/if}
		</div>
	</div>
	{#if post.body || post.title}
		<div class="border-t p-6">
			{#if post.title}
				<h3 class="mb-2 text-xl font-bold">{post.title}</h3>
			{/if}
			{#if post.body}
				<div>
					<PortableText value={post.body} />
				</div>
			{/if}
		</div>
	{/if}
</div>
