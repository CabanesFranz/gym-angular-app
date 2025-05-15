import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080'; // Spring Boot default port

  constructor(private http: HttpClient) { }

  /**
   * Generic GET request
   */
  // Cache for GET requests
  private cache: Map<string, Observable<any>> = new Map();
  private readonly CACHE_SIZE = 10; // Maximum number of cached endpoints
  
  /**
   * Enhanced GET request with caching, retry logic, and error handling
   */
  get<T>(endpoint: string, params?: any, useCache: boolean = true): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    // Create cache key from endpoint and params
    const cacheKey = this.createCacheKey(endpoint, httpParams);
    
    // Return cached response if available and cache is enabled
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Observable<T>;
    }
    
    // Create the request observable with retry and error handling
    const request = this.http.get<T>(`${this.apiUrl}${endpoint}`, { params: httpParams })
      .pipe(
        retry(1), // Retry failed requests once
        catchError(this.handleError),
        shareReplay(1) // Share the same response with multiple subscribers
      );
    
    // Cache the response if caching is enabled
    if (useCache) {
      // Manage cache size
      if (this.cache.size >= this.CACHE_SIZE) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(cacheKey, request);
    }
    
    return request;
  }
  
  /**
   * Create a unique cache key from endpoint and params
   */
  private createCacheKey(endpoint: string, params: HttpParams): string {
    return endpoint + (params.toString() ? '?' + params.toString() : '');
  }
  
  /**
   * Clear the entire cache or a specific endpoint
   */
  clearCache(endpoint?: string): void {
    if (endpoint) {
      const endpointStr = endpoint as string;
      // Clear specific endpoint cache entries
      this.cache.forEach((_, key) => {
        if (key.startsWith(endpointStr)) {
          this.cache.delete(key);
        }
      });
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }

  /**
   * Enhanced POST request with error handling
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        retry(1),
        catchError(this.handleError),
        // Clear related cache entries on successful POST
        // This ensures GET requests will fetch fresh data
        tap(() => this.clearCache(endpoint))
      );
  }

  /**
   * Enhanced PUT request with error handling
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        retry(1),
        catchError(this.handleError),
        // Clear related cache entries on successful PUT
        tap(() => {
          const resourceType = endpoint.split('/')[1];
          if (resourceType) this.clearCache(resourceType);
        }) // Clear cache for the resource type
      );
  }

  /**
   * Enhanced DELETE request with error handling
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`)
      .pipe(
        retry(1),
        catchError(this.handleError),
        // Clear related cache entries on successful DELETE
        tap(() => {
          const resourceType = endpoint.split('/')[1];
          if (resourceType) this.clearCache(resourceType);
        }) // Clear cache for the resource type
      );
  }
  
  /**
   * Global error handler for HTTP requests
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Add more specific error messages based on status codes
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else if (error.status === 500) {
        errorMessage = 'A server error occurred. Please try again later.';
      }
    }
    
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
