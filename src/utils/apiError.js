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
      return `Trop de requetes vers l'API. Reessaie dans ${retryAfter}s.`;
    }

    return "Trop de requetes vers l'API. Patiente quelques secondes puis reessaie.";
  }

  if (status === 402 || isQuotaError) {
    return 'Quota API atteint. Reessaie plus tard ou utilise une cle API avec plus de credits.';
  }

  if (status === 401 || (status === 403 && isApiKeyError)) {
    return 'Cle API invalide ou manquante. Verifie VITE_SPOONACULAR_API_KEY.';
  }

  if (status >= 500) {
    return 'Le service Spoonacular est indisponible pour le moment. Reessaie plus tard.';
  }

  if (!error?.response && error?.request) {
    return "Impossible de contacter l'API. Verifie ta connexion Internet.";
  }

  if (apiMessage) {
    return apiMessage;
  }

  return fallbackMessage;
};
