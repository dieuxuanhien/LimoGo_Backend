import { fetchUtils } from 'react-admin';

const apiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    
    const token = localStorage.getItem('token');
    if (token) {
        options.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return fetchUtils.fetchJson(url, options);
};

const dataProvider = {
    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            ...params.filter,
            page: page,
            limit: perPage,
        };
        
        if (field) {
            query.sort = `${order === 'ASC' ? '' : '-'}${field}`;
        }
        
        const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;

        return httpClient(url).then(({ json }) => {
            // Handle different response formats
            let data, total;
            
            if (json.success && json.data) {
                data = Array.isArray(json.data) ? json.data : [json.data];
                total = json.totalCount || json.total || data.length;
            } else if (Array.isArray(json)) {
                data = json;
                total = json.length;
            } else {
                data = [];
                total = 0;
            }

            return {
                data: data.map(item => ({ ...item, id: item._id || item.id })),
                total: total,
            };
        });
    },

    getOne: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => {
            const data = json.success ? json.data : json;
            return {
                data: { ...data, id: data._id || data.id },
            };
        }),

    getMany: (resource, params) => {
        const query = {
            ids: params.ids,
        };
        const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
        return httpClient(url).then(({ json }) => {
            const data = json.success ? json.data : json;
            return {
                data: Array.isArray(data) ? data.map(item => ({ ...item, id: item._id || item.id })) : [],
            };
        });
    },

    update: (resource, params) => {
        const { id, ...data } = params.data;
        return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }).then(({ json }) => {
            const responseData = json.success ? json.data : json;
            return { data: { ...responseData, id: responseData._id || responseData.id } };
        });
    },

    create: (resource, params) => {
        const { id, ...data } = params.data;
        return httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(({ json }) => {
            const responseData = json.success ? json.data : json;
            return {
                data: { ...responseData, id: responseData._id || responseData.id },
            };
        });
    },

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => {
            const responseData = json.success ? json.data : json;
            return { data: { ...responseData, id: responseData._id || responseData.id } };
        }),

    deleteMany: (resource, params) => {
        return Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                })
            )
        ).then(responses => ({
            data: responses.map(({ json }, index) => {
                const responseData = json.success ? json.data : json;
                return responseData._id || responseData.id || params.ids[index];
            })
        }));
    }
};

export default dataProvider;