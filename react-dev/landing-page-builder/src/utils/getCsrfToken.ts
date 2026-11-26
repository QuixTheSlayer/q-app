export const getCsrfToken = () => {
  return document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
}