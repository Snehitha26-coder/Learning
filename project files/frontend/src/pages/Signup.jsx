import { useState } from "react";
import { toast } from 'react-hot-toast';
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { isEmail, isPassword } from "../Helpers/regexMatcher";
import HomeLayout from "../Layouts/HomeLayout";
import { creatAccount } from "../Redux/Slices/AuthSlice";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [prevImage, setPrevImage] = useState("");

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    avatar: null, // optional now
  });

  function handleUserInput(e) {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
  }

  function getImage(event) {
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      setSignupData({
        ...signupData,
        avatar: uploadedImage,
      });

      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.onload = () => {
        setPrevImage(fileReader.result);
      };
    }
  }

  async function createNewAccount(event) {
    event.preventDefault();

    const { fullName, email, password } = signupData;

    if (!fullName || !email || !password) {
      toast.error("Please fill all the details");
      return;
    }

    if (fullName.length < 5) {
      toast.error("Name should be at least 5 characters");
      return;
    }

    if (!isEmail(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (!isPassword(password)) {
      toast.error("Password must be 6-16 characters with number and special character");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    if (signupData.avatar) {
      formData.append("avatar", signupData.avatar);
    }

    const response = await dispatch(creatAccount(formData));
    if (response?.payload?.success) {
      navigate("/");
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        avatar: null,
      });
      setPrevImage("");
    }
  }

  return (
    <HomeLayout>
      <div className="flex items-center justify-center h-[90vh]">
        <form
          noValidate
          onSubmit={createNewAccount}
          className="flex flex-col gap-3 rounded-lg text-white p-4 w-80 shadow-[0_0_10px_black]"
        >
          <h1 className="text-center text-2xl font-bold">Registration Page</h1>

          <label htmlFor="image_uploads" className="cursor-pointer">
            {prevImage ? (
              <img className="w-24 h-24 rounded-full m-auto" src={prevImage} alt="Avatar preview" />
            ) : (
              <BsPersonCircle className="w-24 h-24 rounded-full m-auto" />
            )}
          </label>
          <input
            className="hidden"
            type="file"
            name="image_uploads"
            id="image_uploads"
            accept=".jpg, .jpeg, .png, .svg"
            onChange={getImage}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="fullName" className="font-semibold">Name</label>
            <input
              type="text"
              required
              name="fullName"
              id="fullName"
              placeholder="Enter your FullName..."
              className="bg-transparent px-2 py-1 border"
              onChange={handleUserInput}
              value={signupData.fullName}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-semibold">Email</label>
            <input
              type="email"
              required
              name="email"
              id="email"
              placeholder="Enter your email..."
              className="bg-transparent px-2 py-1 border"
              onChange={handleUserInput}
              value={signupData.email}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-semibold">Password</label>
            <input
              type="password"
              required
              name="password"
              id="password"
              placeholder="Enter your password..."
              className="bg-transparent px-2 py-1 border"
              onChange={handleUserInput}
              value={signupData.password}
            />
          </div>

          <button type="submit" className="mt-2 bg-yellow-600 hover:bg-yellow-500 py-2 font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 rounded-sm">
            Create Account
          </button>

          <p className="text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-accent cursor-pointer">Login</Link>
          </p>
        </form>
      </div>
    </HomeLayout>
  );
}

export default Signup;
