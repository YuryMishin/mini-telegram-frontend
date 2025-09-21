import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../environment';
import {
  // Auth types
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,

  // User types
  User,
  CurrentUser,
  PublicUser,

  // Dialog types
  Dialog,
  CreateDialogRequest,

  // Message types
  Message,
  SendMessageRequest,
  EditMessageRequest,

  // File types
  FileUploadResponse,

  // Search types
  SearchRequest,
  SearchResult,

  // Utility types
  PaginatedResponse,
  ApiResponse,
  ApiError,
  Pagination,

  // Schemas for validation
  AuthResponseSchema,
  CurrentUserSchema,
  DialogSchema,
  MessageSchema,
  FileUploadResponseSchema,
  SearchResultSchema,
  RefreshTokenResponseSchema,
  PaginatedResponseSchema,
  ApiResponseSchema,
  ApiErrorSchema,
} from './types';

export interface RequestOptions {
  headers?: HttpHeaders | { [key: string]: string | string[] };
  params?: HttpParams | { [key: string]: string | number | boolean };
  withCredentials?: boolean;
  reportProgress?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // ========================
  // Private Helper Methods
  // ========================

  private buildUrl(endpoint: string): string {
    return `${this.apiUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  private handleApiResponse<T>(schema: any) {
    return map((response: any) => {
      try {
        const validatedResponse = ApiResponseSchema(schema).parse(response);
        if (!validatedResponse.success) {
          throw new Error('API returned success: false');
        }
        return validatedResponse.data;
      } catch (error) {
        console.error('API response validation error:', error, response);
        throw error;
      }
    });
  }

  private handlePaginatedResponse<T>(itemSchema: any) {
    return map((response: any) => {
      try {
        return PaginatedResponseSchema(itemSchema).parse(response);
      } catch (error) {
        console.error('Paginated response validation error:', error, response);
        throw error;
      }
    });
  }

  private handleError = (error: any) => {
    try {
      const apiError = ApiErrorSchema.parse(error.error);
      return throwError(() => apiError);
    } catch {
      // Fallback for non-API errors
      const fallbackError: ApiError = {
        success: false,
        error: {
          code: error.status?.toString() || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          details: { originalError: error }
        },
        timestamp: new Date().toISOString(),
      };
      return throwError(() => fallbackError);
    }
  };

  // ========================
  // Authentication API
  // ========================

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post(this.buildUrl('/auth/login'), data)
      .pipe(
        this.handleApiResponse(AuthResponseSchema),
        catchError(this.handleError)
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post(this.buildUrl('/auth/register'), data)
      .pipe(
        this.handleApiResponse(AuthResponseSchema),
        catchError(this.handleError)
      );
  }

  refreshToken(data: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post(this.buildUrl('/auth/refresh'), data)
      .pipe(
        this.handleApiResponse(RefreshTokenResponseSchema),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(this.buildUrl('/auth/logout'), {})
      .pipe(catchError(this.handleError));
  }

  // ========================
  // User API
  // ========================

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get(this.buildUrl('/users/me'))
      .pipe(
        this.handleApiResponse(CurrentUserSchema),
        catchError(this.handleError)
      );
  }

  updateCurrentUser(data: Partial<CurrentUser>): Observable<CurrentUser> {
    return this.http.patch(this.buildUrl('/users/me'), data)
      .pipe(
        this.handleApiResponse(CurrentUserSchema),
        catchError(this.handleError)
      );
  }

  getUserById(userId: string): Observable<PublicUser> {
    return this.http.get(this.buildUrl(`/users/${userId}`))
      .pipe(
        this.handleApiResponse(DialogSchema),
        catchError(this.handleError)
      );
  }

  searchUsers(query: string, limit = 20): Observable<PublicUser[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get(this.buildUrl('/users/search'), { params })
      .pipe(
        map((response: any) => response.data || response),
        catchError(this.handleError)
      );
  }

  // ========================
  // Dialog API
  // ========================

  getDialogs(pagination?: Partial<Pagination>): Observable<PaginatedResponse<Dialog>> {
    let params = new HttpParams();

    if (pagination?.limit) params = params.set('limit', pagination.limit.toString());
    if (pagination?.offset) params = params.set('offset', pagination.offset.toString());
    if (pagination?.after) params = params.set('after', pagination.after);

    return this.http.get(this.buildUrl('/dialogs'), { params })
      .pipe(
        this.handlePaginatedResponse(DialogSchema),
        catchError(this.handleError)
      );
  }

  createDialog(data: CreateDialogRequest): Observable<Dialog> {
    return this.http.post(this.buildUrl('/dialogs'), data)
      .pipe(
        this.handleApiResponse(DialogSchema),
        catchError(this.handleError)
      );
  }

  getDialogById(dialogId: string): Observable<Dialog> {
    return this.http.get(this.buildUrl(`/dialogs/${dialogId}`))
      .pipe(
        this.handleApiResponse(DialogSchema),
        catchError(this.handleError)
      );
  }

  updateDialog(dialogId: string, data: Partial<Dialog>): Observable<Dialog> {
    return this.http.patch(this.buildUrl(`/dialogs/${dialogId}`), data)
      .pipe(
        this.handleApiResponse(DialogSchema),
        catchError(this.handleError)
      );
  }

  deleteDialog(dialogId: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`/dialogs/${dialogId}`))
      .pipe(catchError(this.handleError));
  }

  leaveDialog(dialogId: string): Observable<void> {
    return this.http.post<void>(this.buildUrl(`/dialogs/${dialogId}/leave`), {})
      .pipe(catchError(this.handleError));
  }

  // ========================
  // Message API
  // ========================

  getMessages(
    dialogId: string,
    pagination?: Partial<Pagination>
  ): Observable<PaginatedResponse<Message>> {
    let params = new HttpParams();

    if (pagination?.limit) params = params.set('limit', pagination.limit.toString());
    if (pagination?.offset) params = params.set('offset', pagination.offset.toString());
    if (pagination?.after) params = params.set('after', pagination.after);
    if (pagination?.before) params = params.set('before', pagination.before);

    return this.http.get(this.buildUrl(`/dialogs/${dialogId}/messages`), { params })
      .pipe(
        this.handlePaginatedResponse(MessageSchema),
        catchError(this.handleError)
      );
  }

  sendMessage(data: SendMessageRequest): Observable<Message> {
    const { dialogId, ...messageData } = data;
    return this.http.post(this.buildUrl(`/dialogs/${dialogId}/messages`), messageData)
      .pipe(
        this.handleApiResponse(MessageSchema),
        catchError(this.handleError)
      );
  }

  editMessage(messageId: string, data: EditMessageRequest): Observable<Message> {
    return this.http.patch(this.buildUrl(`/messages/${messageId}`), data)
      .pipe(
        this.handleApiResponse(MessageSchema),
        catchError(this.handleError)
      );
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`/messages/${messageId}`))
      .pipe(catchError(this.handleError));
  }

  markMessagesAsRead(dialogId: string, messageIds: string[]): Observable<void> {
    return this.http.post<void>(
      this.buildUrl(`/dialogs/${dialogId}/messages/read`),
      { messageIds }
    ).pipe(catchError(this.handleError));
  }

  pinMessage(messageId: string): Observable<Message> {
    return this.http.post(this.buildUrl(`/messages/${messageId}/pin`), {})
      .pipe(
        this.handleApiResponse(MessageSchema),
        catchError(this.handleError)
      );
  }

  unpinMessage(messageId: string): Observable<Message> {
    return this.http.delete(this.buildUrl(`/messages/${messageId}/pin`))
      .pipe(
        this.handleApiResponse(MessageSchema),
        catchError(this.handleError)
      );
  }

  forwardMessage(messageId: string, targetDialogIds: string[]): Observable<Message[]> {
    return this.http.post(this.buildUrl(`/messages/${messageId}/forward`), {
      targetDialogIds
    }).pipe(
      map((response: any) => response.data || response),
      catchError(this.handleError)
    );
  }

  // ========================
  // File Upload API
  // ========================

  uploadFile(file: File, type: 'image' | 'file' | 'voice' | 'video' = 'file'): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post(this.buildUrl('/files/upload'), formData, {
      reportProgress: true,
    }).pipe(
      this.handleApiResponse(FileUploadResponseSchema),
      catchError(this.handleError)
    );
  }

  uploadMultipleFiles(files: File[]): Observable<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.http.post(this.buildUrl('/files/upload-multiple'), formData)
      .pipe(
        map((response: any) => response.data || response),
        catchError(this.handleError)
      );
  }

  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`/files/${fileId}`))
      .pipe(catchError(this.handleError));
  }

  // ========================
  // Search API
  // ========================

  search(request: SearchRequest): Observable<SearchResult> {
    const params = new HttpParams()
      .set('q', request.query)
      .set('type', request.type)
      .set('limit', request.limit.toString())
      .set('offset', request.offset.toString());

    const finalParams = request.dialogId
      ? params.set('dialogId', request.dialogId)
      : params;

    return this.http.get(this.buildUrl('/search'), { params: finalParams })
      .pipe(
        this.handleApiResponse(SearchResultSchema),
        catchError(this.handleError)
      );
  }

  // ========================
  // Utility Methods
  // ========================

  healthCheck(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(
      this.buildUrl('/health')
    ).pipe(catchError(this.handleError));
  }

  getServerInfo(): Observable<{
    version: string;
    features: string[];
    limits: {
      maxFileSize: number;
      maxMessageLength: number;
      maxGroupSize: number;
    };
  }> {
    return this.http.get(this.buildUrl('/info'))
      .pipe(catchError(this.handleError));
  }
}
