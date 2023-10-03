import jwt from "jsonwebtoken";

//verify JWT token from cookies, used in context creation function
export const verifyJWT = (cookies, headers) => {
    const token = headers.token_ca; 
    const tokenId = headers.token_id_ca;
    let userContext = {};
    if(!token || !tokenId) {
        userContext.jwtVerified = false;
        userContext.user = null;
        userContext.message = "Identity tokens must be sent with request headers.";
    }
    // if (!cookies || !cookies.token_ca || !cookies.userId_ca) {
    //     userContext.jwtVerified = false;
    //     userContext.user = null;
    //     userContext.message = "Identity cookies must be sent with request.";
    // }

    //verification level 1: jwt
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            userContext.jwtVerified = false;
            userContext.user = null;
            userContext.message = "Invalid/expired token found, re-authentication is required."
        }
        else {
            userContext.user = decoded;
            userContext.jwtVerified = true;
            // verification level 2: same user
            jwt.verify(tokenId, process.env.JWT_SECRET2, (_, decoded) => {
                if (userContext.user._id === decoded.userId) {
                    userContext.isSameUser = true;
                }
                else {
                    userContext.isSameUser = false;
                    userContext.message = "Same user verification failed, re-authentication is required."
                }
            })
        }
    })
    return userContext;
}


//check if user is JWT verified, used in queries and mutations
export const runJwtVerification = (context) => {
    if (!context.jwtVerified) throw new Error("User verification failed, need appropriate token with request headers.");
}


//check if req user id is same as JWT verified user id (same user check)
export const runSameUserCheck = (userId, context) => {
    if (userId.includes('@')) {
        if (userId !== context.user.email) throw new Error("Unauthorized access detected!");
    }
    else {
        if (userId !== context.user._id) throw new Error("Unauthorized access detected!");
    }
}

