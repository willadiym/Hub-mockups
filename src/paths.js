// Vite supplies '/' locally and the repository prefix on GitHub Pages.
export const appPath=(path='')=>`${import.meta.env.BASE_URL}${path}`;
