export function isMacOS () {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export const getCtrlShortcutKey = () => {
  return navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl";
};
  