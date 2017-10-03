import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK, AUTH_ERROR } from 'admin-on-rest';
import { fetchJson } from '../Fetch';

export default (config) => {
    let options = {};
    options.headers = new Headers({ Accept: 'application/json', 'content-type': 'application/json' });
    config['GROUP'] && options.headers.set('X-DOSTOW-GROUP', config['GROUP']);
    config['KEY'] && options.headers.set('X-DOSTOW-GROUP-ACCESS-KEY', config['KEY']);
    const url = config.URL

    return (type, params) => {
        if (type === AUTH_LOGIN) {
            const { username, password } = params;
            // accept all username/password combinations
            return fetchJson(`${url}/auth/sign_in`, {
                ...options,
                method: 'POST',
                body: JSON.stringify({ username: `${username}`, password })
            })
                .then(({ json: { data, token } }) => {
                    localStorage.setItem('token', token)
                    localStorage.setItem('user', JSON.stringify(data))
                })
        }
        if (type === AUTH_LOGOUT) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return Promise.resolve();
        }
        if (type === AUTH_ERROR) {
            return Promise.resolve();
        }
        if (type === AUTH_CHECK) {
            return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
        }
        return Promise.reject('Unkown method');
    };
}