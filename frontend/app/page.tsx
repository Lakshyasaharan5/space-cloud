"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [masterMsg, setMasterMsg] = useState("");
  const [dataNodeMsg, setDataNodeMsg] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/hello")
      .then(res => res.text())
      .then(setMasterMsg);

    fetch("http://localhost:8081/hello")
      .then(res => res.text())
      .then(setDataNodeMsg);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Space Cloud</h1>

      <p>Master: {masterMsg}</p>
      <p>DataNode: {dataNodeMsg}</p>
    </div>
  );
}