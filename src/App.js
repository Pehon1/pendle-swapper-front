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
import { Dropdown } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./styles/index.css";

function App() {
  const [errorState, setErrorState] = useState(false);
  const [account, setAccount] = useState(null);
  const [allowance, setAllowance] = useState(0);
  const [decimals, setDecimals] = useState(1);
  const [loading, setLoading] = useState(false);
  const [OT, setOT] = useState(0);
  const [YT, setYT] = useState(0);
  const [usdc, setUsdc] = useState(0);
  const usdcToPendleOTYT = async () => {
    const amount = usdc;
    setUsdc(amount);
    if (amount < 1) {
      toast.error("A minimum of 1 eth is required to participate!", {
        position: toast.POSITION.TOP_RIGHT
      });
      // alert("A minimum of 1 eth is required to participate!");
    } else {
      if (account === null) {
        toast.error("Whoops..., Metamask is not connected.", {
          position: toast.POSITION.TOP_RIGHT
        });
        // alert("Whoops..., Metamask is not connected.");
      } else {
        try {
          const web3 = window.web3;
          let _amount = amount.toString();
          let contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

          if (allowance>=amount) {
       
            contract.methods
              .usdcToPendleOTYT(
                (Math.pow(10, decimals) * amount).toString(),
                "1672272000"
              )
              .send({
                from: account,
                amount: (Math.pow(10, decimals) * amount).toString(),
              })
              .on("transactionHash", async (hash) => {
              
                toast.success("Your transaction is pending", {
                  position: toast.POSITION.TOP_RIGHT
                });
              })
              .on("receipt", async (receipt) => {
                
                toast.success("Your transaction is confirmed ", {
                  position: toast.POSITION.TOP_RIGHT
                });
              })
              .on("error", async (error) => {
                toast.error("Something went wrong", {
                  position: toast.POSITION.TOP_RIGHT
                });
                console.log("error", error);
              });
          } else {
            let contract2 = new web3.eth.Contract(APPROVE_ABI, APPROVE_ADDRESS);
            let approved = await contract2.methods
              .approve(account, _amount)
              .send({ from: account })
              .on("transactionHash", async (hash) => {
                
                toast.error("Your transaction is pending", {
                  position: toast.POSITION.TOP_RIGHT
                });

              })
              .on("receipt", async (receipt) => {
                toast.success("Your transaction is Approved", {
                  position: toast.POSITION.TOP_RIGHT
                });
                contract.methods
                  .usdcToPendleOTYT(_amount, "1672272000")
                  .send({
                    from: account,
                  })
                  .on("transactionHash", async (hash) => {
                    toast.success("Your transaction is Pending", {
                      position: toast.POSITION.TOP_RIGHT
                    });
                  })
                  .on("receipt", async (receipt) => {
                    toast.success("Your transaction is Confirmed", {
                      position: toast.POSITION.TOP_RIGHT
                    });
                  })
                  .on("error", async (error) => {
                    toast.error(error.message, {
                      position: toast.POSITION.TOP_RIGHT
                    });

                    console.log("error", error);
                  });
              })
              .on("error", async (error) => {
                toast.error("Something went wrong", {
                  position: toast.POSITION.TOP_RIGHT
                });
                console.log("error", error);
              });
          }
        } catch (e) {
          toast.error("Something went wrong", {
            position: toast.POSITION.TOP_RIGHT
          });
    
        
          console.log("error rejection", e);
        }
      }
    }
  };
  const metamask = async () => {
    let isConnected = false;
    try {
      setErrorState(false);

      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        isConnected = true;
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        isConnected = true;
      } else {
        isConnected = false;
        setErrorState(true);
        toast.error("Whoops..., Metamask is not connected.");

      }
      if (isConnected === true) {
        const web3 = window.web3;
        let accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        let contract2 = new web3.eth.Contract(APPROVE_ABI, APPROVE_ADDRESS);

        const decimal = await contract2.methods.decimals().call();
        setDecimals(decimal);
        const allowance = await contract2.methods
          .allowance(accounts[0], accounts[0])
          .call();
        setAllowance(allowance);
        window.ethereum.on("accountsChanged", async function (accounts) {
          setAccount(accounts[0]);
          let contract2 = new web3.eth.Contract(APPROVE_ABI, APPROVE_ADDRESS);
          const decimal = await contract2.methods.decimals().call();
          const allowance = await contract2.methods
            .allowance(accounts[0], accounts[0])
            .call();
          setDecimals(decimal);
          setAllowance(allowance);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getCommision = async (e) => {
    if (e.target.value > -1) {
      setUsdc(e.target.value);

      if (account === null) {
      } else {
        const web3 = window.web3;
        if (e.target.value > 0) {
          let _amount = (Math.pow(10, decimals) * e.target.value).toString();
          let contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
          try {
            // let contract2 = new web3.eth.Contract(APPROVE_ABI, APPROVE_ADDRESS);
            // let approved = await contract2.methods
            //   .approve(account, _amount)
            //   .send({ from: account });
            let v = await contract.methods.commissionAmount(_amount).call();
            // .send({from:account})
            console.log(v);
            setOT(
              (
                Math.pow(10, -decimals) *
                (Math.pow(10, decimals) * e.target.value - v)
              ).toFixed(2)
            );
            setYT(
              (
                Math.pow(10, -decimals) *
                (Math.pow(10, decimals) * e.target.value - v)
              ).toFixed(2)
            );
          } catch (e) {
            console.log("error rejection", e);
          }
        }
      }
    }
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
              <a className=" nav-link header-link-unselected" href="#">
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
              : "Connect"}
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
                  <Dropdown>
                    <Dropdown.Toggle variant="none" id="dropdown-basic">
                      29 Dec 2021
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item href="#/action-1">
                        29 Dec 2021
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
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
                      onClick={usdcToPendleOTYT}
                    >
                      Swap
                    </button>
                  ) : (
                    <button className="card-connect-btn">
                      Connect a wallet
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
