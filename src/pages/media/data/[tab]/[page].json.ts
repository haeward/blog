import { getMediaDataStaticPaths, type MediaDataPage } from "@lib/media";
import type { APIRoute } from "astro";

export const prerender = true;

export function getStaticPaths() {
    return getMediaDataStaticPaths();
}

export const GET: APIRoute<{ payload: MediaDataPage }> = ({ props }) => {
    return new Response(JSON.stringify(props.payload), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
    });
};
