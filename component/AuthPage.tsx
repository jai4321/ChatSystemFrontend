"use client";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
interface inputStates {
  value: string;
  error: string | null;
}
interface AuthPageProps {
  slug: string;
}
export default function AuthPage({ slug }: AuthPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState<inputStates>({
    value: "",
    error: "",
  });
  const [email, setEmail] = useState<inputStates>({
    value: "",
    error: "",
  });
  const [password, setPassword] = useState<inputStates>({
    value: "",
    error: "",
  });
  const formHandler = async () => {
    const payload = {
      username: username.value,
      email: email.value,
      password: password.value,
    };
    const action = slug == "register" ? "register" : "login";
    let formFlag = false;
    for (const key in payload) {
      switch (key) {
        case "username":
          if (
            (payload[key].length < 0 || !payload[key].match(/^[A-z 0-9]+$/)) &&
            slug == "register"
          ) {
            setUsername({ ...username, error: "Please Enter Valid Name!" });
            formFlag = true;
          }
          break;
        case "email":
          if (
            payload[key].length < 0 ||
            !payload[key].match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
          ) {
            setEmail({ ...email, error: "Please Enter Valid Email!" });
            formFlag = true;
          }
          break;
        case "password":
          if (payload[key].length < 8) {
            setPassword({
              ...password,
              error: "Password should atleast 8 characters!",
            });
            formFlag = true;
          }
          break;
      }
    }
    if (!formFlag) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, action: action }),
      });
      const data = await response.json();
      showToast(data.message, data.status);
      if (data.status === 200) {
        setTimeout(() => {
          if (action === "register") {
            router.push("/login");
          } else {
            router.push("/user");
          }
        }, 3000);
      }
    }
  };
  const buttonHandler = () => {
    if (slug === "register") {
      router.push("/login");
    } else {
      router.push("/register");
    }
  };

  return (
    <>
      <section className="userForm">
        <div>
          <h3>{slug === "register" ? "Register" : "Login"}</h3>
          {slug == "register" && (
            <input
              type="text"
              name="username"
              placeholder="Your Name"
              value={username.value}
              onChange={(e) =>
                setUsername({ ...username, value: e.target.value, error: "" })
              }
            />
          )}
          {username.error && <p className="errors">{username.error}</p>}
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={email.value}
            onChange={(e) =>
              setEmail({ ...email, value: e.target.value, error: "" })
            }
          />
          {email.error && <p className="errors">{email.error}</p>}
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={password.value}
            onChange={(e) =>
              setPassword({ ...password, value: e.target.value, error: "" })
            }
          />
          {password.error && <p className="errors">{password.error}</p>}
          <div className="formButton">
            <button type="submit" onClick={formHandler}>
              Submit
            </button>
            <a onClick={buttonHandler}>{slug == 'register' ? 'Sign In' : 'Sign Up'}</a>
          </div>
        </div>
      </section>
    </>
  );
}
