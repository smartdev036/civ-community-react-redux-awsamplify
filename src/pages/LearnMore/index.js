import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { GET_TEMP } from "../../actions/types";
import LearnDetail from "../../components/LearnDetail";

function LearnMore(props) {
    const dispatch = useDispatch();
    useEffect( ()=> {
        props.reRender();
    }, []);
    return ( <div className="LearnMore">
           <LearnDetail />
        </div> );
}

export default LearnMore;