import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// import { SERVER_URL } from "../../config";
import "./index.css";

import MainIcon from "../../images/icon.png";
import LocationIcon from "../../images/location.png";
import WeatherIcon from "../../images/weather.png";
import InfoIcon from "../../images/info.png";

import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { GET_TEMP } from "../../actions/types";
import { API } from "aws-amplify";

function CustomGraph() {
  const tempRef = useRef();
  const searchInput = useRef();
  const dispatch = useDispatch();
  const tempReduxData = useSelector((state) => state.temp);

  const [kCounty, setCountyData] = useState("0"); // payload.K
  const [kState, setStateData] = useState("0"); // payload.K_state
  const [kHistorical, setHistoricalData] = useState("0"); // payload.K_historical
  const [kUS, setUSData] = useState("0"); // payload.K_US
  const [tempStyle, setTempStyle] = useState("rgb(229,229,229)");
  const [serverData, setServerData] = useState({ error: true, payload: "" });

  const [curZipCode, setCurZipCode] = useState(0);

  // Get initial current zip code.
  useEffect(() => {
    let storageZipCode = localStorage.getItem("curZipCode");
    if (storageZipCode) {
      setCurZipCode(storageZipCode);
      // const countData = kCounty;
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
        setCountyData(Math.round(result.payload.K).toString());
        setStateData(Math.round(result.payload.K_state).toString());
        setHistoricalData(Math.round(result.payload.K_historical).toString());
        setUSData(Math.round(result.payload.k_US).toString());
        setServerData(result);
        searchInput.current.value = result.payload.ZIP;
        // const countData = kCounty;
      }
    }
  }, [curZipCode]);

  // Set temperature color
  useEffect(() => {
    const countData = kCounty;
    let storageTempStyle = localStorage.getItem("curTempStyle");
    // tempRef.current.style.background = storageTempStyle;
    if (searchInput.current.value !== "" && kCounty !== "NA") {
      tempRef.current.style.background = storageTempStyle;
    } else {
      tempRef.current.style.background = "rgb(229,229,229)";
    }

    // tempRef.current.style.background = kCounty !== '0'
    //   ? tempStyle
    //   : "rgb(229,229,229)";
  }, [tempStyle]);

  // test
  // Set gradient Color whenever kCounty changes
  useEffect(() => {
    if (Number.isInteger(kCounty)) {
      // let val = isNaN(kCounty) ? 0 : parseInt(kCounty);
      let val = kCounty;
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

      let customBgColor = `linear-gradient(0deg,  rgba(${mainColor.r}, ${
        mainColor.g
      }, ${mainColor.b},1) 0%, rgba(${mainColor.r}, ${mainColor.g},  ${
        (mainColor.g, 1)
      }) 100%) `;
      setTempStyle(customBgColor);
      localStorage.setItem("curTempStyle", customBgColor);
    } else {
      setTempStyle("rgb(229, 229, 229)");
    }
  }, [parseInt(kCounty)]);

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
          // toast.error('result.payload');
          // toast.error(result.payload);
        }
      });
    });
  };

  // Handle when user click on search button.
  const onSearchClick = async () => {
    const zipCode =
      searchInput.current.value !== "" ? searchInput.current.value : curZipCode;
    if (zipCode !== 0) {
      searchData(zipCode);
      localStorage.setItem("curZipCode", zipCode);
      // const countData = kCounty;
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

    try {
      API.post("civAPI", "/county", payload).then((response) => {
        let result = response;
        if (result.error == false) {
          setCountyData(Math.round(result.payload.K));
          setStateData(Math.round(result.payload.K_state));
          setHistoricalData(Math.round(result.payload.K_historical));
          setUSData(Math.round(result.payload.k_US));
          setServerData(result);
          searchInput.current.value = result.payload.ZIP || "";

          dispatch({
            type: GET_TEMP,
            payload: result,
          });

          // toast.success('Success');
        } else {
          setCountyData("NA");
          setStateData("NA");
          setHistoricalData("NA");
          setUSData("NA");
          localStorage.setItem("curTempStyle", "rgb(229, 229, 229)");
          setTempStyle("rgb(229, 229, 229)");

          // toast.error(result.payload);
        }
      });
    } catch (error) {
      console.log("error: " + error);
    }
  };

  const getCountyName = (str) => {
    let name = "";
    if (str.search("County") > -1) {
      name = str.split(" County")[0];
    } else {
      name = str.split(",")[0];
    }
    return str;
  };

  const enterClick = (e) => {
    if (e.key == "Enter") {
      onSearchClick();
    }
  };

  const loseFocus = (e) => {
    onSearchClick();
  };
  // Page 1
  return (
    <div className="customGraph">
      <div className="customGraph">
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

          <div className="mainContent">
            <div>
              <div className="flex-row">
                <div>
                  <p className="simpleinfo">
                    Composite of Covid-19 case
                    <br />
                    prevalence, severity and health resources utilization
                  </p>
                  <br></br>
                  <div className="flex-row">
                    <div className="flex-row border-right">
                      <div className="oneweek text-center historicalLayout">
                        <p className="font-lg">{kHistorical}</p>
                        <p className="font-sm">7 DAYS</p>
                      </div>
                    </div>
                    <div className="flex-row border-right">
                      <div className="oneweek text-center historicalLayout">
                        <p className="font-lg">{kState}</p>
                        <p className="font-sm">24 HRS</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="panel-right">
                  <div>
                    <p className="circle-bg font-xl" ref={tempRef}>
                      {kCounty}
                    </p>
                    <p className="today">Today</p>
                  </div>
                </div>
              </div>

              {/* Color Slider */}
              <input
                type="range"
                className="color-slider"
                min="0"
                max="100"
                value={isNaN(kCounty) ? 0 : kCounty}
                readOnly
              ></input>
              <div className="text-center">
                <span className="localAreaInfectionRisk">
                  Local Area Infection Risk
                  <div className="Mytooltip">
                    <img src={InfoIcon} className="InfoIcon"></img>
                    <span className="Mytooltiptext">
                      <p className="mb-10">
                        <strong>Risk score:</strong> 0 (low) -> 100+ (high)
                      </p>
                      <p>
                        <strong>Prevalence:</strong> number of new cases.
                      </p>
                      <p>
                        <strong>Severity:</strong> number of new morbidity
                        cases, hospitalizations, deaths.
                      </p>
                      <p className="mb-10">
                        <strong>Health resources utilization:</strong>{" "}
                        percentage use of infrastructure, equipment, supplies or
                        medicines.
                      </p>
                      <p>
                        <strong>Data source:</strong> CDC
                      </p>
                    </span>
                  </div>
                </span>
              </div>
            </div>
          </div>
          <div className="learnmore">
            <p>
              {!serverData.error && kCounty !== "NA" ? (
                <Link to={"/learnmore"}>Learn More >></Link>
              ) : (
                ""
              )}
            </p>
          </div>
        </div>
      </div>
      {/* <div className="customGraph">
        <div className="mainBody2">
          <div className="Mytooltip2 title2 flex-row2">
            <a className="dropdown-item" href="#">
              <p>Emotional Health</p>
              <span className="Mytooltiptext-right2">
                <p>Coming soon</p>
              </span>
            </a>
            <div className="info2 me-4">
              <span class="chevron right"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="customGraph">
        <div className="mainBody2">
          <div className="Mytooltip2 title2 flex-row2">
            <a className="dropdown-item" href="#">
              <p>Wellness</p>
              <span className="Mytooltiptext-right2">
                <p>Coming soon</p>
              </span>
            </a>
            <div className="info2 me-4">
              <span class="chevron right"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="customGraph">
        <div className="mainBody2">
          <div className="Mytooltip2 title2 flex-row2">
            <a className="dropdown-item" href="#">
              <p>Chronic Health</p>
              <span className="Mytooltiptext-right2">
                <p>Coming soon</p>
              </span>
            </a>
            <div className="info2 me-4">
              <span class="chevron right"></span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default CustomGraph;
