export async function loginUser(): Promise<string> {
  // TODO: Remplacer l'appel a l'API
  try {
    //const response = await fetch('YOUR_API_URL/login', {
    //  method: 'POST',
    //  headers: {
    //    'Content-Type': 'application/json',
    //  },
    //  body: JSON.stringify(credentials),
    //});
//
    //if (!response.ok) {
    //  throw new Error('Login failed');
    //}
//
    //const data = await response.json();
    return "token_example";
  } catch (error) {
    throw new Error('Login failed');
  }
}