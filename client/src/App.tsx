// import './App.css';
import { useEffect, useState } from "react";
import Login from "./pages/login";
import Home from "./pages/home";
import SignUp from "./pages/signup";
import ProtectedRoutes from "./components/page/protected-route";
import { Routes, Route } from "react-router";
import UserProvider from "./context/user-context";

function App() {

  return (
    <>
      <UserProvider>
        <Routes>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route element={<ProtectedRoutes/>}>
              <Route path="/" element={<Home/>}></Route>
            </Route>
        </Routes>
      </UserProvider>
    </>
  )
}

export default App
