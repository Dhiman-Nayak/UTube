class ApiError extends Error{
    constructor(
        statusCode,
        massage="Something went wrong",
        errors=[],
        statck=""
    ){
        super(massage)
        this.statusCode=statusCode
        this.data=null
        this.massage=massage
        this.success= false
        this.errors=errors

        if(statck){
            this.statck= statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
 export {ApiError}