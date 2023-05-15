import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// import { SERVER_URL } from "../../config.js";

import MainIcon from "../../images/icon.png";
import LocationIcon from "../../images/location.png";
import WeatherIcon from "../../images/weather.png";
import HeaderImg from "../../images/logo.png";

import "./index.css";
import { LineChart } from "./LineChart";
import { toast } from "react-toastify";
import { GET_TEMP } from "../../actions/types";
import { API } from "aws-amplify";

function LearnDetail() {
  const [curZipCode, setCurZipCode] = useState(0);
  const [serverData, setServerData] = useState({ error: true, payload: "" });
  const [isChartShow, setChartShow] = useState(false);
  const [chartData, setChartData] = useState({
    0: 0,
  });
  const tempReduxData = useSelector((state) => state.temp);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchInput = useRef();
  useEffect(() => {
    if (!tempReduxData.communityData) {
      navigate("/");
    }
    setServerData(tempReduxData.communityData);
  }, []);

  useEffect(() => {
    if (serverData.error) {
      return;
    }

    const payload = {
      body: { ZIP: serverData.payload.ZIP },
    };

    API.post("civAPI", "/historical", payload).then((response) => {
      let result = response;
      console.log("Historical: ", result);
      if (result.error == false) {
        const chartDto = {
          K: result.payload.K,
          state_historical: result.payload.state_historical,
          us_historical: result.payload.us_historical,
        };
        setChartData(result.payload);
      }
    });
  }, [serverData]);

  const getGradientColorFromValue = (val) => {
    if (serverData.error) {
      return;
    }
    val = Math.round(val);
    let mainColor = { r: val, g: 0, b: 0 };
    let refVal = 0;
    const colors = [
      { r: 30, g: 200, b: 80 },
      { r: 255, g: 255, b: 0 },
      { r: 255, g: 150, b: 0 },
      { r: 255, g: 0, b: 0 },
      { r: 128, g: 0, b: 170 },
    ];
    let startColor = {};
    let endColor = {};
    let id = Math.ceil(val / 25);
    if (id == 0) id = 1;
    refVal = id * 25;
    startColor = colors[id - 1];
    endColor = colors[id];
    mainColor.r =
      (startColor.r * (refVal - val) + endColor.r * (val + 25 - refVal)) / 25;
    mainColor.g =
      (startColor.g * (refVal - val) + endColor.g * (val + 25 - refVal)) / 25;
    mainColor.b =
      (startColor.b * (refVal - val) + endColor.b * (val + 25 - refVal)) / 25;

    let customBgColor = `rgb(${mainColor.r}, ${mainColor.g}, ${mainColor.b} ) `;
    return customBgColor;
  };

  // Get initial current zip code.
  useEffect(() => {
    let storageZipCode = localStorage.getItem("curZipCode");
    if (storageZipCode) {
      setCurZipCode(storageZipCode);
      return;
    }
    getCurrentZipCode();
  }, []);

  // When this page loaded, and after setting current zip code.
  useEffect(() => {
    if (curZipCode !== 0) {
      // if loading is already done, set reduxData as current state.
      if (tempReduxData.isLoaded) {
        let result = tempReduxData.communityData;
        setServerData(result);
        searchInput.current.value = result.payload.ZIP;
      }
    }
  }, [curZipCode]);

  const getScaleFromValue = (val) => {
    if (serverData.error) {
      return;
    }
    return `scale(${val / 200.0 + 0.5}`;
  };

  const getScaleRecoverFromValue = (val) => {
    if (serverData.error) {
      return;
    }
    return `scale(${1 / (val / 200.0 + 0.5)}`;
  };

  const linkToCountyMap = () => {
    window.open("https://arcg.is/0b5S8H");
  };

  const linkToKentuckyMap = () => {
    window.open("https://arcg.is/");
  };

  const linkToNationalMap = () => {
    window.open("https://arcg.is/a8O9u");
  };

  const linkGoogle = () => {
    window.open("https://google.com");
  };

  const linkOneMinuteSurvey = () => {
    window.open(
      "https://survey123.arcgis.com/share/d82f920a4f3c48799c9eba0884fe5297?portalUrl=https://civilience.maps.arcgis.com"
    );
  };

  const linkTwoMinuteSurvey = () => {
    window.open(
      "https://survey123.arcgis.com/share/01acc5d06ae2437295ab530f26050c9d?portalUrl=https://civilience.maps.arcgis.com"
    );
  };

  const getCountyName = (str) => {
    let name = "";
    // if (str.search("County") > -1) {
    //   name = str.split(" County")[0];
    // } else {
    name = str.split(",")[0];
    // }
    return name;
  };

  // Handle when user click on search button.
  const onSearchClick = async () => {
    const zipCode =
      searchInput.current.value !== "" ? searchInput.current.value : curZipCode;
    if (zipCode !== 0) {
      searchData(zipCode);
      localStorage.setItem("curZipCode", zipCode);
    }
  };

  // Get data using zip code from the server.
  const searchData = (zipCode) => {
    if (zipCode === 0) {
      return;
    }

    const payload = {
      body: { ZIP: zipCode },
    };

    API.post("civAPI", "/county", payload).then((response) => {
      let result = response;
      if (result.error == false) {
        setServerData(result);
        searchInput.current.value = result.payload.ZIP;

        dispatch({
          type: GET_TEMP,
          payload: result,
        });

        // toast.success("Success");
      } else {
        toast.error(result.payload);
      }
    });
  };

  // Get Current Zip Code from Google api
  const getCurrentZipCode = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      let latLong = position.coords.latitude + "," + position.coords.longitude;

      const payload = {
        body: { latLong: latLong },
      };

      API.post("civAPI", "/zipcode", payload).then((response) => {
        let result = response;
        if (result.error == false) {
          setCurZipCode(result.payload);
          localStorage.setItem("curZipCode", result.payload);
          searchInput.current.value = result.payload;
          onSearchClick();
        } else {
          console.log("Result: ", result.payload);
          // toast.error(result.payload);
        }
      });
    });
  };

  const enterClick = (e) => {
    if (e.key == "Enter") {
      onSearchClick();
    }
  };
  const loseFocus = (e) => {
    onSearchClick();
  };
  // Page 2
  return (
    <div className="LearnDetail p-4">
      <Link to={"/"}>
      <div className="info2 me-4">
              <span class="chevron left"></span>
            </div>
      </Link>
      <img src={HeaderImg} className="HeaderImg" />
      <div className="mainBody">
        <div className="title flex-row">
          <img src={MainIcon} className="MainIcon" alt="mainIcon"></img>
          <p>
            Community <br /> Health
          </p>
        </div>
        <div className="info me-4">
          <div className="flex-row flex-justify-center">
            <p className="locationInfo me-1">
              {!serverData.error
                ? getCountyName(serverData.payload.county_name)
                : " "}
            </p>
            <div className="searchBar">
              <div className="flex flex-justify-center">
                <div className="inputPart">
                  <input
                    type="text"
                    placeholder="Zip Code"
                    ref={searchInput}
                    onKeyDown={enterClick}
                    onBlur={loseFocus}
                  />
                </div>
                {/* <button onClick={onSearchClick}>Search</button> */}
              </div>
            </div>
            <img
              src={LocationIcon}
              className="LocationIcon"
              alt="location"
              onClick={getCurrentZipCode}
            ></img>
          </div>
          <div className="flex-row flex-justify-center">
            <img
              src={WeatherIcon}
              className="WeatherIcon"
              alt="weathericon"
            ></img>
            <p className="weatherInfo">
              {!serverData.error
                ? Math.round(serverData.payload.temp_fahrenheit)
                : "0"}
              °F
            </p>

            <p className="weatherInfo-celsius">
              {!serverData.error
                ? Math.round(serverData.payload.temp_celsius)
                : "0"}
              °C
            </p>
          </div>
        </div>
      </div>


      <div >
      {/* Do Part Start */}
      <div className="mt-3">
        <div>
          <span>
            <h2 className="inline fw-bold">DO</h2>
          </span>
          <span className="colorLine height-3"></span>
        </div>
        <div className="mt-2 mx-3">
          <span>
            <h5 className="inline fw-bold p-4">SCREEN FOR</h5>
          </span>
          <div className="dropdown pull-right">
            <button
              className="btn btn-secondary dropdown-toggle  border-radius-10 me-3"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Covid 19
            </button>
            <ul
              className="dropdown-menu border-radius-10"
              aria-labelledby="dropdownMenuButton1"
            >
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Monkeypox
                    <span className="Mytooltiptext-right ">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Influenza
                    <span className="Mytooltiptext-right ">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Norovirus
                    <span className="Mytooltiptext-right ">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    HIV
                    <span className="Mytooltiptext-right">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Hepatitics C
                    <span className="Mytooltiptext-right">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* First three round numbers */}
        <div className="row wid-100 m-0 fw-bold text-center">
          <div className="col-sm-6  oneMinute">
            <div>
              <div onClick={linkOneMinuteSurvey}>
                <h4 className="fw-bold">One Minute</h4>
                <p>Know what</p>
                <p>guidelines apply</p>
                <p>to you</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6  twoMinute">
            <div>
              <div /*onClick={linkTwoMinuteSurvey}*/ title="Coming Soon">
                <h4 className="fw-bold">Two Minute</h4>
                <p>Know guidelines &</p>
                <p>your risk of</p>
                <p>catching and</p>
                <p>spreading</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Say Part */}
      <div className=" mt-3">
        <div>
          <span>
            <h2 className="inline fw-bold">SAY</h2>
          </span>
          <span className="colorLine height-3"></span>
        </div>
        <div className="mt-2 mx-3">
          <span>
            <h5 className="inline fw-bold p-4">TELL US</h5>
          </span>
        </div>
        <div className="border-bottom-gray-2 position-relative pt-4 mx-4">
          <div className="position-absolute top-0 end-0">
            <span className="ms-4">
              <div className="Mytooltip">
                Civilience Picks
                <span className="Mytooltiptext-right">
                  <p>Coming soon</p>
                </span>
              </div>
              <label>
                <input
                  type="radio"
                  name="sayRadio"
                  value="civilience"
                  checked
                />
                <img className="ms-2" src="./cvl_icon.png" />
              </label>
              {/* <input
                type="radio"
                name="sayRadio"
                className="ms-2"
                value="civilience"
              /> */}
            </span>
            <span className="ms-4">
              <div className="Mytooltip">
                Reorder Picks
                <span className="Mytooltiptext-right">
                  <p>Coming soon</p>
                </span>
              </div>
              <label>
                <input type="radio" name="sayRadio" value="reorder" />
                <img className="ms-2" src="./cvl_icon.png" />
              </label>
              {/* <input
                type="radio"
                name="sayRadio"
                className="ms-2"
                value="reorder"
              /> */}
            </span>
            <span className="ms-4">
              <div className="Mytooltip">
                All
                <span className="Mytooltiptext-right">
                  <p>Coming soon</p>
                </span>
              </div>
              <label>
                <input type="radio" name="sayRadio" value="all" />
                <img className="ms-2" src="./cvl_icon.png" />
              </label>
              {/* <input
                type="radio"
                name="sayRadio"
                className="ms-2"
                value="all"
              /> */}
            </span>
          </div>
        </div>

        {/* LEAVE AREA for embedding web page. */}
        <div className="bd-0 mt-3 p-4">
          {/* <h1>LEAVE AREA FOR EMBEDDING WEB PAGE!</h1> */}
          <p>
            <iframe
              src="https://main.d26fb7k5zbcwdt.amplifyapp.com/html/say/"
              width="100%"
              height="200"
              frameborder="0"
              allowfullscreen="allowfullscreen"
            ></iframe>
          </p>
        </div>
      </div>

      {/* SEE Part */}
      <div className="mt-3">
        <div>
          <span>
            <h2 className="inline fw-bold">SEE</h2>
          </span>
          <span className="colorLine height-3"></span>
        </div>
        <div className="mt-2 mx-3">
          <span>
            <h5 className="inline fw-bold p-4">CHECK OUT RISK BY</h5>
          </span>
          <div className="dropdown pull-right">
            <button
              className="btn btn-secondary dropdown-toggle  border-radius-10 me-3"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Location
            </button>
            <ul
              className="dropdown-menu border-radius-10"
              aria-labelledby="dropdownMenuButton1"
            >
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Infection
                    <span className="Mytooltiptext-right">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Transmission
                    <span className="Mytooltiptext-right">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Demographics
                    <span className="Mytooltiptext-right">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Advanced
                    <span className="Mytooltiptext-right ">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* First three round numbers */}
        <div className="row wid-100 m-0 fw-bold">
          <div className="col-sm-4 text-center">
            <div
              style={{
                transform: getScaleFromValue(serverData.payload.K_historical),
              }}
            >
              <p
                onClick={() => setChartShow(true)}
                className="circle-bg "
                style={{
                  background: getGradientColorFromValue(
                    serverData.payload.K_historical
                  ),
                }}
              >
                {Math.round(serverData.payload.K_historical).toString()}
              </p>
              <p
                className="pt-4"
                style={{
                  transform: getScaleRecoverFromValue(
                    serverData.payload.K_historical
                  ),
                }}
              >
                {!serverData.error
                  ? getCountyName(serverData.payload.county_name)
                  : " "}
              </p>
            </div>
          </div>
          <div className="col-sm-4  text-center">
            <div style={{ transform: getScaleFromValue(serverData.payload.K) }}>
              <p
                onClick={linkToKentuckyMap}
                className="circle-bg "
                style={{
                  background: getGradientColorFromValue(serverData.payload.K),
                }}
              >
                {Math.round(serverData.payload.K).toString()}
              </p>
              <p
                className="pt-4"
                style={{
                  transform: getScaleRecoverFromValue(serverData.payload.K),
                }}
              >
                {!serverData.error
                  ? getCountyName(serverData.payload.state)
                  : " "}
              </p>
            </div>
          </div>
          <div className="col-sm-4  text-center">
            <div
              style={{ transform: getScaleFromValue(serverData.payload.k_US) }}
            >
              <p
                onClick={linkToNationalMap}
                className="circle-bg "
                style={{
                  background: getGradientColorFromValue(
                    serverData.payload.k_US
                  ),
                }}
              >
                {Math.round(serverData.payload.k_US).toString()}
              </p>
              <p
                className="pt-4"
                style={{
                  transform: getScaleRecoverFromValue(serverData.payload.k_US),
                }}
              >
                USA
              </p>
            </div>
          </div>
        </div>
        {/* Detail Chart . */}
        {isChartShow && (
          <div className=" p-2 lineChart position-relative">
            <button
              onClick={() => setChartShow(false)}
              className="position-absolute top-0 end-0 btn-sm btn-primary lineChart-close"
            >
              X
            </button>
            <LineChart
              chartData={chartData}
              county={
                !serverData.error
                  ? getCountyName(serverData.payload.county_name)
                  : " "
              }
            />
          </div>
        )}
      </div>

      {/* More Part Start */}

      <div className="More mb-5">
        <div>
          <span>
            <h2 className="inline fw-bold">More</h2>
          </span>
          <span className="colorLine height-3"></span>
        </div>
        <div className="mt-2 mx-3">
          <div className="dropdown pull-right">
            <button
              className="btn btn-secondary dropdown-toggle  border-radius-10 me-3 min-wid-150px"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Community Health
            </button>
            <ul
              className="dropdown-menu border-radius-10  min-wid-150px"
              aria-labelledby="dropdownMenuButton1"
            >
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Community Health
                    <span className="Mytooltiptext-right">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Emotional Health
                    <span className="Mytooltiptext-right">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Wellness
                    <span className="Mytooltiptext-right ">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
              <li>
                <div className="Mytooltip">
                  <a className="dropdown-item" href="#">
                    Chronic Health
                    <span className="Mytooltiptext-right ">
                      <p>Coming soon</p>
                    </span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default LearnDetail;
