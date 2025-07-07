import { useState } from "react";
import { toast } from "react-toastify";
import "./doctor.css";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const Signup = () => {
  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [idCardFront, setIdCardFront] = useState({ file: null, url: "" });
  const [idCardBack, setIdCardBack] = useState({ file: null, url: "" });
  const [holdingIdCard, setHoldingIdCard] = useState({ file: null, url: "" });
  const [diploma, setDiploma] = useState({ file: null, url: "" });
  const [description, setDescription] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");

  const HandleImage = (e, setter) => {
    if (e.target.files[0]) {
      setter({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const HandleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (
      !avatar.file ||
      !idCardFront.file ||
      !idCardBack.file ||
      !holdingIdCard.file ||
      !diploma.file
    ) {
      toast.error("Please upload all required images including diploma");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("gender", gender);
      formData.append("avatar", avatar.file);
      formData.append("idCardFront", idCardFront.file);
      formData.append("idCardBack", idCardBack.file);
      formData.append("holdingIdCard", holdingIdCard.file);
      formData.append("diploma", diploma.file);
      formData.append("description", description);
      formData.append("roles", "doctor");
      const res = await fetch("http://localhost:3500/auth/signup", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return;
      }

      toast.success("Signed up successfully!");
      navigate("/");
      setAuthUser(data);
    } catch (err) {
      console.error(err);
      toast.error("Signup error");
    }
  };

  return (
    <div className="login">
      <div className="form-container">
        <form onSubmit={HandleSignUp}>
          <h2>Create Account</h2>

          <label htmlFor="avatar" className="avatar-label">
            <img src={avatar.url || "./avatar.png"} alt="avatar" className="avatar-img" />
            Upload Profile Image
          </label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            style={{ display: "none" }}
            onChange={(e) => HandleImage(e, setAvatar)}
            accept="image/*"
          />

          <input
            type="text"
            placeholder="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="gender-selection">
            <span>Gender:</span>
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                onChange={(e) => setGender(e.target.value)}
              />{" "}
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                onChange={(e) => setGender(e.target.value)}
              />{" "}
              Female
            </label>
          </div>
          <textarea
  placeholder="Description"
  name="description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="description-input"
/>

          <div className="ids">
            <label htmlFor="idCardFront" className="avatar-label">
              <img src={idCardFront.url || "./upload.png"} alt="ID Front" className="idCards" />
              Upload ID Front
            </label>
            <input
              type="file"
              id="idCardFront"
              name="idCardFront"
              style={{ display: "none" }}
              onChange={(e) => HandleImage(e, setIdCardFront)}
              accept="image/*"
            />

            <label htmlFor="idCardBack" className="avatar-label">
              <img src={idCardBack.url || "./upload.png"} alt="ID Back" className="idCards" />
              Upload ID Back
            </label>
            <input
              type="file"
              id="idCardBack"
              name="idCardBack"
              style={{ display: "none" }}
              onChange={(e) => HandleImage(e, setIdCardBack)}
              accept="image/*"
            />

            <label htmlFor="holdingIdCard" className="avatar-label">
              <img
                src={holdingIdCard.url || "./upload.png"}
                alt="Holding ID"
                className="idCards"
              />
              Holding ID Photo
            </label>
            <input
              type="file"
              id="holdingIdCard"
              name="holdingIdCard"
              style={{ display: "none" }}
              onChange={(e) => HandleImage(e, setHoldingIdCard)}
              accept="image/*"
            />
          </div>

          <label htmlFor="diploma" className="avatar-label">
            <img src={diploma.url || "./upload.png"} alt="Diploma" className="idCards" />
            Upload Diploma
          </label>
          <input
            type="file"
            id="diploma"
            name="diploma"
            style={{ display: "none" }}
            onChange={(e) => HandleImage(e, setDiploma)}
            accept="image/*,.pdf"
          />

          <button className="buttonS" type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
