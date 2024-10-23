export enum Prompts {
    ReturnMovieAsJson =
        'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "filePath": string, "title": string, "releaseYear": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n',
    ReturnShowAsJson =
        'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "filePath": string, "title": string, "releaseYear": number, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'title should reference the title of the show, not the title of the episode.' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n',
    ReturnStandupAsJson =
        'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "filePath": string, "title": string, "artist": string, "releaseYear": number }, { ... } ]"\n' +
        'Be sure to capitalize titles and artists where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n',
    ReturnAnimeAsJson =
        'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "filePath": string, "title": string, "releaseYear": number, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n',
    ReturnAnimationAsJson =
        'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "filePath": string, "title": string, "releaseYear": number, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n',
    ReturnInternetAsJson =
        'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "filePath": string, "title": string }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
}