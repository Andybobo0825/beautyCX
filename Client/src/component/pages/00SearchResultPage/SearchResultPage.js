import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import SearchResult from "./SearchResult";


const FixStyle = {
    position: "relative",

}

const SearchResultPage = () => {
    return (
        <div style={FixStyle}>
            <Frame />
            <div style={{ marginTop: "6vh" }}>
                <SearchResult />
            </div>

            <br /><br /><br /><br /><br /><br /><br /><br />
            <br /><br /><br />
        </div>
    );
}


export default SearchResultPage