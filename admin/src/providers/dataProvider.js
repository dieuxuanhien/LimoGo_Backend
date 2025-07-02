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
  
// Find the update method in your dataProvider and replace it with this:

update: (resource, params) => {
  // Special handling for resources with file uploads like vehicles
  if (params.data.image && params.data.image.rawFile) {
    // Handle file upload with FormData
    const formData = new FormData();
    
    // Add all non-file fields to formData
    Object.keys(params.data).forEach(key => {
      // Skip the file field and handle it separately
      if (key !== 'image' && params.data[key] !== undefined && params.data[key] !== null) {
        // Handle references (objects with ids)
        if (key === 'provider' || key === 'currentStation') {
          formData.append(key, params.data[key].id || params.data[key]);
        } else {
          formData.append(key, params.data[key]);
        }
      }
    });
    
    // Add the file
    formData.append('image', params.data.image.rawFile);

    return httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PATCH',
      body: formData, // No JSON.stringify for FormData
    }).then(({ json }) => ({
      data: normalizeData(json.data || json),
    }));
  }
  
  // Regular update without file
  const updateData = { ...params.data };
  
  // Fix status field to match backend expectations
  if (resource === 'vehicles' && updateData.status) {
    // Map the admin UI values to backend values if needed
    const statusMap = {
      'active': 'available',
      'inactive': 'inactive',
      'maintenance': 'maintenance'
    };
    
    if (statusMap[updateData.status]) {
      updateData.status = statusMap[updateData.status];
    }
  }
  
  // Remove fields we don't want to send
  delete updateData.id;
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Handle references - convert from id to _id format
  if (updateData.provider && typeof updateData.provider === 'object') {
    updateData.provider = updateData.provider.id || updateData.provider._id;
  }
  
  if (updateData.currentStation && typeof updateData.currentStation === 'object') {
    updateData.currentStation = updateData.currentStation.id || updateData.currentStation._id;
  }

  return httpClient(`${apiUrl}/${resource}/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  }).then(({ json }) => ({
    data: normalizeData(json.data || json),
  }));
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