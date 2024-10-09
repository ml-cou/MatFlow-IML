import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between px-8 py-4 align-middle">
      <div>
        <h1
          className="font-bold text-2xl cursor-pointer"
          style={{ lineHeight: "unset" }}
          onClick={() => navigate("/")}
        >
          MATFLOW
        </h1>
      </div>
      <div className="flex gap-4">
        <button className="border border-black rounded px-4 py-2 outline-none hover:bg-black hover:text-white transition-all">
          Contact Us
        </button>
        <button className="cursor-pointer px-4 py-2 bg-primary-btn rounded hover:text-white font-medium">
          <Link to={"/login"} className="text-black">Sign In</Link>
        </button>
        <button className="cursor-pointer px-4 py-2 hover:underline">
          <Link to={"/register"} className="text-black">Sign Up</Link>
        </button>
      </div>
    </div>
  );
}

export default Navbar;
