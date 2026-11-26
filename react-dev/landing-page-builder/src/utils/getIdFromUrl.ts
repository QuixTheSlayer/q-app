export function getIdFromUrl (): string | undefined {
  const {pathname} = window.location;
  const segments = pathname.split("/");
  const lastSegment = segments.pop() || segments.pop();
  return lastSegment;
}
