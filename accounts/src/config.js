import React from 'react';
import isEmail from 'sane-email-validation';
import validUrl from 'valid-url';
import valid from 'card-validator';
import { isServer } from './store';
import FileSaver from 'file-saver';
import { emaildomains } from './constants/emaildomains';

let apiUrl = 'http://localhost:3002';
let dashboardUrl = null;
let domain = null;
let adminDashboardUrl = null;
let developmentEnv = false;

export function env(value) {
    const { _env } = window;
    return (_env && _env[`REACT_APP_${value}`]) || process.env[`REACT_APP_${value}`];
}

if (!isServer) {
    if (window.location.href.indexOf('localhost') > -1) {
        apiUrl = 'http://localhost:3002';
        dashboardUrl = 'http://localhost:3000';
        domain = 'localhost';
        adminDashboardUrl = 'http://localhost:3100';
        developmentEnv = true;
    }
    else if (env('BACKEND_HOST')) {
        apiUrl = env('BACKEND_HOST');
        dashboardUrl = env('DASHBOARD_HOST');
        domain = env('DOMAIN');
        if (apiUrl.indexOf('staging')  > -1 || apiUrl.indexOf('app.local') > -1) {
            developmentEnv = true;
        }
    }
}


export const API_URL = apiUrl;

export const DASHBOARD_URL = dashboardUrl;

export const DOMAIN_URL = domain;

export const ADMIN_DASHBOARD_URL = adminDashboardUrl;

export const IS_DEV = developmentEnv;

export const User = {

    getAccessToken() {
        return localStorage.getItem('access_token');
    },

    setAccessToken(token) {
        localStorage.setItem('access_token', token);
    },

    isCardRegistered() {
        return localStorage.getItem('cardRegistered');
    },

    setCardRegistered(value) {
        localStorage.setItem('cardRegistered', value);
    },

    setUserId(id) {
        localStorage.setItem('id', id);
    },

    getUserId() {
        return localStorage.getItem('id');
    },

    getName() {
        return localStorage.getItem('name');
    },

    setName(name) {
        localStorage.setItem('name', name);
    },

    getEmail() {
        return localStorage.getItem('email');
    },

    setEmail(email) {
        localStorage.setItem('email', email);
    },
    initialUrl() {
        return sessionStorage.getItem('initialUrl');
    },
    setProject(project) {
        localStorage.setItem('project', project);
    },

    getProject() {
        return localStorage.getItem('project');
    },

    clear() {
        localStorage.clear();
    },

    removeUserId() {
        localStorage.removeItem('id');
    },

    removeAccessToken() {
        localStorage.removeItem('token');
    },

    isLoggedIn() {
        return localStorage.getItem('access_token') ? true : false;
    }

};

//Data validation Util goes in here.
export const Validate = {

    isDomain(domain) {
        return (domain.search(/\./) >= 0);
    },

    url(url) {
        return validUrl.isUri(url);
    },

    text(text) {

        if (!text || text.trim() === '') {
            return false;
        }

        return true;
    },

    number(number) {

        if (number && number.length && !isNaN(number)) {
            return true;
        }
        else {
            return false;
        }
    },

    isValidNumber(number) {
        // eslint-disable-next-line
        if(number.match('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')) {
            return true;
        }
        return false;
    },

    isStrongPassword(password) {
        if(password.match('^(?=.{8,})')) { 
            return true;
        }
        return false;
    },

    email(email) {
        if (this.text(email))
            return isEmail(email);
        return false;
    },

    isValidBusinessEmail(email){
        return emaildomains.test(email);
    },

    compare(text1, text2) {
        return text1 === text2;
    },

    card(cardNumber) {
        const numberValidation = valid.number(cardNumber);

        if (!numberValidation.isPotentiallyValid) {
            return false;
        }

        return true;
    },

    cardExpiration(expiry) {
        const numberValidation = valid.expirationDate(expiry);

        if (!numberValidation.isPotentiallyValid) {
            return false;
        }

        return true;
    },

    cvv(cvv) {
        const numberValidation = valid.cvv(cvv);

        if (!numberValidation.isPotentiallyValid) {
            return false;
        }

        return true;
    },

    postalCode(postalCode) {
        const numberValidation = valid.postalCode(postalCode);

        if (!numberValidation.isPotentiallyValid) {
            return false;
        }

        return true;
    },

    isValidName(name) { 
        // eslint-disable-next-line
        if(name.match('[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{1,20}$')) {
            return true
        }
        return false;
    }
}

