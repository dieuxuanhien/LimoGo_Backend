import { fetchUtils } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  
  // Add auth token to every request
  const token = localStorage.getItem('auth');
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetchUtils.fetchJson(url, options);
};

// Create custom data provider that maps to your API structure
const apiUrl = '/api';
const normalizeData = (data) => {
  if (!data) return null;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item));
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const normalized = { ...data };
    
    // Map _id to id if present
    if (normalized._id && !normalized.id) {
      normalized.id = normalized._id;
    }
    
    // Process nested objects/arrays
    Object.keys(normalized).forEach(key => {
      if (typeof normalized[key] === 'object' && normalized[key] !== null) {
        normalized[key] = normalizeData(normalized[key]);
      }
    });
    
    return normalized;
  }
  
  return data;
};
// Create a wrapper around the simpleRestProvider to handle your specific API responses
const dataProvider = {
  ...simpleRestProvider(apiUrl, httpClient),
  
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    
    const query = {
      page,
      limit: perPage,
      sort: `${order === 'ASC' ? '' : '-'}${field}`,
      ...params.filter
    };
    
    const url = `${apiUrl}/${resource}?${fetchUtils.queryParameters(query)}`;
    return httpClient(url).then(({ json }) => {
    // Handle different response formats from your API
    const data = json.data || json;
    const total = json.totalCount || (Array.isArray(data) ? data.length : 0);
    
    return {
      data: normalizeData(Array.isArray(data) ? data : [data]),
      total
    };
  });
  },

  getOne: (resource, params) => {
  return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => {
    // Handle response format: { data: {...} } or just the object
    const record = json.data || json;
    return {
      data: normalizeData(record)
    };
  });
},
getMany: (resource, params) => {
  const url = `${apiUrl}/${resource}?ids=${params.ids.join(',')}`;
  return httpClient(url).then(({ json }) => {
    // json.data should be an array
    const data = Array.isArray(json.data) ? json.data : [];
    return { data: normalizeData(data) };
  });
},
  
  create: (resource, params) => {
    return httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => {
      const record = json.data || json;
      return {
        data: {
          ...record,
          id: record._id || record.id
        }
      };
    });
  },
  
  update: (resource, params) => {
  return httpClient(`${apiUrl}/${resource}/${params.id}`, {
    method: 'PATCH', // Changed from PUT to PATCH
    body: JSON.stringify(params.data),
  }).then(({ json }) => {
    const record = json.data || json;
    return {
      data: {
        ...record,
        id: record._id || record.id
      }
    };
  });
},

  delete: (resource, params) => {
    return httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({
      data: { id: params.id }
    }));
  }
};

export default dataProvider;