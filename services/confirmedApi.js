import axios from "axios";

const API_BASE_URL = "https://1confirmed.com/api/v1";
const confirmedToken = process.env.CONFIRMED_TOKEN;

export const fetchCredits1Confirmed = async () => {
  try {
    const response = await axios.get("https://1confirmed.com/api/v1/credits", {
      headers: {
        Authorization: `Bearer ${confirmedToken}`,
        Accept: "application/json",
      },
    });
   console.log(response.data.data);
   
    return response.data; 
  } catch (error) {
    console.error(
      "Erreur récupération crédits 1Confirmed:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch credits from 1Confirmed");
  }
};

const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, "");
  // console.log({digits});
  

  // if (!digits.startsWith('+212')) {
  //   if (digits.startsWith('0')) {
  //     // Remove leading zero
  //     return `+212${digits.slice(1)}`;
  //   }
  //   return `+212${digits}`;
  // }
  return digits;
};


export const sendMessage1Confirmed = async (payload) => {
  if (!payload.template_account_flow_id) {
    throw new Error("template_account_flow_id is required");
  }

  if (!payload.data || typeof payload.data !== "object") {
    throw new Error("data object with template variables is required");
  }

  if (!payload.phone) {
    throw new Error("recipient phone number (to) is required");
  }
console.log({phoneNumber :formatPhoneNumber(payload.phone)})
  const formattedPayload = {
    ...payload,
    phone: formatPhoneNumber(payload.phone),
    template_account_flow_id: parseInt(payload.template_account_flow_id),
    language_id: parseInt(payload.language_id || 1), 
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
    
      const apiError = error.response.data;
      console.error(
        "❌ 1Confirmed API Error:",
        JSON.stringify(
          {
            status: error.response.status,
            data: apiError,
            requestPayload: formattedPayload,
          },
          null,
          2
        )
      );

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
      console.error("❌ No response from 1Confirmed API:", error.request);
      throw new Error("No response from 1Confirmed API - please try again");
    } else {
      console.error("❌ Error setting up 1Confirmed request:", error.message);
      throw new Error("Failed to send request to 1Confirmed");
    }
  }
};

export const fetchTemplates1Confirmed = async (languageId) => {
  try {
    console.log({languageId})
    const response = await axios.get(`${API_BASE_URL}/templates`, {
      params: {
        language_id: languageId,
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
