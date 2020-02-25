/**
 *
 * Copyright HackerBay, Inc.
 *
 */

const jwtSecretKey = process.env['JWT_SECRET'];
const jwt = require('jsonwebtoken');
const url = require('url');
const UserService = require('../services/userService');
const ErrorService = require('../services/errorService');
const ProjectService = require('../services/projectService');
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const apiMiddleware = require('../middlewares/api');

module.exports = {
    // Description: Checking if user is authorized to access the page and decode jwt to get user data.
    // Params:
    // Param 1: req.headers-> {token}
    // Returns: 400: User is unauthorized since unauthorized token was present.
    getUser: function (req, res, next) {
        try {
            if( apiMiddleware.hasProjectIdAndApiKey(req)){
                return apiMiddleware.isValidProjectIdAndApiKey(req, res, next);
            }

            const accessToken = req.headers['authorization'] || url.parse(req.url, true).query.accessToken;

            if (!accessToken) {
                return sendErrorResponse(req, res, {
                    code: 401,
                    message: 'Session Token must be present.'
                });
            }

            if (typeof accessToken !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 401,
                    message: 'Token is not of type string.'
                });
            }

            const token = accessToken.split(' ')[1] || accessToken;

            //Decode the token
            jwt.verify(token, jwtSecretKey, (err, decoded) => {
                if (err) {
                    return sendErrorResponse(req, res, {
                        code: 401,
                        message:'You are unauthorized to access the page'
                    });
                } else {
                    req.user = decoded;
                    UserService.findOneBy({_id: req.user.id }).then((user)=>{
                        if(user.role === 'master-admin'){
                            req.authorizationType = 'MASTER-ADMIN';
                        }else{
                            req.authorizationType = 'USER';
                        }
                        UserService.updateOneBy({ _id: req.user.id},{ lastActive: Date.now() });
                        next();
                    });
                }
            });
        } catch (error) {
            ErrorService.log('user.getUser', error);
            throw error;
        }
    },

    checkUser: function (req, res, next) {
        try {
            const accessToken = req.headers['authorization'] || url.parse(req.url, true).query.accessToken;

            if (!accessToken) {
                req.user = null;
                next();
            }
            else {
                if (accessToken && typeof accessToken !== 'string') {
                    return sendErrorResponse(req, res, {
                        code: 401,
                        message:'Token is not of type string'
                    });
                }

                const token = accessToken.split(' ')[1] || accessToken;

                //Decode the token
                jwt.verify(token, jwtSecretKey, (err, decoded) => {
                    if (err) {
                        return sendErrorResponse(req, res, {
                            code: 401,
                            message:'You are unauthorized to access the page.'
                        });
                    } else {
                        req.authorizationType = 'USER';
                        req.user = decoded;
                        UserService.updateOneBy({ _id: req.user.id},{ lastActive: Date.now() });
                        next();
                    }
                });
            }
        } catch (error) {
            ErrorService.log('user.checkUser', error);
            throw error;
        }
    },
    checkUserBelongToProject: function (req, res, next) {
        try {
            const accessToken = req.headers['authorization'] || url.parse(req.url, true).query.accessToken;
            if (!accessToken) {
                req.user = null;
                next();
            }
            else {
                if (accessToken && typeof accessToken !== 'string') {
                    return sendErrorResponse(req, res, {
                        code: 401,
                        message:'Token is not of type string'
                    });
                }
                const token = accessToken.split(' ')[1] || accessToken;
                jwt.verify(token, jwtSecretKey, async (err, decoded) => {
                    if (err) {
                        return sendErrorResponse(req, res, {
                            code: 401,
                            message:'You are unauthorized to access the page.'
                        });
                    } else {
                        req.authorizationType = 'USER';
                        req.user = decoded;
                        UserService.updateOneBy({ _id: req.user.id},{ lastActive: Date.now() });
                        const userId = req.user ? req.user.id : null || url.parse(req.url, true).query.userId;
                        const projectId = req.params.projectId || req.body.projectId || url.parse(req.url, true).query.projectId;
                        if (!projectId) {
                            return res.status(400).send({code: 400, message:'Project id is not present.'});
                        }
                        const project = await ProjectService.findOneBy({_id: projectId});
                        let isUserPresentInProject = false;
                        if (project) {
                            for (let i = 0; i < project.users.length; i++) {
                                if (project.users[i].userId === userId) {
                                    isUserPresentInProject = true;
                                    break;
                                }
                            }
                        } else {
                            return sendErrorResponse(req, res, {
                                code:400,
                                message:'Project does not exist.'
                            });
                        }
                        if (isUserPresentInProject) {
                            next();
                        } else {
                            return sendErrorResponse(req, res, {
                                code:400,
                                message:'You are not present in this project.'
                            });
                        }
                    }
                });
            }
        } catch (error) {
            ErrorService.log('user.checkUserBelongToProject', error);
            throw error;
        }
    },
    isUserMasterAdmin: async function (req, res, next){
        if(req.authorizationType === 'MASTER-ADMIN'){
            next();
        }else{
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'You are not authorized.'
            });
        }
    }
};
