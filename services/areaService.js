import api from "./api";

export async function listAreas(params = {}) {
  try {
    console.log('🔄 Calling Areas API:', api.defaults.baseURL + '/areas');
    const { data } = await api.get("/areas", { params });
    console.log('✅ Areas API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in listAreas:', error.message);
    throw error;
  }
}

export async function getArea(id) {
  try {
    const { data } = await api.get(`/areas/${id}`);
    return data;
  } catch (error) {
    console.error('Error in getArea:', error);
    throw error;
  }
}

export async function createArea(areaData) {
  try {
    const { data } = await api.post("/areas", areaData);
    return data;
  } catch (error) {
    console.error('Error in createArea:', error);
    throw error;
  }
}

export async function updateArea(id, areaData) {
  try {
    const { data } = await api.put(`/areas/${id}`, areaData);
    return data;
  } catch (error) {
    console.error('Error in updateArea:', error);
    throw error;
  }
}

export async function deleteArea(id) {
  try {
    const { data } = await api.delete(`/areas/${id}`);
    return data;
  } catch (error) {
    console.error('Error in deleteArea:', error);
    throw error;
  }
}