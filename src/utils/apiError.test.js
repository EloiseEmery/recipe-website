import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiError';

describe('getApiErrorMessage', () => {
  it('returns a dedicated message for rate limiting (429)', () => {
    const error = {
      response: {
        status: 429,
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      "Trop de requetes vers l'API. Patiente quelques secondes puis reessaie."
    );
  });

  it('includes retry-after value when present on rate limiting', () => {
    const error = {
      response: {
        status: 429,
        headers: {
          'retry-after': '30',
        },
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      "Trop de requetes vers l'API. Reessaie dans 30s."
    );
  });

  it('returns a dedicated message for quota errors (402)', () => {
    const error = {
      response: {
        status: 402,
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      'Quota API atteint. Reessaie plus tard ou utilise une cle API avec plus de credits.'
    );
  });

  it('returns a dedicated message for invalid api key (401)', () => {
    const error = {
      response: {
        status: 401,
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      'Cle API invalide ou manquante. Verifie VITE_SPOONACULAR_API_KEY.'
    );
  });

  it('returns a dedicated message for invalid api key hints on 403', () => {
    const error = {
      response: {
        status: 403,
        data: {
          message: 'Invalid API key.',
        },
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      'Cle API invalide ou manquante. Verifie VITE_SPOONACULAR_API_KEY.'
    );
  });

  it('returns a dedicated message for server errors', () => {
    const error = {
      response: {
        status: 500,
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      'Le service Spoonacular est indisponible pour le moment. Reessaie plus tard.'
    );
  });

  it('returns a dedicated message when quota hints are present in API response', () => {
    const error = {
      response: {
        status: 400,
        data: {
          error: 'Daily points exceeded.',
        },
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      'Quota API atteint. Reessaie plus tard ou utilise une cle API avec plus de credits.'
    );
  });

  it('returns a dedicated message for network errors', () => {
    const error = {
      request: {},
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe(
      "Impossible de contacter l'API. Verifie ta connexion Internet."
    );
  });

  it('falls back to API-provided message when no custom mapping matches', () => {
    const error = {
      response: {
        status: 400,
        data: {
          message: 'Custom API message',
        },
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe('Custom API message');
  });

  it('returns API response string when available', () => {
    const error = {
      response: {
        status: 400,
        data: '  Text response message  ',
      },
    };

    expect(getApiErrorMessage(error, 'fallback')).toBe('Text response message');
  });

  it('returns fallback when no response message is available', () => {
    const error = new Error('unexpected');

    expect(getApiErrorMessage(error, 'fallback')).toBe('fallback');
  });
});
