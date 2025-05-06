import type { PageServerLoad } from './$types';
import type { Post } from '$lib/sanity.types';
import { error } from '@sveltejs/kit';
import { createClient } from "@sanity/client";
import { SANITY_PROJECT_ID } from '$env/static/private';


const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
});

const { projectId, dataset } = client.config();

const NUM_POSTS_PER_PAGE = 6;

const POST_FILTER = `[_type == "post" && defined(slug.current)]`;

export const load: PageServerLoad = async ({ url }) => {
    const pageParam = Number(url.searchParams.get('p') || 0);

    const postsCountQuery = `count(*${POST_FILTER})`;
    const postsCount = await client.fetch<number>(postsCountQuery, {});

    const pageId = (isNaN(pageParam) || ((pageParam * NUM_POSTS_PER_PAGE + 1) > postsCount)) ? 0 : pageParam;
    const offset = pageId * NUM_POSTS_PER_PAGE;

    const postsQuery = `*${POST_FILTER}|order(publishedAt desc)[${offset}...${offset + NUM_POSTS_PER_PAGE}]{_id, title, slug, publishedAt, gallery, body}`;
    const posts = await client.fetch<Post[]>(postsQuery, {});

    if (!dataset || !projectId || !posts || !postsCount) {
        throw error(500);
    }

    const numPages = Math.ceil(postsCount / NUM_POSTS_PER_PAGE);

    return {
        dataset,
        nav: { offset, pageId, numPages, postsCount },
        posts,
        projectId,
    };
};
