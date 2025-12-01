import type { Response } from "express";
import type { ExtendedRequest } from "../types/extended-resquest";
import {
    findUserBySlug,
    getUserFollowersCount,
    getUserFollowingCount,
    getUserTweetCount,
} from "../services/user";
import { userTweetsSchema } from "../schemas/user-tweets";
import { findTweetsByUser } from "../services/tweet";

export const getUser = async (req: ExtendedRequest, res: Response) => {
    if (!req.params.slug) {
        return res.status(400).json({ message: "Slug is required" });
    }
    const { slug } = req.params;

    const user = await findUserBySlug(slug);
    if (!user) {
        return res.json({ error: "Usuario inexistente" });
    }

    const followingCount = await getUserFollowingCount(user.slug);
    const followersCount = await getUserFollowersCount(user.slug);
    const tweetCount = await getUserTweetCount(user.slug);

    return res.json({ user, followingCount, followersCount, tweetCount });
};

export const getUserTweets = async (req: ExtendedRequest, res: Response) => {
    if (!req.params.slug) {
        return res.status(400).json({ message: "Slug is required" });
    }
    const { slug } = req.params;

    const safeData = userTweetsSchema.safeParse(req.query);
    if (!safeData.success) {
        return res.json({ error: safeData.error.flatten().fieldErrors });
    }

    let perPage = 2;
    let currentPage = safeData.data.page ?? 0;

    const tweets = await findTweetsByUser(slug, currentPage, perPage);

    res.json({ tweets, page: currentPage });
};
