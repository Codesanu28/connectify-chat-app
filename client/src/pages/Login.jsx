import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify(data)
      );

      alert("Login Successful");

      window.location.href = "/";
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        background: "#0f172a",
      }}
    >
      <form
        onSubmit={submitHandler}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "#1e293b",
          padding: "40px",
          borderRadius: "12px",
          width: "350px",
          boxShadow:
            "0px 0px 20px rgba(0,0,0,0.4)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "white",
          }}
        >
          Login
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;