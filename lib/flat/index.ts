import flatAxios from "./flatAxios";

export async function createScore(data: any) {
  try {
    const response = await flatAxios.post("/scores", data);
    return { data: response.data, error: null };
  } catch (error: any) {
    console.warn("Create Score Error:", error.response?.data || error.message);
    return {
      data: null,
      error: error.response?.data?.message || "Failed to create score",
    };
  }
}

export async function updateScore(scoreId: string, data: any) {
  try {
    const response = await flatAxios.put(`/scores/${scoreId}`, data);
    return { data: response.data, error: null };
  } catch (error: any) {
    console.warn("Update Score Error:", error.response?.data || error.message);
    return {
      data: null,
      error: error.response?.data?.message || "Failed to update score",
    };
  }
}
