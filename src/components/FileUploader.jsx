import { v4 } from "uuid";
import axios from "axios";
import { useRef, useState } from "react";
import { Bounce, toast } from "react-toastify";

import { PiUpload } from "react-icons/pi";
import { ImCancelCircle } from "react-icons/im";
import { IoAlertCircleOutline } from "react-icons/io5";

// Enter the following values in the .env file
const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
const USERNAME = import.meta.env.VITE_USERNAME;
const REPOSITORY_NAME = import.meta.env.VITE_REPO;

let controller = new AbortController();

function FileUploader() {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("select");

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setProgress(0);
    setFileUrl("");
    setUploadStatus("select");
  };

  const cancelHandler = () => {
    controller.abort();
    controller = new AbortController();
  };

  const doneHandler = () => {
    navigator.clipboard.writeText(fileUrl);
    toast.success("The download link was copied", {
      position: "top-center",
      autoClose: 800,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
    clearFileInput();
  };

  const uploadHandler = () => {
    const file = selectedFile;

    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes();
    const date =
      today.getFullYear() + "/" + today.getMonth() + 1 + "/" + today.getDate();

    const path = `${v4()}.${file.name.split(".")[1]}`;
    const uploadUrl = `https://api.github.com/repos/${USERNAME}/${REPOSITORY_NAME}/contents/${file.type}/${path}`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploadStatus("uploading");
      const content = event.target.result.split(",")[1];

      axios
        .put(
          uploadUrl,
          {
            message: `${date} - ${time}`,
            content,
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
            signal: controller.signal,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            },
          }
        )
        .then((response) => {
          setFileUrl(response.data.content.download_url);
          setUploadStatus("done");
          toast.success("File uploaded successfully", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
        })
        .catch((error) => {
          if (error.code === "ERR_BAD_REQUEST") {
            setUploadStatus("error");
          } else {
            toast.error(error.message, {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
              transition: Bounce,
            });
            clearFileInput();
          }
        });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        className="hidden"
      />

      {!selectedFile && (
        <button
          className="bg-slate-800 w-80 h-36 text-lg font-medium flex flex-col items-center justify-center gap-4 text-blue-400 cursor-pointer rounded-[20px] border-solid border-blue-500 border-[1.5px] transition-all hover:text-sky-500 hover:border-sky-500"
          onClick={() => inputRef.current.click()}
        >
          <span className="w-[50px] h-[50px] text-3xl text-blue-500 flex items-center justify-center rounded-3xl bg-blue-950">
            Uploader
          </span>{" "}
          Upload File
        </button>
      )}

      {selectedFile && (
        <>
          <div className="w-[310px] flex items-center gap-4 text-white bg-slate-800 py-2 px-4 rounded-md border-solid border border-blue-500">
            <div className="flex-[1] flex items-center gap-2">
              <div style={{ flex: 1 }}>
                {uploadStatus === "error" ? (
                  <p>
                    That’s a big file. Try again with a file smaller than 25MB.
                  </p>
                ) : (
                  <>
                    <h6 className="flex-[1] text-[13p] text-sm w-60 text-nowrap overflow-x-hidden">
                      {selectedFile?.name}
                    </h6>

                    <div className="flex items-center gap-x-3 whitespace-nowrap">
                      <div className="flex w-full mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {uploadStatus === "select" ? (
                <button onClick={clearFileInput}>
                  <span className="text-lg cursor-pointer">
                    <ImCancelCircle className="flex-shrink-0 text-red-500 w-5 h-5" />
                  </span>
                </button>
              ) : (
                <div className="font-bold">
                  {uploadStatus === "uploading" ? (
                    `${progress}%`
                  ) : uploadStatus === "done" ? (
                    <span style={{ fontSize: "20px" }}>
                      <svg
                        className="flex-shrink-0 w-5 h-5 text-teal-500"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="text-lg">
                      <IoAlertCircleOutline className="flex-shrink-0 text-red-500 w-6 h-6" />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex items-center">
            {uploadStatus === "select" && (
              <button
                type="button"
                onClick={uploadHandler}
                className="w-[60%] m-auto mt-3 py-2 px-3 inline-flex justify-center items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                Upload
                <PiUpload />
              </button>
            )}
            {uploadStatus === "uploading" && (
              <button
                type="button"
                onClick={cancelHandler}
                className="w-[60%] m-auto mt-3 py-2 px-3 inline-flex justify-center items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                Cancel
              </button>
            )}
            {uploadStatus === "done" && (
              <button
                type="button"
                onClick={doneHandler}
                className="w-[60%] m-auto mt-3 py-2 px-3 inline-flex justify-center items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                Copy & Done
              </button>
            )}
            {uploadStatus === "error" && (
              <button
                type="button"
                onClick={clearFileInput}
                className="w-[60%] m-auto mt-3 py-2 px-3 inline-flex justify-center items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                Try again
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FileUploader;
