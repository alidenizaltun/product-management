import { ToastContainer } from "react-toastify";
import Router from "@/app/router";

const App = () => {
  return (
    <>
      <Router />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover />
    </>
  );
};
export default App;
