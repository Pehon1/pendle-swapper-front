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
import { DatePicker } from "@material-ui/pickers";

import "./styles/index.css";

function App() {
  const [selectedDate, handleDateChange] = useState(new Date());
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [OT, setOT] = useState(0);
  const [YT, setYT] = useState(0);
  const [usdc, setUsdc] = useState(0);
  const usdcToPendleOTYT = async () => {
    const amount=usdc;
    setUsdc(amount)
    console.log("");
    if (amount < 1) {
      alert("A minimum of 1 eth is required to participate!")
      
    } else {
      if (account === null) {
       
        alert("Whoops..., Metamask is not connected.")
      } else {
        try {
      
        const web3 = window.web3;
        let _amount = amount.toString();
        let contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      
 let contract2 = new web3.eth.Contract(APPROVE_ABI, APPROVE_ADDRESS);
        let approved = await contract2.methods
          .approve(account, _amount)
          .send({ from: account })
          .on("transactionHash", async (hash) => {
            console.log("Your transaction is pending");
            alert("Your transaction is pending")
          })
          .on("receipt", async (receipt) => {
            alert("Your transaction is Approved");
            contract.methods
            .usdcToPendleOTYT(_amount, "1672272000")
            .send({
              from: account,
            })
            .on("transactionHash", async (hash) => {
              console.log("Your transaction is pending");
              alert("Your transaction is pending")
            })
            .on("receipt", async (receipt) => {
              alert("Your transaction is confirmed");
            })
            .on("error", async (error) => {
      alert(error.message)

              console.log("error", error);
            });
          })
          .on("error", async (error) => {
      alert(error.message)

            console.log("error", error);
          });
        
        } catch (e) {
      alert("Something wrong")

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
        alert("metamask is not installed");
      }
      if (isConnected === true) {
        const web3 = window.web3;
        let accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        let contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
       
        window.ethereum.on("accountsChanged", function (accounts) {
          setAccount(accounts[0]);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getCommision = async (e) => {
    if (account === null) {
    } else {
      const web3 = window.web3;

      let _amount = e.target.value.toString();
      let contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      try {
        // let contract2 = new web3.eth.Contract(APPROVE_ABI, APPROVE_ADDRESS);
        // let approved = await contract2.methods
        //   .approve(account, _amount)
        //   .send({ from: account });
        let v = await contract.methods.commissionAmount(_amount).call();
        // .send({from:account})
        console.log(v);
        setOT(e.target.value-v)
        setYT(e.target.value-v)
      } catch (e) {
        console.log("error rejection", e);
      }
    }
  };
  return (
    <div className="w-100 overflow-hidden " style={{background:"#FEFEFF"}}>
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

          {/* </span> */}
          <button className="header-connect-btn"
          onClick={() => metamask()}>{account ? `${account.slice(0,4)}...${ account.slice(account.length-4,account.length)}` : "Connect"}</button>
          {/* </div> */}
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
                  <span> Convert USDC to Pendle a USDC YT and OT</span>
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
                          <Dropdown.Item href="#/action-1">29 Dec 2021</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                  {/* <DatePicker
                    format="dd-MMMM-yyyy"
                    views={["year", "month", "date"]}
                    value={selectedDate}
                    onChange={handleDateChange}
                  />
                 */}
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
                      style={{width:"100%"}}
                      id="quantity"
                      name="quantity"
                      value={usdc}

                      onChange={(e)=> {getCommision(e)
                        setUsdc(e.target.value)}}
                    />
                  </div>
                  <div className="col-4 d-flex justify-content-end">
                    <div className="btn-group">
                      {/* <div className="dropdown-menu">
                    <a className="dropdown-item" href="#">Doller</a>
                    <a className="dropdown-item" href="#">PKR</a>
                    <a className="dropdown-item" href="#">POUNDS</a>
                  </div> */}
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
                        style={{width:"100%"}}
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
                 {account ? <button className="card-connect-btn" onClick={usdcToPendleOTYT}>Swap</button>:
                 <button className="card-connect-btn">Connect a wallet</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* abc
      <button onClick={() => metamask()}>
        {account ? account : "Connect metamask"}
      </button>
      <input onChange={(e) => getCommision(e)}></input> */}
    </div>
  );
}

export default App;
