/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function HeroPage() {
  return (
    <div
      className="relative bg-gray-50"
      style={{ height: "100vh", backgroundColor: "black" }}
    >
      <h1>Test</h1>
    </div>
  );
}