export const PricingPlan = {

    getPlans() {

        if (window.location.href.indexOf('localhost') > -1 ||  window.location.href.indexOf('staging') > -1 || window.location.href.indexOf('app.local') > -1) {
            return [
                {
                    category: 'Basic',
                    planId: 'plan_EgTJMZULfh6THW',
                    type: 'month',
                    amount: 8,
                    details: '$8 / Month / User'
                },
                {
                    category: 'Basic',
                    planId: 'plan_EgTQAx3Z909Dne',
                    type: 'annual',
                    amount: 80.4,
                    details: '$80.4 / Year / User'
                },
               /* {
                    category: 'Pro',
                    planId: 'plan_CpIZEEfT4YFSvF',
                    type: 'month',
                    amount: 49,
                    details: '$49 / Month'
                },
                {
                    category: 'Pro',
                    planId: 'plan_CpIZTQWQiIr6rY',
                    type: 'annual',
                    amount: 708,
                    details: '$708 / Year'
                },
                {
                    category: 'Pro Plus',
                    planId: 'plan_CpIatF9qAmeZLP',
                    type: 'month',
                    amount: 99,
                    details: '$99 / Month'
                },
                {
                    category: 'Pro Plus',
                    planId: 'plan_CpIbtqozj1UVGs',
                    type: 'annual',
                    amount: 1180,
                    details: '$1180 / Year'
                } */
            ]
        } else {
            return [
                {
                    category: 'Basic',
                    planId: 'plan_EgT8cUrwsxaqCs',
                    type: 'month',
                    amount: 8,
                    details: '$8 / Month / User'
                },
                {
                    category: 'Basic',
                    planId: 'plan_EgT9hrq9GdIGQ6',
                    type: 'annual',
                    amount: 80.4,
                    details: '$80.4 / Year / User'
                },
               /* {
                    category: 'Pro',
                    planId: 'plan_CogeidQkPwkycV',
                    type: 'month',
                    amount: 49,
                    details: '$49 / Month'
                },
                {
                    category: 'Pro',
                    planId: 'plan_CogfwRVpqoOLO6',
                    type: 'annual',
                    amount: 708,
                    details: '$708 / Year'
                },
                {
                    category: 'Pro Plus',
                    planId: 'prod_Cogffh2xpitVg6',
                    type: 'month',
                    amount: 99,
                    details: '$99 / Month'
                },
                {
                    category: 'Pro Plus',
                    planId: 'plan_CoggNmls8dUpDy',
                    type: 'annual',
                    amount: 1180,
                    details: '$1180 / Year'
                }*/
            ]
        }
    },

    getPlanById(id) {
        const plans = this.getPlans();
        if (id) return plans.find(plan => plan.planId === id);
        else return plans[0];
    },
}

export const tutorials = {

    getMonitorTutorials() {
        return [
            {
                id: 's1',
                title: 'What are Monitors',
                icon: 'bell',
                description: <p>You can add web and API server address to
                    to monitor.<br />It allows you monitor the health status of
                    your API</p>,
            },
            {
                id: 's2',
                title: 'What are Incidents',
                icon: 'bell',
                description: <p>You can use this feature to acknowledge an incident
                                that occurred on a monitor<br /> and mark the
                    incident as resolved after resolving the
                                issue on your api or server</p>,
            },
            {
                id: 's3',
                title: 'Acknowledge/Resolve Incidents',
                icon: 'bell',
                description: <p>You can use this feature to acknowledge an incident
                                that occurred on a monitor<br /> and mark the
                    incident as resolved after resolving the
                                issue on your api or server</p>,
            },
            {
                id: 's4',
                title: 'Status Metrics',
                icon: 'bell',
                description: <p>Get detailed metrics of all incidents that occurred <br />
                    on connected monitors and with date and time it was resolved
                                </p>,
            },
            {
                id: 's5',
                title: 'Better Status Handling',
                icon: 'bell',
                description: <p>After adding monitors for your API, you won&apos;t miss out on any<br />
                    downtime on your servers, Just let Fyipe alert notify you
                                </p>,
            },
        ]
    }
}

export function getQueryVar(variable, url) {
    if (!url) return null;
    variable = variable.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + variable + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function saveFile(content, filename){
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, filename);
}