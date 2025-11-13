import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Pobieramy token z "sejfu" (LocalStorage)
  const token = localStorage.getItem('token');

  // 2. Jeśli token istnieje, klonujemy zapytanie i doklejamy nagłówek
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Puszczamy zmodyfikowane zapytanie dalej
    return next(clonedRequest);
  }

  // 3. Jeśli nie ma tokena, puszczamy zapytanie bez zmian (np. logowanie)
  return next(req);
};