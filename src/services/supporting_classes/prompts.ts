export enum Prompts {
    ReturnMediaAsJson =
        'Return a fully parsable JSON array of objects in the format that follows: ' +
        '[ { "type": string, "title": string, "releaseYear": number "seasonNumber": number|null, "episodeNumber": number|null }, { ... } ] ' +
        '"type" just be one of: "movie", "show", "stand-up", "anime", "animation", "internet". ' +
        'Your answer should be a fully parsable valid JSON array.'
}