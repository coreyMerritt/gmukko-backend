interface DatabaseNames {
    staging: string
    production: string
    rejection: string
}

export class Config {
    public static stagingDirectory: string
    public static databaseNames: DatabaseNames 

}