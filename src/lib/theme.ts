export const THEME_STORAGE_KEY = "cv11-theme";

/**
 * Runs before first paint (inlined in <head>) so the saved theme applies
 * without a flash of the wrong colours.
 */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
