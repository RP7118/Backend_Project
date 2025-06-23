class APierror extends Error{
    constructor(
        statuscode,
        message ="Something went wrong",
        error = [],
        stack = ""
    ){
        super(message)
        this.statuscode = statuscode
        this.data = data
        this.message = message
        this.success = false;
        this.errors = errors
    }
}

export {APierror}