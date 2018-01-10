import { queryParameters, fetchJson } from './Fetch';
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE
} from 'admin-on-rest/lib/rest/types';

export const FUNCTION = 'FUNCTION';
export const UPLOAD_FILE = 'UPLOAD_FILE';

export default (parseConfig, httpClient = fetchJson) => {
    /**
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} { url, options } The HTTP request parameters
     */
    const convertRESTRequestToHTTP = (type, resource, params) => {
        let url = '';

        // const token = localStorage.getItem('parseToken')

        let options = {};
        options.headers = new Headers({
            Accept: 'application/json',
            Authorization: 'bearer ' + localStorage.getItem('token')
        });
        parseConfig['GROUP'] &&
            options.headers.set('X-DOSTOW-GROUP', parseConfig['GROUP']);
        parseConfig['KEY'] &&
            options.headers.set(
                'X-DOSTOW-GROUP-ACCESS-KEY',
                parseConfig['KEY']
            );
        parseConfig['AUTH'] &&
            options.headers.set('Authorization', parseConfig['AUTH']);
        switch (type) {
            case UPLOAD_FILE: {
                url = `${parseConfig.URL}/upload/${resource}/${params.id}/${
                    params.field
                }`;
                const file = params.files[0];
                var body = new FormData();
                body.append(params.field, file.raw);
                options.method = 'PUT';
                options.body = body;
                break;
            }
            case GET_LIST: {
                const page =
                    params.pagination && params.pagination.page != null
                        ? params.pagination.page
                        : 1;
                const perPage =
                    params.pagination && params.pagination.perPage != null
                        ? params.pagination.perPage
                        : 10;
                // const field = (params.sort && params.sort.field != null) ? params.sort.field : "created_at";
                // const order = (params.sort && params.sort.order != null) ? params.sort.order : "ASC";
                const filter = params.filter || null; //(params.filter != null) ? filterQuery(params.filter) : null;
                const include =
                    params.include != null
                        ? params.include.replace(/\s/g, '')
                        : null;
                const query = {
                    size: perPage,
                    // order: (order === "DESC" ? "-" + field : field),
                    // limit: perPage,
                    skip: (page - 1) * perPage
                };
                if (include != null) {
                    query.include = include;
                }
                if (filter != null) {
                    query.where = filter;
                }
                url = `${parseConfig.URL}/store/${resource}?${queryParameters(
                    query
                )}`;
                break;
            }
            case GET_ONE:
                url = `${parseConfig.URL}/store/${resource}/${params.id}`;
                break;
            case GET_MANY: {
                url = `${
                    parseConfig.URL
                }/store/${resource}?hash=${params.ids.join('|')}`;
                break;
            }
            case GET_MANY_REFERENCE: {
                const page =
                    params.pagination && params.pagination.page != null
                        ? params.pagination.page
                        : 10;
                const perPage =
                    params.pagination && params.pagination.perPage != null
                        ? params.pagination.perPage
                        : 10;
                // const field = (params.sort && params.sort.field != null) ? params.sort.field : "created_at";
                // const order = (params.sort && params.sort.order != null) ? params.sort.order : "ASC";
                const query = {
                    // order: (order === "DESC" ? "-" + field : field),
                    size: perPage,
                    skip: (page - 1) * perPage
                    // where: JSON.stringify({ [params.target]: params.id }),
                };
                url = `${parseConfig.URL}/store/${resource}?${queryParameters(
                    query
                )}`;
                break;
            }
            case UPDATE:
                url = `${parseConfig.URL}/store/${resource}/${params.id}`;
                options.method = 'PUT';
                options.headers.set('Content-Type', 'application/json');
                delete params.data.id;
                delete params.data.created_at;
                delete params.data.updated_at;
                options.body = JSON.stringify(params.data);
                break;
            case CREATE:
                url = `${parseConfig.URL}/store/${resource}`;
                options.headers.set('Content-Type', 'application/json');
                options.method = 'POST';
                options.body = JSON.stringify(params.data);
                break;
            case DELETE:
                url = `${parseConfig.URL}/store/${resource}/${params.id}`;
                options.method = 'DELETE';
                break;
            case FUNCTION:
                url = `${parseConfig.URL}/functions/${resource}`;
                options.method = 'POST';
                options.body = JSON.stringify(params.data);
                break;
            default:
                throw new Error(`Unsupported fetch action type ${type}`);
        }
        return { url, options };
    };

    /**
     * @param {Object} response HTTP response from fetch()
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} REST response
     */
    const convertHTTPResponseToREST = (response, type, resource, params) => {
        const { json } = response;
        switch (type) {
            case GET_LIST:
            case GET_MANY_REFERENCE:
                return {
                    data: json.data.map(x => ({ ...x })),
                    total: json.total_count
                };
            case CREATE:
            case GET_ONE:
            case UPDATE:
            case DELETE:
                return {
                    data: { ...json }
                };
            case GET_MANY:
                return {
                    data: json.data.map(x => ({ ...x }))
                };
            default:
                return json;
        }
    };

    /**
     * @param {string} type Request type, e.g GET_LIST
     * @param {string} resource Resource name, e.g. "posts"
     * @param {Object} payload Request parameters. Depends on the request type
     * @returns {Promise} the Promise for a REST response
     */
    return (type, resource, params) => {
        const { url, options } = convertRESTRequestToHTTP(
            type,
            resource,
            params
        );
        return fetchJson(url, options).then(response =>
            convertHTTPResponseToREST(response, type, resource, params)
        );
    };
};
