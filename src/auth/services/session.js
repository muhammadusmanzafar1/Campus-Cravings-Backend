const jwt = require('../../../utils/jwt');
const moment = require('moment');
const SessionDB = require("../models/session")
let sessionType = process.env.SESSION_TYPE || 'single';

const createSession = async (user, body) => {
    let model = {
        user: user._id,
        // fcmToken: body.deviceId,
        deviceType: body.deviceType
    };
    if (sessionType == 'single') {
        await expireSessions(user._id);
    }
    let entity = new SessionDB(model);
    
    entity.accessToken = jwt.getAccessToken(user, entity);
    entity.refreshToken = jwt.getRefreshToken(user);

    entity.accessTokenExpires = moment().add(process.env.TOKEN_PERIOD, 'minutes');
    entity.refreshTokenExpires = moment().add(process.env.REFRESH_PERIOD, 'days');
    
    return await entity.save();
}

const expireSessions = async (userId) => {
    await SessionDB.updateMany(
        { user: userId },
        { status: 'expired' }
    );
}
const expireSingleSession = async (sessionId) => {
    await SessionDB.updateMany(
        { _id: sessionId },
        { status: 'expired' }
    );
}


const get = async (id) => {
    return await SessionDB.findById(id)
};
module.exports = {
    createSession, expireSessions, get,expireSingleSession
}