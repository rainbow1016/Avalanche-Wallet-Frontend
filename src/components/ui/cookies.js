// utils/cookies.js
import Cookies from "js-cookie";

export const setCookie = (key, value) => {
  Cookies.set(key, JSON.stringify(value), { expires: 7 });
};

export const getCookie = (key) => {
  const cookieValue = Cookies.get(key);
  return cookieValue ? JSON.parse(cookieValue) : null;
};

export const removeCookie = (key) => {
  Cookies.remove(key);
};
