export function isValidUrl (url:string){
 try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:"&&
      !url.includes('{')&&
      !url.includes('javascript:')&&
      !url.includes('$')
    );
  } catch {
    return false;
  }
}

export const isValidEmail = (email:string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}