// Generate and manage unique browser-based user tokens

export function getUserToken(): string {
  if (typeof window === 'undefined') return '';
  
  const TOKEN_KEY = 'blog_user_token';
  let token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) {
    // Generate a unique token: timestamp + random string
    token = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  return token;
}

export function clearUserToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('blog_user_token');
}
