export enum Prompts {
    ReturnMediaAsJson = "I'm going to give you a full file path to a piece of media, I want you to do your best to categorize the media in the following categories: type, title, releaseYear, seasonNumber*, episodeNumber*, filePath   asterisks here represent data that may not always apply. filePath should just be an exact match to the file I give you. 'type' should be one of these values: 'Movie', 'Show', 'Stand-Up', 'Anime', 'Animation', 'Internet Video'.  because anime and animation can have some overlap, I first want you to ask yourself if the media is anime, it can only be animation if it is -not- anime. The other categories should be self explainatory. Give me your result in perfectly parsable JSON. Here's the full file name: " 
}