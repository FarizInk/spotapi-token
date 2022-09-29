module.exports = {
    JSONResponse(status, message = null, data = null) {
        return {
            "status": status,
            "message": message,
            "data": data,
        }
    }
}