import axios from "axios";

const API_BASE_URL = "https://1confirmed.com/api/v1";
const confirmedToken = process.env.CONFIRMED_TOKEN;

// Helper to format phone number
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "");

  // // Add country code if not present
  // if (!digits.startsWith('+212')) {
  //   return `+212${digits}`;
  // }
  return digits;
};

export const sendMessage1Confirmed = async (payload) => {
  // Validate required fields
  if (!payload.template_account_flow_id) {
    throw new Error("template_account_flow_id is required");
  }

  if (!payload.data || typeof payload.data !== "object") {
    throw new Error("data object with template variables is required");
  }

  if (!payload.phone) {
    throw new Error("recipient phone number (to) is required");
  }

  // Format the payload
  const formattedPayload = {
    ...payload,
    phone: formatPhoneNumber(payload.phone),
    template_account_flow_id: parseInt(payload.template_account_flow_id),
    language_id: parseInt(payload.language_id || 1), // default to language ID 1 if not specified
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/messages`,
      formattedPayload,
      {
        headers: {
          Authorization: `Bearer ${confirmedToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("Empty response from 1Confirmed API");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const apiError = error.response.data;
      console.error("❌ 1Confirmed API Error:", JSON.stringify({
        status: error.response.status,
        data: apiError,
        requestPayload: formattedPayload,
      }, null, 2));

      if (error.response.status === 401) {
        throw new Error("Invalid or expired 1Confirmed API token");
      }

      if (error.response.status === 400) {
        const errorMessage =
          apiError.message || apiError.error || "Bad request format";
        throw new Error(`Invalid request: ${errorMessage}`);
      }

      throw new Error(
        `1Confirmed API error: ${apiError.message || "Unknown error"}`
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ No response from 1Confirmed API:", error.request);
      throw new Error("No response from 1Confirmed API - please try again");
    } else {
      // Something happened in setting up the request
      console.error("❌ Error setting up 1Confirmed request:", error.message);
      throw new Error("Failed to send request to 1Confirmed");
    }
  }
};

export const fetchTemplates1Confirmed = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/templates`, {
      params: {
        language_id: 1,
        is_broadcast: 0,
      },
      headers: {
        Authorization: `Bearer ${confirmedToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Erreur chargement templates 1Confirmed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
