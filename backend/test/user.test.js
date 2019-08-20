process.env.PORT = 3020;
var expect = require('chai').expect;
var data = require('./data/user');
var profile = require('./data/user').profile;
var chai = require('chai');
chai.use(require('chai-http'));
var app = require('../server');

var request = chai.request.agent(app);
var UserService = require('../backend/services/userService');
var UserModel = require('../backend/models/user');
var ProjectService = require('../backend/services/projectService');
var LoginIPLog = require('../backend/models/LoginIPLog');
var VerificationTokenModel = require('../backend/models/verificationToken');


var projectId, userId, token;

describe('User API', function () {
    this.timeout(20000);

    before(function (done) {
        this.timeout(30000);
        request.post('/user/signup').send(data.user).end(function (err, res) {
            let project = res.body.project;
            projectId = project._id;
            userId = res.body.id;
            VerificationTokenModel.findOne({ userId }, function (err, verificationToken) {
                request.get(`/user/confirmation/${verificationToken.token}`).redirects(0).end(function () {
                    request.post('/user/login').send({
                        email: data.user.email,
                        password: data.user.password
                    }).end(function () {
                        token = res.body.tokens.jwtAccessToken;
                        done();
                    });
                });
            });
        });
    });

    after(async () => {
        await UserService.hardDeleteBy({ email: { $in: [data.user.email, data.newUser.email, data.anotherUser.email] } });
        await ProjectService.hardDeleteBy({ _id: projectId });
        await LoginIPLog.deleteMany({ userId });
    });

    // 'post /user/signup'
    it('should register with name, email, password, companyName, jobRole, referral, companySize, stripeToken, stripePlanId', function (done) {
        request.post('/user/signup').send(data.newUser).end(function (err, res) {
            var newUserId = res.body.id;
            expect(res).to.have.status(200);
            expect(res.body).include.keys('tokens');
            expect(res.body.email).to.equal(data.newUser.email);
            ProjectService.hardDeleteBy({ _id: res.body.project._id });
            VerificationTokenModel.findOne({ userId: newUserId }, function (err, verificationToken) {
                request.get(`/user/confirmation/${verificationToken.token}`).redirects(0).end(function () {
                    done();
                });
            });
        });
    });

    it('should not register when name, email, password, companyName, jobRole, referral, companySize, stripePlanId or stripeToken is null', function (done) {
        request.post('/user/signup').send(data.nullUser).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not register with same email', function (done) {
        request.post('/user/signup').send(data.user).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not register with an invalid email', function (done) {
        var invalidMailUser = Object.assign({}, data.user);
        invalidMailUser.email = 'invalidMail';
        request.post('/user/signup').send(invalidMailUser).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not register with a personal email', function (done) {
        var personalMailUser = Object.assign({}, data.user);
        personalMailUser.email = 'personalAccount@gmail.com';
        request.post('/user/signup').send(personalMailUser).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    // post '/user/login'
    it('should not login when email is null', function (done) {
        request.post('/user/login').send({
            email: null,
            password: data.user.password
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    // post '/user/login'
    it('should not login when password is null', function (done) {
        request.post('/user/login').send({
            email: data.user.email,
            password: null
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not allow to login with invalid email', function (done) {
        request.post('/user/login').send({
            email: 'invalidEmail',
            password: data.user.password
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not allow to login with invalid password', function (done) {
        request.post('/user/login').send({
            email: data.user.email,
            password: {}
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should track IP and other parameters when login in', async function () {
        var res = await request.post('/user/login').send({
            email: data.user.email,
            password: data.user.password
        });
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal(data.user.email);
        var log = await LoginIPLog.findOne({ userId });
        expect(log).to.be.an('object');
        expect(log).to.have.property('ipLocation');
        expect(log.ipLocation).to.be.an('object');
        expect(log.ipLocation.ip).to.be.equal('::ffff:127.0.0.1');
    });

    it('should login with valid credentials', function (done) {
        request.post('/user/login').send({
            email: data.newUser.email,
            password: data.newUser.password
        }).end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body.email).to.equal(data.newUser.email);
            expect(res.body).include.keys('tokens');
            done();
        });
    });

    it('should login with valid credentials, and return sent redirect url', function (done) {
        request.post('/user/login').send({
            email: data.newUser.email,
            password: data.newUser.password,
            redirect: 'http://fyipe.com'
        }).end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body.email).to.equal(data.newUser.email);
            expect(res.body).have.property('redirect');
            expect(res.body.redirect).to.eql('http://fyipe.com');
            done();
        });
    });

    it('should not accept `/forgot-password` request when email is null', function (done) {
        request.post('/user/forgot-password').send({
            email: null
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not accept `/forgot-password` request when email is invalid', function (done) {
        request.post('/user/forgot-password').send({
            email: '(' + data.user.email + ')'
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should accept `/forgot-password` request when email is valid', function (done) {
        request.post('/user/forgot-password').send({
            email: data.newUser.email
        }).end(function (err, res) {
            expect(res).to.have.status(200);
            done();
        });
    });

    // post '/user/reset-password'
    it('should not accept `/user/reset-password` request when token is null', function (done) {
        request.post('/user/reset-password').send({
            password: data.user.password,
            token: null
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    // post '/user/reset-password'
    it('should not accept `/user/reset-password` request when password is null', function (done) {
        request.post('/user/reset-password').send({
            password: null,
            token: 'randomToken'
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should accept `/user/reset-password` request when password and token is valid', function (done) {
        request.post('/user/forgot-password').send({
            email: data.newUser.email
        }).end(function () {
            UserModel.findOne({ email: data.newUser.email }, function(err, user){
                request.post('/user/reset-password').send({
                    password: 'newPassword',
                    token: user.resetPasswordToken
                }).end(function (err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
    });

    it('should not accept `/isInvited` request when email is null', function (done) {
        request.post('/user/isInvited').send({
            email: null
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should return a boolean response for the `/isInvited` request', function (done) {
        request.post('/user/isInvited').send({
            email: data.user.email
        }).end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('boolean');
            done();
        });
    });

    it('should update the profile settings of an authenticated user', function (done) {
        var authorization = `Basic ${token}`;
        request.put('/user/profile').set('Authorization', authorization).send(profile).end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body._id).to.be.equal(userId);
            done();
        });
    });

    it('should not change a password when the `currentPassword` field is not valid', function (done) {
        var authorization = `Basic ${token}`;
        request.put('/user/changePassword').set('Authorization', authorization).send({
            currentPassword: null,
            newPassword: 'abcdefghi',
            confirmPassword: 'abcdefghi'
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not change a password when the `newPassword` field is not valid', function (done) {
        var authorization = `Basic ${token}`;
        request.put('/user/changePassword').set('Authorization', authorization).send({
            currentPassword: '0123456789',
            newPassword: null,
            confirmPassword: 'abcdefghi'
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should not change a password when the `confirmPassword` field is not valid', function (done) {
        var authorization = `Basic ${token}`;
        request.put('/user/changePassword').set('Authorization', authorization).send({
            currentPassword: '0123456789',
            newPassword: 'abcdefghi',
            confirmPassword: null
        }).end(function (err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('should change a password when all fields are valid', function (done) {
        var authorization = `Basic ${token}`;
        request.put('/user/changePassword').set('Authorization', authorization).send({
            currentPassword: '1234567890',
            newPassword: 'abcdefghi',
            confirmPassword: 'abcdefghi'
        }).end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body.id).to.be.equal(userId);
            done();
        });
    });

    it('should get the profile of an authenticated user', function (done) {
        var authorization = `Basic ${token}`;
        request.get('/user/profile').set('Authorization', authorization).end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body.name).to.be.equal(profile.name);
            done();
        });
    });

    it('should not update the unverified alert phone number through profile update API', function (done) {
        var authorization = `Basic ${token}`;
        request.put('/user/profile').set('Authorization', authorization).send(profile).end(function (err, res) {
            expect(res.body._id).to.be.equal(userId);
            expect(res.body.alertPhoneNumber).not.to.be.equal(profile.alertPhoneNumber);
            expect(res.body.alertPhoneNumber).to.be.equal('');
            done();
        });
    });
});