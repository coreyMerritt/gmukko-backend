export enum Prompts {
    ReturnMediaAsJson = 
        "I'm going to give you a full file path to a piece of media, " +
        "I want you to do your best to categorize the media in the following categories: type, title, releaseYear, seasonNumber*, episodeNumber*, filePath " + 
        "Asterisks here represent data that may not always apply. If anything with an asterisk should be blank, return null for those values. " +
        "filePath should just be an exact match to the file I give you. " + 
        "type should be one of these values: 'Movie', 'Show', 'Stand-Up', 'Anime', 'Animation', 'Internet Video'. "  +
        "Because anime and animation can have some overlap, I first want you to ask yourself if the media is anime, it can only be animation if it is not anime. " + 
        "The other categories should be self explanatory. " +
        "Be careful not to over-rely on the file name, cross check your results with known media for confidence" +
        "Be careful not to include the year in the title" +
        "Give me your result in perfectly parsable JSON. " + 
        "Here's the full file name: " 
}