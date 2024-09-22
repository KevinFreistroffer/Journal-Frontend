"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { State, SignUpFunction } from "../app/signup/types";

// Define a schema for input validation
const SignUpSchema = z
  .object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signUp: SignUpFunction = async (
  prevState: State,
  formData: FormData
) => {
  // Validate form data
  const validatedFields = SignUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create account.",
    };
  }

  const { username, email, password } = validatedFields.data;
  console.log(username, email, password);

  try {
    // Send data to Node.js server
    const response = await fetch("http://localhost:3001/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "http://localhost:3000",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    console.log("response.ok", response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: errorData.message || "Failed to create account.",
      };
    }

    const data = await response.json();
    console.log(data);

    // Set a cookie to simulate user session
    cookies().set("user", JSON.stringify({ username, email }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    //   return { message: "Account created successfully." };
    // } catch (error) {
    //   console.error(error);
    //   return {
    //     message: "Database Error: Failed to create account.",
    //   };
    // }

    return {
      ...prevState,
      errors: {},
      message: "Account created successfully.",
    };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      errors: prevState.errors ?? {},
      message: "Database Error: Failed to create account.",
    };
  }
};
