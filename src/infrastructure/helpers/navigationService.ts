type NavigateFn = (path: string) => void;

let navigateFunction: NavigateFn | null = null;

export const setNavigator = (navigate: NavigateFn) => {
  navigateFunction = navigate;
};

export const navigateTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
    return;
  }
  window.location.href = path;
};
