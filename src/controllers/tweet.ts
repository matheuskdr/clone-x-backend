import type { Response } from "express";
import type { ExtendedRequest } from "../types/extended-resquest";
import { addTweetSchema } from "../schemas/add-tweet";
import {
    createTweet,
    findAnswersFromTweet,
    findTweet,
} from "../services/tweet";
import { addHashtag } from "../services/trend";

export const addTweet = async (req: ExtendedRequest, res: Response) => {
    const safeData = addTweetSchema.safeParse(req.body);
    if (!safeData.success) {
        return res.json({ error: safeData.error!.issues });
    }

    if (safeData.data.answer) {
        const hasAnswerTweet = await findTweet(parseInt(safeData.data.answer));
        if (!hasAnswerTweet) {
            return res.json({ error: "Tweet original inexistente" });
        }
    }

    const newTweet = await createTweet(
        req.userSlug as string,
        safeData.data.body,
        safeData.data.answer ? parseInt(safeData.data.answer) : 0
    );

    const hashtags = safeData.data.body.match(/#[a-zA-Z0-9_]+/g);
    if (hashtags) {
        for (let hashtag of hashtags) {
            if (hashtag.length >= 2) {
                await addHashtag(hashtag);
            }
        }
    }

    res.json({ tweet: newTweet });
};

export const getTweet = async (req: ExtendedRequest, res: Response) => {
    if (!req.params.id) {
        return res.json({ error: "ID do tweet é obrigatório" });
    }
    const { id } = req.params;

    const tweet = await findTweet(parseInt(id));
    if (!tweet) return res.json({ error: "Tweet inexistente" });

    res.json({ tweet });
};

export const getAnswers = async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.json({ error: "ID do tweet é obrigatório" });
    }

    const answers = await findAnswersFromTweet(parseInt(id));

    res.json({ answers });
};
