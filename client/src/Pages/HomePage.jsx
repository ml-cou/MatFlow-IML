import React from "react";
import { Link } from "react-router-dom";
import feature_img from "./Feature_collage.svg";

const Technologies = [
  "/python.png",
  "/jupyter.png",
  "/scikit.png",
  "/seaborn.png",
  "/pandas.png",
];

function HomePage() {
  return (
    <div className="">
      {/* First Section */}
      <div className="flex flex-col md:flex-row lg:max-w-[1400px] mx-auto gap-12 pt-4 md:pt-14 px-8">
        <div className="flex order-2 md:order-1 flex-col w-1/2 justify-center">
          <h1 className="font-bold text-3xl lg:text-4xl mb-10 font-titillium">
            Machine Learning and Data Analytic with{" "}
            <span className="text-primary-btn underline">
              Zero Line Of Code
            </span>
          </h1>
          <p className="text-md lg:text-lg">
            Matflow, the ultimate destination for machine learning and data
            analytics. Explore cutting-edge techniques, discover powerful tools,
            and stay up-to-date with the latest advancements in the field.
            Unleash the full potential of your data with Matflow.
          </p>
          <div className="mt-10 flex gap-8">
            <button className="cursor-pointer bg-primary-btn px-6 py-4 rounded-md hover:translate-x-0 hover:translate-y-[-3px] hover:shadow-accent hover:shadow-[0px_20px_80px_-10px] duration-150 font-medium">
              <Link to={"/dashboard"} className="text-black">Get Started</Link>
            </button>
            <button className="cursor-pointer bg-secondary-btn px-6 py-4 rounded-md hover:translate-x-0 font-medium hover:translate-y-[-3px] shadow-sm duration-150">
              <Link to={'/editor'}>Nodebased</Link>
            </button>
          </div>
        </div>
        <div className="order-1 md:order-2 w-1/2">
          <img
            src="/iso-ai.jpg"
            alt=""
            className="w-full max-h-[700px] h-full object-contain object-center"
          />
        </div>
      </div>

      {/* Second Section */}
      <div className="mt-16 lg:max-w-[1400px] mx-auto text-center px-8">
        <div>
          <h1 className="text-3xl font-bold mb-4 font-titillium">
            A Complete Platform for Machine Learning
          </h1>
          <p className="text-xl">
            Find solutions to accelerate machine learning tasks with zero
            knowledge of code.
          </p>
        </div>
        <div className="flex align-middle justify-around mt-6 flex-wrap">
          <div className="border border-gray-300 shadow-md py-4 mt-4 px-4 flex flex-col items-center rounded gap-3">
            <div>
              <img
                src="/field-of-view.png"
                alt=""
                className="w-28 h-full max-h-28"
              />
            </div>
            <h3 className="text-text text-xl font-titillium font-[600]">Model & Visualize</h3>
            <p className="max-w-xs font-light">
              Harness the power of machine learning algorithms to build accurate
              models, and visualize your data like never before. Uncover
              insights and make informed decisions with Matflow.
            </p>
          </div>
          <div className="flex flex-col border border-gray-300 shadow-md py-4 mt-4 px-4 items-center rounded gap-3">
            <div>
              <img
                src="/translator.png"
                alt=""
                className="w-28 h-full max-h-28"
              />
            </div>
            <h3 className="text-text text-xl font-titillium font-[600]">Blend & Transform</h3>
            <p className="max-w-xs font-light">
              Unlock the power of data manipulation and transformation.
              Seamlessly blend datasets, apply powerful transformations, and
              extract valuable insights to enhance your machine learning and
              data analysis workflows.
            </p>
          </div>
          <div className="flex flex-col border border-gray-300 shadow-md py-4 mt-4 px-4 items-center rounded gap-3">
            <div>
              <img
                src="/analysis.png"
                alt=""
                className="w-28 h-full max-h-28"
              />
            </div>
            <h3 className="font-titillium font-[600] text-text text-xl">
              Predicative Analysis
            </h3>
            <p className="max-w-xs font-light">
              Dive into the world of advanced analytics and forecasting. Harness
              the power of data-driven insights to make accurate predictions and
              drive informed decision-making.
            </p>
          </div>
          <div className="flex flex-col border border-gray-300 shadow-md py-4 mt-4 px-4 items-center rounded gap-3">
            <div>
              <img
                src="/presentation.png"
                alt=""
                className="w-28 h-full max-h-28"
              />
            </div>
            <h3 className="font-titillium font-[600] text-text text-xl">
              Time Series Forecasting
            </h3>
            <p className="max-w-xs font-light">
              Dive into the world of time series forecasting on Matflow. Unlock
              insights from temporal data, leverage advanced algorithms, and
              make accurate predictions for future trends and patterns. Master
              the art of forecasting with Matflow.
            </p>
          </div>
        </div>
      </div>

      {/* Third Section */}
      <div className="mt-20 bg-secondary-btn">
        <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-8">
          <h1 className="font-titillium font-[700] text-3xl mb-6">
            A MACHINE LEARNING BASED DATA ANALYSIS AND EXPLORATION SYSTEM FOR
            MATERIAL DESIGN
          </h1>
          <p className="font-light mb-8">
            MatFlow is a web-based dataflow framework for visual data
            exploration. A machine learning-based data analysis and exploration
            system for material design is a computer system that uses machine
            learning algorithms to analyze and explore large amounts of material
            design data. This system can be used to identify patterns and
            relationships in the data, generate insights and predictions, and
            support decision-making in the field of material design. The system
            can be trained on existing data to improve its accuracy and can also
            be updated with new data as it becomes available to continue
            learning and improving its performance.
          </p>
          <img src={feature_img} alt="" className="w-full h-full" />
        </div>
      </div>

      {/* Fourth Section */}
      <div className="max-w-[1000px] mx-auto my-12 text-center p-12">
        <h1 className="font-titillium font-bold text-4xl mb-12">ML Lifecycle with MATFLOW</h1>
        <img src="/lifecycle.png" alt="" className="-translate-x-5" />
      </div>

      {/* Fifth Section */}
      <div className="mt-16 lg:max-w-[1400px] mx-auto text-center">
        <h1 className="font-bold text-4xl mb-12 font-titillium">Technologies We Used</h1>
        <div className="flex gap-8 justify-around">
          {Technologies.map((image, ind) => (
            <img
              key={ind}
              src={image}
              alt=""
              className="w-32 h-32 object-contain object-center"
            />
          ))}
        </div>
      </div>

      {/* Fifth Section */}
      {/* <div className="mt-16 p-16 py-20 bg-secondary-btn">
        <div className="text-center">
          <h1 className="font-bold text-4xl mb-4">Get started today.</h1>
          <div>
            <button className="cursor-pointer px-6 py-4 bg-primary-btn rounded shadow mr-6">
              <Link to={"/register"}>Create Free Account</Link>
            </button>
            <button className="cursor-pointer py-2 shadow border-b-2 border-primary-btn">
              <Link to={"/contact-us"}>Contact Us</Link>
            </button>
          </div>
        </div>
      </div> */}

      {/* Footer */}
      <footer className="bg-black text-white mt-24 py-16">
        <div className="max-w-[1400px] mx-auto flex gap-8 justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-3xl mb-2">MATFLOW</h1>
            <h3 className="font-medium text-xl">What is Matflow?</h3>
            <p className="max-w-md text-sm font-light">
              Matflow is a comprehensive website for machine learning and data
              analytics, offering cutting-edge techniques, tools, and resources
              to empower users in harnessing the power of data.
            </p>
            <div className="flex gap-4 mt-4">
              <img src="https://github.com/gauravghongde/social-icons/blob/master/PNG/Color/Facebook.png?raw=true" alt="" className="w-8 h-8 cursor-pointer" />
              <img src="https://github.com/gauravghongde/social-icons/blob/master/PNG/Color/Twitter.png?raw=true" alt="" className="w-8 h-8 cursor-pointer" />
              <img src="https://github.com/gauravghongde/social-icons/blob/master/PNG/Color/LinkedIN.png?raw=true" alt="" className="w-8 h-8 cursor-pointer" />
              <img src="https://github.com/gauravghongde/social-icons/blob/master/PNG/Color/Youtube.png?raw=true" alt="" className="w-8 h-8 cursor-pointer" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-medium mb-2">PRODUCT</h3>
            <Link className="text-white font-light hover:underline">AI Platform</Link>
            <Link className="text-white font-light hover:underline">Use Case Library</Link>
            <Link className="text-white font-light hover:underline">Customer Stories</Link>
          </div>
          <div className="flex flex-col">
            <h3 className="font-medium mb-2">SUPPORT</h3>
            <Link className="text-white font-light hover:underline">Documentation</Link>
            <Link className="text-white font-light hover:underline">Community</Link>
            <Link className="text-white font-light hover:underline">Support Hub</Link>
            <Link className="text-white font-light hover:underline">Contact Us</Link>
            <Link className="text-white font-light hover:underline">Login</Link>
          </div>
          <div className="flex flex-col">
            <h3 className="font-medium mb-2">RESOURCES</h3>
            <Link className="text-white font-light hover:underline">
              Resources Library
            </Link>
            <Link className="text-white font-light hover:underline">Blog</Link>
            <Link className="text-white font-light hover:underline">Events</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
