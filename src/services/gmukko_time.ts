export class GmukkoTime {

    public static getCurrentDateTime(fileFormat?: boolean) {
        const now = new Date()

        const year = now.getUTCFullYear()
        const month = String(now.getUTCMonth() + 1).padStart(2, '0')
        const day = String(now.getUTCDate()).padStart(2, '0')
    
        const hours = String(now.getUTCHours()).padStart(2, '0')
        const minutes = String(now.getUTCMinutes()).padStart(2, '0')
        const seconds = String(now.getUTCSeconds()).padStart(2, '0')
        const milliseconds = String(now.getUTCMilliseconds()).padStart(4, '0')
        if (fileFormat) {
            return `${year}-${month}-${day}__${hours}-${minutes}-${seconds}.${milliseconds}`
        } else {
            return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
        }
    }
}