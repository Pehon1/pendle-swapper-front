import Web3 from "web3";
import React, { useState, useEffect } from "react";
import {
  ABI,
  CONTRACT_ADDRESS,
  APPROVE_ABI,
  APPROVE_ADDRESS,
} from "./constants/data";
import { ReactComponent as Setting } from "./assets/images/setting.svg";
import { ReactComponent as ArrowDown } from "./assets/images/arrow-down.svg";
import { Dropdown, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/index.css";

function App() {
  console.log(process.env.NODE_ENV)
  console.log(process.env.REACT_APP_CONTRACT_ADDRESS)
  console.log(process.env.CONTRACT_ADDRESS)
  const [errorState, setErrorState] = useState(false);
  const [account, setAccount] = useState(null);
  const [allowance, setAllowance] = useState(0);
  const [decimals, setDecimals] = useState(1);
  const [loading, setLoading] = useState(false);
  const [OT, setOT] = useState(0);
  const [YT, setYT] = useState(0);
  const [usdc, setUsdc] = useState(0);
  const date = [ 1672272000];
  const [currentDate, setCurrentDate] = useState(null);
  const convertNow = async () => {
    pendleContract()
      .methods.usdcToPendleOTYT(usdc, date[currentDate].toString())
      .send({
        from: account,
      })
      .on("transactionHash", async (hash) => {
        toast.success("Swap in progress", {
          position: toast.POSITION.TOP_RIGHT,
        });
      })
      .on("receipt", async (receipt) => {
        toast.success("Swap complete", {
          position: toast.POSITION.TOP_RIGHT,
        });
      })
      .on("error", async (error) => {
        toast.error("Something went wrong", {
          position: toast.POSITION.TOP_RIGHT,
        });
        console.log("error", error);
      });
  };

  const getApproval = async () => {
    await erc20Contract()
      .methods.approve(
        CONTRACT_ADDRESS,
        (Math.pow(10, decimals) * usdc).toString()
      )
      .send({ from: account })
      .on("transactionHash", async (hash) => {
        toast.error("USDC spend approval processing", {
          position: toast.POSITION.TOP_RIGHT,
        });
      })
      .on("receipt", async (receipt) => {
        checkAllowance();
        toast.success("USDC spend approval successful", {
          position: toast.POSITION.TOP_RIGHT,
        });
      })
      .on("error", async (error) => {
        toast.error("Something went wrong", {
          position: toast.POSITION.TOP_RIGHT,
        });
        console.log("error", error);
      });
  };
  const usdcToPendleOTYT = async () => {
    accounts();
    checkAllowance();
    console.log(currentDate)
if(currentDate===null){
  toast.error("Select Date from Dropdown", {
    position: toast.POSITION.TOP_RIGHT,
  });

}
   else if (account === null) {
      toast.error("Whoops..., Metamask is not connected.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    if (usdc < 1) {
      toast.error("A minimum of 1 USDC is required for the swap!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      try {
        if (allowance >= Math.pow(10, decimals) * usdc) {
          await convertNow();
        } else {
          await getApproval();
          await convertNow();
        }
      } catch (e) {
        toast.error("Something went wrong", {
          position: toast.POSITION.TOP_RIGHT,
        });
        console.log("error rejection", e);
      }
    }
  };

  const erc20Contract = () => {
    return new window.web3.eth.Contract(APPROVE_ABI, APPROVE_ADDRESS);
  };

  const pendleContract = () => {
    return new window.web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  };

  const web3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      return true;
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      return true;
    } else {
      setErrorState(true);
      toast.error("Whoops..., Metamask is not connected.");
      return false;
    }
  };

  const accounts = async () => {
    const accounts = await window.web3.eth.getAccounts();
    setAccount(accounts[0]);
    return accounts;
  };

  const checkAllowance = async () => {
    const _accounts = await accounts();
    try {
      const _allowance = await erc20Contract()
        .methods.allowance(_accounts[0], CONTRACT_ADDRESS)
        .call();
      setAllowance(_allowance);
    } catch (error) {
      console.log(error);
    }
  };

  const metamask = async () => {
    let isConnected = false;

    try {
      setErrorState(false);

      isConnected = await web3();

      if (isConnected === true) {
        toast.success("Wallet connected", {
          position: toast.POSITION.TOP_RIGHT,
        });

        const web3 = window.web3;

        let _accounts = await accounts();

        const decimal = await erc20Contract().methods.decimals().call();

        setDecimals(decimal);

        checkAllowance();

        window.ethereum.on("accountsChanged", async (account) => {
          setAccount(account);
          checkAllowance();
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCommision = async (e) => {
    setUsdc(e.target.value);

    if (e.target.value == 0) {
      setOT(0);
      setYT(0);
      return;
    }

    if (e.target.value > 0 && account !== null) {
      let _amount = Math.pow(10, decimals) * e.target.value;
      console.log(_amount);
      try {
        let v = await pendleContract().methods.commissionAmount(_amount).call();
        let OTYTValue = (
          Math.pow(10, -decimals) *
          (Math.pow(10, decimals) * e.target.value - v)
        ).toFixed(3);
        setOT(OTYTValue);
        setYT(OTYTValue);
      } catch (e) {
        console.log("Commission calculation error", e);
      }
    }
  };
  const getFormatedDate = (date) => {
    const event = new Date(date * 1000);
    let month = event.toLocaleDateString(undefined, { month: "short" });
    let year = event.toLocaleDateString(undefined, { year: "numeric" });
    let day = event.toLocaleDateString(undefined, { day: "numeric" });
    return `${day} ${month} ${year}`;
  };
  return (
    <div className="w-100 overflow-hidden " style={{ background: "#FEFEFF" }}>
      <ToastContainer />
      <header className="container-fluid header-section overflow-hidden">
        <nav className="navbar navbar-expand custom-nav-container">
          <ul className="navbar-nav me-auto ms-auto d-flex align-items-end">
            <li className="nav-item">
              <a className="nav-link header-link" href="#">
                Swap
              </a>
            </li>
            <li className="nav-item">
              <a className=" nav-link header-link-unselected" href="https://github.com/Pehon1/pendle-swapper" target="_blank">
                {" "}
                Github
              </a>
            </li>
          </ul>
          <button className="header-connect-btn" onClick={() => metamask()}>
            {account
              ? `${account.slice(0, 4)}...${account.slice(
                  account.length - 4,
                  account.length
                )}`
              : "Connect Wallet"}
          </button>
        </nav>
      </header>
      <div className="row p-5">
        <div className="card-container d-flex justify-content-center align-items-center mt-5 col-12 ">
          <div className="card d-flex justify-content-center align-items-center">
            <div className="card-body col-11">
              <div className="row">
                <div className="col-6 me-auto">
                  <span>
                    <b>SWAP</b>
                  </span>
                </div>
                {/* <div className="col-6 ms-auto d-flex px-4 justify-content-end">
                  <span>
                    <Setting />
                  </span>
                </div> */}
              </div>
              <div className="row swap-heading">
                <div className="col-12">
                  <span> Convert USDC to Pendle aUSDC YT and OT</span>
                </div>
              </div>
              <div className="row date-container d-flex  align-items-center mb-3 g-0">
                <div className="col date-container-text">
                  <span>Expiry</span>
                </div>
                <div className="col date-picker d-flex justify-content-end">
                  <Form.Select
                    variant="none"
                    onChange={(e) => setCurrentDate(e.target.value)}
                    value={currentDate}

                  >
                   { console.log(currentDate)}
                    <option className="option" value={null}>{"Select Date"}</option>
                    {date.map((item, index) => {
                      return (
                        <option className="option" value={index}>{getFormatedDate(item)}</option>
                      );
                    })}
                  </Form.Select>
                </div>
              </div>

              <div className="stake-container bg-light">
                <div className="row">
                  <div className="col-12">
                    <span>From</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8 d-flex align-items-center">
                    <input
                      type="number"
                      style={{ width: "100%" }}
                      id="quantity"
                      name="quantity"
                      value={usdc}
                      onChange={(e) => {
                        getCommision(e);
                      }}
                    />
                  </div>
                  <div className="col-4 d-flex justify-content-end">
                    <div className="btn-group">
                      <Dropdown>
                        <Dropdown.Toggle variant="none" id="dropdown-basic">
                          USDC
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item href="#/action-1">USDC</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <span className="d-flex justify-content-center pt-2">
                    <ArrowDown />
                  </span>
                </div>
              </div>

              <div className="row pt-3 d-flex  justify-content-center g-0">
                <div className="col-sm-5 col-12 stake-container-2 bg-light">
                  <div className="row m-1">
                    <div className="col-12 px-0">
                      <span>To</span>
                    </div>
                  </div>
                  <div className="row m-1">
                    <div className="col-9 px-0">
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={YT}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="col-3 px-0 d-flex justify-content-end align-items-center">
                      <span>YT</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-2 col-12 d-flex justify-content-center align-items-center">
                  <span>+</span>
                </div>
                <div className="col-sm-5 col-12 stake-container-2 bg-light">
                  <div className="row m-1">
                    <div className="col-12 px-0">
                      <span>To</span>
                    </div>
                  </div>
                  <div className="row m-1">
                    <div className="col-9 px-0">
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        style={{ width: "100%" }}
                        value={OT}
                      />
                    </div>
                    <div className="col-3 px-0 d-flex justify-content-end align-items-center">
                      <span>OT</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  {account ? (
                    <button
                      className="card-connect-btn"
                      onClick={
                        allowance >= usdc ? usdcToPendleOTYT : getApproval
                      }
                    >
                      {allowance >= usdc ? "Swap" : "Approve"}
                    </button>
                  ) : (
                    <button className="card-connect-btn" onClick={metamask}>
                      Connect wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
