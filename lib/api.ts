import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const createPayment = (courseId: string, token: string) =>
  API.post(
    "/api/payment/create",
    { courseId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const verifyPayment = (courseId: string, token: string) =>
  API.post(
    "/api/payment/verify",
    { courseId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const enrollCourse = (courseId: string, token: string) =>
  API.post(
    `/api/enrollment/${courseId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );