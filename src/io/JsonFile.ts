/** 
* Defines a wrapper for a Json file that includes info about the file as
* well as the data to be saved stored in the data property.
*/
export class JsonFile<T>
{
    public fileType: string;
    public createdDate: Date;
    public updatedDate: Date;
    public data: T;

    constructor(fileType: string, data?: T)
    {
        this.fileType = fileType;
        this.data = data;
        this.createdDate = new Date();
        this.updatedDate = new Date();
    }
}
