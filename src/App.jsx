import { ToastContainer } from "react-toastify";

import FileUploader from "./components/FileUploader";
import Footer from "./components/Footer";

import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer />
      <div className="h-[82vh] flex items-center justify-center">
        <FileUploader />
      </div>
      <Footer />
    </>
  );
}

export default App;
