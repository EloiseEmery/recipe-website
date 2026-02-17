const QUOTA_HINT_PATTERN = /(quota|limit|daily points|points|credit|exceeded)/i;
const API_KEY_HINT_PATTERN = /(api key|unauthorized|forbidden|invalid key)/i;

const getResponseMessage = (responseData) => {
  if (!responseData) {
    return '';
  }

  if (typeof responseData === 'string') {
    return responseData.trim();
  }

  if (typeof responseData?.message === 'string') {
    return responseData.message.trim();
  }

  if (typeof responseData?.error === 'string') {
    return responseData.error.trim();
  }

  return '';
};

/**
 * Convert axios/API errors into user-friendly messages.
 * @param {unknown} error - Error thrown by axios
 * @param {string} fallbackMessage - Fallback message if no specific mapping matches
 * @returns {string}
 */
export const getApiErrorMessage = (error, fallbackMessage) => {
  const status = error?.response?.status;
  const retryAfter = error?.response?.headers?.['retry-after'];
  const apiMessage = getResponseMessage(error?.response?.data);
  const apiMessageLower = apiMessage.toLowerCase();
  const isQuotaError = QUOTA_HINT_PATTERN.test(apiMessage);
  const isApiKeyError = API_KEY_HINT_PATTERN.test(apiMessageLower);

  if (status === 429) {
    if (retryAfter) {
      return `Too many requests to the API. Try again in ${retryAfter}s.`;
    }

    return "Too many requests to the API. Wait a few seconds then try again.";
  }

  if (status === 402 || isQuotaError) {
    return 'API quota reached. Try again later or use an API key with more credits.';
  }

  if (status === 401 || (status === 403 && isApiKeyError)) {
    return 'Invalid or missing API key. Check VITE_SPOONACULAR_API_KEY.';
  }

  if (status >= 500) {
    return 'Spoonacular service is currently unavailable. Try again later.';
  }

  if (!error?.response && error?.request) {
    return "Unable to contact API. Check your Internet connection.";
  }

  if (apiMessage) {
    return apiMessage;
  }

  return fallbackMessage;
};
