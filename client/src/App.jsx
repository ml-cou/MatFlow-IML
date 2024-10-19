import { Route, Routes } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import Layout from "./Layout";
import Dashboard from "./Pages/Dashboard";
import EditorPage from "./Pages/EditorPage";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import TempPage from "./TempPage";
import Register from "./Pages/Register";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/temp" element={<TempPage />}></Route>
        <Route
          path="/editor"
          element={
            <ReactFlowProvider>
              <EditorPage />
            </ReactFlowProvider>
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
