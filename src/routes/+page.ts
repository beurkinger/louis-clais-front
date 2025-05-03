import type { PageLoad } from './$types';
import type { Post } from '$lib/sanity.types';
import { error } from '@sveltejs/kit';
import { createClient } from "@sanity/client";
import { env } from '$env/dynamic/public';


const client = createClient({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
});

const { projectId, dataset } = client.config();

const NUM_POSTS_PER_PAGE = 2;

const options = { next: { revalidate: 30 } };

const POST_FILTER = `[_type == "post" && defined(slug.current)]`;

export const load: PageLoad = async ({ url }) => {
    const pageParam = Number(url.searchParams.get('p') || 0);

    const postsCountQuery = `count(*${POST_FILTER})`;
    const postsCount = await client.fetch<number>(postsCountQuery, {}, options);

    const pageId = (isNaN(pageParam) || ((pageParam * NUM_POSTS_PER_PAGE + 1) > postsCount)) ? 0 : pageParam;
    const offset = pageId * NUM_POSTS_PER_PAGE;

    const postsQuery = `*${POST_FILTER}|order(publishedAt desc)[${offset}...${offset + NUM_POSTS_PER_PAGE}]{_id, title, slug, publishedAt, gallery, body}`;
    const posts = await client.fetch<Post[]>(postsQuery, {}, options);

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
