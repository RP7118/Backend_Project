class APierror extends Error{
    constructor(
        statudcode,
        message ="Something went wrong",
        error = [],
        stack = ""
    ){
        super(message)
        this.statudcode = statudcode
        this.data = data
        this.message = message
        this.success = false;
        this.errors = errors
    }
}