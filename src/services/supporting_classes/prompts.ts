export enum Prompts {
    ReturnMediaAsJson = 
        'Im going to give you an array of file paths that correlate to known media.\n' +
        'Return a parsable JSON array of objects in the format that follows:\n' +
        '[ { "filepath": string "type": string, "title": string, "releaseYear": number "seasonNumber": number|null, "episodeNumber": number|null }, { ... } ]\n' +
        'do this once for every string, returning 1 parsable array with 1 object for each file path in the array youre given.\n' +
        '"type" should be one of: "movie", "show", "stand-up", "anime", "animation", "internet". "type\n' +
        'Return only fully-parsable JSON.\n' +
        'Here are the file paths:'
}