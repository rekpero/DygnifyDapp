import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Stack, Link } from "@mui/material";
import GradientButton from "../../../tools/Button/GradientButton";
import { isConnected } from "../../../components/navbar/NavBarHelper";
import PrimaryButton from "../../../tools/Button/PrimaryButton";

const Header = () => {
  const [status, setStatus] = useState(false);

  async function requestAccount() {
    const result = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(result);
    //put a regex here to read result and set Status
    //store the wallet address in contexts
  }

  useEffect(() => {
    const fetchStatus = async () => {
      const getStatus = await isConnected();
      console.log(getStatus);
      if (getStatus) return setStatus(true);
      setStatus(false);
      console.log(isConnected());
    };
    fetchStatus();
  }, []);

  return (
    <div
      style={{
        height: "76px",
        backgroundColor: "#20232A",
        borderEndEndRadius: "12px",
        borderEndStartRadius: "12px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
      }}
    >
      <div>
        <img
          style={{ width: "150px", height: "80px", objectFit: "contain" }}
          src="/assets/logo.png"
          alt="company logo"
        />
      </div>

      {!status ? (
        <GradientButton onClick={requestAccount}>Connect Wallet</GradientButton>
      ) : (
        <PrimaryButton>Connected</PrimaryButton>
      )}
    </div>
  );
};

export default Header;
