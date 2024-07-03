import { BaseResponse, HttpClient, Params, PostParams } from './types'

export const headers = {
  'Content-Type': 'application/json',
}

class FetchClient implements HttpClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  static getDataParsed<R>(r: BaseResponse<R>): BaseResponse<R> {
    return {
      ...(r || {}),
      isSuccessful: true,
    }
  }

  static getErrorResponse<R>(r: BaseResponse<R>): BaseResponse<R> {
    return {
      ...(r || {}),
      isSuccessful: false,
    }
  }

  private async requestMakeHelper<R>(
    url: string,
    options?: RequestInit
  ): Promise<BaseResponse<R>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Http error:${response.status}`)
      }

      const data = await response.json()
      return FetchClient.getDataParsed(data)
    } catch (error: any) {
      return FetchClient.getErrorResponse(error)
    }
  }

  async get<R>(params: Params): Promise<BaseResponse<R>> {
    const url = new URL(params.url, this.baseUrl)
    url.search = new URLSearchParams(params.query).toString()
    const options: RequestInit = {
      method: 'GET',
      ...params.options,
    }

    return this.requestMakeHelper<R>(url.toString(), options)
  }
  async post<T, R>(params: PostParams<T>): Promise<BaseResponse<R>> {
    const url = new URL(params.url, this.baseUrl)
    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify(params.data),
      ...params.options,
    }

    return this.requestMakeHelper<R>(url.toString(), options)
  }
  async put<T, R>(params: PostParams<T>): Promise<BaseResponse<R>> {
    const url = new URL(params.url, this.baseUrl)
    const options: RequestInit = {
      method: 'PUT',
      body: JSON.stringify(params.data),
      ...params.options,
    }

    return this.requestMakeHelper<R>(url.toString(), options)
  }
  async delete<T, R>(params: PostParams<T>): Promise<BaseResponse<R>> {
    const url = new URL(params.url, this.baseUrl)
    const options: RequestInit = {
      method: 'DELETE',
      body: JSON.stringify(params.data),
      ...params.options,
    }

    return this.requestMakeHelper<R>(url.toString(), options)
  }
}

export const fetchClient = new FetchClient(
  'https://jsonplaceholder.typicode.com'
)
