import React, { useEffect } from "react";
import CustomGraph from "../../components/Graph";

function Home(props) {
    useEffect( ()=> {
        // console.log("Home");
        props.reRender();
    }, []);

    return ( <CustomGraph/> );
}

export default Home;