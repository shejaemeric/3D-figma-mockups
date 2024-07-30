import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Laptop from "./Laptop";
import Phone from "./Phone";
import reportWebVitals from "./reportWebVitals";

const App = () => {
  let [mockup, setMockup] = useState("phone");
  let [link, setLink] = useState(
    "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FPtTH9DQLTiyE5gsfg6F5MW%2FBooking%3Fnode-id%3D19-7117%26t%3DIuz7CcozY40BDPqN-1%26scaling%3Dscale-down-width%26content-scaling%3Dfixed%26page-id%3D0%253A1%26starting-point-node-id%3D19%253A7117&hide-ui=1"
  );

  useEffect(() => {
    const params = window.location.href;
    if (params) {
      console.log(params.split("link=")[1].split("mockup=")[0]);
      console.log(params.split("mockup=")[1].split("&")[0]);
      setLink(params.split("link=")[1].split("mockup=")[0]);
      setMockup(params.split("mockup=")[1].split("&")[0]);
      console.log(link, mockup);
    }
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {mockup === "laptop" ? <Laptop link={link} /> : <Phone link={link} />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
