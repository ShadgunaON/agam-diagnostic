export interface MediaUploadInput {
  fileName: string;
  contentType: string;
  fileSize: number;
  category?: string;
}

export interface MediaUploadResponse {
  uploadUrl: string;
  fileKey: string;
}

export class MediaService {
  private static async _graphqlFetch<T>(
    query: string,
    variables?: Record<string, unknown>,
    useApiKey = false
  ): Promise<T> {
    const isServer = typeof window === 'undefined';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const apiKey =
      process.env.APPSYNC_API_KEY ||
      process.env.NEXT_PUBLIC_APPSYNC_API_KEY ||
      'da2-wyfofmw3ffgwrgdo5kyajft5yy';

    if (isServer) {
      headers['x-api-key'] = apiKey;
    } else {
      const token =
        sessionStorage.getItem('cognito_id_token') ||
        localStorage.getItem('cognito_id_token') ||
        '';

      if (!useApiKey && token) {
        headers['Authorization'] = token;
      } else {
        headers['x-api-key'] = apiKey;
      }
    }

    const url = isServer
      ? (process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://n7u3fofbfrddtbyswpxfntxrvq.appsync-api.us-east-1.amazonaws.com/graphql')
      : '/api/graphql';

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
    });

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message);
    }
    return json.data as T;
  }

  static async initiateUpload(input: MediaUploadInput): Promise<MediaUploadResponse> {
    const data = await this._graphqlFetch<{ initiateMediaUpload: MediaUploadResponse }>(
      `mutation InitiateMediaUpload($input: MediaUploadInput!) {
        initiateMediaUpload(input: $input) {
          uploadUrl
          fileKey
        }
      }`,
      { input }
    );
    return data.initiateMediaUpload;
  }

  static async getDownloadUrl(key: string): Promise<string> {
    const data = await this._graphqlFetch<{ mediaDownloadUrl: string }>(
      `query MediaDownloadUrl($key: String!) {
        mediaDownloadUrl(key: $key)
      }`,
      { key }
    );
    return data.mediaDownloadUrl;
  }
}
