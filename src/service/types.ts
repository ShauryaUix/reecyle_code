export type BaseResponse<R = any> = {
  isSuccessful: boolean
  response: R
  status: string
  statusCode: number
  responseData: { [k: string]: string }
  message: string
}
export type Params = {
  url: string
  query?: Query
  options?: RequestInit
}
export type Data<D> = {
  data: D
}
export type PostParams<T> = Params & Data<T>
export interface HttpClient {
  get: <R>(params: Params) => Promise<BaseResponse<R>>
  post: <T, R>(params: PostParams<T>) => Promise<BaseResponse<R>>
  put: <T, R>(params: PostParams<T>) => Promise<BaseResponse<R>>
  delete: <T, R>(params: PostParams<T>) => Promise<BaseResponse<R>>
}
export type Query = { [k: string]: any }
