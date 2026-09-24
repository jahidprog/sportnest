import { apiFetch } from "./client";
import { AuthUser, LoginInput, LoginResponse, SignupInput } from "@/lib/types";

export async function signup(input: SignupInput): Promise<AuthUser> {
  return apiFetch<AuthUser>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function googleLogin(idToken: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/users/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}
